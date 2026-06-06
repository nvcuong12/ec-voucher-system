import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createReview, listReviewsByVoucher, replyReview } from "../controllers/review.controller.js";

const router = Router();

// RB-10: only customers who purchased can review
router.post("/", authenticate, authorize("CUSTOMER"), asyncHandler(createReview));
router.get("/voucher/:voucherId", asyncHandler(listReviewsByVoucher));
router.post("/:id/reply", authenticate, authorize("PARTNER"), asyncHandler(replyReview));

export default router;
