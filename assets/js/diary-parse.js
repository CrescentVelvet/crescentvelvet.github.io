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

    /* 判断是否本子文件（非 YYYY-MM.txt 命名的跨月文件，如 随笔本/总结本/评估本）。 */
    function isBookFile(file) {
        return !/^\d{4}-\d{2}\.txt$/.test(file);
    }

    /* 单月内容并入 manifest（原地改，返回条目数）。enc_reader / text_processor 共用。
     * - manifestData 传 null 时初始化空骨架（v:1）
     * - 所有条目统一带 s:'文件名'（阅读端按 (s, 顺序) 定位回填；清旧按 s 过滤幂等），
     *   manifest.books 记录所有文件→覆盖月列表（老月文件内容跨月是常态，不限本子），
     *   months 从 days 重建（混合来源天然正确） */
    function mergeMonthIntoManifest(manifestData, file, htmlContent) {
        const entries = parseDecryptedText(htmlContent, file);
        const agg = aggregateEntries(entries);
        if (!manifestData) manifestData = { v: 1, years: [], maxDayWords: 0, months: {}, days: {} };
        if (!manifestData.months) manifestData.months = {};
        if (!manifestData.days) manifestData.days = {};
        if (!manifestData.books) manifestData.books = {};
        // ── 清旧聚合：全 manifest 范围内清掉 s===file 的旧条目 ──
        // （统一 s 标记：月文件跨月编辑时旧条目可能飘到任意日键，按来源过滤最准；
        //   幂等天然成立：清掉再 push 同内容 = 不变）
        for (const dk of Object.keys(manifestData.days)) {
            const kept = manifestData.days[dk].filter(it => it.s !== file);
            if (kept.length !== manifestData.days[dk].length) manifestData.days[dk] = kept;
            if (!manifestData.days[dk].length) delete manifestData.days[dk];   // 清空的日键删掉
        }
        // ── 并入新内容 ──
        // 所有条目统一带 s:'文件名'（阅读端按 (s, 顺序) 定位回填；清旧按 s 过滤幂等）。
        for (const dk of Object.keys(agg.days)) {
            if (!manifestData.days[dk]) manifestData.days[dk] = [];
            for (const it of agg.days[dk]) manifestData.days[dk].push({ w: it.w, p: it.p, c: it.c, s: file });
        }
        manifestData.books[file] = Object.keys(agg.months).sort();
        // ── 全局重算（months 从 days 重建，混合来源天然正确）──
        recalcManifest(manifestData);
        return entries.length;
    }

    /* months / years / maxDayWords 从 days 全量重算（merge 后调用）。 */
    function recalcManifest(manifestData) {
        manifestData.months = {};
        for (const dk of Object.keys(manifestData.days)) {
            const mk = dk.slice(0, 7);
            if (!manifestData.months[mk]) manifestData.months[mk] = { entries: 0, words: 0, paras: 0, days: 0 };
            const mo = manifestData.months[mk];
            mo.days++;
            for (const it of manifestData.days[dk]) {
                mo.entries++; mo.words += it.w; mo.paras += it.p;
            }
        }
        manifestData.years = Object.keys(manifestData.months)
            .map(k => Number(k.slice(0, 4))).sort((a, b) => a - b);
        let maxW = 0;
        for (const dk in manifestData.days) {
            const w = manifestData.days[dk].reduce((s, x) => s + x.w, 0);
            if (w > maxW) maxW = w;
        }
        manifestData.maxDayWords = maxW;
    }

    return {
        REVIEW_REF_RE: REVIEW_REF_RE,
        extractDateFromText: extractDateFromText,
        classifyEntry: classifyEntry,
        parseDecryptedText: parseDecryptedText,
        aggregateEntries: aggregateEntries,
        isBookFile: isBookFile,
        recalcManifest: recalcManifest,
        mergeMonthIntoManifest: mergeMonthIntoManifest
    };
});
