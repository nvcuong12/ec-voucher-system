/**
 * ─── Async Error Wrapper ───
 * Bao quanh async route handlers để tự động catch lỗi
 * Thay vì phải try-catch trong mỗi handler
 *
 * Cách dùng:
 *   import { asyncHandler } from '../middleware/asyncHandler.js';
 *   router.get('/', asyncHandler(async (req, res, next) => {
 *     const result = await query(...);  // Lỗi sẽ tự động bị catch
 *     res.json(result);
 *   }));
 */

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
