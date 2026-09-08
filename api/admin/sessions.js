const crypto = require('crypto');
const { getAllSessions } = require('../lib/db');

function generateExpectedToken(username, password) {
  const secret = process.env.ADMIN_SECRET || 'fallback_secret_change_me';
  return crypto
    .createHmac('sha256', secret)
    .update(`${username}:${password}`)
    .digest('hex');
}

function validateToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.substring(7);
  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const expectedToken = generateExpectedToken(validUsername, validPassword);
  // Gunakan timingSafeEqual untuk mencegah timing attack
  try {
    const tokenBuf = Buffer.from(token, 'hex');
    const expectedBuf = Buffer.from(expectedToken, 'hex');
    if (tokenBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(tokenBuf, expectedBuf);
  } catch {
    return false;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Validasi token di Authorization header
  if (!validateToken(req.headers['authorization'])) {
    return res.status(401).json({ error: 'Unauthorized. Silakan login terlebih dahulu.' });
  }

  const sessionList = await getAllSessions();
  return res.status(200).json(sessionList);
};
