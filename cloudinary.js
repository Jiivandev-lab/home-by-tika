/* =========================================================
   HOME BY TIKA — Module Cloudinary
   ----------------------------------------------------------
   Upload direct depuis le navigateur (preset non-signé)
   + listing public des médias par tag
   + construction d'URLs avec transformations
   ========================================================= */

const Cloudinary = (function(){
  // Charge la config exposée par cloudinary-config.js
  let cfg = window.CLOUDINARY_CONFIG || {};

  function isConfigured() {
    return !!(cfg.cloudName && cfg.uploadPreset);
  }

  function getCloud() { return cfg.cloudName || ''; }
  function getRoot() { return cfg.rootFolder || 'home-by-tika'; }
  function getTag(key) { return (cfg.tags && cfg.tags[key]) || ''; }

  // -------------- UPLOAD --------------
  // file: File ou Blob
  // opts: { folder, tags:[], publicId, resourceType:'image'|'video'|'auto' }
  async function upload(file, opts) {
    if (!isConfigured()) throw new Error('Cloudinary non configuré');
    opts = opts || {};
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', cfg.uploadPreset);
    if (opts.folder)   fd.append('folder', opts.folder);
    if (opts.tags && opts.tags.length) fd.append('tags', opts.tags.join(','));
    if (opts.publicId) fd.append('public_id', opts.publicId);

    const type = opts.resourceType || (file.type && file.type.startsWith('video/') ? 'video' : 'image');
    const url = 'https://api.cloudinary.com/v1_1/' + cfg.cloudName + '/' + type + '/upload';

    const res = await fetch(url, { method: 'POST', body: fd });
    if (!res.ok) {
      const txt = await res.text().catch(()=>'');
      throw new Error('Upload échoué (' + res.status + ') ' + txt);
    }
    return res.json();
  }

  // -------------- LISTING --------------
  // Liste les médias publics ayant un tag donné
  // Nécessite "Allow resource list" dans Cloudinary Security
  async function listByTag(tag, resourceType) {
    if (!cfg.cloudName || !tag) return [];
    const type = resourceType || 'image';
    const url = 'https://res.cloudinary.com/' + cfg.cloudName + '/' + type + '/list/' + tag + '.json';
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) return [];
      const data = await res.json();
      const resources = data.resources || [];
      // Tri du plus récent au plus ancien
      resources.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      return resources;
    } catch (e) { return []; }
  }

  // -------------- URLS --------------
  // Construit une URL Cloudinary avec transformations
  // publicId: 'home-by-tika/products/por-01' (sans extension)
  // opts: { width, height, crop, gravity, quality, format, dpr, blur, resourceType }
  function url(publicId, opts) {
    if (!cfg.cloudName || !publicId) return '';
    opts = opts || {};
    const type = opts.resourceType || 'image';
    const t = [];
    if (opts.width)   t.push('w_' + opts.width);
    if (opts.height)  t.push('h_' + opts.height);
    if (opts.crop)    t.push('c_' + opts.crop);
    if (opts.gravity) t.push('g_' + opts.gravity);
    if (opts.blur)    t.push('e_blur:' + opts.blur);
    if (opts.dpr)     t.push('dpr_' + opts.dpr);
    t.push('q_' + (opts.quality || 'auto'));
    t.push('f_' + (opts.format || 'auto'));
    const tr = t.join(',');
    return 'https://res.cloudinary.com/' + cfg.cloudName + '/' + type + '/upload/' + tr + '/' + publicId;
  }

  // URL d'un produit (utilise un public_id prévisible : home-by-tika/products/{id})
  function productImageUrl(productId, opts) {
    opts = opts || {};
    if (!opts.crop) opts.crop = 'fill';
    if (!opts.gravity) opts.gravity = 'auto';
    if (!opts.width) opts.width = 1000;
    return url(getRoot() + '/products/' + productId, opts);
  }

  function productVideoUrl(productId, opts) {
    opts = Object.assign({ resourceType: 'video', width: 900 }, opts || {});
    return url(getRoot() + '/products/' + productId + '-video', opts);
  }

  // URL d'une image du site (atelier, hero)
  function siteImageUrl(name, opts) {
    opts = opts || {};
    if (!opts.crop) opts.crop = 'fill';
    if (!opts.gravity) opts.gravity = 'auto';
    return url(getRoot() + '/site/' + name, opts);
  }

  return {
    isConfigured,
    getCloud,
    getRoot,
    getTag,
    upload,
    listByTag,
    url,
    productImageUrl,
    productVideoUrl,
    siteImageUrl,
    // Permet à un script externe de remettre à jour la config (rare)
    setConfig: function(newCfg) { cfg = Object.assign(cfg, newCfg || {}); }
  };
})();
