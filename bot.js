import express from 'express';
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

const ADMIN_ID = process.env.ADMIN_ID;
const WEBAPP_URL = process.env.WEBAPP_URL;

app.use(express.json());

// Команда /start
bot.start((ctx) => {
  const isAdmin = ctx.from.id.toString() === ADMIN_ID;

  const keyboard = {
    inline_keyboard: [
      [{ text: '🛒 Перейти к ассортименту', web_app: { url: WEBAPP_URL } }],
      ...(isAdmin
        ? [[{ text: '🛠 Админ-панель', web_app: { url: `${WEBAPP_URL}/admin` } }]]
        : [])
    ]
  };

  ctx.reply(
    `Добро пожаловать, ${ctx.from.first_name}!`,
    { reply_markup: keyboard }
  );
});

// Обработка данных из WebApp
bot.on('message', async (ctx) => {
  if (ctx.webAppData) {
    console.log('Получены данные из WebApp:', ctx.webAppData.data);
    await ctx.reply('✅ Данные получены!');
  }
});

// Устанавливаем Webhook
const PORT = process.env.PORT || 3000;
const path = `/bot${process.env.BOT_TOKEN}`;
app.use(bot.webhookCallback(path));

// Запуск express-сервера
app.listen(PORT, async () => {
  const webhookUrl = `${WEBAPP_URL}${path}`;
  await bot.telegram.setWebhook(webhookUrl);
  console.log(`🚀 Webhook установлен: ${webhookUrl}`);
});
