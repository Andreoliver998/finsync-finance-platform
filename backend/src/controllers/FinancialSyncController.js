import { FinancialSyncService } from "../services/FinancialSyncService.js";

export class FinancialSyncController {
  static async syncConnection(req, res, next) {
    try {
      const result = await FinancialSyncService.syncConnection({
        userId: req.user.id,
        connectionId: req.params.connectionId
      });

      res.json({
        success: true,
        message: "Sincronização concluída com sucesso.",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async listAccounts(req, res, next) {
    try {
      const accounts = await FinancialSyncService.listAccounts(req.user.id);
      res.json({ success: true, data: accounts });
    } catch (error) {
      next(error);
    }
  }

  static async listTransactions(req, res, next) {
    try {
      const transactions = await FinancialSyncService.listTransactions(req.user.id, req.query);
      res.json({ success: true, data: transactions });
    } catch (error) {
      next(error);
    }
  }

  static async dashboardSummary(req, res, next) {
    try {
      const summary = await FinancialSyncService.dashboardSummary(req.user.id, req.query);
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }
}
