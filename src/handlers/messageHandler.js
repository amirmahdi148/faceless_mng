export const messageHandler = async (ctx) => {
  const text = ctx.message?.text;
  if (!text) return;

  await ctx.reply(`پیامتو گرفتم: "${text}"`);
};
