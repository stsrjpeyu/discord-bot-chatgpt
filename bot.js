const { Client, GatewayIntentBits } = require("discord.js");
const { ask } = require("./ai");
require("dotenv").config();

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // メッセージ内容を取得するために必要
  ],
});

const TRIGGER_MESSAGE = process.env.TRIGGER_MESSAGE;

bot.login(process.env.DISCORD_BOT_TOKEN);

bot.on("ready", () => {
  console.log("The AI bot is online");
});

bot.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Bot自身のメッセージを無視
  if (message.content.includes(TRIGGER_MESSAGE)) {
    console.log("🚀 NOOB request: ", message.content);
    const question = message.content.split(TRIGGER_MESSAGE)[1];
    if (question) {
      message.channel.sendTyping();
      const response = await ask(question);
      console.log("🚀 BOT response: ", response);
      message.channel.send(response);
    }
  }
});
