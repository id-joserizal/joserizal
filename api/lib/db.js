const fs = require('fs');
const path = require('path');

const GEMINI_MODEL = 'gemini-3.6-flash';

// ══════════════════════════════════════════════════════════════
//  STORAGE LAYER
//  - Primary: Upstash Redis REST API (persistent, shared across
//             all Vercel serverless instances)
//  - Fallback: Local JSON file (for local development)
// ══════════════════════════════════════════════════════════════

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const USE_REDIS   = !!(REDIS_URL && REDIS_TOKEN);

// Session TTL: 90 hari
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 90;
const SESSION_KEY  = (id) => `ratakiri:session:${id}`;
const INDEX_KEY    = 'ratakiri:sessions:index';

// ── Redis helpers ──────────────────────────────────────────────
async function redisExec(...args) {
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upstash Redis error ${res.status}: ${text}`);
  }
  const json = await res.json();
  return json.result;
}

async function redisPipeline(commands) {
  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commands)
  });
  const json = await res.json();
  return json; // array of { result }
}

// ── Redis session operations ──────────────────────────────────
async function redisGetSession(sessionId) {
  const raw = await redisExec('GET', SESSION_KEY(sessionId));
  return raw ? JSON.parse(raw) : null;
}

async function redisSetSession(session) {
  const sessionId = session.session_id;
  const score = new Date(session.updated_at).getTime();
  await redisPipeline([
    ['SET', SESSION_KEY(sessionId), JSON.stringify(session), 'EX', SESSION_TTL_SECONDS],
    ['ZADD', INDEX_KEY, score, sessionId]
  ]);
}

async function redisGetAllSessions() {
  // Newest first: ZREVRANGE returns IDs sorted by score desc
  const ids = await redisExec('ZREVRANGE', INDEX_KEY, 0, 199);
  if (!ids || ids.length === 0) return [];

  // Pipeline GET for all sessions
  const commands = ids.map(id => ['GET', SESSION_KEY(id)]);
  const results  = await redisPipeline(commands);

  return results
    .map(r => (r.result ? JSON.parse(r.result) : null))
    .filter(Boolean);
}

// ── File fallback (local dev) ─────────────────────────────────
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_FILE  = path.join(DATA_DIR, 'sessions.json');

function ensureDbExists() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_FILE))  fs.writeFileSync(DB_FILE, '{}', 'utf8');
  } catch (e) {
    console.error('DB init error:', e.message);
  }
}

function fileReadDb() {
  ensureDbExists();
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8') || '{}'); }
  catch (e) { return {}; }
}

function fileWriteDb(data) {
  ensureDbExists();
  try { fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8'); }
  catch (e) { console.error('DB write error:', e.message); }
}

// ══════════════════════════════════════════════════════════════
//  PUBLIC API — same interface whether using Redis or file
// ══════════════════════════════════════════════════════════════

function readDb() {
  // Sync fallback only (used by legacy callers); Redis is async
  return fileReadDb();
}

function writeDb(data) {
  fileWriteDb(data);
}

// getSession: creates session if not exists
async function getSession(sessionId) {
  if (USE_REDIS) {
    let session = await redisGetSession(sessionId);
    if (!session) {
      session = {
        session_id: sessionId,
        count: 0,
        history: [],
        current_html: '',
        summary: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await redisSetSession(session);
    }
    return session;
  }

  // File fallback
  const db = fileReadDb();
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
    fileWriteDb(db);
  }
  return db[sessionId];
}

// updateSession: merges updateData into existing session
async function updateSession(sessionId, updateData) {
  if (USE_REDIS) {
    let session = await redisGetSession(sessionId);
    if (!session) {
      session = {
        session_id: sessionId,
        count: 0, history: [], current_html: '', summary: '',
        created_at: new Date().toISOString()
      };
    }
    session = { ...session, ...updateData, updated_at: new Date().toISOString() };
    await redisSetSession(session);
    return session;
  }

  // File fallback
  const db = fileReadDb();
  db[sessionId] = {
    ...(db[sessionId] || { session_id: sessionId, count: 0, history: [], current_html: '', summary: '', created_at: new Date().toISOString() }),
    ...updateData,
    updated_at: new Date().toISOString()
  };
  fileWriteDb(db);
  return db[sessionId];
}

// getAllSessions: for admin dashboard
async function getAllSessions() {
  if (USE_REDIS) {
    return await redisGetAllSessions();
  }
  const db = fileReadDb();
  return Object.values(db).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
}

// ══════════════════════════════════════════════════════════════
//  HTML CLEANUP
// ══════════════════════════════════════════════════════════════
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
    if (htmlIdx !== -1) cleaned = cleaned.substring(htmlIdx);
  }

  const endHtmlIdx = cleaned.toLowerCase().lastIndexOf('</html>');
  if (endHtmlIdx !== -1) cleaned = cleaned.substring(0, endHtmlIdx + 7);

  return cleaned.trim();
}

// ══════════════════════════════════════════════════════════════
//  FALLBACK HTML (when API key missing or Gemini unreachable)
// ══════════════════════════════════════════════════════════════
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
    .glass-card { background: rgba(255,255,255,0.05); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); }
    .hero-gradient { background: radial-gradient(circle at top right, rgba(99,102,241,0.25), transparent 50%), radial-gradient(circle at bottom left, rgba(236,72,153,0.2), transparent 50%); }
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
        <a href="#kontak" class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-semibold transition">Hubungi Sales</a>
      </nav>
    </div>
  </header>
  <main class="max-w-7xl mx-auto px-6 py-16 flex-grow flex flex-col justify-center">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div class="space-y-6">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <span>✨</span> Vibe Coding Live Preview
        </div>
        <h1 class="text-5xl font-extrabold tracking-tight text-white leading-tight">
          Solusi Digital <span class="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">${businessName}</span>
        </h1>
        <p class="text-slate-300 text-lg leading-relaxed">
          Rancangan berdasarkan: <em class="text-indigo-300">"${cleanPrompt}"</em>
        </p>
        <div class="flex flex-wrap gap-4 pt-4">
          <a href="#kontak" class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-xl transition">Pesan Sekarang &rarr;</a>
        </div>
      </div>
    </div>
  </main>
  <footer class="border-t border-slate-800/80 py-8 text-center text-slate-500 text-xs">
    <p>&copy; ${new Date().getFullYear()} ${businessName}. Powered by Jose Rizal Vibe Coding Studio.</p>
  </footer>
</body>
</html>`;
}

// ══════════════════════════════════════════════════════════════
//  GEMINI API CALLS
// ══════════════════════════════════════════════════════════════
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

  contents.push({ role: 'user', parts: [{ text: currentPromptText }] });

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
    return `Customer membutuhkan pembuatan website custom berdasarkan deskripsi: "${userPrompts}". Desain mengusung tampilan modern, profesional, dan responsive.`;
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
      return `Customer membutuhkan pembuatan website custom berbasis deskripsi: "${currentPrompt || 'Web App Custom'}".`;
    }

    const data = await response.json();
    const summaryText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return summaryText ? summaryText.trim() : `Customer menginginkan pembuatan website modern sesuai spesifikasi sesi.`;
  } catch (error) {
    return `Customer telah merancang preview website custom. Mohon periksa detail referensi sesi di dashboard admin.`;
  }
}

const PRODUCTS_KEY = 'ratakiri:products';
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

const DEFAULT_PRODUCTS = [
  {
    id: 'prod_dev_app',
    name: 'DEVELOPER APP',
    badge: 'FEATURED SERVICE',
    image: '/assets/images/image1.png',
    features: [
      'Web & Mobile App Custom',
      'Clean Architecture & Fast Performance',
      'API Integration & Deployment'
    ],
    price: 'CUSTOM',
    btn_type: 'vibe_preview',
    btn_text: '⚡ COBA DESAIN DULU',
    btn_link: '',
    active: true,
    order: 1
  },
  {
    id: 'prod_ui_ux',
    name: 'DESAIN UI/UX & BRANDING',
    badge: 'MOST POPULAR',
    image: '/assets/images/profile.jpg',
    features: [
      'Desain Antarmuka UI/UX Modern',
      'Identitas Visual & System Design',
      'High-Fidelity Prototype Ready'
    ],
    price: 'CUSTOM',
    btn_type: 'web_builder',
    btn_text: 'PESAN DESAIN',
    btn_link: '',
    active: true,
    order: 2
  },
  {
    id: 'prod_ebook',
    name: 'EBOOK & GUIDE KREATIF',
    badge: 'DIGITAL PRODUCT',
    image: '/assets/images/image2.png',
    features: [
      'Panduan Pemrograman & Desain',
      'Case Study & Source Code Lengkap',
      'Akses Gratis Update Selamanya'
    ],
    price: 'EBOOK',
    btn_type: 'custom_link',
    btn_text: 'BELI EBOOK',
    btn_link: '#footer',
    active: true,
    order: 3
  }
];

async function getProducts() {
  if (USE_REDIS) {
    try {
      const raw = await redisExec('GET', PRODUCTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      await redisExec('SET', PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    } catch (err) {
      console.warn('Redis getProducts error, fallback to file:', err.message);
    }
  }

  ensureDbExists();
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(DEFAULT_PRODUCTS, null, 2), 'utf8');
      return DEFAULT_PRODUCTS;
    }
    const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    return Array.isArray(data) ? data : DEFAULT_PRODUCTS;
  } catch (e) {
    return DEFAULT_PRODUCTS;
  }
}

async function saveProducts(products) {
  if (USE_REDIS) {
    try {
      await redisExec('SET', PRODUCTS_KEY, JSON.stringify(products));
    } catch (err) {
      console.warn('Redis saveProducts error:', err.message);
    }
  }

  ensureDbExists();
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
  } catch (e) {
    console.error('File saveProducts error:', e.message);
  }
  return true;
}

module.exports = {
  readDb,
  writeDb,
  getSession,
  updateSession,
  getAllSessions,
  getProducts,
  saveProducts,
  generateHtmlWithGemini,
  generateSummaryWithGemini
};

