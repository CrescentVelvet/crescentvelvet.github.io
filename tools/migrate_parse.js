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
 *   days: { "2005-07-15": [ {w,p,c,s}, ... ] }  // 每日条目数组：w=字数 p=段落数 c=分类 s=来源文件名
 *   books: { "随笔本.txt": ["2013-06","2018-09",...] }  // 所有文件 → 覆盖月列表（含跨月的老月文件）
 * }
 * 纯聚合，不含任何正文/首句。s 统一标记所有条目来源（阅读端按 (s,顺序) 回填正文；
 * merge 清旧按 s 过滤，幂等）。months 从 days 重建（混合来源天然正确）。
 */
function buildManifest(entries) {
    const years = new Set();
    const days = {};
    const bookSets = {};

    for (const e of entries) {
        years.add(e.year);
        const mk = `${e.year}-${String(e.month).padStart(2, '0')}`;
        const dk = `${mk}-${String(e.day).padStart(2, '0')}`;
        if (!days[dk]) days[dk] = [];
        days[dk].push({ w: e.wordCount, p: e.paraCount, c: e.category, s: e.source });
        // books 记录所有文件的覆盖月（不限本子）——老月文件内容跨月是常态，
        // 阅读端 monthSources 直接反查 days.s，books 作为冗余加速索引一并全量记录。
        if (!bookSets[e.source]) bookSets[e.source] = new Set();
        bookSets[e.source].add(mk);
    }
    const books = {};
    for (const bk of Object.keys(bookSets)) books[bk] = [...bookSets[bk]].sort();

    // months / maxDayWords 从 days 重建（与 diary-parse.js recalcManifest 同口径）
    const months = {};
    for (const dk of Object.keys(days)) {
        const mk = dk.slice(0, 7);
        if (!months[mk]) months[mk] = { entries: 0, words: 0, paras: 0, days: 0 };
        const mo = months[mk];
        mo.days++;
        for (const it of days[dk]) {
            mo.entries++; mo.words += it.w; mo.paras += it.p;
        }
    }
    let maxDayWords = 0;
    for (const dk in days) {
        const w = days[dk].reduce((s, x) => s + x.w, 0);
        if (w > maxDayWords) maxDayWords = w;
    }
    return { v: 1, years: [...years].sort((a, b) => a - b), maxDayWords, months, days, books };
}

module.exports = { parseDecryptedText, classifyEntry, extractDateFromText, buildManifest, daysInMonth };
