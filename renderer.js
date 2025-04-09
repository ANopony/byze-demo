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
  messageInput.value = '';
    
  try {
    // 调用主进程的 chat 函数
    const chatResponse = await ipcRenderer.invoke('chat', message);
    // 添加模型回复气泡
    const aiBubble = document.createElement('div');
    aiBubble.classList.add('chat-bubble', 'ai-bubble');
    aiBubble.textContent = chatResponse;
    chatOutput.appendChild(aiBubble);
    
  } catch (error) {
    console.error('IPC error:', error);
    const errorBubble = document.createElement('div');
    errorBubble.classList.add('chat-bubble', 'ai-bubble');
    errorBubble.textContent = 'Error occurred. Please try again.';
    chatOutput.appendChild(errorBubble);
  }
  
  // 滚动到最新消息
  chatOutput.scrollTop = chatOutput.scrollHeight;
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