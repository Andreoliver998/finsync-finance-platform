import { Router } from "express";
import { OpenFinanceWebhookController } from "../controllers/OpenFinanceWebhookController.js";

export const openFinanceWebhookRoutes = Router();

openFinanceWebhookRoutes.post("/pluggy", OpenFinanceWebhookController.handlePluggyWebhook);
