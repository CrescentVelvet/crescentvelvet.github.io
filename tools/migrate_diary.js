#!/usr/bin/env node
/* migrate_diary.js — 一次性迁移：CryptoJS OpenSSL 格式 → DIARYENC1（WebCrypto AES-256-GCM）
 *
 * 用法：
 *   node tools/migrate_diary.js <旧口令> <新口令> [--data=assets/data] [--apply]
 *
 * 干跑（默认）：解密全部旧 .txt → 统计校验 → 报告将写入的文件，不动磁盘。
 * --apply：真正写入。产物：
 *   assets/data/<同名>.txt      新格式 DIARYENC1:iv:ct（覆盖原文件）
 *   assets/data/key.envelope    新口令信封（JSON 文本）
 *   assets/data/manifest.enc    聚合索引（DIARYENC1 格式）
 *
 * 安全：
 *   - 新 DEK 随机生成；口令不落盘、不进 argv 日志（argv 由 shell 保留，跑完建议清 history）
 *   - 旧格式用 EvpKDF(MD5,1) 解密——只为读旧数据，新数据全部走新 KDF
 *   - manifest 统计口径与 _pages/diary_tree.html parseDecryptedText 逐字对齐
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ITER = 600000, IV_LEN = 12, MAGIC = 'DIARYENC1';
const b64 = buf => Buffer.from(buf).toString('base64');
const unb64 = s => new Uint8Array(Buffer.from(s, 'base64'));

// ── 旧格式解密（CryptoJS 兼容：OpenSSL Salted__ + EVP_BytesToKey MD5×1 + AES-256-CBC）──
function evpBytesToKey(password, salt, keyLen) {
    // EVP_BytesToKey(MD5, 1 iter): D_i = MD5(D_{i-1} || password || salt)，结果=所有 D_i 拼接
    let prev = Buffer.alloc(0);
    const chunks = [];
    let derived = Buffer.alloc(0);
    while (derived.length < keyLen) {
        prev = crypto.createHash('md5').update(Buffer.concat([prev, Buffer.from(password, 'utf8'), salt])).digest();
        chunks.push(prev);
        derived = Buffer.concat(chunks);
    }
    return derived.subarray(0, keyLen);
}
function decryptLegacy(ciphertextB64, password) {
    const raw = Buffer.from(ciphertextB64.replace(/\s+/g, ''), 'base64');
    if (raw.length < 32 || raw.subarray(0, 8).toString('latin1') !== 'Salted__') {
        throw new Error('不是 OpenSSL Salted 格式');
    }
    const salt = raw.subarray(8, 16);
    const body = raw.subarray(16);
    const keyIv = evpBytesToKey(password, salt, 48); // 32B key + 16B iv
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyIv.subarray(0, 32), keyIv.subarray(32, 48));
    const pt = Buffer.concat([decipher.update(body), decipher.final()]);
    return pt.toString('utf8');
}

// ── 新格式加密（与 assets/js/diary-crypto.js 完全同构）──
async function encryptData(dek, plaintext) {
    const key = await crypto.subtle.importKey('raw', dek, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
    const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, Buffer.from(plaintext, 'utf8'));
    return MAGIC + ':' + b64(iv) + ':' + b64(ct);
}
async function createEnvelope(dek, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
    const base = await crypto.subtle.importKey('raw', Buffer.from(password, 'utf8'), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITER },
        base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, dek);
    return JSON.stringify({ v: 1, kdf: 'PBKDF2-SHA256', iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) });
}

// ── 新格式解密（与 assets/js/diary-crypto.js 同构，测试/验证用）──
async function decryptData(dek, text) {
    const t = (text || '').trim();
    const parts = t.split(':');
    if (parts.length !== 3 || parts[0] !== MAGIC) throw new Error('不是本站加密格式（DIARYENC1）');
    const key = await crypto.subtle.importKey('raw', dek, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const pt = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: unb64(parts[1]) }, key, unb64(parts[2]));
    return Buffer.from(pt).toString('utf8');
}
async function openEnvelope(password, envelope) {
    const salt = unb64(envelope.salt);
    const base = await crypto.subtle.importKey('raw', Buffer.from(password, 'utf8'), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: envelope.iter || ITER },
        base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const dekBuf = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: unb64(envelope.iv) }, key, unb64(envelope.ct));
    return new Uint8Array(dekBuf);
}

module.exports = { decryptLegacy, encryptData, createEnvelope, decryptData, openEnvelope, evpBytesToKey };

// ── 直接运行时执行迁移主流程 ──
if (require.main === module) {
    (async () => {
        const args = process.argv.slice(2);
        const apply = args.includes('--apply');
        const dataArg = (args.find(a => a.startsWith('--data=')) || '--data=assets/data').split('=')[1];
        const [oldPass, newPass] = args.filter(a => !a.startsWith('--'));
        if (!oldPass || !newPass) {
            console.error('用法: node tools/migrate_diary.js <旧口令> <新口令> [--data=assets/data] [--apply]');
            process.exit(1);
        }
        const dataDir = path.resolve(__dirname, '..', dataArg);
        const files = fs.readdirSync(dataDir)
            .filter(f => f.endsWith('.txt'))
            .filter(f => {
                // 已迁移的（DIARYENC1 开头）跳过，幂等重跑
                const head = fs.readFileSync(path.join(dataDir, f), 'utf8').slice(0, 12);
                return !head.startsWith(MAGIC);
            })
            .sort();
        if (files.length === 0) { console.log('没有待迁移的旧格式文件（可能已迁移过）。'); process.exit(0); }

        console.log(`待迁移 ${files.length} 个文件（${apply ? 'APPLY 模式' : '干跑，不写盘'}）`);

        // ── 解密 + 解析（口径 = diary_tree parseDecryptedText）──
        const parse = require('./migrate_parse.js');
        const allEntries = [];
        const newBodies = new Map(); // file → 新密文
        const dek = crypto.getRandomValues(new Uint8Array(32));
        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            process.stdout.write(`\r[${i + 1}/${files.length}] ${f}`);
            const ct = fs.readFileSync(path.join(dataDir, f), 'utf8');
            let pt;
            try {
                pt = decryptLegacy(ct, oldPass);
            } catch (e) {
                console.error(`\n✗ ${f} 解密失败（口令错误？）: ${e.message}`);
                process.exit(1);
            }
            allEntries.push(...parse.parseDecryptedText(pt, f));
            newBodies.set(f, await encryptData(dek, pt));
        }
        console.log('');

        const stats = parse.buildManifest(allEntries);
        const manifestEnc = await encryptData(dek, JSON.stringify(stats));
        const envelope = await createEnvelope(dek, newPass);

        // ── 报告 ──
        const dayCount = Object.values(stats.days).length;
        console.log(`解析: ${allEntries.length} 条 / ${dayCount} 天 / ${stats.years.length} 年 [${stats.years[0]}–${stats.years[stats.years.length - 1]}]`);
        console.log(`全局单日最大字数(标尺分母基数): ${stats.maxDayWords}`);
        const manifestBytes = Buffer.byteLength(manifestEnc, 'utf8');
        console.log(`将写入: ${files.length} 个 .txt（覆盖）+ key.envelope(${envelope.length}B) + manifest.enc(${manifestBytes}B)`);

        if (!apply) {
            console.log('\n干跑完成。加 --apply 真正写入。');
            return;
        }

        // ── 写入 ──
        for (const [f, body] of newBodies) fs.writeFileSync(path.join(dataDir, f), body, 'utf8');
        fs.writeFileSync(path.join(dataDir, 'key.envelope'), envelope, 'utf8');
        fs.writeFileSync(path.join(dataDir, 'manifest.enc'), manifestEnc, 'utf8');
        console.log(`\n✓ 已写入 ${dataDir}（${files.length + 2} 个文件）`);
        console.log('⚠ 下一步：改造三页解密逻辑后再验证站点；旧口令从此作废。');
    })().catch(e => { console.error(e); process.exit(1); });
}

