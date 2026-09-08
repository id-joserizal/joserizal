const { getSession, updateSession, generateSummaryWithGemini } = require('./lib/db');

module.exports = async function handler(req, res) {
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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { session_id, prompt } = req.body || {};

    if (!session_id) {
      return res.status(400).json({ error: 'session_id wajib diisi.' });
    }

    const session = getSession(session_id);
    const summaryText = await generateSummaryWithGemini(session.history, prompt || '');

    updateSession(session_id, { summary: summaryText });

    const salesPhone = '6285163612553';
    const waMessageText = `Halo, saya tertarik untuk memesan jasa pembuatan web/app.

Ringkasan kebutuhan saya:
${summaryText}

Kode referensi desain: ${session_id}

Mohon info selanjutnya untuk proses pemesanan. Terima kasih.`;

    const encodedText = encodeURIComponent(waMessageText);
    const waUrl = `https://wa.me/${salesPhone}?text=${encodedText}`;

    return res.status(200).json({
      success: true,
      session_id: session_id,
      summary: summaryText,
      wa_message: waMessageText,
      wa_url: waUrl
    });

  } catch (error) {
    console.error('Error in /api/generate-summary serverless function:', error);
    return res.status(500).json({ error: 'Gagal membuat ringkasan WhatsApp.' });
  }
};
