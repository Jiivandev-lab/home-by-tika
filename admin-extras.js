/* =====================================================================
   HOME BY TIKA — admin-extras.js
   ---------------------------------------------------------------------
   Module additif (ne modifie PAS admin.html existant).
   Injecte deux nouvelles sections au DOM une fois le gate auth passé :
     1. Nouveau produit  — workflow Shopify-like (upload + auto slug/tags)
     2. Commandes        — liste/recherche/filtre + update statut

   Branchements :
     • ProductService (script.js) → Supabase products (fallback local)
     • OrderService   (script.js) → Supabase orders   (fallback local)
     • Cloudinary uploader        → preset unsigned (config.js)

   Activation : <script src="admin-extras.js"></script> dans admin.html
   ===================================================================== */

(function () {
  'use strict';

  /* ===== Attente du gate admin (sessionStorage 'hbt-admin-auth' = ok) ===== */
  function waitForAuth(cb, tries) {
    tries = tries || 0;
    if (sessionStorage.getItem('hbt-admin-auth') === 'ok') {
      cb();
    } else if (tries < 600) {  // 600 × 500ms = 5 min max
      setTimeout(() => waitForAuth(cb, tries + 1), 500);
    }
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  /* ===== Helpers ===== */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fcfa(n) {
    if (n == null || isNaN(n)) return '—';
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' FCFA';
  }
  function fmt(d) {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) { return String(d); }
  }
  function toast(msg, color) {
    let t = $('#hbt-extras-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'hbt-extras-toast';
      t.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;' +
        'background:#252025;color:#f5ede0;padding:0.9rem 1.4rem;border-radius:4px;' +
        'box-shadow:0 12px 32px rgba(0,0,0,0.5);font-size:0.95rem;max-width:380px;' +
        'border-left:3px solid #c89968;transform:translateY(80px);opacity:0;' +
        'transition:all 0.3s ease;font-family:Inter,sans-serif;';
      document.body.appendChild(t);
    }
    if (color) t.style.borderLeftColor = color;
    t.innerHTML = msg;
    t.style.transform = 'translateY(0)'; t.style.opacity = '1';
    clearTimeout(t._h);
    t._h = setTimeout(() => {
      t.style.transform = 'translateY(80px)'; t.style.opacity = '0';
    }, 3500);
  }

  /* ===== CSS additif ===== */
  function injectCSS() {
    const css = `
      .hbt-extras-section {
        background: var(--bg-card, #1a1820);
        border: 1px solid var(--line, rgba(200,153,104,0.18));
        padding: 1.8rem;
        margin-bottom: 2rem;
        border-radius: 4px;
      }
      .hbt-extras-section h2 {
        font-family: var(--serif, 'Playfair Display'), serif;
        color: var(--gold, #c89968);
        font-size: 1.4rem;
        margin: 0 0 0.4rem;
      }
      .hbt-extras-section .lede {
        color: var(--muted, #8a7e6a);
        font-size: 0.9rem;
        margin-bottom: 1.4rem;
      }
      .hbt-extras-tabs {
        display: flex;
        gap: 0.4rem;
        margin-bottom: 1.4rem;
        border-bottom: 1px solid var(--line, rgba(200,153,104,0.18));
        flex-wrap: wrap;
      }
      .hbt-extras-tab {
        background: transparent; border: none;
        color: var(--muted, #8a7e6a);
        padding: 0.7rem 1.2rem;
        font-size: 0.78rem;
        letter-spacing: 2px;
        text-transform: uppercase;
        font-weight: 600;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
      }
      .hbt-extras-tab:hover { color: var(--gold, #c89968); }
      .hbt-extras-tab.active {
        color: var(--gold, #c89968);
        border-bottom-color: var(--gold, #c89968);
      }
      .hbt-form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem 1.4rem;
      }
      .hbt-form .full { grid-column: 1 / -1; }
      .hbt-form label {
        display: block;
        font-size: 0.72rem;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: var(--gold, #c89968);
        font-weight: 600;
        margin-bottom: 0.4rem;
      }
      .hbt-form input, .hbt-form select, .hbt-form textarea {
        width: 100%;
        background: var(--bg-soft, #15131a);
        border: 1px solid var(--line, rgba(200,153,104,0.18));
        color: var(--ivory, #f5ede0);
        padding: 0.7rem 0.9rem;
        font-family: var(--sans, Inter), sans-serif;
        font-size: 0.95rem;
        border-radius: 2px;
        box-sizing: border-box;
      }
      .hbt-form input:focus, .hbt-form select:focus, .hbt-form textarea:focus {
        outline: none; border-color: var(--gold, #c89968);
      }
      .hbt-form textarea { min-height: 90px; resize: vertical; }
      .hbt-debug-panel {
        background: rgba(200,153,104,0.06);
        border: 1px dashed rgba(200,153,104,0.3);
        padding: 1rem 1.2rem;
        margin-top: 1rem;
        border-radius: 2px;
        font-family: 'Menlo', 'Courier New', monospace;
        font-size: 0.82rem;
        color: var(--ivory-dim, #d4c8b3);
        line-height: 1.6;
      }
      .hbt-debug-panel strong {
        color: var(--gold, #c89968);
        display: inline-block;
        min-width: 110px;
        font-family: var(--sans, Inter), sans-serif;
        text-transform: uppercase;
        font-size: 0.7rem;
        letter-spacing: 1.5px;
      }
      .hbt-upload-zone {
        border: 2px dashed rgba(200,153,104,0.4);
        border-radius: 4px;
        padding: 2rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
        background: rgba(200,153,104,0.03);
      }
      .hbt-upload-zone:hover {
        background: rgba(200,153,104,0.08);
        border-color: var(--gold, #c89968);
      }
      .hbt-upload-zone.has-image { padding: 0; border-style: solid; }
      .hbt-upload-zone img { max-width: 100%; max-height: 240px; display: block; margin: 0 auto; border-radius: 2px; }
      .hbt-upload-zone .upload-hint {
        color: var(--muted, #8a7e6a); font-size: 0.85rem;
      }
      .hbt-btn-primary {
        background: var(--gold, #c89968); color: #fff; border: none;
        padding: 0.85rem 1.8rem; font-size: 0.82rem; letter-spacing: 2px;
        text-transform: uppercase; font-weight: 700; cursor: pointer;
        border-radius: 2px; font-family: var(--sans, Inter), sans-serif;
        transition: all 0.2s ease;
      }
      .hbt-btn-primary:hover { background: #b58451; transform: translateY(-1px); }
      .hbt-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      .hbt-orders-controls {
        display: flex; gap: 0.8rem; flex-wrap: wrap;
        margin-bottom: 1rem; align-items: center;
      }
      .hbt-orders-controls input, .hbt-orders-controls select {
        background: var(--bg-soft, #15131a);
        border: 1px solid var(--line, rgba(200,153,104,0.18));
        color: var(--ivory, #f5ede0);
        padding: 0.6rem 0.9rem;
        font-size: 0.9rem; border-radius: 2px;
      }
      .hbt-orders-controls input { flex: 1; min-width: 200px; }
      .hbt-orders-table {
        width: 100%; border-collapse: collapse; font-size: 0.88rem;
      }
      .hbt-orders-table th, .hbt-orders-table td {
        padding: 0.7rem 0.6rem; text-align: left;
        border-bottom: 1px solid var(--line, rgba(200,153,104,0.12));
      }
      .hbt-orders-table th {
        color: var(--gold, #c89968);
        font-size: 0.72rem; letter-spacing: 1.5px;
        text-transform: uppercase; font-weight: 700;
      }
      .hbt-orders-table tr:hover { background: rgba(200,153,104,0.04); }
      .hbt-orders-table .status-select {
        background: var(--bg-soft, #15131a);
        border: 1px solid var(--line, rgba(200,153,104,0.18));
        color: var(--ivory, #f5ede0);
        padding: 0.4rem 0.6rem; font-size: 0.85rem; border-radius: 2px;
      }
      .hbt-order-id-cell { font-family: 'Menlo', monospace; color: var(--gold, #c89968); font-weight: 600; }
      .hbt-products-list {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1rem; margin-top: 1.2rem;
      }
      .hbt-product-mini {
        background: var(--bg-soft, #15131a);
        border: 1px solid var(--line, rgba(200,153,104,0.18));
        border-radius: 4px; overflow: hidden;
        display: flex; flex-direction: column;
      }
      .hbt-product-mini img { width: 100%; aspect-ratio: 4/5; object-fit: cover; display: block; background: #f4ead2; }
      .hbt-product-mini .body { padding: 0.8rem 1rem 1rem; }
      .hbt-product-mini .name {
        font-family: var(--serif, 'Playfair Display'), serif;
        font-size: 1rem; color: var(--ivory, #f5ede0); margin: 0 0 0.3rem;
      }
      .hbt-product-mini .meta {
        font-size: 0.78rem; color: var(--muted, #8a7e6a); margin-bottom: 0.6rem;
      }
      .hbt-product-mini .actions {
        display: flex; gap: 0.4rem;
      }
      .hbt-product-mini button {
        flex: 1; background: transparent; border: 1px solid var(--line, rgba(200,153,104,0.18));
        color: var(--ivory, #f5ede0); padding: 0.4rem 0.5rem; font-size: 0.72rem;
        cursor: pointer; border-radius: 2px; letter-spacing: 0.5px;
      }
      .hbt-product-mini button:hover { border-color: var(--gold, #c89968); }
      .hbt-product-mini button.danger:hover { border-color: #c45b5b; color: #c45b5b; }

      /* Mobile / tablette */
      @media (max-width: 720px) {
        .hbt-form { grid-template-columns: 1fr; }
        .hbt-orders-table { font-size: 0.8rem; }
        .hbt-orders-table thead { display: none; }
        .hbt-orders-table tr {
          display: block; margin-bottom: 0.8rem;
          border: 1px solid var(--line, rgba(200,153,104,0.18));
          padding: 0.8rem; border-radius: 4px;
        }
        .hbt-orders-table td {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.4rem 0; border: none;
        }
        .hbt-orders-table td::before {
          content: attr(data-label);
          color: var(--gold, #c89968); font-size: 0.7rem;
          letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600;
          flex-shrink: 0; margin-right: 1rem;
        }
        .hbt-orders-controls { flex-direction: column; align-items: stretch; }
        .hbt-products-list { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
      }
    `;
    const style = document.createElement('style');
    style.id = 'hbt-extras-css';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ============================================================
     SECTION 1 — NOUVEAU PRODUIT (workflow Shopify-like)
     ----------------------------------------------------------
     Catégories lues depuis HBT_CATEGORIES (source unique de vérité
     dans media-manifest.js). N'importe quelle nouvelle catégorie
     ajoutée là apparaît auto ici, sans modifier admin-extras.js.
     ============================================================ */
  function categoriesForAdmin() {
    const all = (window.HBT_CATEGORIES || []);
    const produits  = all.filter(c => c.type === 'produit');
    const galeries  = all.filter(c => c.type === 'galerie');
    const others    = all.filter(c => c.type !== 'produit' && c.type !== 'galerie');
    // Structure du select : produits d'abord, puis galeries en option group
    return { produits: produits, galeries: galeries, others: others };
  }
  // Liste plate utilisée par les <option> (avec étiquettes group préfixées si galerie)
  function CATEGORIES_LIST() {
    const g = categoriesForAdmin();
    return [
      ...g.produits.map(c => ({ value: c.slug, label: c.label })),
      ...g.galeries.map(c => ({ value: c.slug, label: 'Galerie : ' + c.label })),
      ...g.others.map(c => ({ value: c.slug, label: c.label }))
    ];
  }

  function newProductHTML() {
    return `
      <h2>Ajouter un nouveau produit</h2>
      <p class="lede">Remplissez les champs, uploadez l'image — le slug, le public_id, les tags et le dossier Cloudinary sont générés automatiquement. Publication instantanée sur le site.</p>

      <form id="hbt-new-product-form" class="hbt-form">
        <div>
          <label>Nom du produit *</label>
          <input type="text" id="np-name" placeholder="Ex. Porte Lagune Premium" required>
        </div>
        <div>
          <label>Catégorie *</label>
          <select id="np-category" required>
            ${CATEGORIES_LIST().map(c => `<option value="${c.value}">${c.label}</option>`).join('')}
          </select>
        </div>
        <div>
          <label>Prix (FCFA, optionnel)</label>
          <input type="number" id="np-price" placeholder="350000" min="0" step="1000">
        </div>
        <div>
          <label>Essence de bois (optionnel)</label>
          <input type="text" id="np-wood" placeholder="Iroko, Framiré, Teck…">
        </div>
        <div>
          <label>Badge (optionnel)</label>
          <input type="text" id="np-label" placeholder="Nouveau, Sur-mesure, Sculpté…">
        </div>
        <div>
          <label>Monogramme (auto)</label>
          <input type="text" id="np-monogram" maxlength="2" placeholder="P">
        </div>
        <div class="full">
          <label>Description</label>
          <textarea id="np-desc" placeholder="Description courte du produit…"></textarea>
        </div>
        <div class="full">
          <label id="np-file-label">Image *</label>
          <div class="hbt-upload-zone" id="np-upload-zone">
            <div class="upload-zone-content">
              <div class="upload-hint" id="np-upload-hint">Cliquez ou glissez une image ici (JPG, PNG, WEBP)</div>
            </div>
            <input type="file" id="np-file" accept="image/*" style="display:none;">
          </div>
        </div>
        <div class="full">
          <div class="hbt-debug-panel" id="np-debug">
            <div><strong>Slug</strong> <span data-debug="slug">(en attente du nom)</span></div>
            <div><strong>Public ID</strong> <span data-debug="publicId">—</span></div>
            <div><strong>Dossier</strong> <span data-debug="folder">—</span></div>
            <div><strong>Tags</strong> <span data-debug="tags">—</span></div>
            <div><strong>Section affichage</strong> <span data-debug="section">—</span></div>
            <div><strong>URL Cloudinary</strong> <span data-debug="url">(après upload)</span></div>
          </div>
        </div>
        <div class="full" style="text-align:right;">
          <button type="submit" class="hbt-btn-primary" id="np-submit" disabled>Publier le produit</button>
        </div>
      </form>

      <h2 style="margin-top:2.4rem;">Produits ajoutés depuis l'admin</h2>
      <p class="lede">Liste des produits gérés via Supabase (en plus des 23 produits historiques du catalogue).</p>
      <div class="hbt-products-list" id="hbt-products-list">
        <p style="grid-column:1/-1;color:var(--muted);">Chargement…</p>
      </div>
    `;
  }

  function wireNewProduct() {
    const form = $('#hbt-new-product-form');
    const nameI = $('#np-name');
    const catI  = $('#np-category');
    const priceI= $('#np-price');
    const woodI = $('#np-wood');
    const labelI= $('#np-label');
    const monoI = $('#np-monogram');
    const descI = $('#np-desc');
    const zone  = $('#np-upload-zone');
    const fileI = $('#np-file');
    const submitBtn = $('#np-submit');
    const dbg   = (key) => $('[data-debug="' + key + '"]', $('#np-debug'));

    /* Section d'affichage dynamique selon le type de catégorie */
    function sectionFor(catSlug) {
      const info = (typeof window.HBT_categoryInfo === 'function')
                    ? window.HBT_categoryInfo(catSlug) : null;
      if (!info) return '—';
      if (info.type === 'produit') {
        return 'boutique (' + info.label + ')' +
               (info._auto ? '  ← nouvelle catégorie auto-détectée' : '');
      }
      if (info.type === 'galerie') return 'galerie (' + info.label + ')';
      return info.label;
    }

    let pendingFile = null;
    let pendingPreview = null;
    let pendingKind = 'image';  // 'image' ou 'video'

    /* Détermine si la catégorie accepte des vidéos
       (mediaKind:'video' dans HBT_CATEGORIES, ou slug 'videos') */
    function kindForCategory(catSlug) {
      const info = (typeof window.HBT_categoryInfo === 'function')
                    ? window.HBT_categoryInfo(catSlug) : null;
      if (info && info.mediaKind === 'video') return 'video';
      if (catSlug === 'videos') return 'video';
      return 'image';
    }

    /* Adapte le file input + le label selon le type de média attendu */
    function syncFileInputForKind(kind) {
      const fileEl  = $('#np-file');
      const hintEl  = $('#np-upload-hint');
      const labelEl = $('#np-file-label');
      if (kind === 'video') {
        fileEl.setAttribute('accept', 'video/mp4,video/webm,video/quicktime');
        if (labelEl) labelEl.textContent = 'Vidéo *';
        if (hintEl && !pendingFile) hintEl.textContent = 'Cliquez ou glissez une vidéo ici (MP4, WEBM ≤ 100 Mo)';
      } else {
        fileEl.setAttribute('accept', 'image/*');
        if (labelEl) labelEl.textContent = 'Image *';
        if (hintEl && !pendingFile) hintEl.textContent = 'Cliquez ou glissez une image ici (JPG, PNG, WEBP)';
      }
    }

    /* Met à jour le panneau debug en live */
    function updateDebug() {
      const name = nameI.value.trim();
      const cat  = catI.value;
      // Sync input file selon média attendu
      syncFileInputForKind(kindForCategory(cat));
      if (!name) {
        dbg('slug').textContent = '(en attente du nom)';
        dbg('publicId').textContent = '—';
        dbg('folder').textContent = '—';
        dbg('tags').textContent = '—';
        dbg('section').textContent = '—';
        return;
      }
      const meta = window.HBT_generateProductMeta(name, cat);
      dbg('slug').textContent = meta.slug;
      dbg('publicId').textContent = meta.publicId;
      dbg('folder').textContent = meta.folder;
      dbg('tags').textContent = meta.tags.join(', ');
      dbg('section').textContent = sectionFor(cat);
      if (!monoI.value) monoI.value = (name.charAt(0) || '').toUpperCase();
    }
    nameI.addEventListener('input', updateDebug);
    catI.addEventListener('change', updateDebug);

    /* Gestion upload zone */
    zone.addEventListener('click', () => fileI.click());
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.style.borderColor = 'var(--gold,#c89968)'; });
    zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.style.borderColor = '';
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    fileI.addEventListener('change', (e) => {
      if (e.target.files[0]) handleFile(e.target.files[0]);
    });

    function handleFile(file) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      const expectedKind = kindForCategory(catI.value);

      // Validation : la catégorie sélectionnée détermine le type accepté
      if (expectedKind === 'video' && !isVideo) {
        toast('⚠ Cette catégorie attend une vidéo (MP4 / WEBM)', '#c45b5b'); return;
      }
      if (expectedKind === 'image' && !isImage) {
        toast('⚠ Cette catégorie attend une image (JPG / PNG / WEBP)', '#c45b5b'); return;
      }

      // Taille max : 100 Mo pour vidéo, 10 Mo pour image
      const maxBytes = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxBytes) {
        toast('⚠ Fichier trop volumineux (' + Math.round(file.size / 1024 / 1024) + ' Mo, max ' + (maxBytes / 1024 / 1024) + ' Mo)', '#c45b5b');
        return;
      }

      pendingFile = file;
      pendingKind = isVideo ? 'video' : 'image';

      // Aperçu : image inline, vidéo → première frame ou icône
      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          pendingPreview = e.target.result;
          zone.classList.add('has-image');
          zone.querySelector('.upload-zone-content').innerHTML =
            '<img src="' + pendingPreview + '" alt="aperçu">' +
            '<div class="upload-hint" style="padding:0.6rem;">Cliquez pour changer</div>';
          submitBtn.disabled = false;
        };
        reader.readAsDataURL(file);
      } else {
        // Vidéo : on génère un blob URL pour preview
        const blobUrl = URL.createObjectURL(file);
        pendingPreview = blobUrl;
        zone.classList.add('has-image');
        zone.querySelector('.upload-zone-content').innerHTML =
          '<video src="' + blobUrl + '" muted playsinline preload="metadata" style="max-width:100%;max-height:240px;display:block;margin:0 auto;border-radius:2px;background:#000;" controls></video>' +
          '<div class="upload-hint" style="padding:0.6rem;">' + escapeHtml(file.name) + ' (' + Math.round(file.size / 1024 / 1024) + ' Mo) — Cliquez pour changer</div>';
        submitBtn.disabled = false;
      }
    }

    /* Soumission du formulaire — upload Cloudinary + insert Supabase */
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!pendingFile) { toast('⚠ Sélectionnez une image', '#c45b5b'); return; }
      const name = nameI.value.trim();
      const cat  = catI.value;
      if (!name) { toast('⚠ Le nom est requis', '#c45b5b'); return; }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Publication…';

      try {
        const meta = window.HBT_generateProductMeta(name, cat);

        // 1) UPLOAD CLOUDINARY (preset unsigned)
        const cloudName = window.HBT_CONFIG.cloudinary.cloudName;
        const preset    = window.HBT_CONFIG.cloudinary.uploadPreset;
        if (!cloudName || cloudName === 'YOUR_CLOUD_NAME_HERE') {
          throw new Error('Cloudinary non configuré (cloudName)');
        }

        const fd = new FormData();
        fd.append('file', pendingFile);
        fd.append('upload_preset', preset);
        fd.append('folder', meta.folder);
        fd.append('public_id', meta.slug);  // public_id sans le folder, Cloudinary concatène
        fd.append('tags', meta.tags.join(','));
        // Contexte : prix/desc/wood en metadata (bonus, optionnel)
        const ctx = [
          'alt=' + name,
          priceI.value ? ('price=' + priceI.value) : '',
          descI.value  ? ('caption=' + descI.value) : '',
          woodI.value  ? ('wood=' + woodI.value) : ''
        ].filter(Boolean).join('|');
        if (ctx) fd.append('context', ctx);

        // Endpoint Cloudinary selon le type média (image|video|auto)
        const resourceType = (pendingKind === 'video') ? 'video' : 'image';
        const upUrl = 'https://api.cloudinary.com/v1_1/' + cloudName + '/' + resourceType + '/upload';
        const upRes = await fetch(upUrl, { method: 'POST', body: fd });
        const upData = await upRes.json();
        if (!upRes.ok || !upData.secure_url) {
          throw new Error('Cloudinary upload failed: ' + (upData.error ? upData.error.message : upRes.status));
        }

        dbg('url').innerHTML = '<a href="' + upData.secure_url + '" target="_blank" style="color:var(--gold);word-break:break-all;">' + upData.secure_url + '</a>';
        console.group('[HBT new product] Upload OK');
        console.log('Cloudinary response :', upData);
        console.groupEnd();

        // 2) SUPABASE INSERT (ou localStorage si non configuré)
        const product = await window.ProductService.create({
          name: name,
          category: cat,
          price: priceI.value ? Number(priceI.value) : null,
          wood: woodI.value.trim(),
          description: descI.value.trim(),
          label: labelI.value.trim(),
          monogram: (monoI.value || name.charAt(0) || '').toUpperCase(),
          cloudinary_id: upData.public_id,
          cloudinary_url: upData.secure_url,
          tags: meta.tags,
          media_type: pendingKind  // 'image' ou 'video'
        });

        toast('✓ Produit publié : <strong>' + escapeHtml(product.name) + '</strong>', '#2e8a56');
        form.reset();
        pendingFile = null; pendingPreview = null;
        zone.classList.remove('has-image');
        zone.querySelector('.upload-zone-content').innerHTML =
          '<div class="upload-hint">Cliquez ou glissez une image ici (JPG, PNG, WEBP)</div>';
        updateDebug();
        refreshProductsList();
      } catch (err) {
        console.error('[HBT new product]', err);
        toast('❌ Erreur : ' + escapeHtml(err.message), '#c45b5b');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publier le produit';
      }
    });

    updateDebug();
    refreshProductsList();
  }

  async function refreshProductsList() {
    const list = $('#hbt-products-list');
    if (!list) return;
    try {
      const products = await window.ProductService.list();
      if (!products || products.length === 0) {
        list.innerHTML = '<p style="grid-column:1/-1;color:var(--muted);">Aucun produit ajouté pour le moment. Utilisez le formulaire ci-dessus.</p>';
        return;
      }
      list.innerHTML = products.map(p => {
        const imgUrl = p.cloudinary_url ||
          (window.HBT_mediaUrl ? window.HBT_mediaUrl(p.category, p.id, { width: 400, crop: 'fill' }) : '');
        return `
          <div class="hbt-product-mini" data-id="${escapeHtml(p.id)}">
            <img src="${imgUrl}" alt="${escapeHtml(p.name)}" loading="lazy"
                 onerror="HBT_handleImageError(this, '${escapeHtml(p.name).replace(/'/g, "\\'")}', {monogram:'${escapeHtml(p.monogram || '·')}'})">
            <div class="body">
              <h4 class="name">${escapeHtml(p.name)}</h4>
              <div class="meta">${escapeHtml(p.category)} · ${p.price ? fcfa(p.price) : 'sur devis'}</div>
              <div class="actions">
                <button type="button" data-action="edit">Éditer</button>
                <button type="button" data-action="delete" class="danger">Supprimer</button>
              </div>
            </div>
          </div>`;
      }).join('');

      // Wire actions
      list.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.closest('.hbt-product-mini').dataset.id;
          if (!confirm('Supprimer ce produit ? Cette action est irréversible.')) return;
          await window.ProductService.delete(id);
          toast('✓ Produit supprimé', '#2e8a56');
          refreshProductsList();
        });
      });
      list.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.closest('.hbt-product-mini').dataset.id;
          const p = await window.ProductService.getById(id);
          if (!p) return;
          // Édition rapide : prix uniquement (pour version 1, simple)
          const newPrice = prompt('Nouveau prix en FCFA (laisser vide pour conserver "' + (p.price || 'sur devis') + '") :', p.price || '');
          if (newPrice === null) return;
          const changes = {};
          if (newPrice !== '') changes.price = Number(newPrice);
          if (Object.keys(changes).length) {
            await window.ProductService.update(id, changes);
            toast('✓ Produit mis à jour', '#2e8a56');
            refreshProductsList();
          }
        });
      });
    } catch (e) {
      console.error(e);
      list.innerHTML = '<p style="grid-column:1/-1;color:#c45b5b;">Erreur de chargement : ' + escapeHtml(e.message) + '</p>';
    }
  }

  /* ============================================================
     SECTION 2 — GESTION DES COMMANDES
     (liste Supabase + recherche + filtre + update statut inline)
     ============================================================ */
  // 10 statuts complets HOME BY TIKA + Annulée. Ordre = progression réelle.
  const ORDER_STATUSES_ADMIN = [
    { key: 'received',           label: 'En attente de paiement', color: '#8a7860' },
    { key: 'payment_confirmed',  label: 'Paiement confirmé',      color: '#7a6042' },
    { key: 'design_approved',    label: 'Design validé',       color: '#8a5a2a' },
    { key: 'wood_prep',          label: 'Bois / matériel préparé', color: '#a06b2a' },
    { key: 'preparing',          label: 'En fabrication',      color: '#b48249' },
    { key: 'varnishing',         label: 'Finition / vernissage', color: '#c89968' },
    { key: 'quality_check',      label: 'Contrôle qualité',    color: '#d4a766' },
    { key: 'delivery_scheduled', label: 'Livraison programmée',color: '#dab07b' },
    { key: 'shipping',           label: 'En livraison',        color: '#e0b878' },
    { key: 'delivered',          label: 'Livrée',              color: '#2e8a56' },
    { key: 'cancelled',          label: 'Annulée',             color: '#c45b5b' }
  ];

  // Statuts hérités (anciennes commandes) → mappage transparent
  const LEGACY_STATUS_LABELS = {
    finishing: 'Finition (ancien)',
    ready:     'Produit prêt (ancien)',
    confirmed: 'Validation (ancien)'
  };

  function statusInfo(key) {
    return ORDER_STATUSES_ADMIN.find(s => s.key === key) ||
           { key: key, label: LEGACY_STATUS_LABELS[key] || key, color: '#8a7860' };
  }

  /* Résumé court des articles d'une commande (pour cellule table) */
  function itemsBrief(items) {
    if (!Array.isArray(items) || items.length === 0) return '<span style="color:var(--muted);">—</span>';
    const total = items.reduce((n, it) => n + (it.qty || 1), 0);
    const firstNames = items.slice(0, 2).map(it => escapeHtml(it.name || it.id)).join(', ');
    const more = items.length > 2 ? ' +' + (items.length - 2) : '';
    return `<span title="${items.length} ligne(s)">${total} art. — ${firstNames}${more}</span>`;
  }

  /* Adresse tronquée (cellule table) */
  function addressBrief(addr) {
    if (!addr) return '<span style="color:var(--muted);">—</span>';
    const txt = String(addr);
    if (txt.length <= 38) return escapeHtml(txt);
    return '<span title="' + escapeHtml(txt) + '">' + escapeHtml(txt.slice(0, 36)) + '…</span>';
  }

  function ordersHTML() {
    return `
      <h2>Gestion des commandes</h2>
      <p class="lede">Toutes les commandes Supabase, suivi de fabrication, mise à jour de statut. Sauvegarde instantanée dans la base.</p>

      <div class="hbt-orders-controls">
        <input type="text" id="ord-search" placeholder="Rechercher : numéro, nom, téléphone, adresse…">
        <select id="ord-filter-status">
          <option value="">Tous statuts</option>
          ${ORDER_STATUSES_ADMIN.map(s => `<option value="${s.key}">${s.label}</option>`).join('')}
        </select>
        <button type="button" class="hbt-btn-primary" id="ord-refresh" style="padding:0.6rem 1.2rem;font-size:0.75rem;">Rafraîchir</button>
      </div>

      <div id="ord-status-line" style="font-size:0.85rem;color:var(--muted);margin-bottom:0.8rem;"></div>

      <div style="overflow-x:auto;">
        <table class="hbt-orders-table" id="ord-table">
          <thead>
            <tr>
              <th>N°</th>
              <th>Date</th>
              <th>Client</th>
              <th>Téléphone</th>
              <th>Adresse</th>
              <th>Articles</th>
              <th>Total</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="9" style="text-align:center;color:var(--muted);padding:1.4rem;">Chargement…</td></tr>
          </tbody>
        </table>
      </div>
    `;
  }

  let allOrders = [];

  async function loadOrders() {
    const tbody = $('#ord-table tbody');
    const line  = $('#ord-status-line');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted);">Chargement…</td></tr>';

    try {
      allOrders = await window.OrderService.list();
      if (line) {
        if (window.HBT_CONFIG && window.HBT_CONFIG.isSupabaseReady && window.HBT_CONFIG.isSupabaseReady()) {
          line.innerHTML = '✓ Connecté à Supabase — ' + allOrders.length + ' commande(s)';
          line.style.color = '#2e8a56';
        } else {
          line.innerHTML = '⚠ Supabase non configuré — affichage localStorage uniquement (' + allOrders.length + ' commande(s))';
          line.style.color = '#c89968';
        }
      }
      renderOrders();
    } catch (e) {
      console.error(e);
      tbody.innerHTML = '<tr><td colspan="7" style="color:#c45b5b;">Erreur : ' + escapeHtml(e.message) + '</td></tr>';
    }
  }

  function renderOrders() {
    const tbody = $('#ord-table tbody');
    if (!tbody) return;
    const q = ($('#ord-search').value || '').trim().toLowerCase();
    const statusFilter = $('#ord-filter-status').value;

    const filtered = allOrders.filter(o => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (q) {
        // Recherche large : ID, nom, téléphone, adresse, notes
        const blob = [
          o.id, o.customer_name, o.phone, o.address, o.notes
        ].filter(Boolean).join(' ').toLowerCase();
        if (blob.indexOf(q) === -1) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:1.8rem;">Aucune commande ne correspond aux critères.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(o => {
      const st = statusInfo(o.status);
      // Si le statut actuel n'est pas dans la liste des 6 (ex: "finishing" / "shipping"
      // hérités), on l'ajoute en tête du select pour ne pas perdre l'information.
      const inMain = ORDER_STATUSES_ADMIN.some(s => s.key === o.status);
      const optionsList = (inMain ? '' :
        '<option value="' + escapeHtml(o.status) + '" selected>' + escapeHtml(st.label) + ' (ancien)</option>'
      ) + ORDER_STATUSES_ADMIN.map(s =>
        '<option value="' + s.key + '"' + (s.key === o.status ? ' selected' : '') + '>' + s.label + '</option>'
      ).join('');

      return `
        <tr data-id="${escapeHtml(o.id)}">
          <td data-label="N°"><span class="hbt-order-id-cell">${escapeHtml(o.id)}</span></td>
          <td data-label="Date">${fmt(o.created_at)}</td>
          <td data-label="Client">${escapeHtml(o.customer_name || '—')}</td>
          <td data-label="Téléphone">${escapeHtml(o.phone || '—')}</td>
          <td data-label="Adresse">${addressBrief(o.address)}</td>
          <td data-label="Articles">${itemsBrief(o.items)}</td>
          <td data-label="Total">${o.total ? fcfa(o.total) : '—'}</td>
          <td data-label="Statut">
            <select class="status-select" data-action="status"
                    style="border-color:${st.color};color:${st.color};font-weight:600;">
              ${optionsList}
            </select>
          </td>
          <td data-label="Actions">
            <button type="button" data-action="view" class="hbt-btn-primary"
                    style="padding:0.4rem 0.8rem;font-size:0.7rem;">Détails</button>
          </td>
        </tr>`;
    }).join('');
  }

  function wireOrders() {
    $('#ord-search').addEventListener('input', () => renderOrders());
    $('#ord-filter-status').addEventListener('change', () => renderOrders());
    $('#ord-refresh').addEventListener('click', () => loadOrders());

    // Délégation : update statut (sauvegarde Supabase instantanée)
    $('#ord-table tbody').addEventListener('change', async (e) => {
      if (e.target.matches('[data-action="status"]')) {
        const select = e.target;
        const id = select.closest('tr').dataset.id;
        const newStatus = select.value;
        const prevStatus = (allOrders.find(x => x.id === id) || {}).status;

        // Indicateur visuel pendant la sauvegarde
        select.disabled = true;
        select.style.opacity = '0.55';

        try {
          await window.OrderService.updateStatus(id, newStatus, '');
          // Met à jour la couleur du select + l'objet local
          const st = statusInfo(newStatus);
          select.style.borderColor = st.color;
          select.style.color = st.color;
          const o = allOrders.find(x => x.id === id);
          if (o) o.status = newStatus;
          toast('✓ ' + escapeHtml(id) + ' → <strong>' + escapeHtml(st.label) + '</strong>', '#2e8a56');
        } catch (err) {
          console.error('[Commandes] updateStatus échec :', err);
          toast('❌ Sauvegarde échouée : ' + escapeHtml(err.message), '#c45b5b');
          // Revient au statut précédent en cas d'erreur
          if (prevStatus) select.value = prevStatus;
        } finally {
          select.disabled = false;
          select.style.opacity = '1';
        }
      }
    });

    // Délégation : ouvre la modal détails
    $('#ord-table tbody').addEventListener('click', async (e) => {
      if (e.target.matches('[data-action="view"]')) {
        const id = e.target.closest('tr').dataset.id;
        const o = allOrders.find(x => x.id === id);
        if (o) showOrderDetails(o);
      }
    });
  }

  function showOrderDetails(o) {
    const itemsHTML = (o.items || []).length
      ? o.items.map(it => '<li>' + (it.qty || 1) + ' × ' + escapeHtml(it.name || it.id) + ' — ' + fcfa(it.price * (it.qty || 1)) + '</li>').join('')
      : '<li style="color:var(--muted);">Aucun article</li>';
    const historyHTML = (o.history || []).map(h =>
      '<li>' + fmt(h.at) + ' — <strong>' + escapeHtml(statusInfo(h.status).label) + '</strong>' + (h.note ? ' — ' + escapeHtml(h.note) : '') + '</li>'
    ).join('');

    const paid = !!o.payment_confirmed;
    const amountPaid = Number(o.amount_paid) || 0;
    const remaining = Math.max(0, (Number(o.total) || 0) - amountPaid);

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99998;display:flex;align-items:flex-start;justify-content:center;padding:1rem;overflow-y:auto;backdrop-filter:blur(4px);';
    modal.innerHTML = `
      <div class="hbt-ord-modal-inner" style="background:var(--bg-card,#1a1820);border:1px solid var(--gold,#c89968);padding:1.8rem;border-radius:4px;max-width:720px;width:100%;font-family:Inter,sans-serif;color:var(--ivory,#f5ede0);margin:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;gap:0.6rem;flex-wrap:wrap;">
          <h3 style="color:var(--gold,#c89968);font-family:'Playfair Display',serif;margin:0;font-size:1.4rem;">${escapeHtml(o.id)}</h3>
          <span style="display:inline-block;padding:0.3rem 0.8rem;border-radius:999px;font-size:0.75rem;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;background:${paid ? 'rgba(46,138,86,0.2)' : 'rgba(196,91,91,0.18)'};color:${paid ? '#5cc488' : '#e88c8c'};border:1px solid ${paid ? '#2e8a56' : '#c45b5b'};">
            ${paid ? '✓ Payé' : 'Non payé'}
          </span>
          <button type="button" class="ord-modal-close" style="background:transparent;border:1px solid var(--line,rgba(200,153,104,0.18));color:var(--ivory,#f5ede0);padding:0.4rem 0.8rem;cursor:pointer;border-radius:2px;">Fermer</button>
        </div>
        <p style="font-size:0.85rem;color:var(--muted,#8a7e6a);margin-bottom:1.4rem;">
          Passée le ${fmt(o.created_at)} · Statut : <strong style="color:${statusInfo(o.status).color};">${escapeHtml(statusInfo(o.status).label)}</strong>
        </p>

        <!-- INFOS CLIENT -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem 1.4rem;font-size:0.9rem;margin-bottom:1.4rem;">
          <div><strong style="color:var(--gold,#c89968);font-size:0.7rem;letter-spacing:1.5px;text-transform:uppercase;">Client</strong><br>${escapeHtml(o.customer_name || '—')}</div>
          <div><strong style="color:var(--gold,#c89968);font-size:0.7rem;letter-spacing:1.5px;text-transform:uppercase;">Téléphone</strong><br>${escapeHtml(o.phone || '—')}</div>
          <div style="grid-column:1/-1;"><strong style="color:var(--gold,#c89968);font-size:0.7rem;letter-spacing:1.5px;text-transform:uppercase;">Adresse</strong><br>${escapeHtml(o.address || '—')}</div>
        </div>

        <!-- PAIEMENT -->
        <div style="background:rgba(200,153,104,0.06);border-left:3px solid var(--gold,#c89968);padding:1rem 1.2rem;margin-bottom:1.4rem;">
          <strong style="color:var(--gold,#c89968);font-size:0.72rem;letter-spacing:1.5px;text-transform:uppercase;display:block;margin-bottom:0.6rem;">Paiement</strong>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.8rem;font-size:0.88rem;">
            <div><span style="color:var(--muted);">Total commande</span><br><strong>${o.total ? fcfa(o.total) : '—'}</strong></div>
            <div><span style="color:var(--muted);">Montant payé</span><br><strong style="color:${amountPaid ? '#5cc488' : 'var(--muted)'};">${amountPaid ? fcfa(amountPaid) : '0 FCFA'}</strong></div>
            <div><span style="color:var(--muted);">Solde restant</span><br><strong style="color:${remaining ? '#e88c8c' : '#5cc488'};">${fcfa(remaining)}</strong></div>
          </div>
          <div style="margin-top:0.8rem;font-size:0.85rem;color:var(--ivory-dim,#d4c8b3);">
            Mode de paiement : <strong>${escapeHtml(o.payment_method || '—')}</strong>
          </div>
        </div>

        <!-- ARTICLES -->
        <div style="margin-bottom:1.4rem;">
          <strong style="color:var(--gold,#c89968);font-size:0.72rem;letter-spacing:1.5px;text-transform:uppercase;">Articles</strong>
          <ul style="margin:0.4rem 0 0 1.2rem;font-size:0.9rem;">${itemsHTML}</ul>
        </div>

        <!-- MESSAGE CLIENT -->
        <div style="margin-bottom:1.4rem;">
          <label style="color:var(--gold,#c89968);font-size:0.72rem;letter-spacing:1.5px;text-transform:uppercase;display:block;margin-bottom:0.4rem;">Message au client (visible sur la page suivi)</label>
          <textarea id="ord-message" rows="3" style="width:100%;background:var(--bg-soft,#15131a);border:1px solid var(--line,rgba(200,153,104,0.18));color:var(--ivory,#f5ede0);padding:0.7rem 0.9rem;font-family:Inter,sans-serif;font-size:0.92rem;border-radius:2px;box-sizing:border-box;resize:vertical;" placeholder="Ex: Votre commande est en finition, livraison prévue le 18 mai…">${escapeHtml(o.message_to_client || '')}</textarea>
          <button type="button" id="ord-save-msg" style="margin-top:0.5rem;background:transparent;border:1px solid var(--gold,#c89968);color:var(--gold,#c89968);padding:0.5rem 1rem;font-size:0.72rem;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;border-radius:2px;">Enregistrer le message</button>
        </div>

        <!-- HISTORIQUE -->
        <div style="margin-bottom:1.4rem;">
          <strong style="color:var(--gold,#c89968);font-size:0.72rem;letter-spacing:1.5px;text-transform:uppercase;">Historique</strong>
          <ul style="margin:0.4rem 0 0 1.2rem;font-size:0.85rem;color:var(--ivory-dim,#d4c8b3);">${historyHTML || '<li>—</li>'}</ul>
        </div>

        <!-- ACTIONS -->
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;padding-top:1rem;border-top:1px solid var(--line,rgba(200,153,104,0.18));">
          <button type="button" id="ord-validate-payment" ${paid ? 'disabled style="opacity:0.55;cursor:not-allowed;"' : ''} class="hbt-btn-primary" style="padding:0.7rem 1.1rem;font-size:0.72rem;background:${paid ? '#5cc488' : '#2e8a56'};border:none;">${paid ? '✓ Paiement confirmé' : 'Valider le paiement'}</button>
          <button type="button" id="ord-generate-invoice" class="hbt-btn-primary" style="padding:0.7rem 1.1rem;font-size:0.72rem;" ${paid ? '' : 'disabled title="Confirmer le paiement avant" style="opacity:0.5;cursor:not-allowed;padding:0.7rem 1.1rem;font-size:0.72rem;"'}>Générer facture PDF</button>
          ${o.invoice_id ? `<button type="button" id="ord-print-invoice" style="padding:0.7rem 1.1rem;font-size:0.72rem;letter-spacing:1.5px;text-transform:uppercase;border:1px solid var(--gold,#c89968);background:transparent;color:var(--gold,#c89968);cursor:pointer;border-radius:2px;">Imprimer facture</button>` : ''}
          <a href="suivi.html?id=${encodeURIComponent(o.id)}" target="_blank" style="margin-left:auto;color:var(--gold,#c89968);font-size:0.85rem;align-self:center;">Voir suivi client →</a>
        </div>
        ${o.invoice_id ? '<div style="margin-top:0.7rem;font-size:0.8rem;color:var(--muted);">Facture associée : <strong style="color:var(--gold);font-family:Menlo,monospace;">' + escapeHtml(o.invoice_id) + '</strong></div>' : ''}
      </div>
    `;
    document.body.appendChild(modal);
    const closeModal = () => modal.remove();
    modal.querySelectorAll('.ord-modal-close').forEach(b => b.addEventListener('click', closeModal));
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // === Sauvegarde message client ===
    $('#ord-save-msg', modal).addEventListener('click', async () => {
      const msg = $('#ord-message', modal).value;
      try {
        await window.OrderService.update
          ? await window.OrderService.update(o.id, { message_to_client: msg })
          : (await fetch(window.HBT_CONFIG.supabase.url + '/rest/v1/orders?id=eq.' + encodeURIComponent(o.id), {
              method: 'PATCH',
              headers: {
                apikey: window.HBT_CONFIG.supabase.anonKey,
                Authorization: 'Bearer ' + window.HBT_CONFIG.supabase.anonKey,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ message_to_client: msg, updated_at: new Date().toISOString() })
            }));
        o.message_to_client = msg;
        toast('✓ Message enregistré', '#2e8a56');
      } catch (err) {
        toast('❌ ' + err.message, '#c45b5b');
      }
    });

    // === Valider paiement (+ création auto entrée comptable) ===
    $('#ord-validate-payment', modal).addEventListener('click', async () => {
      if (paid) return;
      const amount = prompt('Montant payé en FCFA (laisser vide = total) :', (o.total || ''));
      if (amount === null) return;
      const method = prompt('Mode de paiement (Mobile Money / Virement / Espèces / Carte) :', o.payment_method || 'Mobile Money');
      if (method === null) return;
      try {
        const amountPaid = amount === '' ? (Number(o.total) || 0) : Number(amount);
        const patch = {
          payment_confirmed: true,
          amount_paid: amountPaid,
          payment_method: method,
          updated_at: new Date().toISOString()
        };
        await fetch(window.HBT_CONFIG.supabase.url + '/rest/v1/orders?id=eq.' + encodeURIComponent(o.id), {
          method: 'PATCH',
          headers: {
            apikey: window.HBT_CONFIG.supabase.anonKey,
            Authorization: 'Bearer ' + window.HBT_CONFIG.supabase.anonKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(patch)
        });
        Object.assign(o, patch);

        // === Création entrée comptable (idempotent grâce à UNIQUE(order_id)) ===
        try {
          const accId = 'ACC-' + new Date().toISOString().slice(2,10).replace(/-/g,'') + '-' +
                        Math.random().toString(36).slice(2,6).toUpperCase();
          const accEntry = {
            id: accId,
            order_id: o.id,
            invoice_id: o.invoice_id || '',
            client_name: o.customer_name || '',
            client_phone: o.phone || '',
            amount_paid: amountPaid,
            order_total: Number(o.total) || 0,
            payment_method: method,
            paid_at: new Date().toISOString(),
            status: 'recorded',
            notes: ''
          };
          const accRes = await fetch(window.HBT_CONFIG.supabase.url + '/rest/v1/accounting_entries', {
            method: 'POST',
            headers: {
              apikey: window.HBT_CONFIG.supabase.anonKey,
              Authorization: 'Bearer ' + window.HBT_CONFIG.supabase.anonKey,
              'Content-Type': 'application/json',
              Prefer: 'resolution=ignore-duplicates'
            },
            body: JSON.stringify(accEntry)
          });
          if (!accRes.ok && accRes.status !== 409) {
            const txt = await accRes.text();
            if (accRes.status === 404 || /accounting_entries.*does not exist/i.test(txt)) {
              console.warn('[Compta] Table absente — exécutez setup-accounting.sql');
            } else {
              console.warn('[Compta] Insert ' + accRes.status, txt.slice(0, 200));
            }
          }
        } catch (accErr) {
          console.warn('[Compta] Erreur entrée comptable :', accErr.message);
          // Non bloquant : le paiement est validé même si la compta échoue
        }

        // Avance statut si on est en amont
        const idx = ORDER_STATUSES_ADMIN.findIndex(s => s.key === o.status);
        const idxPaid = ORDER_STATUSES_ADMIN.findIndex(s => s.key === 'payment_confirmed');
        if (idx < idxPaid) {
          await window.OrderService.updateStatus(o.id, 'payment_confirmed', 'Paiement confirmé');
          o.status = 'payment_confirmed';
        }
        toast('✓ Paiement confirmé + entrée comptable créée', '#2e8a56');
        closeModal();
        loadOrders();
      } catch (err) {
        toast('❌ ' + err.message, '#c45b5b');
      }
    });

    // === Générer facture PDF (passe la commande à invoice-pdf.js) ===
    $('#ord-generate-invoice', modal).addEventListener('click', () => {
      if (!paid) {
        toast('⚠ Valider d\'abord le paiement', '#c89968');
        return;
      }
      closeModal();
      // Active l'onglet Devis & Factures + précharge la commande
      const tabBtn = document.querySelector('.hbt-extras-tab[data-tab="docs"]');
      if (tabBtn) tabBtn.click();
      // Attendre que la section soit montée puis remplir
      setTimeout(() => {
        const sel = document.querySelector('#doc-order');
        const typeSel = document.querySelector('#doc-type');
        if (typeSel) { typeSel.value = 'invoice'; typeSel.dispatchEvent(new Event('change')); }
        if (sel) {
          // Assure que l'option existe
          if (!sel.querySelector('option[value="' + o.id + '"]')) {
            const opt = document.createElement('option');
            opt.value = o.id;
            opt.textContent = o.id + ' — ' + (o.customer_name || '?');
            sel.appendChild(opt);
          }
          sel.value = o.id;
          sel.dispatchEvent(new Event('change'));
        }
        toast('Facture préparée — modifiez puis Téléchargez', '#c89968');
      }, 400);
    });

    // === Imprimer facture (si existe déjà) ===
    const printBtn = $('#ord-print-invoice', modal);
    if (printBtn) printBtn.addEventListener('click', () => {
      window.open('suivi.html?id=' + encodeURIComponent(o.id) + '#facture', '_blank');
    });
  }

  /* ============================================================
     INJECTION DOM avec système d'onglets
     ============================================================ */
  function inject() {
    // Trouve le bon emplacement : juste avant le <h2>Produits</h2>
    const main = $('main .container');
    if (!main) {
      console.warn('[admin-extras] main container introuvable');
      return;
    }
    const beforeNode = Array.from(main.querySelectorAll('h2'))
      .find(h => h.textContent.trim() === 'Produits');

    const wrap = document.createElement('div');
    wrap.id = 'hbt-extras-wrap';
    wrap.className = 'hbt-extras-section';
    wrap.innerHTML = `
      <div class="hbt-extras-tabs">
        <button type="button" class="hbt-extras-tab active" data-tab="orders">Gestion des commandes</button>
        <button type="button" class="hbt-extras-tab" data-tab="new-product">+ Nouveau produit</button>
        <button type="button" class="hbt-extras-tab" data-tab="docs">Devis &amp; Factures</button>
        <button type="button" class="hbt-extras-tab" data-tab="requests">Demandes de devis</button>
        <button type="button" class="hbt-extras-tab" data-tab="accounting">Comptabilité</button>
      </div>
      <div id="hbt-extras-content"></div>
    `;

    if (beforeNode) {
      beforeNode.parentNode.insertBefore(wrap, beforeNode);
    } else {
      main.insertBefore(wrap, main.firstChild);
    }

    // Tab switching
    $$('.hbt-extras-tab', wrap).forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.hbt-extras-tab', wrap).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        showTab(btn.dataset.tab);
      });
    });

    // Onglet par défaut : Gestion des commandes (priorité business)
    showTab('orders');
    console.log('[admin-extras] Sections "Gestion des commandes" + "Nouveau produit" injectées');
  }

  function showTab(tab) {
    const content = $('#hbt-extras-content');
    if (!content) return;
    if (tab === 'new-product') {
      content.innerHTML = newProductHTML();
      wireNewProduct();
    } else if (tab === 'orders') {
      content.innerHTML = ordersHTML();
      wireOrders();
      loadOrders();
    } else if (tab === 'docs') {
      content.classList.add('hbt-invoice-section');
      if (typeof window.HBT_renderInvoiceTab === 'function') {
        window.HBT_renderInvoiceTab(content);
      } else {
        renderDocsTabInline(content);
      }
    } else if (tab === 'requests') {
      content.classList.remove('hbt-invoice-section');
      renderQuoteRequestsTab(content);
    } else if (tab === 'accounting') {
      content.classList.remove('hbt-invoice-section');
      renderAccountingTab(content);
    }
  }

  /* ============================================================
     COMPTABILITÉ — Lecture accounting_entries Supabase
     ============================================================ */
  let allAccEntries = [];

  function accFmt(n) {
    if (n == null || isNaN(n)) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' FCFA';
  }
  function isoDate(d) {
    return new Date(d).toISOString().slice(0, 10);
  }
  function todayISO() { return new Date().toISOString().slice(0, 10); }
  function firstOfMonth() {
    const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10);
  }
  function firstOfYear() {
    const d = new Date(d.getFullYear ? d.getFullYear() : Date.now());
    return new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
  }

  function renderAccountingTab(container) {
    container.innerHTML = `
      <div class="hbt-extras-section">
        <h2 style="font-family:var(--serif,'Playfair Display'),serif;color:var(--gold,#c89968);font-size:1.4rem;margin:0 0 0.4rem;">Comptabilité</h2>
        <p style="color:var(--muted,#8a7e6a);font-size:0.9rem;margin-bottom:1.4rem;">Paiements encaissés. Une entrée est créée automatiquement quand vous validez un paiement dans une commande.</p>

        <!-- KPIs -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:0.8rem;margin-bottom:1.6rem;">
          <div style="background:rgba(46,138,86,0.08);border-left:3px solid #2e8a56;padding:1rem 1.2rem;border-radius:2px;">
            <div style="color:#5cc488;font-size:0.7rem;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;margin-bottom:0.3rem;">Aujourd'hui</div>
            <div id="acc-kpi-day" style="font-family:var(--serif,'Playfair Display'),serif;font-size:1.4rem;color:var(--ivory,#f5ede0);">—</div>
            <div id="acc-kpi-day-count" style="font-size:0.78rem;color:var(--muted);margin-top:0.2rem;">— paiement(s)</div>
          </div>
          <div style="background:rgba(200,153,104,0.08);border-left:3px solid var(--gold,#c89968);padding:1rem 1.2rem;border-radius:2px;">
            <div style="color:var(--gold,#c89968);font-size:0.7rem;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;margin-bottom:0.3rem;">Ce mois</div>
            <div id="acc-kpi-month" style="font-family:var(--serif,'Playfair Display'),serif;font-size:1.4rem;color:var(--ivory,#f5ede0);">—</div>
            <div id="acc-kpi-month-count" style="font-size:0.78rem;color:var(--muted);margin-top:0.2rem;">— paiement(s)</div>
          </div>
          <div style="background:rgba(200,153,104,0.05);border-left:3px solid #d4a766;padding:1rem 1.2rem;border-radius:2px;">
            <div style="color:#d4a766;font-size:0.7rem;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;margin-bottom:0.3rem;">Cette année</div>
            <div id="acc-kpi-year" style="font-family:var(--serif,'Playfair Display'),serif;font-size:1.4rem;color:var(--ivory,#f5ede0);">—</div>
            <div id="acc-kpi-year-count" style="font-size:0.78rem;color:var(--muted);margin-top:0.2rem;">— paiement(s)</div>
          </div>
        </div>

        <!-- Filtres -->
        <div class="hbt-orders-controls" style="margin-bottom:1rem;">
          <input type="text" id="acc-search" placeholder="Rechercher : client, téléphone, n° commande…">
          <select id="acc-method">
            <option value="">Tous modes</option>
            <option>Mobile Money</option>
            <option>Virement bancaire</option>
            <option>Espèces</option>
            <option>Carte bancaire</option>
            <option>Chèque</option>
          </select>
          <input type="date" id="acc-from" title="Date de début">
          <input type="date" id="acc-to"   title="Date de fin">
          <button type="button" class="hbt-btn-primary" id="acc-refresh" style="padding:0.6rem 1.2rem;font-size:0.75rem;">Rafraîchir</button>
        </div>

        <!-- Actions export -->
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem;">
          <button type="button" id="acc-export-csv" style="padding:0.6rem 1.1rem;font-size:0.72rem;letter-spacing:1.5px;text-transform:uppercase;border:1px solid var(--gold,#c89968);background:transparent;color:var(--gold,#c89968);cursor:pointer;border-radius:2px;">Exporter CSV</button>
          <button type="button" id="acc-export-pdf" style="padding:0.6rem 1.1rem;font-size:0.72rem;letter-spacing:1.5px;text-transform:uppercase;border:1px solid var(--gold,#c89968);background:transparent;color:var(--gold,#c89968);cursor:pointer;border-radius:2px;">Exporter PDF</button>
          <button type="button" id="acc-monthly" style="padding:0.6rem 1.1rem;font-size:0.72rem;letter-spacing:1.5px;text-transform:uppercase;background:var(--gold,#c89968);border:none;color:#fff;cursor:pointer;border-radius:2px;">Résumé mensuel imprimable</button>
        </div>

        <div id="acc-status-line" style="font-size:0.85rem;color:var(--muted);margin-bottom:0.8rem;"></div>

        <div style="overflow-x:auto;">
          <table class="hbt-orders-table" id="acc-table">
            <thead><tr>
              <th>Date</th><th>Client</th><th>N° Commande</th><th>N° Facture</th>
              <th>Montant payé</th><th>Total commande</th><th>Solde</th>
              <th>Mode</th><th>Statut</th>
            </tr></thead>
            <tbody><tr><td colspan="9" style="text-align:center;color:var(--muted);padding:1.4rem;">Chargement…</td></tr></tbody>
          </table>
        </div>
      </div>
    `;
    wireAccountingTab();
    loadAccountingEntries();
  }

  async function loadAccountingEntries() {
    const tbody = document.querySelector('#acc-table tbody');
    const line  = document.querySelector('#acc-status-line');
    if (!tbody) return;

    const supaOk = (window.HBT_CONFIG && window.HBT_CONFIG.isSupabaseReady && window.HBT_CONFIG.isSupabaseReady());
    if (!supaOk) {
      if (line) { line.innerHTML = '⚠ Supabase non configuré — comptabilité indisponible'; line.style.color = '#c89968'; }
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:1.4rem;">Configurez Supabase dans config.js</td></tr>';
      return;
    }

    try {
      const res = await fetch(window.HBT_CONFIG.supabase.url + '/rest/v1/accounting_entries?select=*&order=paid_at.desc', {
        headers: {
          apikey: window.HBT_CONFIG.supabase.anonKey,
          Authorization: 'Bearer ' + window.HBT_CONFIG.supabase.anonKey
        },
        cache: 'no-store'
      });
      if (res.ok) {
        allAccEntries = await res.json();
        if (line) { line.innerHTML = '✓ Connecté à Supabase — ' + allAccEntries.length + ' paiement(s)'; line.style.color = '#2e8a56'; }
        renderAccountingRows();
        return;
      }
      const txt = await res.text();
      if (res.status === 404 || /accounting_entries.*does not exist/i.test(txt)) {
        line.innerHTML = '❌ Table <code>accounting_entries</code> introuvable.' +
          '<div style="background:rgba(196,91,91,0.08);border-left:3px solid #c45b5b;padding:1rem 1.2rem;margin-top:0.8rem;border-radius:2px;color:var(--ivory-dim);font-size:0.92rem;line-height:1.6;">' +
          '<strong style="color:#e88c8c;display:block;margin-bottom:0.5rem;">Pour activer :</strong>' +
          '<ol style="margin:0;padding-left:1.4rem;"><li>Supabase → SQL Editor → New query</li>' +
          '<li>Copiez <code style="background:rgba(200,153,104,0.12);padding:0.15rem 0.4rem;border-radius:2px;color:var(--gold);">setup-accounting.sql</code></li>' +
          '<li>Collez → Run</li><li>Cliquez Rafraîchir</li></ol></div>';
        line.style.color = '#e88c8c';
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:1.4rem;">— Aucune donnée chargée —</td></tr>';
      } else {
        line.innerHTML = '❌ Erreur Supabase ' + res.status + ': ' + escapeHtml(txt.slice(0, 200));
        line.style.color = '#e88c8c';
      }
    } catch (e) {
      line.innerHTML = '❌ Erreur réseau : ' + escapeHtml(e.message);
      line.style.color = '#e88c8c';
    }
  }

  function renderAccountingRows() {
    const tbody = document.querySelector('#acc-table tbody');
    if (!tbody) return;

    const q       = (document.querySelector('#acc-search').value || '').trim().toLowerCase();
    const method  = document.querySelector('#acc-method').value;
    const from    = document.querySelector('#acc-from').value;
    const to      = document.querySelector('#acc-to').value;

    const filtered = allAccEntries.filter(e => {
      if (method && e.payment_method !== method) return false;
      if (from && isoDate(e.paid_at) < from) return false;
      if (to   && isoDate(e.paid_at) > to)   return false;
      if (q) {
        const blob = [e.client_name, e.client_phone, e.order_id, e.invoice_id].filter(Boolean).join(' ').toLowerCase();
        if (blob.indexOf(q) === -1) return false;
      }
      return true;
    });

    // KPIs (sur la liste filtrée)
    const todayStr = todayISO();
    const monthStart = firstOfMonth();
    const yearStart = firstOfYear();
    const sumIf = (cond) => filtered.filter(cond).reduce((s, e) => s + (Number(e.amount_paid) || 0), 0);
    const countIf = (cond) => filtered.filter(cond).length;

    const dayTotal   = sumIf(e => isoDate(e.paid_at) === todayStr);
    const dayCount   = countIf(e => isoDate(e.paid_at) === todayStr);
    const monthTotal = sumIf(e => isoDate(e.paid_at) >= monthStart);
    const monthCount = countIf(e => isoDate(e.paid_at) >= monthStart);
    const yearTotal  = sumIf(e => isoDate(e.paid_at) >= yearStart);
    const yearCount  = countIf(e => isoDate(e.paid_at) >= yearStart);

    document.querySelector('#acc-kpi-day').textContent         = accFmt(dayTotal);
    document.querySelector('#acc-kpi-day-count').textContent   = dayCount + ' paiement' + (dayCount > 1 ? 's' : '');
    document.querySelector('#acc-kpi-month').textContent       = accFmt(monthTotal);
    document.querySelector('#acc-kpi-month-count').textContent = monthCount + ' paiement' + (monthCount > 1 ? 's' : '');
    document.querySelector('#acc-kpi-year').textContent        = accFmt(yearTotal);
    document.querySelector('#acc-kpi-year-count').textContent  = yearCount + ' paiement' + (yearCount > 1 ? 's' : '');

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:1.8rem;">Aucune entrée comptable ne correspond aux critères.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(e => {
      const orderTotal = Number(e.order_total) || 0;
      const paid = Number(e.amount_paid) || 0;
      const balance = Math.max(0, orderTotal - paid);
      const statusColor = e.status === 'refunded' ? '#c45b5b' : (e.status === 'adjusted' ? '#c89968' : '#5cc488');
      const statusLabel = e.status === 'refunded' ? 'Remboursé' : (e.status === 'adjusted' ? 'Ajusté' : 'Enregistré');
      return `
        <tr data-id="${escapeHtml(e.id)}">
          <td data-label="Date">${fmt(e.paid_at)}</td>
          <td data-label="Client"><strong>${escapeHtml(e.client_name || '—')}</strong>${e.client_phone ? '<br><span style="color:var(--muted);font-size:0.8rem;">' + escapeHtml(e.client_phone) + '</span>' : ''}</td>
          <td data-label="N° Commande"><span class="hbt-order-id-cell">${escapeHtml(e.order_id || '—')}</span></td>
          <td data-label="N° Facture">${e.invoice_id ? '<span style="font-family:Menlo,monospace;color:var(--gold);">' + escapeHtml(e.invoice_id) + '</span>' : '—'}</td>
          <td data-label="Montant payé" style="font-weight:600;color:#5cc488;">${accFmt(paid)}</td>
          <td data-label="Total commande" style="color:var(--ivory-dim);">${orderTotal ? accFmt(orderTotal) : '—'}</td>
          <td data-label="Solde" style="color:${balance > 0 ? '#e88c8c' : '#5cc488'};font-weight:600;">${balance > 0 ? accFmt(balance) : '✓'}</td>
          <td data-label="Mode">${escapeHtml(e.payment_method || '—')}</td>
          <td data-label="Statut"><span style="padding:0.25rem 0.6rem;font-size:0.7rem;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;color:${statusColor};border:1px solid ${statusColor};border-radius:999px;">${statusLabel}</span></td>
        </tr>`;
    }).join('');
  }

  function wireAccountingTab() {
    document.querySelector('#acc-search').addEventListener('input', renderAccountingRows);
    document.querySelector('#acc-method').addEventListener('change', renderAccountingRows);
    document.querySelector('#acc-from').addEventListener('change', renderAccountingRows);
    document.querySelector('#acc-to').addEventListener('change', renderAccountingRows);
    document.querySelector('#acc-refresh').addEventListener('click', loadAccountingEntries);
    document.querySelector('#acc-export-csv').addEventListener('click', exportAccountingCSV);
    document.querySelector('#acc-export-pdf').addEventListener('click', exportAccountingPDF);
    document.querySelector('#acc-monthly').addEventListener('click', printMonthlySummary);
  }

  /* === Export CSV (blob natif, fonctionne partout) === */
  function exportAccountingCSV() {
    const q       = (document.querySelector('#acc-search').value || '').trim().toLowerCase();
    const method  = document.querySelector('#acc-method').value;
    const from    = document.querySelector('#acc-from').value;
    const to      = document.querySelector('#acc-to').value;
    const data = allAccEntries.filter(e => {
      if (method && e.payment_method !== method) return false;
      if (from && isoDate(e.paid_at) < from) return false;
      if (to   && isoDate(e.paid_at) > to)   return false;
      if (q) {
        const blob = [e.client_name, e.client_phone, e.order_id, e.invoice_id].filter(Boolean).join(' ').toLowerCase();
        if (blob.indexOf(q) === -1) return false;
      }
      return true;
    });

    const headers = ['Date', 'Client', 'Téléphone', 'N° Commande', 'N° Facture', 'Montant payé', 'Total commande', 'Solde', 'Mode', 'Statut'];
    const rows = data.map(e => {
      const orderTotal = Number(e.order_total) || 0;
      const paid = Number(e.amount_paid) || 0;
      const balance = Math.max(0, orderTotal - paid);
      return [
        fmt(e.paid_at),
        e.client_name || '',
        e.client_phone || '',
        e.order_id || '',
        e.invoice_id || '',
        paid,
        orderTotal,
        balance,
        e.payment_method || '',
        e.status || 'recorded'
      ];
    });

    function csvEscape(v) {
      const s = String(v == null ? '' : v);
      if (/[",\n;]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    }
    const csv = '﻿' + // BOM UTF-8 pour Excel
      [headers.map(csvEscape).join(';')]
      .concat(rows.map(r => r.map(csvEscape).join(';')))
      .join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hbt-comptabilite-' + todayISO() + '.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('✓ CSV exporté (' + data.length + ' lignes)', '#2e8a56');
  }

  /* === Export PDF (html2pdf si dispo, sinon Imprimer) === */
  function buildAccountingPdfHTML(entries, periodLabel) {
    const total = entries.reduce((s, e) => s + (Number(e.amount_paid) || 0), 0);
    const rows = entries.map(e => {
      const orderTotal = Number(e.order_total) || 0;
      const paid = Number(e.amount_paid) || 0;
      const balance = Math.max(0, orderTotal - paid);
      return `<tr>
        <td style="padding:10px;border-bottom:1px solid #e8dcbf;font-size:9.5pt;">${fmt(e.paid_at)}</td>
        <td style="padding:10px;border-bottom:1px solid #e8dcbf;font-size:9.5pt;"><strong>${escapeHtml(e.client_name || '—')}</strong></td>
        <td style="padding:10px;border-bottom:1px solid #e8dcbf;font-size:9pt;font-family:Menlo,monospace;color:#c89968;">${escapeHtml(e.order_id || '—')}</td>
        <td style="padding:10px;border-bottom:1px solid #e8dcbf;font-size:9pt;">${escapeHtml(e.invoice_id || '—')}</td>
        <td style="padding:10px;border-bottom:1px solid #e8dcbf;font-size:9.5pt;text-align:right;font-weight:600;color:#2e8a56;">${accFmt(paid)}</td>
        <td style="padding:10px;border-bottom:1px solid #e8dcbf;font-size:9.5pt;">${escapeHtml(e.payment_method || '—')}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="6" style="padding:30px;text-align:center;color:#7a6f5e;font-style:italic;">Aucun paiement</td></tr>';

    return `
<div style="width:210mm;min-height:297mm;padding:18mm 16mm;background:#fbf7ed;color:#1a1410;font-family:'Inter',Helvetica,Arial,sans-serif;box-sizing:border-box;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #c89968;padding-bottom:16px;margin-bottom:24px;">
    <div>
      <div style="font-family:'Playfair Display',Georgia,serif;font-size:22pt;color:#1a1410;font-weight:500;letter-spacing:1px;">HOME BY <em style="color:#c89968;font-style:italic;font-weight:600;">TIKA</em></div>
      <div style="color:#7a6f5e;font-size:9pt;letter-spacing:3px;text-transform:uppercase;margin-top:4px;">Comptabilité</div>
    </div>
    <div style="text-align:right;">
      <div style="background:#1a1410;color:#c89968;padding:8px 18px;font-size:12pt;font-weight:700;letter-spacing:3px;display:inline-block;">RAPPORT</div>
      <div style="font-size:10pt;margin-top:8px;color:#1a1410;">${escapeHtml(periodLabel)}</div>
      <div style="color:#7a6f5e;font-size:9pt;margin-top:2px;">Édité le ${new Date().toLocaleDateString('fr-FR')}</div>
    </div>
  </div>
  <div style="background:rgba(200,153,104,0.07);border-left:3px solid #c89968;padding:14px 18px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
    <div><div style="color:#c89968;font-size:9pt;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Total encaissé</div>
      <div style="font-family:'Playfair Display',serif;font-size:18pt;color:#1a1410;font-weight:700;margin-top:4px;">${accFmt(total)}</div></div>
    <div style="text-align:right;color:#7a6f5e;font-size:10pt;">${entries.length} paiement${entries.length > 1 ? 's' : ''}</div>
  </div>
  <table style="width:100%;border-collapse:collapse;">
    <thead><tr style="background:#1a1410;color:#c89968;">
      <th style="padding:11px;text-align:left;font-size:8.5pt;letter-spacing:1.5px;text-transform:uppercase;">Date</th>
      <th style="padding:11px;text-align:left;font-size:8.5pt;letter-spacing:1.5px;text-transform:uppercase;">Client</th>
      <th style="padding:11px;text-align:left;font-size:8.5pt;letter-spacing:1.5px;text-transform:uppercase;">N° Cmd</th>
      <th style="padding:11px;text-align:left;font-size:8.5pt;letter-spacing:1.5px;text-transform:uppercase;">N° Fac</th>
      <th style="padding:11px;text-align:right;font-size:8.5pt;letter-spacing:1.5px;text-transform:uppercase;">Montant</th>
      <th style="padding:11px;text-align:left;font-size:8.5pt;letter-spacing:1.5px;text-transform:uppercase;">Mode</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div style="border-top:1px solid #e8dcbf;padding-top:14px;margin-top:24px;text-align:center;color:#7a6f5e;font-size:8.5pt;letter-spacing:1px;">
    HOME BY TIKA · Songon, Cité la Grâce — Abidjan · Document comptable interne
  </div>
</div>`;
  }

  async function exportAccountingPDF() {
    const filtered = getFilteredAccountingEntries();
    const fromDate = document.querySelector('#acc-from').value || 'début';
    const toDate   = document.querySelector('#acc-to').value || 'aujourd\'hui';
    const periodLabel = 'Du ' + fromDate + ' au ' + toDate;
    const html = buildAccountingPdfHTML(filtered, periodLabel);

    if (!window.html2pdf) {
      // Fallback : ouvrir une fenêtre pour Impression → Enregistrer PDF
      const w = window.open('', '_blank');
      if (!w) { alert('Pop-up bloquée. Autorisez les pop-ups.'); return; }
      w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Comptabilité — ' + periodLabel + '</title><style>@page{margin:0;size:A4;}body{margin:0;}</style></head><body>' + html + '<script>window.onload=function(){setTimeout(function(){window.print();},300);};</script></body></html>');
      w.document.close();
      return;
    }
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'fixed'; container.style.top = '-99999px';
    document.body.appendChild(container);
    try {
      await window.html2pdf().from(container.firstElementChild).set({
        margin: 0, filename: 'hbt-comptabilite-' + todayISO() + '.pdf',
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, backgroundColor: '#fbf7ed' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).save();
      toast('✓ PDF exporté', '#2e8a56');
    } catch (e) {
      toast('❌ Erreur PDF : ' + e.message, '#c45b5b');
    } finally {
      container.remove();
    }
  }

  function getFilteredAccountingEntries() {
    const q       = (document.querySelector('#acc-search').value || '').trim().toLowerCase();
    const method  = document.querySelector('#acc-method').value;
    const from    = document.querySelector('#acc-from').value;
    const to      = document.querySelector('#acc-to').value;
    return allAccEntries.filter(e => {
      if (method && e.payment_method !== method) return false;
      if (from && isoDate(e.paid_at) < from) return false;
      if (to   && isoDate(e.paid_at) > to)   return false;
      if (q) {
        const blob = [e.client_name, e.client_phone, e.order_id, e.invoice_id].filter(Boolean).join(' ').toLowerCase();
        if (blob.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  /* === Résumé mensuel imprimable === */
  function printMonthlySummary() {
    const monthStart = firstOfMonth();
    const monthEntries = allAccEntries.filter(e => isoDate(e.paid_at) >= monthStart);
    const monthLabel = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const html = buildAccountingPdfHTML(monthEntries, 'Mois de ' + monthLabel);
    const w = window.open('', '_blank');
    if (!w) { alert('Pop-up bloquée.'); return; }
    w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Comptabilité ' + monthLabel + '</title><style>@page{margin:0;size:A4;}body{margin:0;}</style></head><body>' + html + '<script>window.onload=function(){setTimeout(function(){window.print();},300);};</script></body></html>');
    w.document.close();
  }

  /* ============================================================
     DEMANDES DE DEVIS (quote_requests Supabase)
     ============================================================ */
  const QUOTE_STATUSES = [
    { key: 'new',         label: 'Nouveau',       color: '#8a7860' },
    { key: 'discussion',  label: 'En discussion', color: '#b48249' },
    { key: 'quote_sent',  label: 'Devis envoyé',  color: '#d4a766' },
    { key: 'confirmed',   label: 'Confirmé',      color: '#2e8a56' },
    { key: 'refused',     label: 'Refusé',        color: '#c45b5b' }
  ];
  function qStatusInfo(k) { return QUOTE_STATUSES.find(s => s.key === k) || QUOTE_STATUSES[0]; }
  let allQuotes = [];

  function renderQuoteRequestsTab(container) {
    container.innerHTML = `
      <div class="hbt-extras-section">
        <h2 style="font-family:var(--serif,'Playfair Display'),serif;color:var(--gold,#c89968);font-size:1.4rem;margin:0 0 0.4rem;">Demandes de devis</h2>
        <p style="color:var(--muted,#8a7e6a);font-size:0.9rem;margin-bottom:1.4rem;">Demandes envoyées depuis le site via le formulaire "Demander un devis". Sauvegarde automatique dans Supabase.</p>

        <div class="hbt-orders-controls">
          <input type="text" id="q-search" placeholder="Rechercher : nom, téléphone, produit, ville…">
          <select id="q-filter">
            <option value="">Tous statuts</option>
            ${QUOTE_STATUSES.map(s => `<option value="${s.key}">${s.label}</option>`).join('')}
          </select>
          <button type="button" class="hbt-btn-primary" id="q-refresh" style="padding:0.6rem 1.2rem;font-size:0.75rem;">Rafraîchir</button>
        </div>

        <div id="q-status-line" style="font-size:0.85rem;color:var(--muted);margin-bottom:0.8rem;"></div>

        <div style="overflow-x:auto;">
          <table class="hbt-orders-table" id="q-table">
            <thead><tr>
              <th>Réf</th><th>Date</th><th>Client</th><th>Téléphone</th>
              <th>Produit</th><th>Localisation</th><th>Statut</th><th>Actions</th>
            </tr></thead>
            <tbody><tr><td colspan="8" style="text-align:center;color:var(--muted);padding:1.4rem;">Chargement…</td></tr></tbody>
          </table>
        </div>
      </div>
    `;
    wireQuoteRequests();
    loadQuoteRequests();
  }

  async function loadQuoteRequests() {
    const tbody = document.querySelector('#q-table tbody');
    const line  = document.querySelector('#q-status-line');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted);">Chargement…</td></tr>';

    const supaOk = (window.HBT_CONFIG && window.HBT_CONFIG.isSupabaseReady && window.HBT_CONFIG.isSupabaseReady());

    // CAS 1 : Supabase pas configuré du tout → localStorage légitimement (mode dégradé)
    if (!supaOk) {
      if (line) { line.innerHTML = '⚠ Supabase non configuré (config.js) — affichage localStorage'; line.style.color = '#c89968'; }
      loadFromLocalStorage();
      renderQuoteRows();
      return;
    }

    // CAS 2 : Supabase configuré → on lit. Si erreur, on AFFICHE l'erreur (pas de silent fallback)
    try {
      const res = await fetch(window.HBT_CONFIG.supabase.url + '/rest/v1/quote_requests?select=*&order=created_at.desc', {
        headers: {
          apikey: window.HBT_CONFIG.supabase.anonKey,
          Authorization: 'Bearer ' + window.HBT_CONFIG.supabase.anonKey
        },
        cache: 'no-store'
      });
      if (res.ok) {
        allQuotes = await res.json();
        if (line) { line.innerHTML = '✓ Connecté à Supabase — ' + allQuotes.length + ' demande(s)'; line.style.color = '#2e8a56'; }
        renderQuoteRows();
        return;
      }
      // Erreur HTTP — analyse explicite pour 404 (table manquante)
      const txt = await res.text();
      let errMsg, errDetail;
      if (res.status === 404 || /relation.*quote_requests.*does not exist/i.test(txt) || /not.*found/i.test(txt)) {
        errMsg = '❌ Table <code>quote_requests</code> introuvable dans Supabase';
        errDetail = `
          <div style="background:rgba(196,91,91,0.08);border-left:3px solid #c45b5b;padding:1rem 1.2rem;margin-top:0.8rem;border-radius:2px;color:var(--ivory-dim);font-size:0.92rem;line-height:1.6;">
            <strong style="color:#e88c8c;display:block;margin-bottom:0.5rem;">Pour corriger :</strong>
            <ol style="margin:0;padding-left:1.4rem;">
              <li>Ouvrez votre projet sur <a href="https://supabase.com" target="_blank" style="color:var(--gold);">supabase.com</a></li>
              <li>Menu de gauche → <strong>SQL Editor</strong> → <strong>New query</strong></li>
              <li>Copiez le contenu du fichier <code style="background:rgba(200,153,104,0.12);padding:0.15rem 0.4rem;border-radius:2px;color:var(--gold);">setup-quote-requests.sql</code></li>
              <li>Collez dans Supabase → <strong>Run</strong></li>
              <li>Revenez ici, cliquez <strong>Rafraîchir</strong></li>
            </ol>
          </div>`;
      } else {
        errMsg = '❌ Erreur Supabase ' + res.status;
        errDetail = '<pre style="background:var(--bg-soft);padding:0.8rem;color:#e88c8c;font-size:0.78rem;overflow-x:auto;border-radius:2px;margin-top:0.6rem;">' + escapeHtml(txt.slice(0, 500)) + '</pre>';
      }
      if (line) { line.innerHTML = errMsg + errDetail; line.style.color = '#e88c8c'; }
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:1.4rem;">— Aucune donnée chargée (voir l\'erreur ci-dessus) —</td></tr>';
      console.error('[QuoteRequests] Supabase ' + res.status, txt);
    } catch (e) {
      console.error('[QuoteRequests] Réseau :', e.message);
      if (line) {
        line.innerHTML = '❌ Erreur réseau — vérifiez votre connexion Internet<br><span style="font-size:0.8rem;color:var(--muted);">' + escapeHtml(e.message) + '</span>';
        line.style.color = '#e88c8c';
      }
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:1.4rem;">— Réseau indisponible —</td></tr>';
    }
  }

  function loadFromLocalStorage() {
    try {
      allQuotes = JSON.parse(localStorage.getItem('home-by-tika-quotes') || '[]')
        .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    } catch (e) { allQuotes = []; }
  }

  function renderQuoteRows() {
    const tbody = document.querySelector('#q-table tbody');
    if (!tbody) return;
    const q = (document.querySelector('#q-search').value || '').trim().toLowerCase();
    const statusFilter = document.querySelector('#q-filter').value;

    const filtered = allQuotes.filter(o => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (q) {
        const blob = [o.id, o.customer_name, o.phone, o.email, o.location, o.product, o.message].filter(Boolean).join(' ').toLowerCase();
        if (blob.indexOf(q) === -1) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:1.8rem;">Aucune demande ne correspond aux critères.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(o => {
      const st = qStatusInfo(o.status);
      return `
        <tr data-id="${escapeHtml(o.id)}">
          <td data-label="Réf"><span class="hbt-order-id-cell">${escapeHtml(o.id)}</span></td>
          <td data-label="Date">${fmt(o.created_at)}</td>
          <td data-label="Client">${escapeHtml(o.customer_name || '—')}</td>
          <td data-label="Téléphone">${escapeHtml(o.phone || '—')}</td>
          <td data-label="Produit">${escapeHtml(o.product || '—')}</td>
          <td data-label="Localisation">${escapeHtml(o.location || '—')}</td>
          <td data-label="Statut">
            <select class="status-select" data-action="q-status" style="border-color:${st.color};color:${st.color};font-weight:600;">
              ${QUOTE_STATUSES.map(s =>
                '<option value="' + s.key + '"' + (s.key === o.status ? ' selected' : '') + '>' + s.label + '</option>'
              ).join('')}
            </select>
          </td>
          <td data-label="Actions">
            <button type="button" data-action="q-view" class="hbt-btn-primary" style="padding:0.4rem 0.8rem;font-size:0.7rem;">Détails</button>
          </td>
        </tr>`;
    }).join('');
  }

  function wireQuoteRequests() {
    document.querySelector('#q-search').addEventListener('input', renderQuoteRows);
    document.querySelector('#q-filter').addEventListener('change', renderQuoteRows);
    document.querySelector('#q-refresh').addEventListener('click', loadQuoteRequests);

    document.querySelector('#q-table tbody').addEventListener('change', async e => {
      if (!e.target.matches('[data-action="q-status"]')) return;
      const select = e.target;
      const id = select.closest('tr').dataset.id;
      const newStatus = select.value;
      const prev = (allQuotes.find(x => x.id === id) || {}).status;
      select.disabled = true; select.style.opacity = '0.55';
      try {
        if (window.HBT_CONFIG && window.HBT_CONFIG.isSupabaseReady && window.HBT_CONFIG.isSupabaseReady()) {
          const cur = allQuotes.find(x => x.id === id);
          const history = Array.isArray(cur && cur.history) ? cur.history.slice() : [];
          history.push({ at: new Date().toISOString(), status: newStatus, note: 'Admin update' });
          const res = await fetch(window.HBT_CONFIG.supabase.url + '/rest/v1/quote_requests?id=eq.' + encodeURIComponent(id), {
            method: 'PATCH',
            headers: {
              apikey: window.HBT_CONFIG.supabase.anonKey,
              Authorization: 'Bearer ' + window.HBT_CONFIG.supabase.anonKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus, history: history, updated_at: new Date().toISOString() })
          });
          if (!res.ok) throw new Error('Supabase ' + res.status);
        }
        const o = allQuotes.find(x => x.id === id);
        if (o) o.status = newStatus;
        const st = qStatusInfo(newStatus);
        select.style.borderColor = st.color; select.style.color = st.color;
        toast('✓ ' + escapeHtml(id) + ' → <strong>' + escapeHtml(st.label) + '</strong>', '#2e8a56');
      } catch (err) {
        toast('❌ Sauvegarde échouée : ' + err.message, '#c45b5b');
        if (prev) select.value = prev;
      } finally {
        select.disabled = false; select.style.opacity = '1';
      }
    });

    document.querySelector('#q-table tbody').addEventListener('click', e => {
      if (e.target.matches('[data-action="q-view"]')) {
        const id = e.target.closest('tr').dataset.id;
        const o = allQuotes.find(x => x.id === id);
        if (o) showQuoteDetails(o);
      }
    });
  }

  function showQuoteDetails(o) {
    const histList = (o.history || []).map(h =>
      '<li>' + fmt(h.at) + ' — <strong>' + escapeHtml(qStatusInfo(h.status).label) + '</strong>' + (h.note ? ' — ' + escapeHtml(h.note) : '') + '</li>'
    ).join('') || '<li style="color:var(--muted);">—</li>';

    const waNum = (window.HBT_CONFIG && window.HBT_CONFIG.contact && window.HBT_CONFIG.contact.whatsapp) || '2250748738671';
    const waMsg = encodeURIComponent('Bonjour ' + (o.customer_name || '') + ', concernant votre demande ' + o.id + ' chez HOME BY TIKA…');
    const waLink = 'https://wa.me/' + (o.phone || waNum).replace(/[^\d+]/g, '') + '?text=' + waMsg;

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99998;display:flex;align-items:flex-start;justify-content:center;padding:1rem;overflow-y:auto;backdrop-filter:blur(4px);';
    modal.innerHTML = `
      <div style="background:var(--bg-card,#1a1820);border:1px solid var(--gold,#c89968);padding:1.8rem;border-radius:4px;max-width:680px;width:100%;font-family:Inter,sans-serif;color:var(--ivory,#f5ede0);margin:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;gap:0.6rem;flex-wrap:wrap;">
          <h3 style="color:var(--gold,#c89968);font-family:'Playfair Display',serif;margin:0;font-size:1.4rem;">${escapeHtml(o.id)}</h3>
          <button type="button" class="q-modal-close" style="background:transparent;border:1px solid var(--line);color:var(--ivory);padding:0.4rem 0.8rem;cursor:pointer;border-radius:2px;">Fermer</button>
        </div>
        <p style="font-size:0.85rem;color:var(--muted);margin-bottom:1.4rem;">Reçue le ${fmt(o.created_at)} · Statut : <strong style="color:${qStatusInfo(o.status).color};">${escapeHtml(qStatusInfo(o.status).label)}</strong></p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem 1.4rem;font-size:0.9rem;margin-bottom:1.2rem;">
          <div><strong style="color:var(--gold);font-size:0.7rem;letter-spacing:1.5px;text-transform:uppercase;">Client</strong><br>${escapeHtml(o.customer_name || '—')}</div>
          <div><strong style="color:var(--gold);font-size:0.7rem;letter-spacing:1.5px;text-transform:uppercase;">Téléphone</strong><br>${escapeHtml(o.phone || '—')}</div>
          <div><strong style="color:var(--gold);font-size:0.7rem;letter-spacing:1.5px;text-transform:uppercase;">Email</strong><br>${escapeHtml(o.email || '—')}</div>
          <div><strong style="color:var(--gold);font-size:0.7rem;letter-spacing:1.5px;text-transform:uppercase;">Localisation</strong><br>${escapeHtml(o.location || '—')}</div>
          <div><strong style="color:var(--gold);font-size:0.7rem;letter-spacing:1.5px;text-transform:uppercase;">Produit</strong><br>${escapeHtml(o.product || '—')}</div>
          <div><strong style="color:var(--gold);font-size:0.7rem;letter-spacing:1.5px;text-transform:uppercase;">Essence</strong><br>${escapeHtml(o.wood || '—')}</div>
          <div><strong style="color:var(--gold);font-size:0.7rem;letter-spacing:1.5px;text-transform:uppercase;">Dimensions</strong><br>${escapeHtml(o.dimensions || '—')}</div>
          <div><strong style="color:var(--gold);font-size:0.7rem;letter-spacing:1.5px;text-transform:uppercase;">Budget</strong><br>${escapeHtml(o.budget || '—')}</div>
        </div>

        <div style="margin-bottom:1.4rem;">
          <strong style="color:var(--gold);font-size:0.72rem;letter-spacing:1.5px;text-transform:uppercase;display:block;margin-bottom:0.4rem;">Message du client</strong>
          <div style="background:var(--bg-soft);padding:0.8rem 1rem;font-size:0.9rem;border-radius:2px;white-space:pre-wrap;color:var(--ivory-dim);">${escapeHtml(o.message || '— Aucun message —')}</div>
        </div>

        <div style="margin-bottom:1.4rem;">
          <strong style="color:var(--gold);font-size:0.72rem;letter-spacing:1.5px;text-transform:uppercase;">Historique</strong>
          <ul style="margin:0.4rem 0 0 1.2rem;font-size:0.85rem;color:var(--ivory-dim);">${histList}</ul>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;padding-top:1rem;border-top:1px solid var(--line);">
          <a href="${waLink}" target="_blank" rel="noopener" style="padding:0.7rem 1.1rem;font-size:0.72rem;letter-spacing:1.5px;text-transform:uppercase;background:#25d366;color:#fff;text-decoration:none;border-radius:2px;font-weight:700;">Contacter sur WhatsApp</a>
          ${o.email ? `<a href="mailto:${escapeHtml(o.email)}?subject=${encodeURIComponent('Devis ' + o.id + ' - HOME BY TIKA')}" style="padding:0.7rem 1.1rem;font-size:0.72rem;letter-spacing:1.5px;text-transform:uppercase;border:1px solid var(--gold);color:var(--gold);text-decoration:none;border-radius:2px;">Email</a>` : ''}
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelectorAll('.q-modal-close').forEach(b => b.addEventListener('click', () => modal.remove()));
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  }

  /* ============================================================
     DEVIS & FACTURES — RENDU INLINE (autonome, sans CDN)
     ----------------------------------------------------------
     Le form, la liste des commandes payées et la liste des factures
     déjà générées s'affichent INSTANTANÉMENT, sans dépendre de Quill
     ou html2pdf. Boutons:
       • Aperçu       → nouvelle fenêtre avec rendu HTML
       • Imprimer/PDF → window.print() avec mise en page A4 (l'utilisateur
                         peut "Enregistrer en PDF" depuis la boîte d'impression)
       • Si html2pdf est chargé (CDN OK) → bouton Téléchargement direct
     ============================================================ */
  let docCurrent = null;
  let docQuill   = null;

  function docFcfa(n) {
    if (n == null || isNaN(n)) return '—';
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' FCFA';
  }
  function docToday() {
    return new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  function docGenId(prefix) {
    const d = new Date(), yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0');
    const r = Math.random().toString(36).slice(2,6).toUpperCase();
    return prefix + '-' + yy + mm + dd + '-' + r;
  }
  function docEmpty(type) {
    return {
      type: type, id: docGenId(type === 'invoice' ? 'FAC' : 'DEV'),
      date: docToday(), orderId: '',
      client: { name: '', phone: '', email: '', address: '' },
      items: [{ name: '', dimensions: '', wood: '', qty: 1, unitPrice: '' }],
      notesHtml: '',
      payment: { method: '', amountPaid: 0 }
    };
  }

  function renderDocsTabInline(container) {
    docCurrent = docEmpty('quote');
    container.innerHTML = buildDocsInlineHTML();
    bindDocsInlineForm(container);
    loadDocsPaidOrders();
    loadDocsExistingInvoices();
    loadDocsOrdersDropdown();
    // Petit log diagnostic
    console.log('[admin-extras] Devis & Factures rendu inline ✓');
    // Tentative chargement html2pdf en arrière-plan (optionnel)
    if (!window.html2pdf) {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      s.async = true;
      s.onload = () => console.log('[admin-extras] html2pdf chargé ✓ (téléchargement direct dispo)');
      s.onerror = () => console.warn('[admin-extras] html2pdf CDN indisponible — fallback Imprimer→PDF utilisable');
      document.head.appendChild(s);
    }
  }

  function buildDocsInlineHTML() {
    return `
      <h2>Devis &amp; Factures</h2>
      <p class="lede">Espace dédié à la facturation. Sélectionnez une commande payée pour générer la facture en 1 clic, ou créez un document manuellement.</p>

      <div style="margin-bottom:1.6rem;background:rgba(46,138,86,0.06);border-left:3px solid #2e8a56;padding:1rem 1.2rem;border-radius:2px;">
        <strong style="color:#5cc488;font-size:0.78rem;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;display:block;margin-bottom:0.7rem;">✓ Commandes payées — prêtes à facturer</strong>
        <div id="docs-paid-orders" style="font-size:0.88rem;color:var(--ivory-dim,#d4c8b3);">Chargement…</div>
      </div>

      <div style="margin-bottom:1.8rem;background:rgba(200,153,104,0.06);border-left:3px solid var(--gold,#c89968);padding:1rem 1.2rem;border-radius:2px;">
        <strong style="color:var(--gold,#c89968);font-size:0.78rem;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;display:block;margin-bottom:0.7rem;">📄 Factures déjà générées</strong>
        <div id="docs-existing-invoices" style="font-size:0.88rem;color:var(--ivory-dim,#d4c8b3);">Chargement…</div>
      </div>

      <div style="border-top:1px solid var(--line,rgba(200,153,104,0.18));padding-top:1.4rem;margin-top:0.4rem;">
        <h3 style="font-family:var(--serif,'Playfair Display'),serif;color:var(--gold,#c89968);font-size:1.15rem;margin:0 0 0.5rem;">Créer un nouveau document</h3>
        <p style="color:var(--muted,#8a7e6a);font-size:0.88rem;margin-bottom:1.2rem;">Devis ou facture — toutes les valeurs sont modifiables avant génération.</p>

        <div class="hbt-form" id="docs-form">
          <div><label>Type de document</label>
            <select id="docs-type"><option value="quote">Devis</option><option value="invoice">Facture</option></select></div>
          <div><label>N° document (auto)</label><input type="text" id="docs-id" readonly></div>
          <div><label>Commande liée (optionnel)</label>
            <select id="docs-order"><option value="">— Aucune —</option></select></div>
          <div><label>Date</label><input type="text" id="docs-date"></div>

          <div class="full" style="border-top:1px solid var(--line,rgba(200,153,104,0.18));padding-top:1rem;margin-top:0.4rem;">
            <h4 style="font-family:var(--serif,'Playfair Display'),serif;color:var(--gold,#c89968);font-size:1.05rem;margin:0 0 1rem;">Informations client</h4>
          </div>
          <div><label>Nom complet *</label><input type="text" id="docs-cname" required></div>
          <div><label>Téléphone</label><input type="text" id="docs-cphone"></div>
          <div><label>Email</label><input type="email" id="docs-cemail"></div>
          <div><label>Adresse</label><input type="text" id="docs-caddress"></div>

          <div class="full" style="border-top:1px solid var(--line,rgba(200,153,104,0.18));padding-top:1rem;margin-top:0.4rem;">
            <h4 style="font-family:var(--serif,'Playfair Display'),serif;color:var(--gold,#c89968);font-size:1.05rem;margin:0 0 1rem;display:flex;justify-content:space-between;align-items:center;">
              Articles
              <button type="button" id="docs-add-item" style="background:transparent;border:1px solid var(--gold,#c89968);color:var(--gold,#c89968);padding:0.4rem 0.9rem;font-size:0.75rem;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;border-radius:2px;">+ Ajouter une ligne</button>
            </h4>
            <div style="overflow-x:auto;">
              <table class="hbt-items-table" id="docs-items-table">
                <thead><tr>
                  <th style="min-width:140px;">Désignation *</th>
                  <th style="min-width:110px;">Dimensions</th>
                  <th style="min-width:90px;">Essence</th>
                  <th style="width:60px;">Qté</th>
                  <th style="min-width:100px;">PU (FCFA)</th>
                  <th style="min-width:90px;">Total</th>
                  <th style="width:36px;"></th>
                </tr></thead>
                <tbody></tbody>
                <tfoot><tr>
                  <td colspan="5" style="text-align:right;color:var(--gold,#c89968);font-size:0.8rem;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;padding-top:1rem;">Total général</td>
                  <td id="docs-total" style="text-align:right;font-size:1.1rem;color:var(--ivory,#f5ede0);font-weight:600;padding-top:1rem;">0 FCFA</td>
                  <td></td>
                </tr></tfoot>
              </table>
            </div>
          </div>

          <div class="full" style="border-top:1px solid var(--line,rgba(200,153,104,0.18));padding-top:1rem;margin-top:0.4rem;">
            <h4 style="font-family:var(--serif,'Playfair Display'),serif;color:var(--gold,#c89968);font-size:1.05rem;margin:0 0 0.5rem;">Paiement (pour facture)</h4>
            <p style="font-size:0.82rem;color:var(--muted,#8a7e6a);margin-bottom:0.7rem;">Affiché dans le PDF uniquement si type = Facture.</p>
          </div>
          <div><label>Montant payé (FCFA)</label><input type="number" id="docs-paid" min="0" step="1000" placeholder="0"></div>
          <div><label>Mode de paiement</label>
            <select id="docs-method">
              <option value="">—</option>
              <option>Mobile Money</option>
              <option>Virement bancaire</option>
              <option>Espèces</option>
              <option>Carte bancaire</option>
              <option>Chèque</option>
            </select></div>

          <div class="full" style="border-top:1px solid var(--line,rgba(200,153,104,0.18));padding-top:1rem;margin-top:0.4rem;">
            <h4 style="font-family:var(--serif,'Playfair Display'),serif;color:var(--gold,#c89968);font-size:1.05rem;margin:0 0 0.5rem;">Notes / Conditions</h4>
            <p style="font-size:0.82rem;color:var(--muted,#8a7e6a);margin-bottom:0.7rem;">Apparaît dans le PDF sous le tableau.</p>
          </div>
          <div class="full">
            <textarea id="docs-notes" rows="5" placeholder="Conditions de paiement, délais de fabrication, garantie, remarques…" style="font-family:var(--sans,Inter),sans-serif;"></textarea>
          </div>
        </div>

        <div class="hbt-action-row" style="display:flex;gap:0.6rem;flex-wrap:wrap;margin-top:1.4rem;">
          <button type="button" id="docs-preview" style="padding:0.85rem 1.4rem;font-size:0.78rem;letter-spacing:1.8px;text-transform:uppercase;font-weight:700;border-radius:2px;cursor:pointer;border:1px solid var(--gold,#c89968);background:transparent;color:var(--gold,#c89968);">Prévisualiser</button>
          <button type="button" id="docs-print"   style="padding:0.85rem 1.4rem;font-size:0.78rem;letter-spacing:1.8px;text-transform:uppercase;font-weight:700;border-radius:2px;cursor:pointer;border:1px solid var(--gold,#c89968);background:transparent;color:var(--gold,#c89968);">Imprimer / Enregistrer PDF</button>
          <button type="button" id="docs-download" style="padding:0.85rem 1.4rem;font-size:0.78rem;letter-spacing:1.8px;text-transform:uppercase;font-weight:700;border-radius:2px;cursor:pointer;background:var(--gold,#c89968);border:none;color:#fff;">Télécharger PDF</button>
          <button type="button" id="docs-reset"   style="padding:0.85rem 1.4rem;font-size:0.78rem;letter-spacing:1.8px;text-transform:uppercase;font-weight:700;border-radius:2px;cursor:pointer;border:1px solid var(--line,rgba(200,153,104,0.18));background:transparent;color:var(--ivory,#f5ede0);">Réinitialiser</button>
        </div>
      </div>
    `;
  }

  function buildInvoicePdfHTML(doc) {
    const isInvoice = doc.type === 'invoice';
    const docLabel = isInvoice ? 'FACTURE' : 'DEVIS';
    const items = doc.items || [];
    const total = items.reduce((s,it) => s + ((Number(it.qty)||0) * (Number(it.unitPrice)||0)), 0);
    const paid = isInvoice ? (Number(doc.payment && doc.payment.amountPaid) || 0) : 0;
    const balance = Math.max(0, total - paid);

    const rows = items.map(it => {
      const qty = Number(it.qty) || 1;
      const unit = Number(it.unitPrice);
      const dim = (it.dimensions || '').trim() || 'À confirmer';
      const wood = (it.wood || '').trim() || '—';
      const lineTotal = (unit && qty) ? unit * qty : null;
      return `
        <tr>
          <td style="padding:14px 12px;border-bottom:1px solid #e8dcbf;">
            <strong style="color:#1a1410;font-size:11pt;">${escapeHtml(it.name || 'Article')}</strong>
          </td>
          <td style="padding:14px 12px;border-bottom:1px solid #e8dcbf;font-size:9.5pt;color:#5a4a36;">${escapeHtml(dim)}</td>
          <td style="padding:14px 12px;border-bottom:1px solid #e8dcbf;font-size:9.5pt;color:#5a4a36;">${escapeHtml(wood)}</td>
          <td style="padding:14px 12px;border-bottom:1px solid #e8dcbf;text-align:center;font-size:10pt;color:#1a1410;">${qty}</td>
          <td style="padding:14px 12px;border-bottom:1px solid #e8dcbf;text-align:right;font-size:9.5pt;color:#1a1410;">${unit ? docFcfa(unit) : '—'}</td>
          <td style="padding:14px 12px;border-bottom:1px solid #e8dcbf;text-align:right;font-size:10pt;color:#1a1410;font-weight:600;">${lineTotal != null ? docFcfa(lineTotal) : 'À confirmer'}</td>
        </tr>`;
    }).join('') || '<tr><td colspan="6" style="padding:30px;text-align:center;color:#7a6f5e;font-style:italic;">Aucun article</td></tr>';

    const notesHtml = (doc.notesHtml || '').replace(/\n/g, '<br>');

    return `
<div style="width:210mm;min-height:297mm;padding:18mm 16mm;background:#fbf7ed;color:#1a1410;font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;box-sizing:border-box;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #c89968;padding-bottom:16px;margin-bottom:24px;">
    <div>
      <div style="font-family:'Playfair Display','Georgia',serif;font-size:24pt;color:#1a1410;font-weight:500;letter-spacing:1px;line-height:1;">HOME BY <em style="color:#c89968;font-style:italic;font-weight:600;">TIKA</em></div>
      <div style="color:#7a6f5e;font-size:9pt;letter-spacing:3px;text-transform:uppercase;margin-top:4px;">Bois massif · Côte d'Ivoire</div>
    </div>
    <div style="text-align:right;">
      <div style="background:#c89968;color:#fff;padding:8px 18px;font-size:14pt;font-weight:700;letter-spacing:3px;display:inline-block;">${docLabel}</div>
      <div style="font-family:'Menlo','Courier New',monospace;font-size:10.5pt;margin-top:8px;color:#1a1410;">${escapeHtml(doc.id)}</div>
      <div style="color:#7a6f5e;font-size:9pt;margin-top:2px;">Émis le ${escapeHtml(doc.date)}</div>
    </div>
  </div>
  <table style="width:100%;margin-bottom:24px;border-collapse:collapse;"><tr>
    <td style="width:48%;vertical-align:top;padding-right:8mm;">
      <div style="color:#c89968;font-size:8pt;letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:6px;">Atelier</div>
      <div style="font-size:10pt;line-height:1.5;color:#1a1410;">
        <strong>HOME BY TIKA</strong><br>Songon, Cité la Grâce<br>Abidjan, Côte d'Ivoire<br>
        WhatsApp : +225 07 48 73 86 71<br>contact@homebytika.ci
      </div>
    </td>
    <td style="width:4%;"></td>
    <td style="width:48%;vertical-align:top;background:rgba(200,153,104,0.07);padding:14px 16px;border-left:3px solid #c89968;">
      <div style="color:#c89968;font-size:8pt;letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:6px;">Client</div>
      <div style="font-size:10pt;line-height:1.5;color:#1a1410;">
        <strong>${escapeHtml(doc.client.name || '—')}</strong><br>
        ${doc.client.phone ? escapeHtml(doc.client.phone) + '<br>' : ''}
        ${doc.client.email ? escapeHtml(doc.client.email) + '<br>' : ''}
        ${doc.client.address ? escapeHtml(doc.client.address) : ''}
      </div>
    </td>
  </tr></table>
  ${doc.orderId ? '<div style="background:#fff6e3;border:1px solid #f0e2c0;padding:10px 14px;margin-bottom:20px;font-size:9.5pt;color:#5a4a36;"><strong style="color:#c89968;">Commande associée :</strong> ' + escapeHtml(doc.orderId) + '</div>' : ''}
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <thead><tr style="background:#1a1410;color:#c89968;">
      <th style="padding:11px 12px;text-align:left;font-size:8.5pt;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Désignation</th>
      <th style="padding:11px 12px;text-align:left;font-size:8.5pt;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Dimensions</th>
      <th style="padding:11px 12px;text-align:left;font-size:8.5pt;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Essence</th>
      <th style="padding:11px 12px;text-align:center;font-size:8.5pt;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Qté</th>
      <th style="padding:11px 12px;text-align:right;font-size:8.5pt;letter-spacing:2px;text-transform:uppercase;font-weight:700;">PU</th>
      <th style="padding:11px 12px;text-align:right;font-size:8.5pt;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Total</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div style="text-align:right;margin-bottom:24px;">
    <table style="display:inline-block;border-collapse:collapse;">
      <tr><td style="padding:8px 16px;color:#7a6f5e;font-size:10pt;letter-spacing:1.5px;text-transform:uppercase;">Total général</td>
        <td style="padding:8px 16px;background:#1a1410;color:#c89968;font-size:14pt;font-weight:700;font-family:'Playfair Display','Georgia',serif;text-align:right;min-width:160px;">${docFcfa(total)}</td></tr>
      ${(isInvoice && paid > 0) ? '<tr><td style="padding:6px 16px;color:#7a6f5e;font-size:9.5pt;text-transform:uppercase;">Montant payé</td><td style="padding:6px 16px;background:rgba(46,138,86,0.1);color:#2e8a56;font-size:11pt;font-weight:700;text-align:right;border-left:3px solid #2e8a56;">' + docFcfa(paid) + '</td></tr><tr><td style="padding:6px 16px;color:#7a6f5e;font-size:9.5pt;text-transform:uppercase;">Solde restant</td><td style="padding:6px 16px;background:' + (balance > 0 ? 'rgba(196,91,91,0.1)' : 'rgba(46,138,86,0.1)') + ';color:' + (balance > 0 ? '#c45b5b' : '#2e8a56') + ';font-size:11pt;font-weight:700;text-align:right;border-left:3px solid ' + (balance > 0 ? '#c45b5b' : '#2e8a56') + ';">' + docFcfa(balance) + '</td></tr>' : ''}
      ${(isInvoice && doc.payment && doc.payment.method) ? '<tr><td style="padding:6px 16px;color:#7a6f5e;font-size:9.5pt;text-transform:uppercase;">Mode de paiement</td><td style="padding:6px 16px;color:#1a1410;font-size:10pt;font-weight:600;text-align:right;">' + escapeHtml(doc.payment.method) + '</td></tr>' : ''}
      <tr><td colspan="2" style="padding:4px 16px;color:#7a6f5e;font-size:8pt;text-align:right;">Prix exprimés en FCFA · Mobile Money &amp; virement acceptés</td></tr>
    </table>
  </div>
  ${notesHtml ? '<div style="background:rgba(200,153,104,0.06);border-left:3px solid #c89968;padding:14px 18px;margin-bottom:24px;font-size:9.5pt;line-height:1.6;color:#1a1410;"><div style="color:#c89968;font-size:8pt;letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:8px;">' + (isInvoice ? 'Conditions &amp; informations' : 'Notes du devis') + '</div>' + notesHtml + '</div>' : ''}
  <div style="border-top:1px solid #e8dcbf;padding-top:14px;margin-top:24px;text-align:center;color:#7a6f5e;font-size:8.5pt;letter-spacing:1px;line-height:1.5;">
    HOME BY TIKA · Ébénisterie premium · Iroko · Framiré · Teck<br>
    ${isInvoice ? 'Facture' : 'Devis valable 30 jours · Acompte 50% à la commande'} · Merci de votre confiance
  </div>
</div>`;
  }

  function renderDocItems() {
    const tbody = document.querySelector('#docs-items-table tbody');
    if (!tbody || !docCurrent) return;
    tbody.innerHTML = docCurrent.items.map((it, idx) => {
      const total = (Number(it.qty)||0) * (Number(it.unitPrice)||0);
      return `<tr data-idx="${idx}">
        <td><input type="text" data-f="name" value="${escapeHtml(it.name)}" placeholder="Nom du produit"></td>
        <td><input type="text" data-f="dimensions" value="${escapeHtml(it.dimensions)}" placeholder="ex: 200×80×40"></td>
        <td><input type="text" data-f="wood" value="${escapeHtml(it.wood)}" placeholder="Iroko, Teck…"></td>
        <td><input type="number" data-f="qty" value="${escapeHtml(it.qty)}" min="1"></td>
        <td><input type="number" data-f="unitPrice" value="${escapeHtml(it.unitPrice)}" min="0" step="1000" placeholder="0"></td>
        <td style="color:var(--gold,#c89968);font-weight:600;padding:0.4rem;">${total ? docFcfa(total) : '—'}</td>
        <td><button type="button" class="row-remove" data-rm="${idx}">×</button></td>
      </tr>`;
    }).join('');
    const grand = docCurrent.items.reduce((s,it) => s + (Number(it.qty)||0) * (Number(it.unitPrice)||0), 0);
    document.querySelector('#docs-total').textContent = docFcfa(grand);
  }

  function bindDocsInlineForm(container) {
    document.querySelector('#docs-id').value = docCurrent.id;
    document.querySelector('#docs-date').value = docCurrent.date;
    renderDocItems();

    document.querySelector('#docs-type').addEventListener('change', e => {
      docCurrent.type = e.target.value;
      docCurrent.id = docGenId(docCurrent.type === 'invoice' ? 'FAC' : 'DEV');
      document.querySelector('#docs-id').value = docCurrent.id;
    });
    document.querySelector('#docs-date').addEventListener('input', e => docCurrent.date = e.target.value);
    document.querySelector('#docs-cname').addEventListener('input', e => docCurrent.client.name = e.target.value);
    document.querySelector('#docs-cphone').addEventListener('input', e => docCurrent.client.phone = e.target.value);
    document.querySelector('#docs-cemail').addEventListener('input', e => docCurrent.client.email = e.target.value);
    document.querySelector('#docs-caddress').addEventListener('input', e => docCurrent.client.address = e.target.value);
    document.querySelector('#docs-paid').addEventListener('input', e => docCurrent.payment.amountPaid = Number(e.target.value) || 0);
    document.querySelector('#docs-method').addEventListener('change', e => docCurrent.payment.method = e.target.value);
    document.querySelector('#docs-notes').addEventListener('input', e => docCurrent.notesHtml = e.target.value);

    document.querySelector('#docs-add-item').addEventListener('click', () => {
      docCurrent.items.push({ name:'', dimensions:'', wood:'', qty:1, unitPrice:'' });
      renderDocItems();
    });
    document.querySelector('#docs-items-table tbody').addEventListener('input', e => {
      const tr = e.target.closest('tr'); if (!tr) return;
      const idx = parseInt(tr.dataset.idx, 10);
      const f = e.target.dataset.f;
      if (!f) return;
      let v = e.target.value;
      if (f === 'qty' || f === 'unitPrice') v = v === '' ? '' : Number(v);
      docCurrent.items[idx][f] = v;
      const total = (Number(docCurrent.items[idx].qty)||0) * (Number(docCurrent.items[idx].unitPrice)||0);
      tr.children[5].textContent = total ? docFcfa(total) : '—';
      const grand = docCurrent.items.reduce((s,it) => s + (Number(it.qty)||0) * (Number(it.unitPrice)||0), 0);
      document.querySelector('#docs-total').textContent = docFcfa(grand);
    });
    document.querySelector('#docs-items-table tbody').addEventListener('click', e => {
      if (e.target.dataset.rm != null) {
        docCurrent.items.splice(parseInt(e.target.dataset.rm, 10), 1);
        if (docCurrent.items.length === 0) docCurrent.items.push({ name:'', dimensions:'', wood:'', qty:1, unitPrice:'' });
        renderDocItems();
      }
    });

    document.querySelector('#docs-order').addEventListener('change', async e => {
      const orderId = e.target.value;
      if (!orderId || !window.OrderService) return;
      try {
        const o = await window.OrderService.getById(orderId);
        if (!o) return;
        docCurrent.orderId = orderId;
        docCurrent.client.name = o.customer_name || '';
        docCurrent.client.phone = o.phone || '';
        docCurrent.client.address = o.address || '';
        document.querySelector('#docs-cname').value = docCurrent.client.name;
        document.querySelector('#docs-cphone').value = docCurrent.client.phone;
        document.querySelector('#docs-caddress').value = docCurrent.client.address;
        if (Array.isArray(o.items) && o.items.length) {
          docCurrent.items = o.items.map(it => ({
            name: it.name || it.id || '', dimensions: '', wood: it.wood || '',
            qty: it.qty || 1, unitPrice: it.price || ''
          }));
          renderDocItems();
        }
        docCurrent.payment.method = o.payment_method || '';
        docCurrent.payment.amountPaid = Number(o.amount_paid) || 0;
        document.querySelector('#docs-paid').value = docCurrent.payment.amountPaid;
        document.querySelector('#docs-method').value = docCurrent.payment.method;
        if (o.payment_confirmed && document.querySelector('#docs-type').value !== 'invoice') {
          document.querySelector('#docs-type').value = 'invoice';
          docCurrent.type = 'invoice';
          docCurrent.id = docGenId('FAC');
          document.querySelector('#docs-id').value = docCurrent.id;
        }
      } catch (err) { console.error('[docs] load order:', err); }
    });

    document.querySelector('#docs-preview').addEventListener('click', docPreview);
    document.querySelector('#docs-print').addEventListener('click', docPrint);
    document.querySelector('#docs-download').addEventListener('click', docDownload);
    document.querySelector('#docs-reset').addEventListener('click', () => {
      if (!confirm('Réinitialiser le formulaire ?')) return;
      docCurrent = docEmpty(document.querySelector('#docs-type').value || 'quote');
      document.querySelector('#docs-id').value = docCurrent.id;
      document.querySelector('#docs-date').value = docCurrent.date;
      ['cname','cphone','cemail','caddress','paid','notes'].forEach(k => {
        const el = document.querySelector('#docs-' + k);
        if (el) el.value = '';
      });
      document.querySelector('#docs-method').value = '';
      document.querySelector('#docs-order').value = '';
      renderDocItems();
    });
  }

  function docPreview() {
    const w = window.open('', '_blank', 'width=900,height=1100');
    if (!w) { alert('Pop-up bloquée par le navigateur. Autorisez les pop-ups pour aperçu.'); return; }
    w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + docCurrent.id + ' — Aperçu</title><style>@page{margin:0;size:A4;}body{margin:0;background:#3a342a;padding:20px;}</style></head><body>' + buildInvoicePdfHTML(docCurrent) + '</body></html>');
    w.document.close();
  }

  function docPrint() {
    const w = window.open('', '_blank');
    if (!w) { alert('Pop-up bloquée par le navigateur. Autorisez les pop-ups pour imprimer.'); return; }
    w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + docCurrent.id + '</title><style>@page{margin:0;size:A4;}body{margin:0;}</style></head><body>' + buildInvoicePdfHTML(docCurrent) + '<script>window.onload=function(){setTimeout(function(){window.print();},300);};</script></body></html>');
    w.document.close();
  }

  async function docDownload() {
    if (!window.html2pdf) {
      toast('⚠ Téléchargement direct indisponible (CDN bloqué). Utilisez "Imprimer / Enregistrer PDF".', '#c89968');
      // Tente quand même de charger html2pdf
      try {
        await new Promise((res, rej) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          s.onload = res; s.onerror = () => rej(new Error('CDN bloqué'));
          document.head.appendChild(s);
        });
      } catch (e) { return; }
    }
    const html = buildInvoicePdfHTML(docCurrent);
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'fixed'; container.style.top = '-99999px';
    document.body.appendChild(container);
    try {
      await window.html2pdf().from(container.firstElementChild).set({
        margin: 0, filename: docCurrent.id + '.pdf',
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#fbf7ed' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).save();
      // Sauvegarde invoice_id dans Supabase si lié à une commande
      if (docCurrent.type === 'invoice' && docCurrent.orderId && window.HBT_CONFIG && window.HBT_CONFIG.isSupabaseReady && window.HBT_CONFIG.isSupabaseReady()) {
        try {
          await fetch(window.HBT_CONFIG.supabase.url + '/rest/v1/orders?id=eq.' + encodeURIComponent(docCurrent.orderId), {
            method: 'PATCH',
            headers: {
              apikey: window.HBT_CONFIG.supabase.anonKey,
              Authorization: 'Bearer ' + window.HBT_CONFIG.supabase.anonKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ invoice_id: docCurrent.id, updated_at: new Date().toISOString() })
          });
        } catch (sbErr) { console.warn('[docs] Save invoice_id:', sbErr.message); }
      }
      toast('✓ PDF téléchargé : <strong>' + escapeHtml(docCurrent.id) + '</strong>', '#2e8a56');
    } catch (e) {
      console.error('[docs] PDF gen:', e);
      toast('❌ Erreur génération PDF — utilisez "Imprimer" pour enregistrer en PDF', '#c45b5b');
    } finally {
      container.remove();
    }
  }

  async function loadDocsPaidOrders() {
    const box = document.querySelector('#docs-paid-orders');
    if (!box || !window.OrderService) return;
    try {
      const all = await window.OrderService.list();
      const paid = (all || []).filter(o => o.payment_confirmed && !o.invoice_id);
      if (paid.length === 0) {
        box.innerHTML = '<em style="color:var(--muted);">Aucune commande payée en attente de facture.</em>';
        return;
      }
      box.innerHTML = paid.map(o => `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.8rem;padding:0.55rem 0;border-bottom:1px solid rgba(46,138,86,0.15);flex-wrap:wrap;">
          <div style="flex:1;min-width:200px;">
            <strong style="font-family:Menlo,monospace;color:#5cc488;">${escapeHtml(o.id)}</strong>
            <span style="color:var(--muted);font-size:0.85rem;"> · ${escapeHtml(o.customer_name || '?')}</span>
            ${o.total ? '<span style="color:var(--ivory-dim);font-size:0.85rem;"> · ' + docFcfa(o.total) + '</span>' : ''}
          </div>
          <button type="button" data-paid="${escapeHtml(o.id)}" style="padding:0.45rem 0.9rem;font-size:0.72rem;letter-spacing:1.5px;text-transform:uppercase;background:var(--gold,#c89968);border:none;color:#fff;cursor:pointer;border-radius:2px;">Générer facture</button>
        </div>`).join('');
      box.querySelectorAll('[data-paid]').forEach(b => {
        b.addEventListener('click', () => {
          document.querySelector('#docs-type').value = 'invoice';
          document.querySelector('#docs-type').dispatchEvent(new Event('change'));
          document.querySelector('#docs-order').value = b.dataset.paid;
          document.querySelector('#docs-order').dispatchEvent(new Event('change'));
          document.querySelector('#docs-id').scrollIntoView({ behavior:'smooth', block:'start' });
        });
      });
    } catch (e) { box.textContent = 'Erreur : ' + e.message; }
  }

  async function loadDocsExistingInvoices() {
    const box = document.querySelector('#docs-existing-invoices');
    if (!box || !window.OrderService) return;
    try {
      const all = await window.OrderService.list();
      const inv = (all || []).filter(o => o.invoice_id);
      if (inv.length === 0) {
        box.innerHTML = '<em style="color:var(--muted);">Aucune facture encore générée.</em>';
        return;
      }
      box.innerHTML = inv.map(o => `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.8rem;padding:0.55rem 0;border-bottom:1px solid rgba(200,153,104,0.15);flex-wrap:wrap;">
          <div style="flex:1;min-width:200px;">
            <strong style="font-family:Menlo,monospace;color:var(--gold);">${escapeHtml(o.invoice_id)}</strong>
            <span style="color:var(--muted);font-size:0.85rem;"> · ${escapeHtml(o.customer_name || '?')}</span>
            <span style="color:var(--ivory-dim);font-size:0.8rem;"> · Cmd: ${escapeHtml(o.id)}</span>
          </div>
          <button type="button" data-regen="${escapeHtml(o.id)}" style="background:transparent;border:1px solid var(--gold);color:var(--gold);padding:0.4rem 0.8rem;font-size:0.7rem;letter-spacing:1px;text-transform:uppercase;cursor:pointer;border-radius:2px;">Re-télécharger</button>
        </div>`).join('');
      box.querySelectorAll('[data-regen]').forEach(b => {
        b.addEventListener('click', () => {
          document.querySelector('#docs-type').value = 'invoice';
          document.querySelector('#docs-type').dispatchEvent(new Event('change'));
          document.querySelector('#docs-order').value = b.dataset.regen;
          document.querySelector('#docs-order').dispatchEvent(new Event('change'));
          setTimeout(docDownload, 400);
        });
      });
    } catch (e) { box.textContent = 'Erreur : ' + e.message; }
  }

  async function loadDocsOrdersDropdown() {
    if (!window.OrderService) return;
    try {
      const all = await window.OrderService.list();
      const sel = document.querySelector('#docs-order');
      if (!sel) return;
      (all || []).forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.id;
        opt.textContent = o.id + ' — ' + (o.customer_name || '?');
        sel.appendChild(opt);
      });
    } catch (e) { console.warn('[docs] orders dropdown:', e.message); }
  }

  /* ===== BOOT ===== */
  ready(() => {
    injectCSS();
    waitForAuth(() => {
      // Petit délai pour laisser le DOM admin existant se monter
      setTimeout(inject, 100);
    });
  });
})();
