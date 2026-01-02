export const logit = async (ctx, next) => {
  console.log(`[${new Date().toISOString()}] From ${ctx.from?.username || 'Unknown'}: ${ctx.message?.text}`);
  await next();
};
