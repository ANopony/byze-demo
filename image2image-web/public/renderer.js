const promptInput = document.getElementById('prompt');
const generateLocationSelect = document.getElementById('generate-location');
const generateButton = document.getElementById('generate-button');
const imageDisplay = document.querySelector('.image-display');
const upscaleLocationSelect = document.getElementById('upscale-location');
const upscaleButton = document.getElementById('upscale-button');
const upscaledImageDisplay = document.querySelector('.upscaled-image-display');

let generatedImageUrls = [];
let selectedImageUrl = null;

generateButton.addEventListener('click', async () => {
    const promptText = promptInput.value;
    const location = document.querySelector('input[name="generate-location"]:checked').value; // 获取选中的单选按钮值
    if (!promptText) {
        alert('请输入描述文字');
        return;
    }

    try {
        const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: promptText, location: location })
        });
        const data = await response.json();
        if (data.imageUrls && data.imageUrls.length > 0) {
            imageDisplay.innerHTML = '';
            generatedImageUrls = data.imageUrls.map((url, index) => {
                const img = document.createElement('img');
                img.src = url;
                img.classList.add('generated-image');
                img.addEventListener('click', () => {
                    document.querySelectorAll('.generated-image').forEach(el => el.classList.remove('selected'));
                    img.classList.add('selected');
                    selectedImageUrl = url;
                    upscaleButton.disabled = false;
                });
                imageDisplay.appendChild(img);
                return url;
            });
            upscaleButton.disabled = true;
            upscaledImageDisplay.innerHTML = '';
            selectedImageUrl = null;
        } else {
            alert('生成图片失败，请重试');
        }
    } catch (error) {
        console.error('生成图片请求失败:', error);
        alert('生成图片请求失败');
    } finally {
        promptInput.value = '';
    }
});

upscaleButton.addEventListener('click', async () => {
    if (!selectedImageUrl) {
        alert('请先选择一张图片');
        return;
    }

    const location = document.querySelector('input[name="location"]:checked').value; // 获取本地/云端选项
    const description = document.getElementById('upscale-description').value; // 获取描述文字

    if (!description) {
        alert('请输入图片描述');
        return;
    }

    try {
        const response = await fetch('/api/upscale-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                imageUrl: selectedImageUrl, 
                location: location, 
                description: description // 添加描述文字
            })
        });
        const data = await response.json();
        if (data.upscaledImageUrl) {
            upscaledImageDisplay.innerHTML = `<img src="${data.upscaledImageUrl}" class="upscaled-image">`;
        } else {
            alert('生成高清图失败，请重试');
        }
    } catch (error) {
        console.error('生成高清图请求失败:', error);
        alert('生成高清图请求失败');
    }
});