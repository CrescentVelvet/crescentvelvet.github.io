---
layout: default
permalink: /chat.html
title: "聊天页面"
---

<div id="chat-container">
  <!-- 大模型选择下拉菜单 -->
  <select id="model-select">
    <option value="Qwen/Qwen2.5-72B-Instruct" selected>Qwen2.5-72B-Instruct</option>
    <option value="Pro/deepseek-ai/DeepSeek-V3" selected>Pro/deepseek-ai/DeepSeek-V3</option>
    <!-- 可添加更多模型选项 -->
    <option value="another-model">另一个模型</option>
  </select>
  <!-- 对话消息显示区域 -->
  <div id="chat-messages"></div>
  <!-- 输入框 -->
  <input type="text" id="user-input" placeholder="输入你的问题...">
  <!-- 发送按钮 -->
  <button id="send-button">发送</button>
</div>

<script>
  // 获取 DOM 元素
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');
  const modelSelect = document.getElementById('model-select'); // 获取模型选择下拉菜单

  // 发送消息函数
  function sendMessage() {
    const message = userInput.value;
    if (message.trim() === '') return;

    // 显示用户消息
    appendMessage('user', message);

    const selectedModel = modelSelect.value; // 获取选中的模型

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
    .then(response => response.json())
    .then(data => {
      appendMessage('bot', data.choices[0].message.content);
    })
    .catch(error => {
      console.error('Error:', error);
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
  }

  // 绑定事件
  sendButton.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
</script>

<style>
  #chat-container {
    max-width: 600px;
    margin: 0 auto;
  }

  #chat-messages {
    border: 1px solid #ccc;
    height: 400px;
    overflow-y: auto;
    padding: 10px;
    margin-bottom: 10px;
  }

  .message {
    margin-bottom: 5px;
    padding: 5px;
    border-radius: 5px;
  }

  .user {
    background-color: #e3f2fd;
    text-align: right;
  }

  .bot {
    background-color: #f1f8e9;
  }

  /* 为下拉菜单添加样式 */
  #model-select {
    margin-bottom: 10px;
    padding: 5px;
  }
</style>