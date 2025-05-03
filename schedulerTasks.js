const { googleSearch } = require("./googleSearch");
const axios = require("axios");
require("dotenv").config();

const CHANNEL_ID = process.env.DAILY_REPORT_CHANNEL_ID;

const LOCATIONS = [
  { name: "横浜市", icon: "🛳️", lat: 35.4437, lon: 139.6380 },
  { name: "東京都", icon: "🗼", lat: 35.6895, lon: 139.6917 },
  { name: "つくば市", icon: "🔬", lat: 36.0836, lon: 140.0766 },
];

const getDailyWeather = async () => {
  const results = [];

  for (const loc of LOCATIONS) {
    try {
      const res = await axios.get("https://api.open-meteo.com/v1/forecast", {
        params: {
          latitude: loc.lat,
          longitude: loc.lon,
          hourly: "temperature_2m,weathercode,windspeed_10m",
          timezone: "Asia/Tokyo",
        },
      });

      const { hourly } = res.data;
      const { time, temperature_2m, weathercode, windspeed_10m } = hourly;

      // 午前（9時）と午後（15時）のインデックスを取得
      const today = new Date().toISOString().split("T")[0];
      const getHourIndex = (hourStr) =>
        time.findIndex((t) => t.startsWith(today) && t.includes(`${hourStr}:00`));

      const idx9 = getHourIndex("09");
      const idx15 = getHourIndex("15");

      const summary = {
        morning: {
          temp: temperature_2m[idx9],
          code: weathercode[idx9],
          wind: windspeed_10m[idx9],
        },
        afternoon: {
          temp: temperature_2m[idx15],
          code: weathercode[idx15],
          wind: windspeed_10m[idx15],
        },
      };

      const toEmoji = (code) => {
        if ([0].includes(code)) return "☀️"; // 晴れ
        if ([1, 2, 3].includes(code)) return "🌤";
        if ([45, 48].includes(code)) return "🌫️";
        if ([51, 53, 55, 61, 63].includes(code)) return "🌦";
        if ([80, 81, 82].includes(code)) return "🌧";
        if ([71, 73, 75, 85, 86].includes(code)) return "❄️";
        return "☁️";
      };

      results.push(
        `${loc.icon} ${loc.name}:\n` +
        `　午前 ${toEmoji(summary.morning.code)} ${summary.morning.temp}℃ / 風 ${summary.morning.wind}m/s\n` +
        `　午後 ${toEmoji(summary.afternoon.code)} ${summary.afternoon.temp}℃ / 風 ${summary.afternoon.wind}m/s`
      );
    } catch (err) {
      console.error(`❌ 天気情報取得エラー (${loc.name}):`, err.message);
      results.push(`${loc.icon} ${loc.name}: 天気情報取得に失敗しました。`);
    }
  }

  return `🌤 今日の天気（Open-Meteo API）\n${results.join("\n\n")}`;
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
