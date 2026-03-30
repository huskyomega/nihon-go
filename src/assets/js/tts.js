/**
 * tts.js — Web Speech API 日文發音模組
 * 使用方式：speak('おはよう')
 */

(function () {
  const LANG = 'ja-JP';

  /**
   * 朗讀日文文字
   * @param {string} text - 要發音的日文文字
   * @param {number} [rate=1.0] - 語速（0.1 ~ 10）
   * @param {number} [pitch=1.0] - 音調（0 ~ 2）
   */
  function speak(text, rate, pitch) {
    if (!text) return;
    if (!window.speechSynthesis) {
      console.warn('[tts] 此瀏覽器不支援 Web Speech API');
      return;
    }

    // 取消目前正在播放的語音
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = LANG;
    utter.rate = (rate !== undefined) ? rate : 1.0;
    utter.pitch = (pitch !== undefined) ? pitch : 1.0;

    // 優先選擇 Google 日本語，其次其他 ja-JP voice
    const voices = window.speechSynthesis.getVoices();
    const jaVoice =
      voices.find(v => v.lang === LANG && v.name.includes('Google')) ||
      voices.find(v => v.lang === LANG) ||
      voices.find(v => v.lang.startsWith('ja'));
    if (jaVoice) utter.voice = jaVoice;

    window.speechSynthesis.speak(utter);
  }

  /**
   * 停止發音
   */
  function stopSpeak() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * 確認瀏覽器是否支援 TTS
   * @returns {boolean}
   */
  function isTTSSupported() {
    return 'speechSynthesis' in window;
  }

  // 等待 voices 載入（部分瀏覽器需要）
  if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = function () {
      // voices 已載入，後續 speak() 呼叫可正常選取 voice
    };
  }

  // 掛載到 window
  window.speak = speak;
  window.stopSpeak = stopSpeak;
  window.isTTSSupported = isTTSSupported;
})();
