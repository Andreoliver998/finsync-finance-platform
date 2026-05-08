import { useEffect, useState } from "react";
import FinancialDashboard from "../components/FinancialDashboard.jsx";
import AppLayout from "../layouts/AppLayout.jsx";
import { getAccounts, getDashboardSummary } from "../services/financialSyncApi.js";

const now = new Date();
const DEFAULT_FILTERS = {
  month: String(now.getMonth() + 1),
  year: String(now.getFullYear()),
  source: "ALL",
  category: "",
  paymentMethod: ""
};

function cleanFilters(filters) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ""));
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setLoading(true);
      setError("");

      try {
        const [summaryData, accountsData] = await Promise.all([
          getDashboardSummary(cleanFilters(filters)),
          getAccounts()
        ]);

        if (!isMounted) {
          return;
        }

        setSummary(summaryData);
        setAccounts(Array.isArray(accountsData) ? accountsData : []);
      } catch {
        if (!isMounted) {
          return;
        }

        setSummary(null);
        setAccounts([]);
        setError("Não foi possível carregar os dados reais do banco.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  return (
    <AppLayout breadcrumb="Dashboard">
      <FinancialDashboard
        summary={summary}
        accounts={accounts}
        filters={filters}
        loading={loading}
        error={error}
        onFiltersChange={setFilters}
        onFiltersClear={() => setFilters(DEFAULT_FILTERS)}
      />
    </AppLayout>
  );
}
