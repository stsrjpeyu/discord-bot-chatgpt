const { Client, GatewayIntentBits } = require("discord.js");
const { ask } = require("./ai");
const { sendDailyReport } = require("./schedulerTasks");
require("dotenv").config();
const cron = require("node-cron");

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const TRIGGER_MESSAGE = process.env.TRIGGER_MESSAGE || "!P";
const CHANNEL_ID = process.env.DAILY_REPORT_CHANNEL_ID;

bot.login(process.env.DISCORD_BOT_TOKEN);

bot.on("ready", () => {
  console.log("✅ The AI bot is online");

  // ⏰ 毎日8:30に定期レポートを送信
  cron.schedule("30 8 * * *", async () => {
    try {
      console.log("🕗 定期レポートを送信します");
      await sendDailyReport(bot);
    } catch (err) {
      console.error("❌ 定期レポート送信エラー:", err.message);
    }
  });
});

bot.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content;
  if (!content.startsWith(TRIGGER_MESSAGE)) return;

  const query = content.replace(TRIGGER_MESSAGE, "").trim();
  if (!query) return;

  console.log("🚀 ユーザーからの質問:", query);
  message.channel.sendTyping();

  try {
    const response = await ask(query);
    console.log("🤖 GPT応答:", response);
    message.channel.send(response);
  } catch (err) {
    console.error("❌ 応答エラー:", err.message);
    message.channel.send("⚠️ 回答中にエラーが発生しました。しばらくしてから再試行してください。");
  }
});
