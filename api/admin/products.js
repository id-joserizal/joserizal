const crypto = require('crypto');
const { getProducts, saveProducts } = require('../lib/db');

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
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

  try {
    let products = await getProducts();

    // ── GET: Ambil semua produk (termasuk non-aktif) ──
    if (req.method === 'GET') {
      products.sort((a, b) => (a.order || 99) - (b.order || 99));
      return res.status(200).json(products);
    }

    // ── POST: Tambah Produk Baru ──
    if (req.method === 'POST') {
      const { name, badge, image, features, price, btn_type, btn_text, btn_link, active } = req.body || {};

      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Nama produk wajib diisi.' });
      }

      const newProduct = {
        id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        badge: (badge || 'PRODUCT').trim(),
        image: (image || '/assets/images/image1.png').trim(),
        features: Array.isArray(features) ? features : (features ? features.split('\n').filter(Boolean) : []),
        price: (price || 'CUSTOM').trim(),
        btn_type: btn_type || 'custom_link',
        btn_text: (btn_text || 'DETAIL').trim(),
        btn_link: (btn_link || '#footer').trim(),
        active: active !== undefined ? !!active : true,
        order: products.length + 1
      };

      products.push(newProduct);
      await saveProducts(products);

      return res.status(201).json({ success: true, product: newProduct });
    }

    // ── PUT: Edit / Update Produk ──
    if (req.method === 'PUT') {
      const { id, name, badge, image, features, price, btn_type, btn_text, btn_link, active, order } = req.body || {};

      if (!id) {
        return res.status(400).json({ error: 'ID produk wajib diisi untuk update.' });
      }

      const index = products.findIndex(p => p.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Produk tidak ditemukan.' });
      }

      products[index] = {
        ...products[index],
        ...(name !== undefined && { name: name.trim() }),
        ...(badge !== undefined && { badge: badge.trim() }),
        ...(image !== undefined && { image: image.trim() }),
        ...(features !== undefined && {
          features: Array.isArray(features) ? features : features.split('\n').filter(Boolean)
        }),
        ...(price !== undefined && { price: price.trim() }),
        ...(btn_type !== undefined && { btn_type }),
        ...(btn_text !== undefined && { btn_text: btn_text.trim() }),
        ...(btn_link !== undefined && { btn_link: btn_link.trim() }),
        ...(active !== undefined && { active: !!active }),
        ...(order !== undefined && { order: Number(order) })
      };

      await saveProducts(products);

      return res.status(200).json({ success: true, product: products[index] });
    }

    // ── DELETE: Hapus Produk ──
    if (req.method === 'DELETE') {
      const id = req.query.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ error: 'ID produk wajib diisi.' });
      }

      const initialLen = products.length;
      products = products.filter(p => p.id !== id);

      if (products.length === initialLen) {
        return res.status(404).json({ error: 'Produk tidak ditemukan.' });
      }

      await saveProducts(products);
      return res.status(200).json({ success: true, message: 'Produk berhasil dihapus.' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/admin/products:', error);
    return res.status(500).json({ error: 'Gagal memproses transaksi produk.' });
  }
};
