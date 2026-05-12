/* =========================================
   HOME BY TIKA — JS partagé
   Mobilier & portes en bois massif — Côte d'Ivoire
   ========================================= */

/* ============================================================
   CLOUDINARY — Hébergement cloud des photos & vidéos
   ----------------------------------------------------------
   Les helpers ci-dessous construisent les URLs et gèrent
   les galeries automatiques. La configuration vient de config.js.
   ============================================================ */
const CLD = {
  isReady() {
    return window.HBT_CONFIG && window.HBT_CONFIG.isCloudinaryReady();
  },
  cloudName() {
    return window.HBT_CONFIG && window.HBT_CONFIG.cloudinary.cloudName;
  },
  /* Construit une URL Cloudinary optimisée (auto-format, auto-qualité, dimension) */
  url(publicId, options) {
    if (!this.isReady() || !publicId) return null;
    options = options || {};
    const t = ['f_auto', 'q_auto'];
    if (options.w) t.push('w_' + options.w);
    if (options.h) t.push('h_' + options.h);
    if (options.crop) t.push('c_' + options.crop);
    if (options.dpr) t.push('dpr_' + options.dpr);
    return 'https://res.cloudinary.com/' + this.cloudName() +
           '/image/upload/' + t.join(',') + '/' + publicId;
  },
  /* URL pour une vidéo */
  videoUrl(publicId, options) {
    if (!this.isReady() || !publicId) return null;
    options = options || {};
    const t = ['f_auto', 'q_auto'];
    if (options.w) t.push('w_' + options.w);
    return 'https://res.cloudinary.com/' + this.cloudName() +
           '/video/upload/' + t.join(',') + '/' + publicId;
  },
  /* Galerie automatique — liste publique des ressources par tag */
  async listByTag(tag, type) {
    if (!this.isReady()) return [];
    type = type || 'image';
    try {
      const res = await fetch('https://res.cloudinary.com/' + this.cloudName() +
                              '/' + type + '/list/' + tag + '.json',
                              { cache: 'no-store' });
      if (!res.ok) return [];
      const data = await res.json();
      return data.resources || [];
    } catch (e) { return []; }
  }
};

/* URL Cloudinary conventionnelle pour la photo principale d'un produit */
function cloudinaryProductImage(id, w) {
  if (!CLD.isReady() || !id) return null;
  const folder = window.HBT_CONFIG.cloudinary.folders.produits;
  return CLD.url(folder + '/' + id, { w: w || 1200, crop: 'fill' });
}

/* URL Cloudinary pour la vidéo principale d'un produit */
function cloudinaryProductVideo(id, w) {
  if (!CLD.isReady() || !id) return null;
  const folder = window.HBT_CONFIG.cloudinary.folders.videos;
  return CLD.videoUrl(folder + '/' + id, { w: w || 1200 });
}

/* Gestion globale d'erreur d'image : remplace par le monogramme */
window.HBT_imageError = function(imgEl, monogram) {
  try {
    const container = imgEl.parentNode;
    if (container) {
      container.classList.remove('has-photo');
      imgEl.style.display = 'none';
      if (!container.querySelector('.icon')) {
        const icon = document.createElement('div');
        icon.className = 'icon';
        icon.textContent = monogram || '';
        container.appendChild(icon);
      }
    }
  } catch (e) {}
};


// Catalogue (source de vérité unique)
const CATALOG = [
  // ===== SALONS =====
  { id: 'sal-01', name: 'Salon Baoulé', cat: 'Salons', type: 'salons', price: 2450000, monogram: 'B', label: 'Pièce d\'exception', wood: 'Iroko',
    desc: 'Salon d\'angle 5 places en Iroko massif, structure sculptée à la main et coussins en coton naturel.' },
  { id: 'sal-02', name: 'Salon Akan', cat: 'Salons', type: 'salons', price: 1380000, monogram: 'A', label: '', wood: 'Framiré',
    desc: 'Canapé 3 places en Framiré, lignes modernes, finition huilée claire.' },

  // ===== TABLES =====
  { id: 'tab-01', name: 'Table Comoé', cat: 'Tables', type: 'tables', price: 690000, monogram: 'C', label: 'Nouveau', wood: 'Iroko',
    desc: 'Table à manger 8 places en Iroko massif, plateau épais d\'un seul tenant, pieds sculptés.' },
  { id: 'tab-02', name: 'Table basse Sassandra', cat: 'Tables', type: 'tables', price: 285000, monogram: 'S', label: '', wood: 'Framiré',
    desc: 'Table basse en Framiré, lignes épurées, parfaite pour un salon contemporain.' },

  // ===== CHAISES =====
  { id: 'chs-01', name: 'Chaise Yamoussoukro', cat: 'Chaises', type: 'chaises', price: 95000, monogram: 'Y', label: '', wood: 'Framiré',
    desc: 'Chaise en Framiré massif, assise sculptée pour un confort durable.' },
  { id: 'chs-02', name: 'Banc Korhogo', cat: 'Chaises', type: 'chaises', price: 220000, monogram: 'K', label: '', wood: 'Iroko',
    desc: 'Banc traditionnel en Iroko, finition naturelle, idéal en entrée ou bout de lit.' },

  // ===== LITS =====
  { id: 'lit-01', name: 'Lit Bandama', cat: 'Lits', type: 'lits', price: 980000, monogram: 'B', label: '', wood: 'Iroko',
    desc: 'Lit double 180×200 en Iroko sculpté, tête de lit aux motifs traditionnels.' },

  // ===== ARMOIRES =====
  { id: 'arm-01', name: 'Armoire Cocody', cat: 'Armoires', type: 'armoires', price: 1280000, monogram: 'C', label: '', wood: 'Iroko',
    desc: 'Armoire 4 portes en Iroko massif, ferrures laiton, intérieur compartimenté.' },
  { id: 'arm-02', name: 'Armoire Zaranou', cat: 'Armoires', type: 'armoires', price: 890000, monogram: 'Z', label: '', wood: 'Framiré',
    desc: 'Armoire 3 portes en Framiré, design moderne, miroir en façade.' },

  // ===== CUISINES =====
  { id: 'cui-01', name: 'Cuisine Akwaba', cat: 'Cuisines', type: 'cuisines', price: 3450000, monogram: 'A', label: 'Sur-mesure', wood: 'Iroko',
    desc: 'Cuisine équipée complète en Iroko massif, plan de travail et placards façonnés à la commande.' },

  // ===== MEUBLES TV =====
  { id: 'mtv-01', name: 'Meuble TV Aboisso', cat: 'Meubles TV', type: 'meublestv', price: 320000, monogram: 'A', label: '', wood: 'Framiré',
    desc: 'Meuble TV en Framiré, rangements ouverts et tiroirs, finition huilée.' },

  // ===== BUREAUX =====
  { id: 'bur-01', name: 'Bureau Plateau', cat: 'Bureaux', type: 'bureaux', price: 850000, monogram: 'P', label: '', wood: 'Iroko',
    desc: 'Bureau directorial en Iroko massif, large plateau, tiroirs à fermeture douce.' },

  // ===== TECK / EXTÉRIEUR =====
  { id: 'ext-01', name: 'Salon de jardin Assinie', cat: 'Extérieur', type: 'exterieur', price: 1850000, monogram: 'A', label: 'Teck', wood: 'Teck',
    desc: 'Salon de jardin 4 places en Teck massif, résiste à la pluie et au soleil sans entretien lourd.' },
  { id: 'ext-02', name: 'Table de terrasse Grand-Bassam', cat: 'Extérieur', type: 'exterieur', price: 780000, monogram: 'G', label: 'Teck', wood: 'Teck',
    desc: 'Table de terrasse 6 places en Teck, finition huilée, idéale pour bord de mer.' },
  { id: 'ext-03', name: 'Chaise longue Sainte-Anne', cat: 'Extérieur', type: 'exterieur', price: 245000, monogram: 'S', label: '', wood: 'Teck',
    desc: 'Chaise longue inclinable en Teck massif, parfaite au bord de la piscine.' },

  // ===== PORTES =====
  { id: 'por-01', name: 'Porte Akwaba', cat: 'Portes', type: 'portes', price: 980000, monogram: 'A', label: 'Sécurisée', wood: 'Iroko',
    desc: 'Porte d\'entrée en Iroko sculpté, structure renforcée et serrurerie haute sécurité.' },
  { id: 'por-02', name: 'Porte Lagune', cat: 'Portes', type: 'portes', price: 320000, monogram: 'L', label: 'Moderne', wood: 'Framiré',
    desc: 'Porte intérieure en Framiré, lignes modernes, finition huilée naturelle.' },
  { id: 'por-03', name: 'Porte Tamberma', cat: 'Portes', type: 'portes', price: 1450000, monogram: 'T', label: 'Sculptée', wood: 'Iroko',
    desc: 'Porte sculptée en Iroko, motifs traditionnels ivoiriens taillés à la main.' },
  { id: 'por-04', name: 'Porte Forteresse', cat: 'Portes', type: 'portes', price: 1180000, monogram: 'F', label: 'Sécurisée', wood: 'Iroko',
    desc: 'Porte d\'entrée sécurisée en Iroko avec renforts métalliques et serrure 5 points.' }
];

const CART_KEY = 'home-by-tika-cart';
const PHOTOS_KEY = 'home-by-tika-photos';
const PRICES_KEY = 'home-by-tika-prices';
const FREE_SHIPPING_THRESHOLD = 1500000; // FCFA
const SHIPPING_FEE = 50000; // FCFA

/* ---------- Photos store (vraies images uploadées par l'admin) ---------- */
const Photos = {
  read() {
    try { return JSON.parse(localStorage.getItem(PHOTOS_KEY)) || {}; }
    catch (e) { return {}; }
  },
  write(map) { localStorage.setItem(PHOTOS_KEY, JSON.stringify(map)); },
  get(id) { return this.read()[id] || null; },
  set(id, dataUrl) { const m = this.read(); m[id] = dataUrl; this.write(m); },
  remove(id) { const m = this.read(); delete m[id]; this.write(m); },
  clear() { localStorage.removeItem(PHOTOS_KEY); },
  totalSize() {
    const raw = localStorage.getItem(PHOTOS_KEY) || '';
    return Math.round(raw.length * 2 / 1024); // ~Ko
  }
};

/* ---------- Prices store (prix personnalisés via l'admin) ---------- */
const Prices = {
  read() {
    try { return JSON.parse(localStorage.getItem(PRICES_KEY)) || {}; }
    catch (e) { return {}; }
  },
  write(map) { localStorage.setItem(PRICES_KEY, JSON.stringify(map)); },
  get(id) {
    const v = this.read()[id];
    return (v === undefined || v === null) ? null : Number(v);
  },
  set(id, value) { const m = this.read(); m[id] = Number(value); this.write(m); },
  remove(id) { const m = this.read(); delete m[id]; this.write(m); },
  clear() { localStorage.removeItem(PRICES_KEY); },
  count() { return Object.keys(this.read()).length; }
};

/* Prix effectif d'un produit (personnalisé > prix par défaut) */
function getPrice(p) {
  if (!p) return 0;
  const custom = Prices.get(p.id);
  return custom !== null ? custom : p.price;
}

/* ---------- Overrides store (textes personnalisés : nom, desc, bois…) ---------- */
const OVERRIDES_KEY = 'home-by-tika-overrides';
const Overrides = {
  read() {
    try { return JSON.parse(localStorage.getItem(OVERRIDES_KEY)) || {}; }
    catch (e) { return {}; }
  },
  write(map) { localStorage.setItem(OVERRIDES_KEY, JSON.stringify(map)); },
  getProduct(id) { return this.read()[id] || {}; },
  get(id, field) {
    const o = this.read()[id] || {};
    return o[field];
  },
  set(id, field, value) {
    const map = this.read();
    if (!map[id]) map[id] = {};
    if (value === '' || value === null || value === undefined) {
      delete map[id][field];
      if (Object.keys(map[id]).length === 0) delete map[id];
    } else {
      map[id][field] = value;
    }
    this.write(map);
  },
  resetProduct(id) {
    const map = this.read();
    delete map[id];
    this.write(map);
  },
  clear() { localStorage.removeItem(OVERRIDES_KEY); },
  count() {
    const map = this.read();
    let n = 0;
    Object.values(map).forEach(o => n += Object.keys(o).length);
    return n;
  }
};

/* Valeur effective d'un champ texte (surcharge > valeur par défaut) */
function getField(p, field) {
  const v = Overrides.get(p.id, field);
  return (v !== undefined && v !== null) ? v : p[field];
}

/* ---------- VideoDB : stockage des vidéos dans IndexedDB ---------- */
const VideoDB = {
  _db: null,
  open() {
    if (this._db) return Promise.resolve(this._db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('home-by-tika-videos', 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('videos')) {
          db.createObjectStore('videos', { keyPath: 'id' });
        }
      };
      req.onsuccess = (e) => { this._db = e.target.result; resolve(this._db); };
      req.onerror = (e) => reject(e);
    });
  },
  async set(id, blob, meta) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('videos', 'readwrite');
      tx.objectStore('videos').put({ id, blob, type: blob.type, size: blob.size, meta: meta || {} });
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e);
    });
  },
  async get(id) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('videos', 'readonly');
      const req = tx.objectStore('videos').get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = (e) => reject(e);
    });
  },
  async remove(id) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('videos', 'readwrite');
      tx.objectStore('videos').delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e);
    });
  },
  async getAll() {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('videos', 'readonly');
      const req = tx.objectStore('videos').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e);
    });
  },
  async clear() {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('videos', 'readwrite');
      tx.objectStore('videos').clear();
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e);
    });
  }
};

/* Cache mémoire : id -> blob URL pour les vidéos */
const VIDEO_URLS = {};
async function loadVideoCache() {
  // Libère les anciennes URL
  Object.values(VIDEO_URLS).forEach(url => URL.revokeObjectURL(url));
  Object.keys(VIDEO_URLS).forEach(k => delete VIDEO_URLS[k]);
  try {
    const all = await VideoDB.getAll();
    all.forEach(v => {
      if (v && v.blob) VIDEO_URLS[v.id] = URL.createObjectURL(v.blob);
    });
  } catch (e) { /* IndexedDB indisponible */ }
}
function getVideoUrl(id) { return VIDEO_URLS[id] || null; }

/* ---------- SiteImages : images générales (atelier, fond hero) ---------- */
const SITE_IMAGES_KEY = 'home-by-tika-site-images';
const SiteImages = {
  read() {
    try { return JSON.parse(localStorage.getItem(SITE_IMAGES_KEY)) || {}; }
    catch (e) { return {}; }
  },
  write(map) { localStorage.setItem(SITE_IMAGES_KEY, JSON.stringify(map)); },
  get(key) { return this.read()[key] || null; },
  set(key, dataUrl) { const m = this.read(); m[key] = dataUrl; this.write(m); },
  remove(key) { const m = this.read(); delete m[key]; this.write(m); },
  clear() { localStorage.removeItem(SITE_IMAGES_KEY); },
  count() { return Object.keys(this.read()).length; },
  totalSize() {
    const raw = localStorage.getItem(SITE_IMAGES_KEY) || '';
    return Math.round(raw.length * 2 / 1024); // ~Ko
  }
};

/* ---------- Cloudinary : cache des médias disponibles ---------- */
// Au chargement de la page, on liste les médias présents dans le cloud
// pour savoir lesquels sont disponibles (sinon on tomberait sur du 404).
const CloudCache = {
  products: {},        // { 'por-01': cloudUrl, ... }
  productVideos: {},   // { 'por-01': cloudVideoUrl, ... }
  siteAtelier: null,
  siteHero: null,
  galleries: {}        // { 'portes': [{url, ...}], ... }
};

async function loadCloudCache() {
  if (!window.Cloudinary || !Cloudinary.isConfigured()) return;
  const TAGS = (window.CLOUDINARY_CONFIG && window.CLOUDINARY_CONFIG.tags) || {};

  // 1. Photos produits
  try {
    const list = await Cloudinary.listByTag(TAGS.product, 'image');
    list.forEach(r => {
      const id = (r.public_id || '').split('/').pop();
      if (id) {
        CloudCache.products[id] = Cloudinary.productImageUrl(id, { width: 1000 });
      }
    });
  } catch (e) {}

  // 2. Vidéos produits
  try {
    const list = await Cloudinary.listByTag(TAGS.productVideo, 'video');
    list.forEach(r => {
      const raw = (r.public_id || '').split('/').pop();
      // public_id se termine par "-video", on retire ce suffixe
      const id = raw.replace(/-video$/, '');
      if (id) {
        CloudCache.productVideos[id] = Cloudinary.productVideoUrl(id, { width: 900 });
      }
    });
  } catch (e) {}

  // 3. Image atelier (site)
  try {
    const list = await Cloudinary.listByTag(TAGS.siteAtelier, 'image');
    if (list.length) CloudCache.siteAtelier = Cloudinary.siteImageUrl('atelier', { width: 1400 });
  } catch (e) {}

  // 4. Fond hero (site)
  try {
    const list = await Cloudinary.listByTag(TAGS.siteHero, 'image');
    if (list.length) CloudCache.siteHero = Cloudinary.siteImageUrl('hero-bg', { width: 2200 });
  } catch (e) {}

  // 5. Galeries (chargées à la demande par chaque page qui en a besoin)
}

async function loadGallery(name) {
  if (!window.Cloudinary || !Cloudinary.isConfigured()) return [];
  const TAGS = (window.CLOUDINARY_CONFIG && window.CLOUDINARY_CONFIG.tags) || {};
  const key = 'gallery' + name.charAt(0).toUpperCase() + name.slice(1);
  const tag = TAGS[key];
  if (!tag) return [];
  const type = name === 'videos' ? 'video' : 'image';
  const list = await Cloudinary.listByTag(tag, type);
  CloudCache.galleries[name] = list.map(r => ({
    publicId: r.public_id,
    url: type === 'video'
      ? Cloudinary.url(r.public_id, { resourceType: 'video', width: 900 })
      : Cloudinary.url(r.public_id, { width: 900, quality: 'auto', format: 'auto' }),
    thumbUrl: Cloudinary.url(r.public_id, {
      resourceType: type, width: 500, crop: 'fill', gravity: 'auto'
    }),
    width: r.width, height: r.height, type
  }));
  return CloudCache.galleries[name];
}

/* Applique les images du site (atelier, fond hero) sur les éléments du DOM
   Priorité : Cloudinary > localStorage > défaut */
function applySiteImages() {
  const atelier = CloudCache.siteAtelier || SiteImages.get('atelier');
  const heroBg  = CloudCache.siteHero    || SiteImages.get('hero-bg');

  document.querySelectorAll('.story-image').forEach(el => {
    if (atelier) {
      el.style.backgroundImage = `url("${atelier}")`;
      el.classList.add('has-image');
    } else {
      el.style.backgroundImage = '';
      el.classList.remove('has-image');
    }
  });

  const hero = document.querySelector('.hero');
  if (hero) {
    if (heroBg) {
      hero.style.setProperty('--hero-bg-image', `url("${heroBg}")`);
      hero.classList.add('has-bg-image');
    } else {
      hero.style.removeProperty('--hero-bg-image');
      hero.classList.remove('has-bg-image');
    }
  }
}

/* ---------- Cart store ---------- */
const Cart = {
  read() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
  },
  write(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    this.refreshBadge();
  },
  add(id) {
    const items = this.read();
    const found = items.find(i => i.id === id);
    if (found) found.qty += 1;
    else items.push({ id, qty: 1 });
    this.write(items);
  },
  remove(id) {
    this.write(this.read().filter(i => i.id !== id));
  },
  setQty(id, qty) {
    const items = this.read();
    const it = items.find(i => i.id === id);
    if (!it) return;
    it.qty = Math.max(1, qty);
    this.write(items);
  },
  count() {
    return this.read().reduce((n, i) => n + i.qty, 0);
  },
  total() {
    return this.read().reduce((sum, i) => {
      const p = CATALOG.find(c => c.id === i.id);
      return sum + (p ? getPrice(p) * i.qty : 0);
    }, 0);
  },
  refreshBadge() {
    const el = document.getElementById('cart-count');
    if (el) el.textContent = this.count();
  }
};

/* ---------- Toast notifications ---------- */
function showToast(html) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.innerHTML = html;
  // eslint-disable-next-line no-unused-expressions
  t.offsetHeight;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ---------- Format ---------- */
function fcfa(n) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' FCFA';
}

/* ---------- Render product card ---------- */
function productCardHTML(p) {
  // Textes éventuellement surchargés
  const name = getField(p, 'name');
  const desc = getField(p, 'desc');
  const wood = getField(p, 'wood');
  const cat = getField(p, 'cat');
  const label = getField(p, 'label');
  const monogram = getField(p, 'monogram');

  // Médias — priorité Cloudinary (uniquement si réellement uploadé)
  // > vidéo locale > photo locale > image par défaut > monogramme
  const cldVideo = CloudCache.productVideos[p.id] || null;
  const localVideo = getVideoUrl(p.id);
  const videoSrc = cldVideo || localVideo || null;

  const cldImg = CloudCache.products[p.id] || null;
  const localImg = Photos.get(p.id);
  const imgSrc = cldImg || localImg || p.image || null;

  const hasMedia = !!(videoSrc || imgSrc);

  let mediaHtml;
  if (videoSrc) {
    mediaHtml = `<video class="product-video" src="${videoSrc}" autoplay muted loop playsinline preload="metadata"
                        onerror="HBT_imageError(this, '${monogram || ''}')"></video>`;
  } else if (imgSrc) {
    mediaHtml = `<img src="${imgSrc}" alt="${name}" class="product-photo" loading="lazy" decoding="async"
                      onerror="HBT_imageError(this, '${monogram || ''}')">`;
  } else {
    mediaHtml = `<div class="icon">${monogram || ''}</div>`;
  }

  return `
    <article class="product-card" data-type="${p.type}">
      <div class="product-image${hasMedia ? ' has-photo' : ''}">
        ${mediaHtml}
        ${label ? `<span class="label">${label}</span>` : ''}
        ${wood ? `<span class="wood-tag">${wood}</span>` : ''}
      </div>
      <div class="product-body">
        <span class="product-cat">${cat || ''}</span>
        <h3 class="product-name">${name || ''}</h3>
        <p class="product-desc">${desc || ''}</p>
        <div class="product-foot">
          <span class="product-price">${fcfa(getPrice(p))}</span>
          <button class="add-btn" data-add="${p.id}">Ajouter</button>
        </div>
      </div>
    </article>
  `;
}

function renderProducts(target, filter = 'all', limit = null) {
  const root = document.getElementById(target);
  if (!root) return;
  let items = filter === 'all' ? CATALOG : CATALOG.filter(p => p.type === filter);
  if (limit) items = items.slice(0, limit);
  root.innerHTML = items.map(productCardHTML).join('');
}

/* ---------- Cart page render ---------- */
function renderCartPage() {
  const list = document.getElementById('cart-list');
  const empty = document.getElementById('cart-empty');
  const summary = document.getElementById('cart-summary');
  if (!list) return;

  const items = Cart.read();
  if (items.length === 0) {
    list.innerHTML = '';
    if (empty) empty.style.display = 'block';
    if (summary) summary.style.display = 'none';
    return;
  }
  if (empty) empty.style.display = 'none';
  if (summary) summary.style.display = 'block';

  list.innerHTML = items.map(it => {
    const p = CATALOG.find(c => c.id === it.id);
    if (!p) return '';
    const name = getField(p, 'name');
    const wood = getField(p, 'wood');
    const cat = getField(p, 'cat');
    const monogram = getField(p, 'monogram');
    const img = Photos.get(p.id) || p.image || null;
    return `
      <li class="cart-item" data-id="${p.id}">
        <div class="cart-thumb${img ? ' has-photo' : ''}">
          ${img
            ? `<img src="${img}" alt="${name}" class="product-photo">`
            : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:2rem;color:rgba(200,153,104,0.55);font-style:italic;">${monogram || ''}</div>`}
        </div>
        <div class="cart-info">
          <span class="cat">${cat || ''} · ${wood || ''}</span>
          <h3>${name || ''}</h3>
          <div class="qty-controls">
            <button data-qty="dec">−</button>
            <span>${it.qty}</span>
            <button data-qty="inc">+</button>
          </div>
        </div>
        <div>
          <div class="cart-line-price">${fcfa(getPrice(p) * it.qty)}</div>
          <button class="cart-remove">Retirer</button>
        </div>
      </li>
    `;
  }).join('');

  const total = Cart.total();
  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const grand = total + shipping;
  document.getElementById('sum-subtotal').textContent = fcfa(total);
  document.getElementById('sum-shipping').textContent = shipping === 0 ? 'Offerte' : fcfa(shipping);
  document.getElementById('sum-total').innerHTML = `<strong>${fcfa(grand)}</strong>`;
}

/* ---------- Global click handlers ---------- */
document.addEventListener('click', (e) => {
  // Add to cart
  const addBtn = e.target.closest('[data-add]');
  if (addBtn) {
    const id = addBtn.dataset.add;
    const p = CATALOG.find(c => c.id === id);
    Cart.add(id);
    showToast(`<span class="gold">✓</span> &nbsp;${p ? p.name : 'Article'} ajouté au panier`);
    return;
  }

  // Filter products
  const fbtn = e.target.closest('.filter-btn');
  if (fbtn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    fbtn.classList.add('active');
    renderProducts('shop-grid', fbtn.dataset.filter);
    return;
  }

  // Cart page actions
  const item = e.target.closest('.cart-item');
  if (item) {
    const id = item.dataset.id;
    if (e.target.matches('[data-qty="inc"]')) {
      const cur = Cart.read().find(i => i.id === id);
      Cart.setQty(id, (cur ? cur.qty : 1) + 1);
      renderCartPage();
    } else if (e.target.matches('[data-qty="dec"]')) {
      const cur = Cart.read().find(i => i.id === id);
      if (cur && cur.qty > 1) { Cart.setQty(id, cur.qty - 1); renderCartPage(); }
    } else if (e.target.matches('.cart-remove')) {
      Cart.remove(id);
      renderCartPage();
      showToast('<span class="gold">—</span> &nbsp;Article retiré du panier');
    }
  }

  // Checkout
  if (e.target.id === 'checkout-btn') {
    showToast('<span class="gold">✓</span> &nbsp;Commande simulée — Akwaba, merci !');
    setTimeout(() => { Cart.write([]); renderCartPage(); }, 1200);
  }
});

/* ---------- Forms ---------- */
document.addEventListener('submit', (e) => {
  if (e.target.id === 'contact-form') {
    e.preventDefault();
    const ok = document.getElementById('form-success');
    if (ok) {
      ok.classList.add('visible');
      ok.textContent = '✓  Merci, votre message a bien été reçu. Notre atelier vous répond sous 48 h.';
    }
    e.target.reset();
  }
  if (e.target.id === 'newsletter-form') {
    e.preventDefault();
    showToast('<span class="gold">✓</span> &nbsp;Inscription confirmée');
    e.target.reset();
  }
});

/* ---------- WhatsApp floating button ---------- */
function injectWhatsApp() {
  if (document.querySelector('.wa-float')) return;
  const a = document.createElement('a');
  a.className = 'wa-float';
  a.href = 'https://wa.me/2250748738671?text=Bonjour%20HOME%20BY%20TIKA%2C%20je%20souhaite%20obtenir%20des%20informations.';
  a.target = '_blank';
  a.rel = 'noopener';
  a.setAttribute('aria-label', 'Contacter HOME BY TIKA sur WhatsApp');
  a.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
    </svg>
  `;
  document.body.appendChild(a);
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  Cart.refreshBadge();
  injectWhatsApp();

  // Pré-charge en parallèle : cache Cloudinary + cache vidéos locales
  try {
    await Promise.all([
      loadCloudCache().catch(() => {}),
      loadVideoCache().catch(() => {})
    ]);
  } catch (e) { /* ignore */ }

  // Applique les images du site (atelier, fond hero) avec priorité Cloudinary
  applySiteImages();

  // Rend les grilles de produits
  renderProducts('home-grid', 'all', 4);
  renderProducts('shop-grid', 'all');
  renderCartPage();

  // Galerie automatique sur les pages qui en ont besoin
  if (typeof renderAutoGalleries === 'function') renderAutoGalleries();
});
