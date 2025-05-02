const { OpenAI } = require("openai");
const { googleSearch } = require("./googleSearch");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ask = async (question) => {
  console.log("AI process ...");

  const lowerCaseQuestion = question.toLowerCase();
  const needsSearch = /ニュース|天気|速報|気温|予報|円相場|為替|今日|現在|今|事故|地震|台風/.test(lowerCaseQuestion);

  let searchResultsText = "";
  if (needsSearch) {
    console.log("🔍 Web検索を実行します...");
    try {
      const searchResults = await googleSearch(question);
      searchResultsText = `以下はWeb検索の結果です:\n${searchResults}\nこれに基づいて答えてください。`;
    } catch (searchErr) {
      console.warn("⚠️ Web検索に失敗:", searchErr.message);
      searchResultsText = "⚠️ Web検索に失敗しましたが、できる限り正確に回答してください。";
    }
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // GPT-4.1相当モデル
      messages: [
        {
          role: "system",
          content: searchResultsText
            ? searchResultsText
            : "ユーザーの質問に対して正確かつ簡潔に答えてください。",
        },
        { role: "user", content: question },
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
