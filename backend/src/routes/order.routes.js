import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { createOrder, listMyOrders, payOrder } from "../controllers/order.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

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

export default router;
