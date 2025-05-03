const { googleSearch } = require("./googleSearch");
const axios = require("axios");
require("dotenv").config();

const CHANNEL_ID = process.env.DAILY_REPORT_CHANNEL_ID;

const getDailyWeather = async () => {
  const locations = [
    { name: "横浜市", lat: 35.4437, lon: 139.6380 },
    { name: "東京都", lat: 35.6895, lon: 139.6917 },
    { name: "つくば市", lat: 36.0836, lon: 140.0766 },
  ];

  const weatherKey = process.env.OPENWEATHER_API_KEY;
  const results = [];

  for (const loc of locations) {
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${loc.lat}&lon=${loc.lon}&units=metric&lang=ja&appid=${weatherKey}`
      );
      const data = res.data;
      results.push(`${loc.name}: ${data.weather[0].description}, 気温 ${data.main.temp}°C`);
    } catch (err) {
      console.error(`❌ 天気情報取得エラー (${loc.name}):`, err.message);
      results.push(`${loc.name}: 天気情報を取得できませんでした`);
    }
  }

  return `🌤 今日の天気:\n${results.join("\n")}`;
};

const getDailyNews = async () => {
  try {
    const query = "日経 今日のニュース";
    const results = await googleSearch(query);
    return `📰 今日のニュース:\n${results}`;
  } catch (err) {
    console.error("❌ ニュース取得エラー:", err.message);
    return "📰 今日のニュース: ニュースの取得に失敗しました。";
  }
};

const sendDailyReport = async (client) => {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    if (!channel || !channel.isTextBased()) {
      console.error("⚠️ 有効なテキストチャンネルが見つかりません");
      return;
    }

    const weather = await getDailyWeather();
    const news = await getDailyNews();

    await channel.send(`${weather}\n\n${news}`);
    console.log("✅ 定期レポート送信完了");
  } catch (err) {
    console.error("❌ 定期レポート送信エラー:", err.message);
  }
};

module.exports = {
  sendDailyReport,
};
