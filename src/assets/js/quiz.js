/**
 * quiz.js — JLPT N5 模擬試験ロジック
 */

(function () {
  const PROGRESS_KEY = 'nihongo_quiz_history';

  // 各問題タイプの説明文
  const INSTRUCTIONS = {
    kanji_reading:      '＿＿のことばの読み方として、いちばんよいものを１・２・３・４からひとつえらんでください。',
    orthography:        '＿＿のことばを漢字で書くとき、いちばんよいものを１・２・３・４からひとつえらんでください。',
    contextual_vocab:   '（　　）に何を入れますか。いちばんよいものを１・２・３・４からひとつえらんでください。',
    paraphrase:         '＿＿のことばに意味がいちばん近いものを１・２・３・４からひとつえらんでください。',
    grammar_form:       '（　　）に何を入れますか。いちばんよいものを１・２・３・４からひとつえらんでください。',
    sentence_order:     '＿★＿に入るものはどれですか。いちばんよいものを１・２・３・４からひとつえらんでください。',
    passage_grammar:    '（　　）に何を入れますか。いちばんよいものを１・２・３・４からひとつえらんでください。',
    reading:            'つぎの文章を読んで、しつもんにこたえてください。いちばんよいものを１・２・３・４からひとつえらんでください。',
    listening_task:     'まず質問を聞いてください。それから話を聞いて、１から４の中から、いちばんよいものをひとつえらんでください。',
    listening_point:    'まず質問を聞いてください。それから話を聞いて、１から４の中から、いちばんよいものをひとつえらんでください。',
    verbal_expression:  'えを見ながら質問を聞いてください。やじるし（→）の人は何と言いますか。１から３の中から、いちばんよいものをひとつえらんでください。',
    immediate_response: 'まず文を聞いてください。それからそのへんじを聞いて、１から３の中から、いちばんよいものをひとつえらんでください。',
  };

  const PROBLEM_NAMES = {
    kanji_reading:      '問題１',
    orthography:        '問題２',
    contextual_vocab:   '問題３',
    paraphrase:         '問題４',
    grammar_form:       '問題１',
    sentence_order:     '問題２',
    passage_grammar:    '問題３',
    reading:            '問題４',
    listening_task:     '問題１',
    listening_point:    '問題２',
    verbal_expression:  '問題３',
    immediate_response: '問題４',
  };

  const SECTION_TYPES = {
    '文字・語彙': ['kanji_reading', 'orthography', 'contextual_vocab', 'paraphrase'],
    '文法・読解': ['grammar_form', 'sentence_order', 'passage_grammar', 'reading'],
    '聴解':       ['listening_task', 'listening_point', 'verbal_expression', 'immediate_response'],
  };

  function iconImg(name) {
    return '<img src="assets/icons/' + name + '" class="ui-icon w-16 h-16" alt="">';
  }

  const SECTION_META = {
    '文字・語彙': { icon: iconImg('vocab-study.svg'),    desc: '言語知識（文字・語彙）のテストです。' },
    '文法・読解': { icon: iconImg('grammar-study.svg'),  desc: '言語知識（文法）・読解のテストです。' },
    '聴解':       { icon: iconImg('listening.svg'),       desc: '聴解のテストです。音声を聞いてから答えてください。' },
  };

  const OPTION_NUMS = ['１', '２', '３', '４'];

  let allQuestions = [];
  let currentIndex = 0;
  let answered = false;
  let wrongItems = [];
  let sectionScores = {};  // { '文字・語彙': { score, total } }
  let lastShownSection = null;
  let lastShownProblem = null;
  let lastShownPassageId = null;

  // DOM refs
  const startScreen      = document.getElementById('start-screen');
  const sectionScreen    = document.getElementById('section-screen');
  const problemScreen    = document.getElementById('problem-screen');
  const quizScreen       = document.getElementById('quiz-screen');
  const resultScreen     = document.getElementById('result-screen');
  const progressBar      = document.getElementById('progress-bar');
  const progressLabel    = document.getElementById('progress-label');
  const breadcrumb       = document.getElementById('breadcrumb');
  const listeningArea    = document.getElementById('listening-area');
  const svgContainer     = document.getElementById('svg-container');
  const btnPlayScript    = document.getElementById('btn-play-script');
  const passageArea      = document.getElementById('passage-area');
  const passageBox       = document.getElementById('passage-box');
  const questionText     = document.getElementById('question-text');
  const optionsContainer = document.getElementById('options-container');
  const explanationArea  = document.getElementById('explanation-area');
  const resultLabel      = document.getElementById('result-label');
  const explanationText  = document.getElementById('explanation-text');
  const btnNext          = document.getElementById('btn-next');
  const btnToSection     = document.getElementById('btn-to-section');
  const btnFinish        = document.getElementById('btn-finish');

  async function init() {
    setupTheme();
    bindEvents();

    try {
      allQuestions = await fetchJSON('data/n5-quiz.json');
    } catch (e) {
      console.error('[quiz] データの読み込みに失敗しました', e);
      showFetchError();
      return;
    }

    // Count by section
    const sections = ['文字・語彙', '文法・読解', '聴解'];
    sections.forEach(function (s) {
      const count = allQuestions.filter(function (q) { return q.section === s; }).length;
      const key = { '文字・語彙': 'vocab', '文法・読解': 'grammar', '聴解': 'listening' }[s];
      document.getElementById('count-' + key).textContent = count + ' 問';
    });

    showLastScore();
  }

  function showLastScore() {
    const history = loadProgress(PROGRESS_KEY);
    if (history && history.lastTotal > 0) {
      document.getElementById('last-score-area').classList.remove('hidden');
      document.getElementById('last-score-text').textContent =
        '前回の成績：' + history.lastTotal + '問中 ' + history.lastScore + '%';
    }
  }

  function startQuiz() {
    currentIndex = 0;
    answered = false;
    wrongItems = [];
    lastShownSection = null;
    lastShownProblem = null;
    lastShownPassageId = null;
    sectionScores = {};
    ['文字・語彙', '文法・読解', '聴解'].forEach(function (s) {
      sectionScores[s] = { score: 0, total: 0 };
    });
    allQuestions.forEach(function (q) {
      if (sectionScores[q.section]) sectionScores[q.section].total++;
    });

    startScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    quizScreen.classList.add('hidden');
    advanceToNextStep();
  }

  // Decide whether to show a section/problem transition or go straight to question
  function advanceToNextStep() {
    if (currentIndex >= allQuestions.length) {
      showResult();
      return;
    }

    const q = allQuestions[currentIndex];
    const thisSection = q.section;
    const thisType = q.type;

    // New section?
    if (thisSection !== lastShownSection) {
      showSectionScreen(thisSection);
      return;
    }

    // New problem type within section?
    if (thisType !== lastShownProblem) {
      showProblemScreen(thisType);
      return;
    }

    renderQuestion();
  }

  function showSectionScreen(section) {
    sectionScreen.classList.remove('hidden');
    quizScreen.classList.add('hidden');
    problemScreen.classList.add('hidden');

    const meta = SECTION_META[section];
    document.getElementById('section-icon').innerHTML = meta.icon;
    document.getElementById('section-title').textContent = section;
    document.getElementById('section-desc').textContent = meta.desc;
  }

  function showProblemScreen(type) {
    problemScreen.classList.remove('hidden');
    sectionScreen.classList.add('hidden');
    quizScreen.classList.add('hidden');

    document.getElementById('problem-label').textContent = PROBLEM_NAMES[type] || '';
    document.getElementById('problem-instruction').textContent = INSTRUCTIONS[type] || '';
  }

  function renderQuestion() {
    sectionScreen.classList.add('hidden');
    problemScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');

    answered = false;
    const q = allQuestions[currentIndex];
    const total = allQuestions.length;

    lastShownSection = q.section;
    lastShownProblem = q.type;

    // Progress
    progressLabel.textContent = (currentIndex + 1) + ' / ' + total;
    progressBar.value = Math.round((currentIndex / total) * 100);
    breadcrumb.textContent = q.section + '　' + (PROBLEM_NAMES[q.type] || '');

    // Reset areas
    listeningArea.classList.add('hidden');
    svgContainer.classList.add('hidden');
    passageArea.classList.add('hidden');
    explanationArea.classList.add('hidden');
    btnNext.classList.add('hidden');
    btnToSection.classList.add('hidden');
    btnFinish.classList.add('hidden');
    optionsContainer.innerHTML = '';

    // Dispatch to type-specific renderers
    switch (q.type) {
      case 'kanji_reading':
      case 'paraphrase':
        renderUnderlineQuestion(q);
        break;
      case 'orthography':
        renderUnderlineQuestion(q);
        break;
      case 'contextual_vocab':
      case 'grammar_form':
        renderBlankQuestion(q);
        break;
      case 'sentence_order':
        renderSentenceOrder(q);
        break;
      case 'passage_grammar':
        renderPassageGrammar(q);
        break;
      case 'reading':
        renderReading(q);
        break;
      case 'listening_task':
      case 'listening_point':
      case 'verbal_expression':
      case 'immediate_response':
        renderListening(q);
        break;
      default:
        renderBlankQuestion(q);
    }

    renderOptions(q);
  }

  // Sentence with underlined/highlighted target word
  function renderUnderlineQuestion(q) {
    questionText.innerHTML = '';
    if (q.sentence && q.target) {
      const parts = q.sentence.split(q.target);
      const span = document.createElement('span');
      span.className = 'underline underline-offset-4 font-bold';
      span.textContent = q.target;
      const frag = document.createDocumentFragment();
      frag.appendChild(document.createTextNode(parts[0]));
      frag.appendChild(span);
      frag.appendChild(document.createTextNode(parts[1] || ''));
      questionText.appendChild(frag);
    } else {
      questionText.textContent = q.sentence || q.question || '';
    }
  }

  // Sentence with （　）blank
  function renderBlankQuestion(q) {
    questionText.textContent = q.sentence || q.question || '';
  }

  // ★ sentence order
  function renderSentenceOrder(q) {
    // Build blank display: lead [blank][★blank][blank][blank] trail
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createTextNode(q.lead + '　'));
    for (let i = 0; i < 4; i++) {
      if (i + 1 === q.star) {
        const s = document.createElement('span');
        s.className = 'star-blank';
        s.textContent = '＿★＿';
        frag.appendChild(s);
      } else {
        const s = document.createElement('span');
        s.className = 'normal-blank';
        s.textContent = '＿＿＿';
        frag.appendChild(s);
      }
      frag.appendChild(document.createTextNode('　'));
    }
    frag.appendChild(document.createTextNode(q.trail));
    questionText.innerHTML = '';
    questionText.appendChild(frag);
  }

  // Passage grammar fill
  function renderPassageGrammar(q) {
    // Show passage only if it's different from the last shown passage
    if (q.passage && q.passage_shared !== lastShownPassageId) {
      passageArea.classList.remove('hidden');
      // Render passage with circled blank numbers
      passageBox.innerHTML = q.passage.replace(/（(\d+)）/g, function (_, n) {
        return '<span class="blank-num">' + n + '</span>';
      });
      lastShownPassageId = q.passage_shared || null;
    } else if (q.passage) {
      // Same passage - still show it (keep context)
      passageArea.classList.remove('hidden');
      passageBox.innerHTML = q.passage.replace(/（(\d+)）/g, function (_, n) {
        return '<span class="blank-num">' + n + '</span>';
      });
    }
    questionText.textContent = '（' + q.blank_no + '）に何を入れますか。';
  }

  // Reading comprehension
  function renderReading(q) {
    if (q.passage) {
      passageArea.classList.remove('hidden');
      passageBox.textContent = q.passage;
    }
    questionText.textContent = q.question || '';
  }

  // ── 多聲道 TTS ───────────────────────────────────────────
  const ROLE_PITCH = { narrator: 1.0, male: 0.7, female: 1.0, child: 1.55 };
  let speechQueue = [];
  let _keepAliveTimer = null;

  // Chrome bug workaround: speechSynthesis pauses after ~15s
  function _startKeepAlive() {
    _stopKeepAlive();
    _keepAliveTimer = setInterval(function () {
      if (!window.speechSynthesis) return;
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        _stopKeepAlive();
      }
    }, 10000);
  }

  function _stopKeepAlive() {
    if (_keepAliveTimer !== null) {
      clearInterval(_keepAliveTimer);
      _keepAliveTimer = null;
    }
  }

  function speakScript(parts) {
    stopSpeechQueue();
    speechQueue = parts.slice();
    _startKeepAlive();
    speakNext();
  }

  function speakNext() {
    if (!speechQueue.length) { _stopKeepAlive(); return; }
    const part = speechQueue.shift();
    const pitch = ROLE_PITCH[part.role] !== undefined ? ROLE_PITCH[part.role] : 1.0;
    const utter = new SpeechSynthesisUtterance(part.text);
    utter.lang = 'ja-JP';
    utter.rate = 0.9;
    utter.pitch = pitch;
    const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    const jaVoice = voices.find(function (v) { return v.lang === 'ja-JP' && v.name.includes('Google'); }) ||
                    voices.find(function (v) { return v.lang === 'ja-JP'; }) ||
                    voices.find(function (v) { return v.lang.startsWith('ja'); });
    if (jaVoice) utter.voice = jaVoice;
    utter.onend  = speakNext;
    utter.onerror = speakNext;
    window.speechSynthesis.speak(utter);
  }

  function stopSpeechQueue() {
    speechQueue = [];
    _stopKeepAlive();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }
  // ─────────────────────────────────────────────────────────

  // Listening (all subtypes)
  function renderListening(q) {
    listeningArea.classList.remove('hidden');

    if (q.svg) {
      svgContainer.classList.remove('hidden');
      svgContainer.innerHTML = q.svg;
    } else {
      svgContainer.classList.add('hidden');
    }

    btnPlayScript.textContent = '▶ 音声を再生';
    btnPlayScript.disabled = false;
    btnPlayScript.onclick = function () {
      if (q.script_parts) {
        speakScript(q.script_parts);
      } else {
        speak(q.script, 0.9);
      }
      btnPlayScript.textContent = '▶ もう一度再生';
    };

    if (q.question) {
      questionText.textContent = q.question;
    } else {
      questionText.textContent = '';
    }
  }

  // Render option buttons
  function renderOptions(q) {
    const opts = q.options || q.parts || [];
    // verbal_expression / immediate_response の選択肢はスクリプト内で読み上げられるためテキスト非表示
    const hideText = (q.type === 'verbal_expression' || q.type === 'immediate_response');
    optionsContainer.innerHTML = '';
    opts.forEach(function (opt, i) {
      const btn = document.createElement('button');
      if (hideText) {
        btn.className = 'option-btn btn btn-outline flex-1 text-xl font-bold';
        btn.textContent = OPTION_NUMS[i];
      } else {
        btn.className = 'option-btn btn btn-outline w-full text-left justify-start normal-case font-normal text-sm';
        btn.innerHTML = '<span class="font-bold mr-3 text-base-content/50">' + OPTION_NUMS[i] + '</span>' + escapeHtml(opt);
      }
      btn.addEventListener('click', function () { handleAnswer(i); });
      optionsContainer.appendChild(btn);
    });
    if (hideText) {
      optionsContainer.className = 'flex gap-3 mt-1';
    } else {
      optionsContainer.className = 'flex flex-col gap-2 mt-1';
    }
  }

  function handleAnswer(selectedIndex) {
    if (answered) return;
    answered = true;

    // 作答後停止 TTS
    stopSpeechQueue();

    const q = allQuestions[currentIndex];
    const isCorrect = selectedIndex === q.answer;

    if (isCorrect) {
      sectionScores[q.section].score++;
    } else {
      wrongItems.push({ q: q, selected: selectedIndex });
    }

    // Highlight options
    optionsContainer.querySelectorAll('.option-btn').forEach(function (btn, i) {
      btn.disabled = true;
      if (i === q.answer) btn.classList.add('correct');
      else if (i === selectedIndex && !isCorrect) btn.classList.add('wrong');
    });

    // Explanation
    explanationArea.classList.remove('hidden');
    if (isCorrect) {
      explanationArea.className = 'alert alert-success mb-3';
      resultLabel.textContent = '○ 答對了！';
    } else {
      explanationArea.className = 'alert alert-error mb-3';
      resultLabel.textContent = '✗ 答錯了！正確答案：' + (q.options || q.parts)[q.answer];
    }
    explanationText.textContent = q.explanation || '';

    // Nav: check if next question changes section
    const isLast = currentIndex === allQuestions.length - 1;
    if (isLast) {
      btnFinish.classList.remove('hidden');
    } else {
      const nextQ = allQuestions[currentIndex + 1];
      if (nextQ.section !== q.section) {
        btnToSection.classList.remove('hidden');
      } else {
        btnNext.classList.remove('hidden');
      }
    }
  }

  function nextQuestion() {
    currentIndex++;
    advanceToNextStep();
  }

  function showResult() {
    quizScreen.classList.add('hidden');
    sectionScreen.classList.add('hidden');
    problemScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');

    const total = allQuestions.length;
    const totalScore = Object.values(sectionScores).reduce(function (s, v) { return s + v.score; }, 0);
    const pct = Math.round(totalScore / total * 100);

    document.getElementById('result-emoji').innerHTML = iconImg(pct >= 80 ? 'finish.svg' : pct >= 60 ? 'happy.svg' : 'thumbup.svg');
    document.getElementById('score-text').textContent = total + '問中 ' + totalScore + '問正解';
    const circle = document.getElementById('score-circle');
    circle.style.setProperty('--value', pct);
    document.getElementById('score-pct').textContent = pct + '%';

    // Section breakdown
    const scoresEl = document.getElementById('section-scores');
    scoresEl.innerHTML = '';
    ['文字・語彙', '文法・読解', '聴解'].forEach(function (s) {
      const v = sectionScores[s];
      if (!v) return;
      const p = Math.round(v.score / v.total * 100);
      const row = document.createElement('div');
      row.className = 'flex justify-between items-center py-1 border-t border-base-200 text-xs';
      row.innerHTML = '<span>' + s + '</span><span class="font-mono">' + v.score + ' / ' + v.total + '（' + p + '%）</span>';
      scoresEl.appendChild(row);
    });

    // Wrong items review
    const wrongReview = document.getElementById('wrong-review');
    const wrongList = document.getElementById('wrong-list');
    if (wrongItems.length > 0) {
      wrongReview.classList.remove('hidden');
      wrongList.innerHTML = '';
      wrongItems.forEach(function (item) {
        const q = item.q;
        const card = document.createElement('div');
        card.className = 'card bg-base-100 border border-error/30 shadow-sm';
        let stemHtml = '';
        if (q.sentence) stemHtml = '<p class="text-xs text-base-content/60 mt-1">' + escapeHtml(q.sentence) + '</p>';
        else if (q.question) stemHtml = '<p class="text-xs text-base-content/60 mt-1">' + escapeHtml(q.question) + '</p>';
        card.innerHTML = '<div class="card-body py-3 px-4 gap-1">' +
          '<span class="text-xs badge badge-ghost">' + q.section + '　' + (PROBLEM_NAMES[q.type] || '') + '</span>' +
          stemHtml +
          '<p class="text-xs text-error mt-1">✗ 你的答案：' + escapeHtml((q.options || q.parts)[item.selected]) + '</p>' +
          '<p class="text-xs text-success">○ 正確答案：' + escapeHtml((q.options || q.parts)[q.answer]) + '</p>' +
          (q.explanation ? '<p class="text-xs text-base-content/60 mt-1">' + escapeHtml(q.explanation) + '</p>' : '') +
          '</div>';
        wrongList.appendChild(card);
      });
    } else {
      wrongReview.classList.add('hidden');
    }

    progressBar.value = 100;
    progressLabel.textContent = '完了！';

    saveProgress(PROGRESS_KEY, {
      lastScore: pct,
      lastTotal: total,
      timestamp: formatDate(new Date()),
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function bindEvents() {
    document.getElementById('btn-start').addEventListener('click', startQuiz);
    document.getElementById('btn-retry').addEventListener('click', startQuiz);
    document.getElementById('btn-section-next').addEventListener('click', function () {
      sectionScreen.classList.add('hidden');
      const q = allQuestions[currentIndex];
      lastShownSection = q.section;
      showProblemScreen(q.type);
    });
    document.getElementById('btn-problem-next').addEventListener('click', function () {
      problemScreen.classList.add('hidden');
      const q = allQuestions[currentIndex];
      lastShownProblem = q.type;
      renderQuestion();
    });
    btnNext.addEventListener('click', nextQuestion);
    btnToSection.addEventListener('click', nextQuestion);
    btnFinish.addEventListener('click', showResult);

    document.addEventListener('keydown', function (e) {
      if (!quizScreen.classList.contains('hidden')) {
        if ((e.key === 'Enter' || e.key === ' ') && answered) {
          e.preventDefault();
          if (!btnFinish.classList.contains('hidden')) showResult();
          else if (!btnToSection.classList.contains('hidden')) nextQuestion();
          else if (!btnNext.classList.contains('hidden')) nextQuestion();
        }
        if (!answered && ['1', '2', '3', '4'].includes(e.key)) {
          const btns = optionsContainer.querySelectorAll('.option-btn');
          const idx = parseInt(e.key, 10) - 1;
          if (btns[idx]) btns[idx].click();
        }
      }
      // Section / problem intro screens
      if (!sectionScreen.classList.contains('hidden') && e.key === 'Enter') {
        document.getElementById('btn-section-next').click();
      }
      if (!problemScreen.classList.contains('hidden') && e.key === 'Enter') {
        document.getElementById('btn-problem-next').click();
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

  function showFetchError() {
    document.getElementById('start-screen').innerHTML =
      '<div class="card-body items-center text-center py-10">' +
      '<div class="text-5xl mb-4">⚠️</div>' +
      '<h2 class="card-title text-xl mb-2">データを読み込めませんでした</h2>' +
      '<p class="text-base-content/60 text-sm mb-4">ローカルサーバーで開いてください。</p>' +
      '<div class="mockup-code text-left text-xs w-full max-w-xs">' +
      '<pre><code>cd src\npython3 -m http.server 8080</code></pre>' +
      '</div>' +
      '<p class="text-base-content/40 text-xs mt-3">→ http://localhost:8080</p>' +
      '</div>';
  }

  init();
})();
