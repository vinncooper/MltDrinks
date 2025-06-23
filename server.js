import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { webhookCallback } from 'grammy';
import { bot } from './bot.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Определим абсолютный путь к public/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, 'public');

app.use(express.static(publicPath));
app.use(`/bot${process.env.BOT_TOKEN}`, webhookCallback(bot, 'express'));

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
