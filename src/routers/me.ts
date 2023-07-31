import { getMe, updateMe, deleteMe } from "../controllers/me";
import { Router } from "express";
import { requireAuthentication } from "../middleware";

const router = Router();

router.get('/me', requireAuthentication(), getMe);
router.patch('/me', requireAuthentication(), updateMe);
router.delete('/me', requireAuthentication(), deleteMe);

export default router;