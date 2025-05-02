const { OpenAI } = require("openai");
const { googleSearch } = require("./googleSearch");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ステップ1: キーワード抽出
const extractKeywords = async (question) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "ユーザーの質問からGoogle検索に適した3〜5語のキーワードを抽出してください。スペース区切りで返答してください。"
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.5,
    });
    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("❌ キーワード抽出エラー:", err.message);
    return question; // フォールバックとして元の質問を使う
  }
};

const ask = async (question) => {
  console.log("AI process ...");

  try {
    // ステップ2: Google検索用のキーワード抽出
    const searchQuery = await extractKeywords(question);
    console.log("🔍 抽出された検索キーワード:", searchQuery);

    // ステップ3: Google検索
    let searchResultsText = "";
    try {
      const searchResults = await googleSearch(searchQuery);
      searchResultsText = `\n\n【検索結果の要約】\n${searchResults}`;
    } catch (searchErr) {
      console.warn("⚠️ Web検索に失敗:", searchErr.message);
      searchResultsText = "\n\n※検索に失敗しましたが、可能な限り回答します。";
    }

    // ステップ4: GPTに最終回答させる
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "ユーザーの質問に対して、検索結果も参考にしながらわかりやすく答えてください。"
        },
        {
          role: "user",
          content: `${question}\n${searchResultsText}`
        }
      ],
      temperature: 0.7,
    });

    console.log("AI processing finish");
    return response.choices[0].message.content;
  } catch (err) {
    console.error("OpenAI API Error:", err.message);
    return `⚠️ OpenAI APIの呼び出しに失敗しました。（理由: ${err.message}）`;
  }
};

module.exports = {
  ask,
};
