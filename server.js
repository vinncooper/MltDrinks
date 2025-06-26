import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let db;
// Открываем базу данных (mlt.db)
(async () => {
    db = await open({
        filename: path.join(__dirname, "db", "mlt.db"),
        driver: sqlite3.Database
    });

    // Таблица categories
    await db.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )
    `);

    // Таблица products
    await db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            image_url TEXT,
            category_id INTEGER,
            price REAL,
            volume TEXT,
            in_stock BOOLEAN,
            min_order INTEGER,
            is_top BOOLEAN,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )
    `);
})();


// --- Категории ---
// Получить все категории
app.get("/api/categories", async (req, res) => {
    const categories = await db.all("SELECT * FROM categories");
    res.json(categories);
});

// Добавить новую категорию
app.post("/api/categories", async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Название обязательно" });
    const result = await db.run("INSERT INTO categories (name) VALUES (?)", [name]);
    res.json({ id: result.lastID, name });
});

// --- Товары ---
// Получить все товары
app.get("/api/products", async (req, res) => {
    const products = await db.all("SELECT * FROM products");
    res.json(products);
});

// Добавить товар
app.post("/api/products", async (req, res) => {
    const {
        name, image_url, category_id, price,
        volume, in_stock, min_order, is_top
    } = req.body;
    if (!name || !category_id) return res.status(400).json({ error: "Обязательные поля отсутствуют" });

    const result = await db.run(
        `INSERT INTO products
        (name, image_url, category_id, price, volume, in_stock, min_order, is_top)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            name, image_url || "", category_id, price || 0,
            volume || "", in_stock ? 1 : 0, min_order || 1, is_top ? 1 : 0
        ]
    );
    res.json({ id: result.lastID, ...req.body });
});

// [Опционально] Удалить товар
app.delete("/api/products/:id", async (req, res) => {
    await db.run("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ success: true });
});

// [Опционально] Редактировать товар
app.put("/api/products/:id", async (req, res) => {
    const {
        name, image_url, category_id, price,
        volume, in_stock, min_order, is_top
    } = req.body;
    await db.run(
        `UPDATE products SET
        name=?, image_url=?, category_id=?, price=?, volume=?, in_stock=?, min_order=?, is_top=?
        WHERE id=?`,
        [
            name, image_url || "", category_id, price || 0,
            volume || "", in_stock ? 1 : 0, min_order || 1, is_top ? 1 : 0,
            req.params.id
        ]
    );
    res.json({ success: true });
});

// [Старт сервера]
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
