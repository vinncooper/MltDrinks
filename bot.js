const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const webAppUrl = process.env.WEBAPP_URL;
const adminPanelUrl = `${webAppUrl}/admin`;

bot.onText(/\/start/, (msg) => {
  const isAdmin = msg.from.id.toString() === process.env.ADMIN_ID;
  const buttons = [
    [{ text: "🛒 Открыть каталог", web_app: { url: webAppUrl } }]
  ];
  if (isAdmin) {
    buttons.push([{ text: "🛠 Админ-панель", web_app: { url: adminPanelUrl } }]);
  }
  bot.sendMessage(msg.chat.id, `Добро пожаловать в Mlt Drinks`, {
    reply_markup: {
      keyboard: buttons,
      resize_keyboard: true
    }
  });
});
