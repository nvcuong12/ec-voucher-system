# Báo Cáo Triển Khai Hệ Thống VoucherHub

## 1. Tổng Quan

Hệ thống VoucherHub được triển khai theo kiến trúc **3 tầng tách biệt**, sử dụng hoàn toàn các dịch vụ cloud miễn phí (free tier). Mỗi tầng được đặt trên một nền tảng chuyên biệt để đảm bảo tính ổn định và khả năng mở rộng.

| Tầng | Dịch vụ | Công nghệ |
|---|---|---|
| Cơ sở dữ liệu | Supabase | PostgreSQL 15 |
| Backend API | Render.com | Node.js 20 + Express |
| Frontend | Vercel | React 18 (Create React App) |
| Quản lý mã nguồn | GitHub | Git |

---

## 2. Kiến Trúc Triển Khai

```
Người dùng (trình duyệt)
        │
        ▼
┌───────────────────┐
│     Vercel        │  ← Frontend (React SPA)
│  (Static Hosting) │     https://ec-voucher-system-frontend.vercel.app
└────────┬──────────┘
         │ HTTP Requests (HTTPS)
         ▼
┌───────────────────┐
│    Render.com     │  ← Backend API (Node.js/Express)
│  (Web Service)    │     https://ec-voucher-system-backend.onrender.com
└────────┬──────────┘
         │ PostgreSQL Connection (SSL)
         ▼
┌───────────────────┐
│    Supabase       │  ← Cơ sở dữ liệu (PostgreSQL 15)
│  (Managed DB)     │     Khu vực: ap-southeast-1 (Singapore)
└───────────────────┘
```

---

## 3. Chi Tiết Từng Thành Phần

### 3.1 Cơ Sở Dữ Liệu — Supabase

**Nền tảng:** [supabase.com](https://supabase.com)

| Thông số | Giá trị |
|---|---|
| Loại | PostgreSQL 15 (Managed) |
| Khu vực | Northeast Asia — Tokyo (`ap-northeast-1`) |
| Instance type | `t4g.nano` |
| Kết nối | Connection Pooler (cổng 6543) |
| Schema | Khởi tạo từ `backend/src/config/init.sql` |
| Dữ liệu demo | Nạp từ `backend/src/config/seed-data.sql` |

**Các bảng chính được tạo:**

| Bảng | Mô tả |
|---|---|
| `users` | Tài khoản người dùng (3 vai trò: ADMIN, CUSTOMER, PARTNER) |
| `partners` | Hồ sơ đối tác kinh doanh |
| `branches` | Chi nhánh của đối tác |
| `vouchers` | Thông tin voucher |
| `orders` / `order_items` | Đơn hàng và chi tiết đơn |
| `issued_vouchers` | Voucher code đã phát hành cho khách |
| `complaints` | Khiếu nại của khách hàng |
| `reviews` | Đánh giá voucher |
| `system_logs` | Nhật ký hoạt động admin |

---

### 3.2 Backend API — Render.com

**Nền tảng:** [render.com](https://render.com)

| Thông số | Giá trị |
|---|---|
| Loại dịch vụ | Web Service |
| Runtime | Node.js 20 |
| Root Directory | `backend/` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| URL triển khai | https://ec-voucher-system-backend.onrender.com |

**Biến môi trường được cấu hình:**

| Biến | Giá trị |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Connection string từ Supabase |
| `JWT_SECRET` | Chuỗi bí mật (tối thiểu 32 ký tự) |
| `FRONTEND_URL` | `https://ec-voucher-system-frontend.vercel.app` |
| `VNPAY_TMN_CODE` | Mã merchant VNPay sandbox |
| `VNPAY_HASH_SECRET` | Secret key VNPay sandbox |
| `VNPAY_URL` | `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html` |
| `VNPAY_RETURN_URL` | `https://ec-voucher-system-frontend.vercel.app/payment/vnpay-return` |

> **Lưu ý:** Render free tier có cơ chế "spin down" — nếu không có request trong 15 phút, service sẽ tạm ngừng. Request đầu tiên sau đó có thể mất 30–60 giây để khởi động lại.

---

### 3.3 Frontend — Vercel

**Nền tảng:** [vercel.com](https://vercel.com)

| Thông số | Giá trị |
|---|---|
| Loại | Static Site + CDN |
| Framework | Create React App |
| Root Directory | `frontend/` |
| Build Command | `npm run build` (tự động) |
| URL triển khai | https://ec-voucher-system-frontend.vercel.app |

**Biến môi trường được cấu hình:**

| Biến | Giá trị |
|---|---|
| `REACT_APP_API_URL` | `https://ec-voucher-system-backend.onrender.com/api` |

---

## 4. Quy Trình CI/CD

Hệ thống áp dụng quy trình triển khai tự động (auto-deploy) từ GitHub:

```
Developer push code lên GitHub (nhánh main)
        │
        ├──► Render tự động detect thay đổi
        │         └─► Build & Deploy lại Backend (~2 phút)
        │
        └──► Vercel tự động detect thay đổi
                  └─► Build & Deploy lại Frontend (~1 phút)
```

Mỗi lần cập nhật mã nguồn và push lên GitHub, cả hai dịch vụ sẽ tự động build và triển khai phiên bản mới mà không cần thao tác thủ công.

---

## 5. Bảo Mật

| Biện pháp | Mô tả |
|---|---|
| HTTPS | Toàn bộ giao tiếp qua SSL/TLS (do Vercel và Render cung cấp) |
| JWT | Token xác thực người dùng, có thời hạn |
| CORS | Backend chỉ chấp nhận request từ domain Frontend đã đăng ký |
| bcrypt | Mật khẩu được mã hóa một chiều trước khi lưu DB |
| Biến môi trường | Thông tin nhạy cảm (DB URL, secret key) không lưu trong mã nguồn |

---

## 6. Truy Cập Hệ Thống

| Thành phần | URL |
|---|---|
| Website (Frontend) | https://ec-voucher-system-frontend.vercel.app |
| Backend API | https://ec-voucher-system-backend.onrender.com/api |
| Health Check | https://ec-voucher-system-backend.onrender.com/health |

### Tài khoản demo

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Quản trị viên | `admin@voucherhub.vn` | `Admin@123` |
| Khách hàng | `customer1@example.com` | `Customer@123` |
| Đối tác | `partner.food@example.com` | `Partner@123` |
