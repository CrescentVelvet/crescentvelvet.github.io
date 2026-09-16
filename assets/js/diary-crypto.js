/* diary-crypto.js — 日志三页共享加密模块（WebCrypto AES-256-GCM + PBKDF2 口令信封）
 *
 * 消费者：_pages/diary_tree.html / enc_reader.html / text_processor.html
 *
 * 格式 v1：
 *   信封 assets/data/key.envelope —— JSON 文本：
 *     { v:1, kdf:"PBKDF2-SHA256", iter:600000,
 *       salt:<b64 16B>, iv:<b64 12B>, ct:<b64 32B DEK 密文 + 16B GCM tag> }
 *   数据文件 assets/data/*.txt —— 单行文本：
 *     DIARYENC1:<b64 iv 12B>:<b64 ciphertext + 16B GCM tag>
 *   索引 assets/data/manifest.enc —— 同数据文件格式（.enc 扩展名不进 window.files）
 *
 * 安全要点：
 *   - PBKDF2-HMAC-SHA256 600000 迭代（OWASP 2023 建议线）
 *   - 每次 encryptData 强制新随机 IV —— GCM 下 IV 重用会灾难性泄露明文
 *   - 口令错误 = GCM tag 校验失败 = decrypt 抛错（替代旧「解析 0 条」启发式）
 *   - DEK 只在页面内存中以 Uint8Array 存在，不落任何存储
 */
(function () {
    'use strict';

    const ENC = new TextEncoder();
    const DEC = new TextDecoder();

    const ITERATIONS = 600000;   // PBKDF2-HMAC-SHA256
    const SALT_LEN = 16;
    const IV_LEN = 12;
    const DEK_LEN = 32;          // AES-256
    const MAGIC = 'DIARYENC1';

    // ── base64 ──
    function b64(buf) {
        const bytes = new Uint8Array(buf);
        let s = '';
        for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
        return btoa(s);
    }
    function unb64(s) {
        const bin = atob(s);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return bytes;
    }

    // ── PBKDF2 口令 → 信封密钥 ──
    async function deriveWrapKey(password, salt, iterations) {
        const baseKey = await crypto.subtle.importKey(
            'raw', ENC.encode(password), 'PBKDF2', false, ['deriveKey']);
        return crypto.subtle.deriveKey(
            { name: 'PBKDF2', hash: 'SHA-256', salt: salt, iterations: iterations },
            baseKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    }

    /** 解信封：口令 → DEK 原始字节（32B，驻内存） */
    async function openEnvelope(password, envelope) {
        const salt = unb64(envelope.salt);
        const key = await deriveWrapKey(password, salt, envelope.iter || ITERATIONS);
        let dekBuf;
        try {
            dekBuf = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: unb64(envelope.iv) }, key, unb64(envelope.ct));
        } catch (e) {
            throw new Error('口令错误或信封损坏');
        }
        return new Uint8Array(dekBuf);
    }

    /** 现有 DEK + 新口令 → 新信封 JSON 文本（初始建站 / rewrap 换口令） */
    async function createEnvelope(dek, password) {
        const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
        const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
        const key = await deriveWrapKey(password, salt, ITERATIONS);
        const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, dek);
        return JSON.stringify({
            v: 1, kdf: 'PBKDF2-SHA256', iter: ITERATIONS,
            salt: b64(salt), iv: b64(iv), ct: b64(ct)
        });
    }

    /** 生成全新 DEK（初始建站 / 深度轮换） */
    function generateDek() {
        return crypto.getRandomValues(new Uint8Array(DEK_LEN));
    }

    /** DEK 字节 → CryptoKey（加解密两用） */
    async function importDek(dek) {
        return crypto.subtle.importKey(
            'raw', dek, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    }

    /** 明文 → "DIARYENC1:iv:ct" 单行文本。每次调用必然新随机 IV。 */
    async function encryptData(dek, plaintext) {
        const key = await importDek(dek);
        const iv = crypto.getRandomValues(new Uint8Array(IV_LEN)); // 强制新 IV，绝不复用
        const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, ENC.encode(plaintext));
        return MAGIC + ':' + b64(iv) + ':' + b64(ct);
    }

    /** "DIARYENC1:iv:ct" → 明文。tag 校验失败抛错（口令错 / 文件损坏 / 被篡改）。 */
    async function decryptData(dek, text) {
        const t = (text || '').trim();
        const parts = t.split(':');
        if (parts.length !== 3 || parts[0] !== MAGIC) throw new Error('不是本站加密格式（DIARYENC1）');
        const key = await importDek(dek);
        const pt = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: unb64(parts[1]) }, key, unb64(parts[2]));
        return DEC.decode(pt);
    }

    /** 探测文本是否为本站新格式（迁移期区分新旧密文用） */
    function isEncryptedText(text) {
        return (text || '').trim().startsWith(MAGIC + ':');
    }

    /** 便捷：fetch url → 文本 */
    async function fetchText(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error('文件读取失败: ' + url);
        return res.text();
    }

    window.DiaryCrypto = {
        ITERATIONS: ITERATIONS,
        MAGIC: MAGIC,
        openEnvelope: openEnvelope,
        createEnvelope: createEnvelope,
        generateDek: generateDek,
        encryptData: encryptData,
        decryptData: decryptData,
        isEncryptedText: isEncryptedText,
        fetchText: fetchText
    };
})();
