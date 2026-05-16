-- =====================================================================
-- HOME BY TIKA — Table "quote_requests" (demandes de devis)
-- ---------------------------------------------------------------------
-- Copier-coller TOUT ce fichier dans :
--   Supabase → SQL Editor → New query → coller → Run
--
-- C'est idempotent : ré-exécutable sans risque, ne touche pas aux données
-- existantes.
-- =====================================================================

-- 1) Création de la table (avec toutes les colonnes attendues par le code)
CREATE TABLE IF NOT EXISTS quote_requests (
  id              TEXT PRIMARY KEY,          -- ex: HBTQ-260514-AB12
  customer_name   TEXT NOT NULL,
  phone           TEXT NOT NULL,
  email           TEXT DEFAULT '',
  location        TEXT DEFAULT '',           -- pays / ville
  product         TEXT DEFAULT '',           -- nom produit concerné
  dimensions      TEXT DEFAULT '',
  wood            TEXT DEFAULT '',           -- essence souhaitée
  budget          TEXT DEFAULT '',
  message         TEXT DEFAULT '',
  status          TEXT DEFAULT 'new',        -- new | discussion | quote_sent | confirmed | refused
  notes_admin     TEXT DEFAULT '',           -- notes internes admin
  history         JSONB DEFAULT '[]'::jsonb, -- historique changements de statut
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Activation Row Level Security (sécurité Supabase)
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- 3) Policies : autoriser anon (le frontend) à lire/écrire
--    Sécurité : le hash mot de passe admin filtre l'accès côté client.
--    Pour vraie prod : utiliser Supabase Auth + restreindre UPDATE/DELETE.

DROP POLICY IF EXISTS "Public insert quote_requests" ON quote_requests;
CREATE POLICY "Public insert quote_requests"
  ON quote_requests FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Public read quote_requests" ON quote_requests;
CREATE POLICY "Public read quote_requests"
  ON quote_requests FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Public update quote_requests" ON quote_requests;
CREATE POLICY "Public update quote_requests"
  ON quote_requests FOR UPDATE TO anon USING (true);

DROP POLICY IF EXISTS "Public delete quote_requests" ON quote_requests;
CREATE POLICY "Public delete quote_requests"
  ON quote_requests FOR DELETE TO anon USING (true);

-- 4) Vérification (à exécuter séparément pour confirmer)
-- SELECT count(*) FROM quote_requests;
-- → si la requête réussit, la table existe et est accessible.
