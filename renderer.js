const { ipcRenderer } = require('electron');

const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatOutput = document.getElementById('chat-output');
const generatedImage = document.getElementById('generated-image');

// ipcRenderer.invoke 是一个异步方法，用于向主进程发送请求并等待响应
sendButton.addEventListener('click', async () => {
  const message = messageInput.value;
  // 添加用户消息气泡
  const userBubble = document.createElement('div');
  userBubble.classList.add('chat-bubble', 'user-bubble');
  userBubble.textContent = message;
  chatOutput.appendChild(userBubble);
  // 添加助手消息气泡（用于动态更新内容）
  const assistantBubble = document.createElement('div');
  assistantBubble.classList.add('chat-bubble', 'assistant-bubble');
  chatOutput.appendChild(assistantBubble);

  // 滚动到最新消息
  chatOutput.scrollTop = chatOutput.scrollHeight;

  // 清空输入框
  messageInput.value = '';

  // 发送消息到主进程并监听流式响应
  ipcRenderer.send('chat-stream', {
    model: 'deepseek-r1:7b',
    messages: [
      {
        role: 'user',
        content: message,
      },
    ],
    stream: true,
  });

  // 监听流式数据
  ipcRenderer.on('chat-stream-data', (event, data) => {
    assistantBubble.textContent += data; // 动态更新助手气泡内容
    chatOutput.scrollTop = chatOutput.scrollHeight; // 滚动到最新消息
  });

  // 监听流结束
  ipcRenderer.on('chat-stream-end', () => {
    console.log('流式响应结束');
  });

  // 监听流错误
  ipcRenderer.on('chat-stream-error', (event, error) => {
    console.error('流式响应错误:', error);
    assistantBubble.textContent = '发生错误，请稍后重试。';
  });
});
    
// 侧边栏切换
const sidebarButtons = document.querySelectorAll('.sidebar button');
const pages = document.querySelectorAll('.page');
    
sidebarButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const pageId = button.dataset.page;
    
    pages.forEach((page) => {
      page.classList.remove('active');
    });
    
    document.getElementById(pageId).classList.add('active');
  });
});