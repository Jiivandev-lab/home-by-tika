/* =========================================================
   HOME BY TIKA — Configuration Cloudinary
   ----------------------------------------------------------
   Pour activer le cloud :
     1. Créez un compte gratuit sur https://cloudinary.com
     2. Dashboard → notez votre "Cloud name"
     3. Settings → Upload → "Add upload preset"
        - Signing mode : "Unsigned"
        - Folder : home-by-tika
        - Cliquez Save, notez le nom du preset
     4. Settings → Security → cochez "Allow resource list" (autorise la galerie auto)
     5. Remplissez les deux valeurs ci-dessous, sauvegardez, c'est tout.
   ========================================================= */

window.CLOUDINARY_CONFIG = {
  // Nom de votre cloud (exemple : "ds3abc7xy")
  cloudName: '',

  // Nom de votre preset d'upload non-signé (exemple : "hbt_unsigned")
  uploadPreset: '',

  // Racine des dossiers Cloudinary (laisser tel quel)
  rootFolder: 'home-by-tika',

  // Tags utilisés pour identifier les médias
  tags: {
    product:        'hbt-product',          // photos produits
    productVideo:   'hbt-product-video',    // vidéos produits
    siteAtelier:    'hbt-site-atelier',     // image de la section Atelier
    siteHero:       'hbt-site-hero',        // image de fond de la bannière
    galleryPortes:      'hbt-gallery-portes',
    galleryMobilier:    'hbt-gallery-mobilier',
    galleryAtelier:     'hbt-gallery-atelier',
    galleryCollections: 'hbt-gallery-collections',
    galleryVideos:      'hbt-gallery-videos'
  }
};
