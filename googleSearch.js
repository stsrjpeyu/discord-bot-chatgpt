const axios = require("axios");

const googleSearch = async (query) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cx) {
    console.error("❌ Google APIキーまたは検索エンジンIDが設定されていません");
    return "⚠️ Google APIの設定に問題があります。";
  }

  const url = "https://www.googleapis.com/customsearch/v1";
  const params = {
    q: query,
    key: apiKey,
    cx: cx,
    num: 1, // 取得件数（必要に応じて増やせる）
  };

  try {
    const { data } = await axios.get(url, { params });

    const results = data.items;
    if (!results || results.length === 0) {
      return "🔍 検索結果が見つかりませんでした。";
    }

    const top = results[0];
    return `📌 ${top.title}\n${top.snippet}\n🔗 ${top.link}`;
  } catch (error) {
    const msg = error.response?.data?.error?.message || error.message;
    console.error("Google検索エラー:", msg);
    return `⚠️ Google検索でエラーが発生しました（${msg}）`;
  }
};

module.exports = { googleSearch };
