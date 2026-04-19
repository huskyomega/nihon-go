/**
 * grammar.js — 文法閃卡邏輯
 */

(function () {
  const PROGRESS_KEY = 'nihongo_grammar_progress';
  const SEEN_KEY = 'nihongo_grammar_seen';
  const ORDER_KEY = 'nihongo_grammar_order';
  const STATE_KEY = 'nihongo_grammar_flashcard_state';

  let deck = [];
  let currentIndex = 0;
  let totalCount = 0;
  let isFlipped = false;
  let allCards = [];
  let selectedUnit = '';
  let orderMode = localStorage.getItem(ORDER_KEY) || 'rnd';
  let seenIds = new Set();

  // DOM refs
  const cardInner       = document.getElementById('card-inner');
  const cardScene       = document.getElementById('card-scene');
  const frontLevel      = document.getElementById('front-level');
  const frontPattern    = document.getElementById('front-pattern');
  const backLevel       = document.getElementById('back-level');
  const backPattern     = document.getElementById('back-pattern');
  const backMeaning     = document.getElementById('back-meaning');
  const backExplanation      = document.getElementById('back-explanation');
  const backExamplesContainer = document.getElementById('back-examples-container');
  const actionBtns      = document.getElementById('action-btns');
  const doneScreen      = document.getElementById('done-screen');
  const doneSummary     = document.getElementById('done-summary');
  const progressBar     = document.getElementById('progress-bar');
  const progressLabel   = document.getElementById('progress-label');

  async function init() {
    setupTheme();
    bindEvents();

    try {
      allCards = await fetchJSON('data/n5-grammar.json');
    } catch (e) {
      console.error('[grammar] 無法載入文法資料', e);
      showFetchError();
      return;
    }

    const saved = loadProgress(SEEN_KEY);
    if (saved && Array.isArray(saved)) seenIds = new Set(saved);

    buildUnitBar();
    restoreState();
  }

  const UNIT_ORDER = [
    "基本文型", "い形容詞", "な形容詞", "動詞活用", "助詞",
    "て形的用法", "時間・順序", "意向・勧誘・願望", "疑問・限定",
    "副詞・接続詞", "普通體・語氣", "比較・能力"
  ];

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
    startDeck();
  }

  function startDeck() {
    const source = selectedUnit
      ? allCards.filter(function (c) { return c.unit === selectedUnit; })
      : allCards;
    deck = orderMode === 'seq' ? source.slice() : shuffle(source);
    currentIndex = 0;
    totalCount = deck.length;
    isFlipped = false;

    doneScreen.classList.add('hidden');
    cardScene.style.display = '';
    actionBtns.style.setProperty('display', 'none', 'important');

    renderCard();
    updateProgress();
  }

  function renderCard() {
    if (currentIndex >= deck.length) {
      showDone();
      return;
    }
    isFlipped = false;
    cardInner.classList.remove('is-flipped');
    actionBtns.style.setProperty('display', 'none', 'important');
    renderFront();
    renderBack();
  }

  function renderFront() {
    const card = deck[currentIndex];
    if (!card) return;
    frontLevel.textContent = card.level || 'N5';
    frontPattern.textContent = card.pattern;
    saveState();
  }

  function saveState() {
    const card = deck[currentIndex];
    if (card) saveProgress(STATE_KEY, { unit: selectedUnit, cardId: card.id });
  }

  function restoreState() {
    const saved = loadProgress(STATE_KEY);
    if (saved && saved.unit) {
      selectedUnit = saved.unit;
      document.querySelectorAll('.unit-btn').forEach(function (btn) {
        btn.classList.toggle('btn-secondary', btn.dataset.unit === saved.unit);
        btn.classList.toggle('btn-outline', btn.dataset.unit !== saved.unit);
      });
    }
    startDeck();
    if (saved && saved.cardId) {
      const idx = deck.findIndex(function (c) { return c.id === saved.cardId; });
      if (idx !== -1) { currentIndex = idx; renderCard(); updateProgress(); }
    }
  }

  function renderBack() {
    const card = deck[currentIndex];
    if (!card) return;
    backLevel.textContent = card.level || 'N5';
    backPattern.textContent = card.pattern;
    backMeaning.textContent = card.meaning;
    backExplanation.textContent = card.explanation;
    if (card.examples && card.examples.length > 1) {
      backExamplesContainer.innerHTML = card.examples.map(function (ex) {
        return '<div class="flex items-start gap-2 text-left w-full mt-1">' +
          '<div class="flex-1">' +
          '<span class="text-xs font-bold opacity-80">' + ex.label + '：</span>' +
          '<span class="text-xs italic">' + (ex.ruby || ex.sentence) + '</span>' +
          '<div class="text-xs opacity-60">' + ex.meaning + '</div>' +
          '</div>' +
          '<button class="speak-btn btn btn-circle btn-xs btn-ghost border border-secondary-content/30 shrink-0 speak-ex-btn" data-sentence="' + ex.sentence.replace(/"/g, '&quot;') + '" title="發音">▶</button>' +
          '</div>';
      }).join('');
    } else {
      backExamplesContainer.innerHTML =
        '<div class="flex items-center gap-2 mt-1">' +
        '<span class="text-sm italic flex-1">' + (card.example_ruby || card.example) + '</span>' +
        '<button class="speak-btn btn btn-circle btn-sm btn-ghost border border-secondary-content/30 speak-ex-btn" data-sentence="' + card.example.replace(/"/g, '&quot;') + '" title="發音">▶</button>' +
        '</div>' +
        '<div class="text-xs opacity-70">' + card.example_meaning + '</div>';
    }
  }

  function flipCard() {
    if (isFlipped) return;
    isFlipped = true;
    cardInner.classList.add('is-flipped');
    actionBtns.style.removeProperty('display');
  }

  function handleKnown() {
    const card = deck[currentIndex];
    if (card) {
      seenIds.add(card.id);
      saveProgress(SEEN_KEY, Array.from(seenIds));
    }
    nextCard();
  }

  function handleUnknown() {
    deck.push(deck[currentIndex]);
    nextCard();
  }

  function nextCard() {
    currentIndex++;
    updateProgress();
    actionBtns.style.setProperty('display', 'none', 'important');
    cardInner.classList.remove('is-flipped');
    isFlipped = false;
    if (currentIndex >= deck.length) {
      setTimeout(showDone, 500);
      return;
    }
    renderFront();               // 立即更新題目（正面），動畫中不可見
    setTimeout(renderBack, 500); // 等翻完才更新答案（背面）
  }

  function updateProgress() {
    const total = deck.length;
    const position = Math.min(currentIndex + 1, total);
    progressLabel.textContent = `第 ${position} 張 / 共 ${total} 張`;
    const pct = total > 0 ? Math.round((currentIndex / total) * 100) : 0;
    progressBar.value = pct;
    saveProgress(PROGRESS_KEY, { known: seenIds.size, total: allCards.length });
  }

  function showDone() {
    cardScene.style.display = 'none';
    actionBtns.style.setProperty('display', 'none', 'important');
    doneScreen.classList.remove('hidden');
    doneSummary.textContent = `本輪共 ${totalCount} 張，累計已學 ${seenIds.size} / ${allCards.length} 句型`;
    progressBar.value = 100;
    progressLabel.textContent = '完成！';
    saveProgress(PROGRESS_KEY, { known: seenIds.size, total: allCards.length });
  }

  function bindEvents() {
    document.getElementById('card-front').addEventListener('click', flipCard);

    backExamplesContainer.addEventListener('click', function (e) {
      const btn = e.target.closest('.speak-ex-btn');
      if (btn) { e.stopPropagation(); speak(btn.dataset.sentence); }
    });

    document.getElementById('btn-known').addEventListener('click', handleKnown);
    document.getElementById('btn-unknown').addEventListener('click', handleUnknown);
    document.getElementById('btn-restart').addEventListener('click', startDeck);
    document.getElementById('order-seq').addEventListener('click', function () { setOrder('seq'); });
    document.getElementById('order-rnd').addEventListener('click', function () { setOrder('rnd'); });

    // 套用已儲存的初始狀態
    document.getElementById('order-seq').classList.toggle('btn-active', orderMode === 'seq');
    document.getElementById('order-rnd').classList.toggle('btn-active', orderMode === 'rnd');

    document.addEventListener('keydown', function (e) {
      if (doneScreen && !doneScreen.classList.contains('hidden')) return;
      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          if (!isFlipped) flipCard();
          break;
        case 'ArrowRight':
        case 'k':
          if (isFlipped) handleKnown();
          break;
        case 'ArrowLeft':
        case 'j':
          if (isFlipped) handleUnknown();
          break;
        case 'p':
          if (isFlipped) {
            const card = deck[currentIndex];
            if (card) speak(card.examples ? card.examples[0].sentence : card.example);
          }
          break;
      }
    });
  }

  function setOrder(newOrder) {
    orderMode = newOrder;
    localStorage.setItem(ORDER_KEY, orderMode);
    document.getElementById('order-seq').classList.toggle('btn-active', orderMode === 'seq');
    document.getElementById('order-rnd').classList.toggle('btn-active', orderMode === 'rnd');
    startDeck();
  }

  function setupTheme() {
    const toggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const saved = localStorage.getItem('nihongo_theme');
    if (saved === 'dark') { html.dataset.theme = 'dark'; toggle.checked = true; }
    toggle.addEventListener('change', () => {
      const theme = toggle.checked ? 'dark' : 'cupcake';
      html.dataset.theme = theme;
      localStorage.setItem('nihongo_theme', theme);
    });
  }

  function showFetchError() {
    cardScene.style.display = 'none';
    doneScreen.classList.remove('hidden');
    doneScreen.innerHTML = `
      <div class="card-body items-center text-center py-10">
        <div class="text-5xl mb-4">⚠️</div>
        <h2 class="card-title text-xl mb-2">無法載入資料</h2>
        <p class="text-base-content/60 text-sm mb-4">請用本機伺服器開啟，而非直接點開檔案。</p>
        <div class="mockup-code text-left text-xs w-full max-w-xs">
          <pre><code>cd src
python3 -m http.server 8080</code></pre>
        </div>
        <p class="text-base-content/40 text-xs mt-3">然後開啟 http://localhost:8080</p>
      </div>`;
  }

  init();
})();
