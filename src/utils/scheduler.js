import { sql } from '../database/db.js';
import cron from 'node-cron';
import { fetcher, googleResult } from './fetch.js';
import { bot } from '../main.js';

export async function initSchedulers() {
  const channels = await sql`SELECT * FROM channels WHERE active = true`;
  channels.forEach((channel) => {
    startChannelScheduler(channel);
  });
}

async function startChannelScheduler(channel) {
  let { channel_name, channel_type, channel_category, cron: cronExp } = channel;
  cronExp = cronExp.replace(/['"]/g, '').trim();

  console.log(`⏳ Scheduler started for ${channel_name} (${cronExp})`);
  cron.schedule(cronExp, async () => {
    try {
      console.log(`🚀 Running job for ${channel_name}...`);

      const searchRes = await googleResult(channel_type);
      if (!searchRes || !searchRes.length) {
        console.log("نتیجه ای پیدا نشد")
      }
      const formatted = searchRes
        .slice(0, 20)
        .map(r => `🔗 ${r.title}\n${r.link}\n${r.snippet}`)
        .join('\n\n');
      const result = await fetcher(`این نتایج از گوگل پیدا شده:\\n\\n${formatted}\\n\\nحالا لطفاً یک خلاصه  کوتاه درباره ${channel_category} بده:`);
      await bot.api.sendMessage(`@${channel_name}`, `${result}`, {
        parse_mode: 'HTML'
      });
    } catch (e) {
      console.error(e);
    }
  });
}

