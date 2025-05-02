const axios = require("axios");

const googleSearch = async (query) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;

  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}`;

  try {
    const response = await axios.get(url);
    const results = response.data.items;

    if (!results || results.length === 0) {
      return [{
        title: "検索結果なし",
        snippet: "検索に一致する情報は見つかりませんでした。",
        link: "https://www.google.com/",
      }];
    }

    // 上位3件まで返す（title, snippet, link を含む）
    return results.slice(0, 3).map(item => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
    }));

  } catch (error) {
    console.error("Google検索エラー:", error.response?.data || error.message);
    throw new Error("Google検索でエラーが発生しました。");
  }
};

module.exports = { googleSearch };
