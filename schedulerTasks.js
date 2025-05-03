const { googleSearch } = require("./googleSearch");
require("dotenv").config();

const CHANNEL_ID = process.env.DAILY_REPORT_CHANNEL_ID;

const getDailyWeather = async () => {
  const locations = [
    { name: "横浜市", query: "横浜市 天気", icon: "🛳️" },
    { name: "東京都", query: "東京都 天気", icon: "🗼" },
    { name: "つくば市", query: "つくば市 天気", icon: "🔬" },
  ];

  const resultLines = [];

  for (const loc of locations) {
    try {
      const searchResult = await googleSearch(loc.query);

      // タイトル・スニペット・URLが "\n" で区切られている前提
      const parts = searchResult.split("\n");
      const title = parts[0] || "";
      const snippet = parts[1] || "";

      const summary = snippet || title || "情報なし";
      resultLines.push(`${loc.icon} ${loc.name}: ${summary}`);
    } catch (error) {
      resultLines.push(`${loc.icon} ${loc.name}: 天気情報の取得に失敗しました`);
      console.error(`❌ 天気取得エラー (${loc.name}):`, error.message);
    }
  }

  return `🌤 **今日の天気（Google検索ベース）**\n${resultLines.join("\n")}`;
};

const getDailyNews = async () => {
  const query = "日経 今日のニュース";
  try {
    const results = await googleSearch(query);
    return `📰 **今日のニュース（Google検索ベース）**\n${results}`;
  } catch (error) {
    console.error("❌ ニュース取得エラー:", error.message);
    return "ニュース情報の取得に失敗しました。";
  }
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
