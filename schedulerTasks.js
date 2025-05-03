const { getWeatherSummary, getNewsSummary } = require("./googleSearch");
require("dotenv").config();

const CHANNEL_ID = process.env.DAILY_REPORT_CHANNEL_ID;

const LOCATIONS = [
  { name: "横浜市", icon: "🛳️" },
  { name: "東京都", icon: "🗼" },
  { name: "つくば市", icon: "🔬" },
];

// 🌤 天気情報を取得して整形
const getDailyWeather = async () => {
  const lines = await Promise.all(
    LOCATIONS.map(async ({ name, icon }) => {
      const weather = await getWeatherSummary(name);
      return `${icon} ${name}: ${weather}`;
    })
  );
  return `🌤 今日の天気（Open-Meteo API）\n${lines.join("\n")}`;
};

// 📰 ニュース情報を取得して整形
const getDailyNews = async () => {
  const query = "日経 今日のニュース";
  const news = await getNewsSummary(query);
  return `📰 今日のニュース（Google検索ベース）\n${news}`;
};

// 📤 定期レポート送信
const sendDailyReport = async (client) => {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) {
      console.error("⚠️ チャンネルが見つかりません");
      return;
    }

    const weather = await getDailyWeather();
    const news = await getDailyNews();

    await channel.send(`${weather}\n\n${news}`);
  } catch (err) {
    console.error("❌ 定期レポート送信エラー:", err.message);
  }
};

module.exports = {
  sendDailyReport,
};
