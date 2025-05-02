const { Client, GatewayIntentBits } = require("discord.js");
const { ask } = require("./ai");
const { googleSearch } = require("./googleSearch");
require("dotenv").config();

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const TRIGGER_MESSAGE = process.env.TRIGGER_MESSAGE;

bot.login(process.env.DISCORD_BOT_TOKEN);

bot.on("ready", () => {
  console.log("The AI bot is online");
});

bot.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content;
  if (content.startsWith(TRIGGER_MESSAGE)) {
    const query = content.replace(TRIGGER_MESSAGE, "").trim();
    if (!query) return;

    message.channel.sendTyping();
    console.log("🚀 NOOB request: ", query);

    // キーワードから検索が必要か判断
    const searchKeywords = ["天気", "ニュース", "何", "いつ", "誰", "どこ", "気温", "検索"];
    const needSearch = searchKeywords.some((keyword) => query.includes(keyword));

    let context = "";
    if (needSearch) {
      console.log("🔍 実行: Google検索");
      const searchResult = await googleSearch(query);
      context = `以下はGoogle検索結果です:\n${searchResult}\n\nこれを参考にしてください。`;
    }

    const response = await ask(`${context}\n質問: ${query}`);
    console.log("🤖 BOT response: ", response);
    message.channel.send(response);
  }
});
