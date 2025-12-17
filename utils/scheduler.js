import { sql } from '../database/db.js';
import cron from 'node-cron';
import { fetcher, googleResult } from './fetch.js';
import { bot } from '../main.js';

export async function initSchedulers() {
  const res = await sql.query(`SELECT * FROM channels WHERE active = true`);
  const channels = res.rows;

  channels.forEach((channel) => {
    startChannelScheduler(channel);
  });
}

async function startChannelScheduler(channel) {
  let { channel_name, channel_type, channel_category, cron: cronExp } = channel;
  cronExp = cronExp.replace(/['"]/g, '').trim();

  console.log(`⏳ Scheduler started for ${channel_name} (${cronExp})`);

  cron.schedule(cronExp, async () => {
    console.log(`🚀 Running job for ${channel_name}...`);

    try {
      // ⛔ جلوگیری از crash روی timeout
      const searchRes = await googleResult(channel_type).catch(() => null);

      if (!searchRes) {
        console.log(`⚠️ Google fetch failed for ${channel_name}`);
        return;
      }

      const formatted = searchRes
        .slice(0, 20)
        .map((r) => `🔗 ${r.title}\n${r.link}\n${r.snippet}`)
        .join('\n\n');

      const prompt = `این نتایج از گوگل پیدا شده:\n\n${formatted}\n\nحالا لطفاً یک خلاصه کوتاه درباره ${channel_category} بده:`;

      const result = await fetcher(prompt).catch((e) => console.error(e));

      if (!result) {
        console.log(`⚠️ AI fetch failed for ${channel_name}`);
        return;
      }

      // ارسال پیام به کانال
      await bot.api.sendMessage(`@${channel_name}`, result, {
        parse_mode: "HTML",
      });

      console.log(`🎉 Message sent to ${channel_name}`);

    } catch (err) {
      console.error(`❌ Telegram Error for ${channel_name}:`, err.description);

      const deadErrors = [
        'chat not found',
        'bot was kicked',
        'bot is not a member',
        'user is deactivated',
        'channel not found',
      ];

      if (
        err.description &&
        deadErrors.some((e) => err.description.toLowerCase().includes(e))
      ) {
        console.log(`🗑 Deleting channel from DB: ${channel_name}`);

        // 🟩 FIX: جلوگیری از syntax error
        await sql.query(
          `DELETE FROM channels WHERE channel_name = $1`,
          [channel_name]
        );
      }
    }
  });
}
