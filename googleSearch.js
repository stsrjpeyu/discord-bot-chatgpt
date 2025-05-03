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

    // 天気らしい情報を優先的に抜き出す
    for (const item of items) {
      const snippet = item.snippet || "";
      if (
        snippet.includes("晴") ||
        snippet.includes("曇") ||
        snippet.includes("雨") ||
        snippet.includes("雪") ||
        snippet.includes("℃") ||
        snippet.includes("気温")
      ) {
        return snippet;
      }
    }

    // 該当がなければ上位1件のタイトル・スニペット・リンクを返す
    const top = items[0];
    return `${top.title}\n${top.snippet}\n${top.link}`;
  } catch (error) {
    console.error("Google検索エラー:", error.response?.data || error.message);
    return "Google検索でエラーが発生しました。";
  }
};

module.exports = { googleSearch };
