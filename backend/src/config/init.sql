-- ================================================================
-- Voucher System - Database Schema
-- Phase 2: Entity Initialization
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUM Types ──────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('ADMIN', 'PARTNER', 'CUSTOMER');
CREATE TYPE partner_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE voucher_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'EXPIRED', 'SOLD_OUT');
CREATE TYPE order_status AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED');
CREATE TYPE issued_voucher_status AS ENUM ('UNUSED', 'USED', 'EXPIRED', 'CANCELLED');

-- ─── Users ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        VARCHAR(255) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,          -- bcrypt hash
  full_name    VARCHAR(255) NOT NULL,
  phone        VARCHAR(20),
  role         user_role NOT NULL DEFAULT 'CUSTOMER',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Partners ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partners (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name     VARCHAR(255) NOT NULL,
  business_license  VARCHAR(100),
  representative    VARCHAR(255) NOT NULL,
  address           TEXT,
  status            partner_status NOT NULL DEFAULT 'PENDING',
  rejection_reason  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Partner Branches ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partner_branches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id   UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  name         VARCHAR(255) NOT NULL,
  address      TEXT NOT NULL,
  phone        VARCHAR(20),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Vouchers ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vouchers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id       UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  category         VARCHAR(100),
  original_price   NUMERIC(15, 2) NOT NULL,   -- RB-02: must be > sale_price
  sale_price       NUMERIC(15, 2) NOT NULL,
  stock            INTEGER NOT NULL DEFAULT 0, -- RB-15: use SELECT FOR UPDATE
  sale_start       TIMESTAMPTZ,
  sale_end         TIMESTAMPTZ,               -- RB-03: expire check
  valid_until      TIMESTAMPTZ,               -- validity of the voucher after purchase
  terms            TEXT,
  status           voucher_status NOT NULL DEFAULT 'DRAFT',
  rejection_reason TEXT,
  image_url        VARCHAR(500),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- RB-02 constraint
  CONSTRAINT chk_price CHECK (sale_price < original_price),
  -- stock must not go negative
  CONSTRAINT chk_stock CHECK (stock >= 0)
);

-- 1) Bảng trung gian N-N: voucher <-> chi nhánh áp dụng
CREATE TABLE IF NOT EXISTS voucher_applicable_branches (
  voucher_id   UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  branch_id    UUID NOT NULL REFERENCES partner_branches(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (voucher_id, branch_id)
);

-- ─── Orders ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID NOT NULL REFERENCES users(id),
  total_amount    NUMERIC(15, 2) NOT NULL,
  status          order_status NOT NULL DEFAULT 'PENDING',
  payment_ref     VARCHAR(255),               -- mock payment reference
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Order Items ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  voucher_id   UUID NOT NULL REFERENCES vouchers(id),
  quantity     INTEGER NOT NULL DEFAULT 1,
  unit_price   NUMERIC(15, 2) NOT NULL,       -- price at time of purchase
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_quantity CHECK (quantity > 0)
);

-- ─── Issued Vouchers (Voucher Codes) ─────────────────────────────
-- RB-05: Only generated after successful payment
CREATE TABLE IF NOT EXISTS issued_vouchers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         VARCHAR(64) UNIQUE NOT NULL,   -- unique, hard-to-guess
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  voucher_id   UUID NOT NULL REFERENCES vouchers(id),
  customer_id  UUID NOT NULL REFERENCES users(id),
  partner_id   UUID NOT NULL REFERENCES partners(id),
  status       issued_voucher_status NOT NULL DEFAULT 'UNUSED',
  used_at      TIMESTAMPTZ,
  used_at_branch UUID REFERENCES partner_branches(id),
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Reviews ─────────────────────────────────────────────────────
-- RB-10: customer can only review purchased vouchers
CREATE TABLE IF NOT EXISTS reviews (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id          UUID NOT NULL REFERENCES vouchers(id),
  customer_id         UUID NOT NULL REFERENCES users(id),
  issued_voucher_id   UUID NOT NULL REFERENCES issued_vouchers(id),
  rating              SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment             TEXT,
  partner_reply       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- One review per issued voucher
  UNIQUE (issued_voucher_id)
);

-- ─── System Logs ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_logs (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(100) NOT NULL,
  entity      VARCHAR(100),
  entity_id   UUID,
  details     JSONB,
  ip_address  VARCHAR(45),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────────
CREATE INDEX idx_vouchers_partner   ON vouchers(partner_id);
CREATE INDEX idx_vouchers_status    ON vouchers(status);
CREATE INDEX idx_vouchers_category  ON vouchers(category);
CREATE INDEX idx_orders_customer    ON orders(customer_id);
CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_issued_customer    ON issued_vouchers(customer_id);
CREATE INDEX idx_issued_voucher     ON issued_vouchers(voucher_id);
CREATE INDEX idx_issued_code        ON issued_vouchers(code);
CREATE INDEX idx_reviews_voucher    ON reviews(voucher_id);
CREATE INDEX idx_logs_user          ON system_logs(user_id);
CREATE INDEX idx_logs_created       ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vab_voucher ON voucher_applicable_branches(voucher_id);
CREATE INDEX IF NOT EXISTS idx_vab_branch  ON voucher_applicable_branches(branch_id);

-- ─── Seed: Default Admin ─────────────────────────────────────────
-- Password: Admin@123 (bcrypt hash, change in production!)
INSERT INTO users (email, password, full_name, role)
VALUES (
  'admin@vouchersystem.com',
  '$2a$12$Z1wqUjLWalUisyhunqUu8u9GmJhNK1CYyKOVoQahqYdWeTgeb1J16',
  'System Administrator',
  'ADMIN'
) ON CONFLICT (email) DO NOTHING;

-- ─── Seed: Default Customer ──────────────────────────────────────
-- Password: Customer@123 (bcrypt hash)
INSERT INTO users (email, password, full_name, role)
VALUES (
  'customer@vouchersystem.com',
  '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
  'Demo Customer',
  'CUSTOMER'
) ON CONFLICT (email) DO NOTHING;
