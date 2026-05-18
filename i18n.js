/* =========================================================
   HOME BY TIKA — Système multilingue (FR / EN / ES)
   ----------------------------------------------------------
   Comment utiliser :
   • Ajoutez data-i18n="ma.cle" à n'importe quel élément HTML
   • Sa textContent sera remplacée par la traduction
   • Pour traduire un attribut (placeholder, title, alt) :
       data-i18n-attr="placeholder:form.email|title:tooltip.help"
   ========================================================= */

window.HBT_I18N = {

  /* ============ FRANÇAIS ============ */
  fr: {
    'nav.home':      'Accueil',
    'nav.shop':      'Boutique',
    'nav.gallery':   'Galerie',
    'nav.workshop':  'Atelier',
    'nav.contact':   'Contact',
    'nav.locate':    'Localisation',
    'nav.tracking':  'Suivi commande',
    'nav.showroom':  'Showroom',
    'nav.cart':      'Panier',

    /* HERO */
    'hero.eyebrow':  'Atelier ivoirien d\'ébénisterie',
    'hero.title':    'Le bois massif, l\'âme de votre maison.',
    'hero.title1':   'Le bois ',
    'hero.title2':   'massif',
    'hero.title3':   ', l\'âme de votre maison.',
    'hero.lede':     'Bienvenue chez HOME BY TIKA, spécialiste du mobilier en bois massif et des portes haut de gamme en Côte d\'Ivoire. Nous transformons les meilleures essences locales — Iroko, Framiré, Teck — en créations solides, élégantes et durables.',
    'hero.cta1':     'Découvrir la collection',
    'hero.cta2':     'Demander un devis',

    /* SECTIONS */
    'services.eyebrow':  'Nos prestations',
    'services.title':    'Portes & mobilier sur mesure',
    'services.lede':     'Pour les maisons, villas, bureaux et hôtels — un savoir-faire artisanal, deux univers complémentaires.',
    'services.doors':    'Portes en bois massif',
    'services.furniture':'Mobilier en bois',
    'essences.eyebrow':  'Les bois de Côte d\'Ivoire',
    'essences.title':    'Essences nobles, choisies une à une',
    'collection.eyebrow':'Sélection de l\'atelier',
    'collection.title':  'Pièces emblématiques',
    'engagement.eyebrow':'Notre engagement',
    'engagement.title':  'Trois principes, aucune concession.',
    'cta.title1':        'Une ',
    'cta.title2':        'création unique',
    'cta.title3':        ', à votre image.',
    'cta.lede':          'Contactez-nous dès aujourd\'hui pour donner vie à vos projets en bois massif.',

    /* BOUTIQUE */
    'shop.title':        'La boutique',
    'shop.eyebrow':      'Collection',
    'shop.subtitle':     'Mobilier et portes en bois massif, fabriqués à la main dans notre atelier d\'Abidjan. Iroko, Framiré et Teck — chaque pièce est disponible en l\'état ou personnalisable sur demande.',
    'shop.all':          'Tout',
    'shop.add':          'Ajouter',
    'shop.devis':        'Devis',
    'shop.loading':      'Chargement des collections…',
    'shop.loading.sub':  'Préparation des pièces de l\'atelier',
    'shop.filter.serrures': 'Serrures & accessoires',
    'shop.empty':        'Aucun produit dans cette catégorie',
    'shop.sur_mesure.title': 'Une pièce unique pour vous ?',
    'shop.sur_mesure.lede':  'Dimensions, essence (Iroko, Framiré, Teck), finition : nous fabriquons votre meuble ou votre porte selon vos plans, vos contraintes et votre intérieur.',
    'shop.sur_mesure.cta':   'Demander un devis',

    /* GALERIE */
    'gallery.title':     'La galerie',
    'gallery.eyebrow':   'Nos réalisations',
    'gallery.subtitle':  'Portes, mobilier, ambiances d\'atelier, collections — un aperçu de notre savoir-faire ivoirien. Les nouvelles photos apparaissent automatiquement.',
    'gallery.tab.portes': 'Portes',
    'gallery.tab.mobilier': 'Mobilier',
    'gallery.tab.atelier': 'Atelier',
    'gallery.tab.collections': 'Collections',
    'gallery.tab.serrures': 'Serrures',
    'gallery.tab.videos': 'Vidéos',
    'gallery.empty':     'Aucun média dans cette section',

    /* ATELIER */
    'workshop.title':    'L\'Atelier',
    'workshop.eyebrow':  'Notre maison',
    'workshop.subtitle': 'Un savoir-faire patient, une exigence simple : que chaque pièce traverse les générations.',

    /* CONTACT (page) */
    'contact.eyebrow':   'Parlons de votre projet',
    'contact.subtitle':  'Notre équipe vous répond rapidement par WhatsApp, email ou téléphone.',
    'contact.form.name': 'Nom complet',
    'contact.form.phone': 'Téléphone',
    'contact.form.email': 'Email',
    'contact.form.message': 'Votre message',
    'contact.form.submit': 'Envoyer le message',

    /* PANIER */
    'cart.title':        'Votre panier',
    'cart.eyebrow':      'Récapitulatif',
    'cart.subtitle':     'Vérifiez votre sélection avant de finaliser votre commande. Livraison & installation offertes dès 1 500 000 FCFA d\'achat sur Abidjan.',
    'cart.empty':        'Votre panier est vide',
    'cart.empty.cta':    'Découvrir la collection',
    'cart.subtotal':     'Sous-total',
    'cart.shipping':     'Livraison & installation',
    'cart.shipping.free':'Offerte',
    'cart.total':        'Total',
    'cart.checkout':     'Finaliser la commande',
    'cart.location':     'Partager mon emplacement',
    'cart.checkout.title': 'Finaliser ma commande',
    'cart.checkout.lede': 'Renseignez vos coordonnées. Nous vous contacterons rapidement par WhatsApp pour confirmer le paiement et la livraison.',
    'cart.form.name':    'Nom complet',
    'cart.form.phone':   'Téléphone',
    'cart.form.email':   'Email',
    'cart.form.address': 'Adresse de livraison',
    'cart.form.notes':   'Notes (optionnel)',
    'cart.form.submit':  'Valider ma commande',
    'cart.success.title': 'Votre commande a été reçue',
    'cart.success.body': 'HOME BY TIKA vous contactera pour confirmer le paiement, la livraison et l\'installation.',
    'cart.success.ref':  'Votre numéro de suivi',
    'cart.success.track': 'Suivre ma commande',
    'cart.success.wa':   'WhatsApp HOME BY TIKA',
    'cart.success.call': 'Appeler HOME BY TIKA',
    'cart.success.shop': 'Retour à la boutique',

    /* SUIVI COMMANDE */
    'tracking.title':    'Suivi de commande',
    'tracking.eyebrow':  'Suivi en ligne',
    'tracking.subtitle': 'Entrez votre numéro de commande pour suivre son évolution depuis n\'importe quel appareil.',
    'tracking.placeholder':'Entrez votre numéro de commande (ex. HBT-2605-AB12)',
    'tracking.search':   'Suivre ma commande',
    'tracking.refresh':  '↻ Rafraîchir le suivi',
    'tracking.notfound': 'Aucune commande trouvée',
    'tracking.progress': 'Progression',
    'tracking.lastupdate': 'Dernière mise à jour',
    'tracking.contact':  'Une question sur votre commande ?',
    'tracking.contact.btn': 'Nous contacter',

    /* DEVIS modal */
    'quote.title':       'Demander un devis',
    'quote.lede':        'Remplissez le formulaire — nous vous recontactons sous 24h avec un devis personnalisé.',
    'quote.form.name':   'Nom complet *',
    'quote.form.phone':  'Téléphone *',
    'quote.form.email':  'Email (optionnel)',
    'quote.form.location':'Pays / Ville',
    'quote.form.product':'Produit concerné',
    'quote.form.dimensions':'Dimensions souhaitées',
    'quote.form.wood':   'Essence souhaitée',
    'quote.form.budget': 'Budget estimatif (FCFA)',
    'quote.form.message':'Votre message',
    'quote.form.contact':'Mode de réception du devis préféré',
    'quote.submit':      'Envoyer ma demande',
    'quote.wa':          'Continuer sur WhatsApp',
    'quote.success.title':'Demande envoyée !',
    'quote.success.body':'Notre équipe vous recontacte sous 24h sur WhatsApp pour finaliser votre projet.',

    /* CONTACT page */
    'contact.title':     'Contact & sur-mesure',
    'contact.write':     'Écrire à l\'atelier',
    'contact.whatsapp':  'Discuter sur WhatsApp',

    /* COMMUN */
    'common.send':       'Envoyer',
    'common.loading':    'Chargement…',
    'common.search':     'Rechercher',
    'common.required':   'Champs obligatoires *',
    'common.cancel':     'Annuler',
    'common.back':       'Retour',
    'footer.rights':     'Tous droits réservés',

    /* HOME (sections détaillées) */
    'home.services.doors.desc': 'Nous réalisons des portes sur mesure en bois massif pour maisons, villas, bureaux et hôtels. Chaque ouverture est conçue pour durer.',
    'home.services.furniture.desc': 'Nous fabriquons du mobilier artisanal et moderne alliant esthétique, robustesse et finition premium — pour chaque pièce de votre intérieur.',
    'home.essences.lede': 'Trois bois d\'exception, sélectionnés dans des forêts gérées durablement, pour répondre à chaque usage.',
    'home.iroko.desc':    'L\'Iroko est un bois noble très résistant à l\'humidité et aux termites. Idéal pour les portes extérieures et le mobilier durable.',
    'home.framire.desc':  'Le Framiré est apprécié pour son élégance et sa légèreté. Il convient parfaitement aux portes intérieures et aux meubles modernes.',
    'home.teck.desc':     'Le Teck est reconnu mondialement pour sa résistance exceptionnelle à l\'eau et au temps. Le bois d\'extérieur par excellence.',
    'home.collection.lede': 'Quatre créations qui résument notre approche : matières nobles, lignes pures, exécution irréprochable.',
    'home.collection.cta': 'Voir toute la collection',
    'home.complement.title': 'Au-delà de la fabrication',
    'home.complement.lede': 'De la première esquisse à la pose finale — nous vous accompagnons sur l\'ensemble du projet.',
    'home.pillar1.title':  'La qualité du bois',
    'home.pillar1.desc':   'Iroko, Framiré, Teck — sélectionnés sur pied auprès de scieries partenaires en Côte d\'Ivoire, et séchés avec patience avant transformation.',
    'home.pillar2.title':  'La précision des finitions',
    'home.pillar2.desc':   'Assemblages traditionnels, ponçages soignés, vernissage et huilage à la main : chaque détail est repris jusqu\'à la perfection.',
    'home.pillar3.title':  'La satisfaction de nos clients',
    'home.pillar3.desc':   'Écoute, conseils, accompagnement et service après-vente — votre projet est suivi par un interlocuteur unique de bout en bout.',
    'home.cta.contact':    'Nous contacter',
    'home.cta.shop':       'Voir la boutique',
    'home.newsletter.title': 'Restons en contact',
    'home.newsletter.lede':  'Recevez en avant-première les nouvelles créations, les ouvertures d\'atelier et nos histoires de bois.',
    'home.newsletter.placeholder': 'Votre adresse e-mail',
    'home.newsletter.cta':   'S\'inscrire',

    /* ATELIER / Apropos */
    'atelier.story.eyebrow': 'Genèse',
    'atelier.story.title':   'Une histoire de bois et de mains.',
    'atelier.story.p1':      'HOME BY TIKA est né en Côte d\'Ivoire d\'une conviction simple : les essences locales — Iroko, Framiré, Teck — comptent parmi les bois les plus nobles du monde. Bien sélectionnés, bien travaillés, ils produisent du mobilier et des portes qui durent des générations.',
    'atelier.story.p2':      'Notre atelier, installé à Abidjan, fabrique chaque pièce de A à Z : choix de la grume, séchage, taille, assemblages traditionnels, ponçage, vernissage et finition. Aucun élément n\'est sous-traité, aucun panneau d\'aggloméré n\'entre dans nos productions.',
    'atelier.method.title':  'Du tronc à la pièce finie',
    'atelier.method.s1.title': 'Sélection',
    'atelier.method.s1.desc':  'Sur pied auprès de scieries ivoiriennes partenaires. Iroko, Framiré, Teck — gérés durablement.',
    'atelier.method.s2.title': 'Séchage',
    'atelier.method.s2.desc':  'Séchage naturel de longue durée puis stabilisation contrôlée. Un bois bien sec ne travaille plus.',
    'atelier.method.s3.title': 'Façonnage',
    'atelier.method.s3.desc':  'Assemblages traditionnels (tenons, mortaises, queues d\'aronde), vernissage et huilage à la main.',

    /* CONTACT */
    'contact.subtitle.alt': 'Notre équipe vous répond rapidement par WhatsApp, email ou téléphone.',
    'contact.label.name':   'Votre nom *',
    'contact.label.phone':  'Téléphone',
    'contact.label.email':  'Email *',
    'contact.label.subject':'Sujet',
    'contact.label.message':'Votre projet, vos questions',
    'contact.placeholder.name': 'Nom complet',
    'contact.placeholder.phone':'+225 …',
    'contact.placeholder.email':'vous@exemple.com',
    'contact.placeholder.subject':'Sur-mesure, devis, information…',
    'contact.placeholder.message':'Décrivez votre projet en quelques lignes',

    /* LOCALISATION */
    'locate.title':      'Notre localisation',
    'locate.eyebrow':    'Atelier d\'Abidjan',
    'locate.subtitle':   'Songon, Cité la Grâce — Abidjan, Côte d\'Ivoire. Visite sur rendez-vous.',
    'locate.cta.share':  '📍 Partager mon emplacement par WhatsApp',
    'locate.cta.maps':   'Itinéraire Google Maps',

    /* PANIER (textes hardcoded) */
    'cart.empty.desc':   'Aucune pièce sélectionnée pour le moment.',
    'cart.summary.title':'Récapitulatif',
    'cart.payment.note': 'Mobile Money & virement acceptés · Paiement après confirmation',
    'cart.cancel.title': 'Annulation ou modification',
    'cart.cancel.note':  'Pour toute annulation ou modification, contactez HOME BY TIKA en mentionnant votre numéro de commande.',

    /* SUIVI commande */
    'tracking.cancelled':'Cette commande a été annulée. Contactez-nous sur WhatsApp pour plus d\'informations.',
    'tracking.message.title': 'Message de l\'atelier',
    'tracking.cancel.title':  'Annulation ou modification',
    'tracking.cancel.note':   'Pour toute annulation ou modification, contactez HOME BY TIKA en mentionnant votre numéro de commande',

    /* DEVIS PUBLIC */
    'devis.loading':     'Chargement de votre devis…',
    'devis.loading.sub': 'Un instant, nous récupérons les informations.',
    'devis.notfound':    'Devis introuvable',
    'devis.notfound.detail': 'Aucun devis trouvé avec cette référence. Vérifiez votre lien ou contactez-nous.',
    'devis.back':        '← Retour au site',
    'devis.download':    'Télécharger PDF',
    'devis.print':       'Imprimer',
    'devis.contact':     'WhatsApp HOME BY TIKA',

    /* SHOWROOM */
    'showroom.title':         'Découvrez notre showroom',
    'showroom.eyebrow':       'Notre espace physique',
    'showroom.subtitle':      'Explorez nos pièces exposées et l\'ambiance HOME BY TIKA.',
    'showroom.intro.title':   'Un lieu pensé pour révéler le bois',
    'showroom.intro.lede':    'Notre showroom à Songon présente nos plus belles créations en taille réelle — portes massives, salons sculptés, tables de famille, serrurerie en laiton. Touchez les essences, ressentez les finitions, imaginez vos pièces chez vous.',
    'showroom.tour.title':    'Visite du showroom',
    'showroom.tour.lede':     'Glissez horizontalement pour parcourir l\'espace.',
    'showroom.book':          'Prendre rendez-vous',
    'showroom.book.lede':     'Notre équipe vous accueille du lundi au samedi. La visite se fait sur rendez-vous pour vous garantir une attention personnalisée.',
    'showroom.cta.book':      'Réserver une visite',
    'showroom.cta.wa':        'WhatsApp HOME BY TIKA',
    'showroom.cta.call':      'Appeler HOME BY TIKA',
    'showroom.empty':         'Les photos du showroom seront bientôt disponibles. Suivez-nous sur WhatsApp pour être informé.',
    'showroom.address.label': 'Adresse',
    'showroom.address':       'Songon, Cité la Grâce — Abidjan, Côte d\'Ivoire',
    'showroom.hours.label':   'Horaires',
    'showroom.hours':         'Lundi → Samedi, 9h → 18h · Sur rendez-vous'
  },

  /* ============ ENGLISH ============ */
  en: {
    'nav.home':      'Home',
    'nav.shop':      'Shop',
    'nav.gallery':   'Gallery',
    'nav.workshop':  'Workshop',
    'nav.contact':   'Contact',
    'nav.locate':    'Location',
    'nav.tracking':  'Order tracking',
    'nav.showroom':  'Showroom',
    'nav.cart':      'Cart',

    'hero.eyebrow':  'Ivorian cabinetmaking atelier',
    'hero.title':    'Solid wood, the soul of your home.',
    'hero.title1':   'Solid ',
    'hero.title2':   'wood',
    'hero.title3':   ', the soul of your home.',
    'hero.lede':     'Welcome to HOME BY TIKA — specialists in solid wood furniture and premium doors in Côte d\'Ivoire. We transform the finest local timbers — Iroko, Framiré, Teak — into bold, elegant, lasting creations.',
    'hero.cta1':     'Discover the collection',
    'hero.cta2':     'Request a quote',

    'services.eyebrow':  'Our services',
    'services.title':    'Bespoke doors & furniture',
    'services.lede':     'For homes, villas, offices and hotels — one craftsmanship, two worlds.',
    'services.doors':    'Solid wood doors',
    'services.furniture':'Wood furniture',
    'essences.eyebrow':  'Woods of Côte d\'Ivoire',
    'essences.title':    'Noble timbers, hand-selected',
    'collection.eyebrow':'Atelier selection',
    'collection.title':  'Signature pieces',
    'engagement.eyebrow':'Our commitment',
    'engagement.title':  'Three principles, no compromise.',
    'cta.title1':        'A ',
    'cta.title2':        'unique creation',
    'cta.title3':        ', in your image.',
    'cta.lede':          'Contact us today to bring your solid wood projects to life.',

    'shop.title':        'The shop',
    'shop.eyebrow':      'Collection',
    'shop.subtitle':     'Solid wood furniture and doors, handcrafted in our Abidjan atelier. Iroko, Framiré and Teak — each piece is available as-is or customizable on request.',
    'shop.all':          'All',
    'shop.add':          'Add',
    'shop.devis':        'Quote',
    'shop.loading':      'Loading collections…',
    'shop.loading.sub':  'Preparing the atelier pieces',
    'shop.filter.serrures': 'Locks & hardware',
    'shop.empty':        'No products in this category',
    'shop.sur_mesure.title': 'A unique piece for you?',
    'shop.sur_mesure.lede':  'Dimensions, wood (Iroko, Framiré, Teak), finish: we craft your furniture or door to your plans, constraints and interior.',
    'shop.sur_mesure.cta':   'Request a quote',

    'gallery.title':     'The gallery',
    'gallery.eyebrow':   'Our creations',
    'gallery.subtitle':  'Doors, furniture, atelier moments, collections — a glimpse of our Ivorian craftsmanship. New photos appear automatically.',
    'gallery.tab.portes': 'Doors',
    'gallery.tab.mobilier': 'Furniture',
    'gallery.tab.atelier': 'Atelier',
    'gallery.tab.collections': 'Collections',
    'gallery.tab.serrures': 'Locks',
    'gallery.tab.videos': 'Videos',
    'gallery.empty':     'No media in this section',

    'workshop.title':    'The Atelier',
    'workshop.eyebrow':  'Our house',
    'workshop.subtitle': 'Patient craftsmanship, one simple demand: that each piece spans generations.',

    'contact.eyebrow':   'Let\'s discuss your project',
    'contact.subtitle':  'Our team replies quickly via WhatsApp, email or phone.',
    'contact.form.name': 'Full name',
    'contact.form.phone': 'Phone',
    'contact.form.email': 'Email',
    'contact.form.message': 'Your message',
    'contact.form.submit': 'Send message',

    'cart.title':        'Your cart',
    'cart.eyebrow':      'Summary',
    'cart.subtitle':     'Review your selection before placing your order. Free delivery & installation on Abidjan orders over 1,500,000 FCFA.',
    'cart.empty':        'Your cart is empty',
    'cart.empty.cta':    'Discover the collection',
    'cart.subtotal':     'Subtotal',
    'cart.shipping':     'Delivery & installation',
    'cart.shipping.free':'Free',
    'cart.total':        'Total',
    'cart.checkout':     'Place order',
    'cart.location':     'Share my location',
    'cart.checkout.title': 'Place my order',
    'cart.checkout.lede': 'Enter your details. We will contact you shortly via WhatsApp to confirm payment and delivery.',
    'cart.form.name':    'Full name',
    'cart.form.phone':   'Phone',
    'cart.form.email':   'Email',
    'cart.form.address': 'Delivery address',
    'cart.form.notes':   'Notes (optional)',
    'cart.form.submit':  'Confirm my order',
    'cart.success.title': 'Your order has been received',
    'cart.success.body': 'HOME BY TIKA will contact you to confirm payment, delivery and installation.',
    'cart.success.ref':  'Your tracking number',
    'cart.success.track': 'Track my order',
    'cart.success.wa':   'WhatsApp HOME BY TIKA',
    'cart.success.call': 'Call HOME BY TIKA',
    'cart.success.shop': 'Back to the shop',

    'tracking.title':    'Order tracking',
    'tracking.eyebrow':  'Online tracking',
    'tracking.subtitle': 'Enter your order number to follow its progress from any device.',
    'tracking.placeholder':'Enter your order number (e.g. HBT-2605-AB12)',
    'tracking.search':   'Track my order',
    'tracking.refresh':  '↻ Refresh tracking',
    'tracking.notfound': 'No order found',
    'tracking.progress': 'Progress',
    'tracking.lastupdate': 'Last update',
    'tracking.contact':  'Have a question about your order?',
    'tracking.contact.btn': 'Contact us',

    'quote.title':       'Request a quote',
    'quote.lede':        'Fill in the form — we\'ll get back to you within 24h with a personalized quote.',
    'quote.form.name':   'Full name *',
    'quote.form.phone':  'Phone *',
    'quote.form.email':  'Email (optional)',
    'quote.form.location':'Country / City',
    'quote.form.product':'Product',
    'quote.form.dimensions':'Desired dimensions',
    'quote.form.wood':   'Preferred wood',
    'quote.form.budget': 'Estimated budget (FCFA)',
    'quote.form.message':'Your message',
    'quote.form.contact':'Preferred reception method',
    'quote.submit':      'Send my request',
    'quote.wa':          'Continue on WhatsApp',
    'quote.success.title':'Request sent!',
    'quote.success.body':'Our team will get back to you within 24h on WhatsApp to finalize your project.',

    'contact.title':     'Contact & bespoke',
    'contact.write':     'Write to the atelier',
    'contact.whatsapp':  'Chat on WhatsApp',

    'common.send':       'Send',
    'common.loading':    'Loading…',
    'common.search':     'Search',
    'common.required':   'Required fields *',
    'common.cancel':     'Cancel',
    'common.back':       'Back',
    'footer.rights':     'All rights reserved',

    'home.services.doors.desc': 'We craft bespoke solid wood doors for homes, villas, offices and hotels. Every opening is built to last.',
    'home.services.furniture.desc': 'We design artisanal and modern furniture combining aesthetics, sturdiness and premium finishes — for every room in your home.',
    'home.essences.lede': 'Three exceptional woods, sourced from sustainably managed forests, for every use.',
    'home.iroko.desc':    'Iroko is a noble timber, highly resistant to moisture and termites. Ideal for exterior doors and durable furniture.',
    'home.framire.desc':  'Framiré is prized for its elegance and lightness. Perfectly suited to interior doors and modern furniture.',
    'home.teck.desc':     'Teak is world-renowned for its exceptional resistance to water and time. The outdoor wood par excellence.',
    'home.collection.lede': 'Four creations that capture our approach: noble materials, pure lines, impeccable execution.',
    'home.collection.cta': 'View the full collection',
    'home.complement.title': 'Beyond craftsmanship',
    'home.complement.lede': 'From the first sketch to the final installation — we support you throughout the entire project.',
    'home.pillar1.title':  'Quality of wood',
    'home.pillar1.desc':   'Iroko, Framiré, Teak — selected on the stump from our partner Ivorian sawmills, and patiently dried before transformation.',
    'home.pillar2.title':  'Precision finishes',
    'home.pillar2.desc':   'Traditional joinery, meticulous sanding, hand-applied varnish and oil: every detail is refined to perfection.',
    'home.pillar3.title':  'Customer satisfaction',
    'home.pillar3.desc':   'Listening, advice, support and aftersales service — your project is followed by a single dedicated contact from start to finish.',
    'home.cta.contact':    'Contact us',
    'home.cta.shop':       'Visit the shop',
    'home.newsletter.title': 'Stay in touch',
    'home.newsletter.lede':  'Receive new creations, atelier openings and our wood stories in advance.',
    'home.newsletter.placeholder': 'Your email address',
    'home.newsletter.cta':   'Subscribe',

    'atelier.story.eyebrow': 'Origins',
    'atelier.story.title':   'A story of wood and hands.',
    'atelier.story.p1':      'HOME BY TIKA was born in Côte d\'Ivoire from a simple conviction: local woods — Iroko, Framiré, Teak — are among the noblest in the world. Carefully selected and crafted, they yield furniture and doors that last generations.',
    'atelier.story.p2':      'Our atelier in Abidjan handcrafts every piece from A to Z: timber selection, drying, cutting, traditional joinery, sanding, varnish and finish. Nothing is outsourced, no chipboard ever enters our production.',
    'atelier.method.title':  'From tree to finished piece',
    'atelier.method.s1.title': 'Selection',
    'atelier.method.s1.desc':  'On the stump from our partner Ivorian sawmills. Iroko, Framiré, Teak — sustainably managed.',
    'atelier.method.s2.title': 'Drying',
    'atelier.method.s2.desc':  'Long natural drying then controlled stabilization. Well-dried wood no longer moves.',
    'atelier.method.s3.title': 'Crafting',
    'atelier.method.s3.desc':  'Traditional joinery (tenons, mortises, dovetails), hand-applied varnish and oiling.',

    'contact.subtitle.alt': 'Our team replies quickly via WhatsApp, email or phone.',
    'contact.label.name':   'Your name *',
    'contact.label.phone':  'Phone',
    'contact.label.email':  'Email *',
    'contact.label.subject':'Subject',
    'contact.label.message':'Your project, your questions',
    'contact.placeholder.name': 'Full name',
    'contact.placeholder.phone':'+225 …',
    'contact.placeholder.email':'you@example.com',
    'contact.placeholder.subject':'Bespoke, quote, information…',
    'contact.placeholder.message':'Describe your project in a few lines',

    'locate.title':      'Our location',
    'locate.eyebrow':    'Abidjan atelier',
    'locate.subtitle':   'Songon, Cité la Grâce — Abidjan, Côte d\'Ivoire. Visit by appointment.',
    'locate.cta.share':  '📍 Share my location via WhatsApp',
    'locate.cta.maps':   'Google Maps directions',

    'cart.empty.desc':   'No piece selected yet.',
    'cart.summary.title':'Summary',
    'cart.payment.note': 'Mobile Money & bank transfer accepted · Payment after confirmation',
    'cart.cancel.title': 'Cancellation or modification',
    'cart.cancel.note':  'For any cancellation or modification, please contact HOME BY TIKA mentioning your order number.',

    'tracking.cancelled':'This order has been cancelled. Contact us on WhatsApp for more information.',
    'tracking.message.title': 'Message from the atelier',
    'tracking.cancel.title':  'Cancellation or modification',
    'tracking.cancel.note':   'For any cancellation or modification, please contact HOME BY TIKA mentioning your order number',

    'devis.loading':     'Loading your quote…',
    'devis.loading.sub': 'One moment, we are fetching the information.',
    'devis.notfound':    'Quote not found',
    'devis.notfound.detail': 'No quote found with this reference. Check your link or contact us.',
    'devis.back':        '← Back to the site',
    'devis.download':    'Download PDF',
    'devis.print':       'Print',
    'devis.contact':     'WhatsApp HOME BY TIKA',

    'showroom.title':         'Discover our showroom',
    'showroom.eyebrow':       'Our physical space',
    'showroom.subtitle':      'Explore our displayed pieces and the HOME BY TIKA atmosphere.',
    'showroom.intro.title':   'A space designed to reveal wood',
    'showroom.intro.lede':    'Our showroom in Songon displays our finest creations life-size — solid doors, sculpted lounges, family tables, brass hardware. Touch the woods, feel the finishes, imagine your pieces at home.',
    'showroom.tour.title':    'Showroom tour',
    'showroom.tour.lede':     'Slide horizontally to explore the space.',
    'showroom.book':          'Book a visit',
    'showroom.book.lede':     'Our team welcomes you Monday to Saturday. Visits are by appointment to ensure dedicated attention.',
    'showroom.cta.book':      'Book a visit',
    'showroom.cta.wa':        'WhatsApp HOME BY TIKA',
    'showroom.cta.call':      'Call HOME BY TIKA',
    'showroom.empty':         'Showroom photos will be available shortly. Follow us on WhatsApp to be notified.',
    'showroom.address.label': 'Address',
    'showroom.address':       'Songon, Cité la Grâce — Abidjan, Côte d\'Ivoire',
    'showroom.hours.label':   'Opening hours',
    'showroom.hours':         'Monday → Saturday, 9am → 6pm · By appointment'
  },

  /* ============ ESPAÑOL ============ */
  es: {
    'nav.home':      'Inicio',
    'nav.shop':      'Tienda',
    'nav.gallery':   'Galería',
    'nav.workshop':  'Taller',
    'nav.contact':   'Contacto',
    'nav.locate':    'Ubicación',
    'nav.tracking':  'Seguimiento',
    'nav.showroom':  'Showroom',
    'nav.cart':      'Cesta',

    'hero.eyebrow':  'Taller marfileño de ebanistería',
    'hero.title':    'La madera maciza, el alma de tu hogar.',
    'hero.title1':   'La madera ',
    'hero.title2':   'maciza',
    'hero.title3':   ', el alma de tu hogar.',
    'hero.lede':     'Bienvenido a HOME BY TIKA — especialistas en mobiliario de madera maciza y puertas de alta gama en Costa de Marfil. Transformamos las mejores maderas locales — Iroko, Framiré, Teca — en creaciones sólidas, elegantes y duraderas.',
    'hero.cta1':     'Descubrir la colección',
    'hero.cta2':     'Solicitar presupuesto',

    'services.eyebrow':  'Nuestros servicios',
    'services.title':    'Puertas y mobiliario a medida',
    'services.lede':     'Para casas, villas, oficinas y hoteles — una artesanía, dos universos.',
    'services.doors':    'Puertas de madera maciza',
    'services.furniture':'Mobiliario en madera',
    'essences.eyebrow':  'Maderas de Costa de Marfil',
    'essences.title':    'Esencias nobles, escogidas una a una',
    'collection.eyebrow':'Selección del taller',
    'collection.title':  'Piezas emblemáticas',
    'engagement.eyebrow':'Nuestro compromiso',
    'engagement.title':  'Tres principios, sin concesiones.',
    'cta.title1':        'Una ',
    'cta.title2':        'creación única',
    'cta.title3':        ', a tu imagen.',
    'cta.lede':          'Contáctanos hoy para dar vida a tus proyectos en madera maciza.',

    'shop.title':        'La tienda',
    'shop.eyebrow':      'Colección',
    'shop.subtitle':     'Mobiliario y puertas de madera maciza, hechos a mano en nuestro taller de Abidjan. Iroko, Framiré y Teca — cada pieza está disponible o personalizable bajo pedido.',
    'shop.all':          'Todo',
    'shop.add':          'Añadir',
    'shop.devis':        'Presupuesto',
    'shop.loading':      'Cargando las colecciones…',
    'shop.loading.sub':  'Preparando las piezas del taller',
    'shop.filter.serrures': 'Cerraduras y accesorios',
    'shop.empty':        'Ningún producto en esta categoría',
    'shop.sur_mesure.title': '¿Una pieza única para usted?',
    'shop.sur_mesure.lede':  'Dimensiones, madera (Iroko, Framiré, Teca), acabado: fabricamos su mueble o su puerta según sus planos, restricciones e interior.',
    'shop.sur_mesure.cta':   'Solicitar presupuesto',

    'gallery.title':     'La galería',
    'gallery.eyebrow':   'Nuestras realizaciones',
    'gallery.subtitle':  'Puertas, mobiliario, ambientes del taller, colecciones — un vistazo de nuestra artesanía marfileña. Las nuevas fotos aparecen automáticamente.',
    'gallery.tab.portes': 'Puertas',
    'gallery.tab.mobilier': 'Mobiliario',
    'gallery.tab.atelier': 'Taller',
    'gallery.tab.collections': 'Colecciones',
    'gallery.tab.serrures': 'Cerraduras',
    'gallery.tab.videos': 'Vídeos',
    'gallery.empty':     'Ningún medio en esta sección',

    'workshop.title':    'El Taller',
    'workshop.eyebrow':  'Nuestra casa',
    'workshop.subtitle': 'Una artesanía paciente, una exigencia simple : que cada pieza atraviese las generaciones.',

    'contact.eyebrow':   'Hablemos de tu proyecto',
    'contact.subtitle':  'Nuestro equipo responde rápido por WhatsApp, email o teléfono.',
    'contact.form.name': 'Nombre completo',
    'contact.form.phone': 'Teléfono',
    'contact.form.email': 'Email',
    'contact.form.message': 'Tu mensaje',
    'contact.form.submit': 'Enviar mensaje',

    'cart.title':        'Tu cesta',
    'cart.eyebrow':      'Resumen',
    'cart.subtitle':     'Revisa tu selección antes de finalizar tu pedido. Entrega e instalación gratis a partir de 1 500 000 FCFA de compra en Abidjan.',
    'cart.empty':        'Tu cesta está vacía',
    'cart.empty.cta':    'Descubrir la colección',
    'cart.subtotal':     'Subtotal',
    'cart.shipping':     'Entrega e instalación',
    'cart.shipping.free':'Gratis',
    'cart.total':        'Total',
    'cart.checkout':     'Finalizar pedido',
    'cart.location':     'Compartir mi ubicación',
    'cart.checkout.title': 'Finalizar mi pedido',
    'cart.checkout.lede': 'Introduce tus datos. Te contactaremos rápidamente por WhatsApp para confirmar el pago y la entrega.',
    'cart.form.name':    'Nombre completo',
    'cart.form.phone':   'Teléfono',
    'cart.form.email':   'Email',
    'cart.form.address': 'Dirección de entrega',
    'cart.form.notes':   'Notas (opcional)',
    'cart.form.submit':  'Confirmar mi pedido',
    'cart.success.title': 'Tu pedido ha sido recibido',
    'cart.success.body': 'HOME BY TIKA te contactará para confirmar el pago, la entrega y la instalación.',
    'cart.success.ref':  'Tu número de seguimiento',
    'cart.success.track': 'Seguir mi pedido',
    'cart.success.wa':   'WhatsApp HOME BY TIKA',
    'cart.success.call': 'Llamar a HOME BY TIKA',
    'cart.success.shop': 'Volver a la tienda',

    'tracking.title':    'Seguimiento del pedido',
    'tracking.eyebrow':  'Seguimiento en línea',
    'tracking.subtitle': 'Introduce tu número de pedido para seguir su evolución desde cualquier dispositivo.',
    'tracking.placeholder':'Introduce tu número de pedido (ej. HBT-2605-AB12)',
    'tracking.search':   'Seguir mi pedido',
    'tracking.refresh':  '↻ Actualizar seguimiento',
    'tracking.notfound': 'Ningún pedido encontrado',
    'tracking.progress': 'Progreso',
    'tracking.lastupdate': 'Última actualización',
    'tracking.contact':  '¿Una pregunta sobre tu pedido?',
    'tracking.contact.btn': 'Contáctanos',

    'quote.title':       'Solicitar un presupuesto',
    'quote.lede':        'Rellena el formulario — te respondemos en 24h con un presupuesto personalizado.',
    'quote.form.name':   'Nombre completo *',
    'quote.form.phone':  'Teléfono *',
    'quote.form.email':  'Email (opcional)',
    'quote.form.location':'País / Ciudad',
    'quote.form.product':'Producto',
    'quote.form.dimensions':'Dimensiones deseadas',
    'quote.form.wood':   'Madera preferida',
    'quote.form.budget': 'Presupuesto estimado (FCFA)',
    'quote.form.message':'Tu mensaje',
    'quote.form.contact':'Modo de recepción preferido',
    'quote.submit':      'Enviar mi solicitud',
    'quote.wa':          'Continuar en WhatsApp',
    'quote.success.title':'¡Solicitud enviada!',
    'quote.success.body':'Nuestro equipo te responde en 24h por WhatsApp para finalizar tu proyecto.',

    'contact.title':     'Contacto y a medida',
    'contact.write':     'Escribir al taller',
    'contact.whatsapp':  'Chatear por WhatsApp',

    'common.send':       'Enviar',
    'common.loading':    'Cargando…',
    'common.search':     'Buscar',
    'common.required':   'Campos obligatorios *',
    'common.cancel':     'Cancelar',
    'common.back':       'Volver',
    'footer.rights':     'Todos los derechos reservados',

    'home.services.doors.desc': 'Fabricamos puertas a medida en madera maciza para casas, villas, oficinas y hoteles. Cada apertura está diseñada para durar.',
    'home.services.furniture.desc': 'Creamos mobiliario artesanal y moderno que combina estética, robustez y acabados premium — para cada estancia de su hogar.',
    'home.essences.lede': 'Tres maderas excepcionales, seleccionadas en bosques gestionados de forma sostenible, para cada uso.',
    'home.iroko.desc':    'El Iroko es una madera noble muy resistente a la humedad y a las termitas. Ideal para puertas exteriores y mobiliario duradero.',
    'home.framire.desc':  'El Framiré es apreciado por su elegancia y ligereza. Perfecto para puertas interiores y mobiliario moderno.',
    'home.teck.desc':     'La Teca es mundialmente reconocida por su resistencia excepcional al agua y al tiempo. La madera de exterior por excelencia.',
    'home.collection.lede': 'Cuatro creaciones que resumen nuestro enfoque: materiales nobles, líneas puras, ejecución impecable.',
    'home.collection.cta': 'Ver toda la colección',
    'home.complement.title': 'Más allá de la fabricación',
    'home.complement.lede': 'Desde el primer boceto hasta la instalación final — le acompañamos en todo el proyecto.',
    'home.pillar1.title':  'La calidad de la madera',
    'home.pillar1.desc':   'Iroko, Framiré, Teca — seleccionados en pie de aserraderos asociados en Costa de Marfil, y secados con paciencia antes de la transformación.',
    'home.pillar2.title':  'La precisión de los acabados',
    'home.pillar2.desc':   'Ensambles tradicionales, lijados meticulosos, barniz y aceitado a mano: cada detalle se perfecciona hasta la perfección.',
    'home.pillar3.title':  'La satisfacción de nuestros clientes',
    'home.pillar3.desc':   'Escucha, consejos, acompañamiento y servicio postventa — su proyecto es seguido por un único interlocutor de principio a fin.',
    'home.cta.contact':    'Contáctanos',
    'home.cta.shop':       'Ver la tienda',
    'home.newsletter.title': 'Mantengámonos en contacto',
    'home.newsletter.lede':  'Reciba en primicia las nuevas creaciones, las aperturas del taller y nuestras historias de madera.',
    'home.newsletter.placeholder': 'Su correo electrónico',
    'home.newsletter.cta':   'Suscribirse',

    'atelier.story.eyebrow': 'Génesis',
    'atelier.story.title':   'Una historia de madera y manos.',
    'atelier.story.p1':      'HOME BY TIKA nació en Costa de Marfil de una convicción simple: las maderas locales — Iroko, Framiré, Teca — están entre las más nobles del mundo. Bien seleccionadas y trabajadas, producen mobiliario y puertas que duran generaciones.',
    'atelier.story.p2':      'Nuestro taller en Abiyán fabrica cada pieza de A a Z: elección del tronco, secado, corte, ensambles tradicionales, lijado, barniz y acabado. Nada se subcontrata, ningún aglomerado entra en nuestras producciones.',
    'atelier.method.title':  'Del tronco a la pieza terminada',
    'atelier.method.s1.title': 'Selección',
    'atelier.method.s1.desc':  'En pie de aserraderos marfileños asociados. Iroko, Framiré, Teca — gestionados de forma sostenible.',
    'atelier.method.s2.title': 'Secado',
    'atelier.method.s2.desc':  'Secado natural de larga duración y luego estabilización controlada. Una madera bien seca ya no trabaja.',
    'atelier.method.s3.title': 'Talla',
    'atelier.method.s3.desc':  'Ensambles tradicionales (espigas, mortajas, colas de milano), barniz y aceitado a mano.',

    'contact.subtitle.alt': 'Nuestro equipo responde rápido por WhatsApp, email o teléfono.',
    'contact.label.name':   'Tu nombre *',
    'contact.label.phone':  'Teléfono',
    'contact.label.email':  'Email *',
    'contact.label.subject':'Asunto',
    'contact.label.message':'Tu proyecto, tus preguntas',
    'contact.placeholder.name': 'Nombre completo',
    'contact.placeholder.phone':'+225 …',
    'contact.placeholder.email':'tu@ejemplo.com',
    'contact.placeholder.subject':'A medida, presupuesto, información…',
    'contact.placeholder.message':'Describe tu proyecto en pocas líneas',

    'locate.title':      'Nuestra ubicación',
    'locate.eyebrow':    'Taller de Abiyán',
    'locate.subtitle':   'Songon, Cité la Grâce — Abiyán, Costa de Marfil. Visita con cita previa.',
    'locate.cta.share':  '📍 Compartir mi ubicación por WhatsApp',
    'locate.cta.maps':   'Ruta Google Maps',

    'cart.empty.desc':   'Ninguna pieza seleccionada por el momento.',
    'cart.summary.title':'Resumen',
    'cart.payment.note': 'Mobile Money y transferencia aceptados · Pago tras confirmación',
    'cart.cancel.title': 'Cancelación o modificación',
    'cart.cancel.note':  'Para cualquier cancelación o modificación, contacte HOME BY TIKA mencionando su número de pedido.',

    'tracking.cancelled':'Este pedido ha sido cancelado. Contáctanos por WhatsApp para más información.',
    'tracking.message.title': 'Mensaje del taller',
    'tracking.cancel.title':  'Cancelación o modificación',
    'tracking.cancel.note':   'Para cualquier cancelación o modificación, contacte HOME BY TIKA mencionando su número de pedido',

    'devis.loading':     'Cargando su presupuesto…',
    'devis.loading.sub': 'Un momento, recuperamos la información.',
    'devis.notfound':    'Presupuesto no encontrado',
    'devis.notfound.detail': 'Ningún presupuesto encontrado con esta referencia. Verifique su enlace o contáctenos.',
    'devis.back':        '← Volver al sitio',
    'devis.download':    'Descargar PDF',
    'devis.print':       'Imprimir',
    'devis.contact':     'WhatsApp HOME BY TIKA',

    'showroom.title':         'Descubra nuestro showroom',
    'showroom.eyebrow':       'Nuestro espacio físico',
    'showroom.subtitle':      'Explore nuestras piezas expuestas y el ambiente HOME BY TIKA.',
    'showroom.intro.title':   'Un lugar pensado para revelar la madera',
    'showroom.intro.lede':    'Nuestro showroom en Songon presenta nuestras mejores creaciones a tamaño real — puertas macizas, salones esculpidos, mesas de familia, herrajes de latón. Toque las maderas, sienta los acabados, imagine sus piezas en casa.',
    'showroom.tour.title':    'Visita del showroom',
    'showroom.tour.lede':     'Deslice horizontalmente para recorrer el espacio.',
    'showroom.book':          'Reservar una visita',
    'showroom.book.lede':     'Nuestro equipo le recibe de lunes a sábado. La visita se realiza con cita previa para garantizarle una atención personalizada.',
    'showroom.cta.book':      'Reservar una visita',
    'showroom.cta.wa':        'WhatsApp HOME BY TIKA',
    'showroom.cta.call':      'Llamar a HOME BY TIKA',
    'showroom.empty':         'Las fotos del showroom estarán disponibles próximamente. Síganos por WhatsApp para estar informado.',
    'showroom.address.label': 'Dirección',
    'showroom.address':       'Songon, Cité la Grâce — Abiyán, Costa de Marfil',
    'showroom.hours.label':   'Horarios',
    'showroom.hours':         'Lunes → Sábado, 9h → 18h · Con cita previa'
  }
};

/* =========== MOTEUR i18n =========== */
window.HBT_LANG_KEY = 'hbt-lang';

window.t = function (key) {
  const lang = (localStorage.getItem(window.HBT_LANG_KEY) || 'fr');
  const dict = window.HBT_I18N[lang] || window.HBT_I18N.fr;
  return (dict[key] !== undefined) ? dict[key] : (window.HBT_I18N.fr[key] || key);
};

window.applyTranslations = function (root) {
  root = root || document;
  const lang = (localStorage.getItem(window.HBT_LANG_KEY) || 'fr');
  document.documentElement.lang = lang;

  /* Texte simple via data-i18n="cle" */
  root.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = window.t(key);
  });

  /* Attributs : data-i18n-attr="placeholder:form.email|title:tooltip.help" */
  root.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const spec = el.getAttribute('data-i18n-attr') || '';
    spec.split('|').forEach(pair => {
      const [attr, key] = pair.split(':').map(s => s.trim());
      if (attr && key) el.setAttribute(attr, window.t(key));
    });
  });

  /* Met à jour le sélecteur visuel s'il existe */
  document.querySelectorAll('.lang-switch [data-lang]').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
};

window.setLanguage = function (lang) {
  if (!window.HBT_I18N[lang]) return;
  localStorage.setItem(window.HBT_LANG_KEY, lang);
  window.applyTranslations();
};

/* Injecte un sélecteur FR | EN | ES dans le header */
window.injectLanguageSwitch = function () {
  if (document.querySelector('.lang-switch')) return;
  const actions = document.querySelector('.nav-actions');
  if (!actions) return;
  const cur = (localStorage.getItem(window.HBT_LANG_KEY) || 'fr');

  const wrap = document.createElement('div');
  wrap.className = 'lang-switch';
  wrap.innerHTML = ['fr', 'en', 'es'].map(l =>
    '<button type="button" data-lang="' + l + '" class="' + (l === cur ? 'active' : '') + '">' + l.toUpperCase() + '</button>'
  ).join('');
  actions.insertBefore(wrap, actions.firstChild);

  wrap.addEventListener('click', e => {
    const b = e.target.closest('[data-lang]');
    if (b) window.setLanguage(b.dataset.lang);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  window.injectLanguageSwitch();
  window.applyTranslations();
});
