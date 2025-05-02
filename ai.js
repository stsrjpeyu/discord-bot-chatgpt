const { OpenAI } = require("openai");
const { googleSearch } = require("./googleSearch");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ask = async (question) => {
  console.log("AI process ...");

  let searchResultsText = "";
  try {
    console.log("🔍 Web検索を実行します...");
    const searchResults = await googleSearch(question); // 配列で複数件受け取る
    searchResultsText = searchResults
      .slice(0, 3)
      .map((item, index) => `【検索${index + 1}】${item.title}\n${item.snippet}\n${item.link}`)
      .join("\n\n");
  } catch (searchErr) {
    console.warn("⚠️ Web検索に失敗:", searchErr.message);
    searchResultsText = "※検索結果の取得に失敗しましたが、可能な範囲で回答してください。";
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "あなたは質問に答えるAIアシスタントです。ユーザーの質問に対し、以下に与えられる検索結果を必ず参考にして、正確で簡潔な回答を出してください。",
        },
        {
          role: "user",
          content: `質問: ${question}\n\n${searchResultsText}`,
        },
      ],
      temperature: 0.7,
    });

    console.log("AI processing finish");
    return response.choices[0].message.content;
  } catch (err) {
    console.error("OpenAI API Error:", err.message);
    return "⚠️ OpenAI APIの呼び出しに失敗しました。（理由: " + err.message + "）";
  }
};

module.exports = {
  ask,
};
