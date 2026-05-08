import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/httpError.js";
import { FinancialSyncService } from "./FinancialSyncService.js";

function parseNullableDate(value) {
  if (!value) {
    return null;
  }

  return new Date(value);
}

function toGoalPayload(data) {
  return {
    ...data,
    deadline: data.deadline === undefined ? undefined : parseNullableDate(data.deadline)
  };
}

function isDebitTransaction(transaction) {
  return transaction.amount < 0 || transaction.type === "DEBIT" || transaction.type === "EXPENSE";
}

function sum(items, selector) {
  return items.reduce((total, item) => total + selector(item), 0);
}

export class BetaModuleService {
  static async getSettings(userId) {
    return prisma.appSettings.upsert({
      where: { userId },
      create: { userId },
      update: {}
    });
  }

  static async updateSettings(userId, data) {
    return prisma.appSettings.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data
    });
  }

  static listGoals(userId) {
    return prisma.financialGoal.findMany({
      where: { userId },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }]
    });
  }

  static createGoal(userId, data) {
    return prisma.financialGoal.create({
      data: { userId, ...toGoalPayload(data) }
    });
  }

  static async updateGoal(userId, id, data) {
    const goal = await prisma.financialGoal.findFirst({ where: { id, userId } });
    if (!goal) throw new HttpError(404, "Meta financeira não encontrada.");

    return prisma.financialGoal.update({
      where: { id },
      data: toGoalPayload(data)
    });
  }

  static async removeGoal(userId, id) {
    const goal = await prisma.financialGoal.findFirst({ where: { id, userId } });
    if (!goal) throw new HttpError(404, "Meta financeira não encontrada.");

    return prisma.financialGoal.delete({ where: { id } });
  }

  static listAlerts(userId) {
    return prisma.alertRule.findMany({
      where: { userId },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }]
    });
  }

  static createAlert(userId, data) {
    return prisma.alertRule.create({ data: { userId, ...data } });
  }

  static async updateAlert(userId, id, data) {
    const alert = await prisma.alertRule.findFirst({ where: { id, userId } });
    if (!alert) throw new HttpError(404, "Alerta financeiro não encontrado.");

    return prisma.alertRule.update({ where: { id }, data });
  }

  static async removeAlert(userId, id) {
    const alert = await prisma.alertRule.findFirst({ where: { id, userId } });
    if (!alert) throw new HttpError(404, "Alerta financeiro não encontrado.");

    return prisma.alertRule.delete({ where: { id } });
  }

  static listInvestments(userId) {
    return prisma.investmentPosition.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" }
    });
  }

  static createInvestment(userId, data) {
    return prisma.investmentPosition.create({ data: { userId, ...data } });
  }

  static async updateInvestment(userId, id, data) {
    const position = await prisma.investmentPosition.findFirst({ where: { id, userId } });
    if (!position) throw new HttpError(404, "Investimento não encontrado.");

    return prisma.investmentPosition.update({ where: { id }, data });
  }

  static async removeInvestment(userId, id) {
    const position = await prisma.investmentPosition.findFirst({ where: { id, userId } });
    if (!position) throw new HttpError(404, "Investimento não encontrado.");

    return prisma.investmentPosition.delete({ where: { id } });
  }

  static async reports(userId, query = {}) {
    const summary = await FinancialSyncService.dashboardSummary(userId, query);
    const savingsRate = summary.monthIncome > 0
      ? ((summary.monthIncome - summary.monthExpenses) / summary.monthIncome) * 100
      : 0;

    return {
      ...summary,
      savingsRate,
      netCashFlow: summary.monthIncome - summary.monthExpenses,
      topCategories: [...summary.expensesByCategory]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)
    };
  }

  static async financialAi(userId, query = {}) {
    const report = await this.reports(userId, query);
    const latestExpenses = report.latestTransactions.filter(isDebitTransaction);
    const averageTicket = latestExpenses.length
      ? sum(latestExpenses, (item) => Math.abs(item.amount)) / latestExpenses.length
      : 0;
    const mainCategory = report.topCategories[0]?.category || null;
    const insights = [];

    if (report.monthExpenses > report.monthIncome && report.monthIncome > 0) {
      insights.push({
        level: "warning",
        title: "Gastos acima da receita",
        message: "As despesas do período superam a receita. Priorize revisão de recorrências e categorias variáveis."
      });
    }

    if (report.savingsRate >= 20) {
      insights.push({
        level: "success",
        title: "Boa taxa de poupança",
        message: "A taxa de poupança está saudável para um perfil financeiro em crescimento."
      });
    }

    if (mainCategory) {
      insights.push({
        level: "info",
        title: `Categoria dominante: ${mainCategory}`,
        message: "Essa categoria concentra a maior parte dos gastos. Use metas e alertas para acompanhar o limite."
      });
    }

    if (!insights.length) {
      insights.push({
        level: "info",
        title: "Base de análise em formação",
        message: "Conecte bancos ou registre lançamentos para liberar recomendações mais precisas."
      });
    }

    return {
      healthScore: Math.max(0, Math.min(100, Math.round(55 + report.savingsRate - (report.monthExpenses > report.monthIncome ? 20 : 0)))),
      averageTicket,
      insights,
      generatedAt: new Date()
    };
  }
}
