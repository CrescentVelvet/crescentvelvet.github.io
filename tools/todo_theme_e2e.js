#!/usr/bin/env node
/* 待办清单（_pages/todo_list.html）主题与连线回归：零依赖，CDP 直驱本机 Edge/Chrome。
 *
 * 覆盖：
 *  - 五方案切换（主题值 / 节点与连线计数 / defs / aria-pressed / 横向溢出）
 *  - 星图（主题 b）：420 颗背景远星、折线顶点与连线星点坐标一致、根节点 b-meta 动态计数、
 *    叶子无空 b-meta、滚轮缩放时星场整层 transform + 半径反补偿
 *  - localStorage 主题持久化、390px 窄屏无横向溢出、选中节点打开编辑器、根节点折叠
 *  - 421 节点大树：连线 pathLength=1、入场动画结束 dashoffset=0、主题切换耗时记录
 *
 * 约定：屏蔽外部字体（fonts.googleapis/gstatic）；favicon 404 白名单；
 * 错误收集含 Runtime.exceptionThrown / Log.entryAdded / Runtime.consoleAPICalled。
 *
 * 运行：node tools/todo_theme_e2e.js
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const net = require('net');
const { spawn } = require('child_process');

const REPO = path.resolve(__dirname, '..');
const OUT_DIR = path.join(REPO, '.workbuddy', 'tmp');

const BROWSERS = [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium',
];

// ── 合成夹具（不依赖任何真实数据）──
const SMALL_JSON = JSON.stringify({
    title: '全部任务',
    children: [
        { title: '工作', children: [
            { title: '写周报', status: 'doing' },
            { title: '回邮件', status: 'done' },
        ] },
        { title: '生活', status: 'todo' },
    ],
});
function bigJson() {
    const root = { title: '全部任务', children: [] };
    for (let p = 0; p < 20; p++) {
        const parent = { title: '分组' + (p + 1), children: [] };
        for (let l = 0; l < 20; l++) {
            parent.children.push({ title: '任务' + (p + 1) + '-' + (l + 1), status: ['todo', 'doing', 'done', 'dropped'][l % 4] });
        }
        root.children.push(parent);
    }
    return JSON.stringify(root);   // 1 + 20 + 400 = 421 节点，420 条连线
}
const BIG_JSON = bigJson();
let currentFixture = SMALL_JSON;

// ── 静态服务器：页面去 front matter；密文 404 强制走明文夹具 ──
function pageHtml() {
    const raw = fs.readFileSync(path.join(REPO, '_pages', 'todo_list.html'), 'utf8');
    return raw.replace(/^---[\s\S]*?---\r?\n/, '');
}
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json' };
function startServer() {
    const srv = http.createServer((req, res) => {
        const u = decodeURIComponent(req.url.split('?')[0]);
        if (u === '/' || u === '/todo_list.html' || u === '/_pages/todo_list.html') {
            res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' });
            return res.end(pageHtml());
        }
        if (u === '/assets/data/todo_list.json') {
            res.writeHead(200, { 'Content-Type': MIME['.json'], 'Cache-Control': 'no-store' });
            return res.end(currentFixture);
        }
        if (u === '/assets/data/todo_list.enc' || u === '/assets/data/key.envelope') {
            res.writeHead(404); return res.end('404');   // 强制明文模式
        }
        if (u.startsWith('/assets/js/')) {
            const f = path.join(REPO, u);
            if (f.startsWith(REPO) && fs.existsSync(f) && !fs.statSync(f).isDirectory()) {
                res.writeHead(200, { 'Content-Type': MIME['.js'], 'Cache-Control': 'no-store' });
                return res.end(fs.readFileSync(f));
            }
        }
        res.writeHead(404); res.end('404 ' + u);
    });
    return new Promise(r => srv.listen(0, '127.0.0.1', () => r({ srv, port: srv.address().port })));
}

// ── 最小 CDP 客户端（Node >= 22 内置 WebSocket）──
const sleep = ms => new Promise(r => setTimeout(r, ms));
class CDP {
    constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.handlers = new Map(); }
    static async connect(url) {
        const ws = new WebSocket(url);
        await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws error')); });
        const c = new CDP(ws);
        ws.onmessage = ev => {
            const msg = JSON.parse(ev.data);
            if (msg.id && c.pending.has(msg.id)) {
                const p = c.pending.get(msg.id);
                c.pending.delete(msg.id);
                msg.error ? p.rej(new Error(msg.method + ' ' + JSON.stringify(msg.error))) : p.res(msg.result);
            } else if (msg.method) {
                (c.handlers.get(msg.method) || []).forEach(h => h(msg.params));
            }
        };
        return c;
    }
    on(method, fn) {
        if (!this.handlers.has(method)) this.handlers.set(method, []);
        this.handlers.get(method).push(fn);
    }
    send(method, params = {}) {
        const id = ++this.id;
        this.ws.send(JSON.stringify({ id, method, params }));
        return new Promise((res, rej) => {
            this.pending.set(id, { res, rej });
            setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); rej(new Error('timeout: ' + method)); } }, 60000);
        });
    }
}
async function launchBrowser() {
    const exe = BROWSERS.find(p => fs.existsSync(p));
    if (!exe) throw new Error('找不到 Edge/Chrome 可执行文件');
    const port = await new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
    const proc = spawn(exe, [
        '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
        '--disable-extensions', '--mute-audio', '--window-size=1280,900',
        '--user-data-dir=' + fs.mkdtempSync(path.join(os.tmpdir(), 'todo-e2e-')),
        '--remote-debugging-port=' + port, 'about:blank',
    ], { stdio: 'ignore' });
    let targets = null;
    for (let i = 0; i < 100; i++) {
        try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; }
        catch (e) { await sleep(200); }
    }
    if (!targets) throw new Error('无法连接浏览器 DevTools');
    const page = targets.find(t => t.type === 'page');
    const cdp = await CDP.connect(page.webSocketDebuggerUrl);
    return { proc, cdp };
}

// ── 断言辅助 ──
let failures = 0;
const notes = [];
function check(name, cond, detail) {
    if (cond) console.log('  OK   ' + name);
    else { failures++; console.log('  FAIL ' + name + (detail ? '  -> ' + detail : '')); }
}

// 折线顶点与连线星点坐标一致性（页面内执行，limit=抽样条数，0=全部）
const VERTEX_EXPR = `(function (limit) {
    let links = [...document.querySelectorAll('path.link[data-constellation]')];
    if (limit > 0) links = links.slice(0, limit);
    let bad = 0, total = 0;
    for (const path of links) {
        const to = path.getAttribute('data-to-id');
        const verts = path.getAttribute('d').split(/[ML]\\s+/).slice(1).map(p => p.trim().split(/\\s+/).map(Number));
        const mids = verts.slice(1, -1);
        const rs = [...path.parentNode.querySelectorAll('.b-route-star[data-to-id="' + to + '"]')];
        rs.sort((a, b) => (+a.getAttribute('data-route-index')) - (+b.getAttribute('data-route-index')));
        if (rs.length !== mids.length) { bad++; continue; }
        rs.forEach((star, i) => {
            const m = /translate\\(([-0-9.]+),([-0-9.]+)\\)/.exec(star.getAttribute('transform') || '');
            total++;
            if (!m || Math.abs(+m[1] - mids[i][0]) > 0.2 || Math.abs(+m[2] - mids[i][1]) > 0.2) bad++;
        });
    }
    return { bad, total, links: links.length };
})`;

(async () => {
    const { srv, port } = await startServer();
    const { proc, cdp } = await launchBrowser();
    const errors = [];
    cdp.on('Runtime.exceptionThrown', p => errors.push('exception: ' + ((p.exceptionDetails.exception && p.exceptionDetails.exception.description) || p.exceptionDetails.text)));
    cdp.on('Log.entryAdded', p => {
        const e = p.entry;
        if (e.level === 'error' && !/favicon|Failed to load resource|ERR_BLOCKED_BY_CLIENT/.test(e.text || '')) errors.push('log: ' + e.text);
    });
    cdp.on('Runtime.consoleAPICalled', p => {
        if (p.type !== 'error') return;
        const text = p.args.map(a => (a.value !== undefined ? a.value : a.description)).join(' ');
        if (/favicon|Failed to load resource|ERR_BLOCKED_BY_CLIENT/.test(text)) return;
        errors.push('console.error: ' + text);
    });
    await cdp.send('Runtime.enable');
    await cdp.send('Log.enable');
    await cdp.send('Page.enable');
    await cdp.send('Network.enable');
    await cdp.send('Network.setBlockedURLs', { urls: ['*fonts.googleapis.com*', '*fonts.gstatic.com*'] });

    const evalJs = async (expr) => {
        const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true });
        if (r.exceptionDetails) throw new Error('evaluate: ' + (r.exceptionDetails.text || '') + ' :: ' + expr.slice(0, 100));
        return r.result.value;
    };
    const waitFor = async (expr, label, timeout) => {
        const t0 = Date.now();
        while (Date.now() - t0 < (timeout || 15000)) {
            try { if (await evalJs(expr)) return; } catch (e) { /* 导航期间上下文重建，继续等 */ }
            await sleep(120);
        }
        throw new Error('waitFor 超时: ' + label);
    };
    const clickTheme = (theme) => evalJs(`document.querySelector('[data-theme-choice="${theme}"]').click()`);

    try {
        // ── 小夹具：五方案切换 ──
        await cdp.send('Page.navigate', { url: `http://127.0.0.1:${port}/todo_list.html` });
        await waitFor(`document.querySelectorAll('.bubble').length === 5`, '小夹具渲染');
        await waitFor(`document.querySelector('svg.mindmap').classList.contains('ready')`, 'ready');

        for (const theme of ['a', 'b', 'c', 'd', 'original']) {
            await clickTheme(theme);
            await sleep(250);
            const s = await evalJs(`({
                theme: document.body.dataset.theme,
                nodes: document.querySelectorAll('.bubble').length,
                links: document.querySelectorAll('.link').length,
                defs: document.querySelectorAll('#mindmap defs').length,
                pressed: document.querySelector('[data-theme-choice="' + document.body.dataset.theme + '"]').getAttribute('aria-pressed'),
                overflowX: document.documentElement.scrollWidth > window.innerWidth
            })`);
            check(`主题 ${theme} 切换`, s.theme === theme && s.nodes === 5 && s.links === 4 && s.defs === 1 && s.pressed === 'true' && !s.overflowX, JSON.stringify(s));
        }

        // ── 星图专项 ──
        await clickTheme('b');
        await sleep(300);
        const b = await evalJs(`({
            linkCount: document.querySelectorAll('path.link[data-constellation]').length,
            rootMeta: (document.querySelector('.bubble.root').parentNode.querySelector(':scope > .b-meta') || {}).textContent,
            parentMetas: [...document.querySelectorAll('.node.parent')].filter(n => !n.querySelector(':scope > .bubble.root')).map(n => n.querySelector(':scope > .b-meta').textContent),
            leafMeta: document.querySelectorAll('.node.leaf .b-meta').length,
            bgStars: document.querySelectorAll('.b-bg-star').length,
            noR: [...document.querySelectorAll('.b-bg-star')].filter(c => !(+c.getAttribute('r') > 0)).length,
            nodeStars: document.querySelectorAll('.b-node-star').length,
            layerTransform: document.querySelector('.b-space-layer').getAttribute('transform')
        })`);
        check('星图星座连线数量', b.linkCount === 4, 'links=' + b.linkCount);
        check('根节点 b-meta 动态计数 PLAN / 5 STARS', b.rootMeta === 'PLAN / 5 STARS', b.rootMeta);
        check('父节点 SECTOR 标记', b.parentMetas.length === 1 && b.parentMetas[0] === 'SECTOR 01', JSON.stringify(b.parentMetas));
        check('叶子无空 b-meta', b.leafMeta === 0, 'leafMeta=' + b.leafMeta);
        check('背景远星 420 颗且均有 r', b.bgStars === 420 && b.noR === 0, `stars=${b.bgStars} noR=${b.noR}`);
        check('节点星 5 颗', b.nodeStars === 5, 'nodeStars=' + b.nodeStars);
        check('星场层 transform 已建立', /translate\(/.test(b.layerTransform || '') && /scale\(/.test(b.layerTransform || ''), String(b.layerTransform));

        const vSmall = await evalJs(VERTEX_EXPR + '(0)');
        check('折线顶点与连线星点一致', vSmall.bad === 0 && vSmall.total > 0, JSON.stringify(vSmall));

        const starIn = await evalJs(`(() => {
            let outside = 0;
            document.querySelectorAll('.b-node-star').forEach(st => {
                const rect = st.parentNode.querySelector(':scope > rect.bubble');
                if (!rect) return;
                const m = /translate\\(([-0-9.]+)/.exec(st.getAttribute('transform') || 'translate(0)');
                const sx = +m[1];
                const rx = +rect.getAttribute('x'), rw = +rect.getAttribute('width');
                if (sx < rx - 0.5 || sx > rx + rw + 0.5) outside++;
            });
            return outside;
        })()`);
        check('节点星在 pill 内', starIn === 0, 'outside=' + starIn);

        // ── 滚轮缩放：整层 transform + 半径反补偿（s = 1+(zoom-1)*0.045）──
        const viewOf = `(() => {
            const star = document.querySelector('.b-bg-star');
            return { r: +star.getAttribute('r'), base: +star.getAttribute('data-radius'),
                w: +document.getElementById('mindmap').getAttribute('viewBox').split(' ')[2],
                transform: document.querySelector('.b-space-layer').getAttribute('transform') };
        })()`;
        const before = await evalJs(viewOf);
        await cdp.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 640, y: 450, deltaX: 0, deltaY: -240 });
        await sleep(300);
        const after = await evalJs(viewOf);
        const s1 = 1 + (before.w / after.w - 1) * 0.045;   // 初始 zoom=1
        check('缩放后星场 transform 更新', after.transform !== before.transform, after.transform);
        check('星点半径反补偿 r=base/s', Math.abs(after.r - after.base / s1) < 0.01,
            `r=${after.r} 期望~${(after.base / s1).toFixed(4)} (s=${s1.toFixed(4)})`);
        check('星点位置由层 transform 承载', after.transform.indexOf('scale(' + s1.toFixed(4) + ')') >= 0, after.transform);

        // ── localStorage 持久化 ──
        await clickTheme('d');
        await sleep(200);
        await cdp.send('Page.reload', {});
        await waitFor(`document.body.dataset.theme === 'd' && document.querySelectorAll('.bubble').length === 5`, '主题持久化');
        check('reload 后主题持久化为 d', true);

        // ── 交互：选中打开编辑器、根节点折叠 ──
        await evalJs(`document.querySelector('.bubble.root').dispatchEvent(new MouseEvent('click', { bubbles: true }))`);
        await sleep(120);
        const it = await evalJs(`({
            selected: !!document.querySelector('.node.selected'),
            collapsed: document.querySelector('.bubble.root').closest('.node').classList.contains('collapsed'),
            editorShown: document.getElementById('editor').style.display !== 'none'
        })`);
        check('选中根节点：编辑器打开并折叠', it.selected && it.collapsed && it.editorShown, JSON.stringify(it));
        await evalJs(`document.querySelector('.bubble.root').dispatchEvent(new MouseEvent('click', { bubbles: true }))`);
        await sleep(120);
        check('再次点击展开', await evalJs(`!document.querySelector('.bubble.root').closest('.node').classList.contains('collapsed')`));

        // ── 390px 窄屏 ──
        await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
        await sleep(150);
        for (const theme of ['original', 'a', 'b', 'c', 'd']) {
            await clickTheme(theme);
            await sleep(150);
            check(`390px 主题 ${theme} 无横向溢出`, !(await evalJs(`document.documentElement.scrollWidth > window.innerWidth`)));
        }
        await cdp.send('Emulation.clearDeviceMetricsOverride');

        // ── 421 节点大树 ──
        currentFixture = BIG_JSON;
        await cdp.send('Page.navigate', { url: `http://127.0.0.1:${port}/todo_list.html` });
        await waitFor(`document.querySelectorAll('.bubble').length === 421`, '大夹具渲染', 20000);
        const switchMs = await evalJs(`(() => {
            const t0 = performance.now();
            document.querySelector('[data-theme-choice="b"]').click();
            return performance.now() - t0;
        })()`);
        await waitFor(`document.querySelectorAll('.link').length === 420 && document.querySelector('svg.mindmap').classList.contains('ready')`, '大树 ready', 20000);
        await sleep(900);   // dashoffset 过渡 .7s
        const big = await evalJs(`(() => {
            const paths = [...document.querySelectorAll('path.link')];
            const layer = document.querySelector('.b-space-layer');
            return {
                nodes: document.querySelectorAll('.bubble').length,
                links: paths.length,
                bad: paths.filter(p => p.getAttribute('pathLength') !== '1' || getComputedStyle(p).strokeDashoffset !== '0px').length,
                rootMeta: (document.querySelector('.bubble.root').parentNode.querySelector(':scope > .b-meta') || {}).textContent,
                bgStars: document.querySelectorAll('.b-bg-star').length,
                transform: layer ? layer.getAttribute('transform') : null
            };
        })()`);
        check('421 节点 / 420 连线', big.nodes === 421 && big.links === 420, JSON.stringify({ nodes: big.nodes, links: big.links }));
        check('连线 pathLength=1 且入场动画完成', big.bad === 0, 'bad=' + big.bad);
        check('大树根节点 b-meta 动态计数 PLAN / 421 STARS', big.rootMeta === 'PLAN / 421 STARS', big.rootMeta);
        check('大树星场 420 颗且有 transform', big.bgStars === 420 && /scale\(/.test(big.transform || ''), `stars=${big.bgStars}`);
        const vBig = await evalJs(VERTEX_EXPR + '(80)');
        check('大树折线顶点与连线星点一致（抽样 80 条）', vBig.bad === 0, JSON.stringify(vBig));
        notes.push(`大树切到主题 b 同步耗时 ${switchMs.toFixed(0)}ms`);

        check('页面错误为 0', errors.length === 0, errors.slice(0, 3).join(' | '));
    } catch (e) {
        failures++;
        console.log('  FAIL 运行异常: ' + (e && e.stack || e));
        try {
            fs.mkdirSync(OUT_DIR, { recursive: true });
            const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(OUT_DIR, 'todo_theme_e2e_fail.png'), Buffer.from(shot.data, 'base64'));
            console.log('  失败截图已保存到 .workbuddy/tmp/todo_theme_e2e_fail.png');
        } catch (_) { /* 截图失败不掩盖原始错误 */ }
    } finally {
        try { proc.kill(); } catch (_) {}
        srv.close();
    }

    notes.forEach(n => console.log('  note ' + n));
    console.log(failures === 0 ? 'ALL PASS' : `FAILURES: ${failures}`);
    process.exit(failures ? 1 : 0);
})();
