# VoucherHub — Hệ thống Bán Voucher Giảm Giá

Hệ thống thương mại điện tử cho phép đối tác đăng ký bán voucher giảm giá, khách hàng tìm kiếm và mua voucher, quản trị viên kiểm duyệt toàn bộ hoạt động.

**3 vai trò:** Khách hàng · Đối tác · Quản trị viên

---

## Tech Stack

| Tầng | Công nghệ |
|---|---|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js 20, Express 4, ES Modules |
| Database | PostgreSQL 15 |
| Auth | JWT + bcrypt |
| Triển khai | Docker, Docker Compose |

---

## Khởi Động Nhanh (1 lệnh)

### Yêu cầu
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) đã cài đặt và đang chạy

### Các bước

```bash
# Bước 1 — Tạo file cấu hình
# Windows (PowerShell):
Copy-Item .env.example .env
# macOS / Linux:
cp .env.example .env

# Bước 2 — Khởi động toàn bộ hệ thống
docker compose up -d
```

> Lần đầu chạy mất khoảng 2–3 phút do tải Docker image. Các lần sau chỉ ~15 giây.

### Kiểm tra trạng thái

```bash
docker compose ps
```

Hệ thống sẵn sàng khi tất cả service ở trạng thái `Up`:

```
NAME                STATUS
voucher_db          Up (healthy)
voucher_backend     Up
voucher_frontend    Up
```

### Truy cập ứng dụng

| Thành phần | URL |
|---|---|
| Giao diện web | http://localhost:3000 |
| Backend API | http://localhost:5001/api |
| Health check | http://localhost:5001/health |

---

## Tài Khoản Demo

### Quản trị viên
| Email | Mật khẩu |
|---|---|
| `admin@voucherhub.vn` | `Admin@123` |

### Khách hàng
| Email | Mật khẩu | Ghi chú |
|---|---|---|
| `customer1@example.com` | `Customer@123` | Tài khoản bình thường |
| `customer2@example.com` | `Customer@123` | |
| `customer3@example.com` | `Customer@123` | |
| `customer4@example.com` | `Customer@123` | Tài khoản bị khóa |

### Đối tác
| Email | Mật khẩu | Trạng thái |
|---|---|---|
| `partner.food@example.com` | `Partner@123` | Đã duyệt |
| `partner.beauty@example.com` | `Partner@123` | Đã duyệt |
| `partner.travel@example.com` | `Partner@123` | Chờ duyệt |
| `partner.suspended@example.com` | `Partner@123` | Tạm khóa |

---

## Reset Dữ Liệu

```bash
# Dừng và xóa toàn bộ dữ liệu
docker compose down -v

# Khởi động lại từ đầu (seed dữ liệu mới)
docker compose up -d
```

---

## Cấu Trúc Dự Án

```
voucher-system/
├── backend/
│   └── src/
│       ├── app.js                  # Express app, CORS, middleware
│       ├── index.js                # Entry point
│       ├── config/
│       │   ├── database.js         # PostgreSQL connection pool
│       │   ├── init.sql            # Schema database (tự động chạy khi khởi động)
│       │   └── seed-data.sql       # Dữ liệu demo (tự động chạy khi khởi động)
│       ├── controllers/            # Xử lý logic nghiệp vụ
│       ├── routes/                 # Định nghĩa API endpoints
│       ├── models/                 # SQL queries
│       ├── middleware/             # Auth, validation, error handling
│       └── utils/                  # Tiện ích (VNPay, xử lý lỗi...)
├── frontend/
│   └── src/
│       ├── App.jsx                 # Root router
│       ├── index.css               # Global styles + CSS variables
│       ├── context/                # Auth state, Cart state
│       ├── components/             # Components dùng chung
│       ├── pages/                  # Các trang giao diện
│       └── services/               # Giao tiếp với Backend API
├── docs/                           # Tài liệu nghiệp vụ & SRS
├── docker-compose.yml              # Cấu hình Docker (db + backend + frontend)
├── .env.example                    # Mẫu biến môi trường
└── HUONG_DAN_CHAY_DU_AN.md        # Hướng dẫn chi tiết
```

---

## Quy Tắc Nghiệp Vụ Chính

| Mã | Mô tả |
|---|---|
| RB-01 | Voucher chỉ được bán khi Admin đã phê duyệt |
| RB-02 | Giá bán phải nhỏ hơn giá gốc |
| RB-03/04 | Không bán voucher đã hết hạn hoặc hết hàng |
| RB-05/06 | Voucher code chỉ được sinh sau khi thanh toán thành công |
| RB-07/08 | Code đã dùng, hết hạn, hoặc bị hủy không thể dùng lại |
| RB-09 | Đối tác chỉ quét mã voucher của chính họ |
| RB-10 | Khách hàng chỉ đánh giá voucher đã mua |
| RB-15 | Trừ tồn kho an toàn bằng `SELECT … FOR UPDATE` |
