import { InlineKeyboard } from 'grammy';

export const helpCommand = async (ctx) => {
  const keyboard = new InlineKeyboard().text('💎 نمایش پلن‌ها', 'show_plans');

  const message = `
📘 *راهنمای استفاده از Manager Bot*  

با من می‌تونی کانال‌هات رو به شکل هوشمند مدیریت کنی، تبلیغات تنظیم کنی و حتی پست‌هاتو زمان‌بندی کنی.  
دستورات اصلی من 👇  

💡 */start* — شروع و معرفی ربات  
ℹ️ */help* — نمایش همین راهنما  
🌐 */website* — نمایش پنل مدیریت آنلاین  

برای دیدن پلن‌ها و قابلیت‌های ویژه روی دکمه زیر بزن ⬇️
`;

  await ctx.reply(message, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
};
