import { createCheckoutSession } from "../controllers/stripe";
import { Router } from "express";
import { requireAuthentication } from "../middleware";
require("dotenv").config();

const router = Router();

router.post('/create-checkout-session', requireAuthentication(), createCheckoutSession);

export default router;