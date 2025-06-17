from aiogram import Bot, Dispatcher, F
from aiogram.types import Message, WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.context import FSMContext
from aiogram.fsm.storage.memory import MemoryStorage
import asyncio
import logging

# 🔐 Настройки
BOT_TOKEN = "ТВОЙ_ТОКЕН"
ADMIN_ID = 2010575827
ADMIN_PASSWORD = "1234"  # ← Установи нужный пароль

CATALOG_URL = "https://vinncooper.github.io/MltDrinks/catalog.html"
ADMIN_URL = "https://vinncooper.github.io/MltDrinks/admin.html"

# FSM Состояние для запроса пароля
class AdminAuth(StatesGroup):
    waiting_for_password = State()

# Инициализация
bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher(storage=MemoryStorage())
logging.basicConfig(level=logging.INFO)


@dp.message(F.text.lower() == "/start")
async def start_handler(message: Message, state: FSMContext):
    if message.from_user.id == ADMIN_ID:
        await message.answer("🔐 Введите пароль для доступа к админ-панели:")
        await state.set_state(AdminAuth.waiting_for_password)
    else:
        # Обычный пользователь
        keyboard = ReplyKeyboardMarkup(keyboard=[
            [KeyboardButton(text="🌟 Перейти к ассортименту", web_app=WebAppInfo(url=CATALOG_URL))]
        ], resize_keyboard=True)
        await message.answer("Добро пожаловать в MLT Drinks!\nОткрой каталог ниже:", reply_markup=keyboard)


@dp.message(AdminAuth.waiting_for_password)
async def process_password(message: Message, state: FSMContext):
    if message.text == ADMIN_PASSWORD:
        # Показываем админ-клавиатуру
        keyboard = ReplyKeyboardMarkup(keyboard=[
            [KeyboardButton(text="🌟 Перейти к ассортименту", web_app=WebAppInfo(url=CATALOG_URL))],
            [KeyboardButton(text="🔑 Админ-панель", web_app=WebAppInfo(url=ADMIN_URL))]
        ], resize_keyboard=True)
        await message.answer("✅ Пароль принят. Доступ к админ-панели открыт.", reply_markup=keyboard)
        await state.clear()
    else:
        await message.answer("❌ Неверный пароль. Попробуйте снова.")


async def main():
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
