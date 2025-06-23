import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { webhookCallback } from 'grammy';
import { bot } from './bot.js'; // импортируем настроенного бота

const app = express();
const PORT = process.env.PORT || 3000;

// Определяем путь к директории public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, 'public');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicPath)); // отдаём HTML/JS из public

// Telegram Webhook
app.use(`/bot${process.env.BOT_TOKEN}`, webhookCallback(bot, 'express'));

// Старт сервера
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
