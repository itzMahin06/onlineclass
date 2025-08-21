export default async function handler(req, res) {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const { fileId } = req.query;

  try {
    // Step 1: Get file path from Telegram
    const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
    const fileData = await fileRes.json();
    const filePath = fileData.result.file_path;

    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

    // Step 2: Fetch video HEAD to get size
    const headRes = await fetch(fileUrl, { method: "HEAD" });
    const fileSize = headRes.headers.get("content-length");

    // Step 3: Handle range requests (needed for video players)
    const range = req.headers.range;
    if (!range) {
      res.setHeader("Content-Length", fileSize);
      res.setHeader("Content-Type", "video/mp4");

      const fullRes = await fetch(fileUrl);
      fullRes.body.pipe(res);
    } else {
      const CHUNK_SIZE = 10 ** 6; // 1MB chunks
      const start = Number(range.replace(/\D/g, ""));
      const end = Math.min(start + CHUNK_SIZE, fileSize - 1);

      res.status(206);
      res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Length", end - start + 1);
      res.setHeader("Content-Type", "video/mp4");

      const chunkRes = await fetch(fileUrl, {
        headers: { Range: `bytes=${start}-${end}` },
      });
      chunkRes.body.pipe(res);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
