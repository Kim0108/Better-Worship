/**
 * Better Worship - Internationalization (i18n) Dictionary
 * 支援繁體中文 (zh-TW) 與 英文 (en)
 */
const I18N_DATA = {
  "zh-TW": {
    // 頂部導覽列
    siteTitle: "更美的敬拜",
    siteSubtitle: "公共崇拜學探討",
    authorTag: "易啟年 著",
    searchPlaceholder: "檢索全書 219 頁內容、章節或關鍵字...",
    searchBtn: "檢索",
    settingsBtn: "顯示與操作設定",
    readAloudBtn: "語音朗讀",
    printBtn: "列印",
    tocTitle: "全書章節目錄",
    
    // 閱讀模式
    viewModeImage: "原書圖版",
    viewModeText: "排版文字",
    viewModeDual: "圖文對照",
    prevPage: "上一頁",
    nextPage: "下一頁",
    jumpPage: "跳轉",
    pageIndicator: "頁碼",
    bookPagePrefix: "書中頁碼：第 ",
    bookPageSuffix: " 頁",
    pdfPagePrefix: "PDF 頁碼：第 ",
    pdfPageSuffix: " 頁",
    
    // TTS 朗讀控制
    ttsVoiceLabel: "朗讀語音",
    ttsFemaleVoice: "台灣女聲",
    ttsMaleVoice: "台灣男聲",
    ttsPlay: "開始朗讀",
    ttsPause: "暫停朗讀",
    ttsResume: "繼續朗讀",
    ttsStop: "停止朗讀",
    ttsSpeed: "朗讀語速",
    ttsReadingPage: "正在朗讀：第 {page} 頁",
    ttsNotSupported: "您的瀏覽器不支援 Web Speech 語音合成功能",
    
    // 顯示與操作設定 (7 大切換功能)
    settingsModalTitle: "顯示與操作設定",
    settingsModalDesc: "自訂閱讀版面、外觀色系、語音與互動體驗",
    
    // (1) 全螢幕
    settingFullscreen: "全螢幕模式",
    settingFullscreenDesc: "切換全螢幕沈浸閱讀體驗",
    fullscreenOn: "開啟全螢幕",
    fullscreenOff: "關閉全螢幕",
    
    // (2) 音效
    settingSound: "互動音效",
    settingSoundDesc: "翻頁、按鈕點擊與操作提示音（Web Audio 合成）",
    soundOn: "開啟音效",
    soundOff: "關閉音效",
    
    // (3) 裝置
    settingDevice: "裝置排版",
    settingDeviceDesc: "切換不同裝置最佳閱讀版型",
    deviceAuto: "自動 (自適應)",
    deviceMobile: "手機版型",
    deviceTablet: "平板版型",
    deviceDesktop: "電腦寬屏",
    
    // (4) 版面
    settingLayout: "閱讀版面",
    settingLayoutDesc: "選擇單頁聚焦、直式滾動或橫式雙頁",
    layoutAuto: "自動排列",
    layoutVertical: "直式滾動",
    layoutHorizontal: "橫式翻頁",
    
    // (5) 語言
    settingLang: "界面語言",
    settingLangDesc: "切換繁體中文或英文界面",
    langZh: "繁體中文",
    langEn: "English",
    
    // (6) 字體
    settingFontSize: "文字字級",
    settingFontSizeDesc: "調整正文閱讀字體大小",
    fontSmall: "縮小",
    fontNormal: "標準",
    fontLarge: "放大",
    
    // (7) 色系
    settingTheme: "視覺色彩",
    settingThemeDesc: "切換晨曦明亮、沉浸暗色或跟隨系統",
    themeSystem: "跟隨系統",
    themeLight: "明亮雅緻",
    themeDark: "深邃暗色",
    themeSepia: "暖調紙本",
    
    // 檢索
    searchResultsTitle: "檢索結果",
    searchTotalFound: "共找到 {count} 處相關頁面",
    noResults: "未找到相符內容，請嘗試其他關鍵字",
    searchHelp: "可搜尋詞彙如：敬拜、詩班、洗禮、聖餐、兒童崇拜、主席、宣講信息...",
    
    // 列印對話框
    printModalTitle: "列印選項",
    printCurrentPage: "列印目前頁面 (第 {page} 頁)",
    printCurrentChapter: "列印目前章節 ({chapter})",
    printTextOnly: "列印排版文字版 (省墨高清晰)",
    printOriginalImage: "列印原始圖版 (原書掃描頁)",
    executePrint: "開始列印",
    closeBtn: "關閉",
    
    // 頁尾
    footerCopyright: "《更美的敬拜—公共崇拜學探討》易啟年 著 · 榮光出版社/榮光傳道會",
    footerNotice: "數位互動學習版 · 支援各型裝置 · 離線可讀"
  },
  
  "en": {
    // Header
    siteTitle: "Better Worship",
    siteSubtitle: "Exploration of Public Worship",
    authorTag: "By Rev. Dr. Chi-Nien Yi",
    searchPlaceholder: "Search all 219 pages, chapters or keywords...",
    searchBtn: "Search",
    settingsBtn: "Display & Controls",
    readAloudBtn: "Read Aloud",
    printBtn: "Print",
    tocTitle: "Table of Contents",
    
    // Reading Mode
    viewModeImage: "Original Page",
    viewModeText: "Formatted Text",
    viewModeDual: "Side by Side",
    prevPage: "Previous",
    nextPage: "Next",
    jumpPage: "Jump",
    pageIndicator: "Page",
    bookPagePrefix: "Book Page: ",
    bookPageSuffix: "",
    pdfPagePrefix: "PDF Page: ",
    pdfPageSuffix: "",
    
    // TTS
    ttsVoiceLabel: "Voice Voice",
    ttsFemaleVoice: "Taiwan Female",
    ttsMaleVoice: "Taiwan Male",
    ttsPlay: "Play Reading",
    ttsPause: "Pause",
    ttsResume: "Resume",
    ttsStop: "Stop",
    ttsSpeed: "Speech Speed",
    ttsReadingPage: "Reading Page {page}",
    ttsNotSupported: "Your browser does not support Web Speech synthesis",
    
    // Settings (7 Major Functions)
    settingsModalTitle: "Display & Controls",
    settingsModalDesc: "Customize reading layout, color themes, audio and interactions",
    
    // (1) Fullscreen
    settingFullscreen: "Fullscreen Mode",
    settingFullscreenDesc: "Toggle fullscreen immersive reading experience",
    fullscreenOn: "Enter Fullscreen",
    fullscreenOff: "Exit Fullscreen",
    
    // (2) Sound Effects
    settingSound: "Interactive Audio",
    settingSoundDesc: "Page turn and button click feedback (Web Audio synthesized)",
    soundOn: "Enable Sounds",
    soundOff: "Mute Sounds",
    
    // (3) Device
    settingDevice: "Device Layout",
    settingDeviceDesc: "Optimize layout for different device viewpoints",
    deviceAuto: "Auto (Responsive)",
    deviceMobile: "Mobile View",
    deviceTablet: "Tablet View",
    deviceDesktop: "Desktop View",
    
    // (4) Layout
    settingLayout: "Reading Layout",
    settingLayoutDesc: "Choose single-page focus, vertical scroll, or two-page spread",
    layoutAuto: "Auto Layout",
    layoutVertical: "Vertical Scroll",
    layoutHorizontal: "Horizontal Flip",
    
    // (5) Language
    settingLang: "Interface Language",
    settingLangDesc: "Switch between Traditional Chinese and English",
    langZh: "繁體中文",
    langEn: "English",
    
    // (6) Font Size
    settingFontSize: "Font Size",
    settingFontSizeDesc: "Adjust text reading font size",
    fontSmall: "Small",
    fontNormal: "Standard",
    fontLarge: "Large",
    
    // (7) Color Theme
    settingTheme: "Color Theme",
    settingThemeDesc: "Switch bright morning, dark immersion or system default",
    themeSystem: "System Default",
    themeLight: "Bright & Elegant",
    themeDark: "Dark Night",
    themeSepia: "Warm Sepia",
    
    // Search
    searchResultsTitle: "Search Results",
    searchTotalFound: "Found {count} matching page(s)",
    noResults: "No results found, please try another keyword",
    searchHelp: "Suggested keywords: worship, choir, baptism, communion, children's worship...",
    
    // Print Modal
    printModalTitle: "Print Options",
    printCurrentPage: "Print Current Page (Page {page})",
    printCurrentChapter: "Print Current Chapter ({chapter})",
    printTextOnly: "Print Formatted Text (Eco & Crisp)",
    printOriginalImage: "Print Original Page Image",
    executePrint: "Start Printing",
    closeBtn: "Close",
    
    // Footer
    footerCopyright: "Better Worship: Exploration of Public Worship · By Chi-Nien Yi",
    footerNotice: "Interactive Edition · Responsive Design · Offline Compatible"
  }
};

window.I18N = {
  currentLang: "zh-TW",
  
  t(key, params = {}) {
    let dict = I18N_DATA[this.currentLang] || I18N_DATA["zh-TW"];
    let text = dict[key] || key;
    for (let k in params) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), params[k]);
    }
    return text;
  },
  
  setLang(lang) {
    if (I18N_DATA[lang]) {
      this.currentLang = lang;
      localStorage.setItem("bw_lang", lang);
      this.updateDOM();
    }
  },
  
  init() {
    let saved = localStorage.getItem("bw_lang");
    if (saved && I18N_DATA[saved]) {
      this.currentLang = saved;
    }
    this.updateDOM();
  },
  
  updateDOM() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      el.textContent = this.t(key);
    });
    
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      el.setAttribute("placeholder", this.t(key));
    });

    document.querySelectorAll("[data-i18n-title]").forEach(el => {
      const key = el.getAttribute("data-i18n-title");
      el.setAttribute("title", this.t(key));
    });
  }
};
