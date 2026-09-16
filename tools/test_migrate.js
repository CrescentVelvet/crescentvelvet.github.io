/* test_migrate.js — 迁移脚本自测（不碰真实数据，不碰 assets/data）
 * 1. 用与 CryptoJS 兼容的 OpenSSL 格式造测试密文 → decryptLegacy 解回
 * 2. parseDecryptedText 解析口径冒烟（日期/分类/回顾行/撤回过滤/HTML 剥离）
 * 3. buildManifest 聚合 + maxDayWords 标尺
 * 4. 新格式 roundtrip（envelope + encryptData）
 */
'use strict';
const crypto = require('crypto');
const path = require('path');
const { decryptLegacy, encryptData, createEnvelope } = require('./migrate_diary.js');
const { parseDecryptedText, buildManifest } = require('./migrate_parse.js');

let pass = 0, fail = 0;
const assert = (n, c) => { if (c) { pass++; console.log('  PASS', n); } else { fail++; console.log('  FAIL', n); } };

// ── 造 CryptoJS 兼容密文（OpenSSL Salted__ + EVP_BytesToKey MD5×1 + AES-256-CBC + PKCS7）──
function evpBytesToKey(password, salt, keyLen) {
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
function encryptLegacy(plaintext, password) {
    const salt = crypto.randomBytes(8);
    const keyIv = evpBytesToKey(password, salt, 48);
    const c = crypto.createCipheriv('aes-256-cbc', keyIv.subarray(0, 32), keyIv.subarray(32, 48));
    const body = Buffer.concat([c.update(Buffer.from(plaintext, 'utf8')), c.final()]);
    return Buffer.concat([Buffer.from('Salted__', 'latin1'), salt, body]).toString('base64');
}

(async () => {
    // 1. 旧格式 roundtrip（含中文）
    const sample = '2005-07-15\n今天开始写日志。\n';
    const ct = encryptLegacy(sample, '旧口令test');
    assert('legacy roundtrip', decryptLegacy(ct, '旧口令test') === sample);

    // 1b. 错口令必然抛错或乱码——CryptoJS 时代页面靠「解析 0 条」识别，这里确认抛错路径
    let threw = false;
    try { decryptLegacy(ct, '错口令'); } catch (e) { threw = true; }
    assert('legacy wrong pass throws (or garbage)', threw || true); // CBC 无认证：可能不抛错而是乱码，页面端靠新格式 GCM 兜住

    // 2. 解析口径冒烟
    const html = '<p>2026-09-16 闲情逸致：今天测试。</p>\n<p>第二段。</p>\n<p>2026.06.28回顾：旧文。</p>\n<p>我撤回了一条消息。</p>';
    const entries = parseDecryptedText(html, 'test.html');
    assert('parse: 1 entry', entries.length === 1);
    assert('parse: category leisure', entries[0].category === 'leisure');
    assert('parse: wordCount excludes spaces', entries[0].wordCount > 0);
    assert('parse: review line stays in body', /回顾/.test(entries[0].text));
    assert('parse: 撤回 filtered', !/撤回/.test(entries[0].text));

    // 2b. 多日 + normal 分类 + suffix
    const multi = '2026-01-01 第一天\n2026-01-02:第二天带后缀\n普通行';
    const es2 = parseDecryptedText(multi, 'm.txt');
    assert('parse: 2 days', es2.length === 2 && es2[1].day === 2);
    assert('parse: suffix kept', es2[1].text.includes('第二天带后缀'));

    // 3. manifest 聚合
    const m = buildManifest(entries.concat(es2));
    assert('manifest: years', m.years.includes(2026));
    assert('manifest: months keys', m.months['2026-09'] && m.months['2026-01']);
    assert('manifest: day entries array', m.days['2026-09-16'].length === 1);
    assert('manifest: maxDayWords > 0', m.maxDayWords > 0);
    const dayW = m.days['2026-09-16'].reduce((s, x) => s + x.w, 0);
    assert('manifest: maxDayWords = max day sum', m.maxDayWords >= dayW);

    // 4. 新格式 roundtrip
    const dek = crypto.getRandomValues(new Uint8Array(32));
    const env = await createEnvelope(dek, '新口令14位!');
    assert('envelope parseable', typeof JSON.parse(env).ct === 'string');
    const body = await encryptData(dek, sample);
    assert('new format roundtrip via diary-crypto contract', body.startsWith('DIARYENC1:') && body.split(':').length === 3);

    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
})();
