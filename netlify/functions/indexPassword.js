// functions/auth.js

exports.handler = async (event, context) => {
  // 僅接受 POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // 解析前端傳來的 JSON
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const { password } = body;
  // 把密碼放在環境變數裡比較安全
  const SECRET = process.env.PASSWORDIndex; 

  if (password === SECRET) {
    // 驗證成功
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } else {
    // 驗證失敗
    return {
      statusCode: 401,
      body: JSON.stringify({ ok: false, message: "密碼錯誤" }),
    };
  }
};
