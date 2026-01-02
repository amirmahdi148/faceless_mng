import { sql } from "../database/db.js";
import { Queue, Worker } from "bullmq";
import { redis } from "../redis.js";
import { fetcher, googleResult } from "./fetch.js";
import { bot } from "../main.js";
import cronValidator from "node-cron";

const QUEUE_NAME = "channel-updates";

/* ──────────────────────────────── */
/* Queue */
/* ──────────────────────────────── */
export const channelQueue = new Queue(QUEUE_NAME, {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

/* ──────────────────────────────── */
/* Init schedulers on startup */
/* ──────────────────────────────── */
export async function initSchedulers() {
    const schedulers = await channelQueue.getJobSchedulers();



    for (const s of schedulers) {
        await channelQueue.removeJobScheduler(s.id);
    }

    const { rows } = await sql.query(
        `SELECT * FROM channels WHERE active = true`
    );

    for (const channel of rows) {
        await upsertChannelScheduler(channel);
    }

    console.log("✅ All schedulers initialized");
}

/* ──────────────────────────────── */
/* Upsert scheduler */
/* ──────────────────────────────── */
export async function upsertChannelScheduler(channel) {
    let { channel_name, channel_type, channel_category, cron } = channel;
    cron = cron.replace(/['"]/g, "").trim();

    if (!cronValidator.validate(cron)) {
        throw new Error(`Invalid cron: ${cron}`);
    }

    await channelQueue.upsertJobScheduler(
        channel_name,              // ✅ schedulerId (string)
        {
            pattern: cron,           // ✅ repeat options
        },
        {
            name: "channel-job",
            data: {
                channel_name,
                channel_type,
                channel_category,
            },
            opts: {
                attempts: 3,
                backoff: { type: "exponential", delay: 1000 },
                removeOnComplete: true,
            },
        }
    );

    console.log(`⏳ Scheduler set: ${channel_name} → ${cron}`);
}

/* ──────────────────────────────── */
/* Remove scheduler */
/* ──────────────────────────────── */
export async function removeChannelScheduler(channel_name) {
    await channelQueue.removeJobScheduler(channel_name);
    console.log(`🗑 Scheduler removed: ${channel_name}`);
}

/* ──────────────────────────────── */
/* Worker */
/* ──────────────────────────────── */
const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
        const { channel_name, channel_type, channel_category } = job.data;

        /* 🔒 Anti-duplicate lock */
        const lockKey = `lock:channel:${channel_name}`;

        const locked = await redis.setnx(lockKey, "1");

        if (locked === 0) {
            console.log(`⛔ Duplicate job blocked: ${channel_name}`);
            return;
        }

// TTL برای fail-safe
        await redis.expire(lockKey, 60);

        console.log(`🚀 Running job for ${channel_name}`);

        const searchRes = await googleResult(channel_type);
        if (!searchRes) throw new Error("Google fetch failed");

        const formatted = searchRes
            .slice(0, 20)
            .map(
                (r) => `🔗 ${r.title}\n${r.link}\n${r.snippet}`
            )
            .join("\n\n");

        const prompt = `این نتایج از گوگل پیدا شده:\n\n${formatted}\n\nخلاصه کوتاه درباره ${channel_category} بده:`;

        const result = await fetcher(prompt);
        if (!result) throw new Error("AI failed");

        await bot.api.sendMessage(`@${channel_name}`, result, {
            parse_mode: "HTML",
        });

        console.log(`🎉 Sent to ${channel_name}`);
    },
    { connection: redis }
);

/* ──────────────────────────────── */
/* Worker error handling */
/* ──────────────────────────────── */
worker.on("failed", async (job, err) => {
    const { channel_name } = job.data;

    console.error(`❌ Job failed for ${channel_name}:`, err.message);

    const deadErrors = [
        "chat not found",
        "bot was kicked",
        "bot is not a member",
        "user is deactivated",
        "channel not found",
    ];

    if (deadErrors.some((e) => err.message.toLowerCase().includes(e))) {
        console.log(`🗑 Removing dead channel: ${channel_name}`);

        await sql.query(
            `DELETE FROM channels WHERE channel_name = $1`,
            [channel_name]
        );

        await removeChannelScheduler(channel_name);
    }
});

/* ──────────────────────────────── */
/* DB Listener */
/* ──────────────────────────────── */
export async function startChannelListener() {
    const client = await sql.connect();

    await client.query("LISTEN channels_changed");
    console.log("👂 Listening to channels_changed");

    client.on("notification", async (msg) => {
        const payload = JSON.parse(msg.payload);
        const { action, channel_name } = payload;

        console.log("📡 DB Event:", payload);

        if (action === "DELETE") {
            await removeChannelScheduler(channel_name);
            return;
        }

        if (action === "INSERT" || action === "UPDATE") {
            const { rows } = await sql.query(
                `SELECT * FROM channels WHERE channel_name = $1 AND active = true`,
                [channel_name]
            );

            if (rows.length) {
                await upsertChannelScheduler(rows[0]);
                console.log(`♻️ Rescheduled: ${channel_name}`);
            } else {
                await removeChannelScheduler(channel_name);
            }
        }
    });
}
