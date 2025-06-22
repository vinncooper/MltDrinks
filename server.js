const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const bot = new TelegramBot(process.env.BOT_TOKEN);
const ADMIN_ID = process.env.ADMIN_ID;

const db = new sqlite3.Database("./db/mlt.db");

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "public", "admin.html")));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.get("/products", (req, res) => {
  db.all("SELECT * FROM products", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get("/manager-action", (req, res) => {
  db.get("SELECT * FROM settings WHERE key = 'contact_action'", (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ action: row?.value || "tel:+79891791163" });
  });
});

app.post("/manager-action", (req, res) => {
  const { action } = req.body;
  db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ['contact_action', action], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.post("/add-product", (req, res) => {
  const { name, image_url, category, price, volume, in_stock, min_order, is_top } = req.body;
  db.run(`INSERT INTO products (name, image_url, category, price, volume, in_stock, min_order, is_top)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, image_url, category, price, volume, in_stock, min_order, is_top], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
