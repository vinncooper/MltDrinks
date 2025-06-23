import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import 'dotenv/config';

const bot = new Telegraf(process.env.BOT_TOKEN);

const isAdmin = (ctx) => ctx.from.id === 2010575827;

bot.start((ctx) => {
  const buttons = [];

  if (isAdmin(ctx)) {
    buttons.push([{ text: '🛠 Админ-панель', web_app: { url: 'https://mltdrinks.onrender.com/admin.html' } }]);
  }

  buttons.push([{ text: '🛒 Перейти к ассортименту', web_app: { url: 'https://mltdrinks.onrender.com' } }]);

  ctx.reply('Добро пожаловать в Mlt Drinks!', {
    reply_markup: {
      keyboard: buttons,
      resize_keyboard: true,
    },
  });
});

bot.on(message('web_app_data'), async (ctx) => {
  const data = ctx.message.web_app_data.data;
  console.log('📦 Данные из WebApp:', data);
});

export { bot };
