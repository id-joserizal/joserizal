const fs = require('fs');
const GEMINI_MODEL = 'gemini-3.6-flash';
const path = require('path');

// Ensure data directory exists for JSON DB persistence (uses /tmp on Vercel)
const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'data') : path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'sessions.json');

function ensureDbExists() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({}), 'utf8');
    }
  } catch (err) {
    console.error('Error ensuring DB directory:', err);
  }
}

function readDb() {
  ensureDbExists();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data || '{}');
  } catch (err) {
    console.error('Error reading database:', err);
    return {};
  }
}

function writeDb(data) {
  ensureDbExists();
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

function cleanHtmlResponse(rawText) {
  if (!rawText) return '';
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```html\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  
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
  <header class="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-extrabold text-xl shadow-lg shadow-indigo-500/30">⚡</div>
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
          <a href="#kontak" class="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-xl shadow-indigo-500/25 transition transform hover:-translate-y-0.5">Pesan Sekarang &rarr;</a>
          <a href="#fitur" class="glass-card hover:bg-slate-800/80 text-white px-8 py-3.5 rounded-xl font-semibold text-base border border-slate-700 transition">Lihat Fitur Lengkap</a>
        </div>
      </div>
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
  </main>

  <footer class="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-slate-500 text-xs">
    <p>&copy; ${new Date().getFullYear()} ${businessName}. Powered by Jose Rizal Vibe Coding Studio.</p>
  </footer>
</body>
</html>`;
}

async function generateHtmlWithGemini(prompt, previousHtml, history = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return generateFallbackHtml(prompt, previousHtml);
  }

  const systemInstruction = `Kamu adalah asisten yang membuat preview desain website berdasarkan deskripsi user. Hasilkan HANYA satu file HTML lengkap (termasuk CSS di dalam <style> di <head>, boleh pakai CDN Tailwind via <script src='https://cdn.tailwindcss.com'>). Jangan sertakan penjelasan atau teks lain di luar kode. Desain harus responsif, profesional, dan pakai konten placeholder yang relevan dengan jenis bisnis user (bukan lorem ipsum generik). Jika user meminta revisi, modifikasi HANYA bagian yang diminta berdasarkan kode HTML sebelumnya yang diberikan sebagai konteks. Jika instruksi user kurang jelas, buat asumsi desain modern terbaik tanpa bertanya balik. Jangan gunakan merek dagang pihak ketiga atau gambar berhak cipta. Selalu balas mulai dari <!DOCTYPE html> sampai </html> saja.`;

  const contents = [];
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

  let currentPromptText = prompt;
  if (previousHtml && previousHtml.trim() !== '') {
    currentPromptText = `Berikut adalah kode HTML website sebelumnya:\n\n${previousHtml}\n\nPermintaan revisi user: ${prompt}`;
  }

  contents.push({
    role: 'user',
    parts: [{ text: currentPromptText }]
  });

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
      })
    });

    if (!response.ok) {
      console.error(`Gemini API Error (${response.status}):`, await response.text());
      return generateFallbackHtml(prompt, previousHtml);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return generateFallbackHtml(prompt, previousHtml);

    return cleanHtmlResponse(rawText);
  } catch (error) {
    console.error('Fetch error calling Gemini API:', error);
    return generateFallbackHtml(prompt, previousHtml);
  }
}

async function generateSummaryWithGemini(history, currentPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const promptText = `Berdasarkan riwayat percakapan berikut antara user dan asisten desain website:\n\n` +
    (history.map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n') || `USER: ${currentPrompt}`) +
    `\n\nBuatkan ringkasan singkat (maksimal 5-6 kalimat) berisi: jenis bisnis/website yang diinginkan, gaya desain, warna utama, fitur-fitur yang diminta, dan hal spesifik lain yang disebutkan user. Tulis dalam bahasa Indonesia yang natural, format siap kirim sebagai pesan WhatsApp ke tim sales. Jangan sertakan kode HTML atau istilah teknis.`;

  if (!apiKey || apiKey.trim() === '') {
    const userPrompts = history.filter(h => h.role === 'user').map(h => h.text).join(', ') || currentPrompt || 'Permintaan Website Custom';
    return `Customer membutuhkan pembuatan website custom berdasarkan deskripsi: "${userPrompts}". Desain mengusung tampilan modern, profesional, dan responsive dengan tema warna elegan, fitur navigasi lengkap, serta integrasi tombol chat WhatsApp.`;
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 1024 }
      })
    });

    if (!response.ok) {
      return `Customer membutuhkan pembuatan website custom berbasis deskripsi: "${currentPrompt || 'Web App Custom'}". Fitur mencakup desain responsive, visual modern, dan integrasi WhatsApp.`;
    }

    const data = await response.json();
    const summaryText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return summaryText ? summaryText.trim() : `Customer menginginkan pembuatan website modern sesuai spesifikasi yang tertera pada kode referensi sesi.`;
  } catch (error) {
    return `Customer telah merancang preview website custom dengan beberapa preferensi fitur & warna. Mohon periksa detail referensi sesi di dashboard admin.`;
  }
}

module.exports = {
  readDb,
  writeDb,
  getSession,
  updateSession,
  generateHtmlWithGemini,
  generateSummaryWithGemini
};
