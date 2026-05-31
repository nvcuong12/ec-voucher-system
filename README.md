# 🎟️ VoucherHub – Hệ thống Bán Voucher Giảm Giá

Hệ thống thương mại điện tử bán voucher giảm giá với 3 vai trò: **Khách hàng**, **Đối tác**, **Quản trị viên**.

## Tech Stack

| Layer     | Technology            |
|-----------|-----------------------|
| Frontend  | React 18, React Router v6, Axios |
| Backend   | Node.js 20, Express 4, ES Modules |
| Database  | PostgreSQL 15         |
| DevOps    | Docker, DevContainer  |
| Auth      | JWT + bcrypt          |

---

## 🚀 Chạy dự án (1 lệnh)

### Yêu cầu
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) đã cài đặt và đang chạy

### Khởi động

```bash
# 1. Clone repo
git clone <repo-url>
cd voucher-system

# 2. Tạo file .env từ mẫu
cp .env.example .env

# 3. Khởi động toàn bộ hệ thống
docker compose up --build
```

Sau khi khởi động:

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000      |
| Backend  | http://localhost:5001      |
| API Docs | http://localhost:5001/api  |
| Health   | http://localhost:5001/health |

### Tài khoản mặc định (seed)

| Role  | Email                      | Password   |
|-------|----------------------------|------------|
| Admin | admin@vouchersystem.com    | Admin@123  |

### Ghi chú khách hàng
- Đăng nhập bằng email hoặc số điện thoại
- Tìm kiếm voucher theo từ khóa, khoảng giá, mức giảm, khu vực, trạng thái

### Lưu ý khi cập nhật dependencies
Nếu có thay đổi trong `frontend/package.json` (ví dụ thêm `react-icons`), cần rebuild hoặc cài lại trong container:

```bash
# Cách 1: rebuild toàn bộ
docker compose up --build

# Cách 2: chỉ cài lại dependencies frontend
docker compose exec frontend npm install
```

### Seed dữ liệu mẫu
Nếu DB đã tồn tại trước đó, script seed sẽ không tự chạy lại. Bạn có thể seed thủ công:

```bash
docker exec -i voucher_db psql -U voucheruser -d voucherdb < backend/src/config/init.sql
```

---

## 📁 Cấu trúc dự án

```
voucher-system/
├── .devcontainer/
│   ├── devcontainer.json       # VS Code DevContainer config
│   ├── Dockerfile              # Backend dev image
│   └── Dockerfile.frontend     # Frontend dev image
├── backend/
│   ├── src/
│   │   ├── index.js            # Entry point
│   │   ├── app.js              # Express app
│   │   ├── config/
│   │   │   ├── database.js     # PostgreSQL pool + helpers
│   │   │   └── init.sql        # Schema + seed (auto-run by Docker)
│   │   ├── middleware/
│   │   │   └── auth.middleware.js  # JWT verify + role guard
│   │   ├── routes/             # Route definitions (per resource)
│   │   ├── controllers/        # Business logic handlers
│   │   ├── models/             # DB query helpers (Phase 2+)
│   │   └── utils/              # Shared utilities
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.jsx             # Root router
│       ├── index.js            # ReactDOM entry
│       ├── index.css           # Global styles + CSS vars
│       ├── context/
│       │   ├── AuthContext.jsx # JWT auth state
│       │   └── CartContext.jsx # Shopping cart state
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── ProtectedRoute.jsx
│       ├── pages/              # Route-level page components
│       └── services/
│           └── api.js          # Axios instance
├── docker-compose.yml
├── .env.example
└── package.json                # Root scripts
```

---

## 🗺️ Development Roadmap

| Phase | Nội dung | Trạng thái |
|-------|----------|------------|
| **1** | DevContainer + Project scaffold (React + Node) | ✅ Hoàn thành |
| **2** | DB Schema (PostgreSQL, tất cả entities) | ✅ Hoàn thành (`init.sql`) |
| **3** | Auth API + JWT middleware | 🔄 Cơ bản xong, cần test |
| **4** | CRUD Partner & Admin (tạo/duyệt voucher) | ✅ Cơ bản xong |
| **5** | Customer flow (tìm kiếm, giỏ hàng, checkout mock) | 🔄 Cơ bản xong |
| **6** | Voucher Code + QR + quét mã + trừ tồn kho an toàn | 🔄 Cơ bản xong |
| **7** | Dashboard báo cáo + hoàn thiện UI | 🔄 Cơ bản xong |

---

## 🔑 Business Rules (tóm tắt)

- **RB-01** Voucher chỉ bán khi Admin đã duyệt
- **RB-02** Giá bán < Giá gốc (enforced cả DB constraint lẫn API)
- **RB-03/04** Không bán khi hết hạn hoặc hết hàng
- **RB-05/06** Voucher Code chỉ sinh **sau** khi thanh toán thành công
- **RB-07/08** Code đã dùng / hết hạn / bị hủy → không thể dùng lại
- **RB-09** Partner chỉ quét mã voucher của chính họ
- **RB-10** Khách chỉ review voucher đã mua
- **RB-15** Lock DB row khi trừ tồn kho (`SELECT … FOR UPDATE`)
