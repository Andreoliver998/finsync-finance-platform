import { Router } from "express";
import { FinancialSyncController } from "../controllers/FinancialSyncController.js";

export const financialSyncRoutes = Router();

financialSyncRoutes.post("/connections/:connectionId", FinancialSyncController.syncConnection);
financialSyncRoutes.get("/accounts", FinancialSyncController.listAccounts);
financialSyncRoutes.get("/transactions", FinancialSyncController.listTransactions);
financialSyncRoutes.get("/dashboard-summary", FinancialSyncController.dashboardSummary);
