# Test Cases Giai Đoạn 2 (Manual)

Mục tiêu: hoàn thành bộ test case manual cho:

- Auth flow (Login/Register + restore session)
- Voucher approval flow (Admin duyệt/tu choi voucher)

Phạm vi API tham chiếu:

- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Admin voucher: `/api/admin/vouchers/pending`, `/api/admin/vouchers/:id/approve`, `/api/admin/vouchers/:id/reject`

---

## A. Auth Test Cases (8 cases)

| ID | Loại | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| AUTH-01 | Happy path | Chua co tai khoan voi email test | 1) Mo trang Register 2) Nhap `full_name`, `email` moi, `password`, `confirmPassword` hop le 3) Chon role `CUSTOMER` 4) Submit | API tra token + user. FE luu token vao `localStorage`. User duoc redirect ve trang mac dinh cua role (`/`). |
| AUTH-02 | Happy path | Co tai khoan hop le (CUSTOMER/PARTNER/ADMIN) | 1) Mo trang Login 2) Nhap email/password dung 3) Submit | Dang nhap thanh cong, token duoc luu `localStorage`, header Authorization duoc set, redirect theo role (`/`, `/partner`, `/admin`). |
| AUTH-03 | Edge case | Email da ton tai | 1) Register bang email da dang ky 2) Submit | API tra `409 Email already registered`. UI hien thong bao loi than thien. Khong redirect. |
| AUTH-04 | Edge case | Khong nhap day du field | 1) Register bo trong 1 trong cac field bat buoc (`email/password/full_name`) 2) Submit | API tra `400` voi message required fields. UI hien loi, user o lai trang register. |
| AUTH-05 | Edge case | Tai khoan ton tai | 1) Login voi email dung, password sai | API tra `401 Invalid credentials`. UI hien thong bao loi, khong luu token. |
| AUTH-06 | Edge case | Co token hop le trong `localStorage` | 1) Login thanh cong 2) F5 trinh duyet | Auth state duoc restore (goi `/api/auth/me` thanh cong), user van dang nhap, khong bi da ve login. |
| AUTH-07 | Edge case | Co token het han/khong hop le trong `localStorage` | 1) Gia lap token het han (sua tay trong localStorage) 2) F5 hoac goi API can auth | API tra `401`, interceptor xoa token, user bi chuyen ve `/login`. |
| AUTH-08 | Security/Role guard | User dang dang nhap role CUSTOMER | 1) Truy cap truc tiep route `/admin` 2) Truy cap `/partner` | `ProtectedRoute` chan truy cap va redirect den `/unauthorized`. Khong hien noi dung dashboard role khac. |

---

## B. Voucher Approval Flow Test Cases (7 cases)

| ID | Loại | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| APR-01 | Happy path | Co 1 voucher `PENDING_APPROVAL`, login bang ADMIN | 1) Goi `GET /api/admin/vouchers/pending` 2) Lay `voucherId` 3) Goi `PATCH /api/admin/vouchers/:id/approve` | Tra `200`, voucher doi status sang `APPROVED`, khong con trong danh sach pending sau khi reload. |
| APR-02 | Happy path | Co 1 voucher `PENDING_APPROVAL`, login bang ADMIN | 1) Goi `PATCH /api/admin/vouchers/:id/reject` voi body `{ "rejection_reason": "Noi dung khong hop le" }` | Tra `200`, voucher status = `REJECTED`, `rejection_reason` duoc luu dung. |
| APR-03 | Edge case | Login bang ADMIN | 1) Goi approve voi `id` khong dung format UUID | Tra `400 Invalid voucher id`. Khong co ban ghi nao bi cap nhat. |
| APR-04 | Edge case | Login bang ADMIN | 1) Goi reject voi `id` khong ton tai trong DB (UUID hop le) | Tra `404 Voucher not found`. |
| APR-05 | Edge case | Login bang ADMIN, voucher da o `APPROVED` hoac `REJECTED` | 1) Goi approve/reject lai cung voucher do | Tra `409 Voucher is not pending approval`. Trang thai voucher khong doi. |
| APR-06 | Edge case | Login bang ADMIN, voucher pending approval | 1) Goi `PATCH /reject` nhung bo trong `rejection_reason` | Tra `400 rejection_reason is required`. |
| APR-07 | Authorization | Login bang CUSTOMER hoac PARTNER, co voucher pending | 1) Goi `GET /api/admin/vouchers/pending` hoac approve/reject | Tra `403 Access denied` (hoac 401 neu khong token). Dam bao chi ADMIN duoc duyet voucher. |

---

## C. Test Data De Xuat

- Admin seed:
  - Email: `admin@vouchersystem.com`
  - Password: `Admin@123`
- Tao them 2 tai khoan test:
  - CUSTOMER: `customer.test@example.com`
  - PARTNER: `partner.test@example.com`
- Tao it nhat 2 voucher test:
  - Voucher A: `PENDING_APPROVAL`
  - Voucher B: `APPROVED`

---

## D. Execution Checklist

- [ ] Chay `docker compose up --build`
- [ ] Xac nhan backend health: `GET /health` tra `status: ok`
- [ ] Chay toan bo 8 case Auth
- [ ] Chay toan bo 7 case Approval
- [ ] Luu ket qua Pass/Fail + bug note (neu co)

Tong so case: **15** (Auth 8 + Approval 7), dat tieu chi Task 2.3.
