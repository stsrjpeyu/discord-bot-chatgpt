const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
  {
    name: 'chat',
    description: 'AIに質問します',
    options: [
      {
        name: 'message',
        type: 3, // STRING
        description: '質問内容',
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log('⏳ スラッシュコマンドを登録中...');

    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands },
    );

    console.log('✅ スラッシュコマンドを登録しました');
  } catch (error) {
    console.error('❌ スラッシュコマンドの登録に失敗しました:', error);
  }
})();
