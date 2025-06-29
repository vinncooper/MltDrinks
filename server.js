import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

// Для поддержки __dirname в ES-модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// инициализация бд
const db = new sqlite3.Database(path.join(__dirname, 'database', 'mlt.db'));

const app = express();
// ... далее по коду

// --- ROUTES ---

// 1. Категории товаров
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories', [], (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

// 2. Товары (фильтрация по категории, названию, наличию, акции)
app.get('/api/products', (req, res) => {
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  if (req.query.category_id) {
    query += ' AND category_id=?';
    params.push(req.query.category_id);
  }
  if (req.query.name) {
    query += ' AND name LIKE ?';
    params.push('%' + req.query.name + '%');
  }
  if (req.query.in_stock) {
    query += ' AND in_stock=?';
    params.push(req.query.in_stock === '1' ? 1 : 0);
  }
  if (req.query.is_promo) {
    query += ' AND is_promo=?';
    params.push(1);
  }
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

// 3. Получить 1 товар
app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id=?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(row);
  });
});

// 4. Добавить товар (админ)
app.post('/api/products', (req, res) => {
  const { name, category_id, price, in_stock, stock_qty, in_pack, img, is_hot, is_promo } = req.body;
  db.run(
    `INSERT INTO products (name, category_id, price, in_stock, stock_qty, in_pack, img, is_hot, is_promo) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, category_id, price, in_stock, stock_qty, in_pack, img, is_hot, is_promo],
    function(err) {
      if (err) return res.status(500).json({error: err.message});
      res.json({ id: this.lastID });
    }
  );
});

// 5. Редактировать товар
app.put('/api/products/:id', (req, res) => {
  const { name, category_id, price, in_stock, stock_qty, in_pack, img, is_hot, is_promo } = req.body;
  db.run(
    `UPDATE products SET name=?, category_id=?, price=?, in_stock=?, stock_qty=?, in_pack=?, img=?, is_hot=?, is_promo=? WHERE id=?`,
    [name, category_id, price, in_stock, stock_qty, in_pack, img, is_hot, is_promo, req.params.id],
    function(err) {
      if (err) return res.status(500).json({error: err.message});
      res.json({ changed: this.changes });
    }
  );
});

// 6. Удалить товар
app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ deleted: this.changes });
  });
});

// 7. Добавить категорию
app.post('/api/categories', (req, res) => {
  const { name, is_main } = req.body;
  db.run(`INSERT INTO categories (name, is_main) VALUES (?, ?)`, [name, is_main || 0], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ id: this.lastID });
  });
});

// 8. Редактировать категорию
app.put('/api/categories/:id', (req, res) => {
  const { name, is_main } = req.body;
  db.run(
    `UPDATE categories SET name=?, is_main=? WHERE id=?`,
    [name, is_main || 0, req.params.id],
    function(err) {
      if (err) return res.status(500).json({error: err.message});
      res.json({ changed: this.changes });
    }
  );
});

// 9. Удалить категорию
app.delete('/api/categories/:id', (req, res) => {
  db.run('DELETE FROM categories WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ deleted: this.changes });
  });
});

// 10. Получить всех менеджеров
app.get('/api/managers', (req, res) => {
  db.all('SELECT * FROM managers', [], (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

// 11. Добавить менеджера
app.post('/api/managers', (req, res) => {
  const { name, phone } = req.body;
  db.run(`INSERT INTO managers (name, phone) VALUES (?, ?)`, [name, phone], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ id: this.lastID });
  });
});

// 12. Удалить менеджера
app.delete('/api/managers/:id', (req, res) => {
  db.run('DELETE FROM managers WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ deleted: this.changes });
  });
});

// 13. Получить админов
app.get('/api/admins', (req, res) => {
  db.all('SELECT * FROM admins', [], (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

// 14. Добавить админа (по tg_id)
app.post('/api/admins', (req, res) => {
  const { tg_id } = req.body;
  db.run(`INSERT INTO admins (tg_id) VALUES (?)`, [tg_id], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ id: this.lastID });
  });
});

// 15. Удалить админа
app.delete('/api/admins/:id', (req, res) => {
  db.run('DELETE FROM admins WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ deleted: this.changes });
  });
});

// 16. Для SPA (чтобы открывались страницы)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Запуск сервера ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MltDrinks server running on port ${PORT}`);
});
