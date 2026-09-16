/* migrate_parse.js — 旧密文解出后的解析与 manifest 聚合
 * 口径与 _pages/diary_tree.html 的 parseDecryptedText / classifyEntry /
 * extractDateFromText / getMonthStats / getDayStats 逐字对齐（2026-09-16 核对）。
 * 改动任何一处前先同步页面端。
 */
'use strict';

// 与 diary_tree.html REVIEW_REF_RE 相同
const REVIEW_REF_RE = /^\s*（?\s*\d{4}[.\/\-]\d{1,2}[.\/\-]\d{1,2}\s*回顾/;

function extractDateFromText(text) {
    if (REVIEW_REF_RE.test(text)) return null;
    const m = text.match(/^\s*(20\d{2})[-\/. ](\d{1,2})[-\/. ](\d{1,2})\b/);
    if (m) {
        const year = parseInt(m[1]), month = parseInt(m[2]), day = parseInt(m[3]);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return { year, month, day, suffix: text.slice(m.index + m[0].length).trim() };
        }
    }
    return null;
}

function classifyEntry(text) {
    if (/闲情逸致/.test(text)) return 'leisure';
    if (/梦幻空花/.test(text)) return 'dream';
    if (/做视频想法/.test(text)) return 'video';
    if (/回顾/.test(text)) return 'review';
    return 'normal';
}

function parseDecryptedText(text, sourceFile) {
    // 与页面端一致：HTML 包裹时提取 <p> 内容
    const isHtml = /<\/?p[\s>]/.test(text);
    let plainText = text;
    if (isHtml) {
        const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
        const parts = [];
        let m;
        while ((m = pRegex.exec(text)) !== null) parts.push(m[1]);
        plainText = parts.join('\n');
    }

    const entries = [];
    const lines = plainText.split(/\r?\n/);
    let currentDate = null;
    let currentTextLines = [];

    for (const line of lines) {
        const dateMatch = extractDateFromText(line);
        if (dateMatch) {
            if (currentDate && currentTextLines.length > 0) {
                const body = currentTextLines.join('\n').trim();
                if (body) {
                    entries.push({
                        year: currentDate.year, month: currentDate.month, day: currentDate.day,
                        text: body,
                        wordCount: body.replace(/\s/g, '').length,
                        paraCount: body.split(/\n{2,}/).filter(p => p.trim()).length,
                        category: classifyEntry(body),
                        source: sourceFile
                    });
                }
            }
            currentDate = { year: dateMatch.year, month: dateMatch.month, day: dateMatch.day };
            currentTextLines = [];
            if (dateMatch.suffix) currentTextLines.push(dateMatch.suffix);
        } else if (currentDate) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.includes('撤回了一条消息')) {
                currentTextLines.push(line);
            }
        }
    }
    // 收尾（与页面端 857-871 相同）
    if (currentDate && currentTextLines.length > 0) {
        const body = currentTextLines.join('\n').trim();
        if (body) {
            entries.push({
                year: currentDate.year, month: currentDate.month, day: currentDate.day,
                text: body,
                wordCount: body.replace(/\s/g, '').length,
                paraCount: body.split(/\n{2,}/).filter(p => p.trim()).length,
                category: classifyEntry(body),
                source: sourceFile
            });
        }
    }
    return entries;
}

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
 * 纯聚合，不含任何正文/首句。首句摘要由 enc_reader 编辑导出时另行更新（含正文）。
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
