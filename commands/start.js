import { saveUser } from '../database/db.js';

export const startCommand = async (ctx) => {

  const user = ctx.from
  const phone = 0;
  let bio = null;
  try {
    const chat = await ctx.api.getChat(user.id);
    bio = chat.bio || null;
  } catch (e) {
    console.log("Bio not accessible:", e.message);
  }
  let avatar = null;
  try {
    const photos = await ctx.api.getUserProfilePhotos(user.id);
    if (photos.total_count > 0) {
      avatar = photos.photos[0][0].file_id;
    }
  } catch (e) {
    console.log("Avatar fetch failed:", e.message);
  }
  const res = await saveUser(ctx.from.id, user.first_name, user.username, bio, avatar)
  console.log(res)
  if (res === "Set Successfully") {
    await ctx.reply(`سلام دوست عزیز ، شما با موفقیت register شدید از این به بعد کد های لاگین در سایت از طریق همین ربات به شما ارسال میشه`);
  } else {
    await ctx.reply('مشکلی در فرایند رجیستر پیش آمده بعدا دوباره تلاش کنید');
  }
};
