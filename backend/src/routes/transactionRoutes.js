import { Router } from "express";
import { TransactionController } from "../controllers/TransactionController.js";

export const transactionRoutes = Router();

transactionRoutes.post("/", TransactionController.create);
transactionRoutes.get("/", TransactionController.list);
transactionRoutes.get("/:id", TransactionController.findById);
transactionRoutes.put("/:id", TransactionController.update);
transactionRoutes.delete("/:id", TransactionController.remove);
