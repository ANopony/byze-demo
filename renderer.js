const { ipcRenderer } = require('electron');

const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatOutput = document.getElementById('chat-output');
const generatedImage = document.getElementById('generated-image');

sendButton.addEventListener('click', async () => {
  const message = messageInput.value;

  try {
    // 调用主进程的 chat 函数
    const chatResponse = await ipcRenderer.invoke('chat', message);
    chatOutput.innerHTML += `<p>User: ${message}</p><p>AI: ${chatResponse}</p>`;

    //调用主进程的 generate-image 函数
    const imageURL = await ipcRenderer.invoke('generate-image', message);
    generatedImage.src = imageURL;
  } catch (error) {
    console.error('IPC error:', error);
    chatOutput.innerHTML += '<p>Error occurred. Please try again.</p>';
  }
});