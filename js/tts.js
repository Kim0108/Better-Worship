/**
 * Better Worship - Taiwan Accent TTS (Text-to-Speech) Engine
 * 支援台灣國語口音（zh-TW）男聲與女聲切換、段落高亮與語速控制
 */
class TaiwanTTSEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.selectedGender = "female"; // 'female' | 'male'
    this.rate = 1.0;
    this.pitch = 1.0;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentParagraphs = [];
    this.currentParaIndex = 0;
    this.currentUtterance = null;
    this.onStateChangeCallback = null;
    this.onParagraphChangeCallback = null;

    this.initVoices();
    if (this.synth) {
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  initVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  // 專門尋找台灣口音 (zh-TW, cmn-Hant-TW) 的語音
  getTaiwanVoices() {
    if (!this.voices || this.voices.length === 0) {
      this.initVoices();
    }
    // 優先找 zh-TW 或 cmn-TW 或 標記 Taiwan / 臺灣 / 台灣 的語音
    const twVoices = this.voices.filter(v => {
      const lang = (v.lang || "").toLowerCase();
      const name = (v.name || "").toLowerCase();
      return lang.includes("zh-tw") || 
             lang.includes("cmn-tw") || 
             lang.includes("zh-hant-tw") || 
             name.includes("taiwan") || 
             name.includes("台灣") || 
             name.includes("臺灣") || 
             name.includes("hanhan") || 
             name.includes("yating") || 
             name.includes("zhiwei") || 
             name.includes("hsiaochen");
    });

    if (twVoices.length > 0) return twVoices;

    // 回退找繁體中文 / 國語語音
    const anyZhVoices = this.voices.filter(v => {
      const lang = (v.lang || "").toLowerCase();
      return lang.startsWith("zh");
    });
    return anyZhVoices;
  }

  // 選擇合適的台灣男聲或女聲
  pickVoice(gender) {
    const candidates = this.getTaiwanVoices();
    if (candidates.length === 0) return null;

    const lowerGender = gender.toLowerCase();

    if (lowerGender === "female") {
      // 搜尋女聲關鍵詞
      const femaleKeywords = ["hanhan", "yating", "hsiaochen", "female", "女", "mei-jia", "ting-ting"];
      const match = candidates.find(v => {
        const name = (v.name || "").toLowerCase();
        return femaleKeywords.some(k => name.includes(k));
      });
      return match || candidates[0];
    } else {
      // 搜尋男聲關鍵詞
      const maleKeywords = ["zhiwei", "yunxi", "male", "男", "danny", "bruce"];
      const match = candidates.find(v => {
        const name = (v.name || "").toLowerCase();
        return maleKeywords.some(k => name.includes(k));
      });
      // 若無獨立男聲語音包，選用台灣語音並將 pitch 調低為男聲頻率
      return match || candidates[candidates.length - 1] || candidates[0];
    }
  }

  setGender(gender) {
    this.selectedGender = gender;
    localStorage.setItem("bw_tts_gender", gender);
    if (this.isPlaying && !this.isPaused) {
      // 重新以新聲音朗讀目前段落
      const curIndex = this.currentParaIndex;
      this.stop();
      this.currentParaIndex = curIndex;
      this.playCurrentParagraph();
    }
  }

  setRate(speed) {
    const newRate = parseFloat(speed) || 1.0;
    this.rate = newRate;
    localStorage.setItem("bw_tts_rate", newRate);
    
    // 若目前正在朗讀中，立即以新語速重新朗讀目前段落
    if (this.isPlaying && !this.isPaused) {
      const curIndex = this.currentParaIndex;
      if (this.synth) this.synth.cancel();
      this.currentParaIndex = curIndex;
      setTimeout(() => {
        if (this.isPlaying) this.playCurrentParagraph();
      }, 50);
    }
  }

  // 載入當前頁面的文本並準備朗讀
  loadPageText(text) {
    this.stop();
    if (!text) {
      this.currentParagraphs = [];
      return;
    }
    // 按段落分割
    const paras = text.split(/\n+/).map(p => p.trim()).filter(p => p.length > 0);
    this.currentParagraphs = paras;
    this.currentParaIndex = 0;
  }

  play() {
    if (!this.synth) {
      alert(window.I18N ? window.I18N.t("ttsNotSupported") : "Browser does not support Speech Synthesis");
      return;
    }

    if (this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.isPlaying = true;
      this.notifyState();
      return;
    }

    if (this.currentParagraphs.length === 0) return;

    this.isPlaying = true;
    this.isPaused = false;
    this.notifyState();
    if (window.soundEngine) window.soundEngine.playChime();
    this.playCurrentParagraph();
  }

  playCurrentParagraph() {
    if (!this.isPlaying || this.currentParaIndex >= this.currentParagraphs.length) {
      this.stop();
      return;
    }

    const paraText = this.currentParagraphs[this.currentParaIndex];
    if (!paraText) {
      this.currentParaIndex++;
      this.playCurrentParagraph();
      return;
    }

    if (this.onParagraphChangeCallback) {
      this.onParagraphChangeCallback(this.currentParaIndex, paraText);
    }

    const utter = new SpeechSynthesisUtterance(paraText);
    const selectedVoice = this.pickVoice(this.selectedGender);

    if (selectedVoice) {
      utter.voice = selectedVoice;
      utter.lang = selectedVoice.lang || "zh-TW";
    } else {
      utter.lang = "zh-TW";
    }

    // 依性別設定音高（若為男聲但語音包共用，降低音高營造沉穩男聲；若女聲則微升音高）
    if (this.selectedGender === "male") {
      // 台灣男聲特徵：沉穩厚實
      const isExplicitMale = selectedVoice && (selectedVoice.name.toLowerCase().includes("male") || selectedVoice.name.toLowerCase().includes("男") || selectedVoice.name.toLowerCase().includes("zhiwei"));
      utter.pitch = isExplicitMale ? 0.95 : 0.82;
    } else {
      // 台灣女聲特徵：溫柔清亮
      utter.pitch = 1.12;
    }

    const speedEl = document.getElementById("tts-speed-select");
    if (speedEl) {
      this.rate = parseFloat(speedEl.value) || this.rate || 1.0;
    }
    utter.rate = this.rate;

    utter.onend = () => {
      this.currentParaIndex++;
      if (this.currentParaIndex < this.currentParagraphs.length) {
        this.playCurrentParagraph();
      } else {
        this.stop();
      }
    };

    utter.onerror = (e) => {
      console.warn("TTS Utterance Error:", e);
      this.stop();
    };

    this.currentUtterance = utter;
    this.synth.speak(utter);
  }

  pause() {
    if (this.synth && this.isPlaying) {
      this.synth.pause();
      this.isPaused = true;
      this.notifyState();
    }
  }

  resume() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.notifyState();
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.currentParaIndex = 0;
    this.currentUtterance = null;
    this.notifyState();
    if (this.onParagraphChangeCallback) {
      this.onParagraphChangeCallback(-1, null);
    }
  }

  notifyState() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback({
        isPlaying: this.isPlaying,
        isPaused: this.isPaused,
        gender: this.selectedGender,
        index: this.currentParaIndex,
        total: this.currentParagraphs.length
      });
    }
  }
}

window.taiwanTTS = new TaiwanTTSEngine();
