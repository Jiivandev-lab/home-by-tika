-- =====================================================================
-- HOME BY TIKA — Gestion annulations / retours / remboursements
-- ---------------------------------------------------------------------
-- À copier-coller dans : Supabase → SQL Editor → New query → Run.
-- 100% idempotent (ADD COLUMN IF NOT EXISTS).
-- =====================================================================

-- ===== TABLE ORDERS : extensions pour annulations / retours =====
ALTER TABLE orders ADD COLUMN IF NOT EXISTS archived            BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT    DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_amount       INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_method       TEXT    DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_at         TIMESTAMPTZ;

-- ===== TABLE QUOTE_REQUESTS : extensions =====
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS archived            BOOLEAN DEFAULT false;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS cancellation_reason TEXT    DEFAULT '';

-- ===== INDEX pour filtres rapides =====
CREATE INDEX IF NOT EXISTS idx_orders_archived       ON orders(archived);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON orders(status);
CREATE INDEX IF NOT EXISTS idx_requests_archived     ON quote_requests(archived);
CREATE INDEX IF NOT EXISTS idx_requests_status       ON quote_requests(status);

-- ===== NOTES sur les valeurs de status =====
-- orders.status peut désormais prendre ces valeurs:
--   Progression (existant): received, payment_confirmed, design_approved,
--     wood_prep, preparing, varnishing, quality_check, delivery_scheduled,
--     shipping, delivered
--   Annulation pré-paiement: cancelled, client_desisted, abandoned
--   Post-livraison: returned, refund_pending, refunded,
--     exchange_requested, dispute
--
-- quote_requests.status peut désormais prendre:
--   new, discussion, quote_sent, confirmed, refused, expired, cancelled
--
-- Le champ "archived" est un drapeau séparé pour masquer sans supprimer
-- (filtre admin "Tous / Actifs / Archivés").
-- =====================================================================
