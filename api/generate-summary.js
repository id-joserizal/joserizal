const { getSession, updateSession, generateSummaryWithGemini } = require('./lib/db');

// ── Upload HTML ke paste service untuk mendapat link preview ──
async function uploadHtmlPreview(html) {
  if (!html || html.trim() === '') return null;

  // Coba hastebin (hst.sh) — POST /documents, return JSON { key: "xxx" }
  try {
    const res = await fetch('https://hst.sh/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'text/html' },
      body: html,
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.key) {
        return `https://hst.sh/raw/${data.key}`;
      }
    }
  } catch (e) {
    console.warn('hst.sh upload failed:', e.message);
  }

  // Fallback: paste.rs — POST /, returns URL as text
  try {
    const res = await fetch('https://paste.rs/', {
      method: 'POST',
      headers: { 'Content-Type': 'text/html' },
      body: html,
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) {
      const url = (await res.text()).trim();
      if (url.startsWith('http')) return url;
    }
  } catch (e) {
    console.warn('paste.rs upload failed:', e.message);
  }

  return null; // Kedua layanan gagal, tidak apa-apa
}

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

    const session = await getSession(session_id);
    const history  = session.history || [];

    // ── 1. Generate AI summary ──
    const summaryText = await generateSummaryWithGemini(history, prompt || '');

    // ── 2. Upload HTML preview (berjalan paralel agar tidak lambat) ──
    const previewUrlPromise = uploadHtmlPreview(session.current_html);

    // ── 3. Kumpulkan semua prompt user (numbered list) ──
    const userPrompts = history
      .filter(h => h.role === 'user')
      .map((h, i) => `${i + 1}. "${h.text}"`)
      .join('\n');

    // Tunggu upload selesai (sudah berjalan paralel sejak step 2)
    const previewUrl = await previewUrlPromise;

    // ── 4. Simpan summary ke session ──
    await updateSession(session_id, { summary: summaryText });

    // ── 5. Bangun pesan WA yang lengkap ──
    const salesPhone = '6285163612553';

    let waMessage = `Halo! Saya tertarik dengan jasa pembuatan website/app.\n\n`;
    waMessage += `*🔖 Kode Referensi:* ${session_id}\n\n`;

    if (userPrompts) {
      waMessage += `*💬 Yang Saya Inginkan:*\n${userPrompts}\n\n`;
    }

    waMessage += `*🤖 Ringkasan Kebutuhan (AI):*\n${summaryText}\n\n`;

    if (previewUrl) {
      waMessage += `*🖥 Link Preview Desain:*\n${previewUrl}\n\n`;
    }

    waMessage += `Mohon info selanjutnya untuk proses pemesanan. Terima kasih! 🙏`;

    const waUrl = `https://wa.me/${salesPhone}?text=${encodeURIComponent(waMessage)}`;

    return res.status(200).json({
      success: true,
      session_id,
      summary: summaryText,
      preview_url: previewUrl,
      wa_message: waMessage,
      wa_url: waUrl
    });

  } catch (error) {
    console.error('Error in /api/generate-summary:', error);
    return res.status(500).json({ error: 'Gagal membuat ringkasan WhatsApp.' });
  }
};
