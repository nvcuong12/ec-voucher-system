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
  email        VARCHAR(255) UNIQUE,
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
  payment_method  VARCHAR(50),
  recipient_name  VARCHAR(255),
  recipient_phone VARCHAR(20),
  recipient_email VARCHAR(255),
  note            TEXT,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure email can be nullable for phone-only accounts
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique ON users(phone) WHERE phone IS NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS recipient_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS recipient_phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS recipient_email VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS note TEXT;

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

-- ─── Seed: Demo Partner + Vouchers ───────────────────────────────
-- Password: Customer@123 (reuse hash for demo)
WITH partner_user AS (
  INSERT INTO users (email, password, full_name, phone, role)
  VALUES (
    'partner@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Demo Partner',
    '0900000000',
    'PARTNER'
  )
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id
),
partner_insert AS (
  INSERT INTO partners (user_id, business_name, business_license, representative, address, status)
  SELECT id, 'Sunrise Coffee', 'BL-001', 'Nguyen An', 'Quan 1, TP.HCM', 'APPROVED'::partner_status
  FROM partner_user
  WHERE NOT EXISTS (
    SELECT 1 FROM partners WHERE user_id = (SELECT id FROM partner_user)
  )
  RETURNING id
),
partner_ref AS (
  SELECT id FROM partners WHERE user_id = (SELECT id FROM partner_user)
  UNION ALL
  SELECT id FROM partner_insert
),
branch_a AS (
  INSERT INTO partner_branches (partner_id, name, address, phone)
  SELECT id, 'Sunrise Coffee - Nguyen Hue', '12 Nguyen Hue, Q1, TP.HCM', '0900000001'
  FROM partner_ref
  RETURNING id
),
branch_b AS (
  INSERT INTO partner_branches (partner_id, name, address, phone)
  SELECT id, 'Sunrise Coffee - Cach Mang', '120 Cach Mang Thang 8, Q3, TP.HCM', '0900000002'
  FROM partner_ref
  RETURNING id
),
voucher_rows AS (
  INSERT INTO vouchers (
    partner_id,
    name,
    description,
    category,
    original_price,
    sale_price,
    stock,
    sale_start,
    sale_end,
    valid_until,
    terms,
    image_url,
    status
  )
  SELECT id,
    'Brunch Set - 2 Nguoi',
    'Combo brunch dac biet tai Sunrise Coffee',
    'Am thuc',
    320000,
    179000,
    80,
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '60 days',
    'Ap dung tai chi nhanh Sunrise Coffee. Dat truoc 2 gio.',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    'APPROVED'::voucher_status
  FROM partner_ref
  UNION ALL
  SELECT id,
    'Set Tra Sua 4 Ly',
    'Mua 3 tang 1 cho nhom ban',
    'Am thuc',
    220000,
    139000,
    120,
    NOW() - INTERVAL '1 days',
    NOW() + INTERVAL '20 days',
    NOW() + INTERVAL '45 days',
    'Khong ap dung vao le/tet.',
    'https://images.unsplash.com/photo-1542444459-db37a1f5d3b4?auto=format&fit=crop&w=1200&q=80',
    'APPROVED'::voucher_status
  FROM partner_ref
  UNION ALL
  SELECT id,
    'Spa Thu Gian 90 Phut',
    'Goi cham soc co the tai Spa Nha Nho',
    'Lam dep',
    900000,
    490000,
    60,
    NOW() - INTERVAL '3 days',
    NOW() + INTERVAL '45 days',
    NOW() + INTERVAL '90 days',
    'Can dat lich truoc 1 ngay.',
    'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80',
    'APPROVED'::voucher_status
  FROM partner_ref
  UNION ALL
  SELECT id,
    'Goi Tap Yoga 10 Buoi',
    'Lop yoga co ban cho nguoi moi',
    'Suc khoe',
    1500000,
    790000,
    40,
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '25 days',
    NOW() + INTERVAL '60 days',
    'Vui long den som 10 phut truoc gio hoc.',
    'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?auto=format&fit=crop&w=1200&q=80',
    'APPROVED'::voucher_status
  FROM partner_ref
  UNION ALL
  SELECT id,
    'Tour Cu Chi 1 Ngay',
    'Trai nghiem lich su tai dia dao Cu Chi',
    'Du lich',
    850000,
    590000,
    50,
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '40 days',
    NOW() + INTERVAL '90 days',
    'Bao gom xe dua don va huong dan vien.',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    'APPROVED'::voucher_status
  FROM partner_ref
  UNION ALL
  SELECT id,
    'Ve Phim Cuoi Tuan',
    'Ve xem phim 2D tai cum rap doi tac',
    'Giai tri',
    220000,
    99000,
    0,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '1 days',
    NOW() + INTERVAL '10 days',
    'Voucher het han khong hoan lai.',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    'APPROVED'::voucher_status
  FROM partner_ref
  RETURNING id
),
branch_all AS (
  SELECT id FROM branch_a
  UNION ALL
  SELECT id FROM branch_b
)
INSERT INTO voucher_applicable_branches (voucher_id, branch_id)
SELECT v.id, b.id
FROM voucher_rows v
CROSS JOIN branch_all b
ON CONFLICT DO NOTHING;
