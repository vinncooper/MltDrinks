import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { webhookCallback } from 'grammy';
import bot from './bot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, 'public');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static(publicPath));
app.use(`/bot${process.env.BOT_TOKEN}`, webhookCallback(bot));

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});