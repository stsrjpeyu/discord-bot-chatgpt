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

// 天気用スニペットを1件のみ抽出
const getWeatherSnippet = async (city) => {
  const query = `${city} 今日の天気`;
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}`;

  try {
    const response = await axios.get(url);
    const items = response.data.items;

    if (!items || items.length === 0) {
      return `${city}: 天気情報が見つかりませんでした。`;
    }

    const top = items[0];
    return `${top.title} - ${top.snippet}`;
  } catch (error) {
    console.error(`Google検索エラー（${city}）:`, error.response?.data || error.message);
    return `${city}: 天気情報の取得でエラーが発生しました。`;
  }
};

module.exports = {
  googleSearch: getNewsSummary,
  getWeatherSnippet,
};
