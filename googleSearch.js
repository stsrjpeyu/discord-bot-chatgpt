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

// 天気要約（Open-Meteo APIから取得）
const getWeatherSummary = async (location) => {
  const coordinates = {
    "横浜市": { lat: 35.4437, lon: 139.6380 },
    "東京都": { lat: 35.6895, lon: 139.6917 },
    "つくば市": { lat: 36.0836, lon: 140.0766 },
  };

  const loc = coordinates[location];
  if (!loc) return `${location} の座標が見つかりません`;

  try {
    const res = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude: loc.lat,
        longitude: loc.lon,
        hourly: "temperature_2m,weathercode,windspeed_10m",
        timezone: "Asia/Tokyo",
      },
    });

    const { time, temperature_2m, weathercode, windspeed_10m } = res.data.hourly;
    const today = new Date().toISOString().split("T")[0];

    const getHourIndex = (h) => time.findIndex(t => t.startsWith(today) && t.includes(`${h}:00`));
    const idx9 = getHourIndex("09");
    const idx15 = getHourIndex("15");

    const weatherIcon = (code) => {
      if ([0].includes(code)) return "☀️";
      if ([1, 2, 3].includes(code)) return "🌤";
      if ([45, 48].includes(code)) return "🌫️";
      if ([51, 53, 55, 61, 63].includes(code)) return "🌦";
      if ([80, 81, 82].includes(code)) return "🌧";
      if ([71, 73, 75, 85, 86].includes(code)) return "❄️";
      return "☁️";
    };

    return (
      `午前 ${weatherIcon(weathercode[idx9])} ${temperature_2m[idx9]}℃ / 風 ${windspeed_10m[idx9]}m/s\n` +
      `午後 ${weatherIcon(weathercode[idx15])} ${temperature_2m[idx15]}℃ / 風 ${windspeed_10m[idx15]}m/s`
    );
  } catch (err) {
    console.error(`天気情報取得エラー (${location}):`, err.message);
    return `${location}: 天気情報取得に失敗しました。`;
  }
};

module.exports = {
  googleSearch,
  getNewsSummary,
  getWeatherSummary,
};

