---
permalink: /
title: "网页"
excerpt: "关于"
author_profile: false
redirect_from: 
  - /about/
  - /about.html
---
<!-- <!DOCTYPE html> -->
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>欢迎来到我的网站</title>
    <style>
        /* 水波纹容器样式 */
        #ripple-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        }

        /* 水波纹样式 */
        .ripple {
            position: absolute;
            border-radius: 50%;
            background-color: rgba(0, 0, 0, 0.1);
            width: 0;
            height: 0;
            transform: translate(-50%, -50%); /* 使水波纹中心位于点击位置 */
            animation: rippleEffect 1s ease-out;
        }

        /* 水波纹动画 */
        @keyframes rippleEffect {
            to {
                width: 200px; /* 最终扩散大小，可按需调整 */
                height: 200px;
                opacity: 0;
            }
        }
    </style>
</head>
<body>
    <div id="ripple-container"></div>
    <h1>欢迎来到我的网站</h1>
    <p>点击下面的链接可以体验大模型对话功能。</p>
    <p><a href="/chat.html">大模型对话</a></p>
    <hr>
    <p>点击下面的链接可以体验</p>
    <p>强调一下<strong>几个单词</strong></p>
    <blockquote>引用内容</blockquote>
    <p>分割线</p>
    <hr>
    <script>
        const rippleContainer = document.getElementById('ripple-container');

        // 鼠标点击事件处理函数
        function createRipple(event) {
            const ripple = document.createElement('div');
            ripple.classList.add('ripple');

            // 设置水波纹位置
            const x = event.clientX;
            const y = event.clientY;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            // 添加水波纹元素到容器
            rippleContainer.appendChild(ripple);

            // 动画结束后移除水波纹元素
            ripple.addEventListener('animationend', () => {
                ripple.remove();
            });
        }

        // 监听鼠标点击事件
        document.addEventListener('click', createRipple);

        // 监听触摸屏点击事件
        document.addEventListener('touchstart', (event) => {
            const touch = event.touches[0];
            createRipple(touch);
        }, { passive: true });
    </script>
</body>
</html>

