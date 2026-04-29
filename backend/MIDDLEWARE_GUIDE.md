# 🛠️ Hướng dẫn Middleware Xử lý Lỗi

## Tổng quan

Dự án đã có một hệ thống xử lý lỗi toàn cục và công cụ hỗ trợ như sau:

### 1. **Error Middleware** (`error.middleware.js`)
- Global error handler xử lý tất cả các lỗi từ các route
- Tự động phân loại các loại lỗi (JWT, Database, Validation)
- Phải được đăng ký **cuối cùng** trong app.js (sau tất cả route)

### 2. **Async Handler** (`asyncHandler.js`)
- Wrapper cho async route handlers
- Tự động catch lỗi mà không cần try-catch
- Đơn giản hóa code handlers

### 3. **Validation Middleware** (`validation.middleware.js`)
- Kiểm tra required fields, email format, độ dài string, enum values
- Giúp validate input trước khi xử lý logic chính

### 4. **Auth Middleware** (`auth.middleware.js`)
- Xác thực JWT tokens
- Kiểm tra role quyền hạn

---

## 🎯 Cách sử dụng

### Ví dụ 1: Sử dụng asyncHandler trong route

```javascript
// ❌ TRƯỚC (với try-catch)
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    res.json(result);
  } catch (err) {
    next(err);  // Phải gọi next(err) thủ công
  }
});

// ✅ SAU (với asyncHandler)
import { asyncHandler } from "../middleware/asyncHandler.js";

router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await query("SELECT * FROM users WHERE email = $1", [email]);
  res.json(result);  // Lỗi tự động được catch
}));
```

### Ví dụ 2: Validation middleware

```javascript
import { validateRequired, validateEmail, validateLength } from "../middleware/validation.middleware.js";

router.post(
  "/register",
  validateRequired(["email", "password", "full_name"]),
  validateEmail("email"),
  validateLength("password", 8, 50),
  asyncHandler(register)
);
```

### Ví dụ 3: Xử lý lỗi tùy chỉnh

```javascript
// Tự động xử lý các database error codes:
// - 23505: Duplicate entry → 409 Conflict
// - 23503: Foreign key → 400 Bad Request
// - 22P02: Invalid data type → 400 Bad Request

// JWT errors tự động được catch:
// - JsonWebTokenError → 401 Unauthorized
// - TokenExpiredError → 401 Unauthorized
```

---

## 📋 Checklist cho mỗi route mới

Khi tạo route mới, hãy nhớ:

- [ ] Bao quanh async handler bằng `asyncHandler()`
- [ ] Xóa try-catch khỏi handler (asyncHandler sẽ catch)
- [ ] Thêm validation middleware nếu cần kiểm tra input
- [ ] Gọi `next(err)` nếu vẫn dùng try-catch (tránh dùng)
- [ ] Không throw error trực tiếp, để error handler xử lý

---

## 🚀 Áp dụng cho Phase 2

Hiện tại auth.routes.js đã cập nhật. Khi tạo các route mới ở phase sau (user, voucher, order, etc.), hãy:

1. Nhập `asyncHandler` từ `../middleware/asyncHandler.js`
2. Bao quanh mỗi async handler
3. Xóa try-catch khỏi controller
4. Để error handler toàn cục xử lý

---

## 📊 Error Response Format

Tất cả errors sẽ theo format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Trong development mode, thêm `code` và `stack`:

```json
{
  "error": "Duplicate entry",
  "code": "23505",
  "stack": "..."
}
```

---

## ⚙️ Cấu hình

Chỉnh sửa `error.middleware.js` để:
- Thêm xử lý cho error types mới
- Thay đổi status code hoặc message
- Thêm logging nâng cao
