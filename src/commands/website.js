export const websiteCommand = async (ctx) => {
  const message = `
🌐 <b>وب‌سایت رسمی Manager Bot</b>

مدیریت حرفه‌ای کانال‌ها و تبلیغات تلگرام در یک پنل هوشمند ⚙️  
از همین حالا وارد شو و همه‌چیز رو از یه جا کنترل کن:

👉 <a href="https://manager.faceless.ir">ManagerBot</a>
`;

  await ctx.reply(message, { parse_mode: 'HTML' });
};
