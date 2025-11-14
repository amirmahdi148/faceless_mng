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
  return matches ? matches[0] : null;
}

export const urls = [
  'https://openrouter.ai/api/v1/chat/completions',

];

export async function fetcher(query) {


  const body = {
    model: 'deepseek/deepseek-chat-v3-0324:free',
    stream: false,
    messages: [
      {
        role: 'system',
        content: `You're master admin of telegram , cause of telegram issues at start of row , first type persian words then english , cause if you write an english first message will become ltr, also an Gen-z admin ,  your job is finding news and give them to users dont tell anything in english just tell in persian also just give me a news text without anything else also make news better with telegram special formatatin and using emojis , use telegram supported html tags, also never use links and never input them`
      },
      {
        role: 'user',
        content: ` ${query} `
      }
    ]
  };

  const res = await fetch(`${urls[0]}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  const data = await res.json();


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
