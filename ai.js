const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ask = async (question) => {
  console.log("AI process ...");
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: question }],
      temperature: 0.7,
    });

    console.log("AI processing finish");
    return response.choices[0].message.content;
  } catch (err) {
    console.error("OpenAI API Error:", err.message); // ← ここでエラーをログ出力
    return "⚠️ OpenAI APIの呼び出しに失敗しました。（理由: " + err.message + "）";
  }
};

module.exports = {
  ask,
};
