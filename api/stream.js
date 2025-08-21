export default async function handler(req, res) {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const { fileId } = req.query;

  try {
    // Get file path from Telegram
    const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
    const fileData = await fileRes.json();
    const filePath = fileData.result.file_path;

    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

    // Stream file to client
    const streamRes = await fetch(fileUrl);
    res.setHeader('Content-Type', 'video/mp4');
    streamRes.body.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
