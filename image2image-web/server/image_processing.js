const serveoUrl = process.env.SERVEO_URL || 'http://localhost:506';
// 模拟的文生图 API
async function generateImage(prompt, location) {
    console.log(`[${location}] 请求生成图片，Prompt: ${prompt}`);
    // 返回使用 Serveo 公网地址的图片链接
    return [
        `${serveoUrl}/images/png1.png`,
        `${serveoUrl}/images/png2.png`,
        `${serveoUrl}/images/png3.png`
    ];
}

// 模拟的高清图 API
async function upscaleImage(imageUrl, location) {
    console.log(`[${location}] 请求高清化图片，URL: ${imageUrl}`);
    // 返回使用 Serveo 公网地址的高清图片链接
    const imageName = imageUrl.split('/').pop().split('?')[0];
    return `${serveoUrl}/images/png5.png`;
}

module.exports = { generateImage, upscaleImage };