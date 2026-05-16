-- =====================================================================
-- HOME BY TIKA — Table "accounting_entries" (comptabilité)
-- ---------------------------------------------------------------------
-- À copier-coller dans : Supabase → SQL Editor → New query → Run
--
-- Une entrée est créée AUTOMATIQUEMENT quand l'admin clique
-- "Valider le paiement" dans la modal d'une commande.
-- order_id est UNIQUE → impossible de duplicater une entrée.
-- =====================================================================

CREATE TABLE IF NOT EXISTS accounting_entries (
  id              TEXT PRIMARY KEY,         -- ex: ACC-260514-AB12
  order_id        TEXT UNIQUE NOT NULL,     -- 1 entrée par commande
  invoice_id      TEXT DEFAULT '',
  client_name     TEXT NOT NULL,
  client_phone    TEXT DEFAULT '',
  amount_paid     INTEGER NOT NULL,         -- FCFA
  order_total     INTEGER DEFAULT 0,        -- total commande (pour solde)
  payment_method  TEXT DEFAULT '',
  paid_at         TIMESTAMPTZ DEFAULT NOW(),-- date du paiement
  notes           TEXT DEFAULT '',
  status          TEXT DEFAULT 'recorded',  -- recorded | refunded | adjusted
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index sur paid_at pour requêtes par période (filtres rapides)
CREATE INDEX IF NOT EXISTS idx_accounting_paid_at ON accounting_entries(paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_accounting_method  ON accounting_entries(payment_method);

ALTER TABLE accounting_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read accounting_entries" ON accounting_entries;
CREATE POLICY "Public read accounting_entries"
  ON accounting_entries FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Public insert accounting_entries" ON accounting_entries;
CREATE POLICY "Public insert accounting_entries"
  ON accounting_entries FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Public update accounting_entries" ON accounting_entries;
CREATE POLICY "Public update accounting_entries"
  ON accounting_entries FOR UPDATE TO anon USING (true);

DROP POLICY IF EXISTS "Public delete accounting_entries" ON accounting_entries;
CREATE POLICY "Public delete accounting_entries"
  ON accounting_entries FOR DELETE TO anon USING (true);

-- Vérification (à exécuter séparément) :
-- SELECT count(*) FROM accounting_entries;
