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

  // ===== SERRURES & ACCESSOIRES =====
  { id: 'ser-01', name: 'Serrure Atlas', cat: 'Serrures', type: 'serrures', price: 185000, monogram: 'A', label: 'Sécurité', wood: 'Laiton massif',
    desc: 'Serrure 5 points en laiton massif, finition vieux bronze, compatible portes Iroko.' },
  { id: 'ser-02', name: 'Poignée Comoé', cat: 'Serrures', type: 'serrures', price: 48000, monogram: 'C', label: '', wood: 'Laiton',
    desc: 'Poignée de porte en laiton patiné, design contemporain, prise en main confortable.' },
  { id: 'ser-03', name: 'Crémone Royale', cat: 'Serrures', type: 'serrures', price: 95000, monogram: 'R', label: '', wood: 'Laiton',
    desc: 'Crémone décorative en laiton ouvragé pour portes-fenêtres et grandes ouvertures.' },
  { id: 'ser-04', name: 'Heurtoir Akwaba', cat: 'Serrures', type: 'serrures', price: 62000, monogram: 'A', label: 'Sculpté', wood: 'Bronze',
    desc: 'Heurtoir en bronze coulé, motifs traditionnels ivoiriens taillés main.' },

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
const ORDERS_KEY = 'home-by-tika-orders';

/* ============================================================
   SUPABASE — Suivi commandes multi-appareils
   Tombe en arrière sur localStorage si non configuré.
   ============================================================ */
const Supa = {
  ready() {
    return window.HBT_CONFIG && window.HBT_CONFIG.isSupabaseReady && window.HBT_CONFIG.isSupabaseReady();
  },
  url() { return window.HBT_CONFIG.supabase.url.replace(/\/$/, ''); },
  key() { return window.HBT_CONFIG.supabase.anonKey; },
  headers(extra) {
    return Object.assign({
      'apikey': this.key(),
      'Authorization': 'Bearer ' + this.key(),
      'Content-Type': 'application/json'
    }, extra || {});
  },
  async select(query) {
    const res = await fetch(this.url() + '/rest/v1/' + query, {
      headers: this.headers(),
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Supabase ' + res.status + ': ' + await res.text());
    return res.json();
  },
  async insert(table, row) {
    const res = await fetch(this.url() + '/rest/v1/' + table, {
      method: 'POST',
      headers: this.headers({ 'Prefer': 'return=representation' }),
      body: JSON.stringify(row)
    });
    if (!res.ok) throw new Error('Supabase ' + res.status + ': ' + await res.text());
    return res.json();
  },
  async update(table, match, changes) {
    const res = await fetch(this.url() + '/rest/v1/' + table + '?' + match, {
      method: 'PATCH',
      headers: this.headers({ 'Prefer': 'return=representation' }),
      body: JSON.stringify(changes)
    });
    if (!res.ok) throw new Error('Supabase ' + res.status + ': ' + await res.text());
    return res.json();
  }
};

const OrderService = {
  async create(orderData) {
    const id = orderData.id || generateOrderId();
    const order = {
      id: id,
      customer_name: orderData.customer_name,
      phone: orderData.phone,
      address: orderData.address || '',
      items: orderData.items || [],
      total: orderData.total || 0,
      status: 'received',
      notes: orderData.notes || '',
      history: [{ status: 'received', at: new Date().toISOString(), note: '' }]
    };

    if (Supa.ready()) {
      try {
        const rows = await Supa.insert('orders', order);
        return rows[0] || order;
      } catch (e) {
        console.error('[Supabase] insert failed, fallback local:', e);
      }
    }
    // Fallback local
    order.created_at = new Date().toISOString();
    Orders.set(order);
    return order;
  },

  async getById(id) {
    if (!id) return null;
    if (Supa.ready()) {
      try {
        const rows = await Supa.select('orders?id=eq.' + encodeURIComponent(id) + '&select=*');
        if (rows && rows[0]) return rows[0];
      } catch (e) { console.error('[Supabase] getById:', e); }
    }
    return Orders.get(id);
  },

  async list() {
    if (Supa.ready()) {
      try {
        const rows = await Supa.select('orders?select=*&order=created_at.desc');
        return rows || [];
      } catch (e) { console.error('[Supabase] list:', e); }
    }
    return Orders.list();
  },

  async updateStatus(id, newStatus, note) {
    const cur = await this.getById(id);
    if (!cur) return null;
    const history = Array.isArray(cur.history) ? cur.history.slice() : [];
    history.push({ status: newStatus, at: new Date().toISOString(), note: note || '' });

    const changes = { status: newStatus, history: history, updated_at: new Date().toISOString() };

    if (Supa.ready()) {
      try {
        const rows = await Supa.update('orders', 'id=eq.' + encodeURIComponent(id), changes);
        return rows[0] || null;
      } catch (e) { console.error('[Supabase] updateStatus:', e); }
    }
    return Orders.updateStatus(id, newStatus, note);
  },

  async updateNotes(id, notes) {
    const changes = { notes: notes, updated_at: new Date().toISOString() };
    if (Supa.ready()) {
      try {
        const rows = await Supa.update('orders', 'id=eq.' + encodeURIComponent(id), changes);
        return rows[0] || null;
      } catch (e) { console.error('[Supabase] updateNotes:', e); }
    }
    const cur = Orders.get(id);
    if (cur) { cur.notes = notes; Orders.set(cur); return cur; }
    return null;
  }
};
window.OrderService = OrderService;

/* ============================================================
   PRODUCTSERVICE — Catalogue dynamique Supabase
   ----------------------------------------------------------
   Service de gestion des produits ajoutés depuis l'admin.
   Tombe en arrière sur localStorage si Supabase non configuré.
   Le site (boutique, galerie) lit ces produits EN PLUS du
   manifeste hardcodé pour rétro-compatibilité.
   ============================================================ */
const PRODUCTS_KEY = 'home-by-tika-products';

const LocalProducts = {
  read() {
    try { return JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || {}; }
    catch (e) { return {}; }
  },
  write(map) { localStorage.setItem(PRODUCTS_KEY, JSON.stringify(map)); },
  get(id) { return this.read()[id] || null; },
  list() {
    return Object.values(this.read())
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  },
  set(p) {
    const m = this.read();
    m[p.id] = p;
    this.write(m);
  },
  remove(id) {
    const m = this.read();
    delete m[id];
    this.write(m);
  }
};

/* Génère un slug à partir d'un nom : "Porte Lagune Premium" → "porte-lagune-premium" */
function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // retire accents
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}
window.HBT_slugify = slugify;

/* Génère les métadonnées d'un nouveau produit à partir de {name, category} */
function generateProductMeta(name, category) {
  const slug = slugify(name) || ('produit-' + Date.now());
  const folder = (window.HBT_FOLDER_MAP && window.HBT_FOLDER_MAP[category])
                  || ('home-by-tika/produits/' + category);
  const publicId = folder + '/' + slug;
  const baseTag = (window.HBT_TAG_MAP && window.HBT_TAG_MAP[category]) || ('hbt_' + category);
  const tags = [baseTag, 'hbt_product', 'hbt_' + slug];
  return { slug, folder, publicId, tags };
}
window.HBT_generateProductMeta = generateProductMeta;

const ProductService = {
  /* Liste tous les produits publiés (catégorie optionnelle) */
  async list(category) {
    if (Supa.ready()) {
      try {
        let q = 'products?select=*&published=eq.true&order=created_at.desc';
        if (category) q += '&category=eq.' + encodeURIComponent(category);
        const rows = await Supa.select(q);
        return rows || [];
      } catch (e) { console.warn('[ProductService] list:', e.message); }
    }
    // Fallback localStorage
    return LocalProducts.list().filter(p => !category || p.category === category);
  },

  /* Récupère un produit par ID (slug) */
  async getById(id) {
    if (!id) return null;
    if (Supa.ready()) {
      try {
        const rows = await Supa.select('products?id=eq.' + encodeURIComponent(id) + '&select=*');
        if (rows && rows[0]) return rows[0];
      } catch (e) { console.warn('[ProductService] getById:', e.message); }
    }
    return LocalProducts.get(id);
  },

  /* Crée un produit. data = { name, category, price, wood, description, label, monogram, cloudinary_id, cloudinary_url, tags } */
  async create(data) {
    const meta = generateProductMeta(data.name, data.category);
    const product = {
      id: data.id || meta.slug,
      name: data.name,
      category: data.category,
      price: (data.price != null) ? Number(data.price) : null,
      wood: data.wood || '',
      description: data.description || '',
      label: data.label || '',
      monogram: data.monogram || (data.name ? data.name.charAt(0).toUpperCase() : '·'),
      cloudinary_id:  data.cloudinary_id  || meta.publicId,
      cloudinary_url: data.cloudinary_url || '',
      tags: data.tags || meta.tags,
      published: data.published !== false
    };

    if (Supa.ready()) {
      try {
        const rows = await Supa.insert('products', product);
        return rows[0] || product;
      } catch (e) {
        console.error('[ProductService] insert failed, fallback local:', e);
      }
    }
    product.created_at = new Date().toISOString();
    LocalProducts.set(product);
    return product;
  },

  /* Met à jour un produit */
  async update(id, changes) {
    const patch = Object.assign({}, changes, { updated_at: new Date().toISOString() });
    if (Supa.ready()) {
      try {
        const rows = await Supa.update('products', 'id=eq.' + encodeURIComponent(id), patch);
        return rows[0] || null;
      } catch (e) { console.error('[ProductService] update:', e); }
    }
    const cur = LocalProducts.get(id);
    if (cur) {
      Object.assign(cur, patch);
      LocalProducts.set(cur);
      return cur;
    }
    return null;
  },

  /* Supprime un produit */
  async delete(id) {
    if (Supa.ready()) {
      try {
        const res = await fetch(Supa.url() + '/rest/v1/products?id=eq.' + encodeURIComponent(id), {
          method: 'DELETE',
          headers: Supa.headers()
        });
        if (!res.ok) throw new Error('Supabase delete ' + res.status);
        return true;
      } catch (e) { console.error('[ProductService] delete:', e); }
    }
    LocalProducts.remove(id);
    return true;
  }
};
window.ProductService = ProductService;

/* ============================================================
   COMMANDES — Statuts, store et helpers
   ============================================================ */
const ORDER_STATUSES = [
  { key: 'received',   label: 'Commande reçue',        roman: 'I',   color: '#8a7860' },
  { key: 'confirmed',  label: 'Commande confirmée',    roman: 'II',  color: '#8a5a2a' },
  { key: 'preparing',  label: 'Préparation en cours',  roman: 'III', color: '#b48249' },
  { key: 'ready',      label: 'Produit prêt',          roman: 'IV',  color: '#b48249' },
  { key: 'shipping',   label: 'En cours de livraison', roman: 'V',   color: '#d4a766' },
  { key: 'delivered',  label: 'Livré',                 roman: 'VI',  color: '#2e8a56' },
  { key: 'cancelled',  label: 'Annulé',                roman: '✕',   color: '#c45b5b' }
];

function orderStatusInfo(key) {
  return ORDER_STATUSES.find(s => s.key === key) || ORDER_STATUSES[0];
}

const Orders = {
  read() {
    try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || {}; }
    catch (e) { return {}; }
  },
  write(map) { localStorage.setItem(ORDERS_KEY, JSON.stringify(map)); },
  get(id) { return this.read()[id] || null; },
  list() {
    const map = this.read();
    return Object.values(map).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  },
  set(order) {
    const map = this.read();
    map[order.id] = order;
    this.write(map);
  },
  remove(id) {
    const map = this.read();
    delete map[id];
    this.write(map);
  },
  updateStatus(id, newStatus, note) {
    const map = this.read();
    const o = map[id];
    if (!o) return null;
    o.status = newStatus;
    o.history = o.history || [];
    o.history.push({
      status: newStatus,
      at: Date.now(),
      note: note || ''
    });
    o.updatedAt = Date.now();
    this.write(map);
    return o;
  },
  count() { return Object.keys(this.read()).length; }
};

/* Génère un identifiant de commande lisible : HBT-AAMM-XXXX */
function generateOrderId() {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return 'HBT-' + yy + mm + '-' + rand;
}

/* Formate une date pour affichage */
function fmtDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}


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
  // > vidéo locale > photo locale > image par défaut
  // > NEW: URL conventionnelle via HBT_mediaUrl (manifeste) → placeholder SVG si 404
  const cldVideo = CloudCache.productVideos[p.id] || null;
  const localVideo = getVideoUrl(p.id);
  const videoSrc = cldVideo || localVideo || null;

  const cldImg = CloudCache.products[p.id] || null;
  const localImg = Photos.get(p.id);
  // Construction URL Cloudinary conventionnelle via le manifeste (toujours présente)
  const hbtUrl = (typeof window.HBT_mediaUrl === 'function')
                  ? window.HBT_mediaUrl(p.type, p.id, { width: 1000, crop: 'fill', gravity: 'auto' })
                  : null;
  const imgSrc = cldImg || localImg || p.image || hbtUrl || null;

  const hasMedia = !!(videoSrc || imgSrc);
  // onerror : bascule vers placeholder SVG élégant (via media-manifest.js)
  const safeName = (name || '').replace(/'/g, "\\'");
  const onErrAttr = (typeof window.HBT_handleImageError === 'function')
                      ? `HBT_handleImageError(this, '${safeName}', {monogram:'${monogram || ''}'})`
                      : `HBT_imageError(this, '${monogram || ''}')`;

  let mediaHtml;
  if (videoSrc) {
    mediaHtml = `<video class="product-video" src="${videoSrc}" autoplay muted loop playsinline preload="metadata"
                        onerror="HBT_imageError(this, '${monogram || ''}')"></video>`;
  } else if (imgSrc) {
    mediaHtml = `<img src="${imgSrc}" alt="${name}" class="product-photo" loading="lazy" decoding="async"
                      onerror="${onErrAttr}">`;
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

/* ---------- Menu hamburger mobile (injection auto sur toutes les pages) ---------- */
function injectMobileNav() {
  const nav = document.querySelector('.nav');
  if (!nav || nav.dataset.mobileInjected) return;
  nav.dataset.mobileInjected = 'true';

  const navActions = nav.querySelector('.nav-actions');
  if (!navActions) return;

  // Récupère les liens depuis la nav existante
  const navLinks = nav.querySelector('.nav-links');
  const linksHtml = navLinks ? navLinks.innerHTML : '';

  // Bouton hamburger
  const toggle = document.createElement('button');
  toggle.className = 'nav-toggle';
  toggle.setAttribute('aria-label', 'Ouvrir le menu');
  toggle.innerHTML = '<span></span>';
  navActions.appendChild(toggle);

  // Backdrop + drawer
  const backdrop = document.createElement('div');
  backdrop.className = 'mobile-nav-backdrop';
  document.body.appendChild(backdrop);

  const drawer = document.createElement('div');
  drawer.className = 'mobile-nav';
  const whatsapp = (window.HBT_CONFIG && window.HBT_CONFIG.contact && window.HBT_CONFIG.contact.whatsapp) || '2250748738671';
  drawer.innerHTML =
    '<button type="button" class="close" aria-label="Fermer">×</button>' +
    '<nav>' + linksHtml.replace(/<li>(.*?)<\/li>/g, '$1') + '</nav>' +
    '<div class="mobile-cta">' +
    '  <a href="https://wa.me/' + whatsapp + '" target="_blank" rel="noopener">Nous contacter</a>' +
    '</div>';
  document.body.appendChild(drawer);

  function openMenu()  { drawer.classList.add('open'); backdrop.classList.add('open'); toggle.classList.add('open'); document.body.classList.add('menu-open'); }
  function closeMenu() { drawer.classList.remove('open'); backdrop.classList.remove('open'); toggle.classList.remove('open'); document.body.classList.remove('menu-open'); }

  toggle.addEventListener('click', () => {
    drawer.classList.contains('open') ? closeMenu() : openMenu();
  });
  backdrop.addEventListener('click', closeMenu);
  drawer.querySelector('.close').addEventListener('click', closeMenu);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
}

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
  injectMobileNav();
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

/* =========================================================
   HOME BY TIKA — Mobile menu (hamburger drawer) — additif v2
   ----------------------------------------------------------
   Injection automatique d'un menu hamburger + drawer sur
   toutes les pages. Aucun HTML à modifier — ce code se branche
   sur le <header class="site-header"> existant.
   ========================================================= */
(function () {
  function init() {
    const header = document.querySelector('.site-header .nav');
    if (!header) return;
    if (header.querySelector('.hbt-burger')) return;  // déjà injecté

    // 1) Clone le menu existant pour le drawer
    const navLinks = header.querySelector('.nav-links');
    if (!navLinks) return;
    const links = Array.from(navLinks.querySelectorAll('a')).map(a => ({
      href: a.getAttribute('href'),
      text: a.textContent.trim(),
      active: a.classList.contains('active'),
      i18n: a.getAttribute('data-i18n') || ''
    }));

    // 2) Crée le bouton hamburger
    const burger = document.createElement('button');
    burger.type = 'button';
    burger.className = 'hbt-burger';
    burger.setAttribute('aria-label', 'Menu');
    burger.innerHTML = '<span></span><span></span><span></span>';

    // 3) Crée le drawer + overlay
    const drawer = document.createElement('aside');
    drawer.className = 'hbt-drawer';
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML = '<ul>' +
      links.map(l => '<li><a href="' + l.href + '"' +
        (l.active ? ' class="active"' : '') +
        (l.i18n ? ' data-i18n="' + l.i18n + '"' : '') +
        '>' + l.text + '</a></li>').join('') +
      '</ul>';

    const overlay = document.createElement('div');
    overlay.className = 'hbt-drawer-overlay';

    // 4) Wire open/close
    function open() {
      burger.classList.add('open');
      drawer.classList.add('open');
      overlay.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      burger.classList.remove('open');
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    burger.addEventListener('click', (e) => {
      e.preventDefault();
      if (drawer.classList.contains('open')) close(); else open();
    });
    overlay.addEventListener('click', close);
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    // 5) Insère le burger avant les nav-actions (panier), drawer + overlay en body
    const actions = header.querySelector('.nav-actions');
    if (actions) {
      actions.parentNode.insertBefore(burger, actions);
    } else {
      header.appendChild(burger);
    }
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* =========================================================
   HOME BY TIKA — PRODUCTION HARDENING v2 (additif, ne casse rien)
   ----------------------------------------------------------
   Layer de robustesse + premium polish + future-proofing.
   Tout est exposé sur window.HBT pour une API claire et stable.
   ========================================================= */
(function () {
  'use strict';

  /* ===== Namespace stable ===== */
  const HBT = window.HBT = window.HBT || {};

  /* ===== 1) Garde-fou localStorage quota ===========================
     Le store Photos (base64 images) peut dépasser le quota navigateur
     (~5-10 MB selon le navigateur). Ce wrapper attrape l'erreur,
     prévient l'admin, et offre un nettoyage. ====================== */
  HBT.storage = {
    available() {
      try {
        const k = '_hbt_probe_';
        localStorage.setItem(k, '1');
        localStorage.removeItem(k);
        return true;
      } catch (e) { return false; }
    },
    /* Estime l'usage total localStorage en Ko */
    usageKB() {
      let total = 0;
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          total += (localStorage.getItem(k) || '').length;
          total += k.length;
        }
      } catch (e) {}
      return Math.round(total * 2 / 1024);  // UTF-16 ≈ 2 bytes/char
    },
    /* setItem sécurisé : capture quota, notifie l'admin */
    safeSet(key, value) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (e) {
        const isQuota = e && (e.code === 22 || e.name === 'QuotaExceededError' || /quota/i.test(e.message));
        if (isQuota && window.HBT_toast) {
          window.HBT_toast('⚠ Stockage navigateur plein (' + HBT.storage.usageKB() + ' Ko). Utilisez Cloudinary pour les nouvelles images.', '#c89968');
        }
        console.warn('[HBT.storage] safeSet échec :', key, e.message);
        return false;
      }
    }
  };

  /* ===== 2) Toast premium global ====================================
     Notification visible sur toutes les pages, palette HBT, auto-dismiss.
     ============================================================== */
  HBT.toast = window.HBT_toast = function (html, color) {
    let t = document.getElementById('hbt-global-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'hbt-global-toast';
      t.setAttribute('role', 'status');
      t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(80px);' +
        'z-index:99999;background:#252025;color:#f5ede0;padding:0.9rem 1.6rem;border-radius:4px;' +
        'box-shadow:0 14px 36px rgba(0,0,0,0.4);font-size:0.92rem;max-width:min(420px,90vw);' +
        'border-left:3px solid #c89968;opacity:0;transition:transform 0.35s cubic-bezier(0.4,0,0.2,1),opacity 0.25s ease;' +
        'font-family:Inter,sans-serif;line-height:1.4;pointer-events:none;';
      document.body.appendChild(t);
    }
    t.style.borderLeftColor = color || '#c89968';
    t.innerHTML = html;
    t.style.transform = 'translateX(-50%) translateY(0)';
    t.style.opacity = '1';
    clearTimeout(t._h);
    t._h = setTimeout(() => {
      t.style.transform = 'translateX(-50%) translateY(80px)';
      t.style.opacity = '0';
    }, 3600);
  };

  /* ===== 3) Analytics hook (stub) ===================================
     window.HBT.track('event_name', { extra: 'data' })
     Plug ici Google Analytics, Plausible, Matomo… plus tard sans
     toucher au code métier. Pour l'instant : log discret + queue.
     ============================================================== */
  HBT.analyticsQueue = HBT.analyticsQueue || [];
  HBT.track = function (event, props) {
    const payload = { event: String(event || 'unknown'), props: props || {}, ts: Date.now(), page: location.pathname };
    HBT.analyticsQueue.push(payload);
    if (window.HBT_DEBUG_ANALYTICS) console.log('[HBT.track]', payload);
    // Hook futur : window.gtag && gtag('event', payload.event, payload.props);
  };
  // Track auto : pageview
  HBT.track('pageview', { ref: document.referrer || '' });

  /* ===== 4) Notifications admin (Supabase row count) ===============
     Helper qui interroge Supabase pour compter les nouvelles commandes
     depuis la dernière visite admin (badge). Stockage de la marque
     timestamp en localStorage. Appelable depuis admin-extras.
     ============================================================== */
  HBT.adminNotifs = {
    LAST_SEEN_KEY: 'hbt-admin-last-seen',
    markSeen() {
      try { localStorage.setItem(this.LAST_SEEN_KEY, new Date().toISOString()); } catch (e) {}
    },
    getLastSeen() {
      return localStorage.getItem(this.LAST_SEEN_KEY) || new Date(Date.now() - 86400000 * 7).toISOString();
    },
    async newOrdersCount() {
      if (!window.HBT_CONFIG || !window.HBT_CONFIG.isSupabaseReady || !window.HBT_CONFIG.isSupabaseReady()) {
        return 0;
      }
      try {
        const since = encodeURIComponent(this.getLastSeen());
        const rows = await Supa.select('orders?select=id&created_at=gt.' + since);
        return (rows || []).length;
      } catch (e) { return 0; }
    }
  };

  /* ===== 5) Customers stub (future Supabase customers table) =======
     Préparation pour une table 'customers' (RGPD compliant : opt-in only).
     Pour l'instant, en localStorage. Migrera vers Supabase plus tard. ====== */
  HBT.customers = {
    KEY: 'hbt-customers',
    read() {
      try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; } catch (e) { return {}; }
    },
    upsert(phone, data) {
      if (!phone) return null;
      const map = this.read();
      const existing = map[phone] || {};
      map[phone] = Object.assign({}, existing, data || {}, {
        phone: phone,
        updated_at: new Date().toISOString(),
        order_count: (existing.order_count || 0) + (data && data.newOrder ? 1 : 0)
      });
      window.HBT.storage.safeSet(this.KEY, JSON.stringify(map));
      return map[phone];
    },
    list() {
      return Object.values(this.read())
        .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
    }
  };

  /* ===== 6) Image fade-in premium ===================================
     Toutes les images du site, à leur chargement, font un fade-in fluide.
     Évite le "flash" disgracieux du replacement instantané. =========== */
  function setupImageFadeIn() {
    document.querySelectorAll('img').forEach(img => {
      if (img.dataset.hbtFade === '1') return;
      img.dataset.hbtFade = '1';
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('hbt-img-loaded');
      } else {
        img.style.opacity = '0';
        img.addEventListener('load', function onLoad() {
          this.classList.add('hbt-img-loaded');
          this.style.opacity = '';
          this.removeEventListener('load', onLoad);
        }, { once: true });
      }
    });
  }

  /* ===== 7) Smooth-reveal (Intersection Observer) ==================
     Sections qui apparaissent en fondu doux lors du scroll. Premium feel,
     léger (utilise l'API native, pas de lib). ====================== */
  function setupSmoothReveal() {
    if (!('IntersectionObserver' in window)) return;
    const targets = document.querySelectorAll('.section, .pillar, .essence-card, .service-card, .product-card, .gallery-item');
    if (!targets.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('hbt-revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(t => {
      t.classList.add('hbt-reveal-init');
      io.observe(t);
    });
  }

  /* ===== 8) Error boundary global ===================================
     Capture les erreurs JS non gérées pour les afficher discrètement
     en console + envoyer à analytics (futur). Pas de popup intrusive.
     ============================================================== */
  window.addEventListener('error', function (e) {
    HBT.track('js_error', {
      message: String(e.message || '').slice(0, 200),
      file: (e.filename || '').split('/').pop(),
      line: e.lineno || 0
    });
  });
  window.addEventListener('unhandledrejection', function (e) {
    HBT.track('promise_rejection', {
      reason: String((e.reason && e.reason.message) || e.reason || '').slice(0, 200)
    });
  });

  /* ===== 9) Re-scan images après contenus dynamiques ===============
     Quand boutique/galerie chargent leurs cartes, on re-applique le fade-in.
     ============================================================== */
  HBT.refreshImages = setupImageFadeIn;
  HBT.refreshReveals = setupSmoothReveal;

  // Observer le DOM pour rescan auto des nouvelles images
  if ('MutationObserver' in window) {
    const mo = new MutationObserver((muts) => {
      let hasNewImage = false;
      muts.forEach(m => {
        m.addedNodes.forEach(n => {
          if (n.nodeType === 1 && (n.tagName === 'IMG' || (n.querySelector && n.querySelector('img')))) {
            hasNewImage = true;
          }
        });
      });
      if (hasNewImage) setTimeout(setupImageFadeIn, 30);
    });
    mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
  }

  /* ===== BOOT ===== */
  function init() {
    setupImageFadeIn();
    setupSmoothReveal();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ===== Patch sécurisé sur Photos.set / Prices.set =====
     Wrappe les writes localStorage pour éviter les crashes silencieux
     en cas de quota dépassé. ========================================= */
  if (window.Photos && typeof window.Photos.set === 'function' && !window.Photos._hbtSafe) {
    const origSet = window.Photos.set.bind(window.Photos);
    window.Photos.set = function (id, dataUrl) {
      // Détecte les images > 1.5 MB (probablement non compressées)
      if (dataUrl && dataUrl.length > 1500000) {
        console.warn('[HBT] Image volumineuse stockée localement (' + Math.round(dataUrl.length / 1024) + ' Ko). Préférez Cloudinary.');
      }
      try {
        return origSet(id, dataUrl);
      } catch (e) {
        HBT.toast('⚠ Stockage local saturé. Utilisez Cloudinary (upload depuis admin).', '#c89968');
        console.error('[HBT] Photos.set quota :', e.message);
        return null;
      }
    };
    window.Photos._hbtSafe = true;
  }

  console.log('[HBT] Production hardening v2 chargé — storage: ' + HBT.storage.usageKB() + ' Ko utilisé');

})();
