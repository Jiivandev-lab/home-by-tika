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
    /* =====================================================
       listByTag — Lecture publique Cloudinary par tag
       URL exacte appelée :
         https://res.cloudinary.com/<CLOUD>/<image|video>/list/<TAG>.json
       Pour que ça fonctionne, Cloudinary → Settings → Security →
       décocher « Resource list » dans « Restricted media types ».
       ===================================================== */
    async listByTag(tag, type) {
      if (!isOK()) {
        console.warn('[Cloudinary.listByTag] Cloudinary non configuré dans config.js');
        return [];
      }
      if (!tag) {
        console.warn('[Cloudinary.listByTag] Tag manquant');
        return [];
      }
      type = (type || 'image').toLowerCase();
      const cloud = cfg().cloudName;
      const url = 'https://res.cloudinary.com/' + cloud +
                  '/' + type + '/list/' + tag + '.json';

      console.group('[Cloudinary.listByTag]');
      console.log('Cloud name    :', cloud);
      console.log('Tag demandé   :', tag);
      console.log('Resource type :', type);
      console.log('URL appelée   :', url);

      let res;
      try {
        res = await fetch(url, { cache: 'no-store', mode: 'cors' });
      } catch (netErr) {
        console.error('Erreur réseau / CORS :', netErr);
        console.warn('Si vous voyez "Failed to fetch" → vérifiez votre connexion ou la console Network.');
        console.groupEnd();
        return [];
      }

      console.log('Status HTTP   :', res.status, res.statusText);

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        console.error('Réponse brute :', txt.slice(0, 400));

        if (res.status === 401 || res.status === 403) {
          console.warn(
            '⚠ HTTP ' + res.status + ' → "Resource list" est RESTREINT dans Cloudinary.\n' +
            'Solution :\n' +
            '  1. Allez sur https://console.cloudinary.com\n' +
            '  2. Settings (engrenage) → Security\n' +
            '  3. Section "Restricted media types" → retirez/décochez "Resource list"\n' +
            '  4. Cochez "Image" (et "Video" pour les galeries vidéo) dans "Resource list allowed" si présent\n' +
            '  5. Save → Patientez 1 min puis rechargez le site.'
          );
        } else if (res.status === 404) {
          console.warn(
            '⚠ HTTP 404 → Aucun média indexé pour ce tag.\n' +
            '  • Vérifiez l\'orthographe exacte du tag : "' + tag + '"\n' +
            '  • Les tags sont sensibles à la casse : "hbt_tables" ≠ "HBT_TABLES" ≠ "hbt_Tables"\n' +
            '  • Cloudinary indexe les tags dans les ~30 secondes après l\'upload.'
          );
        }

        console.groupEnd();
        return [];
      }

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.error('Réponse non-JSON :', parseErr);
        console.groupEnd();
        return [];
      }

      console.log('Réponse JSON  :', data);

      // L'API publique renvoie { resources: [...] } — robuste à différents shapes
      let resources = [];
      if (Array.isArray(data)) {
        resources = data;
      } else if (data && Array.isArray(data.resources)) {
        resources = data.resources;
      } else if (data && data.resource_type) {
        resources = [data];
      }

      console.log('Médias trouvés :', resources.length);
      if (resources.length > 0) {
        console.log('Premier média :', resources[0]);
        console.log('Exemples public_id :', resources.slice(0, 5).map(r => r.public_id));
      } else {
        console.warn(
          'Aucun média retourné. Vérifications :\n' +
          '  • Le tag "' + tag + '" existe-t-il bien sur des médias dans Cloudinary ?\n' +
          '  • Le delivery type est-il "upload" (et pas "private" / "authenticated") ?\n' +
          '  • Attendez 30-60 s après upload — Cloudinary indexe les tags avec un léger délai.'
        );
      }

      console.groupEnd();
      return resources;
    }
  };
})();
