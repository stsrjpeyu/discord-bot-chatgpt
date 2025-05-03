const { googleSearch } = require("./googleSearch");
require("dotenv").config();

const CHANNEL_ID = process.env.DAILY_REPORT_CHANNEL_ID;

// ✅ Google検索を使った天気取得
const getDailyWeather = async () => {
  const queries = [
    { name: "横浜市", query: "横浜 天気" },
    { name: "東京都", query: "東京 天気" },
    { name: "つくば市", query: "つくば 天気" },
  ];

  const results = [];

  for (const loc of queries) {
    try {
      const searchResult = await googleSearch(loc.query);
      results.push(`${loc.name}: ${searchResult}`);
    } catch (error) {
      results.push(`${loc.name}: 天気情報の取得に失敗しました`);
      console.error(`❌ 天気情報取得エラー (${loc.name}):`, error.message);
    }
  }

  return `🌤 今日の天気（Google検索結果ベース）:\n\n${results.join("\n\n")}`;
};

// ✅ Google検索を使った日経ニュース取得
const getDailyNews = async () => {
  try {
    const results = await googleSearch("日経 今日のニュース");
    return `📰 今日のニュース:\n\n${results}`;
  } catch (error) {
    console.error("❌ ニュース取得エラー:", error.message);
    return "📰 ニュース情報の取得に失敗しました。";
  }
};

// ✅ Discordへ送信
const sendDailyReport = async (client) => {
  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel) {
    console.error("⚠️ 指定されたチャンネルが見つかりません");
    return;
  }

  const weather = await getDailyWeather();
  const news = await getDailyNews();

  await channel.send(`${weather}\n\n${news}`);
};

module.exports = {
  sendDailyReport,
};
