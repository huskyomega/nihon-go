/**
 * utils.js — 共用工具函式
 */

/**
 * 從 JSON 檔案載入資料
 * @param {string} url - JSON 檔案路徑
 * @returns {Promise<any>}
 */
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`無法載入資料：${url}（${res.status}）`);
  return res.json();
}

/**
 * 儲存進度到 localStorage
 * @param {string} key - localStorage key
 * @param {object} data - 要儲存的資料
 */
function saveProgress(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('[utils] 無法儲存進度：', e);
  }
}

/**
 * 從 localStorage 讀取進度
 * @param {string} key - localStorage key
 * @returns {object|null}
 */
function loadProgress(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('[utils] 無法讀取進度：', e);
    return null;
  }
}

/**
 * 清除指定進度
 * @param {string} key - localStorage key
 */
function clearProgress(key) {
  localStorage.removeItem(key);
}

/**
 * Fisher-Yates 洗牌演算法
 * @param {Array} arr - 要打亂的陣列（不修改原陣列）
 * @returns {Array} 打亂後的新陣列
 */
function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 將日文單字 + 讀音轉換為 <ruby> 標註 HTML
 * @param {string} word - 日文單字（可含漢字）
 * @param {string} reading - 假名讀音（完整讀音，如有複數用第一個）
 * @returns {string} HTML 字串
 */
function toRuby(word, reading) {
  if (!word) return '';
  const kana = reading ? reading.split('・')[0] : '';
  if (!kana) return word;

  function isKanji(ch) {
    const c = ch.charCodeAt(0);
    return (c >= 0x4E00 && c <= 0x9FFF) ||
           (c >= 0x3400 && c <= 0x4DBF) ||
           (c >= 0xF900 && c <= 0xFAFF);
  }

  // 將單字切成「漢字段」與「假名段」交替的片段陣列
  const segs = [];
  let buf = '', bufKanji = null;
  for (const ch of word) {
    const k = isKanji(ch);
    if (bufKanji === null) { buf = ch; bufKanji = k; }
    else if (k === bufKanji) { buf += ch; }
    else { segs.push({ text: buf, kanji: bufKanji }); buf = ch; bufKanji = k; }
  }
  if (buf) segs.push({ text: buf, kanji: bufKanji });

  // 無漢字則直接返回原字
  if (!segs.some(function (s) { return s.kanji; })) return word;

  let result = '';
  let rPos = 0;

  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    if (!seg.kanji) {
      result += seg.text;
      rPos += seg.text.length;
    } else {
      // 找下一個非漢字段，以確定此漢字段對應讀音的結束位置
      let nextKana = null;
      for (let j = i + 1; j < segs.length; j++) {
        if (!segs[j].kanji) { nextKana = segs[j]; break; }
      }
      let furigana;
      if (!nextKana) {
        furigana = kana.slice(rPos);
        rPos = kana.length;
      } else {
        const idx = kana.indexOf(nextKana.text, rPos);
        if (idx < 0) {
          furigana = kana.slice(rPos);
          rPos = kana.length;
        } else {
          furigana = kana.slice(rPos, idx);
          rPos = idx;
        }
      }
      result += '<ruby>' + seg.text + '<rt>' + furigana + '</rt></ruby>';
    }
  }
  return result;
}

/**
 * 防抖函式
 * @param {Function} fn
 * @param {number} delay - 毫秒
 * @returns {Function}
 */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * 格式化日期為 YYYY-MM-DD
 * @param {Date} [date=new Date()]
 * @returns {string}
 */
function formatDate(date) {
  const d = date || new Date();
  return d.toISOString().slice(0, 10);
}
