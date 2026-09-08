const { getSession, updateSession, generateHtmlWithGemini } = require('./lib/db');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(45) ? res.status(405).json({ error: 'Method not allowed' }) : null;
  }

  try {
    const { session_id, prompt, previous_html } = req.body || {};

    if (!session_id || typeof session_id !== 'string') {
      return res.status(400).json({ error: 'session_id wajib diisi.' });
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ error: 'pesan prompt wajib diisi.' });
    }

    const cleanPrompt = prompt.trim();
    const session = await getSession(session_id);

    const MAX_LIMIT = 5;
    if (session.count >= MAX_LIMIT) {
      return res.status(429).json({
        error: 'Jatah generate gratis Anda sudah habis (maksimal 5 kali). Silakan lanjutkan ke pemesanan langsung.',
        quota_exceeded: true,
        count: session.count,
        max: MAX_LIMIT,
        remaining_quota: 0
      });
    }

    const generatedHtml = await generateHtmlWithGemini(cleanPrompt, previous_html || session.current_html, session.history);
    const newCount = session.count + 1;
    const updatedHistory = [
      ...session.history,
      { role: 'user', text: cleanPrompt, timestamp: new Date().toISOString() },
      { role: 'assistant', text: 'Tentu! Berikut adalah hasil rancangan desain website sesuai deskripsi Anda.', timestamp: new Date().toISOString() }
    ];

    await updateSession(session_id, {
      count: newCount,
      history: updatedHistory,
      current_html: generatedHtml
    });

    const remainingQuota = MAX_LIMIT - newCount;

    return res.status(200).json({
      success: true,
      session_id: session_id,
      html_result: generatedHtml,
      count: newCount,
      max_limit: MAX_LIMIT,
      remaining_quota: remainingQuota,
      message: remainingQuota === 0 ? 'Anda telah mencapai batas maksimal 5 kali generate.' : `Berhasil generate preview. Sisa jatah: ${remainingQuota}`
    });

  } catch (error) {
    console.error('Error in /api/design-preview serverless function:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server saat memproses desain.' });
  }
};
