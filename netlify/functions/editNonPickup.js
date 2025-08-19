// Netlify Function: 編輯 non_pickup.json
const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../../non_pickup.json');

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return {
        statusCode: 200,
        body: data,
        headers: { 'Content-Type': 'application/json' }
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: '讀取失敗', details: err.message })
      };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = event.body;
      fs.writeFileSync(filePath, body, 'utf-8');
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: '寫入失敗', details: err.message })
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: '不支援的方法' })
  };
};
