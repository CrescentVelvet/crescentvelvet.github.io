#!/usr/bin/env node
/* tools/encrypt_todo.js — 把 assets/data/todo_list.json 加密为 assets/data/todo_list.enc
 *
 * 为什么需要这个脚本：页面里的「加密迁移」按钮导出的是**页面当前渲染的数据**，
 * 而线上 todo_list.json 可能落后于你本地未提交的改动。本脚本直接读磁盘上的权威
 * 文件，保证密文内容 = 你本地最新数据。
 *
 * 加密格式与 assets/js/diary-crypto.js 完全一致（DIARYENC1 单行密文 + AES-256-GCM
 * 信封），口令与日志三页共用同一个 assets/data/key.envelope。
 *
 * 用法：
 *   node tools/encrypt_todo.js          交互输入口令，写出 todo_list.enc
 *   node tools/encrypt_todo.js --dry    只验证口令能否解开信封，不写任何文件
 *
 * 不碰 git：是否删除明文 / 如何提交由使用者决定。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { webcrypto } = require('crypto');

const ROOT = path.resolve(__dirname, '..');
// 路径可用环境变量覆盖，便于用测试信封做端到端验证（正常使用无需设置）
const ENVELOPE = process.env.TODO_ENVELOPE || path.join(ROOT, 'assets', 'data', 'key.envelope');
const PLAIN = process.env.TODO_PLAIN || path.join(ROOT, 'assets', 'data', 'todo_list.json');
const ENC_OUT = process.env.TODO_ENC_OUT || path.join(ROOT, 'assets', 'data', 'todo_list.enc');

const MAGIC = 'DIARYENC1';
const ITER = 600000;      // 与 diary-crypto.js 保持一致：PBKDF2-HMAC-SHA256
const SALT_LEN = 16;
const IV_LEN = 12;

const ENC = new TextEncoder();
const DEC = new TextDecoder();
const b64e = (u8) => Buffer.from(u8).toString('base64');
const b64d = (s) => new Uint8Array(Buffer.from(s, 'base64'));

async function deriveWrapKey(password, salt, iterations) {
    const base = await webcrypto.subtle.importKey(
        'raw', ENC.encode(password), 'PBKDF2', false, ['deriveKey']);
    return webcrypto.subtle.deriveKey(
        { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
        base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

async function openEnvelope(password, env) {
    const key = await deriveWrapKey(password, b64d(env.salt), env.iter || ITER);
    const dek = await webcrypto.subtle.decrypt(
        { name: 'AES-GCM', iv: b64d(env.iv) }, key, b64d(env.ct));
    return new Uint8Array(dek);
}

async function encryptData(dek, plaintext) {
    const key = await webcrypto.subtle.importKey(
        'raw', dek, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    const iv = webcrypto.getRandomValues(new Uint8Array(IV_LEN));   // 每次必然新 IV
    const ct = await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, ENC.encode(plaintext));
    return MAGIC + ':' + b64e(iv) + ':' + b64e(ct);
}

async function decryptData(dek, text) {
    const parts = String(text).trim().split(':');
    if (parts.length !== 3 || parts[0] !== MAGIC) throw new Error('不是本站加密格式');
    const key = await webcrypto.subtle.importKey(
        'raw', dek, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const pt = await webcrypto.subtle.decrypt(
        { name: 'AES-GCM', iv: b64d(parts[1]) }, key, b64d(parts[2]));
    return DEC.decode(pt);
}

function askPassword() {
    return new Promise((resolve) => {
        const stdin = process.stdin;
        if (!stdin.isTTY) {                       // 管道/重定向：按行读
            let buf = '';
            stdin.setEncoding('utf8');
            stdin.on('data', (d) => { buf += d; });
            stdin.on('end', () => resolve(buf.trim()));
            return;
        }
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding('utf8');
        let buf = '';
        const done = () => {
            stdin.removeListener('data', onData);
            stdin.setRawMode(false);
            stdin.pause();
            process.stdout.write('\n');
            resolve(buf);
        };
        const onData = (ch) => {
            if (ch === '\r' || ch === '\n' || ch === '\u0004') done();
            else if (ch === '\u0003') { process.stdout.write('\n'); process.exit(130); }
            else if (ch === '\u007f' || ch === '\b') buf = buf.slice(0, -1);
            else if (ch >= ' ') buf += ch;
        };
        stdin.on('data', onData);
    });
}

async function main() {
    const dry = process.argv.includes('--dry');
    for (const f of [ENVELOPE, PLAIN]) {
        if (!fs.existsSync(f)) { console.error('缺少文件：' + path.relative(ROOT, f)); process.exit(1); }
    }
    const env = JSON.parse(fs.readFileSync(ENVELOPE, 'utf8'));
    console.log(`信封：${path.relative(ROOT, ENVELOPE)}  v${env.v} ${env.kdf} iter=${env.iter}`);
    console.log(`明文：${path.relative(ROOT, PLAIN)}  ${fs.statSync(PLAIN).size} 字节`);

    process.stdout.write('请输入口令（与日志页相同，不回显）：');
    const pass = await askPassword();
    if (!pass) { console.error('未输入口令，已中止'); process.exit(1); }

    let dek;
    try {
        dek = await openEnvelope(pass, env);
    } catch (e) {
        console.error('口令错误（或信封文件损坏），已中止');
        process.exit(1);
    }
    console.log('信封解开 ✓');
    if (dry) { console.log('--dry：未写任何文件'); return; }

    const plain = fs.readFileSync(PLAIN, 'utf8');
    const ct = await encryptData(dek, plain);
    const back = await decryptData(dek, ct);         // 自校验：回读必须与原文逐字相同
    if (back !== plain) {
        console.error('自校验失败：解密回读与原文不一致，未写文件');
        process.exit(1);
    }
    fs.writeFileSync(ENC_OUT, ct, 'utf8');
    console.log('自校验通过 ✓（解密回读与原文逐字一致）');
    console.log(`已写出 ${path.relative(ROOT, ENC_OUT)}：密文 ${ct.length} 字节 ← 明文 ${Buffer.byteLength(plain)} 字节`);
    console.log('\n下一步：把 todo_list.enc 交给你（含 git 提交）—— 明文 todo_list.json 将不再被版本控制跟踪。');
}

main().catch((e) => { console.error('失败：' + ((e && e.stack) || e)); process.exit(2); });
