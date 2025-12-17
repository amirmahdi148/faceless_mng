
import { Bot } from 'grammy';
import express from 'express';

import { BOT_TOKEN } from './config.js';

import { startCommand } from './commands/start.js';


import { helpCommand } from './commands/help.js';


import { messageHandler } from './handlers/messageHandler.js';


import { logger } from './middlewares/logger.js';


import { websiteCommand } from './commands/website.js';


import { plansCommand } from './commands/plans.js';


import { paymentCommand } from './commands/payment.js';


import { initSchedulers } from './utils/scheduler.js';

if (!process.env.API_KEY) {
  throw new Error("❌ API_KEY is not set");
}


// ------------------- Express Setup --------------------
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------- Telegram Bot --------------------
export const bot = new Bot(BOT_TOKEN);

// Middlewares
bot.use(logger);

// Commands
bot.command("start", startCommand);
bot.command("help", helpCommand);
bot.command("website", websiteCommand);
bot.command("payment", paymentCommand);
bot.command("plans", plansCommand);

// Callback Queries
bot.callbackQuery("show_plans", async (ctx) => {
  await ctx.answerCallbackQuery();
  await plansCommand(ctx);
});

bot.callbackQuery("payment_method", async (ctx) => {
  await ctx.answerCallbackQuery();
  await paymentCommand(ctx);
});

// Message Handler
bot.on("message", async (ctx) => {
  messageHandler(ctx);
})


// ------------------- Express Routes --------------------
app.post("/login", async (req, res) => {
  const { otp, customer_id} = req.body;

  if (!customer_id || !otp) {
    return res.status(400).json({ Status: "Missing customer_id or otp" });
  }

  try {
    await bot.api.sendMessage(
      customer_id, // ← Telegram chat id
      `Hello, this is your login code: ${otp}\n<b>If you didn't request it, ignore this message.</b>`,
      { parse_mode: 'HTML' }

    );


    res.status(200).json({ Status: "Sent Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: "Error. Can't send message" });
  }
});



// ------------------- Start Everything --------------------
bot.catch((err) => {
  console.error("❌ BOT ERROR:", err);
});

bot.start();
console.log("🤖 Bot is running in polling mode");
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🌐 Express server running on port ${PORT}`);
});

// Start the Telegram bot


// Init schedulers
initSchedulers();
