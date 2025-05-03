const { Client, GatewayIntentBits, Events } = require("discord.js");
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
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

bot.login(DISCORD_BOT_TOKEN);

bot.on("ready", () => {
  console.log("✅ The AI bot is online");

  // ⏰ 毎日 8:30 JST に定期レポートを送信（Asia/Tokyo timezone 明示）
cron.schedule(
  "41 15 * * *", // ← 14:45 JST に実行
  async () => {
    try {
      console.log("🧪 テスト実行: 定期レポート送信テスト（14:45 JST）");
      await sendDailyReport(bot);
      console.log("✅ テスト送信成功");
    } catch (err) {
      console.error("❌ テスト送信エラー:", err.message);
    }
  },
  {
    timezone: "Asia/Tokyo",
  }
);

  console.log("🕘 定期タスク登録完了");
});

// ✉️ メッセージによる質問対応
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

// 💬 スラッシュコマンド対応
bot.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ask") {
    const userMessage = interaction.options.getString("question");
    await interaction.deferReply();

    try {
      const response = await ask(userMessage);
      await interaction.editReply(response);
    } catch (err) {
      console.error("❌ スラッシュコマンド応答エラー:", err.message);
      await interaction.editReply("⚠️ 回答中にエラーが発生しました。");
    }
  }
});
