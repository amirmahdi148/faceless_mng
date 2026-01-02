export const API_KEY = process.env.API_KEY;

export const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
  'HTTP-Referer': 'http://localhost',
  'X-Title': 'MyTelegramBot'
};

export function extractUrl(text) {
  const regex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(regex);
  return matches || [];
}

export const urls = [
  'https://api.avalai.ir/v1/chat/completions',

];

export async function fetcher(query) {


  const body = {
    model: 'gpt-5.1',
    stream: false,
    messages: [
      {
        role: 'system',
        content: `تو یک ادمین فارسی‌زبان هستی که متن‌های تمیز و حرفه‌ای تولید می‌کند.
متن را همیشه به‌صورت عادی بنویس و فقط در صورت نیاز برای زیبایی یا تاکید از HTML مجاز تلگرام استفاده کن.

اجازه‌ی استفاده فقط از این تگ‌ها را داری:
<b>bold</b>
<i>italic</i>
<u>underline</u>
<s>strikethrough</s>
<tg-spoiler>spoiler</tg-spoiler>
<code>inline code</code>
<pre>multiline code</pre>
<blockquote>quote block</blockquote>
<a href="#">link</a>
از اموجی ها استفاده درست و حساب شده بکن تا متون زیباتر بشن
در بیشتر موارد نیازی به تگ نیست و میتونی متن معمولی بنویسی ولی اگه نیاز شد استفاده کن
هیچ تگ دیگری مجاز نیست:  
بدون CSS، بدون span، بدون class، بدون style، بدون تگ‌های ناشناس.  
اگر متن شامل <، > یا & بود باید escape شود.
تمام خروجی باید HTML معتبر تلگرام باشد.
از تگ code فقط برای کد ها استفاده کن و برای تکست معمولی از blockquote استفاده
`
      },
      {
        role: 'user',
        content: `${query} , also please use supported html tags for text beauty such as blockquote & pre & code & and others....  , always use telegram supported`
      }
    ]
  };

  const res = await fetch(`${urls[0]}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.log("HTTP ERROR", res.status);
    console.log(await res.text());
    throw new Error("Error :");
  }
  const data = await res.json();

  // ----👇 و باید validate کنیم ----
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error("❌ Invalid AI response:", data);
    return null; // یا چیزی که خودت می‌خوای
  }

  // ----👇 حالا دیگه امنه ----


  return data.choices[0].message.content;
}


export async function googleResult(query) {
  const key = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CX;

  const url = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&q=${encodeURIComponent(query)}`;

  const res = await fetch(url);

  const data = await res.json();

  // اگر آیتمی نبود، آرایه خالی بده
  if (!data.items) return [];

  return data.items.map(item => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet
  }));
}
