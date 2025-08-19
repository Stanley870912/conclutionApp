// Netlify Function: 使用者密碼驗證
const USER_PASSWORD = '1234'; // 使用者密碼

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: '只支援 POST 方法' })
    };
  }
  try {
    const body = JSON.parse(event.body || '{}');
    if (body.password === USER_PASSWORD) {
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true })
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
