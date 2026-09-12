/* 页面右下角（可配置）"最后修改时间"角标
 * 用法：<script src="/assets/js/last-updated.js" data-corner="bottom-right"></script>
 * data-corner 可选：bottom-right(默认) / bottom-left / top-right / top-left
 * 时间来源：document.lastModified（服务器返回的文件修改时间，与各游戏页一致）
 */
(function () {
    var raw = document.lastModified; // 形如 "09/12/2026 16:37:19"
    var m = raw.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
    var text = '最后修改时间: ' + (m ? m[3] + '-' + m[1] + '-' + m[2] + ' ' + m[4] + ':' + m[5] : raw);

    var pos = { bottom: '8px', right: '8px' };
    var corner = (document.currentScript && document.currentScript.getAttribute('data-corner')) || 'bottom-right';
    if (corner === 'bottom-left') pos = { bottom: '8px', left: '8px' };
    else if (corner === 'top-right') pos = { top: '8px', right: '8px' };
    else if (corner === 'top-left') pos = { top: '8px', left: '8px' };

    var el = document.createElement('div');
    el.id = 'page-last-modified';
    el.textContent = text;
    el.style.cssText =
        'position:fixed;z-index:900;' +
        'font:12px/1.4 "Microsoft YaHei","PingFang SC",Arial,sans-serif;' +
        'color:#eee;background:rgba(0,0,0,0.55);' +
        'padding:3px 10px;border-radius:6px;' +
        'pointer-events:none;white-space:nowrap;' +
        Object.keys(pos).map(function (k) { return k + ':' + pos[k]; }).join(';');
    document.body.appendChild(el);
})();
