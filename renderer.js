const { ipcRenderer } = require('electron');

const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatOutput = document.getElementById('chat-output');
const generateButton = document.getElementById('generate-button');
const promptInput = document.getElementById('prompt-input');
const generatedImage = document.getElementById('generated-image');

const chatHistory = [];

// ipcRenderer.invoke 是一个异步方法，用于向主进程发送请求并等待响应
sendButton.addEventListener('click', async () => {
  const message = messageInput.value;

  // 移除之前的流式监听器防止重复
  ipcRenderer.removeAllListeners('chat-stream-data');
  ipcRenderer.removeAllListeners('chat-stream-end');
  ipcRenderer.removeAllListeners('chat-stream-error');

  // 创建新消息气泡
  const userBubble = document.createElement('div');
  userBubble.classList.add('chat-bubble', 'user-bubble');
  userBubble.textContent = message;
  chatOutput.appendChild(userBubble);
  messageInput.value = '';  // 清空输入框

  chatHistory.push({ role: 'user', content: message });

  // 创建新的助手气泡
  const assistantBubble = document.createElement('div');
  assistantBubble.classList.add('chat-bubble', 'ai-bubble');  // 修正类名为ai-bubble
  chatOutput.appendChild(assistantBubble);

  // 滚动到最新消息
  chatOutput.scrollTop = chatOutput.scrollHeight;

  // 发送请求前先移除旧监听器
  ipcRenderer.send('chat-stream', {
    model: 'deepseek-r1:7b',
    messages: chatHistory,
    stream: true
  });

  // 创建新的监听器（使用once确保只触发一次）
  ipcRenderer.on('chat-stream-data', (event, data) => {
    assistantBubble.textContent += data;
    chatOutput.scrollTop = chatOutput.scrollHeight;
  });

  ipcRenderer.once('chat-stream-end', () => {
    console.log('流式响应结束');
    // 清理监听器
    chatHistory.push({ role: 'assistant', content: assistantBubble.textContent });
    ipcRenderer.removeAllListeners('chat-stream-data');
    ipcRenderer.removeAllListeners('chat-stream-error');
  });

  ipcRenderer.once('chat-stream-error', (event, error) => {
    console.error('流式响应错误:', error);
    assistantBubble.textContent = '发生错误，请稍后重试。';
    ipcRenderer.removeAllListeners('chat-stream-data');
  });
});

// 文生图
generateButton.addEventListener('click', async () => {
  const prompt = promptInput.value;

  // 清空之前的图片
  generatedImage.src = '';
  generatedImage.alt = '正在生成图片...';

  // 调用主进程的生成图片方法
  const imageUrl = await ipcRenderer.invoke('generate-image', {
    model: 'wanx2.1-t2i-turbo',
    prompt: prompt,
  });

  if (imageUrl) {
    generatedImage.src = imageUrl;
    generatedImage.alt = '生成的图片';
  } else {
    generatedImage.alt = '生成图片失败，请重试。';
  }
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