import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

const bot = new Telegraf(process.env.BOT_TOKEN);
const adminId = process.env.ADMIN_ID;
const webAppUrl = process.env.WEBAPP_URL;

bot.start(async (ctx) => {
  const isAdmin = String(ctx.from.id) === String(adminId);

  const keyboard = {
    inline_keyboard: [
      [{ text: '🛒 Перейти к ассортименту', web_app: { url: webAppUrl } }],
      ...(isAdmin
        ? [[{ text: '🛠 Админ-панель', web_app: { url: `${webAppUrl}/admin` } }]]
        : [])
    ]
  };

  await ctx.reply(
    `Добро пожаловать в каталог Mlt Drinks, ${ctx.from.first_name}!`,
    { reply_markup: keyboard }
  );
});

bot.on(message('web_app_data'), async (ctx) => {
  const data = ctx.webAppData.data;
  console.log('Получены данные из WebApp:', data);
  await ctx.reply('Спасибо! Данные получены ✅');
});

bot.launch();
console.log('🤖 Бот запущен');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
