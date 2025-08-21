export default async function handler(req, res) {
  const BOT_TOKEN = process.env.BOT_TOKEN;   // Vercel environment variable
  const CHAT_ID = process.env.CHAT_ID;       // Your public group/chat ID

  try {
    // Fetch latest updates from Telegram
    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
    const data = await tgRes.json();

    if (!data.result) {
      return res.status(200).json([]);
    }

    const videos = [];

    data.result.forEach(update => {
      const msg = update.message;
      if (msg && msg.video) {
        let thumbUrl = null;

        // If video has a thumbnail, get file path
        if (msg.video.thumb) {
          const thumbFileId = msg.video.thumb.file_id;
          thumbUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${msg.video.thumb.file_id}`;
        }

        videos.push({
          file_id: msg.video.file_id,
          title: msg.caption || 'Telegram Video',
          thumb_url: thumbUrl
        });
      }
    });

    res.status(200).json(videos);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
