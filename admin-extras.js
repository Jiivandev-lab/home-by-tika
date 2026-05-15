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
          <label>Image *</label>
          <div class="hbt-upload-zone" id="np-upload-zone">
            <div class="upload-zone-content">
              <div class="upload-hint">Cliquez ou glissez une image ici (JPG, PNG, WEBP)</div>
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

    /* Met à jour le panneau debug en live */
    function updateDebug() {
      const name = nameI.value.trim();
      const cat  = catI.value;
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
      if (!file.type.startsWith('image/')) {
        toast('⚠ Fichier non image', '#c45b5b'); return;
      }
      pendingFile = file;
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

        const upUrl = 'https://api.cloudinary.com/v1_1/' + cloudName + '/image/upload';
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
          tags: meta.tags
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
  // 8 statuts de fabrication HOME BY TIKA + Annulée. Ordre = progression.
  // Rétrocompat des anciens keys (finishing, ready) via LEGACY_STATUS_LABELS.
  const ORDER_STATUSES_ADMIN = [
    { key: 'received',           label: 'Commande reçue',      color: '#8a7860' },
    { key: 'confirmed',          label: 'Validation en cours', color: '#8a5a2a' },
    { key: 'preparing',          label: 'En fabrication',      color: '#b48249' },
    { key: 'wood_prep',          label: 'Bois en préparation', color: '#a06b2a' },
    { key: 'varnishing',         label: 'Vernissage',          color: '#c89968' },
    { key: 'delivery_scheduled', label: 'Livraison programmée',color: '#d4a766' },
    { key: 'shipping',           label: 'En cours de livraison', color: '#e0b878' },
    { key: 'delivered',          label: 'Livrée',              color: '#2e8a56' },
    { key: 'cancelled',          label: 'Annulée',             color: '#c45b5b' }
  ];

  // Anciennes valeurs encore possibles dans la DB → labels lisibles
  const LEGACY_STATUS_LABELS = {
    finishing: 'Finition',
    ready:     'Produit prêt'
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
    // Petit modal léger
    const itemsHTML = (o.items || []).length
      ? o.items.map(it => '<li>' + (it.qty || 1) + ' × ' + escapeHtml(it.name || it.id) + ' — ' + fcfa(it.price * (it.qty || 1)) + '</li>').join('')
      : '<li style="color:var(--muted);">Aucun article</li>';
    const historyHTML = (o.history || []).map(h =>
      '<li>' + fmt(h.at) + ' — <strong>' + escapeHtml(h.status) + '</strong>' + (h.note ? ' — ' + escapeHtml(h.note) : '') + '</li>'
    ).join('');

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99998;display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(4px);';
    modal.innerHTML = `
      <div style="background:var(--bg-card,#1a1820);border:1px solid var(--gold,#c89968);padding:1.8rem;border-radius:4px;max-width:640px;width:100%;max-height:90vh;overflow-y:auto;font-family:Inter,sans-serif;color:var(--ivory,#f5ede0);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
          <h3 style="color:var(--gold,#c89968);font-family:'Playfair Display',serif;margin:0;font-size:1.4rem;">${escapeHtml(o.id)}</h3>
          <button type="button" id="ord-modal-close" style="background:transparent;border:1px solid var(--line,rgba(200,153,104,0.18));color:var(--ivory,#f5ede0);padding:0.4rem 0.8rem;cursor:pointer;border-radius:2px;">Fermer</button>
        </div>
        <p style="font-size:0.85rem;color:var(--muted,#8a7e6a);margin-bottom:1.4rem;">Passée le ${fmt(o.created_at)}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem 1.4rem;font-size:0.9rem;margin-bottom:1.4rem;">
          <div><strong style="color:var(--gold,#c89968);">Client</strong><br>${escapeHtml(o.customer_name || '—')}</div>
          <div><strong style="color:var(--gold,#c89968);">Téléphone</strong><br>${escapeHtml(o.phone || '—')}</div>
          <div style="grid-column:1/-1;"><strong style="color:var(--gold,#c89968);">Adresse</strong><br>${escapeHtml(o.address || '—')}</div>
          ${o.notes ? `<div style="grid-column:1/-1;"><strong style="color:var(--gold,#c89968);">Note</strong><br>${escapeHtml(o.notes)}</div>` : ''}
          <div><strong style="color:var(--gold,#c89968);">Total</strong><br>${o.total ? fcfa(o.total) : '—'}</div>
          <div><strong style="color:var(--gold,#c89968);">Statut</strong><br>${escapeHtml(o.status)}</div>
        </div>
        <div style="margin-bottom:1.4rem;">
          <strong style="color:var(--gold,#c89968);font-size:0.75rem;letter-spacing:1.5px;text-transform:uppercase;">Articles</strong>
          <ul style="margin:0.4rem 0 0 1.2rem;font-size:0.9rem;">${itemsHTML}</ul>
        </div>
        <div style="margin-bottom:1.4rem;">
          <strong style="color:var(--gold,#c89968);font-size:0.75rem;letter-spacing:1.5px;text-transform:uppercase;">Historique</strong>
          <ul style="margin:0.4rem 0 0 1.2rem;font-size:0.85rem;color:var(--ivory-dim,#d4c8b3);">${historyHTML || '<li>—</li>'}</ul>
        </div>
        <div style="text-align:center;padding-top:0.8rem;border-top:1px solid var(--line,rgba(200,153,104,0.18));">
          <a href="suivi.html?id=${encodeURIComponent(o.id)}" target="_blank" style="color:var(--gold,#c89968);font-size:0.85rem;">Voir la page de suivi client →</a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    $('#ord-modal-close', modal).addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
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
    }
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
