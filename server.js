import express from "express";
import { Bot, webhookCallback } from "grammy";
import dotenv from "dotenv";
dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN);

// --- Ваши команды и обработчики бота ---
const ADMIN_ID = 2010575827;

bot.command("start", async (ctx) => {
  const keyboard = ctx.from.id === ADMIN_ID
    ? [
        [{ text: "Админ-панель", web_app: { url: "https://mltdrinks.onrender.com/admin.html" } }],
        [{ text: "Каталог", web_app: { url: "https://mltdrinks.onrender.com/index.html" } }],
      ]
    : [
        [{ text: "Каталог", web_app: { url: "https://mltdrinks.onrender.com/index.html" } }],
      ];
  await ctx.reply("Выберите действие:", {
    reply_markup: { inline_keyboard: keyboard }
  });
});

// --- Express + WebApp static ---
const app = express();
app.use(express.json());
app.use(express.static("public"));

// --- Webhook для Telegram ---
app.use(`/bot${process.env.BOT_TOKEN}`, webhookCallback(bot, "express"));

// --- Старт сервера ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Сервер запущен на порту", PORT);
});
