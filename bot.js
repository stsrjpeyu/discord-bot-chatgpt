const { Client, GatewayIntentBits } = require("discord.js");
const { ask } = require("./ai");
require("dotenv").config();

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const TRIGGER_MESSAGE = process.env.TRIGGER_MESSAGE || "!P";
const TOKEN = process.env.DISCORD_BOT_TOKEN;

bot.login(TOKEN);

bot.on("ready", () => {
  console.log("✅ The AI bot is online");
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
    console.error("❌ エラー:", err.message);
    message.channel.send("⚠️ 回答中にエラーが発生しました。後でもう一度試してください。");
  }
});
