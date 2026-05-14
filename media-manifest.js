/* =========================================================
   HOME BY TIKA — Manifeste des médias
   ----------------------------------------------------------
   Inventaire des photos et vidéos disponibles sur Cloudinary,
   organisé par catégorie. Le site lit CE fichier pour savoir
   quels médias afficher dans chaque section.

   COMMENT AJOUTER UN MÉDIA :
   ----------------------------------------------------------
   1. Uploadez l'image dans Cloudinary (depuis l'admin ou direct)
      ex. public_id = home-by-tika/portes/porte-akwaba
   2. Ouvrez ce fichier, ajoutez l'entrée dans la bonne catégorie :
      portes: [
        { id: 'porte-akwaba', name: 'Porte Akwaba', price: '980 000 FCFA' },
        ...
      ]
   3. Commit + push GitHub → Netlify redéploie → image visible.

   FORMAT D'UNE ENTRÉE :
   ----------------------------------------------------------
   {
     id:     'slug-cloudinary',     // = nom du fichier dans Cloudinary (sans .jpg)
     name:   'Nom affiché',          // optionnel — sinon dérivé de id
     price:  '780 000 FCFA',         // optionnel
     desc:   'Description courte',   // optionnel
     wood:   'Iroko',                // optionnel — badge essence
     video:  false                   // true si c'est une vidéo .mp4
   }

   L'URL Cloudinary est construite automatiquement :
     https://res.cloudinary.com/dcj4xsp83/image/upload/.../<dossier>/<id>

   Pour générer ce manifeste automatiquement depuis vos uploads admin :
   • Ouvrez admin.html → bouton "Exporter manifeste" en bas
   • Téléchargez le nouveau media-manifest.js
   • Remplacez ce fichier dans le dépôt GitHub
   ========================================================= */

window.HBT_MEDIA = {

  /* ============ GALERIE ============ */
  portes: [
    // Exemple : { id: 'porte-akwaba', name: 'Porte Akwaba', price: '980 000 FCFA', wood: 'Iroko' }
  ],
  mobilier: [
    // Exemple : { id: 'salon-baoule', name: 'Salon Baoulé', wood: 'Iroko' }
  ],
  atelier: [
    // Exemple : { id: 'atelier-vue-1', name: 'Vue d\'atelier' }
  ],
  collections: [
    // Exemple : { id: 'collection-ete-2026', name: 'Collection Été' }
  ],
  serrures: [
    // Exemple : { id: 'serrure-atlas', name: 'Serrure Atlas', price: '185 000 FCFA' }
  ],
  videos: [
    // Exemple : { id: 'fabrication-porte', name: 'Fabrication d\'une porte', video: true }
  ],

  /* ============ BOUTIQUE (par catégorie de produit) ============ */
  salons:    [],
  tables:    [],
  chaises:   [],
  lits:      [],
  armoires:  [],
  cuisines:  [],
  meublestv: [],
  bureaux:   [],
  exterieur: [],

  /* ============ SITE (hero, atelier story image) ============ */
  site: {
    'hero-bg':  null,   // ex. 'hero-bg-2026' → home-by-tika/site/hero-bg-2026
    'atelier':  null    // ex. 'atelier-photo-1'
  }
};

/* =========================================================
   FONCTIONS UTILITAIRES — Construction d'URLs Cloudinary
   ========================================================= */

(function () {
  const CLOUD = (window.HBT_CONFIG && window.HBT_CONFIG.cloudinary && window.HBT_CONFIG.cloudinary.cloudName) || 'dcj4xsp83';

  // Dossier Cloudinary par catégorie
  const FOLDER_MAP = {
    portes:      'home-by-tika/portes',
    mobilier:    'home-by-tika/mobilier',
    atelier:     'home-by-tika/atelier',
    collections: 'home-by-tika/collections',
    serrures:    'home-by-tika/serrures',
    videos:      'home-by-tika/videos',
    salons:      'home-by-tika/salons',
    tables:      'home-by-tika/tables',
    chaises:     'home-by-tika/chaises',
    lits:        'home-by-tika/lits',
    armoires:    'home-by-tika/armoires',
    cuisines:    'home-by-tika/cuisines',
    meublestv:   'home-by-tika/meublestv',
    bureaux:     'home-by-tika/bureaux',
    exterieur:   'home-by-tika/exterieur',
    site:        'home-by-tika/site'
  };

  /* Construit l'URL d'un média Cloudinary depuis (catégorie, id) */
  window.HBT_mediaUrl = function (category, id, opts) {
    opts = opts || {};
    const folder = FOLDER_MAP[category] || ('home-by-tika/' + category);
    const transforms = [];
    transforms.push('f_' + (opts.format || 'auto'));
    transforms.push('q_' + (opts.quality || 'auto'));
    if (opts.width)   transforms.push('w_' + opts.width);
    if (opts.height)  transforms.push('h_' + opts.height);
    if (opts.crop)    transforms.push('c_' + opts.crop);
    if (opts.gravity) transforms.push('g_' + opts.gravity);
    const resource = opts.video ? 'video' : 'image';
    return 'https://res.cloudinary.com/' + CLOUD + '/' + resource +
           '/upload/' + transforms.join(',') + '/' + folder + '/' + id;
  };

  /* Retourne la liste des médias d'une catégorie avec URL prête à afficher */
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

  /* URL d'une image du site (hero, atelier) */
  window.HBT_siteImageUrl = function (key, opts) {
    const id = window.HBT_MEDIA && window.HBT_MEDIA.site && window.HBT_MEDIA.site[key];
    if (!id) return null;
    return window.HBT_mediaUrl('site', id, opts || { width: 2200, crop: 'fill', gravity: 'auto' });
  };

})();
