import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ManualTransactions from "./pages/ManualTransactions.jsx";
import OpenFinancePage from "./pages/OpenFinancePage.jsx";
import TransactionsPage from "./pages/TransactionsPage.jsx";
import {
  AlertsPage,
  CardsPage,
  FinancialAiPage,
  GoalsPage,
  InvestmentsPage,
  ReportsPage,
  SettingsPage
} from "./pages/BetaModulePages.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login"                  element={<LoginPage />} />
        <Route path="/dashboard"              element={<DashboardPage />} />
        <Route path="/open-finance/connect"   element={<OpenFinancePage />} />
        <Route path="/manual-transactions"    element={<ManualTransactions />} />
        <Route path="/transactions"           element={<TransactionsPage />} />
        <Route path="/settings"               element={<SettingsPage />} />
        <Route path="/reports"                element={<ReportsPage />} />
        <Route path="/goals"                  element={<GoalsPage />} />
        <Route path="/cards"                  element={<CardsPage />} />
        <Route path="/alerts"                 element={<AlertsPage />} />
        <Route path="/financial-ai"           element={<FinancialAiPage />} />
        <Route path="/investments"            element={<InvestmentsPage />} />
        <Route path="*"                       element={<Navigate to="/open-finance/connect" replace />} />
      </Routes>
    </AuthProvider>
  );
}
