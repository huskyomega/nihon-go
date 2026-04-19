/**
 * grammar-study.js — 文法學習（固定順序，只顯示詳解面）
 */

(function () {
  const UNIT_ORDER = [
    "基本文型", "い形容詞", "な形容詞", "動詞活用", "助詞",
    "て形的用法", "時間・順序", "意向・勧誘・願望", "疑問・限定",
    "副詞・接続詞", "普通體・語氣", "比較・能力"
  ];

  let allCards = [];
  let deck = [];
  let currentIndex = 0;
  let selectedUnit = '';

  const cardScene       = document.getElementById('card-scene');
  const cardLevel       = document.getElementById('card-level');
  const cardPattern     = document.getElementById('card-pattern');
  const cardMeaning     = document.getElementById('card-meaning');
  const cardExplanation      = document.getElementById('card-explanation');
  const cardExamplesContainer = document.getElementById('card-examples-container');
  const progressBar     = document.getElementById('progress-bar');
  const progressLabel   = document.getElementById('progress-label');
  const btnPrev         = document.getElementById('btn-prev');
  const btnNext         = document.getElementById('btn-next');
  const errorScreen     = document.getElementById('error-screen');

  async function init() {
    setupTheme();

    try {
      allCards = await fetchJSON('data/n5-grammar.json');
    } catch (e) {
      console.error('[grammar-study] 無法載入文法資料', e);
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
      btn.classList.toggle('btn-secondary', btn.dataset.unit === unit);
      btn.classList.toggle('btn-outline', btn.dataset.unit !== unit);
    });
    buildDeck();
  }

  function renderCard() {
    const card = deck[currentIndex];
    if (!card) return;
    cardLevel.textContent = card.level || 'N5';
    cardPattern.textContent = card.pattern;
    cardMeaning.textContent = card.meaning;
    cardExplanation.textContent = card.explanation;
    if (card.examples && card.examples.length > 1) {
      cardExamplesContainer.innerHTML = card.examples.map(function (ex) {
        return '<div class="flex items-start gap-2 text-left w-full mt-2">' +
          '<div class="flex-1">' +
          '<span class="text-xs font-bold opacity-80">' + ex.label + '：</span>' +
          '<span class="text-sm italic">' + (ex.ruby || ex.sentence) + '</span>' +
          '<div class="text-xs opacity-70">' + ex.meaning + '</div>' +
          '</div>' +
          '<button class="speak-btn btn btn-circle btn-xs btn-ghost border border-secondary-content/30 shrink-0 speak-ex-btn" data-sentence="' + ex.sentence.replace(/"/g, '&quot;') + '" title="發音">▶</button>' +
          '</div>';
      }).join('');
    } else {
      cardExamplesContainer.innerHTML =
        '<div class="flex items-center gap-2 mt-1">' +
        '<span class="text-sm italic flex-1">' + (card.example_ruby || card.example) + '</span>' +
        '<button class="speak-btn btn btn-circle btn-sm btn-ghost border border-secondary-content/30 speak-ex-btn" data-sentence="' + card.example.replace(/"/g, '&quot;') + '" title="發音">▶</button>' +
        '</div>' +
        '<div class="text-xs opacity-70">' + card.example_meaning + '</div>';
    }

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
    cardExamplesContainer.addEventListener('click', function (e) {
      const btn = e.target.closest('.speak-ex-btn');
      if (btn) speak(btn.dataset.sentence);
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
        case 'p': {
          const card = deck[currentIndex];
          if (card) speak(card.examples ? card.examples[0].sentence : card.example);
          break;
        }
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
