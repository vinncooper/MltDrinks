import { Telegraf, Markup } from 'telegraf'
import dotenv from 'dotenv'
dotenv.config()

const bot = new Telegraf(process.env.BOT_TOKEN)
const adminId = Number(process.env.ADMIN_ID)

bot.start((ctx) => {
  const isAdmin = ctx.from.id === adminId
  const keyboard = []

  if (isAdmin) {
    keyboard.push(
      [Markup.button.webApp('Админ-панель', `${process.env.WEBAPP_URL}/admin.html`)],
      [Markup.button.webApp('Каталог', `${process.env.WEBAPP_URL}/index.html`)]
    )
  } else {
    keyboard.push([
      Markup.button.webApp('Перейти к ассортименту', `${process.env.WEBAPP_URL}/index.html`)
    ])
  }

  ctx.reply('Выберите действие:', Markup.keyboard(keyboard).resize())
})

bot.launch()
console.log('🤖 Бот запущен')

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
