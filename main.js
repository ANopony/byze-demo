const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const ByzeLib = require('byze-lib');
const { spliter } = require('./tools');

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

  ipcMain.handle('select-file', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });
    return result; // 返回文件选择结果
  });
  
  // 处理文件并调用 byze.Embed
  ipcMain.handle('embed', async (event, { model, filePath }) => {
    try {
      // 读取文件内容
      const fileContent = fs.readFileSync(filePath, 'utf-8');
  
      // 使用 tools.js 的 spliter 函数分割文件内容
      const segments = spliter(fileContent, 100);
  
      // 调用 byze.Embed
      const response = await byze.Embed({
        model,
        input: segments,
      });
  
      // 返回嵌入向量
      return response.data.map((item) => ({
        index: item.index,
        embedding: item.embedding,
      }));
    } catch (error) {
      console.error('处理文件失败:', error);
      return null;
    }
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

  ipcMain.handle('save-settings', async (event, settings) => {
    try {
      const settingsPath = path.join(app.getPath('userData'), 'settings.json');
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
      return { success: true };
    } catch (error) {
      console.error('Failed to save settings:', error);
      return { success: false };
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