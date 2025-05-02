const axios = require("axios");

const googleSearch = async (query) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;

  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
    query
  )}&key=${apiKey}&cx=${cx}`;

  try {
    const response = await axios.get(url);
    const results = response.data.items;

    if (!results || results.length === 0) {
      return "🔍 検索結果が見つかりませんでした。";
    }

    // 上位3件を整形して出力
    const topResults = results.slice(0, 3).map((item, index) => {
      return `【${index + 1}】${item.title}\n${item.snippet}\n${item.link}`;
    });

    return topResults.join("\n\n");
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message;
    console.error("❌ Google検索エラー:", message);
    return "⚠️ Google検索でエラーが発生しました。設定を確認してください。";
  }
};

module.exports = { googleSearch };
