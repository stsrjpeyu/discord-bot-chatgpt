const { googleSearch, getWeatherSnippet } = require("./googleSearch");
require("dotenv").config();

const CHANNEL_ID = process.env.DAILY_REPORT_CHANNEL_ID;

const getDailyWeather = async () => {
  const locations = [
    { name: "横浜市", icon: "🛳️" },
    { name: "東京都", icon: "🗼" },
    { name: "つくば市", icon: "🔬" },
  ];

  const results = [];

  for (const loc of locations) {
    try {
      const snippet = await getWeatherSnippet(loc.name);
      results.push(`${loc.icon} ${loc.name}: ${snippet}`);
    } catch (error) {
      console.error(`❌ 天気情報取得エラー (${loc.name}):`, error.message);
      results.push(`${loc.icon} ${loc.name}: 情報取得エラー`);
    }
  }

  return `🌤 今日の天気（Google検索ベース）\n${results.join("\n")}`;
};

const getDailyNews = async () => {
  const query = "日経 今日のニュース";
  const results = await googleSearch(query);
  return `📰 今日のニュース（Google検索ベース）\n${results}`;
};

const sendDailyReport = async (client) => {
  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel) {
    console.error("⚠️ チャンネルが見つかりません");
    return;
  }

  const weather = await getDailyWeather();
  const news = await getDailyNews();

  await channel.send(`${weather}\n\n${news}`);
};

module.exports = {
  sendDailyReport,
};
