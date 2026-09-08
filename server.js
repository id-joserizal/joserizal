const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const {
  readDb,
  getSession,
  updateSession,
  generateHtmlWithGemini,
  generateSummaryWithGemini
} = require('./api/lib/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─────────────────────────────────────────────────────────
// API Routes — HARUS di atas express.static() agar tidak
// tertangkap oleh static file server atau catch-all route!
// ─────────────────────────────────────────────────────────

// Public product endpoint
app.all('/api/products', (req, res) => require('./api/products')(req, res));

// Admin endpoints
app.all('/api/admin/products', (req, res) => require('./api/admin/products')(req, res));
app.all('/api/admin/login', (req, res) => require('./api/admin/login')(req, res));
app.all('/api/admin/sessions', (req, res) => require('./api/admin/sessions')(req, res));

// Design preview
app.post('/api/design-preview', async (req, res) => {
  try {
    const { session_id, prompt, previous_html } = req.body;

    if (!session_id || typeof session_id !== 'string') {
      return res.status(400).json({ error: 'session_id wajib diisi.' });
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ error: 'pesan prompt wajib diisi.' });
    }

    const cleanPrompt = prompt.trim();
    const session = getSession(session_id);

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

    updateSession(session_id, {
      count: newCount,
      history: updatedHistory,
      current_html: generatedHtml
    });

    const remainingQuota = MAX_LIMIT - newCount;

    return res.json({
      success: true,
      session_id: session_id,
      html_result: generatedHtml,
      count: newCount,
      max_limit: MAX_LIMIT,
      remaining_quota: remainingQuota,
      message: remainingQuota === 0 ? 'Anda telah mencapai batas maksimal 5 kali generate.' : `Berhasil generate preview. Sisa jatah: ${remainingQuota}`
    });

  } catch (error) {
    console.error('Error in /api/design-preview:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server saat memproses desain.' });
  }
});

// Generate WhatsApp summary
app.post('/api/generate-summary', async (req, res) => {
  try {
    const { session_id, prompt } = req.body;

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

    return res.json({
      success: true,
      session_id: session_id,
      summary: summaryText,
      wa_message: waMessageText,
      wa_url: waUrl
    });

  } catch (error) {
    console.error('Error in /api/generate-summary:', error);
    return res.status(500).json({ error: 'Gagal membuat ringkasan WhatsApp.' });
  }
});

// Get session by ID
app.get('/api/session/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  const db = readDb();
  if (!db[sessionId]) {
    return res.status(404).json({ error: 'Session tidak ditemukan.' });
  }
  return res.json(db[sessionId]);
});

// ─────────────────────────────────────────────────────────
// Static files — dipasang SETELAH API routes
// ─────────────────────────────────────────────────────────
app.use(express.static(__dirname));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Ratakiri Catalog Server is running on port ${PORT}`);
  console.log(`🌐 Website URL: http://localhost:${PORT}`);
  console.log(`🛠️ Admin Dashboard: http://localhost:${PORT}/admin`);
  console.log(`====================================================`);
});
