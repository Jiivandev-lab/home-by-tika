/* =========================================================
   HOME BY TIKA — quote-request.js
   ----------------------------------------------------------
   Modal "Demander un devis" + sauvegarde Supabase.

   Activation : <script src="quote-request.js"></script> sur les pages
   client. Intercepte automatiquement :
     • tous les liens vers contact.html avec texte "Devis"
     • tous les éléments avec data-quote-trigger
     • optionnellement, on peut appeler window.HBT_openQuoteModal(opts)

   Pré-remplissage : si on passe { product: '...', dimensions: '...', wood: '...' },
   les champs sont pré-remplis.
   ========================================================= */

(function () {
  'use strict';

  if (window._hbtQuoteLoaded) return;
  window._hbtQuoteLoaded = true;

  /* ===== Helpers ===== */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function genQuoteId() {
    const d = new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const r = Math.random().toString(36).slice(2, 6).toUpperCase();
    return 'HBTQ-' + yy + mm + dd + '-' + r;
  }

  /* ===== CSS injecté ===== */
  function injectCSS() {
    if (document.getElementById('hbt-quote-css')) return;
    const css = `
      .hbt-q-overlay {
        position: fixed; inset: 0;
        background: rgba(20, 16, 12, 0.78);
        z-index: 99996;
        display: none;
        align-items: flex-start; justify-content: center;
        padding: 2rem 1rem;
        overflow-y: auto;
        backdrop-filter: blur(4px);
      }
      .hbt-q-overlay.open { display: flex; }
      .hbt-q-modal {
        background: var(--bg-card, #1a1820);
        border: 1px solid var(--gold, #c89968);
        max-width: 620px; width: 100%;
        padding: 2rem;
        border-radius: 4px;
        color: var(--ivory, #f5ede0);
        margin: auto;
        font-family: var(--sans, Inter), sans-serif;
        box-shadow: 0 22px 60px rgba(0, 0, 0, 0.55);
        animation: hbt-q-pop 0.32s cubic-bezier(0.25, 0.1, 0.25, 1);
      }
      @keyframes hbt-q-pop {
        from { opacity: 0; transform: translateY(20px) scale(0.98); }
        to   { opacity: 1; transform: none; }
      }
      .hbt-q-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; gap: 0.6rem; }
      .hbt-q-head h2 {
        font-family: var(--serif, 'Playfair Display'), serif;
        color: var(--gold, #c89968); font-size: 1.6rem; margin: 0;
      }
      .hbt-q-close {
        background: transparent; border: 1px solid var(--line, rgba(200,153,104,0.18));
        color: var(--ivory, #f5ede0); width: 36px; height: 36px;
        border-radius: 50%; cursor: pointer; font-size: 1.1rem;
      }
      .hbt-q-close:hover { border-color: var(--gold, #c89968); color: var(--gold, #c89968); }
      .hbt-q-lede { color: var(--muted, #8a7e6a); font-size: 0.9rem; margin: 0 0 1.2rem; }
      .hbt-q-form { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem 1rem; }
      .hbt-q-form .full { grid-column: 1 / -1; }
      .hbt-q-form label {
        display: block; font-size: 0.7rem; letter-spacing: 1.5px;
        text-transform: uppercase; color: var(--gold, #c89968);
        font-weight: 600; margin-bottom: 0.3rem;
      }
      .hbt-q-form input, .hbt-q-form textarea, .hbt-q-form select {
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
      .hbt-q-form input:focus, .hbt-q-form textarea:focus, .hbt-q-form select:focus {
        outline: none; border-color: var(--gold, #c89968);
      }
      .hbt-q-form textarea { resize: vertical; min-height: 90px; }
      .hbt-q-error {
        display: none;
        background: rgba(196, 91, 91, 0.12);
        border-left: 3px solid #c45b5b;
        padding: 0.7rem 1rem; margin: 1rem 0 0;
        color: #e88c8c; font-size: 0.88rem; border-radius: 2px;
      }
      .hbt-q-actions { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 1.2rem; }
      .hbt-q-btn {
        padding: 0.85rem 1.2rem; font-size: 0.78rem; letter-spacing: 2px;
        text-transform: uppercase; font-weight: 700; border-radius: 2px;
        cursor: pointer; text-align: center; text-decoration: none;
        font-family: var(--sans, Inter), sans-serif;
        transition: all 0.2s ease;
      }
      .hbt-q-btn.primary { background: var(--gold, #c89968); color: #fff; border: none; }
      .hbt-q-btn.primary:hover { background: #b58451; transform: translateY(-1px); }
      .hbt-q-btn.primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
      .hbt-q-btn.wa {
        background: #25d366; color: #fff; border: none;
        display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
      }
      .hbt-q-btn.wa:hover { background: #20bd5a; transform: translateY(-1px); }
      .hbt-q-hint { font-size: 0.78rem; color: var(--muted, #8a7e6a); text-align: center; margin: 0.4rem 0 0; }
      .hbt-q-success {
        display: none; text-align: center; padding: 1.4rem 0;
      }
      .hbt-q-success.show { display: block; }
      .hbt-q-success .checkmark {
        font-size: 3rem; color: var(--gold, #c89968); margin-bottom: 0.4rem;
      }
      .hbt-q-success h3 {
        font-family: var(--serif, 'Playfair Display'), serif;
        color: var(--gold, #c89968); font-size: 1.4rem; margin-bottom: 0.6rem;
      }
      .hbt-q-success .qid {
        font-family: 'Menlo', monospace; font-size: 1.05rem; color: var(--gold, #c89968);
        background: rgba(200, 153, 104, 0.08); padding: 0.5rem 1rem;
        border: 1px solid rgba(200, 153, 104, 0.3); border-radius: 2px;
        display: inline-block; margin: 0.8rem 0 1.2rem;
      }

      @media (max-width: 580px) {
        .hbt-q-form { grid-template-columns: 1fr; }
        .hbt-q-modal { padding: 1.4rem 1.2rem; }
        .hbt-q-head h2 { font-size: 1.3rem; }
      }
    `;
    const s = document.createElement('style');
    s.id = 'hbt-quote-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ===== Build modal HTML ===== */
  function buildModal() {
    const overlay = document.createElement('div');
    overlay.className = 'hbt-q-overlay';
    overlay.id = 'hbt-quote-overlay';
    overlay.innerHTML = `
      <div class="hbt-q-modal" role="dialog" aria-labelledby="hbt-q-title">
        <div class="hbt-q-head">
          <h2 id="hbt-q-title">Demander un devis</h2>
          <button type="button" class="hbt-q-close" aria-label="Fermer">×</button>
        </div>
        <p class="hbt-q-lede">Remplissez le formulaire — nous vous recontactons sous 24h avec un devis personnalisé.</p>

        <form class="hbt-q-form" id="hbt-q-form">
          <div class="full"><label>Nom complet *</label>
            <input type="text" id="hbtq-name" required></div>
          <div><label>Téléphone *</label>
            <input type="tel" id="hbtq-phone" required placeholder="+225 07 …"></div>
          <div><label>Email (optionnel)</label>
            <input type="email" id="hbtq-email"></div>
          <div><label>Pays / Ville</label>
            <input type="text" id="hbtq-location" placeholder="Côte d'Ivoire / Abidjan"></div>
          <div><label>Produit concerné</label>
            <input type="text" id="hbtq-product" placeholder="Porte, salon, table…"></div>
          <div><label>Dimensions souhaitées</label>
            <input type="text" id="hbtq-dim" placeholder="ex: 200×80 cm"></div>
          <div><label>Essence souhaitée</label>
            <select id="hbtq-wood">
              <option value="">Au choix du maître</option>
              <option>Iroko</option>
              <option>Framiré</option>
              <option>Teck</option>
              <option>Autre / à discuter</option>
            </select></div>
          <div><label>Budget estimatif (FCFA)</label>
            <input type="text" id="hbtq-budget" placeholder="ex: 500 000 — 1 200 000"></div>
          <div class="full"><label>Votre message</label>
            <textarea id="hbtq-message" placeholder="Décrivez votre projet, vos contraintes, vos inspirations…"></textarea></div>
        </form>

        <div class="hbt-q-error" id="hbt-q-error"></div>

        <div class="hbt-q-actions">
          <button type="button" class="hbt-q-btn primary" id="hbt-q-submit">Envoyer ma demande</button>
          <a class="hbt-q-btn wa" id="hbt-q-wa" href="#" target="_blank" rel="noopener">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;"><path d="M12 0C5.4 0 0 5.4 0 12c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.7c1.7 1 3.7 1.5 5.7 1.5 6.6 0 12-5.4 12-12S18.6 0 12 0zm0 21.8c-1.9 0-3.7-.5-5.2-1.4l-.4-.2-3.9 1 1-3.8-.2-.4c-1-1.6-1.5-3.4-1.5-5.3 0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10zm5.5-7.5c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.1-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.1-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.4-.2.3-1 .9-1 2.3 0 1.3.9 2.6 1.1 2.8.1.2 1.9 2.9 4.6 4 .6.3 1.1.5 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.4z"/></svg>
            Continuer sur WhatsApp
          </a>
          <p class="hbt-q-hint">Vous recevrez un numéro de référence pour suivre votre demande.</p>
        </div>

        <div class="hbt-q-success" id="hbt-q-success">
          <div class="checkmark">✓</div>
          <h3>Demande envoyée !</h3>
          <p style="color: var(--ivory, #f5ede0); margin-bottom: 0.2rem;">Votre référence :</p>
          <div class="qid" id="hbt-q-success-id">—</div>
          <p style="color: var(--muted, #8a7e6a); font-size: 0.92rem; line-height: 1.55; margin-bottom: 1.2rem;">
            Notre équipe vous recontacte sous 24h sur WhatsApp pour finaliser votre projet.
          </p>
          <a class="hbt-q-btn wa" id="hbt-q-success-wa" href="#" target="_blank" rel="noopener">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;"><path d="M12 0C5.4 0 0 5.4 0 12c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.7c1.7 1 3.7 1.5 5.7 1.5 6.6 0 12-5.4 12-12S18.6 0 12 0z"/></svg>
            Nous contacter directement
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  let overlay = null;

  function buildWaLink(data, ref) {
    const lines = [
      'Bonjour HOME BY TIKA, je souhaite un devis :',
      '— Réf : ' + (ref || ''),
      '— Nom : ' + (data.customer_name || ''),
      data.product ? '— Produit : ' + data.product : '',
      data.dimensions ? '— Dimensions : ' + data.dimensions : '',
      data.wood ? '— Essence : ' + data.wood : '',
      data.budget ? '— Budget : ' + data.budget : '',
      data.message ? '— Message : ' + data.message : ''
    ].filter(Boolean).join('\n');
    const waNumber = (window.HBT_CONFIG && window.HBT_CONFIG.contact && window.HBT_CONFIG.contact.whatsapp) || '2250748738671';
    return 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(lines);
  }

  function openModal(opts) {
    opts = opts || {};
    if (!overlay) overlay = buildModal();
    // Reset form + cache success
    document.getElementById('hbt-q-form').reset();
    document.getElementById('hbt-q-success').classList.remove('show');
    document.getElementById('hbt-q-form').style.display = 'grid';
    document.querySelectorAll('.hbt-q-actions, .hbt-q-lede, .hbt-q-error').forEach(el => el.style.display = '');
    document.getElementById('hbt-q-error').style.display = 'none';
    // Pré-remplissage si fourni
    if (opts.product)    document.getElementById('hbtq-product').value = opts.product;
    if (opts.dimensions) document.getElementById('hbtq-dim').value = opts.dimensions;
    if (opts.wood)       document.getElementById('hbtq-wood').value = opts.wood;
    if (opts.message)    document.getElementById('hbtq-message').value = opts.message;
    // Lien WhatsApp simple (sans réf encore)
    document.getElementById('hbt-q-wa').href = buildWaLink({
      customer_name: '', product: opts.product || '', dimensions: opts.dimensions || '',
      wood: opts.wood || '', budget: '', message: opts.message || ''
    }, '');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('hbtq-name').focus(), 100);
  }
  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  window.HBT_openQuoteModal = openModal;
  window.HBT_closeQuoteModal = closeModal;

  /* ===== Soumission ===== */
  async function submitQuote() {
    const errBox = document.getElementById('hbt-q-error');
    errBox.style.display = 'none';
    const submit = document.getElementById('hbt-q-submit');

    const data = {
      customer_name: document.getElementById('hbtq-name').value.trim(),
      phone:         document.getElementById('hbtq-phone').value.trim(),
      email:         document.getElementById('hbtq-email').value.trim(),
      location:      document.getElementById('hbtq-location').value.trim(),
      product:       document.getElementById('hbtq-product').value.trim(),
      dimensions:    document.getElementById('hbtq-dim').value.trim(),
      wood:          document.getElementById('hbtq-wood').value,
      budget:        document.getElementById('hbtq-budget').value.trim(),
      message:       document.getElementById('hbtq-message').value.trim()
    };
    if (!data.customer_name || !data.phone) {
      errBox.textContent = 'Nom et téléphone sont obligatoires.';
      errBox.style.display = 'block';
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Envoi…';

    const ref = genQuoteId();
    const payload = Object.assign({}, data, {
      id: ref,
      status: 'new',
      history: [{ at: new Date().toISOString(), status: 'new', note: 'Création depuis le site' }]
    });

    // Tentative Supabase
    const supaOk = (window.HBT_CONFIG && window.HBT_CONFIG.isSupabaseReady && window.HBT_CONFIG.isSupabaseReady());
    let saved = false;
    if (supaOk) {
      try {
        const res = await fetch(window.HBT_CONFIG.supabase.url + '/rest/v1/quote_requests', {
          method: 'POST',
          headers: {
            apikey: window.HBT_CONFIG.supabase.anonKey,
            Authorization: 'Bearer ' + window.HBT_CONFIG.supabase.anonKey,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          saved = true;
        } else {
          const txt = await res.text();
          console.warn('[Quote] Supabase ' + res.status, txt.slice(0, 200));
        }
      } catch (e) {
        console.warn('[Quote] Réseau Supabase :', e.message);
      }
    }
    // Fallback : sauvegarde locale (toujours utile en backup)
    try {
      const key = 'home-by-tika-quotes';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      list.push(Object.assign({}, payload, { created_at: new Date().toISOString() }));
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {}

    // Affichage succès (toujours, même si Supabase failed — l'utilisateur a son ref + lien WhatsApp)
    document.getElementById('hbt-q-success-id').textContent = ref;
    document.getElementById('hbt-q-success-wa').href = buildWaLink(data, ref);
    document.getElementById('hbt-q-form').style.display = 'none';
    document.querySelectorAll('.hbt-q-actions, .hbt-q-lede').forEach(el => el.style.display = 'none');
    document.getElementById('hbt-q-success').classList.add('show');

    submit.disabled = false;
    submit.textContent = 'Envoyer ma demande';

    if (!saved && supaOk) {
      // L'envoi a échoué côté Supabase mais on a localStorage. On informe sans bloquer.
      console.warn('[Quote] Sauvegarde locale uniquement (Supabase indisponible)');
    }
    if (window.HBT && window.HBT.track) window.HBT.track('quote_request', { ref: ref, supabase: saved });
  }

  /* ===== Wire global ===== */
  function wire() {
    // Délégation : tout élément avec data-quote-trigger ou tout lien vers contact.html
    // avec texte contenant "devis" ouvre la modal.
    document.addEventListener('click', function (e) {
      // 1) data-quote-trigger explicite
      const trigger = e.target.closest('[data-quote-trigger]');
      if (trigger) {
        e.preventDefault();
        const product = trigger.dataset.product || trigger.closest('[data-product-name]')?.dataset.productName;
        const wood = trigger.dataset.wood;
        const dim = trigger.dataset.dimensions;
        openModal({ product: product || '', wood: wood || '', dimensions: dim || '' });
        return;
      }
      // 2) Lien vers contact.html avec texte "devis"
      const link = e.target.closest('a[href*="contact.html"]');
      if (link) {
        const txt = (link.textContent || '').toLowerCase();
        if (/devis/.test(txt)) {
          e.preventDefault();
          // Cherche un produit dans la carte parente
          const card = link.closest('.product-card');
          const name = card ? (card.querySelector('.product-name')?.textContent || '').trim() : '';
          const wood = card ? (card.querySelector('.wood-tag')?.textContent || '').trim() : '';
          openModal({ product: name, wood: wood });
          return;
        }
      }
    });

    // Fermeture : bouton, overlay, escape
    document.addEventListener('click', function (e) {
      if (e.target.closest('.hbt-q-close')) { closeModal(); return; }
      if (e.target.classList && e.target.classList.contains('hbt-q-overlay')) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) closeModal();
    });
    // Submit
    document.addEventListener('click', function (e) {
      if (e.target.id === 'hbt-q-submit') {
        e.preventDefault();
        submitQuote();
      }
    });

    // Ouverture auto si URL contient ?devis=1
    if (location.search && /[?&]devis=1/.test(location.search)) {
      setTimeout(() => openModal({}), 200);
    }
  }

  function boot() { injectCSS(); wire(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  console.log('[quote-request] chargé ✓ — window.HBT_openQuoteModal disponible');
})();
