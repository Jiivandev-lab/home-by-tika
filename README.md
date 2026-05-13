# HOME BY TIKA — Site officiel (production)

Atelier ivoirien spécialisé dans le **mobilier et les portes en bois massif** (Iroko, Framiré, Teck) et les **serrures haut de gamme**.

- **Atelier** : Songon, Cité la Grâce — Abidjan, Côte d'Ivoire
- **WhatsApp** : +225 07 48 73 86 71
- **Email** : contact@homebytika.ci

> **Identité visuelle v3** : palette ébène / chocolat / sable premium / ivoire doux.
> Pensée comme une marque de mobilier de luxe internationale, avec un fort ancrage artisanal africain.

---

## 🏗️ Architecture & workflow

```
   GitHub (code)  ─────────►  Netlify (hébergement HTTPS + déploiement auto)
                                    ▲
                                    │  push = redéploiement
                                    │
   Cloudinary (médias)  ──────►  Site live
   (vos photos et vidéos)        (apparition automatique sans toucher au code)
```

**Workflow réel** :
1. **Modifier un texte / un prix** → vous éditez `config.js` ou `script.js` sur GitHub → Netlify redéploie en 30 s.
2. **Ajouter une photo ou vidéo** → upload depuis l'admin (ou directement dans Cloudinary avec le bon tag) → apparaît automatiquement sur le site, sur tous les appareils.

---

## 🔐 SÉCURITÉ (à lire avant publication)

Ce site est conçu pour un **dépôt GitHub public** + hébergement Netlify gratuit. Les bonnes pratiques de sécurité ont été appliquées :

### ✅ Ce qui est sécurisé

- **Le mot de passe admin n'est jamais en clair** dans le code. Seul son **hash SHA-256** est stocké dans `config.js`. Une personne qui lit le code public ne peut pas le retrouver.
- **Aucune clé Cloudinary secrète** dans le code. Les uploads passent par un **« unsigned upload preset »** qui ne permet QUE l'upload (pas de suppression, pas de listing privé).
- **Le mot de passe est demandé à chaque ouverture** de l'admin (pas de session persistante de plusieurs jours).
- **Le lien admin est masqué** sous trois points `•••` discrets dans le pied de page.
- **HTTPS automatique** via Netlify (requis pour la géolocalisation).

### ⚠️ Limites importantes

Le contrôle d'accès à l'admin est **côté client** (JavaScript). Quelqu'un de très technique pourrait théoriquement contourner. Pour un usage en production sérieuse, deux niveaux de protection supplémentaires sont possibles :

1. **Netlify Identity** (gratuit) — vraie authentification serveur. Activer dans Netlify → Identity → Enable.
2. **Restreindre l'upload preset Cloudinary** — n'autoriser que certains domaines (Netlify Identity → activer la liste blanche).

### 🔁 Changer le mot de passe admin

1. Choisissez un nouveau mot de passe (≥ 12 caractères, lettres + chiffres + symboles).
2. Calculez son hash SHA-256 :
   - Online : https://emn178.github.io/online-tools/sha256.html
   - Linux/macOS : `echo -n "MON_MDP" | sha256sum`
   - Windows PowerShell : `Get-FileHash -InputStream ([IO.MemoryStream]::new([Text.Encoding]::UTF8.GetBytes("MON_MDP"))) -Algorithm SHA256`
3. Dans `config.js`, remplacez la valeur de `passwordHash` par ce nouveau hash.
4. Commit + push sur GitHub → Netlify redéploie tout seul.

> ⚠️ **Important** : changez le mot de passe par défaut **avant** la première mise en ligne publique.

---

## 📁 Structure du projet

| Fichier | Rôle |
|---|---|
| `index.html` | Page d'accueil |
| `boutique.html` | Catalogue produits (avec filtre Serrures) |
| `galerie.html` | Galerie auto-alimentée par Cloudinary |
| `apropos.html` | L'atelier |
| `contact.html` | Formulaire de contact + WhatsApp |
| `panier.html` | Panier |
| `localisation.html` | Carte interactive (Leaflet + OpenStreetMap) |
| `admin.html` | Espace de gestion protégé |
| `config.js` | **Configuration centrale** (Cloudinary, hash mot de passe, contacts) |
| `script.js` | Logique partagée (catalogue, panier, Cloudinary, médias) |
| `styles.css` | Design system premium (ébène / chocolat / sable) |
| `logo.svg`, `logo-mark.svg` | Logo complet + icône (vectoriels) |
| `images/` | Médias locaux optionnels (fallback) |
| `_redirects` | Règles URL propres (Netlify) |
| `.nojekyll` | Désactive Jekyll (GitHub Pages compat) |
| `.gitignore` | Exclusions Git |
| `README.md` | Ce fichier |

---

## ⚡ Mise en ligne en 3 étapes

### Étape 1 — Configurer Cloudinary (5 min)

Cloudinary héberge vos photos et vidéos dans le cloud. Vos uploads sont visibles sur tous les appareils sans toucher au code.

1. Créez un compte gratuit sur https://cloudinary.com (plan **Free** : 25 Go).
2. Dans le **Dashboard**, recopiez votre **Cloud Name** (ex. `dx7abc1de`).
3. **Settings** ⚙️ → **Upload** → **Add upload preset** :
   - **Signing Mode** : **Unsigned**
   - **Preset name** : `home_by_tika`
   - **Folder** : laissez vide
   - **Save**
4. **Settings** → **Security** → vérifiez que **« Resource list »** n'est PAS dans les types restreints (pour les galeries automatiques).
5. Dans `config.js`, remplacez `'YOUR_CLOUD_NAME_HERE'` par votre Cloud Name.

### Étape 2 — Pousser sur GitHub (5 min)

1. Créez un compte sur https://github.com si nécessaire.
2. **New repository** (bouton vert) → nom : `home-by-tika` → **Public** → cochez « Add README » → **Create**.
3. **Add file → Upload files** → glissez TOUS les fichiers du ZIP → **Commit changes**.

### Étape 3 — Brancher Netlify (3 min)

1. https://netlify.com → **Sign up with GitHub**.
2. **Add new site → Import an existing project** → GitHub → choisissez `home-by-tika`.
3. **Build settings** : tout laissé vide (site statique).
4. **Deploy site**.

Au bout de 30 secondes, votre site est à `https://votre-site.netlify.app`.

Pour personnaliser l'URL : **Site settings → Change site name** → `home-by-tika.netlify.app`.

À partir de maintenant, **chaque push GitHub redéploie automatiquement le site sous 1 minute**.

---

## 🎨 Espace de gestion (admin)

**Accès** : cliquez sur les **•••** dans le pied de page, ou allez directement à `/admin.html`.

**Mot de passe par défaut** : `696933MARINA` (à changer impérativement — voir section Sécurité).

### Fonctionnalités

**Images du site (section haute)**
- Image atelier (carré « L'atelier » sur l'accueil et la page atelier)
- Fond principal de la bannière d'accueil
- Upload Cloudinary automatique → visible partout

**Produits (section principale)**
Pour chaque article du catalogue :
- Photo HD (jusqu'à 1800 px de large)
- Vidéo courte ≤ 100 Mo (lecture auto-loop sur les cartes)
- Nom du produit
- Catégorie
- Essence de bois (Iroko, Framiré, Teck, Laiton…)
- Badge optionnel (Nouveau, Sur-mesure, Sécurité, Sculpté…)
- Description
- Prix de vente FCFA
- Bouton **↺** pour restaurer une valeur d'origine

**Quand Cloudinary est configuré**, tous les uploads vont dans le cloud et sont visibles partout. Sinon, fallback automatique sur le navigateur local.

---

## 🏷️ Catalogue Cloudinary — dossiers & tags

Cloudinary organise vos médias par **dossiers** et **tags**. Voici la convention utilisée :

| Section | Dossier Cloudinary | Tag pour galerie auto |
|---|---|---|
| Photos produits | `home-by-tika/produits` | `hbt_product` |
| Vidéos produits | `home-by-tika/videos` | `hbt_product_video` |
| Image atelier (story) | `home-by-tika/site/atelier` | `hbt_site_atelier` |
| Fond hero | `home-by-tika/site/hero-bg` | `hbt_site_hero` |
| Galerie Portes | `home-by-tika/portes` | `hbt_portes` |
| Galerie Mobilier | `home-by-tika/mobilier` | `hbt_mobilier` |
| Galerie Atelier | `home-by-tika/atelier` | `hbt_atelier` |
| Galerie Collections | `home-by-tika/collections` | `hbt_collections` |
| **Galerie Serrures** | `home-by-tika/serrures` | `hbt_serrures` |
| Galerie Vidéos | `home-by-tika/videos` | `hbt_videos` |

Pour qu'une image apparaisse dans la **page Galerie** :
1. Uploadez-la dans Cloudinary (n'importe où).
2. Ajoutez-lui le tag correspondant (ex. `hbt_serrures` pour la section Serrures).
3. Elle apparaît sur le site en 1-2 minutes (cache).

---

## 🎯 Sections du site

### Accueil
Hero avec logo + texte + dégradé bois, services portes/mobilier, essences (Iroko/Framiré/Teck), sélection produits, services complémentaires, engagement, CTA chocolat.

### Boutique
Filtres par catégorie incluant **Serrures & accessoires**. Cartes produits premium avec ombres bois, hover doré, badges.

### Galerie
5 onglets : Portes, Mobilier, Atelier, Collections, **Serrures**, Vidéos. Auto-alimentée par les tags Cloudinary. Lightbox au clic.

### Atelier
Histoire de la maison, méthode (sélection / séchage / façonnage), engagements. Carrés image dynamiques (Cloudinary).

### Contact + WhatsApp
Formulaire + bouton vert flottant WhatsApp sur toutes les pages.

### Localisation
Carte Leaflet, géolocalisation client → envoi position sur WhatsApp avec lien Google Maps.

### Panier
Récap, livraison offerte > 1.5M FCFA, mention Mobile Money / virement.

---

## 🚀 Performance

- **Lazy loading** sur toutes les images via `loading="lazy"`.
- **Cloudinary auto-format** (WebP/AVIF servis automatiquement aux navigateurs compatibles).
- **Cloudinary auto-quality** (compression adaptative selon la connexion).
- **Responsive widths** (Cloudinary sert la taille adaptée à l'écran).
- **Polices Google** préchargées (`preconnect`).
- **Scripts en fin de page** (pas de blocage du rendu).
- **CSS sticky header** avec `backdrop-filter` (effet de verre fluide).

---

## 📱 Responsive

Le site est testé et optimisé pour :
- iPhone (iOS Safari)
- Android (Chrome / Samsung Internet)
- Tablette (iPad, Galaxy Tab)
- Desktop (toutes résolutions ≥ 1024 px)

Breakpoints : 560 px (très petit), 720 px (mobile), 900 px (tablette).

---

## 🔧 Correctif important — Cloudinary upload (lire si l'admin renvoie « Échec cloud »)

L'API Cloudinary **refuse en mode unsigned** les paramètres `overwrite` et `invalidate`. Ils doivent être activés DANS le preset, pas dans la requête.

**Pour autoriser le remplacement d'une photo existante** :

1. Cloudinary → **Settings ⚙️ → Upload → Upload presets**
2. Cliquez sur `home_by_tika` pour l'éditer
3. Vérifiez ces options :
   - **Signing Mode** : Unsigned ✓
   - **Use filename or externally defined Public ID** : Yes (ON)
   - **Unique filename** : No (OFF — on veut des noms stables)
   - **Overwrite** : Yes (ON) — permet de remplacer une photo
4. **Save**

Un bouton **« Tester Cloudinary »** est disponible dans l'admin (bandeau d'actions du bas) — il upload un PNG transparent 1×1 et affiche l'URL générée si tout fonctionne. En cas d'échec, un panneau de debug rouge apparaît avec la réponse exacte de Cloudinary.

Pour diagnostiquer manuellement : ouvrez la console du navigateur (F12), tentez un upload, vous verrez le détail complet de la requête (URL, preset, statut HTTP, réponse JSON).

---

## 📦 Suivi de commande (Supabase)

Le système de **suivi de commande multi-appareils** s'appuie sur Supabase (gratuit, illimité pour ce volume).

### Configuration Supabase (10 min)

**1. Créer le projet**
- Allez sur https://supabase.com → **Start your project** (gratuit)
- **New project** → nom : `home-by-tika`, choisissez une région proche (ex. Frankfurt)
- Mot de passe DB : générez-en un fort, notez-le quelque part
- **Create new project** → attendez 1-2 min

**2. Créer la table des commandes**
- Onglet **SQL Editor** (icône à gauche) → **New query**
- Collez ce code :

```sql
-- Création de la table orders
CREATE TABLE orders (
  id            TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone         TEXT NOT NULL,
  address       TEXT DEFAULT '',
  items         JSONB DEFAULT '[]'::jsonb,
  total         INTEGER DEFAULT 0,
  status        TEXT DEFAULT 'received',
  notes         TEXT DEFAULT '',
  history       JSONB DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Active la sécurité au niveau ligne
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut LIRE (les clients consultent leur commande par ID)
CREATE POLICY "Public read orders"
  ON orders FOR SELECT TO anon USING (true);

-- Tout le monde peut INSÉRER (création de commande depuis le site)
CREATE POLICY "Public insert orders"
  ON orders FOR INSERT TO anon WITH CHECK (true);

-- Tout le monde peut METTRE À JOUR
-- (prototype : protection par mot de passe admin côté client)
-- Pour la production : utiliser Supabase Auth pour limiter aux admins authentifiés.
CREATE POLICY "Public update orders"
  ON orders FOR UPDATE TO anon USING (true);
```

- Cliquez **Run** → vérifiez « Success »

**3. Récupérer les clés**
- Onglet **Project Settings ⚙️ → API**
- Recopiez :
  - **Project URL** : `https://abc123xyz.supabase.co`
  - **anon public** key (la longue, commence par `eyJ…`)

**4. Renseigner dans `config.js`**

```js
supabase: {
  url:    'https://abc123xyz.supabase.co',
  anonKey: 'eyJhbGciOiJI…'   // toute la longue clé
}
```

Commit + push → Netlify redéploie → le suivi de commande est actif.

### Comment ça marche

**Client passe une commande** → un identifiant est généré (ex. `HBT-2605-AB12`) → la commande est créée dans Supabase → le client reçoit son numéro et peut le suivre depuis n'importe quel appareil sur `/suivi.html` ou en partageant `/suivi.html?id=HBT-2605-AB12`.

**Admin met à jour le statut** → section « Commandes » dans `admin.html` → menu déroulant → le client voit la mise à jour en temps réel sur sa page de suivi.

**7 statuts disponibles** : Commande reçue → Confirmée → Fabrication en cours → Finition → Produit prêt → Livraison en cours → Livré (ou Annulé).

### Sécurité Supabase

L'**anon key est publique par design** — pas une fuite. La sécurité passe par les Row Level Security (RLS) policies qu'on a configurées. Pour une vraie sécurité production, activez Supabase Auth + restreignez les UPDATE aux utilisateurs authentifiés (`auth.role() = 'authenticated'`).

---

## 🌍 Multilingue (FR / EN / ES)

Un sélecteur **FR | EN | ES** apparaît dans le header. Le choix de langue est mémorisé entre visites. Les textes traduisibles utilisent `data-i18n="cle"` (voir `i18n.js`). Pour ajouter une traduction, éditez `i18n.js` directement.

---

## 🆘 Dépannage

| Problème | Solution |
|---|---|
| Site déployé mais photos invisibles aux autres | Vérifier `cloudName` dans `config.js` |
| Erreur upload « preset must be Unsigned » | Cloudinary → preset → Signing Mode = Unsigned |
| Galerie vide | Tag manquant sur les images, ou Resource list restreint dans Cloudinary Security |
| Mot de passe oublié | Changez le hash dans `config.js`, recommitez |
| Carte de localisation ne marche pas | Le site doit être en HTTPS (Netlify le fait automatiquement) |
| Modification GitHub non visible | Attendre 1 min, vérifier l'onglet « Deploys » de Netlify |

---

## 📜 Licence

© 2026 HOME BY TIKA — Tous droits réservés.
Conçu sur-mesure pour HOME BY TIKA — atelier ivoirien d'ébénisterie premium.
