# HOME BY TIKA — v2 (Phase 1→4) — ajout au README

> Ce fichier complète le `README.md` existant. Il documente les nouveautés apportées par les phases 1 à 4 d'amélioration.

## ✨ Nouveautés v2 (résumé)

| Phase | Nom | Détails |
|------|------|---------|
| 1 | Rétablir l'affichage | media-manifest.js v2 pré-rempli, helpers HBT_mediaUrl/Async, placeholders SVG, Netlify Function déplacée |
| 2 | Admin Shopify-like | Onglet "+ Nouveau produit" avec slug/public_id/tags auto + Supabase products |
| 3 | Admin Commandes | Onglet "Commandes" avec liste, recherche, filtre, update statut inline, modal détails |
| 4 | Responsive global | Menu hamburger mobile, touch targets ≥ 44px, object-fit garanti, breakpoints 560/720/900/1600 |

## 🆕 Configuration Supabase v2 — table products

En plus de la table `orders` (README original), il faut maintenant créer la table `products`. Le SQL est dans le fichier **`supabase-schema.sql`** à la racine du projet.

Workflow :
1. Supabase → SQL Editor → New query
2. Copier-coller le contenu de `supabase-schema.sql`
3. Run → vérifier 2 tables créées (orders + products)

## 🆕 Workflow Shopify-like dans l'admin

1. Ouvrir `/admin.html`, entrer le mot de passe
2. Cliquer sur l'onglet **+ Nouveau produit** (en haut de la page)
3. Remplir : nom, catégorie, prix, essence, badge, description
4. **Pendant la saisie, le panneau debug affiche en temps réel** :
   - Slug (généré du nom)
   - Public ID Cloudinary
   - Dossier où l'image sera rangée
   - Tags appliqués
   - Section du site où le produit apparaîtra
5. Glisser ou cliquer pour uploader l'image
6. Cliquer **Publier le produit**

Le système :
- Upload Cloudinary (preset `home_by_tika`) avec public_id + tags + folder auto-générés
- Insert Supabase products avec toutes les métadonnées
- Affichage IMMÉDIAT sur la boutique (et galerie pour les catégories non-produit)
- Pas de push GitHub nécessaire pour ajouter un produit

## 🆕 Gestion des commandes dans l'admin

Onglet **Commandes** (à côté de "+ Nouveau produit") :
- Liste toutes les commandes Supabase (orders table)
- Recherche libre : numéro, nom, téléphone
- Filtre par statut (8 statuts dont Annulé)
- Update statut inline (dropdown → sauvegarde automatique)
- Bouton "Détails" → modal avec articles, historique, lien suivi client
- Indicateur en haut : connecté à Supabase ou mode local

## 🆕 Variables d'environnement Netlify v2

Pour que la **lecture Cloudinary par tag** (auto-découverte) fonctionne, ajouter dans Netlify → Site settings → Environment variables :

```
CLOUDINARY_CLOUD_NAME = dcj4xsp83
CLOUDINARY_API_KEY    = <Cloudinary Dashboard → API Keys>
CLOUDINARY_API_SECRET = <idem, NE JAMAIS METTRE DANS LE CODE>
```

Sans ces variables, la function `/api/cloudinary-assets` retourne une erreur explicite avec un panneau de debug rouge dans la console. Le site reste fonctionnel via le manifeste + Supabase products.

## 🆕 Architecture des fichiers v2

```
home-by-tika-main/
├── index.html                 (inchangé)
├── boutique.html              (script inline mis à jour : async + Supabase + placeholders)
├── galerie.html               (idem)
├── apropos.html               (inchangé)
├── contact.html               (inchangé)
├── panier.html                (inchangé)
├── suivi.html                 (inchangé — déjà excellent)
├── localisation.html          (inchangé)
├── admin.html                 (1 ligne ajoutée : <script src="admin-extras.js">)
├── config.js                  (inchangé)
├── script.js                  (+ ProductService + mobile hamburger menu)
├── media-manifest.js          (RÉÉCRIT v2 : 23 produits + helpers async)
├── i18n.js                    (inchangé)
├── admin-extras.js            (NOUVEAU : onglets Nouveau produit + Commandes)
├── styles.css                 (+ append: placeholders, responsive polish, mobile menu)
├── supabase-schema.sql        (NOUVEAU : SQL à exécuter dans Supabase)
├── netlify.toml               (inchangé)
├── _redirects                 (inchangé)
├── netlify/
│   └── functions/
│       └── cloudinary-assets.js   (DÉPLACÉ ICI — function active)
├── legacy/                    (archives, non utilisées)
│   ├── cloudinary.js          (ancien module)
│   ├── cloudinary-config.js   (ancien)
│   ├── cloudinary-assets.OLD.js (ancienne version de la function)
│   ├── backup-1.zip           (ex-fichier "ziDiBMrD")
│   └── backup-2.zip           (ex-fichier "ziHzDemd")
└── README.md                  (inchangé, ce fichier le complète)
```

## 🆕 Système de fusion 3-niveaux

`HBT_mediaListAsync(category)` fusionne 3 sources :

1. **Manifeste** (`media-manifest.js`) — rétro-compat, les 23 produits historiques
2. **Supabase products** — les produits ajoutés depuis l'admin
3. **Cloudinary par tag** — auto-découverte des médias avec tag `hbt_<catégorie>`

Priorité : manifeste > Supabase > Cloudinary. Dédup par `id`. Aucune duplication.

## 🆕 Convention de nommage automatique

Workflow `{name, category}` → 4 valeurs auto-générées :

```
name     = "Porte Lagune Premium"
category = "portes"
                ↓
slug      = porte-lagune-premium
folder    = home-by-tika/produits/portes
public_id = home-by-tika/produits/portes/porte-lagune-premium
tags      = [hbt_portes, hbt_product, hbt_porte-lagune-premium]
```

L'URL Cloudinary finale (sur la page) inclut auto :
`f_auto, q_auto, w_1200, c_fill, g_auto` → format optimal (WebP/AVIF), qualité adaptative, recadrage intelligent.

## 🆕 Debug discret (console)

Active le debug détaillé en console :
```js
window.HBT_DEBUG_MEDIA = true
```
Puis recharge. Chaque appel à `HBT_mediaUrl` ou `HBT_mediaListAsync` affichera : catégorie, dossier, tag, public_id, URL.

## 🆕 Placeholders élégants

Quand une image Cloudinary n'existe pas (404), le site affiche AUTOMATIQUEMENT un placeholder SVG inline avec :
- Dégradé sable → chocolat (palette HOME BY TIKA)
- Monogramme du produit centré (Playfair Display, 25% de la hauteur)
- Aucune image cassée, aucune icône `🖼` du navigateur

## 🆕 Menu hamburger mobile

Sur écran ≤ 900 px, un bouton hamburger apparaît dans le header (au-dessus du panier). Tap → drawer latéral avec toute la navigation. Tap overlay / Escape / clic sur un lien → fermeture.

Zéro modification HTML nécessaire — le JS dans `script.js` se branche sur le `<header class="site-header"> .nav` existant et clone les `.nav-links`.

## 🚀 Checklist de déploiement v2

- [ ] Push sur GitHub
- [ ] Ouvrir Netlify → Environment variables → ajouter CLOUDINARY_API_KEY + SECRET
- [ ] Supabase SQL Editor → exécuter `supabase-schema.sql`
- [ ] Renseigner `config.js` → `supabase.url` + `supabase.anonKey`
- [ ] Vérifier preset Cloudinary `home_by_tika` : Unsigned, Overwrite ON, Use filename ON
- [ ] Redéployer Netlify (Deploys → Trigger deploy → Clear cache and deploy site)
- [ ] Tester : `/admin.html` → onglet Commandes → la commande de test apparaît ?
- [ ] Tester : `/admin.html` → + Nouveau produit → upload une image test → apparaît sur `/boutique.html` ?
- [ ] Tester sur mobile : hamburger fonctionne ?
