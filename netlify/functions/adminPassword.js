// Netlify Function: 管理員密碼驗證
const ADMIN_PASSWORD = 'yourSecretPassword'; // 請自行更改密碼

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: '只支援 POST 方法' })
    };
  }
  try {
    const body = JSON.parse(event.body || '{}');
    if (body.password === ADMIN_PASSWORD) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: '密碼錯誤' })
      };
    }
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: '請提供正確格式', details: err.message })
    };
  }
};
