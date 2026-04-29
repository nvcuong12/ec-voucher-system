/**
 * ─── Global Error Handler Middleware ───
 * Xử lý tất cả lỗi từ toàn bộ ứng dụng
 * Phải được đăng ký CUỐI cùng trong app.js
 */

export const errorHandler = (err, _req, res, _next) => {
  // Log lỗi cho debugging
  console.error("❌ Error:", {
    name: err.name,
    message: err.message,
    status: err.status || 500,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });

  // Mặc định
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";

  // ─── Xử lý các loại lỗi cụ thể ───

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token expired";
  }

  // Database errors
  if (err.code === "23505") {
    // Unique constraint violation
    status = 409;
    message = "Duplicate entry";
  }

  if (err.code === "23503") {
    // Foreign key constraint violation
    status = 400;
    message = "Invalid reference";
  }

  if (err.code === "22P02") {
    // Invalid data type
    status = 400;
    message = "Invalid data format";
  }

  // Validation errors
  if (err.name === "ValidationError") {
    status = 400;
    message = err.message;
  }

  // Respond with error
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && {
      code: err.code,
      stack: err.stack,
    }),
  });
};

/**
 * ─── 404 Handler ───
 * Xử lý các route không tồn tại
 * Phải được đăng ký TRƯỚC error handler
 */
export const notFoundHandler = (_req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
};
