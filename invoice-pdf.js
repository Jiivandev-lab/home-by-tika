/* =====================================================================
   HOME BY TIKA — invoice-pdf.js
   ---------------------------------------------------------------------
   Module additif : ajoute dans l'admin un onglet "Devis & Factures".
   • Éditeur riche Quill.js (notes/conditions personnalisables)
   • Génération PDF premium A4 (ivoire/noir/doré) via html2pdf.js
   • Liaison automatique avec les commandes Supabase existantes
   • Boutons : Prévisualiser, Télécharger PDF, Imprimer

   Activation : <script src="invoice-pdf.js"></script> dans admin.html
   ===================================================================== */

(function () {
  'use strict';

  /* ========== LIBS via CDN (chargées au besoin, une seule fois) ========== */
  const LIBS = {
    quillCss:    'https://cdn.jsdelivr.net/npm/quill@1.3.6/dist/quill.snow.css',
    quillJs:     'https://cdn.jsdelivr.net/npm/quill@1.3.6/dist/quill.min.js',
    html2pdf:    'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
  };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src="' + src + '"]')) return resolve();
      const s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = resolve; s.onerror = () => reject(new Error('Échec chargement ' + src));
      document.head.appendChild(s);
    });
  }
  function loadStyle(href) {
    if (document.querySelector('link[href="' + href + '"]')) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href;
    document.head.appendChild(l);
  }

  /* ========== Helpers ========== */
  function $(s, r) { return (r || document).querySelector(s); }
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fcfa(n) {
    if (n == null || isNaN(n)) return '—';
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' FCFA';
  }
  function todayFR() {
    return new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  function genDocId(prefix) {
    const d = new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const r = Math.random().toString(36).slice(2, 6).toUpperCase();
    return prefix + '-' + yy + mm + dd + '-' + r;
  }

  /* ========== Attente du gate admin (sessionStorage) ========== */
  function waitForAuth(cb, tries) {
    tries = tries || 0;
    if (sessionStorage.getItem('hbt-admin-auth') === 'ok') cb();
    else if (tries < 600) setTimeout(() => waitForAuth(cb, tries + 1), 500);
  }

  /* ========== CSS injecté pour la section ========== */
  function injectCSS() {
    if ($('#hbt-invoice-css')) return;
    const css = `
      .hbt-invoice-section { background: var(--bg-card,#1a1820); border:1px solid var(--line,rgba(200,153,104,0.18)); padding:1.8rem; margin-bottom:2rem; border-radius:4px; }
      .hbt-invoice-section h2 { font-family: var(--serif,'Playfair Display'), serif; color: var(--gold,#c89968); font-size:1.4rem; margin:0 0 0.4rem; }
      .hbt-invoice-section .lede { color: var(--muted,#8a7e6a); font-size:0.9rem; margin-bottom:1.4rem; }
      .hbt-doc-form { display:grid; grid-template-columns:1fr 1fr; gap:1rem 1.4rem; }
      .hbt-doc-form .full { grid-column: 1 / -1; }
      .hbt-doc-form label { display:block; font-size:0.72rem; letter-spacing:1.5px; text-transform:uppercase; color: var(--gold,#c89968); font-weight:600; margin-bottom:0.4rem; }
      .hbt-doc-form input, .hbt-doc-form select, .hbt-doc-form textarea {
        width:100%; background: var(--bg-soft,#15131a); border:1px solid var(--line,rgba(200,153,104,0.18));
        color: var(--ivory,#f5ede0); padding:0.7rem 0.9rem; font-family: var(--sans,Inter), sans-serif;
        font-size:0.95rem; border-radius:2px; box-sizing:border-box;
      }
      .hbt-doc-form input:focus, .hbt-doc-form select:focus, .hbt-doc-form textarea:focus { outline:none; border-color: var(--gold,#c89968); }
      .hbt-items-table { width:100%; border-collapse:collapse; font-size:0.88rem; margin-top:0.4rem; }
      .hbt-items-table th, .hbt-items-table td { padding:0.5rem 0.4rem; text-align:left; border-bottom:1px solid var(--line,rgba(200,153,104,0.12)); }
      .hbt-items-table th { color:var(--gold,#c89968); font-size:0.7rem; letter-spacing:1.5px; text-transform:uppercase; font-weight:700; }
      .hbt-items-table input { width:100%; box-sizing:border-box; background:var(--bg-soft,#15131a); border:1px solid transparent; color:var(--ivory,#f5ede0); padding:0.4rem; font-size:0.88rem; }
      .hbt-items-table input:focus { outline:none; border-color: var(--gold,#c89968); }
      .hbt-items-table .row-remove { background:transparent; border:1px solid rgba(196,91,91,0.4); color:#c45b5b; padding:0.3rem 0.6rem; cursor:pointer; border-radius:2px; font-size:0.75rem; }
      .hbt-quill-wrap { background: var(--bg-soft,#15131a); border:1px solid var(--line,rgba(200,153,104,0.18)); border-radius:2px; }
      .hbt-quill-wrap .ql-toolbar { border:none; border-bottom:1px solid var(--line,rgba(200,153,104,0.18)) !important; background:rgba(200,153,104,0.05); }
      .hbt-quill-wrap .ql-container { border:none !important; min-height:160px; font-family: var(--sans,Inter), sans-serif; }
      .hbt-quill-wrap .ql-editor { color: var(--ivory,#f5ede0); min-height:160px; }
      .hbt-quill-wrap .ql-stroke { stroke: var(--ivory-dim,#d4c8b3); }
      .hbt-quill-wrap .ql-fill { fill: var(--ivory-dim,#d4c8b3); }
      .hbt-quill-wrap .ql-picker-label { color: var(--ivory-dim,#d4c8b3); }
      .hbt-quill-wrap .ql-editor.ql-blank::before { color: var(--muted,#8a7e6a); font-style:italic; }
      .hbt-action-row { display:flex; gap:0.6rem; flex-wrap:wrap; margin-top:1.4rem; }
      .hbt-action-row button { padding:0.85rem 1.4rem; font-size:0.78rem; letter-spacing:1.8px; text-transform:uppercase; font-weight:700; border-radius:2px; cursor:pointer; border:1px solid var(--gold,#c89968); background:transparent; color:var(--gold,#c89968); transition:all 0.2s ease; }
      .hbt-action-row button.primary { background: var(--gold,#c89968); color:#fff; }
      .hbt-action-row button:hover { transform:translateY(-1px); }
      .hbt-action-row button.primary:hover { background:#b58451; }
      .hbt-preview-modal { position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:99996; display:none; align-items:flex-start; justify-content:center; overflow-y:auto; padding:2rem 1rem; backdrop-filter:blur(4px); }
      .hbt-preview-modal.open { display:flex; }
      .hbt-preview-modal .close-btn { position:fixed; top:1rem; right:1rem; background:#fff; border:none; width:44px; height:44px; border-radius:50%; cursor:pointer; font-size:1.4rem; box-shadow:0 4px 12px rgba(0,0,0,0.4); }

      @media (max-width: 720px) {
        .hbt-doc-form { grid-template-columns: 1fr; }
        .hbt-items-table { font-size: 0.8rem; }
        .hbt-action-row button { flex: 1 1 calc(50% - 0.3rem); }
      }
    `;
    const s = document.createElement('style');
    s.id = 'hbt-invoice-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ========== HTML PDF PREMIUM (template ivoire/noir/doré) ========== */
  function buildPdfHTML(doc) {
    const isInvoice = doc.type === 'invoice';
    const docLabel  = isInvoice ? 'FACTURE' : 'DEVIS';
    const docId     = doc.id;
    const items     = doc.items || [];

    const totalHT = items.reduce((s, it) => s + ((Number(it.qty)||0) * (Number(it.unitPrice)||0)), 0);

    const itemsRows = items.map(it => {
      const qty   = Number(it.qty) || 1;
      const unit  = Number(it.unitPrice);
      const dim   = (it.dimensions || '').trim() || 'À confirmer';
      const wood  = (it.wood || '').trim() || '—';
      const total = (unit && qty) ? unit * qty : null;
      return `
        <tr>
          <td style="padding:14px 12px;border-bottom:1px solid #e8dcbf;">
            <strong style="color:#1a1410;font-size:11pt;">${escapeHtml(it.name || 'Article')}</strong>
            ${it.description ? '<div style="color:#7a6f5e;font-size:9pt;margin-top:3px;">' + escapeHtml(it.description) + '</div>' : ''}
          </td>
          <td style="padding:14px 12px;border-bottom:1px solid #e8dcbf;font-size:9.5pt;color:#5a4a36;">${escapeHtml(dim)}</td>
          <td style="padding:14px 12px;border-bottom:1px solid #e8dcbf;font-size:9.5pt;color:#5a4a36;">${escapeHtml(wood)}</td>
          <td style="padding:14px 12px;border-bottom:1px solid #e8dcbf;text-align:center;font-size:10pt;color:#1a1410;">${qty}</td>
          <td style="padding:14px 12px;border-bottom:1px solid #e8dcbf;text-align:right;font-size:9.5pt;color:#1a1410;">${unit ? fcfa(unit) : '—'}</td>
          <td style="padding:14px 12px;border-bottom:1px solid #e8dcbf;text-align:right;font-size:10pt;color:#1a1410;font-weight:600;">${total != null ? fcfa(total) : 'À confirmer'}</td>
        </tr>`;
    }).join('');

    return `
<div style="width:210mm;min-height:297mm;padding:18mm 16mm;background:#fbf7ed;color:#1a1410;font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;box-sizing:border-box;">

  <!-- HEADER -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #c89968;padding-bottom:16px;margin-bottom:24px;">
    <div>
      <div style="font-family:'Playfair Display','Georgia',serif;font-size:24pt;color:#1a1410;font-weight:500;letter-spacing:1px;line-height:1;">HOME BY <em style="color:#c89968;font-style:italic;font-weight:600;">TIKA</em></div>
      <div style="color:#7a6f5e;font-size:9pt;letter-spacing:3px;text-transform:uppercase;margin-top:4px;">Bois massif · Côte d'Ivoire</div>
    </div>
    <div style="text-align:right;">
      <div style="background:#c89968;color:#fff;padding:8px 18px;font-size:14pt;font-weight:700;letter-spacing:3px;display:inline-block;">${docLabel}</div>
      <div style="font-family:'Menlo','Courier New',monospace;font-size:10.5pt;margin-top:8px;color:#1a1410;">${escapeHtml(docId)}</div>
      <div style="color:#7a6f5e;font-size:9pt;margin-top:2px;">Émis le ${escapeHtml(doc.date)}</div>
    </div>
  </div>

  <!-- COORDONNÉES (atelier / client) -->
  <table style="width:100%;margin-bottom:24px;border-collapse:collapse;">
    <tr>
      <td style="width:48%;vertical-align:top;padding-right:8mm;">
        <div style="color:#c89968;font-size:8pt;letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:6px;">Atelier</div>
        <div style="font-size:10pt;line-height:1.5;color:#1a1410;">
          <strong>HOME BY TIKA</strong><br>
          Songon, Cité la Grâce<br>
          Abidjan, Côte d'Ivoire<br>
          WhatsApp : +225 07 48 73 86 71<br>
          contact@homebytika.ci
        </div>
      </td>
      <td style="width:4%;"></td>
      <td style="width:48%;vertical-align:top;background:rgba(200,153,104,0.07);padding:14px 16px;border-left:3px solid #c89968;">
        <div style="color:#c89968;font-size:8pt;letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:6px;">Client</div>
        <div style="font-size:10pt;line-height:1.5;color:#1a1410;">
          <strong>${escapeHtml(doc.client.name || '—')}</strong><br>
          ${doc.client.phone ? escapeHtml(doc.client.phone) + '<br>' : ''}
          ${doc.client.email ? escapeHtml(doc.client.email) + '<br>' : ''}
          ${doc.client.address ? escapeHtml(doc.client.address).replace(/\n/g, '<br>') : ''}
        </div>
      </td>
    </tr>
  </table>

  ${doc.orderId ? `<div style="background:#fff6e3;border:1px solid #f0e2c0;padding:10px 14px;margin-bottom:20px;font-size:9.5pt;color:#5a4a36;">
    <strong style="color:#c89968;">Commande associée :</strong> ${escapeHtml(doc.orderId)}
  </div>` : ''}

  <!-- TABLEAU PRODUITS -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <thead>
      <tr style="background:#1a1410;color:#c89968;">
        <th style="padding:11px 12px;text-align:left;font-size:8.5pt;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Désignation</th>
        <th style="padding:11px 12px;text-align:left;font-size:8.5pt;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Dimensions</th>
        <th style="padding:11px 12px;text-align:left;font-size:8.5pt;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Essence</th>
        <th style="padding:11px 12px;text-align:center;font-size:8.5pt;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Qté</th>
        <th style="padding:11px 12px;text-align:right;font-size:8.5pt;letter-spacing:2px;text-transform:uppercase;font-weight:700;">PU</th>
        <th style="padding:11px 12px;text-align:right;font-size:8.5pt;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows || '<tr><td colspan="6" style="padding:30px;text-align:center;color:#7a6f5e;font-style:italic;">Aucun article</td></tr>'}
    </tbody>
  </table>

  <!-- TOTAL + PAIEMENT (si facture) -->
  <div style="text-align:right;margin-bottom:24px;">
    <table style="display:inline-block;border-collapse:collapse;">
      <tr>
        <td style="padding:8px 16px;color:#7a6f5e;font-size:10pt;letter-spacing:1.5px;text-transform:uppercase;">Total général</td>
        <td style="padding:8px 16px;background:#1a1410;color:#c89968;font-size:14pt;font-weight:700;font-family:'Playfair Display','Georgia',serif;text-align:right;min-width:160px;">${fcfa(totalHT)}</td>
      </tr>
      ${(isInvoice && doc.payment && doc.payment.amountPaid > 0) ? `
      <tr>
        <td style="padding:6px 16px;color:#7a6f5e;font-size:9.5pt;letter-spacing:1px;text-transform:uppercase;">Montant payé</td>
        <td style="padding:6px 16px;background:rgba(46,138,86,0.1);color:#2e8a56;font-size:11pt;font-weight:700;text-align:right;border-left:3px solid #2e8a56;">${fcfa(doc.payment.amountPaid)}</td>
      </tr>
      <tr>
        <td style="padding:6px 16px;color:#7a6f5e;font-size:9.5pt;letter-spacing:1px;text-transform:uppercase;">Solde restant</td>
        <td style="padding:6px 16px;background:${Math.max(0, totalHT - doc.payment.amountPaid) > 0 ? 'rgba(196,91,91,0.1)' : 'rgba(46,138,86,0.1)'};color:${Math.max(0, totalHT - doc.payment.amountPaid) > 0 ? '#c45b5b' : '#2e8a56'};font-size:11pt;font-weight:700;text-align:right;border-left:3px solid ${Math.max(0, totalHT - doc.payment.amountPaid) > 0 ? '#c45b5b' : '#2e8a56'};">${fcfa(Math.max(0, totalHT - doc.payment.amountPaid))}</td>
      </tr>
      ${doc.payment.method ? `<tr>
        <td style="padding:6px 16px;color:#7a6f5e;font-size:9.5pt;letter-spacing:1px;text-transform:uppercase;">Mode de paiement</td>
        <td style="padding:6px 16px;color:#1a1410;font-size:10pt;font-weight:600;text-align:right;">${escapeHtml(doc.payment.method)}</td>
      </tr>` : ''}
      ` : ''}
      <tr>
        <td colspan="2" style="padding:4px 16px;color:#7a6f5e;font-size:8pt;text-align:right;">Prix exprimés en FCFA · Mobile Money & virement acceptés</td>
      </tr>
    </table>
  </div>

  <!-- MESSAGE PERSONNALISÉ / CONDITIONS (Quill) -->
  ${doc.notesHtml ? `<div style="background:rgba(200,153,104,0.06);border-left:3px solid #c89968;padding:14px 18px;margin-bottom:24px;font-size:9.5pt;line-height:1.6;color:#1a1410;">
    <div style="color:#c89968;font-size:8pt;letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:8px;">${isInvoice ? 'Conditions & informations' : 'Notes du devis'}</div>
    ${doc.notesHtml}
  </div>` : ''}

  <!-- FOOTER -->
  <div style="border-top:1px solid #e8dcbf;padding-top:14px;margin-top:24px;text-align:center;color:#7a6f5e;font-size:8.5pt;letter-spacing:1px;line-height:1.5;">
    HOME BY TIKA · Ébénisterie premium · Iroko · Framiré · Teck<br>
    ${isInvoice ? 'Facture' : 'Devis valable 30 jours · Acompte 50% à la commande'} · Merci de votre confiance
  </div>
</div>`;
  }

  /* ========== ÉTAT EN MÉMOIRE (un seul document en cours d'édition) ========== */
  let currentDoc = null;
  let quillEditor = null;

  function newEmptyDoc(type) {
    return {
      type: type,               // 'quote' ou 'invoice'
      id: genDocId(type === 'invoice' ? 'FAC' : 'DEV'),
      date: todayFR(),
      orderId: '',
      client: { name: '', phone: '', email: '', address: '' },
      items: [{ name: '', dimensions: '', wood: '', qty: 1, unitPrice: '', description: '' }],
      notesHtml: '',
      // Infos paiement (utilisées pour facture)
      payment: { method: '', amountPaid: 0 }
    };
  }

  /* ========== UI : section admin ========== */
  /* Contenu du formulaire (utilisé seul dans la nouvelle section) */
  function docSectionInnerHTML() {
    return `
      <div class="hbt-doc-form">
        <div>
          <label>Type de document</label>
          <select id="doc-type">
            <option value="quote">Devis</option>
            <option value="invoice">Facture</option>
          </select>
        </div>
        <div>
          <label>N° document (auto)</label>
          <input type="text" id="doc-id" readonly>
        </div>
        <div>
          <label>Commande associée (optionnel)</label>
          <select id="doc-order">
            <option value="">— Manuel (sans commande) —</option>
          </select>
        </div>
        <div>
          <label>Date</label>
          <input type="text" id="doc-date">
        </div>

        <div class="full" style="border-top:1px solid var(--line,rgba(200,153,104,0.18));padding-top:1rem;margin-top:0.4rem;">
          <h3 style="font-family:var(--serif,'Playfair Display'),serif;color:var(--gold,#c89968);font-size:1.05rem;margin:0 0 1rem;">Informations client</h3>
        </div>
        <div>
          <label>Nom complet *</label>
          <input type="text" id="doc-client-name" required>
        </div>
        <div>
          <label>Téléphone</label>
          <input type="text" id="doc-client-phone">
        </div>
        <div>
          <label>Email</label>
          <input type="email" id="doc-client-email">
        </div>
        <div>
          <label>Adresse</label>
          <input type="text" id="doc-client-address">
        </div>

        <div class="full" style="border-top:1px solid var(--line,rgba(200,153,104,0.18));padding-top:1rem;margin-top:0.4rem;">
          <h3 style="font-family:var(--serif,'Playfair Display'),serif;color:var(--gold,#c89968);font-size:1.05rem;margin:0 0 1rem;display:flex;justify-content:space-between;align-items:center;">
            Articles
            <button type="button" id="doc-add-item" style="background:transparent;border:1px solid var(--gold,#c89968);color:var(--gold,#c89968);padding:0.4rem 0.9rem;font-size:0.75rem;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;border-radius:2px;">+ Ajouter une ligne</button>
          </h3>
          <div style="overflow-x:auto;">
            <table class="hbt-items-table" id="doc-items-table">
              <thead>
                <tr>
                  <th style="min-width:140px;">Désignation *</th>
                  <th style="min-width:110px;">Dimensions</th>
                  <th style="min-width:90px;">Essence</th>
                  <th style="width:60px;">Qté</th>
                  <th style="min-width:100px;">PU (FCFA)</th>
                  <th style="min-width:90px;">Total</th>
                  <th style="width:36px;"></th>
                </tr>
              </thead>
              <tbody></tbody>
              <tfoot>
                <tr>
                  <td colspan="5" style="text-align:right;color:var(--gold,#c89968);font-size:0.8rem;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;padding-top:1rem;">Total général</td>
                  <td id="doc-total" style="text-align:right;font-size:1.1rem;color:var(--ivory,#f5ede0);font-weight:600;padding-top:1rem;">0 FCFA</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div class="full" style="border-top:1px solid var(--line,rgba(200,153,104,0.18));padding-top:1rem;margin-top:0.4rem;">
          <h3 style="font-family:var(--serif,'Playfair Display'),serif;color:var(--gold,#c89968);font-size:1.05rem;margin:0 0 0.8rem;">Notes / Conditions</h3>
          <p style="font-size:0.82rem;color:var(--muted,#8a7e6a);margin-bottom:0.7rem;">Le contenu rédigé ici apparaîtra dans le PDF généré (sous le tableau). Format riche : gras, italique, listes, etc.</p>
          <div class="hbt-quill-wrap">
            <div id="doc-quill"></div>
          </div>
        </div>
      </div>

      <div class="hbt-action-row">
        <button type="button" id="doc-preview">Prévisualiser</button>
        <button type="button" id="doc-download" class="primary">Télécharger PDF</button>
        <button type="button" id="doc-print">Imprimer</button>
        <button type="button" id="doc-reset">Réinitialiser</button>
      </div>
    `;
  }

  /* ========== RENDER tableau articles ========== */
  function renderItems() {
    const tbody = $('#doc-items-table tbody');
    if (!tbody || !currentDoc) return;
    tbody.innerHTML = currentDoc.items.map((it, idx) => {
      const total = (Number(it.qty) || 0) * (Number(it.unitPrice) || 0);
      return `
        <tr data-idx="${idx}">
          <td><input type="text" data-field="name" value="${escapeHtml(it.name)}" placeholder="Nom du produit"></td>
          <td><input type="text" data-field="dimensions" value="${escapeHtml(it.dimensions)}" placeholder="ex: 200×80×40"></td>
          <td><input type="text" data-field="wood" value="${escapeHtml(it.wood)}" placeholder="Iroko, Teck…"></td>
          <td><input type="number" data-field="qty" value="${escapeHtml(it.qty)}" min="1" step="1"></td>
          <td><input type="number" data-field="unitPrice" value="${escapeHtml(it.unitPrice)}" min="0" step="1000" placeholder="0"></td>
          <td style="color:var(--gold,#c89968);font-weight:600;padding:0.4rem 0.4rem;">${total ? fcfa(total) : '—'}</td>
          <td><button type="button" class="row-remove" data-action="remove">×</button></td>
        </tr>
      `;
    }).join('');
    // Total général
    const grand = currentDoc.items.reduce((s, it) => s + (Number(it.qty)||0) * (Number(it.unitPrice)||0), 0);
    $('#doc-total').textContent = fcfa(grand);
  }

  /* ========== Sync form ↔ currentDoc ========== */
  function bindForm() {
    $('#doc-type').addEventListener('change', (e) => {
      currentDoc.type = e.target.value;
      // Re-générer un nouvel id si on change de type
      currentDoc.id = genDocId(currentDoc.type === 'invoice' ? 'FAC' : 'DEV');
      $('#doc-id').value = currentDoc.id;
    });
    $('#doc-date').addEventListener('input', (e) => { currentDoc.date = e.target.value; });
    $('#doc-client-name').addEventListener('input', (e) => { currentDoc.client.name = e.target.value; });
    $('#doc-client-phone').addEventListener('input', (e) => { currentDoc.client.phone = e.target.value; });
    $('#doc-client-email').addEventListener('input', (e) => { currentDoc.client.email = e.target.value; });
    $('#doc-client-address').addEventListener('input', (e) => { currentDoc.client.address = e.target.value; });

    $('#doc-add-item').addEventListener('click', () => {
      currentDoc.items.push({ name: '', dimensions: '', wood: '', qty: 1, unitPrice: '', description: '' });
      renderItems();
    });

    $('#doc-items-table tbody').addEventListener('input', (e) => {
      const tr = e.target.closest('tr'); if (!tr) return;
      const idx = parseInt(tr.dataset.idx, 10);
      const field = e.target.dataset.field;
      if (!field) return;
      let v = e.target.value;
      if (field === 'qty' || field === 'unitPrice') v = v === '' ? '' : Number(v);
      currentDoc.items[idx][field] = v;
      // Recalc total ligne + global
      const total = (Number(currentDoc.items[idx].qty)||0) * (Number(currentDoc.items[idx].unitPrice)||0);
      const cell = tr.children[5];
      if (cell) cell.textContent = total ? fcfa(total) : '—';
      const grand = currentDoc.items.reduce((s, it) => s + (Number(it.qty)||0) * (Number(it.unitPrice)||0), 0);
      $('#doc-total').textContent = fcfa(grand);
    });
    $('#doc-items-table tbody').addEventListener('click', (e) => {
      if (e.target.dataset.action === 'remove') {
        const tr = e.target.closest('tr');
        const idx = parseInt(tr.dataset.idx, 10);
        currentDoc.items.splice(idx, 1);
        if (currentDoc.items.length === 0) {
          currentDoc.items.push({ name: '', dimensions: '', wood: '', qty: 1, unitPrice: '', description: '' });
        }
        renderItems();
      }
    });

    // Sélection d'une commande Supabase → pré-remplit tout (client, articles, paiement)
    $('#doc-order').addEventListener('change', async (e) => {
      const orderId = e.target.value;
      if (!orderId) return;
      try {
        const o = await window.OrderService.getById(orderId);
        if (!o) return;
        currentDoc.orderId = orderId;
        currentDoc.client.name    = o.customer_name || '';
        currentDoc.client.phone   = o.phone || '';
        currentDoc.client.address = o.address || '';
        $('#doc-client-name').value    = currentDoc.client.name;
        $('#doc-client-phone').value   = currentDoc.client.phone;
        $('#doc-client-address').value = currentDoc.client.address;
        // Importe les articles
        if (Array.isArray(o.items) && o.items.length) {
          currentDoc.items = o.items.map(it => ({
            name: it.name || it.id || '',
            dimensions: '',
            wood: it.wood || '',
            qty: it.qty || 1,
            unitPrice: it.price || '',
            description: ''
          }));
          renderItems();
        }
        // Infos paiement (utilisées dans le PDF facture)
        currentDoc.payment = {
          method:     o.payment_method || '',
          amountPaid: Number(o.amount_paid) || 0
        };
        // Si commande payée → propose Facture par défaut
        if (o.payment_confirmed && $('#doc-type').value !== 'invoice') {
          $('#doc-type').value = 'invoice';
          currentDoc.type = 'invoice';
          currentDoc.id = genDocId('FAC');
          $('#doc-id').value = currentDoc.id;
        }
      } catch (err) {
        console.error('[invoice-pdf] getOrder:', err);
      }
    });

    // Boutons actions
    $('#doc-preview').addEventListener('click', () => preview());
    $('#doc-download').addEventListener('click', () => downloadPdf());
    $('#doc-print').addEventListener('click', () => printDoc());
    $('#doc-reset').addEventListener('click', () => {
      if (!confirm('Réinitialiser le formulaire ?')) return;
      resetForm();
    });
  }

  function resetForm() {
    currentDoc = newEmptyDoc($('#doc-type').value || 'quote');
    $('#doc-id').value = currentDoc.id;
    $('#doc-date').value = currentDoc.date;
    ['name','phone','email','address'].forEach(k => $('#doc-client-' + k).value = '');
    $('#doc-order').value = '';
    renderItems();
    if (quillEditor) quillEditor.setContents([]);
  }

  /* ========== Charge commandes Supabase dans le select ========== */
  async function loadOrdersForSelect() {
    if (!window.OrderService) return;
    try {
      const orders = await window.OrderService.list();
      const sel = $('#doc-order');
      orders.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.id;
        opt.textContent = o.id + ' — ' + (o.customer_name || '?');
        sel.appendChild(opt);
      });
    } catch (e) { console.warn('[invoice-pdf] loadOrders:', e.message); }
  }

  /* ========== Récupération HTML du PDF prêt ========== */
  function getCurrentHTML() {
    if (quillEditor) currentDoc.notesHtml = quillEditor.root.innerHTML;
    return buildPdfHTML(currentDoc);
  }

  /* ========== Prévisualisation ========== */
  function preview() {
    let modal = $('.hbt-preview-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'hbt-preview-modal';
      modal.innerHTML = '<button type="button" class="close-btn" aria-label="Fermer">×</button><div class="hbt-preview-content" style="background:#fff;box-shadow:0 12px 40px rgba(0,0,0,0.5);"></div>';
      document.body.appendChild(modal);
      modal.querySelector('.close-btn').addEventListener('click', () => modal.classList.remove('open'));
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });
    }
    modal.querySelector('.hbt-preview-content').innerHTML = getCurrentHTML();
    modal.classList.add('open');
    window.scrollTo(0, 0);
  }

  /* ========== Téléchargement PDF ========== */
  async function downloadPdf() {
    if (!window.html2pdf) {
      alert('Bibliothèque html2pdf en cours de chargement, réessayez dans 2 secondes.');
      return;
    }
    const html = getCurrentHTML();
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'fixed';
    container.style.top = '-99999px';
    document.body.appendChild(container);
    const opt = {
      margin: 0,
      filename: currentDoc.id + '.pdf',
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#fbf7ed' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    try {
      await window.html2pdf().from(container.firstElementChild).set(opt).save();
      // Si c'est une facture liée à une commande Supabase → on sauvegarde l'invoice_id
      if (currentDoc.type === 'invoice' && currentDoc.orderId && window.HBT_CONFIG && window.HBT_CONFIG.isSupabaseReady && window.HBT_CONFIG.isSupabaseReady()) {
        try {
          await fetch(window.HBT_CONFIG.supabase.url + '/rest/v1/orders?id=eq.' + encodeURIComponent(currentDoc.orderId), {
            method: 'PATCH',
            headers: {
              apikey: window.HBT_CONFIG.supabase.anonKey,
              Authorization: 'Bearer ' + window.HBT_CONFIG.supabase.anonKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              invoice_id: currentDoc.id,
              updated_at: new Date().toISOString()
            })
          });
        } catch (sbErr) {
          console.warn('[invoice-pdf] Sauvegarde invoice_id échouée :', sbErr.message);
        }
      }
      if (window.HBT_toast) window.HBT_toast('✓ PDF téléchargé : <strong>' + currentDoc.id + '</strong>', '#2e8a56');
    } catch (e) {
      console.error('[invoice-pdf] PDF:', e);
      alert('Erreur génération PDF : ' + e.message);
    } finally {
      container.remove();
    }
  }

  /* ========== Impression ========== */
  function printDoc() {
    const html = getCurrentHTML();
    const win = window.open('', '_blank');
    win.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + currentDoc.id + '</title><style>@page { margin: 0; size: A4; } body { margin: 0; }</style></head><body>' + html + '<script>window.onload=function(){setTimeout(function(){window.print();},300);};</script></body></html>');
    win.document.close();
  }

  /* ========== Quill init ========== */
  async function initQuill() {
    loadStyle(LIBS.quillCss);
    if (!window.Quill) await loadScript(LIBS.quillJs);
    const wrap = $('#doc-quill');
    if (!wrap || quillEditor) return;
    quillEditor = new window.Quill(wrap, {
      theme: 'snow',
      placeholder: 'Conditions, mode de paiement, remarques, message personnalisé…',
      modules: {
        toolbar: [
          [{ 'header': [false, 2, 3] }],
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['link'],
          ['clean']
        ]
      }
    });
  }

  /* ========== Boot ========== */
  /* injectTab : essaie d'injecter l'onglet "Devis & Factures" dans le DOM.
     Robuste : utilise un MutationObserver qui se déclenche dès que le
     conteneur .hbt-extras-tabs apparaît dans le DOM. Fonctionne quel que
     soit l'ordre/timing de chargement d'admin-extras.js. */
  function tryInjectNow() {
    const tabs = document.querySelector('.hbt-extras-tabs');
    if (!tabs) return false;
    if (tabs.querySelector('[data-tab="docs"]')) return true;  // déjà injecté

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hbt-extras-tab';
    btn.dataset.tab = 'docs';
    btn.textContent = 'Devis & Factures';
    tabs.appendChild(btn);

    btn.addEventListener('click', () => {
      tabs.querySelectorAll('.hbt-extras-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showDocsTab();
    });

    console.log('[invoice-pdf] Onglet "Devis & Factures" injecté ✓');
    return true;
  }

  function injectTab() {
    // Essai immédiat
    if (tryInjectNow()) return;
    // Sinon, observe le DOM pour réessayer dès que .hbt-extras-tabs apparaît
    if (!('MutationObserver' in window)) {
      // Fallback ancien : retry par intervalle
      let tries = 0;
      const iv = setInterval(() => {
        if (tryInjectNow() || ++tries > 60) clearInterval(iv);
      }, 250);
      return;
    }
    const observer = new MutationObserver(() => {
      if (tryInjectNow()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    // Sécurité : déconnecte après 60s (jamais d'observer immortel)
    setTimeout(() => observer.disconnect(), 60000);
  }

  async function showDocsTab() {
    const content = document.querySelector('#hbt-extras-content');
    if (!content) return;
    content.classList.add('hbt-invoice-section');

    // Header avec 2 sections rapides + formulaire en-dessous
    content.innerHTML = `
      <h2>Devis & Factures</h2>
      <p class="lede">Espace dédié à la facturation. Sélectionnez une commande payée pour générer la facture en 1 clic, ou créez un devis/facture manuellement ci-dessous.</p>

      <!-- Section 1 : Commandes payées (prêtes à facturer) -->
      <div style="margin-bottom:1.6rem;background:rgba(46,138,86,0.06);border-left:3px solid #2e8a56;padding:1rem 1.2rem;border-radius:2px;">
        <strong style="color:#5cc488;font-size:0.78rem;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;display:block;margin-bottom:0.7rem;">✓ Commandes payées — prêtes à facturer</strong>
        <div id="hbt-paid-orders" style="font-size:0.88rem;color:var(--ivory-dim);">Chargement…</div>
      </div>

      <!-- Section 2 : Factures déjà générées -->
      <div style="margin-bottom:1.8rem;background:rgba(200,153,104,0.06);border-left:3px solid var(--gold);padding:1rem 1.2rem;border-radius:2px;">
        <strong style="color:var(--gold);font-size:0.78rem;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;display:block;margin-bottom:0.7rem;">📄 Factures déjà générées</strong>
        <div id="hbt-existing-invoices" style="font-size:0.88rem;color:var(--ivory-dim);">Chargement…</div>
      </div>

      <!-- Section 3 : Formulaire (séparateur + form complet) -->
      <div style="border-top:1px solid var(--line);padding-top:1.4rem;margin-top:0.4rem;">
        <h3 style="font-family:var(--serif);color:var(--gold);font-size:1.15rem;margin:0 0 0.5rem;">Créer un nouveau document</h3>
        <p style="color:var(--muted);font-size:0.88rem;margin-bottom:1.2rem;">Devis ou facture — toutes les valeurs sont modifiables avant génération.</p>
        ${docSectionInnerHTML()}
      </div>
    `;

    currentDoc = newEmptyDoc('quote');
    $('#doc-id').value = currentDoc.id;
    $('#doc-date').value = currentDoc.date;
    renderItems();
    bindForm();
    loadOrdersForSelect();
    loadPaidOrders();
    loadExistingInvoices();
    // Charge Quill en arrière-plan
    initQuill().catch(e => console.warn('[invoice-pdf] Quill:', e.message));
    // Charge html2pdf en arrière-plan
    if (!window.html2pdf) loadScript(LIBS.html2pdf).catch(e => console.warn('[invoice-pdf] html2pdf:', e.message));
  }

  /* === Charge les commandes payées (payment_confirmed=true sans facture) === */
  async function loadPaidOrders() {
    const box = document.querySelector('#hbt-paid-orders');
    if (!box) return;
    if (!window.OrderService) { box.textContent = 'Service indisponible.'; return; }
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
            ${o.total ? '<span style="color:var(--ivory-dim);font-size:0.85rem;"> · ' + fcfa(o.total) + '</span>' : ''}
          </div>
          <button type="button" data-paid-order="${escapeHtml(o.id)}" class="hbt-btn-primary" style="padding:0.45rem 0.9rem;font-size:0.72rem;">Générer facture</button>
        </div>
      `).join('');
      // Délégation : clic Générer facture
      box.querySelectorAll('[data-paid-order]').forEach(b => {
        b.addEventListener('click', () => {
          // Bascule en mode facture + sélectionne la commande
          const sel = $('#doc-order');
          const typeSel = $('#doc-type');
          if (typeSel) { typeSel.value = 'invoice'; typeSel.dispatchEvent(new Event('change')); }
          if (sel) {
            sel.value = b.dataset.paidOrder;
            sel.dispatchEvent(new Event('change'));
          }
          // Scroll vers le formulaire
          $('#doc-id').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    } catch (e) {
      box.textContent = 'Erreur : ' + e.message;
    }
  }

  /* === Charge les factures déjà générées (orders avec invoice_id) === */
  async function loadExistingInvoices() {
    const box = document.querySelector('#hbt-existing-invoices');
    if (!box) return;
    if (!window.OrderService) { box.textContent = 'Service indisponible.'; return; }
    try {
      const all = await window.OrderService.list();
      const invoiced = (all || []).filter(o => o.invoice_id);
      if (invoiced.length === 0) {
        box.innerHTML = '<em style="color:var(--muted);">Aucune facture encore générée.</em>';
        return;
      }
      box.innerHTML = invoiced.map(o => `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.8rem;padding:0.55rem 0;border-bottom:1px solid rgba(200,153,104,0.15);flex-wrap:wrap;">
          <div style="flex:1;min-width:200px;">
            <strong style="font-family:Menlo,monospace;color:var(--gold);">${escapeHtml(o.invoice_id)}</strong>
            <span style="color:var(--muted);font-size:0.85rem;"> · ${escapeHtml(o.customer_name || '?')}</span>
            <span style="color:var(--ivory-dim);font-size:0.8rem;"> · Cmd: ${escapeHtml(o.id)}</span>
          </div>
          <div style="display:flex;gap:0.4rem;">
            <button type="button" data-regen-invoice="${escapeHtml(o.id)}" style="background:transparent;border:1px solid var(--gold);color:var(--gold);padding:0.4rem 0.8rem;font-size:0.7rem;letter-spacing:1px;text-transform:uppercase;cursor:pointer;border-radius:2px;">Re-télécharger</button>
          </div>
        </div>
      `).join('');
      // Délégation re-télécharger
      box.querySelectorAll('[data-regen-invoice]').forEach(b => {
        b.addEventListener('click', async () => {
          // Précharge la commande en facture et déclenche le download
          const sel = $('#doc-order');
          const typeSel = $('#doc-type');
          if (typeSel) { typeSel.value = 'invoice'; typeSel.dispatchEvent(new Event('change')); }
          if (sel) {
            sel.value = b.dataset.regenInvoice;
            sel.dispatchEvent(new Event('change'));
          }
          // Attend que les champs se remplissent puis télécharge
          setTimeout(() => downloadPdf(), 500);
        });
      });
    } catch (e) {
      box.textContent = 'Erreur : ' + e.message;
    }
  }

  /* ========== Init ========== */
  function start() {
    injectCSS();
    waitForAuth(() => setTimeout(injectTab, 250));  // attend que admin-extras.js ait monté ses tabs
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
