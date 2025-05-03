const { getWeatherSummary, googleSearch } = require("./googleSearch");
require("dotenv").config();

const CHANNEL_ID = process.env.DAILY_REPORT_CHANNEL_ID;

const getDailyWeather = async () => {
  const cities = [
    { name: "横浜市", icon: "🛳️" },
    { name: "東京都", icon: "🗼" },
    { name: "つくば市", icon: "🔬" },
  ];

  const results = await Promise.all(
    cities.map(async (city) => {
      const summary = await getWeatherSummary(city.name);
      return `${city.icon} ${city.name}: ${summary}`;
    })
  );

  return `🌤 今日の天気（Google検索ベース）\n${results.join("\n\n")}`;
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
