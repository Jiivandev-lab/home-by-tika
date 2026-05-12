/* =========================================================
   HOME BY TIKA — Configuration centrale
   ----------------------------------------------------------
   Modifiez UNIQUEMENT les valeurs entre guillemets ci-dessous.
   Aucune autre modification du code n'est nécessaire.

   POUR ACTIVER CLOUDINARY (hébergement cloud des photos/vidéos) :
   1. Créez un compte gratuit sur https://cloudinary.com
   2. Dashboard → repérez votre « Cloud Name » → recopiez-le
      dans cloudName ci-dessous.
   3. Settings (icône engrenage) → Upload → Add upload preset →
      Signing Mode : Unsigned → Preset name : « home_by_tika » →
      Save.
   4. Settings → Security → cochez « Resource list » dans
      « Restricted media types » de bas en haut, puis dans
      la même page, sous « Resource list », sélectionnez
      « Image » et « Video » (pour activer les galeries
      automatiques par tag).
   5. Sauvegardez ce fichier, commit/push sur GitHub.
   ========================================================= */

window.HBT_CONFIG = {

  /* ========== CLOUDINARY ========== */
  cloudinary: {
    // ⚠ À remplacer après création du compte
    cloudName: 'dcj4xsp83',

    // Nom du « upload preset » créé dans Cloudinary (mode unsigned)
    uploadPreset: 'home_by_tika',

    // Dossiers Cloudinary (créés automatiquement au premier upload)
    folders: {
      produits:    'home-by-tika/produits',
      portes:      'home-by-tika/portes',
      mobilier:    'home-by-tika/mobilier',
      atelier:     'home-by-tika/atelier',
      collections: 'home-by-tika/collections',
      videos:      'home-by-tika/videos',
      site:        'home-by-tika/site'
    },

    // Tags pour les galeries automatiques (API public list Cloudinary)
    tags: {
      product:        'hbt_product',          // photos produits
      productVideo:   'hbt_product_video',    // vidéos produits
      siteAtelier:    'hbt_site_atelier',     // image atelier (story-image)
      siteHero:       'hbt_site_hero',        // fond principal hero
      galleryPortes:      'hbt_portes',
      galleryMobilier:    'hbt_mobilier',
      galleryAtelier:     'hbt_atelier',
      galleryCollections: 'hbt_collections',
      galleryVideos:      'hbt_videos'
    }
  },

  /* ========== COORDONNÉES ========== */
  contact: {
    whatsapp: '2250748738671',                          // Format international sans +
    phoneDisplay: '+225 07 48 73 86 71',
    email: 'contact@homebytika.ci',
    address: 'Songon, Cité la Grâce — Abidjan, Côte d\'Ivoire',
    workshop: { lat: 5.3066, lng: -4.2517 }             // GPS atelier
  },

  /* ========== ADMINISTRATION ========== */
  admin: {
    // ⚠ À changer ! Mot de passe d'accès à l'espace de gestion
    password: '696933MARINA'
  }
};

/* ========== HELPERS — NE PAS MODIFIER ========== */
window.HBT_CONFIG.isCloudinaryReady = function() {
  const c = window.HBT_CONFIG.cloudinary;
  return c.cloudName && c.cloudName !== 'YOUR_CLOUD_NAME_HERE' && c.uploadPreset;
};

// Alias direct utilisé par le moteur Cloudinary du site
window.CLOUDINARY_CONFIG = window.HBT_CONFIG.cloudinary;

/* ========== API CLOUDINARY ==========
   Namespace global utilisé partout dans le site et l'admin */
window.Cloudinary = (function () {
  const cfg = () => window.HBT_CONFIG.cloudinary;
  const isOK = () => window.HBT_CONFIG.isCloudinaryReady();

  function buildUrl(publicId, opts) {
    if (!isOK() || !publicId) return null;
    opts = opts || {};
    const transforms = [];
    transforms.push('f_' + (opts.format || 'auto'));
    transforms.push('q_' + (opts.quality || 'auto'));
    if (opts.width)   transforms.push('w_' + opts.width);
    if (opts.height)  transforms.push('h_' + opts.height);
    if (opts.crop)    transforms.push('c_' + opts.crop);
    if (opts.gravity) transforms.push('g_' + opts.gravity);
    if (opts.dpr)     transforms.push('dpr_' + opts.dpr);
    const resource = opts.resourceType || 'image';
    return 'https://res.cloudinary.com/' + cfg().cloudName +
           '/' + resource + '/upload/' + transforms.join(',') +
           '/' + publicId;
  }

  return {
    isConfigured: isOK,
    cloudName: () => cfg().cloudName,
    uploadPreset: () => cfg().uploadPreset,
    folders: () => cfg().folders,
    tags: () => cfg().tags,

    /* URL générique avec optimisation */
    url: buildUrl,

    /* URLs conventionnelles pour les médias produits & site */
    productImageUrl(id, opts) {
      opts = opts || {};
      return buildUrl(cfg().folders.produits + '/' + id, Object.assign({ crop: 'fill', gravity: 'auto' }, opts));
    },
    productVideoUrl(id, opts) {
      opts = opts || {};
      return buildUrl(cfg().folders.videos + '/' + id + '-video',
                      Object.assign({ resourceType: 'video' }, opts));
    },
    siteImageUrl(name, opts) {
      opts = opts || {};
      return buildUrl(cfg().folders.site + '/' + name,
                      Object.assign({ crop: 'fill', gravity: 'auto' }, opts));
    },

    /* Galerie par tag — liste publique JSON */
    async listByTag(tag, type) {
      if (!isOK() || !tag) return [];
      type = type || 'image';
      try {
        const url = 'https://res.cloudinary.com/' + cfg().cloudName +
                    '/' + type + '/list/' + tag + '.json';
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return data.resources || [];
      } catch (e) { return []; }
    }
  };
})();
