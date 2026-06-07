import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  createOrder,
  listMyOrders,
  payOrder,
  createVnpayPaymentUrl,
  verifyVnpayPayment,
  vnpayIPN,
} from "../controllers/order.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

// ── VNPay IPN ─────────────────────────────────────────────────
// ⚠️ Không authenticate — VNPay server gọi trực tiếp, không có JWT
// Phải đặt TRƯỚC route /:id để không bị nhầm là :id = "vnpay-ipn"
router.get(
  "/vnpay-ipn",
  asyncHandler(vnpayIPN)
);

router.post(
  "/",
  authenticate,
  authorize("CUSTOMER"),
  asyncHandler(createOrder)
);
router.get(
  "/my",
  authenticate,
  authorize("CUSTOMER"),
  asyncHandler(listMyOrders)
);
router.post(
  "/:id/pay",
  authenticate,
  authorize("CUSTOMER"),
  asyncHandler(payOrder)
);

// ── VNPay ──────────────────────────────────────────────────────
router.post(
  "/:id/vnpay-url",
  authenticate,
  authorize("CUSTOMER"),
  asyncHandler(createVnpayPaymentUrl)
);
router.post(
  "/:id/vnpay-verify",
  authenticate,
  authorize("CUSTOMER"),
  asyncHandler(verifyVnpayPayment)
);

export default router;
