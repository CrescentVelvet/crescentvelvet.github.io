---
layout: default
permalink: /chat.html
title: "聊天页面"
---

<div id="main-container">
  <!-- 历史记录栏 -->
  <div id="history-sidebar">
    <h3>历史记录</h3>
    <div id="history-list"></div>
    <button id="clear-all-history">清除全部历史</button>
  </div>
  <!-- 聊天主区域 -->
  <div id="chat-main">
    <div id="chat-container">
      <!-- 大模型选择下拉菜单 -->
      <select id="model-select">
        <option value="Qwen/Qwen2.5-72B-Instruct" selected>Qwen2.5-72B-Instruct</option>
        <option value="Pro/deepseek-ai/DeepSeek-V3">Pro/deepseek-ai/DeepSeek-V3</option>
      </select>
      <!-- 对话消息显示区域 -->
      <div id="chat-messages"></div>
      <!-- 输入框 -->
      <input type="text" id="user-input" placeholder="输入你的问题...">
      <!-- 发送按钮 -->
      <button id="send-button">发送</button>
      <!-- 清除当前会话历史记录按钮 -->
      <button id="clear-history">清除当前会话</button>
    </div>
  </div>
</div>

<script>
  // 获取 DOM 元素
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');
  const modelSelect = document.getElementById('model-select');
  const clearHistoryButton = document.getElementById('clear-history');
  const historyList = document.getElementById('history-list');
  const clearAllHistoryButton = document.getElementById('clear-all-history');

  let currentChatId = Date.now();
  let chatSessions = JSON.parse(localStorage.getItem('chatSessions')) || {};

  // 加载历史记录
  function loadHistory() {
    historyList.innerHTML = '';
    Object.entries(chatSessions).forEach(([chatId, session]) => {
      const historyItem = document.createElement('div');
      historyItem.classList.add('history-item');
      historyItem.dataset.chatId = chatId;
      historyItem.innerHTML = `
        <h4>${session.title}</h4>
        <p>${new Date(chatId).toLocaleString()}</p>
      `;
      historyItem.addEventListener('click', () => loadSession(chatId));
      historyList.appendChild(historyItem);
    });
  }

  // 加载会话
  function loadSession(chatId) {
    currentChatId = chatId;
    chatMessages.innerHTML = chatSessions[chatId].messages;
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // 保存当前会话
  function saveSession() {
    const title = chatSessions[currentChatId]?.title || generateTitle();
    chatSessions[currentChatId] = {
      title,
      messages: chatMessages.innerHTML
    };
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    loadHistory();
  }

  // 生成会话标题
  function generateTitle() {
    const userMessages = Array.from(chatMessages.querySelectorAll('.user'));
    if (userMessages.length > 0) {
      const firstMessage = userMessages[0].textContent;
      return firstMessage.substring(0, 20) + (firstMessage.length > 20 ? '...' : '');
    }
    return '新会话';
  }

  // 发送消息函数
  function sendMessage() {
    const message = userInput.value;
    if (message.trim() === '') return;

    console.log('准备发送消息:', message); // 添加日志

    // 显示用户消息
    appendMessage('user', message);

    const selectedModel = modelSelect.value; // 获取选中的模型

    console.log('选中的模型:', selectedModel); // 添加日志

    fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-uaqwrwlwdbconrtgnybuseuzrejvjjymexblmbeedimdrncl'
      },
      body: JSON.stringify({
        // 使用选中的模型
        model: selectedModel,
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      })
    })
    .then(response => {
      console.log('响应状态:', response.status); // 添加日志
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('响应数据:', data); // 添加日志
      appendMessage('bot', data.choices[0].message.content);
    })
    .catch(error => {
      console.error('Fetch error:', error);
      console.log('完整错误信息:', error.stack);
      appendMessage('bot', '抱歉，发生错误，请稍后再试。');
    });

    userInput.value = '';
  }

  // 追加消息到聊天区域
  function appendMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = text;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    saveSession();
  }

  // 清除当前会话历史记录
  function clearHistory() {
    chatMessages.innerHTML = '';
    currentChatId = Date.now();
    saveSession();
  }

  // 清除全部历史记录
  function clearAllHistory() {
    chatSessions = {};
    localStorage.removeItem('chatSessions');
    chatMessages.innerHTML = '';
    currentChatId = Date.now();
    loadHistory();
  }

  // 页面加载时加载历史记录
  loadHistory();

  // 绑定事件
  sendButton.addEventListener('click', sendMessage);
  sendButton.addEventListener('touchstart', (e) => {
    e.preventDefault(); // 阻止默认触摸行为
    sendMessage();
  });
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  clearHistoryButton.addEventListener('click', clearHistory);
  clearHistoryButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    clearHistory();
  });
  clearAllHistoryButton.addEventListener('click', clearAllHistory);
  clearAllHistoryButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    clearAllHistory();
  });
</script>

<style>
  #main-container {
    display: flex;
    height: 100vh;
  }

  #history-sidebar {
    width: 300px;
    padding: 20px;
    border-right: 1px solid #ccc;
    overflow-y: auto;
  }

  #chat-main {
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
  }

  #chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  #chat-messages {
    border: 1px solid #ccc;
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    margin-bottom: 10px;
  }

  /* 移动端样式优化 */
  @media (max-width: 768px) {
    #main-container {
      flex-direction: column;
    }

    #history-sidebar {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid #ccc;
      max-height: 200px;
    }

    #chat-main {
      padding: 10px;
    }

    #chat-container {
      flex: 1;
    }

    #chat-messages {
      height: 60vh;
    }

    #user-input,
    #send-button,
    #clear-history {
      margin-top: 5px;
    }
  }

  /* 为下拉菜单添加样式 */
  #model-select {
    margin-bottom: 10px;
    padding: 5px;
  }

  /* 统一按钮样式 */
  #send-button,
  #clear-history,
  #clear-all-history {
    margin-top: 10px;
    padding: 10px 20px; /* 统一内边距 */
    border: none; /* 去除边框 */
    border-radius: 20px; /* 圆角矩形 */
    cursor: pointer; /* 鼠标悬停显示手型 */
    font-size: 14px; /* 统一字体大小 */
    transition: opacity 0.3s; /* 添加透明度过渡效果 */
  }

  #send-button {
    background-color:rgb(81, 238, 152); /* 绿色背景 */
    color: white; /* 白色文字 */
  }

  #clear-history,
  #clear-all-history {
    background-color:rgb(244, 139, 54); /* 红色背景 */
    color: white; /* 白色文字 */
  }

  /* 按钮悬停效果 */
  #send-button:hover,
  #clear-history:hover,
  #clear-all-history:hover {
    opacity: 0.8; /* 悬停时透明度降低 */
  }

  .history-item {
    cursor: pointer;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #eee;
    border-radius: 5px;
  }

  .history-item:hover {
    background-color: #f5f5f5;
  }
</style>