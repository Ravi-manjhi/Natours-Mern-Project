import { Router } from "express";
import { protectMiddleware } from "../controller/authController.js";
import { getCheckoutSession } from "../controller/bookingController.js";

const router = Router();

router.get("/checkout-session/:tourId", protectMiddleware, getCheckoutSession);

export default router;
