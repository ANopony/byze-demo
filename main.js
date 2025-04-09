const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('chat', async (event, message) => {
    try {
      const response = await axios.post('http://your-ollama-api/chat', { prompt: message });
      return response.data.response;
    } catch (error) {
      console.error('Chat API error:', error);
      return 'API request error.';
    }
  });

  ipcMain.handle('generate-image', async (event, prompt) => {
    try {
      const response = await axios.post('http://your-ollama-api/generate-image', { prompt: prompt });
      return response.data.imageUrl;
    } catch (error) {
      console.error('Image API error:', error);
      return null;
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