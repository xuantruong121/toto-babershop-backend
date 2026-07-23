import { Router } from "express";
import { validatePromoCode } from "../controllers/promoController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/validate", authenticateToken, validatePromoCode);

export default router;
