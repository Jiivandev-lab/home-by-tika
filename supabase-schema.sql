-- =====================================================================
-- HOME BY TIKA — Schéma Supabase complet
-- ---------------------------------------------------------------------
-- À exécuter dans Supabase → SQL Editor → New query → Run.
-- Une seule fois lors de la mise en place.
--
-- Tables créées :
--   • orders   — suivi de commande multi-appareils (déjà documenté README)
--   • products — catalogue dynamique (admin Shopify-like)
--
-- Sécurité : Row Level Security activée. Les policies « anon » sont OK
-- pour un prototype, car le frontend filtre via le hash mot de passe admin.
-- Pour production sérieuse : Supabase Auth + policies authenticated.
-- =====================================================================
 
 
-- ===================== TABLE ORDERS =====================
CREATE TABLE IF NOT EXISTS orders (
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
 
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
 
DROP POLICY IF EXISTS "Public read orders" ON orders;
CREATE POLICY "Public read orders"
  ON orders FOR SELECT TO anon USING (true);
 
DROP POLICY IF EXISTS "Public insert orders" ON orders;
CREATE POLICY "Public insert orders"
  ON orders FOR INSERT TO anon WITH CHECK (true);
 
DROP POLICY IF EXISTS "Public update orders" ON orders;
CREATE POLICY "Public update orders"
  ON orders FOR UPDATE TO anon USING (true);
 
 
-- ===================== TABLE PRODUCTS (NOUVEAU) =====================
-- Catalogue dynamique géré depuis l'admin.
-- Le site lit cette table en plus du manifeste hardcodé (rétro-compat).
CREATE TABLE IF NOT EXISTS products (
  id              TEXT PRIMARY KEY,              -- slug auto : porte-lagune-premium
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,                 -- portes, salons, tables, etc.
  price           INTEGER,                       -- FCFA (NULL = sur devis)
  wood            TEXT DEFAULT '',               -- Iroko, Framiré, Teck, Laiton…
  description     TEXT DEFAULT '',
  label           TEXT DEFAULT '',               -- badge optionnel
  monogram        TEXT DEFAULT '',               -- lettre du placeholder
  cloudinary_id   TEXT,                          -- public_id complet
  cloudinary_url  TEXT,                          -- URL secure HTTPS
  tags            TEXT[] DEFAULT '{}',           -- tags appliqués
  published       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
 
-- Index pour requêtes par catégorie (boutique filter)
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(published);
 
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
 
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products"
  ON products FOR SELECT TO anon USING (published = true);
 
DROP POLICY IF EXISTS "Public insert products" ON products;
CREATE POLICY "Public insert products"
  ON products FOR INSERT TO anon WITH CHECK (true);
 
DROP POLICY IF EXISTS "Public update products" ON products;
CREATE POLICY "Public update products"
  ON products FOR UPDATE TO anon USING (true);
 
DROP POLICY IF EXISTS "Public delete products" ON products;
CREATE POLICY "Public delete products"
  ON products FOR DELETE TO anon USING (true);
 
 
-- ===================== VÉRIFICATION =====================
-- À exécuter pour confirmer que tout est bien en place :
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public'
--   AND table_name IN ('orders', 'products');
-- → doit retourner 2 lignes.
 
