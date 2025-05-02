const { OpenAI } = require("openai");
const { googleSearch } = require("./googleSearch");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ask = async (question) => {
  console.log("🧠 AI process ...");

  const lowerCaseQuestion = question.toLowerCase();
  const needsSearch =
    lowerCaseQuestion.includes("ニュース") ||
    lowerCaseQuestion.includes("天気") ||
    lowerCaseQuestion.includes("今日") ||
    lowerCaseQuestion.includes("速報") ||
    lowerCaseQuestion.includes("最近");

  try {
    let searchResultsText = "";

    if (needsSearch) {
      console.log("🔍 Web検索を実行します...");
      try {
        const searchResults = await googleSearch(question);
        searchResultsText = `\n\n【検索結果の要約】\n${searchResults}`;
      } catch (searchErr) {
        console.warn("⚠️ Web検索に失敗しました:", searchErr.message);
        searchResultsText = "\n\n※検索結果の取得に失敗しましたが、知っている範囲で回答してください。";
      }
    } else {
      console.log("🔎 Web検索はスキップされました。");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "ユーザーの質問に対して正確かつ簡潔に答えてください。" },
        { role: "user", content: question + searchResultsText },
      ],
      temperature: 0.7,
    });

    console.log("✅ AI processing finish");
    return response.choices[0].message.content;
  } catch (err) {
    console.error("❌ OpenAI API Error:", err.message);
    return "⚠️ OpenAI APIの呼び出しに失敗しました。（理由: " + err.message + "）";
  }
};

module.exports = {
  ask,
};
