// netlify/functions/getData.js
const TOKEN  = process.env.GITHUB_TOKEN;
const REPO   = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH;

exports.handler = async () => {
  try {
    const url = `https://api.github.com/repos/${REPO}/contents/data.json?ref=${BRANCH}`;
    const res = await fetch(url, {
      headers: { Authorization: `token ${TOKEN}` }
    });
    if (!res.ok) {
      return { statusCode: res.status, body: await res.text() };
    }
    const { content, encoding } = await res.json();
    const json = Buffer.from(content, encoding).toString();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: json
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
