---
permalink: /
title: "网页"
excerpt: "关于"
author_profile: false
redirect_from: 
  - /about/
  - /about.html
---
<!DOCTYPE html>
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

    # 欢迎来到我的网站

    <!-- Jekyll 默认会依据 _pages 目录里的 Markdown 文件生成对应的 HTML 文件，若 chat.md 在 _pages 目录下，通常生成的页面路径是 /chat.html -->

    点击下面的链接可以体验大模型对话功能。

    [大模型对话](/chat.html)

    ***

    点击下面的链接可以体验
    <!-- # 三维人脸风格化可控编辑 -->

    <!-- 这是一张金克斯的风格图像<br>
    ![00033](/img/00033.jpg){:height="100px" width="100px"}

    使用jojoGAN-2d生成许多张不同风格的图像<br>
    ![00034](/img/00034.jpg){:height="100px" width="100px"}
    ![00035](/img/00035.jpg){:height="100px" width="100px"}
    ![10001](/img/10001.jpg){:height="100px" width="100px"}
    ![10002](/img/10002.jpg){:height="100px" width="100px"}

    这是一张迪士尼公主的风格图像<br>
    ![01000](/img/01000.jpg){:height="100px" width="100px"}

    使用jojoGAN-2d生成许多张不同风格的图像<br>
    ![01001](/img/01001.jpg){:height="100px" width="100px"}
    ![01002](/img/01002.jpg){:height="100px" width="100px"}
    ![01003](/img/01003.jpg){:height="100px" width="100px"}
    ![01004](/img/01004.jpg){:height="100px" width="100px"} -->

    强调一下**几个单词**

    >引用内容

    分割线

    ***

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

