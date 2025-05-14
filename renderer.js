const { ipcRenderer } = require('electron');

const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatOutput = document.getElementById('chat-output');
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
const generateButton = document.getElementById('generate-button');
const promptInput = document.getElementById('prompt-input');
const generatedImage = document.getElementById('generated-image');

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

// embed
const selectFileButton = document.getElementById('select-file-button');
const processFileButton = document.getElementById('process-file-button');
const selectedFilePath = document.getElementById('selected-file-path');
const embeddingResult = document.getElementById('embedding-result');

let filePath = ''; // 用于存储选中的文件路径

// 选择文件
selectFileButton.addEventListener('click', async () => {
  const result = await ipcRenderer.invoke('select-file');
  if (result.canceled) {
    selectedFilePath.textContent = '未选择文件';
    filePath = '';
  } else {
    filePath = result.filePaths[0]; // 获取选中的文件路径
    selectedFilePath.textContent = filePath;
  }
});

// embed文件
processFileButton.addEventListener('click', async () => {
  if (!filePath) {
    embeddingResult.textContent = '请先选择一个文件！';
    return;
  }

  // 调用主进程处理文件并获取嵌入向量
  embeddingResult.textContent = '正在处理文件，请稍候...';
  const embeddings = await ipcRenderer.invoke('embed', {
    model: 'bge-m3',
    filePath, // 传递完整路径
  });

  if (embeddings) {
    // 清空之前的结果
    embeddingResult.textContent = '';
    embeddingResult.innerHTML = ''; // 确保清空内容

    // 遍历每个分段，创建一个框
    embeddings.forEach((embedding, index) => {
      const segmentBox = document.createElement('div');
      segmentBox.classList.add('segment-box');
      segmentBox.textContent = `分段 ${index + 1}: ${embedding.text.slice(0, 10)}...`; // 显示前10个字符

      // 点击框后展示完整内容和嵌入向量
      segmentBox.addEventListener('click', () => {
        const detailContainer = document.createElement('div');
        detailContainer.classList.add('segment-detail');

        const segmentText = document.createElement('p');
        segmentText.textContent = `内容: ${embedding.text}`;

        const segmentEmbedding = document.createElement('pre');
        segmentEmbedding.textContent = `嵌入向量: ${JSON.stringify(embedding.embedding, null, 2)}`;

        detailContainer.appendChild(segmentText);
        detailContainer.appendChild(segmentEmbedding);

        // 清空并展示详细信息
        embeddingResult.innerHTML = '';
        embeddingResult.appendChild(detailContainer);
      });

      // 将框添加到结果容器中
      embeddingResult.appendChild(segmentBox);
    });
  } else {
    embeddingResult.textContent = '处理文件失败，请重试。';
  }
});

// 图生图



// settings
const saveSettingsButton = document.getElementById('save-settings-button');

saveSettingsButton.addEventListener('click', async () => {
  const settings = {
    chat: {
      model: document.getElementById('chat-model').value,
      url: document.getElementById('chat-url').value,
    },
    embed: {
      model: document.getElementById('embed-model').value,
      url: document.getElementById('embed-url').value,
    },
    textToImage: {
      model: document.getElementById('text-to-image-model').value,
      url: document.getElementById('text-to-image-url').value,
    },
  };

  // 调用主进程保存设置
  const result = await ipcRenderer.invoke('save-settings', settings);
  if (result.success) {
    alert('Settings saved successfully!');
  } else {
    alert('Failed to save settings.');
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