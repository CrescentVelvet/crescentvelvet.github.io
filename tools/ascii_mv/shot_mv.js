/* B 站/网页 MV 参考帧截屏 v2（零依赖 CDP）
 * v1 教训：clip 到「播放器容器 rect」仍会带入侧边栏/底栏/弹幕（容器实测≈整个页面内容区）。
 * v2 方案：把 <video> 用 position:fixed 拽出播放器容器、铺满整个视口——
 *   弹幕层/字幕层/侧边栏/底栏全部留在容器里被视频盖住，截图即纯画面。
 * 用法: node shot_mv.js [stepSeconds] [outSubdir]
 *   环境变量 AMV_TIMES="83,84,85" 可指定加密时间点（缺省按 step 全曲扫描）。
 *   环境变量 AMV_URL、AMV_ROOT、AMV_EDGE 可复用到其他 MV 页面。
 * 产出: <AMV_ROOT>/.workbuddy/tmp/amv_mobile/<outSubdir>/*.png + meta.json
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = process.env.AMV_ROOT || path.resolve(__dirname, '../..');
const EDGE = process.env.AMV_EDGE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const TMP = path.join(ROOT, '.workbuddy/tmp/amv_mobile');
const STEP = parseFloat(process.argv[2] || '4');
const SUB = process.argv[3] || 'frames';
const OUT = path.join(TMP, SUB);
const URL = process.env.AMV_URL || 'https://www.bilibili.com/video/BV1C9b76cEks';
const VW = 1280, VH = 720;   // 视口 = 视频画面（640x360 源，2x 显示）

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const dbg = 9233 + Math.floor(Math.random() * 500);
  const profile = path.join(TMP, 'profile_mv_' + Date.now());
  const browser = spawn(EDGE, [
    '--headless=new', '--disable-gpu', '--enable-unsafe-swiftshader',
    `--user-data-dir=${profile}`, `--remote-debugging-port=${dbg}`,
    '--no-first-run', '--hide-scrollbars', `--window-size=${VW},${VH}`,
    '--autoplay-policy=no-user-gesture-required',
  ], { stdio: 'ignore' });

  let ws, mid = 0; const pending = new Map(); const events = [];
  function send(method, params, sessionId) {
    return new Promise((res) => {
      const id = ++mid;
      pending.set(id, res);
      ws.send(JSON.stringify({ id, method, params: params || {}, sessionId }));
    });
  }
  async function ev(expr, S) {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }, S);
    if (r.result && r.result.exceptionDetails) throw new Error('eval: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 300));
    return r.result && r.result.result ? r.result.result.value : undefined;
  }
  function drainErrors() {
    const out = [];
    for (const e of events) {
      if (e.method === 'Runtime.exceptionThrown') out.push(JSON.stringify(e.params.exceptionDetails).slice(0, 200));
      if (e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error')
        out.push('console.error: ' + JSON.stringify(e.params.args).slice(0, 200));
    }
    events.length = 0;
    return out;
  }

  const log = [];
  try {
    let wsUrl = null;
    for (let i = 0; i < 60; i++) {
      try {
        const v = await (await fetch(`http://127.0.0.1:${dbg}/json/version`)).json();
        wsUrl = v.webSocketDebuggerUrl; break;
      } catch (e) { await sleep(250); }
    }
    if (!wsUrl) throw new Error('CDP not reachable');
    ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    ws.onmessage = (m) => {
      const d = JSON.parse(m.data);
      if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
      else if (d.method) events.push(d);
    };

    const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
    const { result: { sessionId: S } } = await send('Target.attachToTarget', { targetId, flatten: true });
    await send('Runtime.enable', {}, S);
    await send('Page.enable', {}, S);
    await send('Emulation.setDeviceMetricsOverride', { width: VW, height: VH, deviceScaleFactor: 1, mobile: false }, S);

    log.push('navigating ' + URL);
    await send('Page.navigate', { url: URL }, S);

    // 等 video 就绪（最多 45s，防反爬验证页）
    let info = null;
    for (let i = 0; i < 90; i++) {
      await sleep(500);
      info = await ev(`(function(){
        var v = document.querySelector('video');
        if (!v) return { has: false, title: document.title.slice(0, 60), url: location.href.slice(0, 80) };
        return { has: true, rs: v.readyState, dur: v.duration, w: v.videoWidth, h: v.videoHeight,
                 paused: v.paused, title: document.title.slice(0, 60) };
      })()`, S);
      if (info.has && info.rs >= 2 && isFinite(info.dur)) break;
      if (i % 10 === 0) log.push('wait video i=' + i + ' ' + JSON.stringify(info));
    }
    log.push('video info: ' + JSON.stringify(info));
    if (!info || !info.has || !isFinite(info.dur || NaN)) {
      fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify({ fail: true, log }, null, 2));
      console.log('FAIL no video. log:\n' + log.join('\n'));
      process.exit(1);
    }

    // v2 核心：video 拽出容器铺满视口；弹幕/字幕/控件选择器仍双保险隐藏
    const detach = await ev(`(function(){
      var st = document.createElement('style');
      st.textContent = [
        '.bpx-player-control-wrap', '.bpx-player-top-mask', '.bpx-player-bottom-mask',
        '.bpx-player-watermark', '.bpx-player-dm-wrap', '.bpx-player-dm',
        '.bpx-player-state-wrap', '.bpx-player-ending-panel', '.bpx-player-advp-control-wrap',
        '.bpx-player-top-wrap', '.bpx-player-subtitle-wrap', '.bpx-player-high-energy',
        '.bpx-player-popup', '.bpx-player-feedback', '.bpx-player-video-pause-panel',
        '.bpx-player-sending-area', '.bili-mini-close', '.bpx-player-shadow',
        '.bpx-player-gradient-mask', '.bpx-player-contextmenu', '.bpx-player-dialog',
        '.bpx-player-toast', '.bpx-player-tip', '.bpx-player-poster',
        '.bili-danmaku-tips', '.bili-dm', '.danmaku-item', '.dm-item',
        '.bpx-player-subtitle-panel', '.bpx-player-subtitle-text', '.subtitle-item',
        // 顶栏/底栏：display:none 直接从绘制树移除，不受堆叠上下文影响
        // ⚠️ 只点名已知安全的 class，勿用 #app > div:not(...) 这类宽匹配（会误杀播放器祖先）
        '#biliMainHeader', '.bili-header', '.bili-header__bar', '.m-header',
        '#internationalHeader', '.international-header', '.bili-footer',
        // 登录/风控弹窗：页面本体之外的遮罩不应进入参考帧
        '.bili-mini-login', '.bili-login-mask', '.login-panel', '.login-dialog',
        '.bili-dialog', '.bili-modal', '[class*="login-modal"]', '[class*="login-panel"]'
      ].join(',') + '{ display:none !important; }';
      document.head.appendChild(st);
      var v = document.querySelector('video');
      if (!v) return 'no-video';
      v.style.setProperty('position', 'fixed', 'important');
      v.style.setProperty('left', '0px', 'important');
      v.style.setProperty('top', '0px', 'important');
      v.style.setProperty('width', '${VW}px', 'important');
      v.style.setProperty('height', '${VH}px', 'important');
      v.style.setProperty('z-index', '2147483647', 'important');
      v.style.setProperty('object-fit', 'fill', 'important');
      v.style.setProperty('background', '#000', 'important');
      document.documentElement.style.setProperty('overflow', 'hidden', 'important');
      document.body.style.setProperty('overflow', 'hidden', 'important');
      return 'detached';
    })()`, S);
    log.push('detach: ' + detach);
    await sleep(600);

    // 验证 video 现在确实铺满视口
    const vrect = JSON.parse(await ev(`JSON.stringify((function(){
      var v=document.querySelector('video'); var r=v.getBoundingClientRect();
      return {x:r.x,y:r.y,width:r.width,height:r.height}; })())`, S));
    log.push('video rect after detach: ' + JSON.stringify(vrect));

    const meta = { url: URL, title: info.title, duration: info.dur, videoW: info.w, videoH: info.h, vrect, step: STEP, shots: [] };
    let times;
    if (process.env.AMV_TIMES) {
      times = process.env.AMV_TIMES.split(',').map(s => parseFloat(s)).filter(t => isFinite(t));
    } else {
      times = [];
      for (let t = 1; t < info.dur - 0.5; t += STEP) times.push(Math.round(t * 10) / 10);
    }
    for (const t of times) {
      await ev(`new Promise(function(res){
        var v = document.querySelector('video');
        v.addEventListener('seeked', function h(){ v.removeEventListener('seeked', h); setTimeout(res, 150); }, { once: true });
        v.currentTime = ${t};
        setTimeout(res, 2500);
      })`, S);
      await sleep(250);
      const shot = await send('Page.captureScreenshot', { format: 'png' }, S);
      if (!shot.result || !shot.result.data) { log.push('shot fail t=' + t); continue; }
      const fn = 't' + String(t).replace('.', '_') + '.png';
      fs.writeFileSync(path.join(OUT, fn), Buffer.from(shot.result.data, 'base64'));
      meta.shots.push({ t, fn });
      process.stdout.write('.');
    }
    fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 2));
    console.log('\nOK shots=' + meta.shots.length + ' dur=' + info.dur + ' vrect=' + JSON.stringify(vrect));
    const errs = drainErrors();
    if (errs.length) console.log('JS errors (head 3): ' + errs.slice(0, 3).join(' | '));
  } catch (e) {
    console.log('EXCEPTION: ' + e.message + '\nlog:\n' + log.join('\n'));
    process.exitCode = 1;
  } finally {
    try { browser.kill('SIGKILL'); } catch (_) {}
    setTimeout(() => process.exit(process.exitCode || 0), 500);
  }
})();
