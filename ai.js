const { OpenAI } = require("openai");
const { googleSearch } = require("./googleSearch");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ユーザーID別キャラ設定
const getSystemPrompt = (userId) => {
  // 五つ子の次女：ID 440854650657439754
  if (userId === "440854650657439754") {
    return (
      "あなたは五つ子の次女で、強気で自信家、情熱的で一途な性格です。家族思いで世話焼きな一面もあり、" +
      "おしゃれ好きで可愛いものに目がありません。ややぶっきらぼうな口調で語尾は強めにしてください。" +
      "質問に対して検索結果も踏まえてわかりやすく、あなたらしい口調で答えてください。"
    );
  }

  // デフォルトの口調
  return "あなたは親切で丁寧なアシスタントです。検索結果も参考にしながら、質問に対してわかりやすく正確に答えてください。";
};

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
    return question; // フォールバック
  }
};

// メイン関数：ユーザーIDでキャラ切り替え
const ask = async (question, userId) => {
  console.log("AI process ...");

  try {
    const searchQuery = await extractKeywords(question);
    console.log("🔍 抽出された検索キーワード:", searchQuery);

    let searchResultsText = "";
    try {
      const searchResults = await googleSearch(searchQuery);
      searchResultsText = `\n\n【検索結果の要約】\n${searchResults}`;
    } catch (searchErr) {
      console.warn("⚠️ Web検索に失敗:", searchErr.message);
      searchResultsText = "\n\n※検索に失敗しましたが、可能な限り回答します。";
    }

    const systemPrompt = getSystemPrompt(userId);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${question}\n${searchResultsText}` }
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
