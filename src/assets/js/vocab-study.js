/**
 * vocab-study.js — 單字學習（固定順序，只顯示詳解面）
 */

(function () {
  const UNIT_ORDER = [
    "數字・量詞", "家族", "身體部位", "職業・人物", "場所・建築",
    "方位・位置", "飲食", "自然・天氣", "交通", "衣物・配件",
    "電器・文具", "娛樂・興趣", "時間表現", "動物・顏色", "家具・日用品",
    "學習・工作", "形容詞", "動詞", "代名詞・指示詞", "副詞・接続詞",
    "助詞・感動詞"
  ];

  let allCards = [];
  let deck = [];
  let currentIndex = 0;
  let selectedUnit = '';

  const cardScene    = document.getElementById('card-scene');
  const cardPos      = document.getElementById('card-pos');
  const cardWord     = document.getElementById('card-word');
  const cardReading  = document.getElementById('card-reading');
  const cardMeaning  = document.getElementById('card-meaning');
  const speakBtn     = document.getElementById('speak-btn');
  const progressBar  = document.getElementById('progress-bar');
  const progressLabel = document.getElementById('progress-label');
  const btnPrev      = document.getElementById('btn-prev');
  const btnNext      = document.getElementById('btn-next');
  const errorScreen  = document.getElementById('error-screen');

  async function init() {
    setupTheme();

    try {
      allCards = await fetchJSON('data/n5-vocab.json');
    } catch (e) {
      console.error('[vocab-study] 無法載入單字資料', e);
      cardScene.style.display = 'none';
      document.getElementById('nav-btns').style.display = 'none';
      errorScreen.classList.remove('hidden');
      return;
    }

    buildUnitBar();
    buildDeck();
    bindEvents();
  }

  function buildDeck() {
    const source = selectedUnit
      ? allCards.filter(function (c) { return c.unit === selectedUnit; })
      : allCards;
    deck = source.slice();
    currentIndex = 0;
    renderCard();
    updateProgress();
  }

  function buildUnitBar() {
    const bar = document.getElementById('unit-bar');
    const units = UNIT_ORDER.filter(function (u) {
      return allCards.some(function (c) { return c.unit === u; });
    });
    units.forEach(function (u) {
      const btn = document.createElement('button');
      btn.className = 'btn btn-xs btn-outline shrink-0 unit-btn';
      btn.dataset.unit = u;
      btn.textContent = u;
      btn.addEventListener('click', function () { setUnit(u); });
      bar.appendChild(btn);
    });
    bar.querySelector('[data-unit=""]').addEventListener('click', function () { setUnit(''); });
  }

  function setUnit(unit) {
    selectedUnit = unit;
    document.querySelectorAll('.unit-btn').forEach(function (btn) {
      btn.classList.toggle('btn-accent', btn.dataset.unit === unit);
      btn.classList.toggle('btn-outline', btn.dataset.unit !== unit);
    });
    buildDeck();
  }

  function renderCard() {
    const card = deck[currentIndex];
    if (!card) return;
    cardPos.textContent = card.pos;
    cardWord.innerHTML = toRuby(card.word, card.reading.split('・')[0]);
    cardReading.textContent = card.reading;
    cardMeaning.textContent = card.meaning;

    btnPrev.disabled = currentIndex === 0;
    btnNext.disabled = currentIndex === deck.length - 1;
  }

  function updateProgress() {
    const total = deck.length;
    const pos = total > 0 ? currentIndex + 1 : 0;
    progressLabel.textContent = `第 ${pos} 個 / 共 ${total} 個`;
    progressBar.max = Math.max(total - 1, 1);
    progressBar.value = currentIndex;
  }

  function bindEvents() {
    speakBtn.addEventListener('click', function () {
      const card = deck[currentIndex];
      if (card) speak(card.word);
    });

    btnPrev.addEventListener('click', function () {
      if (currentIndex > 0) {
        currentIndex--;
        renderCard();
        updateProgress();
      }
    });

    btnNext.addEventListener('click', function () {
      if (currentIndex < deck.length - 1) {
        currentIndex++;
        renderCard();
        updateProgress();
      }
    });

    progressBar.addEventListener('input', function () {
      currentIndex = parseInt(progressBar.value, 10);
      renderCard();
      updateProgress();
    });

    document.addEventListener('keydown', function (e) {
      switch (e.key) {
        case 'ArrowLeft':
        case 'j':
          if (currentIndex > 0) { currentIndex--; renderCard(); updateProgress(); }
          break;
        case 'ArrowRight':
        case 'k':
          if (currentIndex < deck.length - 1) { currentIndex++; renderCard(); updateProgress(); }
          break;
        case 'p':
          speak(deck[currentIndex].word);
          break;
      }
    });
  }

  function setupTheme() {
    const toggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const saved = localStorage.getItem('nihongo_theme');
    if (saved === 'dark') { html.dataset.theme = 'dark'; toggle.checked = true; }
    toggle.addEventListener('change', function () {
      const theme = toggle.checked ? 'dark' : 'cupcake';
      html.dataset.theme = theme;
      localStorage.setItem('nihongo_theme', theme);
    });
  }

  init();
})();
