require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const path = require('path');

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;
const ADMIN_ID = process.env.ADMIN_ID;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const isAdmin = String(chatId) === String(ADMIN_ID);

  const keyboard = {
    reply_markup: {
      keyboard: [
        [
          {
            text: isAdmin ? 'Админ-панель' : 'Перейти к ассортименту',
            web_app: {
              url: isAdmin ? `${WEBAPP_URL}/admin` : `${WEBAPP_URL}/catalog`
            }
          }
        ]
      ],
      resize_keyboard: true
    }
  };

  bot.sendMessage(chatId, 'Добро пожаловать в Mlt Drinks!', keyboard);
});

// WebApp Express-сервер
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
