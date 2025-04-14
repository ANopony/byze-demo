const fs = require('fs');

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

module.exports = {
  spliter,
};