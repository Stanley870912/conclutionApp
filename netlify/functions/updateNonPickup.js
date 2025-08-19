// netlify/functions/updateNonPickup.js
const TOKEN  = process.env.GITHUB_TOKEN;
const REPO   = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let newJson;
  try {
    newJson = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  try {
    // 1. 讀取現有 non_pickup.json 的 metadata + 內容
    const metaRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/non_pickup.json?ref=${BRANCH}`,
      { headers: { Authorization: `token ${TOKEN}` } }
    );
    if (!metaRes.ok) {
      const errorText = await metaRes.text();
      return { statusCode: metaRes.status, body: JSON.stringify({
        step: 'get-meta',
        status: metaRes.status,
        error: errorText
      }) };
    }
    const { sha } = await metaRes.json();

    // 2. 寫回 GitHub
    const putRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/non_pickup.json`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Update non_pickup.json via admin` ,
          content: Buffer.from(
            JSON.stringify(newJson, null, 2)
          ).toString('base64'),
          sha,
          branch: BRANCH
        })
      }
    );
    if (!putRes.ok) {
      const errorText = await putRes.text();
      return { statusCode: putRes.status, body: JSON.stringify({
        step: 'put-file',
        status: putRes.status,
        error: errorText
      }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, message: e.message, step: 'catch' })
    };
  }
};
