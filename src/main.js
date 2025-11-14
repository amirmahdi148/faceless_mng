import { Bot } from 'grammy';
import { BOT_TOKEN } from './config.js';
import { startCommand } from './commands/start.js';
import { helpCommand } from './commands/help.js';
import { messageHandler } from './handlers/messageHandler.js';
import { logger } from './middlewares/logger.js';
import { websiteCommand } from './commands/website.js';
import { plansCommand } from './commands/plans.js';
import { paymentCommand } from './commands/payment.js';
import { initSchedulers } from './utils/scheduler.js';
import express from 'express'
export const bot = new Bot(BOT_TOKEN);
// میدل‌ور لاگر برای لاگ کردن پیام‌ها
bot.use(logger);
const app = express();
// دستورات اصلی
bot.command('start', startCommand);
bot.command('help', helpCommand);
bot.command('website', websiteCommand);
bot.command('payment', paymentCommand);
bot.command('plans', plansCommand);

bot.callbackQuery('show_plans', async (ctx) => {
  await ctx.answerCallbackQuery(); // برای حذف لودینگ دکمه
  await plansCommand(ctx);

});
bot.callbackQuery('payment_method', async (ctx) => {
  await ctx.answerCallbackQuery();
  await paymentCommand(ctx);
});

// هندل پیام‌های معمولی
bot.on('message', messageHandler);

app.use(express.json());
app.use("/webhook", (req, res) => {
  bot.handleUpdate(req.body, res)
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // ست کردن webhook روی تلگرام
  await bot.api.setWebhook(`https://https://manager-bot-backend.onrender.com/webhook`);
});
console.log('✅ Bot is running...');
initSchedulers();
