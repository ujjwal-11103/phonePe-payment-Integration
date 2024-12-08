import express from "express";
import { getOrderStatus } from "../controllers/statusController.js";

const router = express.Router();

router.post("/", getOrderStatus);

export default router;
