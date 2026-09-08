const crypto = require('crypto');

function generateToken(username, password) {
  const secret = process.env.ADMIN_SECRET || 'fallback_secret_change_me';
  return crypto
    .createHmac('sha256', secret)
    .update(`${username}:${password}`)
    .digest('hex');
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi.' });
  }

  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (username !== validUsername || password !== validPassword) {
    // Delay 1s untuk mencegah brute force
    await new Promise(resolve => setTimeout(resolve, 1000));
    return res.status(401).json({ error: 'Username atau password salah.' });
  }

  const token = generateToken(username, password);

  return res.status(200).json({
    success: true,
    token,
    username,
    message: 'Login berhasil.'
  });
};
