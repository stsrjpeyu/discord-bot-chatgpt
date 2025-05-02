const axios = require("axios");

const googleSearch = async (query) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;

  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}`;

  try {
    const response = await axios.get(url);
    const results = response.data.items;

    if (!results || results.length === 0) {
      return "検索結果が見つかりませんでした。";
    }

    const topResult = results[0];
    return `${topResult.title}\n${topResult.snippet}\n${topResult.link}`;
  } catch (error) {
    console.error("Google検索エラー:", error.response?.data || error.message);
    return "Google検索でエラーが発生しました。";
  }
};

module.exports = { googleSearch };
