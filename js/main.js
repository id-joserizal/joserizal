// Main JavaScript File - Interactive Parallax, Scroll & Mobile Navigation
document.addEventListener('DOMContentLoaded', () => {
  const heroSection = document.getElementById('hero');
  const heroWrapper = document.querySelector('.hero-image-only-wrapper');
  const heroImg = document.querySelector('.hero-only-img');
  const heroSlogans = document.querySelectorAll('.hero-slogan-line');

  if (heroSection && heroWrapper && heroImg) {
    // 1. Mouse Movement / Parallax & 3D Tilt Effect on Cursor Hover/Move
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = e.clientX - rect.left; // position inside section
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt angles (-10 to 10 degrees)
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      // Calculate translation offset (-12px to 12px)
      const translateX = ((x - centerX) / centerX) * 12;
      const translateY = ((y - centerY) / centerY) * 12;

      heroWrapper.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;
      heroImg.style.transform = `translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, 15px)`;
    });

    // Reset on Mouse Leave
    heroSection.addEventListener('mouseleave', () => {
      heroWrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      heroImg.style.transform = 'translate3d(0px, 0px, 0px)';
    });

    // 2. Scroll Parallax & Fade Effect
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < 900) {
        // Parallax translateY shift & opacity fade out on scroll
        const heroOpacity = 1 - scrolled / 650;
        const heroTranslateY = scrolled * 0.3;
        const heroScale = 1 - scrolled * 0.0003;

        heroWrapper.style.opacity = Math.max(heroOpacity, 0);
        heroWrapper.style.transform = `translate3d(0, ${heroTranslateY}px, 0) scale(${Math.max(heroScale, 0.92)})`;
      }
    }, { passive: true });
  }

  // 3. Staggered Interactive Slogan Line Hover Effect
  heroSlogans.forEach((line) => {
    line.style.transition = 'transform 0.25s ease, background-color 0.25s ease, color 0.25s ease, padding 0.25s ease';
    line.addEventListener('mouseenter', () => {
      line.style.transform = 'translateX(8px)';
      line.style.color = '#FFFFFF';
      line.style.backgroundColor = '#0E0E0E';
      line.style.paddingLeft = '8px';
    });
    line.addEventListener('mouseleave', () => {
      line.style.transform = 'translateX(0)';
      line.style.color = 'var(--ink)';
      line.style.backgroundColor = 'transparent';
      line.style.paddingLeft = '0';
    });
  });

  // 4. Mobile Bottom Navigation Active Tab Intersection Observer
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
  const sections = document.querySelectorAll('section, footer');

  if (mobileNavItems.length > 0 && sections.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          mobileNavItems.forEach((item) => {
            const href = item.getAttribute('href').replace('#', '');
            if (href === id) {
              item.classList.add('active');
            } else {
              item.classList.remove('active');
            }
          });
        }
      });
    }, { threshold: 0.25 });

    sections.forEach((sec) => observer.observe(sec));
  }

  // ==========================================================================
  // 5. WEB BUILDER FORM, FULL PREVIEW & WHATSAPP REDIRECT SYSTEM
  // ==========================================================================
  const webBuilderModal = document.getElementById('webBuilderModal');
  const confirmPopupModal = document.getElementById('confirmPopupModal');
  const fullPreviewModal = document.getElementById('fullPreviewModal');
  const fullPreviewContainer = document.getElementById('fullPreviewContainer');

  const btnOpenBuilders = document.querySelectorAll('.btn-open-web-builder');
  const btnCloseWebBuilder = document.getElementById('btnCloseWebBuilder');
  const btnSubmitForm = document.getElementById('btnSubmitForm');
  const btnConfirmWhatsapp = document.getElementById('btnConfirmWhatsapp');
  const btnCancelConfirmation = document.getElementById('btnCancelConfirmation');
  const btnCloseFullPreview = document.getElementById('btnCloseFullPreview');
  const btnPreviewToWA = document.getElementById('btnPreviewToWA');
  const fpCtaWaBtn = document.getElementById('fpCtaWaBtn');

  // Form Inputs
  const inputAppName = document.getElementById('inputAppName');
  const selectCategory = document.getElementById('selectCategory');
  const selectLayout = document.getElementById('selectLayout');
  const featureCheckboxes = document.querySelectorAll('input[name="webFeature"]');
  const inputRefUrl = document.getElementById('inputRefUrl');
  const inputRefImage = document.getElementById('inputRefImage');
  const refUploadFileName = document.getElementById('refUploadFileName');
  const btnRemoveRefImage = document.getElementById('btnRemoveRefImage');
  const inputNotes = document.getElementById('inputNotes');

  // Reference Upload State
  let uploadedRefDataUrl = null;
  let uploadedRefFileName = '';

  // Mini Preview Elements (Form Modal)
  const previewWindow = document.getElementById('previewWindow');
  const previewUrlDisplay = document.getElementById('previewUrlDisplay');
  const prevBrandName = document.getElementById('prevBrandName');
  const prevCategoryTag = document.getElementById('prevCategoryTag');
  const prevHeroTitle = document.getElementById('prevHeroTitle');
  const prevHeroSub = document.getElementById('prevHeroSub');
  const prevFeaturesList = document.getElementById('prevFeaturesList');
  const prevRefUrlBanner = document.getElementById('prevRefUrlBanner');
  const prevRefUrlLink = document.getElementById('prevRefUrlLink');
  const prevThemeImg = document.getElementById('prevThemeImg');

  // Full Preview Elements
  const fpSiteName = document.getElementById('fpSiteName');
  const fpUrlBar = document.getElementById('fpUrlBar');
  const fpLogo = document.getElementById('fpLogo');
  const fpHeroName = document.getElementById('fpHeroName');
  const fpHeroBadge = document.getElementById('fpHeroBadge');
  const fpHeroH1 = document.getElementById('fpHeroH1');
  const fpHeroDesc = document.getElementById('fpHeroDesc');
  const fpDynamicVisualBox = document.getElementById('fpDynamicVisualBox');
  const fpFeaturesGrid = document.getElementById('fpFeaturesGrid');
  const fpLayoutH2 = document.getElementById('fpLayoutH2');
  const fpLayoutDesc = document.getElementById('fpLayoutDesc');
  const fpRefBlock = document.getElementById('fpRefBlock');
  const fpRefUrlCard = document.getElementById('fpRefUrlCard');
  const fpRefUrl = document.getElementById('fpRefUrl');
  const fpRefImgCard = document.getElementById('fpRefImgCard');
  const fpUploadedRefImg = document.getElementById('fpUploadedRefImg');
  const fpCtaName = document.getElementById('fpCtaName');
  const fpFooterBrand = document.getElementById('fpFooterBrand');
  const fpPageCanvas = document.getElementById('fpPageCanvas');
  const fpStat1 = document.getElementById('fpStat1');
  const fpStat2 = document.getElementById('fpStat2');
  const fpStat3 = document.getElementById('fpStat3');

  // Popup Summary Elements (Fallback Dialog)
  const summaryAppName = document.getElementById('summaryAppName');
  const summaryCategory = document.getElementById('summaryCategory');
  const summaryLayout = document.getElementById('summaryLayout');
  const summaryRefRow = document.getElementById('summaryRefRow');
  const summaryRefUrl = document.getElementById('summaryRefUrl');

  const featureInfoMap = {
    'Integrasi WhatsApp Direct Chat': { icon: '💬', desc: 'Pengunjung bisa langsung chating dengan Anda dengan 1-klik tanpa repot simpan nomor.' },
    'Payment Gateway QRIS/Bank': { icon: '💳', desc: 'Menerima pembayaran otomatis via QRIS, Bank Transfer, & E-Wallet secara real-time.' },
    'CMS Dashboard Admin': { icon: '⚙️', desc: 'Kelola konten, produk, dan pesan masuk dengan mudah tanpa paham coding/pemrograman.' },
    'Desain Ultra Responsive HP & PC': { icon: '📱', desc: 'Tampilan sempurna dan presisi di semua ukuran layar dari HP, Tablet, hingga Laptop.' },
    'Optimasi SEO & Kecepatan Tinggi': { icon: '🚀', desc: 'Website terindeks cepat di Google dan loading kilat di bawah 1.5 detik.' },
    'Multi-Language Support': { icon: '🌐', desc: 'Dukungan banyak bahasa (Indonesia, Inggris, dll) untuk menjangkau audiens internasional.' }
  };

  const layoutInfoMap = {
    'Full-Width Hero & Storytelling': 'Alur mengalir terstruktur: Hero besar &rarr; Value Proposition &rarr; Fitur Utama &rarr; Testimoni &rarr; Call-to-Action. Terbukti paling efektif meningkatkan konversi penjualan.',
    'Grid Card Showcase': 'Struktur layout berbasis grid kartu yang rapi, modular, dan modern. Pilihan terbaik untuk katalog produk, portofolio karya, serta etalase barang/jasa.',
    'Split Screen Interactive': 'Desain 2 kolom seimbang (kiri & kanan) yang dinamis. Menonjolkan visual hero bersisian dengan informasi utama secara bersamaan.',
    'Executive Dashboard Portal': 'Layout aplikasi web profesional dengan navigasi portal terstruktur. Memberikan kesan terpercaya, formal, dan berkelas tinggi untuk bisnis B2B/SaaS.'
  };

  // Image Upload Listener
  if (inputRefImage) {
    inputRefImage.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        uploadedRefFileName = file.name;
        const reader = new FileReader();
        reader.onload = (event) => {
          uploadedRefDataUrl = event.target.result;
          if (refUploadFileName) {
            refUploadFileName.textContent = `📷 ${file.name}`;
          }
          if (btnRemoveRefImage) {
            btnRemoveRefImage.style.display = 'block';
          }
          updateLivePreview();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (btnRemoveRefImage) {
    btnRemoveRefImage.addEventListener('click', (e) => {
      e.preventDefault();
      uploadedRefDataUrl = null;
      uploadedRefFileName = '';
      if (inputRefImage) inputRefImage.value = '';
      if (refUploadFileName) refUploadFileName.textContent = '📷 Upload Screenshot / Gambar Referensi Desain';
      btnRemoveRefImage.style.display = 'none';
      updateLivePreview();
    });
  }

  // 100% Dynamic Topic & Visual Theme Engine
  function detectTopicDetails(appName, notes, category) {
    const combined = (appName + ' ' + notes + ' ' + category).toLowerCase();
    
    // 1. COFFEE / KAFE / SENJA
    if (/kopi|coffee|cafe|kafe|senja|espresso|latte|roastery|brew|cangkir/i.test(combined)) {
      return {
        topic: 'coffee',
        unsplashQueries: ['coffee shop aesthetic', 'espresso latte art', 'coffee beans roastery', 'cozy cafe interior', 'specialty coffee'],
        heroBadge: '☕ CAFE & COFFEE SHOP - SPECIALTY BREW',
        heroTitleText: 'SAJIAN KOPI SENJA & NIKMATNYA CITA RASA SPESIALIS',
        heroDesc: 'Website kafe & roastery modern dengan sajian espresso latte, biji kopi pilihan Arabica & Robusta, suasana senja yang hangat, serta fitur order online instan dari smartphone Anda.',
        colors: {
          bg: '#1A110D',
          surface: '#2B1C16',
          surface2: '#3D2920',
          accent: '#E29578',
          accentBtn: '#D4A373',
          text: '#FFF5EE',
          textMuted: '#DDBEA9',
          border: 'rgba(226, 149, 120, 0.25)'
        },
        visualIcon: '☕',
        badges: ['☕ Espresso Latte Art', '🫘 100% Arabica Beans', '🌅 Nuansa Senja Warm'],
        stat1: { num: '98%', label: 'Cita Rasa Kopi' },
        stat2: { num: '☕ Artisan', label: 'Fresh Roast' },
        stat3: { num: '🫘 Single Origin', label: 'Arabica & Robusta' },
        customFeatures: [
          { name: '☕ Espresso & Specialty Latte', icon: '☕', desc: 'Sajian espresso racikan barista dengan milk latte art presisi dan aroma khas senja.' },
          { name: '🫘 Single Origin Coffee Beans', icon: '🫘', desc: 'Biji kopi pilihan 100% Arabica & Robusta dipanggang segar untuk cita rasa terbaik.' },
          { name: '💬 Pemesanan Meja & Delivery WA', icon: '💬', desc: 'Pelanggan dapat mereservasi tempat & pesan takeaway langsung via WhatsApp.' }
        ]
      };
    }

    // 2. FOOD / RESTORAN / KULINER
    if (/resto|makanan|food|kuliner|pizza|burger|dapur|catering|warung|makan/i.test(combined)) {
      return {
        topic: 'food',
        unsplashQueries: ['restaurant gourmet food', 'delicious cuisine plating', 'food photography restaurant', 'chef cooking kitchen', 'fine dining meal'],
        heroBadge: '🍕 RESTORAN & KULINER LEZAT',
        heroTitleText: 'SAJIAN KULINER DENGAN CITA RASA ISTIMEWA',
        heroDesc: 'Sajikan hidangan lezat dan pengalaman santap tak terlupakan dengan sistem pemesanan & reservasi meja otomatis.',
        colors: {
          bg: '#1A0C0C',
          surface: '#2E1414',
          surface2: '#3F1C1C',
          accent: '#FF4D4D',
          accentBtn: '#E63946',
          text: '#FFF0F0',
          textMuted: '#FFCCCC',
          border: 'rgba(255, 77, 77, 0.25)'
        },
        visualIcon: '🍕',
        badges: ['🍕 Gourmet Recipe', '👨‍🍳 Master Chef', '🚚 Fast Delivery'],
        stat1: { num: '4.9★', label: 'Rating Pembeli' },
        stat2: { num: '👨‍🍳 Master Chef', label: 'Resep Rahasia' },
        stat3: { num: '⚡ 20 Mnt', label: 'Estimasi Masak' },
        customFeatures: [
          { name: '🍕 Menu Digital & Pesan Instan', icon: '🍕', desc: 'Katalog kuliner visual lengkap dengan harga dan opsi pesanan makanan.' },
          { name: '💳 Pembayaran QRIS / E-Wallet', icon: '💳', desc: 'Menerima pembayaran nontunai tanpa ribet uang kembalian.' },
          { name: '💬 Order Takeaway via WhatsApp', icon: '💬', desc: 'Pesanan masuk otomatis ke dapur dan WhatsApp Kasir.' }
        ]
      };
    }

    // 3. FASHION / STORE / SEPATU / CLOTHING
    if (/sepatu|fashion|baju|distro|boutique|clothing|toko|store|shop|kaos/i.test(combined)) {
      return {
        topic: 'fashion',
        unsplashQueries: ['fashion boutique clothing', 'streetwear sneakers style', 'clothing store aesthetic', 'fashion model outfit', 'luxury apparel brand'],
        heroBadge: '🛍️ FASHION & CLOTHING BOUTIQUE',
        heroTitleText: 'TAMPIL TRENDI DENGAN KOLEKSI FASHION TERDEPAN',
        heroDesc: 'Website toko online modern dengan katalog baju, sepatu, dan aksesoris terdepan yang siap mengonversi pengunjung menjadi pembeli loyal.',
        colors: {
          bg: '#0F0F12',
          surface: '#1A1A22',
          surface2: '#262633',
          accent: '#00FFCC',
          accentBtn: '#00E6B8',
          text: '#FFFFFF',
          textMuted: '#A3A3C2',
          border: 'rgba(0, 255, 204, 0.25)'
        },
        visualIcon: '🛍️',
        badges: ['👕 New Apparel', '👟 Sneaker Drop', '🔥 30% Off Promotion'],
        stat1: { num: '100%', label: 'Produk Original' },
        stat2: { num: '🚚 Free Ship', label: 'Diskon Ongkir' },
        stat3: { num: '🔥 Flash Sale', label: 'Promo Harian' },
        customFeatures: [
          { name: '👕 Catalog Showcase Card Grid', icon: '👕', desc: 'Tampilan foto produk fashion resolusi tinggi dengan filter ukuran & warna.' },
          { name: '💳 Direct Payment & Shipping', icon: '💳', desc: 'Integrasi ongkir otomatis dan opsi transfer ke berbagai bank.' },
          { name: '📱 Ultra Mobile Shopping', icon: '📱', desc: 'Pengalaman belanja super cepat dari layar smartphone.' }
        ]
      };
    }

    // 4. BEAUTY / SKINCARE / KLINIK
    if (/klinik|beauty|skincare|salon|spa|cantik|aesthetic|estetika|wajah/i.test(combined)) {
      return {
        topic: 'beauty',
        unsplashQueries: ['skincare beauty products', 'spa wellness aesthetic', 'beauty clinic luxury', 'cosmetics skincare routine', 'glowing skin beauty'],
        heroBadge: '✨ KLINIK KECANTIKAN & SKINCARE',
        heroTitleText: 'PANCRAN PESONA ALAMI KULIT SEHAT & INSPIRATIF',
        heroDesc: 'Website klinik estetika modern dengan perawatan kulit terpercaya, produk skincare BPOM, dan reservasi dokter online.',
        colors: {
          bg: '#1A1115',
          surface: '#2B1A22',
          surface2: '#3D2630',
          accent: '#F4ACB7',
          accentBtn: '#FFB5A7',
          text: '#FFF5F7',
          textMuted: '#E8CCD7',
          border: 'rgba(244, 172, 183, 0.25)'
        },
        visualIcon: '✨',
        badges: ['🧴 BPOM Certified', '👩‍⚕️ SpKK Specialist', '💖 Natural Glow'],
        stat1: { num: '100%', label: 'Lolos BPOM' },
        stat2: { num: '👩‍⚕️ SpKK', label: 'Dokter Ahli' },
        stat3: { num: '5.0★', label: 'Ulasan Klien' },
        customFeatures: [
          { name: '✨ Konsultasi Dokter Online', icon: '✨', desc: 'Diskusi keluhan kulit wajah langsung dengan dokter spesialis.' },
          { name: '🧴 Skincare Product Store', icon: '🧴', desc: 'Belanja produk perawatan kulit aman dan bersertifikat BPOM.' },
          { name: '💬 Booking Perawatan WA', icon: '💬', desc: 'Jadwalkan treatment spa/salon tanpa perlu antre lama.' }
        ]
      };
    }

    // 5. GYM / FITNESS / SPORT
    if (/gym|fitness|sport|workout|otot|training|olahraga|muaythai/i.test(combined)) {
      return {
        topic: 'gym',
        unsplashQueries: ['gym fitness workout', 'crossfit training athlete', 'bodybuilding gym equipment', 'fitness motivation sport', 'personal trainer gym'],
        heroBadge: '🏋️ GYM & FITNESS CENTER',
        heroTitleText: 'TRANSFORMASI FISIK SEHAT, KUAT, & OPTIMAL',
        heroDesc: 'Website pusat kebugaran dengan peralatan gym modern, personal trainer bersertifikat, dan paket membership hemat.',
        colors: {
          bg: '#0D1117',
          surface: '#161B22',
          surface2: '#21262D',
          accent: '#FF9F1C',
          accentBtn: '#FFBF69',
          text: '#F0F6FC',
          textMuted: '#8B949E',
          border: 'rgba(255, 159, 28, 0.25)'
        },
        visualIcon: '🏋️',
        badges: ['🏋️ Modern Gear', '💪 Certified Coach', '⚡ 24/7 Access Pass'],
        stat1: { num: '24/7', label: 'Akses Gym' },
        stat2: { num: '🏋️ Modern', label: 'Alat Fitness' },
        stat3: { num: '💪 Certified', label: 'Personal Trainer' },
        customFeatures: [
          { name: '🏋️ Class Schedule & Trainer', icon: '🏋️', desc: 'Jadwal latihan harian dan reservasi kelas fitness bersama coach.' },
          { name: '💳 Membership Online Registration', icon: '💳', desc: 'Daftar keanggotaan bulanan/tahunan secara instan online.' },
          { name: '🚀 Body Metric Progress', icon: '🚀', desc: 'Fitur pencatatan berat badan, massa otot, dan kalori terukur.' }
        ]
      };
    }

    // DEFAULT TECH / BUSINESS STARTUP
    return {
      topic: 'default',
      unsplashQueries: ['tech startup office modern', 'digital business workspace', 'modern web design agency', 'software startup team', 'technology innovation'],
      heroBadge: (category || 'LANDING PAGE PROMOSI & PENJUALAN').toUpperCase(),
      heroTitleText: `MEMBANGUN IMPORIUM DIGITAL`,
      heroDesc: `Website ${category || 'modern'} berkinerja tinggi yang mengonversi pengunjung menjadi pelanggan loyal. Dibangun dengan teknologi terkini, desain premium, dan pengalaman pengguna yang tak terlupakan.`,
      colors: {
        bg: '#0B0F19',
        surface: '#111827',
        surface2: '#1F2937',
        accent: '#6366F1',
        accentBtn: '#4F46E5',
        text: '#F9FAFB',
        textMuted: '#9CA3AF',
        border: 'rgba(99, 102, 241, 0.25)'
      },
      visualIcon: '🚀',
      badges: ['⚡ High Speed 100', '🔒 SSL Secure', '🌐 Global Reach'],
      stat1: { num: '98%', label: 'Klien Puas' },
      stat2: { num: '3-5hr', label: 'Pengerjaan' },
      stat3: { num: '100%', label: 'Responsive' },
      customFeatures: null
    };
  }

  // Modal Control Functions
  const openWebModal = () => {
    if (webBuilderModal) {
      webBuilderModal.classList.add('active');
      webBuilderModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      updateLivePreview();
    }
  };

  const closeWebModal = () => {
    if (webBuilderModal) {
      webBuilderModal.classList.remove('active');
      webBuilderModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  const openFullPreview = () => {
    if (fullPreviewModal) {
      fullPreviewModal.classList.add('active');
      fullPreviewModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (fpPageCanvas) {
        fpPageCanvas.scrollTop = 0;
      }
    }
  };

  const closeFullPreview = () => {
    if (fullPreviewModal) {
      fullPreviewModal.classList.remove('active');
      fullPreviewModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  const openPopup = () => {
    if (confirmPopupModal) {
      confirmPopupModal.classList.add('active');
      confirmPopupModal.setAttribute('aria-hidden', 'false');
    }
  };

  const closePopup = () => {
    if (confirmPopupModal) {
      confirmPopupModal.classList.remove('active');
      confirmPopupModal.setAttribute('aria-hidden', 'true');
    }
  };

  // Event Listeners for Opening/Closing Modals
  btnOpenBuilders.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openWebModal();
    });
  });

  if (btnCloseWebBuilder) {
    btnCloseWebBuilder.addEventListener('click', closeWebModal);
  }

  if (btnCloseFullPreview) {
    btnCloseFullPreview.addEventListener('click', () => {
      closeFullPreview();
      openWebModal();
    });
  }

  // Close when clicking backdrop outside modal content
  if (webBuilderModal) {
    webBuilderModal.addEventListener('click', (e) => {
      if (e.target === webBuilderModal) closeWebModal();
    });
  }

  if (confirmPopupModal) {
    confirmPopupModal.addEventListener('click', (e) => {
      if (e.target === confirmPopupModal) closePopup();
    });
  }

  // Live Preview Update Handler (Step 1 Mini Preview)
  function updateLivePreview() {
    const appNameVal = inputAppName ? inputAppName.value.trim() : 'Kopi Senja Studio';
    const notesVal = inputNotes ? inputNotes.value.trim() : '';
    const displayName = appNameVal !== '' ? appNameVal : 'NAMA PROYEK ANDA';
    const selectedCatVal = selectCategory ? selectCategory.value : 'Landing Page Promosi';
    
    // Detect Topic Details
    const topicDetails = detectTopicDetails(appNameVal, notesVal, selectedCatVal);

    // 1. Brand & URL
    if (prevBrandName) {
      prevBrandName.textContent = displayName.toUpperCase();
    }
    
    if (previewUrlDisplay) {
      const cleanSlug = displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
      previewUrlDisplay.textContent = `https://${cleanSlug || 'proyekanda'}.com`;
    }

    // 2. Category & Headlines
    if (prevCategoryTag) {
      prevCategoryTag.textContent = topicDetails.heroBadge;
    }
    if (prevHeroTitle) {
      prevHeroTitle.textContent = topicDetails.heroTitleText.replace('PROYEK ANDA', displayName.toUpperCase());
    }
    if (prevHeroSub) {
      prevHeroSub.textContent = topicDetails.heroDesc;
    }

    // 3. Dynamic Visual Image / Uploaded Reference Image
    if (prevThemeImg) {
      if (uploadedRefDataUrl) {
        prevThemeImg.src = uploadedRefDataUrl;
      } else {
        prevThemeImg.src = `assets/images/image1.png`;
      }
    }

    // 4. Features List Badges
    if (prevFeaturesList) {
      prevFeaturesList.innerHTML = '';
      const selectedFeatures = document.querySelectorAll('input[name="webFeature"]:checked');
      if (selectedFeatures.length === 0) {
        prevFeaturesList.innerHTML = '<span class="prev-feature-tag">&bull; Standar Responsive Layout</span>';
      } else {
        selectedFeatures.forEach((feat) => {
          const tag = document.createElement('span');
          tag.className = 'prev-feature-tag';
          tag.innerHTML = `&check; ${feat.value}`;
          prevFeaturesList.appendChild(tag);
        });
      }
    }

    // 5. Reference URL / Image Banner in preview
    const refUrlVal = inputRefUrl ? inputRefUrl.value.trim() : '';
    if (prevRefUrlBanner && prevRefUrlLink) {
      if (uploadedRefFileName) {
        prevRefUrlBanner.style.display = 'flex';
        prevRefUrlLink.textContent = `📷 Gambar: ${uploadedRefFileName}`;
        prevRefUrlLink.href = '#';
      } else if (refUrlVal) {
        const displayRef = refUrlVal.replace(/^https?:\/\//i, '').replace(/\/$/, '');
        prevRefUrlBanner.style.display = 'flex';
        prevRefUrlLink.textContent = displayRef;
        prevRefUrlLink.href = refUrlVal.startsWith('http') ? refUrlVal : `https://${refUrlVal}`;
      } else {
        prevRefUrlBanner.style.display = 'none';
      }
    }
  }

  // Populate Full Preview Modal with Dynamic Content
  function populateFullPreview() {
    const appNameVal = inputAppName ? inputAppName.value.trim() : 'Proyek Anda';
    const notesVal = inputNotes ? inputNotes.value.trim() : '';
    const displayName = appNameVal.toUpperCase();
    const cleanSlug = appNameVal.toLowerCase().replace(/[^a-z0-9]/g, '');
    const selectedCatVal = selectCategory ? selectCategory.value : 'Landing Page Promosi';
    const selectedLayoutVal = selectLayout ? selectLayout.value : 'Full-Width Hero & Storytelling';
    const refUrlVal = inputRefUrl ? inputRefUrl.value.trim() : '';

    // Detect Topic Details (Kopi Senja, Resto, Gym, Beauty, Fashion, etc.)
    const topicDetails = detectTopicDetails(appNameVal, notesVal, selectedCatVal);

    // Apply Dynamic Colors via CSS Custom Properties on Preview Container
    if (fullPreviewContainer) {
      fullPreviewContainer.style.setProperty('--fp-bg', topicDetails.colors.bg);
      fullPreviewContainer.style.setProperty('--fp-surface', topicDetails.colors.surface);
      fullPreviewContainer.style.setProperty('--fp-surface2', topicDetails.colors.surface2);
      fullPreviewContainer.style.setProperty('--fp-accent', topicDetails.colors.accent);
      fullPreviewContainer.style.setProperty('--fp-accent-btn', topicDetails.colors.accentBtn);
      fullPreviewContainer.style.setProperty('--fp-text', topicDetails.colors.text);
      fullPreviewContainer.style.setProperty('--fp-text-muted', topicDetails.colors.textMuted);
      fullPreviewContainer.style.setProperty('--fp-border', topicDetails.colors.border);
    }

    // Render Dynamic Visual Box
    if (fpDynamicVisualBox) {
      if (uploadedRefDataUrl) {
        fpDynamicVisualBox.innerHTML = `
          <div class="fp-hero-image-wrapper">
            <img src="${uploadedRefDataUrl}" alt="Gambar Referensi Pengguna" class="fp-theme-hero-img" style="object-fit:cover;" />
            <div class="fp-theme-badge-overlay">
              <span class="fp-theme-pill-badge">📷 DESAIN DIADAPTASI DARI SCREENSHOT REFERENSI ANDA</span>
            </div>
          </div>
        `;
      } else {
        // Pick a random Unsplash query from the topic list
        const queries = topicDetails.unsplashQueries || ['modern website design'];
        const randomQuery = queries[Math.floor(Math.random() * queries.length)];
        const encodedQuery = encodeURIComponent(randomQuery);
        const seed = Math.floor(Math.random() * 1000);
        // Use picsum for reliable demo images (Unsplash source sometimes rate-limits)
        const unsplashUrl = `https://source.unsplash.com/featured/1200x700/?${encodedQuery}&sig=${seed}`;
        const fallbackUrl = `https://picsum.photos/seed/${topicDetails.topic}${seed}/1200/700`;

        fpDynamicVisualBox.innerHTML = `
          <div class="fp-unsplash-hero-wrapper" style="position:relative;width:100%;height:100%;overflow:hidden;border-radius:inherit;">
            <img 
              src="${unsplashUrl}" 
              alt="Visual tema ${topicDetails.topic}" 
              class="fp-unsplash-hero-img"
              onerror="this.src='${fallbackUrl}'"
              style="width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.6s ease;"
              onmouseover="this.style.transform='scale(1.04)'" 
              onmouseout="this.style.transform='scale(1)'"
            />
            <div class="fp-unsplash-overlay" style="
              position:absolute;inset:0;
              background:linear-gradient(135deg, ${topicDetails.colors.bg}CC 0%, ${topicDetails.colors.bg}55 60%, transparent 100%);
            "></div>
            <div class="fp-unsplash-badge-row" style="
              position:absolute;bottom:1.5rem;left:1.5rem;right:1.5rem;
              display:flex;gap:0.5rem;flex-wrap:wrap;
            ">
              ${topicDetails.badges.map(b => `
                <span style="
                  background:${topicDetails.colors.accent}22;
                  border:1px solid ${topicDetails.colors.accent}66;
                  color:${topicDetails.colors.accent};
                  padding:0.35rem 0.85rem;
                  border-radius:999px;
                  font-size:0.78rem;
                  font-weight:600;
                  backdrop-filter:blur(8px);
                  -webkit-backdrop-filter:blur(8px);
                ">${b}</span>`).join('')}
            </div>
            <div style="
              position:absolute;top:1.2rem;right:1.2rem;
              background:rgba(0,0,0,0.45);
              backdrop-filter:blur(6px);
              border-radius:8px;
              padding:0.4rem 0.8rem;
              font-size:0.72rem;
              color:#fff;
              opacity:0.75;
            ">📸 via Unsplash</div>
          </div>
        `;
      }
    }

    // Header & Hero Content
    if (fpSiteName) fpSiteName.textContent = displayName;
    if (fpUrlBar) fpUrlBar.textContent = `https://${cleanSlug || 'proyekanda'}.com`;
    if (fpLogo) fpLogo.textContent = displayName;
    if (fpHeroBadge) fpHeroBadge.textContent = topicDetails.heroBadge;
    if (fpHeroH1) {
      fpHeroH1.innerHTML = `${topicDetails.heroTitleText.replace('PROYEK ANDA', '')} <span id="fpHeroName">${displayName}</span>`;
    }
    if (fpHeroDesc) {
      fpHeroDesc.textContent = topicDetails.heroDesc;
    }

    // Dynamic Stats
    if (fpStat1) fpStat1.innerHTML = `<span class="fp-stat-num">${topicDetails.stat1.num}</span><span class="fp-stat-label">${topicDetails.stat1.label}</span>`;
    if (fpStat2) fpStat2.innerHTML = `<span class="fp-stat-num">${topicDetails.stat2.num}</span><span class="fp-stat-label">${topicDetails.stat2.label}</span>`;
    if (fpStat3) fpStat3.innerHTML = `<span class="fp-stat-num">${topicDetails.stat3.num}</span><span class="fp-stat-label">${topicDetails.stat3.label}</span>`;

    // Features Section
    if (fpFeaturesGrid) {
      fpFeaturesGrid.innerHTML = '';
      
      if (topicDetails.customFeatures) {
        topicDetails.customFeatures.forEach((item) => {
          const card = document.createElement('div');
          card.className = 'fp-feature-card';
          card.innerHTML = `
            <div class="fp-fc-icon">${item.icon}</div>
            <h3 class="fp-fc-title">${item.name}</h3>
            <p class="fp-fc-desc">${item.desc}</p>
          `;
          fpFeaturesGrid.appendChild(card);
        });
      }

      const checkedFeatures = Array.from(document.querySelectorAll('input[name="webFeature"]:checked')).map(cb => cb.value);
      checkedFeatures.forEach((featName) => {
        const info = featureInfoMap[featName] || { icon: '✨', desc: 'Fitur performa tinggi siap meningkatkan kenyamanan pengguna.' };
        const card = document.createElement('div');
        card.className = 'fp-feature-card';
        card.innerHTML = `
          <div class="fp-fc-icon">${info.icon}</div>
          <h3 class="fp-fc-title">${featName}</h3>
          <p class="fp-fc-desc">${info.desc}</p>
        `;
        fpFeaturesGrid.appendChild(card);
      });
    }

    // Layout Section
    if (fpLayoutH2) fpLayoutH2.textContent = selectedLayoutVal.toUpperCase();
    if (fpLayoutDesc) {
      fpLayoutDesc.innerHTML = layoutInfoMap[selectedLayoutVal] || 'Struktur layout yang dirancang khusus untuk kenyamanan membaca pengguna dan konversi optimal.';
    }

    // Reference URL & Uploaded Image Section
    if (fpRefBlock) {
      let hasRef = false;

      if (refUrlVal && fpRefUrlCard && fpRefUrl) {
        const displayRef = refUrlVal.replace(/^https?:\/\//i, '').replace(/\/$/, '');
        fpRefUrlCard.style.display = 'flex';
        fpRefUrl.textContent = displayRef;
        fpRefUrl.href = refUrlVal.startsWith('http') ? refUrlVal : `https://${refUrlVal}`;
        hasRef = true;
      } else if (fpRefUrlCard) {
        fpRefUrlCard.style.display = 'none';
      }

      if (uploadedRefDataUrl && fpRefImgCard && fpUploadedRefImg) {
        fpRefImgCard.style.display = 'flex';
        fpUploadedRefImg.src = uploadedRefDataUrl;
        hasRef = true;
      } else if (fpRefImgCard) {
        fpRefImgCard.style.display = 'none';
      }

      fpRefBlock.style.display = hasRef ? 'block' : 'none';
    }

    // CTA & Footer
    if (fpCtaName) fpCtaName.textContent = displayName;
    if (fpFooterBrand) fpFooterBrand.textContent = displayName;
  }

  // WhatsApp Redirect Handler
  function redirectToWhatsApp() {
    const appNameVal = inputAppName ? inputAppName.value.trim() : 'Proyek Website';
    const selectedCatVal = selectCategory ? selectCategory.value : 'Landing Page Promosi';
    const selectedLayoutVal = selectLayout ? selectLayout.value : 'Full-Width Hero & Storytelling';

    const selectedFeatures = Array.from(document.querySelectorAll('input[name="webFeature"]:checked')).map(f => f.value);
    const refUrlVal = inputRefUrl ? inputRefUrl.value.trim() : '';
    const notesVal = inputNotes ? inputNotes.value.trim() : '';

    const waNumber = '6285163612553';
    let message = `Halo Jose Rizal, saya sudah melihat preview rancangan website saya dan ingin mewujudkannya:\n\n` +
      `📌 *Nama Proyek/Usaha*: ${appNameVal}\n` +
      `🏷️ *Kategori Website*: ${selectedCatVal}\n` +
      `📐 *Struktur Layout*: ${selectedLayoutVal}\n` +
      `⚡ *Fitur Utama*:\n` +
      (selectedFeatures.length > 0 ? selectedFeatures.map(f => `  • ${f}`).join('\n') : `  • Standar Responsive Layout`) + `\n`;

    if (refUrlVal) {
      message += `\n🔗 *Referensi Desain Web (Link)*: ${refUrlVal}\n`;
    }

    if (uploadedRefFileName) {
      message += `\n📷 *Gambar Referensi Desain Uploaded*: ${uploadedRefFileName} (Screenshot Terlampir)\n`;
    }

    if (notesVal) {
      message += `\n📝 *Catatan Khusus*: ${notesVal}\n`;
    }

    message += `\nSaya berminat melanjutkan ke tahap pengerjaan. Mohon informasi estimasi biaya dan langkah selanjutnya. Terima kasih!`;

    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    
    closePopup();
    closeFullPreview();
    closeWebModal();
    window.open(waUrl, '_blank');
  }

  // AI Coding Simulation Elements
  const codeGenModalOverlay = document.getElementById('codeGenModalOverlay');
  const codeGenLogs = document.getElementById('codeGenLogs');
  const codeSnippetContent = document.getElementById('codeSnippetContent');
  const codeGenProgressBar = document.getElementById('codeGenProgressBar');
  const codeGenProgressText = document.getElementById('codeGenProgressText');
  const btnToggleCodeView = document.getElementById('btnToggleCodeView');
  const fpToggleCodeText = document.getElementById('fpToggleCodeText');

  let isShowingCodeView = false;

  // Run AI Coding Vibe Simulation
  function triggerAiCodingSimulation(appNameVal, topicDetails, callback) {
    if (!codeGenModalOverlay) {
      if (callback) callback();
      return;
    }

    codeGenModalOverlay.classList.add('active');
    codeGenModalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (codeGenLogs) codeGenLogs.innerHTML = '';
    if (codeGenProgressBar) codeGenProgressBar.style.width = '0%';
    if (codeGenProgressText) codeGenProgressText.textContent = 'Compiling Custom Website Modules... 0%';

    // Dynamic JSX snippet to display in IDE box
    if (codeSnippetContent) {
      codeSnippetContent.textContent = `// Compiling dynamic website for "${appNameVal}"...
import React from 'react';
import { Hero, Features, Showcase, WhatsAppButton } from '@joserizal/ui';

export default function ${appNameVal.replace(/[^a-zA-Z0-9]/g, '') || 'CustomWebsite'}() {
  return (
    <WebsiteLayout topic="${topicDetails.topic}" layout="storytelling" theme="custom">
      <Hero 
        title="${topicDetails.heroTitleText.replace('PROYEK ANDA', appNameVal.toUpperCase())}" 
        badge="${topicDetails.heroBadge}"
        icon="${topicDetails.visualIcon}"
      />
      <Features items={${JSON.stringify(topicDetails.badges)}} />
      <WhatsAppButton target="085163612553" />
    </WebsiteLayout>
  );
}`;
    }

    const logMessages = [
      { text: `[AI-COMPILER] Initializing Jose Rizal AI Engine...`, progress: 20 },
      { text: `[AI-PARSER] Analyzing target project: "${appNameVal}"`, progress: 45 },
      { text: `[AI-THEMER] Synthesizing niche visuals (${topicDetails.visualIcon}) & layout...`, progress: 70 },
      { text: `[AI-REF] Integrating design references & screenshot assets...`, progress: 90 },
      { text: `[AI-BUILD] Compilation 100% Successful in 1.42s! Opening preview...`, progress: 100 }
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < logMessages.length) {
        const item = logMessages[step];
        const logLine = document.createElement('div');
        logLine.className = 'log-line';
        const now = new Date().toLocaleTimeString();
        logLine.innerHTML = `<span class="log-time">[${now}]</span> <span class="log-prefix">&gt;</span> <span>${item.text}</span>`;
        if (codeGenLogs) {
          codeGenLogs.appendChild(logLine);
          codeGenLogs.scrollTop = codeGenLogs.scrollHeight;
        }
        if (codeGenProgressBar) codeGenProgressBar.style.width = `${item.progress}%`;
        if (codeGenProgressText) codeGenProgressText.textContent = `Compiling Custom Website Modules... ${item.progress}%`;
        step++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          codeGenModalOverlay.classList.remove('active');
          codeGenModalOverlay.setAttribute('aria-hidden', 'true');
          if (callback) callback();
        }, 400);
      }
    }, 320);
  }

  // Toggle Source Code View in Full Preview
  if (btnToggleCodeView) {
    btnToggleCodeView.addEventListener('click', () => {
      const fpPageCanvas = document.getElementById('fpPageCanvas');
      if (!fpPageCanvas) return;

      isShowingCodeView = !isShowingCodeView;

      if (isShowingCodeView) {
        const appNameVal = inputAppName ? inputAppName.value.trim() : 'Proyek Anda';
        const notesVal = inputNotes ? inputNotes.value.trim() : '';
        const selectedCatVal = selectCategory ? selectCategory.value : 'Landing Page Promosi';
        const topicDetails = detectTopicDetails(appNameVal, notesVal, selectedCatVal);

        fpPageCanvas.dataset.originalHtml = fpPageCanvas.innerHTML;
        fpPageCanvas.innerHTML = `
          <div style="padding: 3rem; background: #06090E; color: #34D399; font-family: 'Consolas', monospace; min-height: 100vh;">
            <div style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #1F2937; display: flex; justify-content: space-between;">
              <span style="color: #60A5FA; font-weight: bold;">👨‍💻 SOURCE CODE RANGKAIAN (AI GENERATED)</span>
              <span style="color: #9CA3AF;">Project: ${appNameVal}</span>
            </div>
            <pre style="white-space: pre-wrap; font-size: 0.9rem; line-height: 1.6; color: #F3F4F6;">
// AI Live Compiled React Component for "${appNameVal}"
import React, { useState } from 'react';
import { Navbar, Hero, FeatureGrid, ReferenceShowcase, Footer } from '@joserizal/components';

export default function ${appNameVal.replace(/[^a-zA-Z0-9]/g, '') || 'CustomApp'}() {
  const [topic] = useState("${topicDetails.topic}");
  
  return (
    &lt;div className="website-root-container" style={{ background: '${topicDetails.colors.bg}' }}&gt;
      &lt;Navbar brand="${appNameVal.toUpperCase()}" /&gt;
      
      &lt;Hero 
        badge="${topicDetails.heroBadge}"
        headline="${topicDetails.heroTitleText}"
        subheadline="${topicDetails.heroDesc}"
        icon="${topicDetails.visualIcon}"
        stats={${JSON.stringify([topicDetails.stat1, topicDetails.stat2, topicDetails.stat3])}}
      /&gt;

      &lt;FeatureGrid items={${JSON.stringify(topicDetails.customFeatures || [])}} /&gt;

      &lt;WhatsAppCTA phone="085163612553" text="Wujudkan Website Ini Now!" /&gt;
      
      &lt;Footer text="Built by Jose Rizal" /&gt;
    &lt;/div&gt;
  );
}</pre>
          </div>
        `;
        if (fpToggleCodeText) fpToggleCodeText.textContent = '👁 Lihat Live Visual Preview';
      } else {
        if (fpPageCanvas.dataset.originalHtml) {
          fpPageCanvas.innerHTML = fpPageCanvas.dataset.originalHtml;
        }
        if (fpToggleCodeText) fpToggleCodeText.textContent = '💻 Lihat Kode (Code Vibe)';
      }
    });
  }

  // Real-time Input Listeners
  if (inputAppName) inputAppName.addEventListener('input', updateLivePreview);
  if (selectCategory) selectCategory.addEventListener('change', updateLivePreview);
  if (selectLayout) selectLayout.addEventListener('change', updateLivePreview);
  if (inputRefUrl) inputRefUrl.addEventListener('input', updateLivePreview);
  if (inputNotes) inputNotes.addEventListener('input', updateLivePreview);
  featureCheckboxes.forEach((chk) => chk.addEventListener('change', updateLivePreview));

  // Submit Form Button -> Shows Full Preview (Step 2)
  if (btnSubmitForm) {
    btnSubmitForm.addEventListener('click', () => {
      const appNameVal = inputAppName ? inputAppName.value.trim() : '';
      if (!appNameVal) {
        alert('Mohon isi Nama Proyek / Usaha Anda terlebih dahulu.');
        inputAppName.focus();
        return;
      }

      const notesVal = inputNotes ? inputNotes.value.trim() : '';
      const selectedCatVal = selectCategory ? selectCategory.value : 'Landing Page Promosi';
      const topicDetails = detectTopicDetails(appNameVal, notesVal, selectedCatVal);

      populateFullPreview();
      closeWebModal();

      // Trigger AI Coding Simulation Vibe
      triggerAiCodingSimulation(appNameVal, topicDetails, () => {
        openFullPreview();
      });
    });
  }

  // Trigger WhatsApp from Full Preview & Fallback Popup
  if (btnPreviewToWA) {
    btnPreviewToWA.addEventListener('click', redirectToWhatsApp);
  }
  if (fpCtaWaBtn) {
    fpCtaWaBtn.addEventListener('click', redirectToWhatsApp);
  }
  if (btnConfirmWhatsapp) {
    btnConfirmWhatsapp.addEventListener('click', redirectToWhatsApp);
  }
  if (btnCancelConfirmation) {
    btnCancelConfirmation.addEventListener('click', closePopup);
  }

  // ==========================================================================
  // 6. REAL-TIME VIBE CODING PREVIEW & WHATSAPP SUMMARY SYSTEM
  // ==========================================================================
  const vibePreviewModal = document.getElementById('vibePreviewModal');
  const btnOpenVibePreview = document.getElementById('btnOpenVibePreview');
  const btnCloseVibeModal = document.getElementById('btnCloseVibeModal');
  const vibeChatMessages = document.getElementById('vibeChatMessages');
  const vibeLoadingIndicator = document.getElementById('vibeLoadingIndicator');
  const vibeLimitAlert = document.getElementById('vibeLimitAlert');
  const vibeChatForm = document.getElementById('vibeChatForm');
  const vibeInputPrompt = document.getElementById('vibeInputPrompt');
  const btnVibeSend = document.getElementById('btnVibeSend');
  const vibeQuotaText = document.getElementById('vibeQuotaText');
  const vibeOrderActionRow = document.getElementById('vibeOrderActionRow');
  const btnVibeProceedOrder = document.getElementById('btnVibeProceedOrder');
  const vibeEmptyPlaceholder = document.getElementById('vibeEmptyPlaceholder');
  const vibePreviewIframe = document.getElementById('vibePreviewIframe');
  const vibeIframeWrapper = document.getElementById('vibeIframeWrapper');
  const btnDeviceDesktop = document.getElementById('btnDeviceDesktop');
  const btnDeviceMobile = document.getElementById('btnDeviceMobile');
  const vibeWaLoadingOverlay = document.getElementById('vibeWaLoadingOverlay');

  // Session ID Management (unique per visitor session)
  let vibeSessionId = sessionStorage.getItem('vibe_session_id');
  if (!vibeSessionId) {
    vibeSessionId = 'sess_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    sessionStorage.setItem('vibe_session_id', vibeSessionId);
  }

  let vibeCurrentHtml = '';
  let vibeLastPrompt = '';
  let vibeGeneratedCount = 0;

  // Open Vibe Preview Modal
  if (btnOpenVibePreview) {
    btnOpenVibePreview.addEventListener('click', (e) => {
      e.preventDefault();
      if (vibePreviewModal) {
        vibePreviewModal.classList.add('active');
        vibePreviewModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  // Close Vibe Preview Modal
  if (btnCloseVibeModal) {
    btnCloseVibeModal.addEventListener('click', () => {
      if (vibePreviewModal) {
        vibePreviewModal.classList.remove('active');
        vibePreviewModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  }

  if (vibePreviewModal) {
    vibePreviewModal.addEventListener('click', (e) => {
      if (e.target === vibePreviewModal) {
        vibePreviewModal.classList.remove('active');
        vibePreviewModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  }

  // Device Toggle
  if (btnDeviceDesktop && btnDeviceMobile && vibeIframeWrapper) {
    btnDeviceDesktop.addEventListener('click', () => {
      btnDeviceDesktop.classList.add('active');
      btnDeviceMobile.classList.remove('active');
      vibeIframeWrapper.classList.remove('mobile-mode');
    });

    btnDeviceMobile.addEventListener('click', () => {
      btnDeviceMobile.classList.add('active');
      btnDeviceDesktop.classList.remove('active');
      vibeIframeWrapper.classList.add('mobile-mode');
    });
  }

  // Helper to add chat bubble
  function appendChatBubble(role, text) {
    if (!vibeChatMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `vibe-msg ${role === 'user' ? 'vibe-msg-user' : 'vibe-msg-assistant'}`;
    
    const avatar = role === 'user' ? '👤' : '🤖';
    const cleanText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');

    msgDiv.innerHTML = `
      <div class="vibe-avatar">${avatar}</div>
      <div class="vibe-bubble">
        <p>${cleanText}</p>
      </div>
    `;

    vibeChatMessages.appendChild(msgDiv);
    vibeChatMessages.scrollTop = vibeChatMessages.scrollHeight;
  }

  // Handle Chat Form Submit -> Generate HTML
  if (vibeChatForm) {
    vibeChatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const promptText = vibeInputPrompt ? vibeInputPrompt.value.trim() : '';
      if (!promptText) return;

      vibeLastPrompt = promptText;

      // Add user prompt bubble
      appendChatBubble('user', promptText);
      if (vibeInputPrompt) vibeInputPrompt.value = '';

      // ── UI Loading state ──
      if (vibeLoadingIndicator) vibeLoadingIndicator.style.display = 'flex';
      if (btnVibeSend) btnVibeSend.disabled = true;
      if (vibeInputPrompt) vibeInputPrompt.disabled = true;

      // Tampilkan skeleton di preview panel
      const vibeIframeSkeleton = document.getElementById('vibeIframeSkeleton');
      const vibeEmptyPlaceholder = document.getElementById('vibeEmptyPlaceholder');
      if (vibeIframeSkeleton) {
        vibeIframeSkeleton.classList.add('active');
        if (vibeEmptyPlaceholder) vibeEmptyPlaceholder.style.display = 'none';
      }

      // ── Cycling loading step messages ──
      const loadingSteps = [
        '🔍 Menganalisis permintaan Anda...',
        '✏️ Menyusun struktur HTML & layout...',
        '🎨 Menerapkan palet warna & tipografi...',
        '⚙️ Mengoptimalkan komponen UI...',
        '✨ Finishing touch & merapikan kode...'
      ];
      const vibeLoadingStep = document.getElementById('vibeLoadingStep');
      let stepIdx = 0;
      const stepInterval = setInterval(() => {
        stepIdx = (stepIdx + 1) % loadingSteps.length;
        if (vibeLoadingStep) {
          vibeLoadingStep.style.opacity = '0';
          setTimeout(() => {
            if (vibeLoadingStep) {
              vibeLoadingStep.textContent = loadingSteps[stepIdx];
              vibeLoadingStep.style.opacity = '1';
            }
          }, 200);
        }
      }, 2200);

      // Set initial step text
      if (vibeLoadingStep) vibeLoadingStep.textContent = loadingSteps[0];
      if (vibeLoadingStep) vibeLoadingStep.style.transition = 'opacity 0.2s ease';

      try {
        const response = await fetch('/api/design-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: vibeSessionId,
            prompt: promptText,
            previous_html: vibeCurrentHtml
          })
        });

        const data = await response.json();

        // Hentikan cycling steps
        clearInterval(stepInterval);

        if (vibeLoadingIndicator) vibeLoadingIndicator.style.display = 'none';
        if (vibeIframeSkeleton) vibeIframeSkeleton.classList.remove('active');

        if (!response.ok) {
          if (data.quota_exceeded) {
            if (vibeQuotaText) vibeQuotaText.textContent = `0 dari 5 percobaan tersisa`;
            if (vibeLimitAlert) vibeLimitAlert.style.display = 'flex';
            appendChatBubble('assistant', 'Jatah 5x generate gratis Anda sudah habis. Silakan klik tombol "Lanjutkan Pemesanan" untuk melanjutkan!');
            return;
          }
          appendChatBubble('assistant', `Mohon maaf, terjadi kesalahan: ${data.error || 'Gagal merancang desain'}`);
          if (btnVibeSend) btnVibeSend.disabled = false;
          if (vibeInputPrompt) vibeInputPrompt.disabled = false;
          return;
        }

        // Success
        vibeCurrentHtml = data.html_result;
        vibeGeneratedCount = data.count;
        const remainingQuota = data.remaining_quota;

        if (vibeQuotaText) {
          vibeQuotaText.textContent = `${remainingQuota} dari ${data.max_limit} percobaan tersisa`;
        }

        appendChatBubble('assistant', `Rancangan desain website berhasil dibuat! Anda dapat melihat hasilnya pada panel preview di sebelah kanan.`);

        // Render HTML to Sandboxed Iframe
        if (vibeEmptyPlaceholder) vibeEmptyPlaceholder.style.display = 'none';
        if (vibePreviewIframe) {
          vibePreviewIframe.style.display = 'block';
          vibePreviewIframe.srcdoc = vibeCurrentHtml;
        }

        // Show "Lanjutkan Pemesanan" button (since at least 1 result generated)
        if (vibeOrderActionRow) {
          vibeOrderActionRow.style.display = 'flex';
        }

        // Check if remaining quota reached 0
        if (remainingQuota <= 0) {
          if (vibeLimitAlert) vibeLimitAlert.style.display = 'flex';
        } else {
          if (btnVibeSend) btnVibeSend.disabled = false;
          if (vibeInputPrompt) vibeInputPrompt.disabled = false;
          if (vibeInputPrompt) vibeInputPrompt.focus();
        }

      } catch (err) {
        console.error('Error generating preview:', err);
        clearInterval(stepInterval);
        if (vibeLoadingIndicator) vibeLoadingIndicator.style.display = 'none';
        if (vibeIframeSkeleton) vibeIframeSkeleton.classList.remove('active');
        if (btnVibeSend) btnVibeSend.disabled = false;
        if (vibeInputPrompt) vibeInputPrompt.disabled = false;
        appendChatBubble('assistant', 'Terjadi masalah koneksi ke server preview. Mohon periksa jaringan Anda dan coba lagi.');
      }
    });
  }

  // Handle "Lanjutkan Pemesanan" -> Generate Summary & Open WhatsApp
  if (btnVibeProceedOrder) {
    btnVibeProceedOrder.addEventListener('click', async (e) => {
      e.preventDefault();

      // PRE-OPEN tab dengan halaman redirect informatif (bukan blank)
      // Ini tetap dalam user gesture context, TAPI user langsung lihat konten
      const waTab = window.open('', '_blank');
      if (waTab) {
        waTab.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mengarahkan ke WhatsApp...</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Inter', sans-serif;
      background: #0f172a;
      color: #f1f5f9;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 1.5rem;
      text-align: center;
      padding: 2rem;
    }
    .icon { font-size: 3.5rem; animation: pulse 1.2s ease-in-out infinite; }
    @keyframes pulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.08);} }
    h1 { font-size: 1.25rem; font-weight: 700; color: #f1f5f9; }
    p { font-size: 0.875rem; color: #94a3b8; max-width: 320px; }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid rgba(37,211,102,0.2);
      border-top-color: #25D366;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .note { font-size: 0.75rem; color: #475569; margin-top: 0.5rem; }
  </style>
</head>
<body>
  <div class="icon">💬</div>
  <div class="spinner"></div>
  <h1>Menyiapkan pesan WhatsApp...</h1>
  <p>AI sedang merangkum kebutuhan desain Anda. Sebentar lagi Anda akan diarahkan ke WhatsApp tim sales.</p>
  <p class="note">Jangan tutup tab ini.</p>
</body>
</html>`);
        waTab.document.close();
      }

      // Show WA loading overlay
      if (vibeWaLoadingOverlay) {
        vibeWaLoadingOverlay.style.display = 'flex';
      }

      const buildFallbackUrl = () => {
        const msg = `Halo, saya tertarik untuk memesan jasa pembuatan web/app.\n\nKode referensi desain: ${vibeSessionId || 'N/A'}\n\nMohon info selanjutnya. Terima kasih.`;
        return `https://wa.me/6285163612553?text=${encodeURIComponent(msg)}`;
      };

      try {
        const response = await fetch('/api/generate-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: vibeSessionId,
            prompt: vibeLastPrompt
          })
        });

        let waUrl = buildFallbackUrl();

        if (response.ok) {
          const data = await response.json();
          if (data && data.wa_url) {
            waUrl = data.wa_url;
          }
        } else {
          console.warn('generate-summary API returned status:', response.status);
        }

        // Hide loading overlay
        if (vibeWaLoadingOverlay) {
          vibeWaLoadingOverlay.style.display = 'none';
        }

        // Arahkan tab yang sudah dibuka ke URL WhatsApp
        if (waTab && !waTab.closed) {
          waTab.location.href = waUrl;
        } else {
          // Fallback jika tab sudah ditutup user
          window.open(waUrl, '_blank');
        }

      } catch (err) {
        console.error('Error proceeding order:', err);
        if (vibeWaLoadingOverlay) {
          vibeWaLoadingOverlay.style.display = 'none';
        }
        // Gunakan tab yang sudah dibuka untuk fallback
        if (waTab && !waTab.closed) {
          waTab.location.href = buildFallbackUrl();
        } else {
          window.open(buildFallbackUrl(), '_blank');
        }
      }
    });
  }
});

