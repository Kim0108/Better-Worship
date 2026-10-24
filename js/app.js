/**
 * Better Worship - Interactive Web Application Core
 * 《更美的敬拜—公共崇拜學探討》核心互動邏輯
 */

class BetterWorshipApp {
  constructor() {
    this.data = window.BOOK_DATA || null;
    this.currentPage = 1;
    this.viewMode = "image"; // 'image' | 'text' | 'dual'
    this.layout = "auto";    // 'auto' | 'vertical' | 'horizontal'
    this.device = "auto";    // 'auto' | 'mobile' | 'tablet' | 'desktop'
    this.fontSize = "normal";// 'small' | 'normal' | 'large'
    this.theme = "light";    // 'system' | 'light' | 'dark' | 'sepia'
    this.zoomLevel = 1.0;    // 原書圖版縮放比例 (0.75x ~ 2.5x)
    
    // 行動裝置螢幕 (< 992px) 側邊欄預設收合，大螢幕預設展開
    this.sidebarOpen = window.innerWidth >= 992;

    this.init();
  }

  init() {
    this.loadPreferences();
    this.renderTOC();
    this.bindEvents();
    this.setupTTSHooks();
    this.renderPage(this.currentPage);
    
    // 根據初始狀態設置側邊欄
    const sidebar = document.getElementById("sidebar-toc");
    if (sidebar && !this.sidebarOpen) {
      sidebar.classList.add("collapsed");
    }

    // 初始化多國語言
    if (window.I18N) window.I18N.init();
  }

  loadPreferences() {
    const savedPage = localStorage.getItem("bw_curr_page");
    if (savedPage) this.currentPage = parseInt(savedPage, 10) || 1;

    const savedView = localStorage.getItem("bw_view_mode");
    if (savedView) this.viewMode = savedView;

    const savedLayout = localStorage.getItem("bw_layout");
    if (savedLayout) this.layout = savedLayout;

    const savedDevice = localStorage.getItem("bw_device");
    if (savedDevice) this.device = savedDevice;

    const savedFont = localStorage.getItem("bw_font_size");
    if (savedFont) this.fontSize = savedFont;

    const savedTheme = localStorage.getItem("bw_theme");
    if (savedTheme) this.theme = savedTheme;

    this.applySettings();
  }

  applySettings() {
    // 1. Theme
    if (this.theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    } else {
      document.documentElement.setAttribute("data-theme", this.theme);
    }

    // 2. Font Size
    document.documentElement.setAttribute("data-font-size", this.fontSize);

    // 3. Device simulation
    document.body.className = "";
    if (this.device !== "auto") {
      document.body.classList.add(`device-${this.device}`);
    }

    // 4. Layout
    const surface = document.getElementById("book-surface");
    if (surface) {
      surface.parentElement.classList.remove("layout-horizontal", "layout-vertical");
      if (this.layout === "horizontal") {
        surface.parentElement.classList.add("layout-horizontal");
      } else if (this.layout === "vertical") {
        surface.parentElement.classList.add("layout-vertical");
      }
    }

    // Update settings UI active states
    this.updateSettingsControlsUI();
  }

  updateSettingsControlsUI() {
    this.syncSegmentedGroup("theme-group", this.theme);
    this.syncSegmentedGroup("font-group", this.fontSize);
    this.syncSegmentedGroup("layout-group", this.layout);
    this.syncSegmentedGroup("device-group", this.device);
    
    const soundEnabled = window.soundEngine ? window.soundEngine.enabled : true;
    this.syncSegmentedGroup("sound-group", soundEnabled ? "on" : "off");

    const isFull = !!document.fullscreenElement;
    this.syncSegmentedGroup("fullscreen-group", isFull ? "on" : "off");

    const currLang = window.I18N ? window.I18N.currentLang : "zh-TW";
    this.syncSegmentedGroup("lang-group", currLang);
  }

  syncSegmentedGroup(groupId, activeVal) {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.querySelectorAll(".segmented-btn").forEach(btn => {
      if (btn.getAttribute("data-val") === activeVal) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  // 渲染左側目錄導覽
  renderTOC() {
    if (!this.data || !this.data.toc) return;
    const tocContainer = document.getElementById("toc-tree");
    if (!tocContainer) return;

    let html = `<ul class="toc-list">`;
    this.data.toc.forEach(ch => {
      const isCurrentCh = this.isPageInChapter(this.currentPage, ch);
      html += `
        <li class="toc-item ${isCurrentCh ? "active" : ""}" data-page="${ch.pdfPage}">
          <a href="javascript:void(0)" class="toc-link" onclick="app.goToPage(${ch.pdfPage}); if(window.innerWidth < 992) app.toggleSidebar(false);">
            <span>${ch.title}</span>
            <span class="toc-page-badge">${ch.bookPage ? "P." + ch.bookPage : ""}</span>
          </a>
      `;

      if (ch.sections && ch.sections.length > 0) {
        html += `<ul class="toc-sublist">`;
        ch.sections.forEach(sec => {
          html += `
            <li class="toc-subitem" data-page="${sec.pdfPage}">
              <a href="javascript:void(0)" class="toc-link" onclick="app.goToPage(${sec.pdfPage}); if(window.innerWidth < 992) app.toggleSidebar(false);">
                <span>${sec.title}</span>
                <span class="toc-page-badge">P.${sec.bookPage}</span>
              </a>
            </li>
          `;
        });
        html += `</ul>`;
      }
      html += `</li>`;
    });
    html += `</ul>`;

    tocContainer.innerHTML = html;
  }

  isPageInChapter(page, ch) {
    const nextChIndex = this.data.toc.indexOf(ch) + 1;
    const nextCh = this.data.toc[nextChIndex];
    if (nextCh) {
      return page >= ch.pdfPage && page < nextCh.pdfPage;
    }
    return page >= ch.pdfPage;
  }

  // 渲染當前頁面核心內容
  renderPage(pageNum) {
    if (!this.data || pageNum < 1 || pageNum > this.data.totalPages) return;
    this.currentPage = pageNum;
    localStorage.setItem("bw_curr_page", pageNum);

    const pageObj = this.data.pages[pageNum - 1];
    const surface = document.getElementById("book-surface");
    if (!surface) return;

    // 載入當前頁文字到語音朗讀器
    if (window.taiwanTTS) {
      window.taiwanTTS.loadPageText(pageObj.text);
    }

    // 構建排版文字內容 HTML
    const paragraphs = (pageObj.text || "").split("\n\n").filter(p => p.trim());
    let paragraphsHtml = "";
    paragraphs.forEach((p, idx) => {
      paragraphsHtml += `<p class="page-paragraph" id="para-${idx}">${p}</p>`;
    });

    let headerHtml = `
      <div class="page-header-title">${pageObj.chapterTitle}</div>
      ${pageObj.sectionTitle ? `<div class="page-section-subtitle">${pageObj.sectionTitle}</div>` : ""}
    `;

    // 根據視圖模式 (圖版/文字/對照) 呈現
    let contentHtml = "";

    if (this.viewMode === "image") {
      contentHtml = `
        <div class="page-image-wrapper">
          <img src="${pageObj.image}" alt="第 ${pageNum} 頁" class="page-image" />
        </div>
      `;
    } else if (this.viewMode === "text") {
      contentHtml = `
        <div class="page-text-content">
          ${headerHtml}
          <div class="page-body-paragraphs">
            ${paragraphsHtml || "<p class='page-paragraph'>（此頁為圖版或無文字內容）</p>"}
          </div>
        </div>
      `;
    } else if (this.viewMode === "dual") {
      contentHtml = `
        <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 280px;" class="page-image-wrapper">
            <img src="${pageObj.image}" alt="第 ${pageNum} 頁" class="page-image" />
          </div>
          <div style="flex: 1; min-width: 280px;" class="page-text-content">
            ${headerHtml}
            <div class="page-body-paragraphs">
              ${paragraphsHtml}
            </div>
          </div>
        </div>
      `;
    }

    // 橫向雙頁模式
    if (this.layout === "horizontal" && this.viewMode === "image" && pageNum < this.data.totalPages) {
      const nextPageObj = this.data.pages[pageNum];
      contentHtml = `
        <div class="page-image-wrapper">
          <img src="${pageObj.image}" alt="第 ${pageNum} 頁" class="page-image" />
        </div>
        <div class="page-image-wrapper">
          <img src="${nextPageObj.image}" alt="第 ${pageNum + 1} 頁" class="page-image" />
        </div>
      `;
    }

    surface.innerHTML = contentHtml;

    // 綁定圖版雙擊縮放及套用當前縮放比例
    surface.querySelectorAll(".page-image").forEach(img => {
      img.addEventListener("dblclick", () => {
        if (this.zoomLevel <= 1.05) {
          this.setZoom(1.5);
        } else {
          this.zoomReset();
        }
      });
    });
    this.applyZoom();

    // 更新底部頁碼提示、輸入框與左右滑動滑桿
    this.updatePageIndicator(pageObj);

    // 同步高亮左側目錄中的當前項目
    this.highlightCurrentTOC();

    // 滾動回到頂部
    const viewport = document.getElementById("reader-viewport");
    if (viewport) viewport.scrollTop = 0;
  }

  updatePageIndicator(pageObj) {
    const jumpInput = document.getElementById("page-jump-input");
    if (jumpInput) jumpInput.value = this.currentPage;

    const totalEl = document.getElementById("total-pages-label");
    if (totalEl) totalEl.textContent = this.data.totalPages;

    const bookPageBadge = document.getElementById("current-book-page-badge");
    if (bookPageBadge) {
      if (pageObj.bookPage) {
        bookPageBadge.textContent = `${window.I18N ? window.I18N.t("bookPagePrefix") : "書中頁碼："}${pageObj.bookPage}${window.I18N ? window.I18N.t("bookPageSuffix") : ""}`;
        bookPageBadge.style.display = "inline-block";
      } else {
        bookPageBadge.style.display = "none";
      }
    }

    // 同步左右滑動滑桿 (Requirement 2)
    const slider = document.getElementById("page-slider");
    if (slider) slider.value = this.currentPage;

    const sliderInfo = document.getElementById("slider-current-info");
    if (sliderInfo) {
      const bookP = pageObj.bookPage ? `(P.${pageObj.bookPage})` : "";
      sliderInfo.textContent = `第 ${this.currentPage} 頁 ${bookP} · ${pageObj.sectionTitle || pageObj.chapterTitle}`;
    }
  }

  highlightCurrentTOC() {
    document.querySelectorAll(".toc-item, .toc-subitem").forEach(el => el.classList.remove("active"));
    if (!this.data || !this.data.toc) return;

    let activeItem = null;
    for (let i = this.data.toc.length - 1; i >= 0; i--) {
      const ch = this.data.toc[i];
      if (this.currentPage >= ch.pdfPage) {
        activeItem = ch;
        break;
      }
    }

    if (activeItem) {
      const el = document.querySelector(`.toc-item[data-page="${activeItem.pdfPage}"]`);
      if (el) {
        el.classList.add("active");
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }

  // 翻頁導覽
  goToPage(num) {
    if (num < 1) num = 1;
    if (num > this.data.totalPages) num = this.data.totalPages;
    if (num === this.currentPage) return;

    if (window.soundEngine) window.soundEngine.playPageTurn();
    this.renderPage(num);
  }

  prevPage() {
    const step = (this.layout === "horizontal" && this.viewMode === "image") ? 2 : 1;
    this.goToPage(this.currentPage - step);
  }

  nextPage() {
    const step = (this.layout === "horizontal" && this.viewMode === "image") ? 2 : 1;
    this.goToPage(this.currentPage + step);
  }

  // 原書圖版放大與縮小控制 (Zoom In / Zoom Out)
  setZoom(val) {
    this.zoomLevel = Math.min(2.5, Math.max(0.75, Math.round(val * 100) / 100));
    this.applyZoom();
    if (window.soundEngine) window.soundEngine.playClick();
  }

  zoomIn() {
    this.setZoom(this.zoomLevel + 0.25);
  }

  zoomOut() {
    this.setZoom(this.zoomLevel - 0.25);
  }

  zoomReset() {
    this.setZoom(1.0);
  }

  applyZoom() {
    const surface = document.getElementById("book-surface");
    if (!surface) return;

    surface.style.setProperty("--img-zoom", this.zoomLevel);
    
    if (this.zoomLevel > 1.05) {
      surface.classList.add("is-zoomed");
    } else {
      surface.classList.remove("is-zoomed");
    }

    surface.querySelectorAll(".page-image").forEach(img => {
      if (this.zoomLevel > 1.05) {
        img.classList.add("is-zoomed");
        img.title = "雙擊復原為 100% (Double click to reset)";
      } else {
        img.classList.remove("is-zoomed");
        img.title = "雙擊放大檢視清晰字體 (Double click to zoom)";
      }
    });

    const badge = document.getElementById("zoom-level-badge");
    if (badge) {
      badge.textContent = `${Math.round(this.zoomLevel * 100)}%`;
    }
  }

  // 全文檢索系統
  performSearch(query) {
    query = (query || "").trim();
    const panel = document.getElementById("search-results-panel");
    const tocTree = document.getElementById("toc-tree");
    const resultsList = document.getElementById("search-items-list");
    const resultsCount = document.getElementById("search-count-label");

    if (!query) {
      panel.classList.remove("active");
      tocTree.style.display = "block";
      return;
    }

    tocTree.style.display = "none";
    panel.classList.add("active");
    if (!this.sidebarOpen) this.toggleSidebar(true);

    const matches = [];
    const lowerQ = query.toLowerCase();

    this.data.pages.forEach(p => {
      const text = p.text || "";
      const lowerT = text.toLowerCase();
      const idx = lowerT.indexOf(lowerQ);
      if (idx !== -1 || (p.chapterTitle && p.chapterTitle.toLowerCase().includes(lowerQ))) {
        const start = Math.max(0, idx - 40);
        const end = Math.min(text.length, idx + query.length + 40);
        let snippet = text.substring(start, end);

        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
        snippet = snippet.replace(regex, "<mark>$1</mark>");

        matches.push({
          page: p.page,
          bookPage: p.bookPage,
          chapter: p.chapterTitle,
          snippet: (start > 0 ? "..." : "") + snippet + (end < text.length ? "..." : "")
        });
      }
    });

    resultsCount.textContent = window.I18N ? window.I18N.t("searchTotalFound", { count: matches.length }) : `找到 ${matches.length} 處`;

    if (matches.length === 0) {
      resultsList.innerHTML = `<li style="padding: 1.5rem; text-align: center; color: var(--text-muted);">${window.I18N ? window.I18N.t("noResults") : "未找到相符內容"}</li>`;
      return;
    }

    let html = "";
    matches.forEach(m => {
      html += `
        <li class="search-card" onclick="app.goToPage(${m.page}); if(window.innerWidth < 992) app.toggleSidebar(false);">
          <div class="search-card-meta">
            <span>${m.chapter}</span>
            <span>第 ${m.page} 頁 ${m.bookPage ? `(P.${m.bookPage})` : ""}</span>
          </div>
          <div class="search-card-snippet">${m.snippet}</div>
        </li>
      `;
    });
    resultsList.innerHTML = html;
  }

  // 設置語音朗讀回呼
  setupTTSHooks() {
    if (!window.taiwanTTS) return;

    const playBtn = document.getElementById("tts-play-btn");
    const waveEl = document.getElementById("sound-wave");

    window.taiwanTTS.onStateChangeCallback = (state) => {
      if (state.isPlaying && !state.isPaused) {
        playBtn.classList.add("play-active");
        waveEl.classList.add("active");
        playBtn.innerHTML = `<svg class="icon"><use href="#icon-pause"></use></svg>`;
      } else {
        playBtn.classList.remove("play-active");
        waveEl.classList.remove("active");
        playBtn.innerHTML = `<svg class="icon"><use href="#icon-play"></use></svg>`;
      }
    };

    window.taiwanTTS.onParagraphChangeCallback = (paraIdx) => {
      document.querySelectorAll(".page-paragraph").forEach(p => p.classList.remove("speaking"));
      if (paraIdx >= 0) {
        const targetPara = document.getElementById(`para-${paraIdx}`);
        if (targetPara) {
          targetPara.classList.add("speaking");
          targetPara.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    };
  }

  toggleTTS() {
    if (!window.taiwanTTS) return;
    if (window.taiwanTTS.isPlaying && !window.taiwanTTS.isPaused) {
      window.taiwanTTS.pause();
    } else if (window.taiwanTTS.isPaused) {
      window.taiwanTTS.resume();
    } else {
      window.taiwanTTS.play();
    }
  }

  // 事件綁定
  bindEvents() {
    // 側邊欄漢堡切換按鈕
    const menuBtn = document.getElementById("menu-toggle-btn");
    if (menuBtn) menuBtn.addEventListener("click", () => this.toggleSidebar());

    // 搜尋輸入
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => this.performSearch(e.target.value));
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.performSearch(e.target.value);
      });
    }

    // 視圖切換 (圖版/文字/對照)
    document.querySelectorAll(".view-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".view-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.viewMode = btn.getAttribute("data-mode");
        localStorage.setItem("bw_view_mode", this.viewMode);
        if (window.soundEngine) window.soundEngine.playClick();
        this.renderPage(this.currentPage);
      });
    });

    // 頁碼輸入跳轉
    const jumpInput = document.getElementById("page-jump-input");
    if (jumpInput) {
      jumpInput.addEventListener("change", (e) => {
        const p = parseInt(e.target.value, 10);
        if (!isNaN(p)) this.goToPage(p);
      });
      jumpInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const p = parseInt(e.target.value, 10);
          if (!isNaN(p)) this.goToPage(p);
        }
      });
    }

    // 正文下方左右滑動滑桿 (Requirement 2)
    const pageSlider = document.getElementById("page-slider");
    if (pageSlider) {
      pageSlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        const pObj = this.data.pages[val - 1];
        const sliderInfo = document.getElementById("slider-current-info");
        if (sliderInfo && pObj) {
          const bookP = pObj.bookPage ? `(P.${pObj.bookPage})` : "";
          sliderInfo.textContent = `第 ${val} 頁 ${bookP} · ${pObj.sectionTitle || pObj.chapterTitle}`;
        }
      });
      pageSlider.addEventListener("change", (e) => {
        const val = parseInt(e.target.value, 10);
        this.goToPage(val);
      });
    }

    // 鍵盤左右方向鍵翻頁
    window.addEventListener("keydown", (e) => {
      if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "SELECT")) {
        return;
      }
      if (e.key === "ArrowLeft") this.prevPage();
      if (e.key === "ArrowRight") this.nextPage();
      if (e.key === "+" || e.key === "=") this.zoomIn();
      if (e.key === "-" || e.key === "_") this.zoomOut();
      if (e.key === "0") this.zoomReset();
      if (e.key === "Escape") this.closeModals();
    });

    // TTS 語音性別選擇
    const voiceSelect = document.getElementById("tts-gender-select");
    if (voiceSelect) {
      voiceSelect.addEventListener("change", (e) => {
        if (window.taiwanTTS) window.taiwanTTS.setGender(e.target.value);
      });
    }

    // TTS 語速即時切換 (Requirement 3)
    const speedSelect = document.getElementById("tts-speed-select");
    if (speedSelect) {
      // 讀取上次記憶語速
      const savedRate = localStorage.getItem("bw_tts_rate");
      if (savedRate) {
        speedSelect.value = savedRate;
        if (window.taiwanTTS) window.taiwanTTS.rate = parseFloat(savedRate);
      }
      speedSelect.addEventListener("change", (e) => {
        if (window.taiwanTTS) window.taiwanTTS.setRate(e.target.value);
      });
    }

    // 設定對話框按鈕
    this.setupSettingsModalEvents();
  }

  // 切換側邊欄與遮罩
  toggleSidebar(forceState) {
    const sidebar = document.getElementById("sidebar-toc");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (!sidebar) return;

    if (typeof forceState === "boolean") {
      this.sidebarOpen = forceState;
    } else {
      this.sidebarOpen = !this.sidebarOpen;
    }

    if (this.sidebarOpen) {
      sidebar.classList.remove("collapsed");
      if (backdrop && window.innerWidth < 992) backdrop.classList.add("active");
    } else {
      sidebar.classList.add("collapsed");
      if (backdrop) backdrop.classList.remove("active");
    }

    if (window.soundEngine) window.soundEngine.playClick();
  }

  // 設置 7 大切換功能之對話框
  setupSettingsModalEvents() {
    const openBtn = document.getElementById("open-settings-btn");
    const modal = document.getElementById("settings-modal");
    if (openBtn && modal) {
      openBtn.addEventListener("click", () => {
        this.updateSettingsControlsUI();
        modal.classList.add("show");
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    // (1) 全螢幕
    document.querySelectorAll("#fullscreen-group .segmented-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const val = btn.getAttribute("data-val");
        this.toggleFullscreen(val === "on");
        this.syncSegmentedGroup("fullscreen-group", val);
        if (window.soundEngine) window.soundEngine.playToggle();
      });
    });

    // (2) 音效
    document.querySelectorAll("#sound-group .segmented-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const val = btn.getAttribute("data-val") === "on";
        if (window.soundEngine) window.soundEngine.setEnabled(val);
        this.syncSegmentedGroup("sound-group", val ? "on" : "off");
        if (val && window.soundEngine) window.soundEngine.playToggle();
      });
    });

    // (3) 裝置排版
    document.querySelectorAll("#device-group .segmented-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.device = btn.getAttribute("data-val");
        localStorage.setItem("bw_device", this.device);
        this.applySettings();
        if (window.soundEngine) window.soundEngine.playToggle();
      });
    });

    // (4) 版面切換
    document.querySelectorAll("#layout-group .segmented-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.layout = btn.getAttribute("data-val");
        localStorage.setItem("bw_layout", this.layout);
        this.applySettings();
        this.renderPage(this.currentPage);
        if (window.soundEngine) window.soundEngine.playToggle();
      });
    });

    // (5) 語言切換
    document.querySelectorAll("#lang-group .segmented-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-val");
        if (window.I18N) window.I18N.setLang(lang);
        this.syncSegmentedGroup("lang-group", lang);
        this.renderTOC();
        this.renderPage(this.currentPage);
        if (window.soundEngine) window.soundEngine.playToggle();
      });
    });

    // (6) 字體大小
    document.querySelectorAll("#font-group .segmented-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.fontSize = btn.getAttribute("data-val");
        localStorage.setItem("bw_font_size", this.fontSize);
        this.applySettings();
        if (window.soundEngine) window.soundEngine.playToggle();
      });
    });

    // (7) 色系切換
    document.querySelectorAll("#theme-group .segmented-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.theme = btn.getAttribute("data-val");
        localStorage.setItem("bw_theme", this.theme);
        this.applySettings();
        if (window.soundEngine) window.soundEngine.playToggle();
      });
    });
  }

  toggleFullscreen(forceState) {
    if (forceState) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  // 列印視窗與處理
  openPrintDialog() {
    const modal = document.getElementById("print-modal");
    if (!modal) return;
    
    const pageObj = this.data.pages[this.currentPage - 1];
    const curPageLabel = document.getElementById("print-curpage-label");
    const curChapterLabel = document.getElementById("print-curchapter-label");

    if (curPageLabel) {
      curPageLabel.textContent = window.I18N ? window.I18N.t("printCurrentPage", { page: this.currentPage }) : `目前第 ${this.currentPage} 頁`;
    }
    if (curChapterLabel) {
      curChapterLabel.textContent = window.I18N ? window.I18N.t("printCurrentChapter", { chapter: pageObj.chapterTitle }) : pageObj.chapterTitle;
    }

    modal.classList.add("show");
    if (window.soundEngine) window.soundEngine.playClick();
  }

  executePrint() {
    const printScope = document.querySelector('input[name="print-scope"]:checked').value;
    const printFormat = document.querySelector('input[name="print-format"]:checked').value;

    this.closeModals();

    if (printScope === "page") {
      if (printFormat === "text" && this.viewMode !== "text") {
        this.viewMode = "text";
        this.renderPage(this.currentPage);
      } else if (printFormat === "image" && this.viewMode !== "image") {
        this.viewMode = "image";
        this.renderPage(this.currentPage);
      }
      setTimeout(() => window.print(), 300);
    } else if (printScope === "chapter") {
      this.printFullChapter(format);
    }
  }

  printFullChapter(format) {
    const curPageObj = this.data.pages[this.currentPage - 1];
    const chapterId = curPageObj.chapterId;
    const chapterPages = this.data.pages.filter(p => p.chapterId === chapterId);

    const surface = document.getElementById("book-surface");
    const originalContent = surface.innerHTML;

    let printHtml = `
      <div style="text-align: center; margin-bottom: 2rem;">
        <h1 style="font-family: var(--font-serif); font-size: 2rem;">${curPageObj.chapterTitle}</h1>
        <p style="color: var(--text-muted); font-size: 0.9rem;">《更美的敬拜—公共崇拜學探討》易啟年 著</p>
      </div>
    `;

    chapterPages.forEach(p => {
      if (format === "image") {
        printHtml += `
          <div style="page-break-after: always; text-align: center; margin-bottom: 2rem;">
            <img src="${p.image}" style="max-width: 100%; height: auto;" />
            <p style="margin-top: 8px; font-size: 10pt; color: #666;">- 第 ${p.page} 頁 ${p.bookPage ? `(書本 P.${p.bookPage})` : ""} -</p>
          </div>
        `;
      } else {
        const paras = (p.text || "").split("\n\n").map(t => `<p style="margin-bottom: 1em; text-indent: 2em; line-height: 1.8;">${t}</p>`).join("");
        printHtml += `
          <div style="margin-bottom: 2.5rem; border-bottom: 1px solid #ddd; padding-bottom: 1.5rem;">
            <div style="font-weight: bold; margin-bottom: 0.8rem; font-size: 1.2rem;">${p.sectionTitle || p.chapterTitle} (第 ${p.page} 頁)</div>
            ${paras}
          </div>
        `;
      }
    });

    surface.innerHTML = printHtml;

    setTimeout(() => {
      window.print();
      surface.innerHTML = originalContent;
    }, 400);
  }

  closeModals() {
    document.querySelectorAll(".modal-backdrop").forEach(m => m.classList.remove("show"));
  }
}

// Global initialization
window.addEventListener("DOMContentLoaded", () => {
  window.app = new BetterWorshipApp();
});
