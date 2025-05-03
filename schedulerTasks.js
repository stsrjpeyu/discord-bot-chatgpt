const { googleSearch } = require("./googleSearch");
require("dotenv").config();

const CHANNEL_ID = process.env.DAILY_REPORT_CHANNEL_ID;

const getDailyWeather = async () => {
  const locations = [
    { name: "横浜市", query: "横浜市 天気", icon: "🛳️" },     // 横浜港・みなとみらいのイメージ
    { name: "東京都", query: "東京都 天気", icon: "🗼" },       // 東京タワー
    { name: "つくば市", query: "つくば市 天気", icon: "🔬" },   // 研究学園都市のイメージ
  ];

  const resultLines = [];

  for (const loc of locations) {
    try {
      const topResult = await googleSearch(loc.query);
      const brief = topResult.split("\n")[0]; // 検索結果の1行目のみ抽出
      resultLines.push(`${loc.icon} ${loc.name}: ${brief}`);
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
