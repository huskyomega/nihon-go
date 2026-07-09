/**
 * index.js — 首頁邏輯
 */

(function () {
  const LEVEL = getCurrentLevel();

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

  function applyLevelLabels() {
    document.title = `NihonGo 霓虹狗 — JLPT ${LEVEL} 日文學習`;
    document.getElementById('level-pill').textContent = `JLPT ${LEVEL} 單字・文法・模擬考`;
    document.querySelectorAll('.level-label').forEach((el) => {
      el.textContent = LEVEL;
    });
  }

  function renderQuizCards(manifest) {
    const container = document.getElementById('quiz-cards');
    if (!manifest.quizzes || manifest.quizzes.length === 0) {
      container.innerHTML = `
        <div class="card bg-base-100 shadow relative overflow-hidden opacity-60">
          <img src="assets/icons/quiz.svg" alt="" aria-hidden="true" class="card-bg-icon">
          <div class="card-body items-center text-center relative">
            <h2 class="card-title">模擬考</h2>
            <p class="text-sm text-base-content/60">JLPT ${LEVEL} 模擬考製作中，敬請期待</p>
          </div>
        </div>`;
      return;
    }
    container.innerHTML = manifest.quizzes.map((quiz) => `
      <a href="${quiz.page}" class="card bg-base-100 shadow hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden">
        <img src="assets/icons/quiz.svg" alt="" aria-hidden="true" class="card-bg-icon">
        <div class="card-body items-center text-center relative">
          <h2 class="card-title">${quiz.title}</h2>
          <p class="text-sm text-base-content/60">JLPT ${LEVEL} 題型練習</p>
        </div>
      </a>`).join('');
  }

  async function init() {
    setupTheme();
    setupLevelSelect();
    applyLevelLabels();

    const vocabProgress = loadProgress(`nihongo_vocab_progress_${LEVEL}`);
    const grammarProgress = loadProgress(`nihongo_grammar_progress_${LEVEL}`);
    const dir = getLevelDataDir();

    const [vocab, grammar, manifest] = await Promise.all([
      fetchJSON(`data/${dir}/vocab.json`),
      fetchJSON(`data/${dir}/grammar.json`),
      fetchJSON(`data/${dir}/manifest.json`)
    ]);

    const vocabTotal = vocab.length;
    const grammarTotal = grammar.length;

    document.getElementById('vocab-study-total').textContent = `共 ${vocabTotal} 字`;
    document.getElementById('grammar-study-total').textContent = `共 ${grammarTotal} 句型`;

    if (vocabProgress && vocabProgress.total > 0) {
      document.getElementById('vocab-progress-label').textContent = `已學 ${vocabProgress.known} / ${vocabTotal} 字`;
    }
    if (grammarProgress && grammarProgress.total > 0) {
      document.getElementById('grammar-progress-label').textContent = `已學 ${grammarProgress.known} / ${grammarTotal} 句型`;
    }

    renderQuizCards(manifest);
  }

  init();
})();
