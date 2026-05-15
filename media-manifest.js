/* =========================================================
   HOME BY TIKA — Manifeste des médias (v2 — auto-Shopify-like)
   ----------------------------------------------------------
   Source de vérité des photos & vidéos. Pré-rempli avec les 25
   produits historiques. Le site lit aussi Cloudinary par tag
   (via Netlify Function) pour les médias ajoutés depuis l'admin
   sans avoir à modifier ce fichier.

   ARCHITECTURE :
   --------------
     1) HBT_MEDIA          → tableaux pré-remplis (fallback fiable)
     2) HBT_mediaUrl()     → construit l'URL Cloudinary d'un média
     3) HBT_mediaList()    → liste synchrone par catégorie (depuis HBT_MEDIA)
     4) HBT_mediaListAsync() → liste async qui FUSIONNE manifeste +
                              Cloudinary par tag (auto-découverte)
     5) HBT_getPlaceholderUrl() → SVG data URL élégant si image 404
     6) HBT_handleImageError() → bascule auto vers placeholder

   RÉTRO-COMPATIBILITÉ :
   ---------------------
   • Les anciens produits hardcodés du CATALOG (script.js) restent affichés
   • Les anciens public_id Cloudinary continuent de marcher
   • Les anciennes images déjà visibles ne sont pas touchées
   ========================================================= */

window.HBT_MEDIA = {

  /* ============================================================
     GALERIE — médias non-produits (atelier, collections, vidéos)
     ============================================================ */
  atelier: [
    // Ajoutez vos photos d'atelier : { id: 'atelier-vue-1', name: 'Vue d\'atelier' }
  ],
  collections: [
    // Ajoutez vos collections : { id: 'collection-ete-2026', name: 'Collection Été' }
  ],
  mobilier: [
    // Galerie mobilier (différent de la boutique : ici ce sont des vues d'ensemble)
  ],
  videos: [
    // Vidéos de l'atelier / fabrication : { id: 'fabrication-porte', name: 'Fabrication d\'une porte', video: true }
  ],

  /* ============================================================
     BOUTIQUE — produits par catégorie
     Pré-rempli avec les 25 produits historiques. Les images sont
     attendues dans Cloudinary à : home-by-tika/produits/<cat>/<id>.jpg
     (Placeholder élégant si l'image n'existe pas encore)
     ============================================================ */
  salons: [
    { id: 'sal-01', name: 'Salon Baoulé', price: '2 450 000 FCFA', wood: 'Iroko',
      desc: 'Salon d\'angle 5 places en Iroko massif, structure sculptée à la main et coussins en coton naturel.', monogram: 'B', label: 'Pièce d\'exception' },
    { id: 'sal-02', name: 'Salon Akan', price: '1 380 000 FCFA', wood: 'Framiré',
      desc: 'Canapé 3 places en Framiré, lignes modernes, finition huilée claire.', monogram: 'A' }
  ],
  tables: [
    { id: 'tab-01', name: 'Table Comoé', price: '690 000 FCFA', wood: 'Iroko',
      desc: 'Table à manger 8 places en Iroko massif, plateau épais d\'un seul tenant, pieds sculptés.', monogram: 'C', label: 'Nouveau' },
    { id: 'tab-02', name: 'Table basse Sassandra', price: '285 000 FCFA', wood: 'Framiré',
      desc: 'Table basse en Framiré, lignes épurées, parfaite pour un salon contemporain.', monogram: 'S' }
  ],
  chaises: [
    { id: 'chs-01', name: 'Chaise Yamoussoukro', price: '95 000 FCFA', wood: 'Framiré',
      desc: 'Chaise en Framiré massif, assise sculptée pour un confort durable.', monogram: 'Y' },
    { id: 'chs-02', name: 'Banc Korhogo', price: '220 000 FCFA', wood: 'Iroko',
      desc: 'Banc traditionnel en Iroko, finition naturelle, idéal en entrée ou bout de lit.', monogram: 'K' }
  ],
  lits: [
    { id: 'lit-01', name: 'Lit Bandama', price: '980 000 FCFA', wood: 'Iroko',
      desc: 'Lit double 180×200 en Iroko sculpté, tête de lit aux motifs traditionnels.', monogram: 'B' }
  ],
  armoires: [
    { id: 'arm-01', name: 'Armoire Cocody', price: '1 280 000 FCFA', wood: 'Iroko',
      desc: 'Armoire 4 portes en Iroko massif, ferrures laiton, intérieur compartimenté.', monogram: 'C' },
    { id: 'arm-02', name: 'Armoire Zaranou', price: '890 000 FCFA', wood: 'Framiré',
      desc: 'Armoire 3 portes en Framiré, design moderne, miroir en façade.', monogram: 'Z' }
  ],
  cuisines: [
    { id: 'cui-01', name: 'Cuisine Akwaba', price: '3 450 000 FCFA', wood: 'Iroko',
      desc: 'Cuisine équipée complète en Iroko massif, plan de travail et placards façonnés à la commande.', monogram: 'A', label: 'Sur-mesure' }
  ],
  meublestv: [
    { id: 'mtv-01', name: 'Meuble TV Aboisso', price: '320 000 FCFA', wood: 'Framiré',
      desc: 'Meuble TV en Framiré, rangements ouverts et tiroirs, finition huilée.', monogram: 'A' }
  ],
  bureaux: [
    { id: 'bur-01', name: 'Bureau Plateau', price: '850 000 FCFA', wood: 'Iroko',
      desc: 'Bureau directorial en Iroko massif, large plateau, tiroirs à fermeture douce.', monogram: 'P' }
  ],
  exterieur: [
    { id: 'ext-01', name: 'Salon de jardin Assinie', price: '1 850 000 FCFA', wood: 'Teck',
      desc: 'Salon de jardin 4 places en Teck massif, résiste à la pluie et au soleil sans entretien lourd.', monogram: 'A', label: 'Teck' },
    { id: 'ext-02', name: 'Table de terrasse Grand-Bassam', price: '780 000 FCFA', wood: 'Teck',
      desc: 'Table de terrasse 6 places en Teck, finition huilée, idéale pour bord de mer.', monogram: 'G', label: 'Teck' },
    { id: 'ext-03', name: 'Chaise longue Sainte-Anne', price: '245 000 FCFA', wood: 'Teck',
      desc: 'Chaise longue inclinable en Teck massif, parfaite au bord de la piscine.', monogram: 'S' }
  ],
  serrures: [
    { id: 'ser-01', name: 'Serrure Atlas', price: '185 000 FCFA', wood: 'Laiton massif',
      desc: 'Serrure 5 points en laiton massif, finition vieux bronze, compatible portes Iroko.', monogram: 'A', label: 'Sécurité' },
    { id: 'ser-02', name: 'Poignée Comoé', price: '48 000 FCFA', wood: 'Laiton',
      desc: 'Poignée de porte en laiton patiné, design contemporain, prise en main confortable.', monogram: 'C' },
    { id: 'ser-03', name: 'Crémone Royale', price: '95 000 FCFA', wood: 'Laiton',
      desc: 'Crémone décorative en laiton ouvragé pour portes-fenêtres et grandes ouvertures.', monogram: 'R' },
    { id: 'ser-04', name: 'Heurtoir Akwaba', price: '62 000 FCFA', wood: 'Bronze',
      desc: 'Heurtoir en bronze coulé, motifs traditionnels ivoiriens taillés main.', monogram: 'A', label: 'Sculpté' }
  ],
  portes: [
    { id: 'por-01', name: 'Porte Akwaba', price: '980 000 FCFA', wood: 'Iroko',
      desc: 'Porte d\'entrée en Iroko sculpté, structure renforcée et serrurerie haute sécurité.', monogram: 'A', label: 'Sécurisée' },
    { id: 'por-02', name: 'Porte Lagune', price: '320 000 FCFA', wood: 'Framiré',
      desc: 'Porte intérieure en Framiré, lignes modernes, finition huilée naturelle.', monogram: 'L', label: 'Moderne' },
    { id: 'por-03', name: 'Porte Tamberma', price: '1 450 000 FCFA', wood: 'Iroko',
      desc: 'Porte sculptée en Iroko, motifs traditionnels ivoiriens taillés à la main.', monogram: 'T', label: 'Sculptée' },
    { id: 'por-04', name: 'Porte Forteresse', price: '1 180 000 FCFA', wood: 'Iroko',
      desc: 'Porte d\'entrée sécurisée en Iroko avec renforts métalliques et serrure 5 points.', monogram: 'F', label: 'Sécurisée' }
  ],

  /* ============================================================
     SITE — hero, atelier story image
     ============================================================ */
  site: {
    'hero-bg':  null,   // ex. 'hero-bg-2026'
    'atelier':  null    // ex. 'atelier-photo-1'
  }
};

/* =========================================================
   HBT_CATEGORIES — Source de vérité unique des catégories
   ----------------------------------------------------------
   Liste utilisée par l'admin (formulaire), la boutique (filtres),
   la galerie (onglets), et le moteur Cloudinary (dossiers + tags).

   AJOUTER UNE CATÉGORIE = AJOUTER UNE LIGNE ICI.
   Le système calcule auto :
     • slug folder       (avec tirets)         → pots-de-fleurs
     • slug tag          (avec underscores)    → pots_de_fleurs
     • dossier Cloudinary                      → home-by-tika/produits/pots-de-fleurs
     • tags Cloudinary  → hbt_product, hbt_pots_de_fleurs, hbt_category_pots_de_fleurs

   Champ `type` :
     • 'produit' → boutique + dossier home-by-tika/produits/<slug>
     • 'galerie' → galerie  + dossier home-by-tika/<slug>
     • 'site'    → image du site (hero, atelier) — non listé
   ========================================================= */
window.HBT_CATEGORIES = [
  /* ===== Produits (boutique) ===== */
  { slug: 'portes',         label: 'Portes',          type: 'produit' },
  { slug: 'salons',         label: 'Salons',          type: 'produit' },
  { slug: 'tables',         label: 'Tables',          type: 'produit' },
  { slug: 'chaises',        label: 'Chaises',         type: 'produit' },
  { slug: 'lits',           label: 'Lits',            type: 'produit' },
  { slug: 'armoires',       label: 'Armoires',        type: 'produit' },
  { slug: 'cuisines',       label: 'Cuisines',        type: 'produit' },
  { slug: 'meublestv',      label: 'Meubles TV',      type: 'produit' },
  { slug: 'bureaux',        label: 'Bureaux',         type: 'produit' },
  { slug: 'exterieur',      label: 'Extérieur',       type: 'produit' },
  { slug: 'serrures',       label: 'Serrures',        type: 'produit' },
  { slug: 'decoration',     label: 'Décoration',      type: 'produit' },
  { slug: 'pots-de-fleurs', label: 'Pots de fleurs',  type: 'produit' },
  { slug: 'luminaires',     label: 'Luminaires',      type: 'produit' },
  { slug: 'miroirs',        label: 'Miroirs',         type: 'produit' },
  { slug: 'accessoires',    label: 'Accessoires',     type: 'produit' },
  { slug: 'sur-mesure',     label: 'Sur mesure',      type: 'produit' },

  /* ===== Galeries (non-produit) ===== */
  { slug: 'mobilier',       label: 'Mobilier',        type: 'galerie' },
  { slug: 'atelier',        label: 'Atelier',         type: 'galerie' },
  { slug: 'collections',    label: 'Collections',     type: 'galerie' },
  { slug: 'videos',         label: 'Vidéos',          type: 'galerie' }
];

/* =========================================================
   MAPPING catégorie → dossier Cloudinary + tag par défaut
   ========================================================= */
(function () {
  const CLOUD = (window.HBT_CONFIG && window.HBT_CONFIG.cloudinary && window.HBT_CONFIG.cloudinary.cloudName) || 'dcj4xsp83';

  /* ===== Helpers de slugification ===== */
  /* folderSlug : minuscule + sans accents + hyphens (URL-safe)
     "Pots de fleurs" → "pots-de-fleurs"   */
  function folderSlug(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);
  }
  /* tagSlug : minuscule + sans accents + underscores (Cloudinary tag friendly)
     "Pots de fleurs" → "pots_de_fleurs"   */
  function tagSlug(text) {
    return folderSlug(text).replace(/-/g, '_');
  }
  window.HBT_folderSlug = folderSlug;
  window.HBT_tagSlug    = tagSlug;

  /* Construit la définition d'une catégorie depuis n'importe quelle entrée
     (slug, label, ou objet) — auto-découverte si pas dans HBT_CATEGORIES. */
  function categoryInfo(input) {
    if (!input) return null;
    if (typeof input === 'object' && input.slug) return input;
    const arr = window.HBT_CATEGORIES || [];
    // Cherche par slug exact
    let found = arr.find(c => c.slug === input);
    if (found) return found;
    // Cherche par label exact
    found = arr.find(c => c.label === input);
    if (found) return found;
    // Cherche par slug normalisé (auto-découverte → catégorie inconnue traitée comme produit)
    const slug = folderSlug(input);
    found = arr.find(c => c.slug === slug);
    if (found) return found;
    // Catégorie totalement nouvelle → assume produit
    return { slug: slug, label: String(input), type: 'produit', _auto: true };
  }
  window.HBT_categoryInfo = categoryInfo;

  /* Dossier Cloudinary d'une catégorie */
  function categoryFolder(input) {
    const cat = categoryInfo(input);
    if (!cat) return 'home-by-tika/' + folderSlug(input || '');
    const root = 'home-by-tika';
    if (cat.type === 'produit')  return root + '/produits/' + cat.slug;
    if (cat.type === 'site')     return root + '/site';
    return root + '/' + cat.slug;
  }
  window.HBT_categoryFolder = categoryFolder;

  /* Tags Cloudinary d'une catégorie (3 tags universels) */
  function categoryTags(input) {
    const cat = categoryInfo(input);
    const t = tagSlug(cat ? cat.slug : input);
    return ['hbt_product', 'hbt_' + t, 'hbt_category_' + t];
  }
  window.HBT_categoryTags = categoryTags;

  /* === Anciens FOLDER_MAP / TAG_MAP : générés DYNAMIQUEMENT depuis HBT_CATEGORIES ===
     Rétrocompatibilité 100 % avec le code qui les consomme (script.js, admin-extras.js). */
  const FOLDER_MAP = {};
  const TAG_MAP    = {};
  (window.HBT_CATEGORIES || []).forEach(c => {
    FOLDER_MAP[c.slug] = categoryFolder(c);
    TAG_MAP[c.slug]    = 'hbt_' + tagSlug(c.slug);
  });
  // Site (hors HBT_CATEGORIES)
  FOLDER_MAP.site = 'home-by-tika/site';

  /* Expose les mappings pour usage externe */
  window.HBT_FOLDER_MAP = FOLDER_MAP;
  window.HBT_TAG_MAP    = TAG_MAP;

  /* =========================================================
     HBT_mediaUrl(category, id, opts)
     ----------------------------------------------------------
     Construit l'URL Cloudinary d'un média.
     Exemple : ('portes', 'por-04') →
       https://res.cloudinary.com/dcj4xsp83/image/upload/
         f_auto,q_auto,w_1200,c_fill,g_auto/
         home-by-tika/produits/portes/por-04.jpg
     ========================================================= */
  window.HBT_mediaUrl = function (category, id, opts) {
    opts = opts || {};
    // Résolution dynamique : FOLDER_MAP d'abord (rapide), puis categoryFolder() pour
    // toute nouvelle catégorie pas encore enregistrée dans HBT_CATEGORIES.
    const folder = FOLDER_MAP[category] || categoryFolder(category);
    const transforms = [];
    transforms.push('f_' + (opts.format || 'auto'));
    transforms.push('q_' + (opts.quality || 'auto'));
    if (opts.width)   transforms.push('w_' + opts.width);
    if (opts.height)  transforms.push('h_' + opts.height);
    if (opts.crop)    transforms.push('c_' + opts.crop);
    if (opts.gravity) transforms.push('g_' + opts.gravity);
    const resource = opts.video ? 'video' : 'image';

    // Cloudinary accepte avec ou sans extension grâce à f_auto, mais
    // l'extension explicite évite l'ambiguïté côté CDN.
    let finalId = id;
    if (!/\.[a-z0-9]{2,5}$/i.test(id)) {
      finalId = id + (opts.video ? '.mp4' : '.jpg');
    }

    const url = 'https://res.cloudinary.com/' + CLOUD + '/' + resource +
                '/upload/' + transforms.join(',') + '/' + folder + '/' + finalId;

    if (window.HBT_DEBUG_MEDIA) {
      console.log('[HBT_mediaUrl]', { category, id, folder, tag: TAG_MAP[category], finalId, url });
    }
    return url;
  };

  /* =========================================================
     HBT_mediaList(category)   — VERSION SYNCHRONE
     ----------------------------------------------------------
     Renvoie immédiatement la liste des médias du manifeste.
     Utilisé pour l'affichage initial (sans attendre le réseau).
     ========================================================= */
  window.HBT_mediaList = function (category) {
    const arr = (window.HBT_MEDIA && window.HBT_MEDIA[category]) || [];
    return arr.map(function (m) {
      const isVideo = !!m.video || category === 'videos';
      return {
        id:       m.id,
        name:     m.name || (m.id || '').replace(/[-_]+/g, ' '),
        price:    m.price || '',
        desc:     m.desc  || '',
        wood:     m.wood  || '',
        label:    m.label || '',
        monogram: m.monogram || (m.name ? m.name.charAt(0).toUpperCase() : '·'),
        category: category,
        video:    isVideo,
        url:      window.HBT_mediaUrl(category, m.id, {
                    width: isVideo ? 900 : 1200,
                    crop: isVideo ? null : 'fill',
                    gravity: isVideo ? null : 'auto',
                    video: isVideo
                  }),
        thumbUrl: window.HBT_mediaUrl(category, m.id, {
                    width: 500, crop: 'fill', gravity: 'auto',
                    video: isVideo
                  })
      };
    });
  };

  /* =========================================================
     HBT_mediaListAsync(category)   — VERSION ASYNCHRONE
     ----------------------------------------------------------
     Renvoie le manifeste + les médias trouvés dans Cloudinary
     par tag (auto-découverte). Permet d'ajouter un média
     depuis l'admin SANS modifier le manifeste — il apparaît
     automatiquement sur le site.

     Fusion intelligente :
       • Manifeste = source de vérité pour prix / desc / wood
       • Cloudinary = source de vérité pour la liste réelle
       • Les IDs identiques sont dédupliqués (manifeste prioritaire)
     ========================================================= */
  window.HBT_mediaListAsync = async function (category) {
    const manifestItems = window.HBT_mediaList(category);
    const tag = TAG_MAP[category];

    // 0) PRODUITS SUPABASE (admin) — priorité après manifeste, avant Cloudinary tag
    let supaItems = [];
    if (window.ProductService && typeof window.ProductService.list === 'function') {
      try {
        const products = await window.ProductService.list(category);
        supaItems = (products || []).map(function (p) {
          const isVideo = !!p.video || category === 'videos';
          const fcfaPrice = (p.price != null) ?
            new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(p.price) + ' FCFA'
            : '';
          return {
            id:       p.id,
            name:     p.name,
            price:    fcfaPrice,
            desc:     p.description || '',
            wood:     p.wood || '',
            label:    p.label || '',
            monogram: p.monogram || (p.name ? p.name.charAt(0).toUpperCase() : '·'),
            category: category,
            video:    isVideo,
            url:      p.cloudinary_url || window.HBT_mediaUrl(category, p.id, { width: 1200, crop: 'fill', gravity: 'auto', video: isVideo }),
            thumbUrl: window.HBT_mediaUrl(category, p.id, { width: 500, crop: 'fill', gravity: 'auto', video: isVideo }),
            _source:  'supabase'
          };
        });
        if (window.HBT_DEBUG_MEDIA && supaItems.length) {
          console.log('[HBT_mediaListAsync]', category, '→ Supabase products:', supaItems.length);
        }
      } catch (e) {
        if (window.HBT_DEBUG_MEDIA) {
          console.warn('[HBT_mediaListAsync] Supabase products fetch failed:', e.message);
        }
      }
    }

    if (!tag) {
      // Catégorie inconnue → Supabase d'abord (priorité produits admin)
      const merged = supaItems.slice();
      const seen = new Set(merged.map(s => s.id));
      manifestItems.forEach(m => { if (!seen.has(m.id)) merged.push(m); });
      return merged;
    }

    let cloudItems = [];
    try {
      const resourceType = (category === 'videos') ? 'video' : 'image';
      const res = await fetch('/api/cloudinary-assets?tag=' + encodeURIComponent(tag) + '&type=' + resourceType, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const resources = (data && Array.isArray(data.resources)) ? data.resources : [];
        if (window.HBT_DEBUG_MEDIA) {
          console.log('[HBT_mediaListAsync]', category, '→ Cloudinary:', resources.length, 'média(s)');
        }
        // Convertir Cloudinary resources → format média HBT
        cloudItems = resources.map(function (r) {
          // public_id = home-by-tika/produits/portes/por-04
          // on extrait le dernier segment comme ID
          const segments = (r.public_id || '').split('/');
          const id = segments[segments.length - 1];
          const isVideo = (r.resource_type === 'video') || category === 'videos';
          return {
            id:       id,
            name:     (r.context && r.context.custom && r.context.custom.alt) || id.replace(/[-_]+/g, ' '),
            price:    (r.context && r.context.custom && r.context.custom.price) || '',
            desc:     (r.context && r.context.custom && r.context.custom.caption) || '',
            wood:     (r.context && r.context.custom && r.context.custom.wood) || '',
            label:    '',
            monogram: id.charAt(0).toUpperCase(),
            category: category,
            video:    isVideo,
            url:      r.secure_url || window.HBT_mediaUrl(category, id, { width: 1200, crop: 'fill', gravity: 'auto', video: isVideo }),
            thumbUrl: window.HBT_mediaUrl(category, id, { width: 500, crop: 'fill', gravity: 'auto', video: isVideo })
          };
        });
      } else if (window.HBT_DEBUG_MEDIA) {
        console.warn('[HBT_mediaListAsync] /api/cloudinary-assets HTTP', res.status, '— fallback manifeste seul');
      }
    } catch (e) {
      if (window.HBT_DEBUG_MEDIA) {
        console.warn('[HBT_mediaListAsync] Erreur fetch Cloudinary, fallback manifeste :', e.message);
      }
    }

    // Fusion 3-niveaux ORDRE D'AFFICHAGE :
    //   1) Supabase products en TÊTE (les plus récents ajoutés par l'admin)
    //   2) Manifeste (les 23 produits historiques) en milieu
    //   3) Cloudinary (auto-découverte par tag) en queue (cas rare)
    // Dédup par id (seen-set), pas de duplication.
    const merged = supaItems.slice();
    const seenIds = new Set(supaItems.map(function (s) { return s.id; }));
    manifestItems.forEach(function (m) {
      if (!seenIds.has(m.id)) { merged.push(m); seenIds.add(m.id); }
    });
    cloudItems.forEach(function (c) {
      if (!seenIds.has(c.id)) merged.push(c);
    });

    return merged;
  };

  /* =========================================================
     HBT_getPlaceholderUrl(name, opts)
     ----------------------------------------------------------
     Génère un SVG inline (data URL) élégant pour les images
     manquantes — palette HOME BY TIKA, monogramme centré.
     ========================================================= */
  window.HBT_getPlaceholderUrl = function (name, opts) {
    opts = opts || {};
    const monogram = (opts.monogram || (name ? name.charAt(0) : '·')).toUpperCase();
    const w = opts.width || 600;
    const h = opts.height || 750;
    const bg1 = opts.bg1 || '#f4ead2';
    const bg2 = opts.bg2 || '#e8dcbf';
    const fg  = opts.fg  || '#7a5a32';

    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="' + bg1 + '"/>' +
        '<stop offset="100%" stop-color="' + bg2 + '"/>' +
      '</linearGradient></defs>' +
      '<rect width="100%" height="100%" fill="url(#g)"/>' +
      '<text x="50%" y="50%" font-family="Playfair Display, Georgia, serif" ' +
            'font-size="' + Math.round(h / 4) + '" fill="' + fg + '" ' +
            'text-anchor="middle" dominant-baseline="central" opacity="0.55">' +
        monogram +
      '</text>' +
    '</svg>';

    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  };

  /* =========================================================
     HBT_handleImageError(imgEl, name, opts)
     ----------------------------------------------------------
     À appeler dans onerror="..." :
       <img ... onerror="HBT_handleImageError(this, 'Salon Baoulé')">
     Remplace l'image par un placeholder SVG élégant (au lieu
     d'afficher l'icône cassée du navigateur).
     ========================================================= */
  window.HBT_handleImageError = function (imgEl, name, opts) {
    if (!imgEl || imgEl.dataset.hbtFallback === '1') return; // évite boucle
    imgEl.dataset.hbtFallback = '1';
    imgEl.src = window.HBT_getPlaceholderUrl(name, opts);
    const parent = imgEl.parentNode;
    if (parent) parent.classList.add('hbt-placeholder');
  };

  /* =========================================================
     HBT_siteImageUrl(key, opts)   — Image du site (hero, atelier)
     ========================================================= */
  window.HBT_siteImageUrl = function (key, opts) {
    const id = window.HBT_MEDIA && window.HBT_MEDIA.site && window.HBT_MEDIA.site[key];
    if (!id) return null;
    return window.HBT_mediaUrl('site', id, opts || { width: 2200, crop: 'fill', gravity: 'auto' });
  };

})();
