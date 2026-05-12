# HOME BY TIKA — Site web premium

Site vitrine et e-commerce de **HOME BY TIKA**, atelier ivoirien spécialisé dans le mobilier et les portes en bois massif (Iroko, Framiré, Teck).

- Atelier : **Songon, Cité la Grâce** — Abidjan, Côte d'Ivoire
- WhatsApp : **+225 07 48 73 86 71**

---

## ⚡ Mise en route en 3 étapes

| Étape | Quoi | Durée |
|---|---|---|
| **1** | Configurer Cloudinary (cloud des photos/vidéos) | 5 min |
| **2** | Pousser sur GitHub | 5 min |
| **3** | Brancher Netlify pour le déploiement automatique | 3 min |

---

## 📁 Structure du projet

| Fichier | Rôle |
|---|---|
| `index.html` | Page d'accueil |
| `boutique.html` | Catalogue produits |
| `galerie.html` | **Galerie auto-alimentée par Cloudinary (NEW)** |
| `apropos.html` | L'atelier |
| `contact.html` | Formulaire de contact |
| `panier.html` | Panier de commande |
| `localisation.html` | Carte interactive + partage de position client |
| `admin.html` | Espace de gestion privé (mot de passe) |
| **`config.js`** | **Configuration centrale — Cloudinary, contacts, admin** |
| `script.js` | Logique partagée (catalogue, panier, médias, Cloudinary) |
| `styles.css` | Design system premium |
| `logo.svg` / `logo-mark.svg` | Logo complet + icône |
| `images/` | Médias locaux optionnels (fallback) |
| `.nojekyll` | Désactive Jekyll (requis GitHub Pages) |
| `_redirects` | Règles de redirection Netlify |

---

## 🌐 Étape 1 — Configurer Cloudinary (cloud des photos & vidéos)

Cloudinary héberge vos photos et vidéos dans le cloud. **Une seule fois à configurer**, ensuite vous uploadez depuis l'admin et tout apparaît sur tous les appareils, sans toucher au code.

### A. Créer le compte (gratuit)

1. Allez sur https://cloudinary.com → **Sign up for free**.
2. Choisissez **Programmable Media** (plan gratuit suffit : 25 Go inclus).
3. Confirmez votre email.

### B. Récupérer votre Cloud Name

1. Une fois connecté, vous arrivez sur le **Dashboard**.
2. En haut, vous voyez **« Product Environment Credentials »**.
3. Recopiez la valeur de **« Cloud name »** (ex. : `dx7abc1de`).

### C. Créer l'« Upload Preset » (mode unsigned)

1. Cliquez sur ⚙️ **Settings** (en haut à droite).
2. Onglet **Upload** → section **Upload presets**.
3. Cliquez **Add upload preset**.
4. **Signing Mode** : **Unsigned**.
5. **Preset name** : `home_by_tika` (exactement, en minuscules).
6. Laissez le reste par défaut → **Save**.

### D. Activer les galeries automatiques (liste publique par tag)

1. Toujours dans **Settings** → onglet **Security**.
2. Section **« Restricted media types »** : assurez-vous que **« Resource list »** est **décoché** (= autorisé).
3. Sauvegardez.

### E. Renseigner config.js

Ouvrez `config.js`, remplacez UNIQUEMENT cette ligne :

```js
cloudName: 'YOUR_CLOUD_NAME_HERE',
```

par votre vraie valeur :

```js
cloudName: 'dx7abc1de',   // ← votre Cloud name
```

Le `uploadPreset` est déjà rempli (`home_by_tika`). Si vous l'avez nommé autrement, ajustez aussi cette ligne.

C'est tout. Dès que ce fichier est en ligne, le site **bascule automatiquement** sur Cloudinary :

- L'admin upload directement vers le cloud
- Les photos/vidéos sont visibles sur tous les appareils
- La page **Galerie** alimente automatiquement les sections par tag
- Plus besoin de toucher à GitHub pour ajouter une photo

---

## 💻 Étape 2 — Pousser le code sur GitHub

### Si vous n'avez pas de compte GitHub

1. https://github.com → **Sign up**.
2. Confirmez l'email.

### Créer un dépôt et uploader les fichiers

1. Cliquez **« New repository »** (vert, en haut).
2. **Repository name** : `home-by-tika` (ou autre).
3. **Public** (requis pour Netlify gratuit).
4. Cochez **« Add a README file »** → **Create repository**.
5. Sur la page du dépôt, **« Add file » → « Upload files »**.
6. **Glissez TOUS les fichiers** de l'archive ZIP (HTML, CSS, JS, SVG, dossier `images/`, `.nojekyll`, `_redirects`, `README.md`).
7. En bas, écrivez un commentaire de commit (« mise en ligne initiale ») → **« Commit changes »**.

---

## 🚀 Étape 3 — Brancher Netlify (déploiement automatique GitHub → Netlify)

Netlify déploie le site **à chaque commit** GitHub, automatiquement. Vous ne touchez à rien.

1. https://netlify.com → **Sign up with GitHub** (gratuit).
2. Une fois connecté, cliquez **« Add new site » → « Import an existing project »**.
3. **GitHub** → autorisez Netlify à voir vos dépôts.
4. Choisissez le dépôt `home-by-tika`.
5. **Build settings** : laissez tout vide (site statique, aucune compilation).
   - Branch : `main`
   - Build command : (vide)
   - Publish directory : `/`
6. **Deploy site**.

Au bout de **30 secondes**, votre site est en ligne à une URL du type :

```
https://amazing-name-12345.netlify.app
```

Pour changer ce nom : **Site settings → Change site name** → ex : `home-by-tika.netlify.app`.

### À partir de maintenant

Chaque fois que vous modifiez quelque chose sur GitHub (édition directe ou nouveau commit), **Netlify redéploie automatiquement** sous une minute. Vous n'avez jamais à reuploader manuellement.

---

## 🔐 Espace de gestion (admin)

- **URL** : `/admin.html` ou cliquez sur les **« ••• »** dans le pied de page.
- **Mot de passe** : défini dans `config.js` → `admin.password`.
- **Par défaut** : `696933MARINA`. **Changez-le** dans `config.js` avant la mise en ligne.
- **Sécurité** : mot de passe demandé à chaque ouverture (pas de session persistante).

### Ce que l'admin permet (sans toucher au code)

| Section | Actions |
|---|---|
| **Images du site** | Image atelier + fond principal hero — upload Cloudinary auto |
| **Produits** | Photo HD + vidéo + nom + catégorie + bois + badge + description + prix |
| **Stats** | Suivi des photos, vidéos, prix et textes modifiés |

Quand Cloudinary est configuré, **tout upload va dans le cloud** et est visible partout. Sinon, fallback automatique sur le stockage local du navigateur (mode dégradé).

---

## 🎨 Page Galerie (auto-alimentée)

La page **galerie.html** liste automatiquement les médias présents dans Cloudinary par catégorie :

- **Portes** — tag `hbt_portes`
- **Mobilier** — tag `hbt_mobilier`
- **Atelier** — tag `hbt_atelier`
- **Collections** — tag `hbt_collections`
- **Vidéos** — tag `hbt_videos`

Pour ajouter un visuel à une galerie, depuis le tableau de bord Cloudinary :
1. **Media Library** → ouvrez le dossier correspondant (ou créez-le).
2. **Upload** → ajoutez votre fichier.
3. **Ajoutez le tag** correspondant (ex. `hbt_portes`).
4. Le fichier apparaît automatiquement sur le site sous **1-2 minutes** (cache Cloudinary).

---

## 🎨 Personnalisation rapide

### Coordonnées
Modifiez `config.js` → section `contact` :
```js
contact: {
  whatsapp: '2250748738671',
  phoneDisplay: '+225 07 48 73 86 71',
  email: 'contact@homebytika.ci',
  address: 'Songon, Cité la Grâce — Abidjan, Côte d\'Ivoire',
  workshop: { lat: 5.3066, lng: -4.2517 }
}
```

### Mot de passe admin
```js
admin: {
  password: 'VOTRE_NOUVEAU_MOT_DE_PASSE'
}
```

### Catalogue produits
Le tableau `CATALOG` dans `script.js` contient tous les produits. Vous pouvez le modifier directement (nom, prix, catégorie, etc.).

---

## 📚 Bibliothèques utilisées (CDN, aucune clé requise sauf Cloudinary)

| Lib | Usage |
|---|---|
| Google Fonts (Playfair Display + Inter) | Typographie |
| Leaflet 1.9.4 | Carte de localisation |
| CartoDB Voyager | Tuiles cartographiques claires |
| OpenStreetMap Nominatim | Géocodage inversé |
| Cloudinary Upload Widget | Upload depuis l'admin |
| Cloudinary Media Delivery | Hébergement et optimisation auto des médias |

---

## 🆘 En cas de souci

- **Le site est en ligne mais les photos n'apparaissent pas** : vérifiez `config.js` → `cloudName`. Sans Cloudinary configuré, seules les photos locales du navigateur sont visibles (et uniquement sur cet appareil).
- **Erreur « upload preset must be Unsigned »** : retournez dans Cloudinary → Settings → Upload → éditez le preset → Signing Mode = **Unsigned**.
- **La page Galerie est vide** : vérifiez que vos médias ont bien le tag correspondant dans Cloudinary, et que **Resource list** est autorisé (Settings → Security).
- **Mot de passe oublié** : ouvrez `config.js` → ligne `password`.

---

## Licence

© 2026 HOME BY TIKA — Tous droits réservés. Site conçu sur-mesure.
