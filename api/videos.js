export default async function handler(req, res) {
  const BOT_TOKEN = process.env.BOT_TOKEN;   // set in Vercel Environment Variables
  const CHAT_ID = process.env.CHAT_ID;       // your Telegram group/chat ID

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
    const data = await tgRes.json();

    const videos = [];
    data.result.forEach(update => {
      if (update.message && update.message.video) {
        videos.push({
          file_id: update.message.video.file_id,
          title: update.message.caption || 'Telegram Video'
        });
      }
    });

    res.status(200).json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
