/**
 * flashcard.js — 單字閃卡邏輯
 */

(function () {
  const PROGRESS_KEY = 'nihongo_vocab_progress';
  const SEEN_KEY = 'nihongo_vocab_seen';
  const MODE_KEY = 'nihongo_vocab_mode';
  const ORDER_KEY = 'nihongo_vocab_order';

  // 模式：'jp'（日→中）或 'zh'（中→日）
  let mode = localStorage.getItem(MODE_KEY) || 'zh';
  let selectedUnit = '';  // '' = 全部
  let orderMode = localStorage.getItem(ORDER_KEY) || 'rnd';  // 'rnd' 隨機 | 'seq' 固定
  let deck = [];       // 當前牌堆
  let currentIndex = 0;
  let totalCount = 0;
  let isFlipped = false;
  let allCards = [];
  let seenIds = new Set();  // 累積已學過的卡片 ID

  // DOM refs
  const cardInner    = document.getElementById('card-inner');
  const cardScene    = document.getElementById('card-scene');
  const frontPos     = document.getElementById('front-pos');
  const frontMain    = document.getElementById('front-main');
  const frontSub     = document.getElementById('front-sub');
  const backPos      = document.getElementById('back-pos');
  const backWord     = document.getElementById('back-word');
  const backReading  = document.getElementById('back-reading');
  const backMeaning  = document.getElementById('back-meaning');
  const speakBtn     = document.getElementById('speak-btn');
  const actionBtns   = document.getElementById('action-btns');
  const doneScreen   = document.getElementById('done-screen');
  const doneSummary  = document.getElementById('done-summary');
  const progressBar  = document.getElementById('progress-bar');
  const progressLabel = document.getElementById('progress-label');

  // 初始化
  async function init() {
    setupTheme();
    setupModeButtons();
    bindEvents();  // 先綁定，不依賴資料載入

    try {
      allCards = await fetchJSON('data/n5-vocab.json');
    } catch (e) {
      console.error('[flashcard] 無法載入單字資料', e);
      showFetchError();
      return;
    }

    // 載入累積進度
    const saved = loadProgress(SEEN_KEY);
    if (saved && Array.isArray(saved)) seenIds = new Set(saved);

    buildUnitBar();
    startDeck();
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

  // 單元定義順序（保持學習順序）
  const UNIT_ORDER = [
    "數字・量詞", "家族", "身體部位", "職業・人物", "場所・建築",
    "方位・位置", "飲食", "自然・天氣", "交通", "衣物・配件",
    "電器・文具", "娛樂・興趣", "時間表現", "動物・顏色", "家具・日用品",
    "學習・工作", "形容詞", "動詞", "代名詞・指示詞", "副詞・接続詞",
    "助詞・感動詞"
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
      btn.classList.toggle('btn-accent', btn.dataset.unit === unit);
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
    if (mode === 'jp') {
      frontPos.textContent = card.pos;
      frontMain.innerHTML = toRuby(card.word, card.reading);
      frontSub.textContent = '';
    } else {
      frontPos.textContent = card.pos;
      frontMain.textContent = card.meaning;
      frontSub.textContent = '';
    }
  }

  function renderBack() {
    const card = deck[currentIndex];
    if (!card) return;
    backPos.textContent = card.pos;
    backWord.innerHTML = toRuby(card.word, card.reading);
    backReading.textContent = card.reading;
    backMeaning.textContent = card.meaning;
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
    // 將此卡放回牌堆末尾
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
    renderFront();              // 立即更新題目（正面），動畫中不可見
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
    doneSummary.textContent = `本輪共 ${totalCount} 張，累計已學 ${seenIds.size} / ${allCards.length} 字`;
    progressBar.value = 100;
    progressLabel.textContent = `完成！`;
    saveProgress(PROGRESS_KEY, { known: seenIds.size, total: allCards.length });
  }

  function bindEvents() {
    // 翻面（點卡片）
    document.getElementById('card-front').addEventListener('click', flipCard);
    document.getElementById('card-back').addEventListener('click', function (e) {
      // 避免點發音按鈕時觸發翻面
      if (e.target.closest('#speak-btn')) return;
    });

    // 發音
    speakBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const card = deck[currentIndex];
      if (card) speak(card.word);
    });

    // 知道了 / 不熟
    document.getElementById('btn-known').addEventListener('click', handleKnown);
    document.getElementById('btn-unknown').addEventListener('click', handleUnknown);

    // 重新開始
    document.getElementById('btn-restart').addEventListener('click', startDeck);

    // 鍵盤快捷鍵
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
            if (card) speak(card.word);
          }
          break;
      }
    });
  }

  function setupModeButtons() {
    document.getElementById('mode-jp').addEventListener('click', function () { setMode('jp'); });
    document.getElementById('mode-zh').addEventListener('click', function () { setMode('zh'); });
    document.getElementById('order-seq').addEventListener('click', function () { setOrder('seq'); });
    document.getElementById('order-rnd').addEventListener('click', function () { setOrder('rnd'); });

    // 套用已儲存的初始狀態
    document.getElementById('mode-jp').classList.toggle('btn-active', mode === 'jp');
    document.getElementById('mode-zh').classList.toggle('btn-active', mode === 'zh');
    document.getElementById('order-seq').classList.toggle('btn-active', orderMode === 'seq');
    document.getElementById('order-rnd').classList.toggle('btn-active', orderMode === 'rnd');
  }

  function setOrder(newOrder) {
    orderMode = newOrder;
    localStorage.setItem(ORDER_KEY, orderMode);
    document.getElementById('order-seq').classList.toggle('btn-active', orderMode === 'seq');
    document.getElementById('order-rnd').classList.toggle('btn-active', orderMode === 'rnd');
    startDeck();
  }

  function setMode(newMode) {
    mode = newMode;
    localStorage.setItem(MODE_KEY, mode);
    document.getElementById('mode-jp').classList.toggle('btn-active', mode === 'jp');
    document.getElementById('mode-zh').classList.toggle('btn-active', mode === 'zh');
    // 重新渲染當前卡片
    if (currentIndex < deck.length) renderCard();
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

  init();
})();
