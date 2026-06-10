# Hướng Dẫn Cài Đặt & Chạy Dự Án — VoucherHub

## Yêu Cầu Môi Trường

| Công cụ | Phiên bản tối thiểu | Ghi chú |
|---|---|---|
| **Docker Desktop** | 24.x trở lên | Bắt buộc |
| **Docker Compose** | v2.x (tích hợp sẵn trong Docker Desktop) | Bắt buộc |
| Git | Bất kỳ | Để clone code |

> Không cần cài Node.js, npm hay PostgreSQL — tất cả chạy trong Docker.

---

## Bước 1 — Lấy Mã Nguồn

Giải nén file nộp (hoặc clone từ repository nếu có):

```
voucher-system/
├── backend/          ← API Node.js/Express
├── frontend/         ← Giao diện React
├── docs/             ← Tài liệu nghiệp vụ
├── docker-compose.yml
├── .env.example
└── ...
```

---

## Bước 2 — Tạo File Cấu Hình `.env`

Sao chép file mẫu và đặt tên lại:

```bash
# Windows (Command Prompt)
copy .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

File `.env` mặc định đã được cấu hình sẵn cho môi trường local, **không cần chỉnh sửa gì thêm** để chạy demo.

---

## Bước 3 — Khởi Động Hệ Thống

```bash
docker compose up -d
```

Lệnh này sẽ tự động:
1. Tải các image cần thiết (Node.js 20, PostgreSQL 15)
2. Khởi tạo database + tạo toàn bộ bảng (`init.sql`)
3. Nạp dữ liệu demo (`seed-data.sql`)
4. Khởi động Backend API (cổng 5000)
5. Khởi động Frontend (cổng 3000)

> **Lần đầu chạy** mất khoảng 2–3 phút do cần tải image. Các lần sau chỉ mất ~15 giây.

### Kiểm tra trạng thái:

```bash
docker compose ps
```

Kết quả bình thường:

```
NAME                STATUS
voucher_db          Up (healthy)
voucher_backend     Up
voucher_frontend    Up
```

---

## Bước 4 — Truy Cập Ứng Dụng

| Thành phần | URL |
|---|---|
| **Giao diện web** | http://localhost:3000 |
| **API Backend** | http://localhost:5000/api |

---

## Tài Khoản Demo

### Admin
| Email | Mật khẩu |
|---|---|
| `admin@voucherhub.vn` | `Admin@123` |

### Khách hàng
| Email | Mật khẩu | Ghi chú |
|---|---|---|
| `customer1@example.com` | `Customer@123` | Tài khoản hoạt động bình thường |
| `customer2@example.com` | `Customer@123` | |
| `customer3@example.com` | `Customer@123` | |
| `customer4@example.com` | `Customer@123` | Tài khoản bị khóa (demo) |

### Đối tác (Partner)
| Email | Mật khẩu | Trạng thái |
|---|---|---|
| `partner.food@example.com` | `Partner@123` | Đã duyệt — Highlands Coffee |
| `partner.beauty@example.com` | `Partner@123` | Đã duyệt — Saigon Beauty |
| `partner.travel@example.com` | `Partner@123` | Chờ duyệt (demo duyệt partner) |
| `partner.suspended@example.com` | `Partner@123` | Tạm khóa (demo mở khóa) |

---

## Dừng & Xóa Dữ Liệu

```bash
# Dừng hệ thống, giữ nguyên dữ liệu
docker compose down

# Dừng hệ thống và XÓA toàn bộ dữ liệu (reset về ban đầu)
docker compose down -v
```

> Sau khi `down -v`, chạy lại `docker compose up -d` sẽ khởi tạo lại dữ liệu demo từ đầu với ngày tháng hiện tại.

---

## Xem Log Nếu Gặp Lỗi

```bash
# Xem log backend
docker compose logs backend

# Xem log database
docker compose logs db

# Xem log realtime
docker compose logs -f
```

---

## Cấu Trúc Mã Nguồn

```
voucher-system/
├── backend/
│   └── src/
│       ├── controllers/    ← Xử lý logic nghiệp vụ
│       ├── routes/         ← Định nghĩa API endpoints
│       ├── models/         ← SQL queries
│       ├── middleware/     ← Auth, validation, error handling
│       ├── utils/          ← Tiện ích (VNPay, bcrypt...)
│       └── config/
│           ├── init.sql        ← Schema database
│           └── seed-data.sql   ← Dữ liệu demo
├── frontend/
│   └── src/
│       ├── pages/          ← Các trang giao diện
│       ├── components/     ← Components dùng chung
│       ├── services/       ← Gọi API
│       └── context/        ← State management (Auth, Cart)
├── docs/                   ← Tài liệu nghiệp vụ & SRS
├── docker-compose.yml      ← Cấu hình Docker
└── .env.example            ← Mẫu biến môi trường
```

---

## Công Nghệ Sử Dụng

| Tầng | Công nghệ |
|---|---|
| Frontend | React 18, React Router, Axios |
| Backend | Node.js 20, Express.js, JWT |
| Database | PostgreSQL 15 |
| Triển khai | Docker, Docker Compose |
| Thanh toán | VNPay (sandbox) |
