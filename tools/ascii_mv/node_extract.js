// 从 Jekyll 构建产物提取 frameAt(t) 完整网格（字符+色号）：Node + DOM 桩，无需浏览器
// 用法: node node_extract.js <输出.json> <时刻t>
// 环境变量（均有默认值，换歌时按需覆盖）：
//   AMV_ROOT   仓库根目录（默认 C:/code/crescentvelvet.github.io）
//   AMV_URL    页面地址（默认 http://127.0.0.1:4000/ascii_mv.html）
//   AMV_DATA   逗号分隔的数据脚本（相对 AMV_ROOT），须设置 window.__LYRICS/__SPECTRUM
//              （默认 assets/data/ascii_mv/lyrics.js,assets/data/ascii_mv/spectrum.js）
//   AMV_TITLE  title 接管窗口 "a,b"（默认 15.8,29.709）；"-" 表示无 title 窗口
const http = require('http');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = process.env.AMV_ROOT || 'C:/code/crescentvelvet.github.io';
const URL_ = process.env.AMV_URL || 'http://127.0.0.1:4000/ascii_mv.html';
const DATA = (process.env.AMV_DATA || 'assets/data/ascii_mv/lyrics.js,assets/data/ascii_mv/spectrum.js').split(',');
const TITLE = (process.env.AMV_TITLE === undefined ? '15.8,29.709' : process.env.AMV_TITLE).split(',').map(parseFloat);

function fetch(url) {
  return new Promise((res, rej) => {
    http.get(url, r => { let b = ''; r.on('data', c => b += c); r.on('end', () => res(b)); }).on('error', rej);
  });
}

(async () => {
  const html = await fetch(URL_);
  const scripts = [];
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    if (!/type\s*=\s*["']?(application|text\/(?!javascript|js))/.test(m[0]) && m[1].includes('__amv'))
      scripts.push(m[1]);
  }
  const main = scripts.join('\n;\n');
  if (!main.includes('__amv')) throw new Error('main script not found in built page');

  const t = parseFloat(process.argv[3]);
  if (!isFinite(t)) throw new Error('need t');

  function mkCtx2d() {
    return { fillStyle: '', font: '', textBaseline: '',
      fillRect() {}, drawImage() {}, fillText() {},
      measureText() { return { width: 0 }; } };
  }
  function mkCanvas() { return { width: 0, height: 0, getContext() { return mkCtx2d(); } }; }
  function mkEl() { return { textContent: '', style: {}, addEventListener() {}, getContext() { return mkCtx2d(); }, appendChild() {} }; }

  const win = {};
  const sandbox = {
    console, Math, JSON, String, Number, Array, Object, Boolean, Error,
    parseFloat, parseInt, isFinite, isNaN, URLSearchParams,
    setTimeout() {}, clearTimeout() {},
    window: win,
    document: {
      getElementById() { return mkEl(); },
      createElement() { return mkCanvas(); },
      addEventListener() {}
    },
    location: { search: '?t=' + t },
    requestAnimationFrame() {}
  };
  win.window = win;
  vm.createContext(sandbox);

  for (const f of DATA) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    vm.runInContext(src, sandbox, { filename: f });
  }
  if (!win.__LYRICS || !win.__SPECTRUM) throw new Error('data scripts did not set window.__LYRICS/__SPECTRUM');
  vm.runInContext(main, sandbox, { filename: 'ascii_mv.inline.js' });

  const inTitle = !isNaN(TITLE[0]) && t >= TITLE[0] && t < TITLE[1];
  const result = vm.runInContext(`(function(){
    // title 窗口内 tick 直接画 takeover 进 __amv.grid；其余走 frameAt 全帧
    var g = ${inTitle} ? window.__amv.grid : window.__amv.frameAt(${t});
    var c = g;
    var plain = [], styles = [];
    for (var y = 0; y < c.h; y++) {
      var pc = '', ps = '';
      for (var x = 0; x < c.w; x++) {
        var cell = c.cells[y][x];
        pc += cell[0] === '' ? ' ' : cell[0];
        ps += String(cell[1]);
      }
      plain.push(pc); styles.push(ps);
    }
    return JSON.stringify({ plain: plain, styles: styles });
  })()`, sandbox);
  fs.writeFileSync(process.argv[2], result);
  console.log('saved', process.argv[2]);
})().catch(e => { console.error('ERR', e && e.message || e); process.exit(1); });
