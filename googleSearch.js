const axios = require("axios");

const googleSearch = async (query) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;

  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}`;

  try {
    const response = await axios.get(url);
    const items = response.data.items;

    if (!items || items.length === 0) {
      return "検索結果が見つかりませんでした。";
    }

    // 上位3件までを要約に含める
    const summary = items.slice(0, 3).map((item, index) => {
      return `【${index + 1}件目】\n${item.title}\n${item.snippet}\n${item.link}`;
    }).join("\n\n");

    return summary;
  } catch (error) {
    console.error("Google検索エラー:", error.response?.data || error.message);
    return "Google検索でエラーが発生しました。";
  }
};

module.exports = { googleSearch };
