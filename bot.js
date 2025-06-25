import { Bot, InlineKeyboard } from 'grammy';
import dotenv from 'dotenv';
dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN);
const ADMIN_ID = 2010575827;

bot.command('start', async (ctx) => {
  const keyboard = new InlineKeyboard();
  if (ctx.from.id === ADMIN_ID) {
    keyboard.text('Админ-панель', 'admin');
    keyboard.text('Каталог', 'catalog');
  } else {
    keyboard.text('Каталог', 'catalog');
  }
  await ctx.reply('Выберите действие:', {
    reply_markup: keyboard
  });
});

bot.callbackQuery('catalog', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply('Открыть каталог:', {
    reply_markup: {
      inline_keyboard: [[{ text: 'Перейти', web_app: { url: 'https://mltdrinks.onrender.com/index.html' } }]]
    }
  });
});

bot.callbackQuery('admin', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply('Открыть админ-панель:', {
    reply_markup: {
      inline_keyboard: [[{ text: 'Перейти', web_app: { url: 'https://mltdrinks.onrender.com/admin.html' } }]]
    }
  });
});

export default bot;
