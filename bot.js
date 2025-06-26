import { Bot, InlineKeyboard, webhookCallback } from "grammy";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const botToken = process.env.BOT_TOKEN || "7698057378:AAGYeWYqwO2Zys__wajlTFZ8rB33DR7Cl3U"; // твой токен
const adminId = 2010575827; // твой Telegram ID (замени если нужно)
const webAppUrl = "https://mltdrinks.onrender.com/index.html"; // твой WebApp
const adminWebAppUrl = "https://mltdrinks.onrender.com/admin.html"; // админ-панель

const bot = new Bot(botToken);

// Главное меню для покупателя
function getBuyerKeyboard() {
  return new InlineKeyboard().webApp("Каталог", webAppUrl);
}

// Главное меню для админа
function getAdminKeyboard() {
  return new InlineKeyboard()
    .webApp("Каталог", webAppUrl)
    .row()
    .webApp("Админ-панель", adminWebAppUrl);
}

// Приветствие при /start
bot.command("start", async (ctx) => {
  const isAdmin = ctx.from.id === adminId;
  await ctx.reply(
    "Добро пожаловать в Mlt Drinks!\nВыберите раздел:",
    {
      reply_markup: isAdmin ? getAdminKeyboard() : getBuyerKeyboard(),
    }
  );
});

// --- Обработка web_app данных (например, если что-то отправляется из WebApp) ---
bot.on("message:web_app_data", async (ctx) => {
  // ctx.message.web_app_data.data — данные из WebApp (JSON-строка)
  await ctx.reply(`Данные приняты: ${ctx.message.web_app_data.data}`);
});

// --- Запуск через webhook + Express (современно и удобно для Render) ---
const app = express();
app.use(express.json());

// Устанавливаем webhook для граммотной работы на Render/Heroku
app.use(`/bot${botToken}`, webhookCallback(bot, "express"));

// (по желанию, простой тестовый роут)
app.get("/", (req, res) => res.send("Mlt Drinks Bot работает!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 Бот запущен на порту ${PORT}`);
  // Webhook устанавливать вручную не надо, если запускаешь на Render c публичным URL!
});
