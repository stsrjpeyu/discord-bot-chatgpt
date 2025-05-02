const { OpenAI } = require("openai");
const { googleSearch } = require("./googleSearch");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ask = async (question) => {
  console.log("AI process ...");

  const lowerCaseQuestion = question.toLowerCase();
  const needsSearch =
    lowerCaseQuestion.includes("ニュース") ||
    lowerCaseQuestion.includes("天気") ||
    lowerCaseQuestion.includes("今日") ||
    lowerCaseQuestion.includes("速報") ||
    lowerCaseQuestion.includes("最近") ||
    lowerCaseQuestion.includes("何") ||
    lowerCaseQuestion.includes("いつ") ||
    lowerCaseQuestion.includes("どこ") ||
    lowerCaseQuestion.includes("誰") ||
    lowerCaseQuestion.includes("気温") ||
    lowerCaseQuestion.includes("検索");

  try {
    const messages = [
      {
        role: "system",
        content: "ユーザーの質問に対して、正確で簡潔な情報を提供してください。"
      }
    ];

    if (needsSearch) {
      console.log("🔍 Web検索を実行します...");
      try {
        const searchResults = await googleSearch(question);
        messages.push({
          role: "system",
          content: `以下はGoogle検索から得られた情報です。\n${searchResults}\n\nこれを参考にしてユーザーの質問に答えてください。`
        });
      } catch (searchErr) {
        console.warn("⚠️ Web検索に失敗しました:", searchErr.message);
        messages.push({
          role: "system",
          content: "検索結果の取得に失敗しましたが、知
