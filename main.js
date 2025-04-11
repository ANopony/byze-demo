const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const ByzeLib = require('byze-lib');

const byze = new ByzeLib();

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  console.log('Window created');

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  // ipcMain.handle 在主进程中处理来自渲染进程的异步请求
  ipcMain.handle('chat', async (event, message) => {
    try {
      const response = await axios.post('http://127.0.0.1/api/chat', { prompt: message });
      return response.data.response;
    } catch (error) {
      console.error('Chat API error:', error);
      return 'API request error.';
    }
  });

  ipcMain.on('chat-stream', async (event, messageObj) => {
    const stream = await byze.Chat(messageObj);
  
    stream.on('data', (data) => {
      event.sender.send('chat-stream-data', data.message?.content || '');
    });
  
    stream.on('end', () => {
      event.sender.send('chat-stream-end');
    });
  
    stream.on('error', (err) => {
      event.sender.send('chat-stream-error', err);
    });
  });

  ipcMain.handle('generate-image', async (event, { model, prompt }) => {
    try {
      const response = await byze.TextToImage({ model, prompt });
      return response.data.url; // 返回图片的 URL
    } catch (error) {
      console.error('生成图片失败:', error);
      return null; // 返回 null 表示失败
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});