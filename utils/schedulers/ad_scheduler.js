import {Queue} from "bullmq";
import {redis} from "../../redis.js";
import {sql} from "../../database/db.js";
import {bot} from "../../main.js";


const QUEUE_NAME = 'channel-ads';

// 1. Initialize the Queue
export const channelQueue = new Queue(QUEUE_NAME, {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});


export const sendAds = async () => {
    const schedulers = await channelQueue.getJobSchedulers();


    for (const s of schedulers) {
        await channelQueue.removeJobScheduler(s.id);
    }

    const { rows } = await sql.query(`SELECT * FROM ads`)
    for (const ad of rows) {
        await sendAd(ad)
    }

}

export const sendAd = async (ad) => {
    let {author , text , title , category } = ad;
    const selected_channel = await sql.query(`SELECT channel_name
                                        FROM channels
                                        WHERE ad_receiver = true
                                          AND (
                                            last_ad_at IS NULL
                                                OR last_ad_at + ad_cooldown <= NOW()
                                            )
                                        ORDER BY random()
                                            LIMIT 1;`)
    if (!selected_channel) {
        console.log("there is no channel to send ad")
        return;
    }

    try {
        await bot.api.sendMessage(`@${selected_channel.rows[0].channel_name}` , text);
        await sql.query(`DELETE FROM ads WHERE author = ${author}`);
        console.log("Successfully Sent Ad")
    } catch (error) {
        console.error('Error Occurred During Sending Message' , error);
    }

}