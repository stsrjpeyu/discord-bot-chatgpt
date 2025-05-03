const axios = require("axios");

const apiKey = process.env.GOOGLE_API_KEY;
const cx = process.env.GOOGLE_CSE_ID;

// ニュースの上位3件を取得して整形
const getNewsSummary = async (query) => {
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}`;

  try {
    const response = await axios.get(url);
    const items = response.data.items;

    if (!items || items.length === 0) {
      return "検索結果が見つかりませんでした。";
    }

    return items
      .slice(0, 3)
      .map(
        (item, index) =>
          `【${index + 1}件目】\n${item.title}\n${item.snippet}\n${item.link}`
      )
      .join("\n\n");
  } catch (error) {
    console.error("Google検索エラー:", error.response?.data || error.message);
    return "Google検索でエラーが発生しました。";
  }
};

// 汎用的なGoogle検索
const googleSearch = async (query, maxResults = 3) => {
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}`;

  try {
    const response = await axios.get(url);
    const items = response.data.items;

    if (!items || items.length === 0) {
      return "検索結果が見つかりませんでした。";
    }

    return items.slice(0, maxResults).map((item, index) => {
      return `【${index + 1}件目】\n${item.title}\n${item.snippet}\n${item.link}`;
    }).join("\n\n");

  } catch (error) {
    console.error("Google検索エラー:", error.response?.data || error.message);
    return "Google検索でエラーが発生しました。";
  }
};

// 天気要約（信頼性のあるソースから1件を抽出）
const getWeatherSummary = async (location) => {
  const query = `${location} の天気`;
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}`;

  try {
    const response = await axios.get(url);
    const items = response.data.items;

    if (!items || items.length === 0) {
      return "天気情報が見つかりませんでした。";
    }

    const trustedSource = items.find(item =>
      item.link.includes("tenki.jp") || item.link.includes("weather.yahoo.co.jp")
    ) || items[0];

    return `${trustedSource.title}\n${trustedSource.snippet}`;
  } catch (err) {
    console.error(`天気情報取得エラー (${location}):`, err.message);
    return "天気情報取得に失敗しました。";
  }
};

module.exports = {
  googleSearch,
  getNewsSummary,
  getWeatherSummary,
};

