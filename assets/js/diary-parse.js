/* diary-parse.js — 日志正文解析器（三页共享，与原 diary_tree 内联实现逐字对齐）
 *
 * 消费者：_pages/diary_tree.html / enc_reader.html / text_processor.html / tools/migrate_parse.js
 *
 * 语义（2026-09-16 定案，改动前先读 _design/diary_tree_redesign.md）：
 *   - 输入是 enc_reader 导出的 HTML（<p> 段落）或纯文本；<p> 内容按行拼接
 *   - 日期头：行首 YYYY-MM-DD / YYYY/M/D / YYYY.M.D；「（YYYY.M.D回顾」是未来回顾
 *     引用行，不是日期头（REVIEW_REF_RE 优先判定，防止拆条目）
 *   - 「撤回了一条消息」行丢弃
 *   - 分类：闲情逸致 > 梦幻空花 > 做视频想法 > 回顾 > normal
 *   - wordCount = 去空白字符数；paraCount = 空行分段数
 *
 * 双端：浏览器挂 window.DiaryParse；Node（migrate 工具/测试）走 module.exports。
 */
(function (root, factory) {
    const api = factory();
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;                    // Node / tools
    } else {
        root.DiaryParse = api;                   // 浏览器
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // 「未来回顾」引用行：可选「（」+ 日期 + 「回顾」。它指向未来日期但写在当天，
    // 绝不能当日期头解析（会拆条目），渲染层要用它标回顾色。
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
        // 解密文本可能是 HTML（enc_reader 导出）或纯文本：HTML 时提取 <p> 内容
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
        // 收尾条目
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

    /* 条目列表 → manifest 聚合（enc_reader/text_processor 编辑后增量更新索引用）。
     * 口径与 tools/migrate_parse.js 的 buildManifest 严格一致：
     *   months['YYYY-MM'] = { entries, words, paras, days }
     *   days['YYYY-MM-DD'] = [ {w,p,c}, ... ]（按条目出现顺序）
     * 返回 { years, maxDayWords, months, days }（v 字段由调用方补）。 */
    function aggregateEntries(entries) {
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
        return { years: [...years].sort((a, b) => a - b), maxDayWords, months, days };
    }

    /* 单月内容并入 manifest（原地改，返回条目数）。enc_reader / text_processor 共用。
     * - 清掉文件名月份的旧聚合（月键 + 该月所有日键），再并入新内容聚合
     * - 新内容若被编辑改到其它月份（跨月改名），其它月的月键/日键同样并入，
     *   years / maxDayWords 全局重算 —— 比只并文件名月更正确
     * - manifestData 传 null 时初始化空骨架（v:1） */
    function mergeMonthIntoManifest(manifestData, file, htmlContent) {
        const mk = file.replace(/\.txt$/, '');
        const entries = parseDecryptedText(htmlContent, file);
        const agg = aggregateEntries(entries);
        if (!manifestData) manifestData = { v: 1, years: [], maxDayWords: 0, months: {}, days: {} };
        if (!manifestData.months) manifestData.months = {};
        if (!manifestData.days) manifestData.days = {};
        // 清掉该月的旧聚合（月键 + 该月所有日键）
        delete manifestData.months[mk];
        for (const dk of Object.keys(manifestData.days)) {
            if (dk.startsWith(mk + '-')) delete manifestData.days[dk];
        }
        // 并入新内容的所有月键（正常单月内容 = 只有 mk 本身）
        for (const k of Object.keys(agg.months)) manifestData.months[k] = agg.months[k];
        for (const dk of Object.keys(agg.days)) manifestData.days[dk] = agg.days[dk];
        // 全局字段重算（years / maxDayWords）
        manifestData.years = Object.keys(manifestData.months)
            .map(k => Number(k.slice(0, 4))).sort((a, b) => a - b);
        let maxW = 0;
        for (const dk in manifestData.days) {
            const w = manifestData.days[dk].reduce((s, x) => s + x.w, 0);
            if (w > maxW) maxW = w;
        }
        manifestData.maxDayWords = maxW;
        return entries.length;
    }

    return {
        REVIEW_REF_RE: REVIEW_REF_RE,
        extractDateFromText: extractDateFromText,
        classifyEntry: classifyEntry,
        parseDecryptedText: parseDecryptedText,
        aggregateEntries: aggregateEntries,
        mergeMonthIntoManifest: mergeMonthIntoManifest
    };
});
