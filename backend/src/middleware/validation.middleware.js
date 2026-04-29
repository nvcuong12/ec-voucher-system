/**
 * ─── Validation Middleware ───
 * Kiểm tra dữ liệu input từ request
 * Ngăn ngừa các lỗi validation phổ biến
 */

export class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.status = 400;
    this.field = field;
  }
}

/**
 * Kiểm tra required fields
 * Usage:
 *   router.post('/', validateRequired(['email', 'password']), handler)
 */
export const validateRequired = (fields) => (req, res, next) => {
  const missing = fields.filter((f) => !req.body[f]);
  if (missing.length) {
    return res.status(400).json({
      error: `Missing required fields: ${missing.join(", ")}`,
    });
  }
  next();
};

/**
 * Kiểm tra định dạng email
 * Usage:
 *   router.post('/', validateEmail('email'), handler)
 */
export const validateEmail = (field = "email") => (req, res, next) => {
  const email = req.body[field];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email && !emailRegex.test(email)) {
    return res.status(400).json({
      error: `Invalid ${field} format`,
    });
  }
  next();
};

/**
 * Kiểm tra độ dài string
 * Usage:
 *   router.post('/', validateLength('password', 8, 50), handler)
 */
export const validateLength = (field, min, max) => (req, res, next) => {
  const value = req.body[field];
  if (!value) return next();

  if (value.length < min || value.length > max) {
    return res.status(400).json({
      error: `${field} must be between ${min} and ${max} characters`,
    });
  }
  next();
};

/**
 * Kiểm tra giá trị nằm trong enum
 * Usage:
 *   router.post('/', validateEnum('role', ['CUSTOMER', 'PARTNER']), handler)
 */
export const validateEnum = (field, allowedValues) => (req, res, next) => {
  const value = req.body[field];
  if (value && !allowedValues.includes(value)) {
    return res.status(400).json({
      error: `${field} must be one of: ${allowedValues.join(", ")}`,
    });
  }
  next();
};
