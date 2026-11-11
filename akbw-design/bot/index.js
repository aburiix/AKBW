import dotenv from "dotenv";
import {
  message
} from "telegraf/filters";
import {
  help,
  info,
  orders,
  start,
  text,
  history,
  checkWorker,
  handleCallbackQuery,
} from "./fsn.js";
import {
  Telegraf
} from "telegraf";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.use(checkWorker);

bot.hears("Bugungi buyurtmalar", orders);
bot.hears("Hisobotlar", history);

bot.command("start", start);

bot.command("help", help);

bot.command("info", info);

bot.on(message("text"), text);
bot.on("callback_query", handleCallbackQuery);

bot.launch();
