-- ================================================================
-- Voucher System - Extra Seed Data
-- File runs after 01-init.sql on a fresh database
-- ================================================================

-- ─── Content / Navigation Data ───────────────────────────────────
INSERT INTO categories (name)
VALUES
  ('Ẩm thực'),
  ('Làm đẹp'),
  ('Sức khỏe'),
  ('Du lịch'),
  ('Giải trí'),
  ('Mua sắm')
ON CONFLICT (name) DO NOTHING;

DELETE FROM banners
WHERE title IN (
  'Ưu đãi cuối tuần',
  'Mùa hè rực rỡ',
  'Khám phá phong cách sống'
);

INSERT INTO banners (title, image_url, link_url, sort_order, is_active)
VALUES
  (
    'Ưu đãi cuối tuần',
    'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1400&q=80',
    '/vouchers?category=Ẩm%20thực',
    1,
    TRUE
  ),
  (
    'Mùa hè rực rỡ',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
    '/vouchers?category=Du%20lịch',
    2,
    TRUE
  ),
  (
    'Khám phá phong cách sống',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80',
    '/vouchers?category=Làm%20đẹp',
    3,
    TRUE
  );

INSERT INTO content_pages (slug, title, content, is_active)
VALUES
  (
    'gioi-thieu',
    'Giới thiệu VoucherHub',
    'VoucherHub là nền tảng bán voucher giảm giá đa ngành với các nhóm Ẩm thực, Làm đẹp, Du lịch, Giải trí và Mua sắm.',
    TRUE
  ),
  (
    'dieu-khoan-su-dung',
    'Điều khoản sử dụng',
    'Người dùng cần tuân thủ điều khoản của từng voucher, hạn sử dụng và quy định của đối tác cung cấp.',
    TRUE
  ),
  (
    'chinh-sach-bao-mat',
    'Chính sách bảo mật',
    'Thông tin tài khoản được bảo vệ bằng JWT, mật khẩu được mã hóa bằng bcrypt và chỉ dùng cho xác thực.',
    TRUE
  ),
  (
    'huong-dan-su-dung',
    'Hướng dẫn sử dụng',
    'Khách hàng có thể xem voucher công khai, mua hàng, nhận mã và sử dụng tại chi nhánh được áp dụng.',
    TRUE
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ─── Extra Customers ─────────────────────────────────────────────
INSERT INTO users (email, password, full_name, phone, role)
VALUES
  (
    'customer1@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Lê Minh Anh',
    '0901000001',
    'CUSTOMER'
  ),
  (
    'customer2@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Trần Gia Huy',
    '0901000002',
    'CUSTOMER'
  ),
  (
    'customer3@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Nguyễn Thanh Hà',
    '0901000003',
    'CUSTOMER'
  )
ON CONFLICT (email) DO UPDATE SET
  email = EXCLUDED.email;

-- ─── Partner 2: Green Spa ───────────────────────────────────────
WITH partner_user AS (
  INSERT INTO users (email, password, full_name, phone, role)
  VALUES (
    'partner2@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Green Spa Operator',
    '0902000001',
    'PARTNER'
  )
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id
), partner_insert AS (
  INSERT INTO partners (user_id, business_name, business_license, representative, address, status)
  SELECT id, 'Green Spa', 'BL-002', 'Phạm Trâm', 'Quận 3, TP.HCM', 'APPROVED'::partner_status
  FROM partner_user
  WHERE NOT EXISTS (
    SELECT 1 FROM partners WHERE user_id = (SELECT id FROM partner_user)
  )
  RETURNING id
), partner_ref AS (
  SELECT id FROM partners WHERE user_id = (SELECT id FROM partner_user)
  UNION ALL
  SELECT id FROM partner_insert
), branch_1 AS (
  INSERT INTO partner_branches (partner_id, name, address, phone)
  SELECT id, 'Green Spa - Võ Văn Tần', '88 Võ Văn Tần, Q3, TP.HCM', '0902000002'
  FROM partner_ref
  WHERE NOT EXISTS (
    SELECT 1 FROM partner_branches WHERE partner_id = (SELECT id FROM partner_ref) AND name = 'Green Spa - Võ Văn Tần'
  )
  RETURNING id
), branch_2 AS (
  INSERT INTO partner_branches (partner_id, name, address, phone)
  SELECT id, 'Green Spa - Phú Nhuận', '15 Phan Đăng Lưu, Phú Nhuận, TP.HCM', '0902000003'
  FROM partner_ref
  WHERE NOT EXISTS (
    SELECT 1 FROM partner_branches WHERE partner_id = (SELECT id FROM partner_ref) AND name = 'Green Spa - Phú Nhuận'
  )
  RETURNING id
), voucher_rows AS (
  INSERT INTO vouchers (
    partner_id, name, description, category, original_price, sale_price,
    stock, sale_start, sale_end, valid_until, terms, image_url, status
  )
  SELECT
    id,
    'Body Massage 90 Phút',
    'Massage body thư giãn tại Green Spa',
    'Làm đẹp',
    850000,
    490000,
    50,
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '40 days',
    NOW() + INTERVAL '80 days',
    'Đặt lịch trước 1 ngày. Không áp dụng cuối tuần.',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6a9f8c?auto=format&fit=crop&w=1200&q=80',
    'APPROVED'::voucher_status
  FROM partner_ref
  UNION ALL
  SELECT
    id,
    'Facial Refresh 60 Phút',
    'Chăm sóc da mặt chuyên sâu',
    'Làm đẹp',
    650000,
    349000,
    70,
    NOW() - INTERVAL '1 days',
    NOW() + INTERVAL '35 days',
    NOW() + INTERVAL '90 days',
    'Áp dụng tất cả ngày trong tuần.',
    'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80',
    'APPROVED'::voucher_status
  FROM partner_ref
  UNION ALL
  SELECT
    id,
    'Couple Spa Retreat',
    'Gói chăm sóc đôi cho 2 người',
    'Sức khỏe',
    1300000,
    790000,
    25,
    NOW() - INTERVAL '1 days',
    NOW() + INTERVAL '50 days',
    NOW() + INTERVAL '90 days',
    'Cần đặt hẹn trước 48 giờ.',
    'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80',
    'REJECTED'::voucher_status
  FROM partner_ref
  UNION ALL
  SELECT
    id,
    'Yoga Recovery Pack',
    'Combo lớp yoga + xông hơi phục hồi',
    'Sức khỏe',
    1200000,
    699000,
    0,
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '1 days',
    NOW() + INTERVAL '10 days',
    'Voucher hết hạn không còn hiệu lực.',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    'SOLD_OUT'::voucher_status
  FROM partner_ref
  RETURNING id
), branch_all AS (
  SELECT id FROM branch_1
  UNION ALL
  SELECT id FROM branch_2
)
INSERT INTO voucher_applicable_branches (voucher_id, branch_id)
SELECT v.id, b.id
FROM voucher_rows v
CROSS JOIN branch_all b
ON CONFLICT DO NOTHING;

-- ─── Partner 3: Sunrise Eats ────────────────────────────────────
WITH partner_user AS (
  INSERT INTO users (email, password, full_name, phone, role)
  VALUES (
    'partner3@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Sunrise Eats Operator',
    '0903000001',
    'PARTNER'
  )
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id
), partner_insert AS (
  INSERT INTO partners (user_id, business_name, business_license, representative, address, status)
  SELECT id, 'Sunrise Eats', 'BL-003', 'Đỗ Hân', 'Quận 1, TP.HCM', 'APPROVED'::partner_status
  FROM partner_user
  WHERE NOT EXISTS (
    SELECT 1 FROM partners WHERE user_id = (SELECT id FROM partner_user)
  )
  RETURNING id
), partner_ref AS (
  SELECT id FROM partners WHERE user_id = (SELECT id FROM partner_user)
  UNION ALL
  SELECT id FROM partner_insert
), branch_1 AS (
  INSERT INTO partner_branches (partner_id, name, address, phone)
  SELECT id, 'Sunrise Eats - Lê Lợi', '24 Lê Lợi, Q1, TP.HCM', '0903000002'
  FROM partner_ref
  WHERE NOT EXISTS (
    SELECT 1 FROM partner_branches WHERE partner_id = (SELECT id FROM partner_ref) AND name = 'Sunrise Eats - Lê Lợi'
  )
  RETURNING id
), branch_2 AS (
  INSERT INTO partner_branches (partner_id, name, address, phone)
  SELECT id, 'Sunrise Eats - Thủ Đức', '09 Võ Văn Ngân, Thủ Đức, TP.HCM', '0903000003'
  FROM partner_ref
  WHERE NOT EXISTS (
    SELECT 1 FROM partner_branches WHERE partner_id = (SELECT id FROM partner_ref) AND name = 'Sunrise Eats - Thủ Đức'
  )
  RETURNING id
), voucher_rows AS (
  INSERT INTO vouchers (
    partner_id, name, description, category, original_price, sale_price,
    stock, sale_start, sale_end, valid_until, terms, image_url, status
  )
  SELECT
    id,
    'Combo Breakfast Deluxe',
    'Bữa sáng cho 2 người kèm nước',
    'Ẩm thực',
    260000,
    149000,
    90,
    NOW() - INTERVAL '1 days',
    NOW() + INTERVAL '25 days',
    NOW() + INTERVAL '60 days',
    'Áp dụng cho khung giờ 7h-10h sáng.',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    'APPROVED'::voucher_status
  FROM partner_ref
  UNION ALL
  SELECT
    id,
    'Cafe Sáng - 5 Ly',
    'Voucher dành cho nhóm bạn uống café sáng',
    'Ẩm thực',
    375000,
    219000,
    75,
    NOW() - INTERVAL '1 days',
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '60 days',
    'Không đổi sang món khác.',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    'PENDING_APPROVAL'::voucher_status
  FROM partner_ref
  UNION ALL
  SELECT
    id,
    'Lunch Express',
    'Suất ăn trưa nhanh tại văn phòng',
    'Ẩm thực',
    180000,
    99000,
    150,
    NOW() - INTERVAL '3 days',
    NOW() + INTERVAL '20 days',
    NOW() + INTERVAL '45 days',
    'Áp dụng từ thứ 2 đến thứ 6.',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
    'DRAFT'::voucher_status
  FROM partner_ref
  UNION ALL
  SELECT
    id,
    'Americano Pass 10 Ly',
    'Gói dùng dần trong 30 ngày',
    'Ẩm thực',
    500000,
    299000,
    40,
    NOW() - INTERVAL '10 days',
    NOW() + INTERVAL '15 days',
    NOW() + INTERVAL '30 days',
    'Không áp dụng khi mua mang đi sau 18h.',
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80',
    'APPROVED'::voucher_status
  FROM partner_ref
  RETURNING id
), branch_all AS (
  SELECT id FROM branch_1
  UNION ALL
  SELECT id FROM branch_2
)
INSERT INTO voucher_applicable_branches (voucher_id, branch_id)
SELECT v.id, b.id
FROM voucher_rows v
CROSS JOIN branch_all b
ON CONFLICT DO NOTHING;

-- ─── Pending Partner Sample ─────────────────────────────────────
WITH partner_user AS (
  INSERT INTO users (email, password, full_name, phone, role)
  VALUES (
    'partner-pending@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Pending Partner',
    '0904000001',
    'PARTNER'
  )
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id
)
INSERT INTO partners (user_id, business_name, business_license, representative, address, status)
SELECT id, 'Pending Studio', 'BL-004', 'Lâm Vy', 'Quận 7, TP.HCM', 'PENDING'::partner_status
FROM partner_user
WHERE NOT EXISTS (
  SELECT 1 FROM partners WHERE user_id = (SELECT id FROM partner_user)
);

-- ─── Paid Orders + Issued Vouchers + Review ──────────────────────
WITH customer_ref AS (
  SELECT id FROM users WHERE email = 'customer1@vouchersystem.com'
),
order_one AS (
  INSERT INTO orders (
    customer_id, total_amount, status, payment_ref, payment_method,
    recipient_name, recipient_phone, recipient_email, note, paid_at
  )
  SELECT id, 149000, 'PAID'::order_status, 'PAY-20260604-0001', 'MOMO',
         'Lê Minh Anh', '0901000001', 'customer1@vouchersystem.com',
         'Đặt giao voucher qua email', NOW() - INTERVAL '2 hours'
  FROM customer_ref
  WHERE NOT EXISTS (
    SELECT 1 FROM orders WHERE payment_ref = 'PAY-20260604-0001'
  )
  RETURNING id
),
order_one_item AS (
  INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
  SELECT o.id, v.id, 1, v.sale_price
  FROM order_one o
  JOIN vouchers v ON v.name = 'Combo Breakfast Deluxe'
  RETURNING id, voucher_id
),
issue_one AS (
  INSERT INTO issued_vouchers (
    code, order_item_id, voucher_id, customer_id, partner_id,
    status, expires_at
  )
  SELECT
    'VCH-20260604-0001',
    i.id,
    i.voucher_id,
    c.id,
    v.partner_id,
    'UNUSED'::issued_voucher_status,
    NOW() + INTERVAL '59 days'
  FROM order_one_item i
  JOIN vouchers v ON v.id = i.voucher_id
  CROSS JOIN customer_ref c
  ON CONFLICT (code) DO NOTHING
  RETURNING id, voucher_id, customer_id
),
customer_ref_2 AS (
  SELECT id FROM users WHERE email = 'customer2@vouchersystem.com'
),
order_two AS (
  INSERT INTO orders (
    customer_id, total_amount, status, payment_ref, payment_method,
    recipient_name, recipient_phone, recipient_email, note, paid_at
  )
  SELECT id, 490000, 'PAID'::order_status, 'PAY-20260604-0002', 'VNPay',
         'Trần Gia Huy', '0901000002', 'customer2@vouchersystem.com',
         'Thanh toán thành công', NOW() - INTERVAL '1 days'
  FROM customer_ref_2
  WHERE NOT EXISTS (
    SELECT 1 FROM orders WHERE payment_ref = 'PAY-20260604-0002'
  )
  RETURNING id
),
order_two_item AS (
  INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
  SELECT o.id, v.id, 1, v.sale_price
  FROM order_two o
  JOIN vouchers v ON v.name = 'Body Massage 90 Phút'
  RETURNING id, voucher_id
),
issue_two AS (
  INSERT INTO issued_vouchers (
    code, order_item_id, voucher_id, customer_id, partner_id,
    status, used_at, used_at_branch, expires_at
  )
  SELECT
    'VCH-20260604-0002',
    i.id,
    i.voucher_id,
    c.id,
    v.partner_id,
    'USED'::issued_voucher_status,
    NOW() - INTERVAL '12 hours',
    b.id,
    NOW() + INTERVAL '39 days'
  FROM order_two_item i
  JOIN vouchers v ON v.id = i.voucher_id
  JOIN partner_branches b ON b.partner_id = v.partner_id
  CROSS JOIN customer_ref_2 c
  ORDER BY b.created_at ASC
  LIMIT 1
  ON CONFLICT (code) DO NOTHING
  RETURNING id, voucher_id, customer_id
)
INSERT INTO reviews (voucher_id, customer_id, issued_voucher_id, rating, comment, partner_reply)
SELECT
  voucher_id,
  customer_id,
  id,
  5,
  'Dịch vụ tốt, không gian đẹp và nhân viên thân thiện.',
  'Cảm ơn bạn đã để lại đánh giá!'
FROM issue_two
ON CONFLICT (issued_voucher_id) DO NOTHING;

-- ─── Expanded Demo Customers ─────────────────────────────────────
INSERT INTO users (email, password, full_name, phone, role)
VALUES
  (
    'customer4@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Nguyễn Tuấn Kiệt',
    '0901000004',
    'CUSTOMER'
  ),
  (
    'customer5@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Võ Phương Linh',
    '0901000005',
    'CUSTOMER'
  ),
  (
    'customer6@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Lê Quốc Bảo',
    '0901000006',
    'CUSTOMER'
  ),
  (
    'customer7@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Đặng Thảo My',
    '0901000007',
    'CUSTOMER'
  ),
  (
    'customer8@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Phạm Nhật Nam',
    '0901000008',
    'CUSTOMER'
  ),
  (
    'customer9@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Bùi Khánh Vy',
    '0901000009',
    'CUSTOMER'
  ),
  (
    'customer10@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Trương Gia Bảo',
    '0901000010',
    'CUSTOMER'
  ),
  (
    'customer11@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Hồ Minh Trang',
    '0901000011',
    'CUSTOMER'
  ),
  (
    'customer12@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Dương Anh Khoa',
    '0901000012',
    'CUSTOMER'
  ),
  (
    'customer13@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Lâm Ngọc Hân',
    '0901000013',
    'CUSTOMER'
  ),
  (
    'customer14@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Đỗ Thành Long',
    '0901000014',
    'CUSTOMER'
  ),
  (
    'customer15@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Phan Thanh Tâm',
    '0901000015',
    'CUSTOMER'
  )
ON CONFLICT (email) DO UPDATE SET
  email = EXCLUDED.email;

-- ─── Expanded Approved Partners ──────────────────────────────────
INSERT INTO users (email, password, full_name, phone, role)
VALUES
  (
    'partner4@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Lotus Beauty Operator',
    '0904000002',
    'PARTNER'
  ),
  (
    'partner5@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'River Spa Operator',
    '0905000002',
    'PARTNER'
  ),
  (
    'partner6@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Urban Eats Operator',
    '0906000002',
    'PARTNER'
  ),
  (
    'partner7@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'FitLab Studio Operator',
    '0907000002',
    'PARTNER'
  ),
  (
    'partner8@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Cozy Travel Operator',
    '0908000002',
    'PARTNER'
  ),
  (
    'partner9@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Moon Cinema Operator',
    '0909000002',
    'PARTNER'
  ),
  (
    'partner10@vouchersystem.com',
    '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm',
    'Market Mart Operator',
    '0910000002',
    'PARTNER'
  )
ON CONFLICT (email) DO UPDATE SET
  email = EXCLUDED.email;

WITH partner_specs AS (
  SELECT *
  FROM (VALUES
    (
      'partner4@vouchersystem.com',
      'Lotus Beauty',
      'BL-005',
      'Mai Hương',
      'Quận 10, TP.HCM',
      '0904000002',
      'Lotus Beauty - CMT8',
      '155 Cách Mạng Tháng 8, Q10, TP.HCM',
      '0904000003',
      'Lotus Beauty - Phú Nhuận',
      '42 Phan Xích Long, Phú Nhuận, TP.HCM',
      '0904000004'
    ),
    (
      'partner5@vouchersystem.com',
      'River Spa',
      'BL-006',
      'Trần Bảo Ngọc',
      'Quận 3, TP.HCM',
      '0905000002',
      'River Spa - Hai Bà Trưng',
      '88 Hai Bà Trưng, Q3, TP.HCM',
      '0905000003',
      'River Spa - Bình Thạnh',
      '17 Nguyễn Gia Trí, Bình Thạnh, TP.HCM',
      '0905000004'
    ),
    (
      'partner6@vouchersystem.com',
      'Urban Eats',
      'BL-007',
      'Lê Gia Huy',
      'Quận 7, TP.HCM',
      '0906000002',
      'Urban Eats - Phú Mỹ Hưng',
      '12 Nguyễn Lương Bằng, Q7, TP.HCM',
      '0906000003',
      'Urban Eats - Nguyễn Văn Linh',
      '196 Nguyễn Văn Linh, Q7, TP.HCM',
      '0906000004'
    ),
    (
      'partner7@vouchersystem.com',
      'FitLab Studio',
      'BL-008',
      'Nguyễn Minh Khang',
      'TP. Thủ Đức, TP.HCM',
      '0907000002',
      'FitLab Studio - Võ Văn Ngân',
      '99 Võ Văn Ngân, Thủ Đức, TP.HCM',
      '0907000003',
      'FitLab Studio - Kha Vạn Cân',
      '210 Kha Vạn Cân, Thủ Đức, TP.HCM',
      '0907000004'
    ),
    (
      'partner8@vouchersystem.com',
      'Cozy Travel',
      'BL-009',
      'Phan Thu Hà',
      'Quận 1, TP.HCM',
      '0908000002',
      'Cozy Travel - Bến Thành',
      '01 Lê Lai, Q1, TP.HCM',
      '0908000003',
      'Cozy Travel - Nguyễn Huệ',
      '22 Nguyễn Huệ, Q1, TP.HCM',
      '0908000004'
    ),
    (
      'partner9@vouchersystem.com',
      'Moon Cinema',
      'BL-010',
      'Đỗ Nhật Quang',
      'Tân Bình, TP.HCM',
      '0909000002',
      'Moon Cinema - Cộng Hòa',
      '135 Cộng Hòa, Tân Bình, TP.HCM',
      '0909000003',
      'Moon Cinema - Trường Sơn',
      '48 Trường Sơn, Tân Bình, TP.HCM',
      '0909000004'
    ),
    (
      'partner10@vouchersystem.com',
      'Market Mart',
      'BL-011',
      'Phạm Quỳnh Anh',
      'Gò Vấp, TP.HCM',
      '0910000002',
      'Market Mart - Quang Trung',
      '232 Quang Trung, Gò Vấp, TP.HCM',
      '0910000003',
      'Market Mart - Phan Văn Trị',
      '88 Phan Văn Trị, Gò Vấp, TP.HCM',
      '0910000004'
    )
  ) AS t(
    email,
    business_name,
    business_license,
    representative,
    address,
    phone,
    branch1_name,
    branch1_address,
    branch1_phone,
    branch2_name,
    branch2_address,
    branch2_phone
  )
)
INSERT INTO partners (user_id, business_name, business_license, representative, address, status)
SELECT
  u.id,
  s.business_name,
  s.business_license,
  s.representative,
  s.address,
  'APPROVED'::partner_status
FROM partner_specs s
JOIN users u ON u.email = s.email
WHERE NOT EXISTS (
  SELECT 1 FROM partners p WHERE p.user_id = u.id
);

WITH partner_specs AS (
  SELECT *
  FROM (VALUES
    (
      'partner4@vouchersystem.com',
      'Lotus Beauty - CMT8',
      '155 Cách Mạng Tháng 8, Q10, TP.HCM',
      '0904000003',
      'Lotus Beauty - Phú Nhuận',
      '42 Phan Xích Long, Phú Nhuận, TP.HCM',
      '0904000004'
    ),
    (
      'partner5@vouchersystem.com',
      'River Spa - Hai Bà Trưng',
      '88 Hai Bà Trưng, Q3, TP.HCM',
      '0905000003',
      'River Spa - Bình Thạnh',
      '17 Nguyễn Gia Trí, Bình Thạnh, TP.HCM',
      '0905000004'
    ),
    (
      'partner6@vouchersystem.com',
      'Urban Eats - Phú Mỹ Hưng',
      '12 Nguyễn Lương Bằng, Q7, TP.HCM',
      '0906000003',
      'Urban Eats - Nguyễn Văn Linh',
      '196 Nguyễn Văn Linh, Q7, TP.HCM',
      '0906000004'
    ),
    (
      'partner7@vouchersystem.com',
      'FitLab Studio - Võ Văn Ngân',
      '99 Võ Văn Ngân, Thủ Đức, TP.HCM',
      '0907000003',
      'FitLab Studio - Kha Vạn Cân',
      '210 Kha Vạn Cân, Thủ Đức, TP.HCM',
      '0907000004'
    ),
    (
      'partner8@vouchersystem.com',
      'Cozy Travel - Bến Thành',
      '01 Lê Lai, Q1, TP.HCM',
      '0908000003',
      'Cozy Travel - Nguyễn Huệ',
      '22 Nguyễn Huệ, Q1, TP.HCM',
      '0908000004'
    ),
    (
      'partner9@vouchersystem.com',
      'Moon Cinema - Cộng Hòa',
      '135 Cộng Hòa, Tân Bình, TP.HCM',
      '0909000003',
      'Moon Cinema - Trường Sơn',
      '48 Trường Sơn, Tân Bình, TP.HCM',
      '0909000004'
    ),
    (
      'partner10@vouchersystem.com',
      'Market Mart - Quang Trung',
      '232 Quang Trung, Gò Vấp, TP.HCM',
      '0910000003',
      'Market Mart - Phan Văn Trị',
      '88 Phan Văn Trị, Gò Vấp, TP.HCM',
      '0910000004'
    )
  ) AS t(
    email,
    branch1_name,
    branch1_address,
    branch1_phone,
    branch2_name,
    branch2_address,
    branch2_phone
  )
), partner_ref AS (
  SELECT p.id AS partner_id, s.*
  FROM partner_specs s
  JOIN users u ON u.email = s.email
  JOIN partners p ON p.user_id = u.id
)
INSERT INTO partner_branches (partner_id, name, address, phone)
SELECT partner_id, branch_name, branch_address, branch_phone
FROM (
  SELECT partner_id, branch1_name AS branch_name, branch1_address AS branch_address, branch1_phone AS branch_phone
  FROM partner_ref
  UNION ALL
  SELECT partner_id, branch2_name AS branch_name, branch2_address AS branch_address, branch2_phone AS branch_phone
  FROM partner_ref
) AS branch_rows
WHERE NOT EXISTS (
  SELECT 1
  FROM partner_branches pb
  WHERE pb.partner_id = branch_rows.partner_id
    AND pb.name = branch_rows.branch_name
);

WITH approved_partners AS (
  SELECT
    id,
    business_name,
    ROW_NUMBER() OVER (ORDER BY business_name) AS rn,
    COUNT(*) OVER () AS total
  FROM partners
  WHERE status = 'APPROVED'
), voucher_specs AS (
  SELECT
    gs,
    ap.id AS partner_id,
    ap.business_name,
    ARRAY['Ẩm thực', 'Làm đẹp', 'Sức khỏe', 'Du lịch', 'Giải trí', 'Mua sắm'][(gs - 1) % 6 + 1] AS category,
    ARRAY['Combo Tiết Kiệm', 'Flash Deal', 'Happy Hour', 'Weekend Special', 'Family Pack', 'Couple Pass', 'Premium Set', 'Mini Bundle', 'Staycation', 'Voucher Xịn'][(gs - 1) % 10 + 1] AS title_prefix,
    ARRAY[
      'Áp dụng theo khung giờ ưu tiên của đối tác.',
      'Vui lòng đặt lịch trước khi sử dụng voucher.',
      'Không áp dụng đồng thời với các chương trình khác.',
      'Mỗi khách hàng chỉ được dùng một lần cho mỗi voucher.',
      'Ưu đãi áp dụng tại các chi nhánh được chỉ định.',
      'Voucher có thể yêu cầu xuất trình mã xác nhận khi dùng.',
      'Áp dụng trong thời gian khuyến mãi của đối tác.',
      'Không hoàn tiền sau khi thanh toán thành công.'
    ][(gs - 1) % 8 + 1] AS term_text,
    ARRAY[
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542444459-db37a1f5d3b4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6a9f8c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80'
    ][(gs - 1) % 10 + 1] AS image_url,
    (180000 + ((gs - 1) % 12) * 35000 + ap.rn * 15000)::numeric(15, 2) AS original_price,
    (180000 + ((gs - 1) % 12) * 35000 + ap.rn * 15000 - (30000 + ((gs - 1) % 5) * 7000))::numeric(15, 2) AS sale_price,
    20 + ((gs - 1) % 8) * 10 AS stock,
    NOW() - (((gs - 1) % 5) + 1) * INTERVAL '1 day' AS sale_start,
    NOW() + (((gs - 1) % 25) + 15) * INTERVAL '1 day' AS sale_end,
    NOW() + (((gs - 1) % 50) + 30) * INTERVAL '1 day' AS valid_until
  FROM generate_series(1, 86) AS gs
  JOIN approved_partners ap
    ON ap.rn = ((gs - 1) % ap.total) + 1
), voucher_rows AS (
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
  SELECT
    partner_id,
    format('%s %s #%s', title_prefix, business_name, lpad(gs::text, 3, '0')),
    format('Ưu đãi đặc biệt từ %s dành cho khách hàng thân thiết.', business_name),
    category,
    original_price,
    sale_price,
    stock,
    sale_start,
    sale_end,
    valid_until,
    term_text,
    image_url,
    'APPROVED'::voucher_status
  FROM voucher_specs
  RETURNING id, partner_id
)
INSERT INTO voucher_applicable_branches (voucher_id, branch_id)
SELECT
  vr.id,
  branch_pick.id
FROM voucher_rows vr
JOIN LATERAL (
  SELECT id
  FROM partner_branches
  WHERE partner_id = vr.partner_id
    AND is_active = TRUE
  ORDER BY created_at ASC
  LIMIT 2
) AS branch_pick ON TRUE
ON CONFLICT DO NOTHING;
