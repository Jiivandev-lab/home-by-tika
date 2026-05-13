/* =========================================================
   HOME BY TIKA — Configuration centrale
   ----------------------------------------------------------
   ⚠️  CE FICHIER EST PUBLIC (GitHub).
   N'y mettez JAMAIS :
   - le mot de passe admin en clair (utilisez son hash SHA-256)
   - une API key Cloudinary secrète
   - une clé Stripe ou autre token

   Toutes les opérations privilégiées (modifier le catalogue, etc.)
   passent par les uploads Cloudinary unsigned avec un preset
   restreint — aucune clé n'a besoin d'être ici.

   POUR ACTIVER CLOUDINARY :
   1. Compte gratuit sur https://cloudinary.com
   2. Dashboard → recopiez « Cloud Name » → cloudName ci-dessous
   3. Settings → Upload → Add upload preset
      → Signing Mode : Unsigned, Name : « home_by_tika » → Save
   4. Settings → Security : « Resource list » non restreint
   5. Sauvegarder, push GitHub. Netlify redéploie automatiquement.
   ========================================================= */

window.HBT_CONFIG = {

  /* ========== CLOUDINARY ========== */
  cloudinary: {
    cloudName: 'dcj4xsp83',
    uploadPreset: 'home_by_tika',

    /* Dossiers Cloudinary (créés automatiquement au premier upload) */
    folders: {
      produits:    'home-by-tika/produits',
      portes:      'home-by-tika/portes',
      mobilier:    'home-by-tika/mobilier',
      atelier:     'home-by-tika/atelier',
      collections: 'home-by-tika/collections',
      serrures:    'home-by-tika/serrures',
      videos:      'home-by-tika/videos',
      site:        'home-by-tika/site'
    },

    /* Tags des galeries automatiques */
    tags: {
      product:              'hbt_product',
      productVideo:         'hbt_product_video',
      siteAtelier:          'hbt_site_atelier',
      siteHero:             'hbt_site_hero',
      galleryPortes:        'hbt_portes',
      galleryMobilier:      'hbt_mobilier',
      galleryAtelier:       'hbt_atelier',
      galleryCollections:   'hbt_collections',
      gallerySerrures:      'hbt_serrures',
      galleryVideos:        'hbt_videos'
    }
  },

  /* ========== COORDONNÉES (publiques, OK ici) ========== */
  contact: {
    whatsapp: '2250748738671',
    phoneDisplay: '+225 07 48 73 86 71',
    email: 'contact@homebytika.ci',
    address: 'Songon, Cité la Grâce — Abidjan, Côte d\'Ivoire',
    workshop: { lat: 5.3066, lng: -4.2517 }
  },

  /* ========== SUPABASE (suivi des commandes) ==========
     L'anon key Supabase est publique par design — pas une fuite.
     La sécurité passe par les Row Level Security policies en SQL.

     POUR ACTIVER :
     1. Créez un compte gratuit sur https://supabase.com
     2. Nouveau projet → recopiez Project URL et anon key ci-dessous
     3. SQL Editor → exécutez le script CREATE TABLE du README
  ===================================================== */
  supabase: {
    url:    'YOUR_SUPABASE_URL_HERE',          // ex. https://abc123.supabase.co
    anonKey: 'YOUR_SUPABASE_ANON_KEY_HERE'     // clé anonyme publique
  },

  /* ========== ADMINISTRATION ==========
     Hash SHA-256 du mot de passe — le mot de passe lui-même
     n'est JAMAIS écrit ici.

     Pour changer de mot de passe :
       1. Ouvrez https://emn178.github.io/online-tools/sha256.html
       2. Tapez votre nouveau mot de passe
       3. Copiez le hash et collez-le ci-dessous

     Ou utilisez la commande :
       echo -n "MON_NOUVEAU_MDP" | sha256sum                  (Linux/macOS)
       Get-FileHash -InputStream ([IO.MemoryStream]::new([Text.Encoding]::UTF8.GetBytes("MON_NOUVEAU_MDP"))) -Algorithm SHA256
                                                              (Windows PowerShell)
  ========================================= */
  admin: {
    // Hash SHA-256 du mot de passe actuel
    // (par défaut : le mot de passe que vous nous avez communiqué)
    passwordHash: 'b2018b6655012d0c713ea1cc4809b787820ff48375e8d3122b050edc77948640'
  }
};

/* ========== HELPERS — NE PAS MODIFIER ========== */
window.HBT_CONFIG.isCloudinaryReady = function () {
  const c = window.HBT_CONFIG.cloudinary;
  return c.cloudName && c.cloudName !== 'YOUR_CLOUD_NAME_HERE' && c.uploadPreset;
};

window.HBT_CONFIG.isSupabaseReady = function () {
  const s = window.HBT_CONFIG.supabase;
  return s && s.url && s.anonKey &&
         s.url !== 'YOUR_SUPABASE_URL_HERE' &&
         s.anonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE';
};

window.CLOUDINARY_CONFIG = window.HBT_CONFIG.cloudinary;

/* Hash SHA-256 d'une chaîne (utilisé par l'admin) */
window.HBT_sha256 = async function (text) {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/* ========== API CLOUDINARY ========== */
window.Cloudinary = (function () {
  const cfg = () => window.HBT_CONFIG.cloudinary;
  const isOK = () => window.HBT_CONFIG.isCloudinaryReady();

  function buildUrl(publicId, opts) {
    if (!isOK() || !publicId) return null;
    opts = opts || {};
    const t = [];
    t.push('f_' + (opts.format || 'auto'));
    t.push('q_' + (opts.quality || 'auto'));
    if (opts.width)   t.push('w_' + opts.width);
    if (opts.height)  t.push('h_' + opts.height);
    if (opts.crop)    t.push('c_' + opts.crop);
    if (opts.gravity) t.push('g_' + opts.gravity);
    if (opts.dpr)     t.push('dpr_' + opts.dpr);
    const resource = opts.resourceType || 'image';
    return 'https://res.cloudinary.com/' + cfg().cloudName +
           '/' + resource + '/upload/' + t.join(',') + '/' + publicId;
  }

  return {
    isConfigured: isOK,
    cloudName: () => cfg().cloudName,
    uploadPreset: () => cfg().uploadPreset,
    folders: () => cfg().folders,
    tags: () => cfg().tags,
    url: buildUrl,
    productImageUrl(id, opts) {
      opts = opts || {};
      return buildUrl(cfg().folders.produits + '/' + id,
                      Object.assign({ crop: 'fill', gravity: 'auto' }, opts));
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
