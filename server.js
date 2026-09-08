const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files directory
app.use(express.static(__dirname));

// Ensure data directory exists for JSON DB persistence (uses /tmp on Vercel)
const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'data') : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'sessions.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({}), 'utf8');
}

// Database helper functions
function readDb() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data || '{}');
  } catch (err) {
    console.error('Error reading database:', err);
    return {};
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing database:', err);
  }
}

function getSession(sessionId) {
  const db = readDb();
  if (!db[sessionId]) {
    db[sessionId] = {
      session_id: sessionId,
      count: 0,
      history: [],
      current_html: '',
      summary: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    writeDb(db);
  }
  return db[sessionId];
}

function updateSession(sessionId, updateData) {
  const db = readDb();
  if (db[sessionId]) {
    db[sessionId] = {
      ...db[sessionId],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    writeDb(db);
  }
  return db[sessionId];
}

// Clean markdown code blocks from Gemini response
function cleanHtmlResponse(rawText) {
  if (!rawText) return '';
  let cleaned = rawText.trim();
  // Strip ```html ... ``` or ``` ... ```
  cleaned = cleaned.replace(/^```html\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  
  // Ensure it starts with <!DOCTYPE html> or <html>
  const docTypeIdx = cleaned.toLowerCase().indexOf('<!doctype html>');
  if (docTypeIdx !== -1) {
    cleaned = cleaned.substring(docTypeIdx);
  } else {
    const htmlIdx = cleaned.toLowerCase().indexOf('<html');
    if (htmlIdx !== -1) {
      cleaned = cleaned.substring(htmlIdx);
    }
  }
  
  const endHtmlIdx = cleaned.toLowerCase().lastIndexOf('</html>');
  if (endHtmlIdx !== -1) {
    cleaned = cleaned.substring(0, endHtmlIdx + 7);
  }
  
  return cleaned.trim();
}

// Fallback HTML Generator when GEMINI_API_KEY is not set or API error occurs
function generateFallbackHtml(prompt, previousHtml) {
  const sanitize = (str) => String(str || '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);

  const cleanPrompt = sanitize(prompt);
  const titleMatch = cleanPrompt.match(/(?:website|app|toko|kafe|restoran|klinik|studio|brand)\s+([a-zA-Z0-9\s]+)/i);
  const businessName = titleMatch ? titleMatch[1].trim() : 'Proyek Impian Anda';

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName} - Preview Desain</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .glass-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); }
    .hero-gradient { background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.25), transparent 50%), radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.2), transparent 50%); }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen hero-gradient flex flex-col justify-between">

  <!-- Header / Navigation -->
  <header class="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-extrabold text-xl shadow-lg shadow-indigo-500/30">
          ⚡
        </div>
        <span class="font-bold text-xl tracking-tight text-white">${businessName.toUpperCase()}</span>
      </div>
      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
        <a href="#beranda" class="hover:text-indigo-400 transition">Beranda</a>
        <a href="#fitur" class="hover:text-indigo-400 transition">Layanan</a>
        <a href="#tentang" class="hover:text-indigo-400 transition">Tentang Kami</a>
        <a href="#kontak" class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md shadow-indigo-600/25 transition">Hubungi Sales</a>
      </nav>
    </div>
  </header>

  <!-- Hero Section -->
  <main class="max-w-7xl mx-auto px-6 py-16 flex-grow flex flex-col justify-center">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div class="space-y-6">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <span>✨</span> Vibe Coding Live Preview
        </div>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Solusi Digital <span class="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">${businessName}</span>
        </h1>
        <p class="text-slate-300 text-lg leading-relaxed">
          Rancangan desain profesional yang dirancang khusus berdasarkan instruksi: <em class="text-indigo-300">"${cleanPrompt}"</em>. Siap meningkatkan kredibilitas bisnis Anda secara online!
        </p>
        <div class="flex flex-wrap gap-4 pt-4">
          <a href="#kontak" class="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-xl shadow-indigo-500/25 transition transform hover:-translate-y-0.5">
            Pesan Sekarang &rarr;
          </a>
          <a href="#fitur" class="glass-card hover:bg-slate-800/80 text-white px-8 py-3.5 rounded-xl font-semibold text-base border border-slate-700 transition">
            Lihat Fitur Lengkap
          </a>
        </div>
      </div>

      <!-- Hero Visual Box -->
      <div class="glass-card p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div class="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div class="bg-slate-900 rounded-xl p-6 border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-red-500"></span>
              <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span class="w-3 h-3 rounded-full bg-green-500"></span>
            </div>
            <span class="text-xs font-mono text-slate-500">Preview Mode: Active</span>
          </div>
          <div class="space-y-3">
            <div class="h-4 bg-slate-800 rounded w-3/4 animate-pulse"></div>
            <div class="h-4 bg-slate-800 rounded w-1/2 animate-pulse"></div>
            <div class="h-24 bg-indigo-950/40 rounded-xl border border-indigo-500/20 p-4 flex items-center justify-center text-center">
              <p class="text-indigo-300 font-semibold text-sm">⚡ Desain Modern • Respon Cepat • Siap Pakai</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <section id="fitur" class="mt-20 pt-10 border-t border-slate-800/80">
      <div class="text-center max-w-2xl mx-auto mb-12">
        <h2 class="text-2xl sm:text-3xl font-bold text-white mb-3">Keunggulan Fitur ${businessName}</h2>
        <p class="text-slate-400 text-sm">Dirancang dengan standar performa tinggi dan alur pemesanan mudah.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass-card p-6 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition">
          <div class="w-12 h-12 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-2xl mb-4">🚀</div>
          <h3 class="text-lg font-bold text-white mb-2">Kecepatan & SEO Tinggi</h3>
          <p class="text-slate-400 text-sm">Loading super cepat dan siap bersaing di halaman utama Google.</p>
        </div>
        <div class="glass-card p-6 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition">
          <div class="w-12 h-12 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-2xl mb-4">📱</div>
          <h3 class="text-lg font-bold text-white mb-2">Desain Ultra Responsive</h3>
          <p class="text-slate-400 text-sm">Tampilan presisi dan nyaman diakses dari Smartphone, Tablet, & Laptop.</p>
        </div>
        <div class="glass-card p-6 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition">
          <div class="w-12 h-12 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center text-2xl mb-4">💬</div>
          <h3 class="text-lg font-bold text-white mb-2">Direct WhatsApp Order</h3>
          <p class="text-slate-400 text-sm">Integrasi tombol chat langsung ke tim sales tanpa perantara.</p>
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-slate-500 text-xs">
    <p>&copy; ${new Date().getFullYear()} ${businessName}. Powered by Jose Rizal Vibe Coding Studio.</p>
  </footer>

</body>
</html>`;
}

// Call Gemini API for Design Preview HTML Generation
async function generateHtmlWithGemini(prompt, previousHtml, history = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.warn('GEMINI_API_KEY is missing in .env. Using intelligent fallback template.');
    return generateFallbackHtml(prompt, previousHtml);
  }

  const systemInstruction = `Kamu adalah asisten yang membuat preview desain website berdasarkan deskripsi user. Hasilkan HANYA satu file HTML lengkap (termasuk CSS di dalam <style> di <head>, boleh pakai CDN Tailwind via <script src='https://cdn.tailwindcss.com'>). Jangan sertakan penjelasan atau teks lain di luar kode. Desain harus responsif, profesional, dan pakai konten placeholder yang relevan dengan jenis bisnis user (bukan lorem ipsum generik). Jika user meminta revisi, modifikasi HANYA bagian yang diminta berdasarkan kode HTML sebelumnya yang diberikan sebagai konteks. Jika instruksi user kurang jelas, buat asumsi desain modern terbaik tanpa bertanya balik. Jangan gunakan merek dagang pihak ketiga atau gambar berhak cipta. Selalu balas mulai dari <!DOCTYPE html> sampai </html> saja.`;

  // Build contents array for Gemini API payload
  const contents = [];

  // Add conversation history if available
  if (Array.isArray(history) && history.length > 0) {
    history.forEach((msg) => {
      if (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'model') {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : msg.role,
          parts: [{ text: msg.text || msg.content || '' }]
        });
      }
    });
  }

  // Include previous HTML context if revising
  let currentPromptText = prompt;
  if (previousHtml && previousHtml.trim() !== '') {
    currentPromptText = `Berikut adalah kode HTML website sebelumnya:\n\n${previousHtml}\n\nPermintaan revisi user: ${prompt}`;
  }

  contents.push({
    role: 'user',
    parts: [{ text: currentPromptText }]
  });

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini API Error (${response.status}):`, errText);
      return generateFallbackHtml(prompt, previousHtml);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      console.warn('Gemini returned empty candidate. Falling back.');
      return generateFallbackHtml(prompt, previousHtml);
    }

    return cleanHtmlResponse(rawText);
  } catch (error) {
    console.error('Fetch error calling Gemini API:', error);
    return generateFallbackHtml(prompt, previousHtml);
  }
}

// Call Gemini API for WhatsApp Requirement Summary Generation
async function generateSummaryWithGemini(history, currentPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  const promptText = `Berdasarkan riwayat percakapan berikut antara user dan asisten desain website:\n\n` +
    (history.map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n') || `USER: ${currentPrompt}`) +
    `\n\nBuatkan ringkasan singkat (maksimal 5-6 kalimat) berisi: jenis bisnis/website yang diinginkan, gaya desain, warna utama, fitur-fitur yang diminta, dan hal spesifik lain yang disebutkan user. Tulis dalam bahasa Indonesia yang natural, format siap kirim sebagai pesan WhatsApp ke tim sales. Jangan sertakan kode HTML atau istilah teknis.`;

  if (!apiKey || apiKey.trim() === '') {
    // Generate intelligent default summary fallback
    const userPrompts = history.filter(h => h.role === 'user').map(h => h.text).join(', ') || currentPrompt || 'Permintaan Website Custom';
    return `Customer membutuhkan pembuatan website custom berdasarkan deskripsi: "${userPrompts}". Desain mengusung tampilan modern, profesional, dan responsive dengan tema warna elegan, fitur navigasi lengkap, serta integrasi tombol chat WhatsApp.`;
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: promptText }]
        }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      console.error('Error from Gemini summary endpoint:', await response.text());
      return `Customer membutuhkan pembuatan website custom berbasis deskripsi: "${currentPrompt || 'Web App Custom'}". Fitur mencakup desain responsive, visual modern, dan integrasi WhatsApp.`;
    }

    const data = await response.json();
    const summaryText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return summaryText ? summaryText.trim() : `Customer menginginkan pembuatan website modern sesuai spesifikasi yang tertera pada kode referensi sesi.`;
  } catch (error) {
    console.error('Error generating summary:', error);
    return `Customer telah merancang preview website custom dengan beberapa preferensi fitur & warna. Mohon periksa detail referensi sesi di dashboard admin.`;
  }
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// 1. POST /api/design-preview
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

    // Server-side Rate Limit check (Max 5 attempts)
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

    // Call Gemini API to generate design HTML
    const generatedHtml = await generateHtmlWithGemini(cleanPrompt, previous_html || session.current_html, session.history);

    // Increment count & record chat history
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

// 2. POST /api/generate-summary
app.post('/api/generate-summary', async (req, res) => {
  try {
    const { session_id, prompt } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: 'session_id wajib diisi.' });
    }

    const session = getSession(session_id);
    const summaryText = await generateSummaryWithGemini(session.history, prompt || '');

    // Save summary to session record
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

// 3. GET /api/session/:sessionId (Fetch individual session details)
app.get('/api/session/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  const db = readDb();
  if (!db[sessionId]) {
    return res.status(404).json({ error: 'Session tidak ditemukan.' });
  }
  return res.json(db[sessionId]);
});

// 4. GET /api/admin/sessions (List all session orders for Admin Dashboard)
app.get('/api/admin/sessions', (req, res) => {
  const db = readDb();
  const sessionList = Object.values(db).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  return res.json(sessionList);
});

// Serve Admin Dashboard page at /admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start listening if not running as serverless function on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Ratakiri Catalog Server is running on port ${PORT}`);
    console.log(`🌐 Website URL: http://localhost:${PORT}`);
    console.log(`🛠️ Admin Dashboard: http://localhost:${PORT}/admin`);
    console.log(`====================================================`);
  });
}

module.exports = app;
