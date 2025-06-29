import dotenv from 'dotenv';
dotenv.config();

import { Telegraf, Markup } from 'telegraf';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Для __dirname в ES-модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Получаем переменные из .env
const TG_TOKEN = process.env.TG_TOKEN;
const TG_ADMIN_ID = process.env.TG_ADMIN_ID;

// Инициализация базы данных
const db = new sqlite3.Database(path.join(__dirname, 'database', 'mlt.db'));

// Инициализация бота
const bot = new Telegraf(TG_TOKEN);

// Приветствие новым пользователям
bot.start(async ctx => {
  try {
    // Сохраняем пользователя
    db.run('INSERT OR IGNORE INTO users (id, username, first_name) VALUES (?, ?, ?)', [
      ctx.from.id, ctx.from.username || '', ctx.from.first_name || ''
    ]);
    // Приветствие + ходовой товар (из "is_hot" или "is_sale")
    db.all('SELECT * FROM products WHERE is_hot=1 OR is_sale=1 ORDER BY is_hot DESC, is_sale DESC, id DESC LIMIT 3', [], (err, rows) => {
      let msg = `👋 Добро пожаловать в *Mlt Drinks*!\n\nВот наши популярные товары:\n`;
      rows.forEach(p => msg += `\n*${p.name}* — ${p.price}₽ (${p.in_stock ? 'В наличии' : 'Нет в наличии'})`);
      msg += `\n\nНажмите /catalog для просмотра всего ассортимента.`;
      ctx.replyWithMarkdown(msg, Markup.keyboard([['Каталог', 'Связаться с менеджером']]).resize());
    });
  } catch(e) { ctx.reply('Ошибка приветствия'); }
});

// Быстрые кнопки + каталог
bot.hears(['Каталог', '/catalog'], async ctx => {
  db.all('SELECT * FROM categories', [], (err, cats) => {
    const kb = cats.map(c=>[c.name]);
    ctx.reply('Выберите категорию:', Markup.keyboard([...kb, ['Хиты продаж', 'Акции', 'Назад']]).resize());
  });
});

// Показываем товары по категории
bot.hears(/.+/, async ctx => {
  let name = ctx.message.text;
  // Проверяем, категория или спецраздел
  db.get('SELECT * FROM categories WHERE name=?', [name], (err, cat) => {
    if (cat) {
      db.all('SELECT * FROM products WHERE category_id=? ORDER BY is_hot DESC, is_sale DESC, name', [cat.id], (err, prods) => {
        if (!prods.length) return ctx.reply('В этой категории пока нет товаров.');
        prods.forEach(p => {
          ctx.replyWithPhoto(p.img, {
            caption: `*${p.name}*\n${p.price}₽\nОстаток: ${p.stock_qty} ${p.in_pack?'уп.':'шт.'}\n${p.in_stock?'🟢 В наличии':'🔴 Нет в наличии'}\n`,
            parse_mode: 'Markdown'
          });
        });
      });
    } else if (name === 'Хиты продаж') {
      db.all('SELECT * FROM products WHERE is_hot=1 ORDER BY id DESC', [], (err, prods) => {
        if (!prods.length) return ctx.reply('Хитов продаж пока нет.');
        prods.forEach(p => ctx.replyWithPhoto(p.img, {caption:`*${p.name}*\n${p.price}₽\nОстаток: ${p.stock_qty} ${p.in_pack?'уп.':'шт.'}\n${p.in_stock?'🟢 В наличии':'🔴 Нет в наличии'}`,parse_mode:'Markdown'}));
      });
    } else if (name === 'Акции') {
      db.all('SELECT * FROM products WHERE is_sale=1 ORDER BY id DESC', [], (err, prods) => {
        if (!prods.length) return ctx.reply('Акций пока нет.');
        prods.forEach(p => ctx.replyWithPhoto(p.img, {caption:`*${p.name}*\n${p.price}₽\nОстаток: ${p.stock_qty} ${p.in_pack?'уп.':'шт.'}\n${p.in_stock?'🟢 В наличии':'🔴 Нет в наличии'}`,parse_mode:'Markdown'}));
      });
    } else if (name === 'Связаться с менеджером') {
      db.all('SELECT * FROM managers', [], (err, mans) => {
        let txt = 'Наши менеджеры:\n';
        mans.forEach(m=>{
          txt += `\n${m.name} `;
          if (m.phone) txt += `📱: ${m.phone} `;
          if (m.telegram) txt += `TG: @${m.telegram.replace('@','')} `;
          if (m.whatsapp) txt += `WA: ${m.whatsapp}`;
        });
        ctx.reply(txt);
      });
    } else if (name === 'Назад') {
      ctx.reply('Главное меню', Markup.keyboard([['Каталог', 'Связаться с менеджером']]).resize());
    }
  });
});

// Админ: уведомления о низком остатке (например, по кнопке или по расписанию)
const notifyAdminLowStock = () => {
  db.all('SELECT * FROM products WHERE stock_qty<=5 AND in_stock=1', [], (err, prods) => {
    if (prods.length) {
      let msg = '⚠️ Осталось мало товара:\n';
      prods.forEach(p=>msg+=`\n${p.name}: ${p.stock_qty} шт`);
      bot.telegram.sendMessage(TG_ADMIN_ID, msg);
    }
  });
};

// Команда для ручной проверки остатков
bot.command('lowstock', ctx => {
  if (ctx.from.id == TG_ADMIN_ID) {
    db.all('SELECT * FROM products WHERE stock_qty<=5 AND in_stock=1', [], (err, prods) => {
      if (!prods.length) return ctx.reply('Все товары в норме');
      let msg = '⚠️ Осталось мало товара:\n';
      prods.forEach(p=>msg+=`\n${p.name}: ${p.stock_qty} шт`);
      ctx.reply(msg);
    });
  }
});

// (Можно добавить cron и автоматизацию, если потребуется)

// Запуск
bot.launch();
console.log('TG Bot запущен');
