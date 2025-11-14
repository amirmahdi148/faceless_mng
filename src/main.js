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

export const bot = new Bot(BOT_TOKEN);
// میدل‌ور لاگر برای لاگ کردن پیام‌ها
bot.use(logger);

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

bot.start();
console.log('✅ Bot is running...');
initSchedulers();
