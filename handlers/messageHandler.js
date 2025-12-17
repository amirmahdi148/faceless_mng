import { fetcher } from '../utils/fetch.js';

export const messageHandler = async (ctx) => {
  const text = ctx.message?.text;
  if (!text) return;

  let data;

  try {
    data = await fetcher(`
کاربر نوشته ${text}
یه جواب خوب بهش بده...
facelessmanager.vercel.app
    `);
  } catch (error) {
    console.log(error);
    return ctx.reply('یه مشکلی پیش اومد، بعداً دوباره امتحان کن');
  }

  await ctx.reply(
      `<blockquote>${data ?? ''}</blockquote>`,
      { parse_mode: 'html' }
  );
};
