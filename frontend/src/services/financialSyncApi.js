import { api } from "./api.js";

export async function syncConnection(connectionId) {
  const response = await api.post(`/sync/connections/${connectionId}`, undefined, { timeout: 120000 });
  return response.data?.data ?? response.data;
}

export async function getDashboardSummary(params = {}) {
  const response = await api.get("/sync/dashboard-summary", { params });
  return response.data?.data ?? response.data;
}

export async function getAccounts() {
  const response = await api.get("/sync/accounts");
  return response.data?.data ?? response.data;
}

export async function getTransactions(params = {}) {
  const response = await api.get("/sync/transactions", { params });
  return response.data?.data ?? response.data;
}
