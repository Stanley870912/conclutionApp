// netlify/functions/updateData.js
const TOKEN  = process.env.GITHUB_TOKEN;
const REPO   = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH;

// Helper：把 "2025/5/16" 這種格式轉成 Date 物件（年, 月-1, 日）
function parseOrderDate(str) {
  const [y, m, d] = str.split('/').map(Number);
  return new Date(y, m - 1, d);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // 解析前端傳來的新訂單物件
  let newOrder;
  try {
    newOrder = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  try {
    // 1. 讀取現有 data.json 的 metadata + 內容
    const metaRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/data.json?ref=${BRANCH}`,
      { headers: { Authorization: `token ${TOKEN}` } }
    );
    if (!metaRes.ok) {
      return { statusCode: metaRes.status, body: await metaRes.text() };
    }
    const { sha, content, encoding } = await metaRes.json();
    const data = JSON.parse(Buffer.from(content, encoding).toString());

    // 2. 確保 orders 是陣列
    const orders = Array.isArray(data.orders) ? data.orders : [];

    // 3. 建立「7 天前」的門檻日期
    const now       = new Date();
    const threshold = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    // 4. 過濾：只留下日期 >= threshold，且不是同 partner+date 的舊訂單
    const filtered = orders.filter(o => {
      const od = parseOrderDate(o.date);
      const isOld      = od < threshold;
      const isSameKey  = (o.date === newOrder.date && o.partnerId === newOrder.partnerId);
      return !isOld && !isSameKey;
    });

    // 5. 把新訂單推入
    filtered.push(newOrder);

    // 6. 寫回 GitHub
    const putRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/data.json`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Upsert order ${newOrder.partnerId} @ ${newOrder.date}`,
          content: Buffer.from(
            JSON.stringify({ orders: filtered }, null, 2)
          ).toString('base64'),
          sha,
          branch: BRANCH
        })
      }
    );
    if (!putRes.ok) {
      return { statusCode: putRes.status, body: await putRes.text() };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, orders: filtered })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, message: e.message })
    };
  }
};
