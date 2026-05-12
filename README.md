# HOME BY TIKA — Site web

Site vitrine et e-commerce de **HOME BY TIKA**, atelier ivoirien spécialisé dans le mobilier et les portes en bois massif (Iroko, Framiré, Teck).

- Atelier : Songon, Cité la Grâce — Abidjan, Côte d'Ivoire
- WhatsApp : +225 07 48 73 86 71

---

## Aperçu rapide

Site statique multi-pages, design **clair et premium** (palette ivoire/crème/bronze).

| Fichier | Rôle |
|---|---|
| `index.html` | Page d'accueil |
| `boutique.html` | Catalogue des produits |
| `apropos.html` | L'atelier |
| `contact.html` | Formulaire de contact |
| `panier.html` | Panier de commande |
| `localisation.html` | Carte interactive pour partager sa position |
| `admin.html` | Espace de gestion privé (photos, vidéos, prix, textes…) |
| `styles.css` | Feuille de styles unique |
| `script.js` | Script partagé (catalogue, panier, médias…) |
| `logo.svg`, `logo-mark.svg` | Logo complet + icône seule |
| `images/produits/` | Photos produits pour le déploiement permanent |

---

## Démarrage local

1. Téléchargez le dossier complet (ou l'archive ZIP).
2. Ouvrez **`index.html`** dans un navigateur (Chrome, Firefox, Safari, Edge).
3. Naviguez librement.

Pas d'installation, aucune dépendance à installer — tout fonctionne dans le navigateur.

---

## Espace de gestion (admin)

Accès par le **lien discret « ••• »** en bas de chaque page (ou directement `admin.html`).

- **Mot de passe :** `696933MARINA` (à changer dans `admin.html`, ligne `const ADMIN_PASSWORD`)
- **Sécurité :** le mot de passe est demandé à **chaque ouverture** de l'admin (pas de session prolongée).

### Fonctionnalités

L'admin permet de modifier le site **sans toucher au code** :

#### Section « Images du site »
- **Image Atelier** — remplace le carré décoratif des sections « L'atelier »
- **Fond principal** — image de fond de la bannière d'accueil (voile sombre élégant appliqué automatiquement)
- Compression auto : Atelier 1600 px max, Fond 2200 px max

#### Section « Produits »
Pour chaque produit du catalogue, vous pouvez modifier :
- **Photo HD** (jusqu'à 1800 px de large) par drag-drop ou clic
- **Vidéo courte** (≤ 30 s, max 50 Mo) en lecture auto/muette/boucle sur le site
- **Nom du produit**
- **Catégorie**
- **Essence de bois** (Iroko, Framiré, Teck…)
- **Badge** optionnel (Nouveau, Sur-mesure, Sécurisée…)
- **Description**
- **Prix de vente** en FCFA

Chaque champ modifié est signalé en doré, et un bouton **↺** restaure la valeur d'origine.

### Stockage

- **Photos**, **prix**, **textes**, **images du site** : `localStorage` (navigateur)
- **Vidéos** : `IndexedDB` (capacité bien plus large)

> ⚠️ Tout est stocké **localement dans votre navigateur**. Pour qu'une modification soit visible publiquement après mise en ligne, voir la section « Publication permanente » plus bas.

---

## Déploiement sur GitHub Pages

GitHub Pages héberge gratuitement votre site avec une URL publique et HTTPS.

### Étape 1 — Créer un dépôt GitHub

1. Créez un compte sur https://github.com (gratuit).
2. Cliquez sur **« New repository »** (bouton vert).
3. Nom suggéré : `home-by-tika`.
4. Visibilité : **Public** (requis pour GitHub Pages gratuit).
5. Cochez **« Add a README file »** (sera remplacé).
6. Cliquez sur **« Create repository »**.

### Étape 2 — Uploader les fichiers

1. Sur la page du dépôt, cliquez sur **« Add file » → « Upload files »**.
2. Faites glisser **tous** les fichiers de l'archive ZIP (HTML, CSS, JS, SVG, dossier `images/`, README.md, `.nojekyll`).
3. Au bas de la page, cliquez sur **« Commit changes »**.

### Étape 3 — Activer GitHub Pages

1. Dans le dépôt, cliquez sur **« Settings »** (en haut à droite).
2. Dans le menu de gauche, cliquez sur **« Pages »**.
3. Sous **« Source »**, choisissez :
   - **Branch** : `main`
   - **Folder** : `/ (root)`
4. Cliquez sur **« Save »**.

### Étape 4 — Tester

Au bout de 1 à 2 minutes, votre site sera en ligne à :

```
https://VOTRE-NOM-GITHUB.github.io/home-by-tika/
```

Vérifiez :
- ✅ Page d'accueil
- ✅ Boutique
- ✅ Carte de localisation (géolocalisation GPS fonctionne uniquement en HTTPS — automatique avec GitHub Pages)
- ✅ Bouton WhatsApp flottant
- ✅ Lien `•••` du pied de page → admin avec mot de passe

---

## Publication permanente des modifications

Les changements faits dans l'admin (photos, prix, textes, etc.) sont **stockés dans votre navigateur**. Pour les rendre visibles à **tous vos visiteurs** une fois en ligne, deux options :

### Option A — Geler le contenu dans le code

1. Ouvrez `script.js` avec un éditeur de texte (Bloc-notes, VS Code, etc.).
2. Modifiez le tableau `CATALOG` au début : noms, prix, descriptions, etc.
3. Ajoutez le champ `image: 'images/produits/sal-01.jpg'` à chaque produit (vous devez placer les photos correspondantes dans le dossier `images/produits/`).
4. Commitez et poussez sur GitHub — tous les visiteurs verront vos changements.

### Option B — Demander à votre développeur

Indiquez ce qu'il faut publier (« voici 4 photos pour les portes, les prix sont à jour, etc. ») et il intégrera tout dans le code source.

---

## Personnalisation rapide

### Changer le mot de passe admin

Dans `admin.html`, cherchez :
```js
const ADMIN_PASSWORD = '696933MARINA';
```
Remplacez par votre choix. **Conseil** : minimum 10 caractères mêlant lettres + chiffres.

### Changer les coordonnées

Cherchez et remplacez dans tous les fichiers HTML + `script.js` :
- `07 48 73 86 71` (numéro affiché)
- `2250748738671` (numéro WhatsApp au format international, sans `+`)
- `Songon, Cité la Grâce — Abidjan` (adresse)
- `contact@homebytika.ci` (email)

### Adresse de l'atelier sur la carte

Dans `localisation.html`, modifiez les coordonnées GPS :
```js
const WORKSHOP = [5.3066, -4.2517];
```

---

## Bibliothèques externes utilisées (CDN gratuits, aucune clé requise)

- **Google Fonts** — Playfair Display + Inter
- **Leaflet 1.9.4** — carte interactive
- **CartoDB Voyager** — tuiles cartographiques claires
- **OpenStreetMap Nominatim** — recherche d'adresse inversée

---

## Licence & crédits

© 2026 HOME BY TIKA — Tous droits réservés.

Site conçu sur-mesure pour HOME BY TIKA.
