import express from "express";
import { registerUser, sendMailService } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/send-confirmation-email", sendMailService);


export default router;
