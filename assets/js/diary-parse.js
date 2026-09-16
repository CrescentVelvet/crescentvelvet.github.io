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

    return {
        REVIEW_REF_RE: REVIEW_REF_RE,
        extractDateFromText: extractDateFromText,
        classifyEntry: classifyEntry,
        parseDecryptedText: parseDecryptedText
    };
});
