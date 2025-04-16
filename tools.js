const fs = require('fs');

// TODO: 超过16个分段会遭到模型拒绝
function spliter(str, chunkSize = 10) {
  // 去除换行符 \n 和 \r
  const cleanedStr = str.replace(/[\n\r]/g, '');

  // 按照指定的 chunkSize（默认 10 个字符）分割字符串
  const parts = [];
  for (let i = 0; i < cleanedStr.length; i += chunkSize) {
    parts.push(cleanedStr.slice(i, i + chunkSize));
  }

  return parts.filter(part => part.trim() !== ''); // 去除空白段
}

function readConfig(path) {
  const configPath = path || './settings.json';
  try {
    const f = fs.readFileSync(configPath, 'utf-8');
    const data = JSON.parse(f);
    return data;
  } catch (error) {
    console.error('读取配置文件失败:', error);
    return null;
  }
}

module.exports = {
  spliter,
};