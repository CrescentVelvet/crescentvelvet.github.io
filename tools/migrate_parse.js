/* migrate_parse.js — 旧密文解出后的解析与 manifest 聚合（薄壳）
 * 解析器本体已抽到 /assets/js/diary-parse.js（三页 + 工具共享同一份），
 * 本文件只保留 Node 侧 re-export 与 buildManifest（manifest 是迁移/写入端
 * 工具的职责，浏览器页面不解密 manifest 结构以外的聚合逻辑）。
 */
'use strict';

const DiaryParse = require('../assets/js/diary-parse.js');
const { parseDecryptedText, classifyEntry, extractDateFromText } = DiaryParse;

function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

/* manifest 结构（加密前的明文 JSON）：
 * {
 *   v: 1,
 *   years: [2005, 2013, ...],
 *   maxDayWords: <全局单日合计字数最大值>,   // 页面 scaleAxis 分母 = maxDayWords * 0.35
 *   months: { "2005-07": { entries: N, words: N, paras: N, days: N } },
 *   days: { "2005-07-15": [ {w,p,c}, ... ] }  // 每日条目数组：w=字数 p=段落数 c=分类
 * }
 * 纯聚合，不含任何正文/首句。
 */
function buildManifest(entries) {
    const years = new Set();
    const months = {};
    const days = {};
    let maxDayWords = 0;

    for (const e of entries) {
        years.add(e.year);
        const mk = `${e.year}-${String(e.month).padStart(2, '0')}`;
        const dk = `${mk}-${String(e.day).padStart(2, '0')}`;
        if (!months[mk]) months[mk] = { entries: 0, words: 0, paras: 0, days: 0 };
        const mo = months[mk];
        mo.entries++; mo.words += e.wordCount; mo.paras += e.paraCount;
        if (!days[dk]) { days[dk] = []; mo.days++; }
        days[dk].push({ w: e.wordCount, p: e.paraCount, c: e.category });
    }
    for (const dk in days) {
        const w = days[dk].reduce((s, x) => s + x.w, 0);
        if (w > maxDayWords) maxDayWords = w;
    }
    return { v: 1, years: [...years].sort((a, b) => a - b), maxDayWords, months, days };
}

module.exports = { parseDecryptedText, classifyEntry, extractDateFromText, buildManifest, daysInMonth };
