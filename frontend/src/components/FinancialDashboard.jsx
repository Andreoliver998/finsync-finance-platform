import { ArrowDownLeft, ArrowUpRight, BarChart3, Building2, CreditCard, Link2, ReceiptText, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const EMPTY_STATS = [
  {
    label:   "Saldo Total",
    value:   "—",
    change:  null,
    accent:  "linear-gradient(90deg, #7c3aed, transparent)",
    icon:    TrendingUp,
    note:    "Conecte um banco para ver",
  },
  {
    label:   "Gastos do Mês",
    value:   "—",
    change:  null,
    accent:  "linear-gradient(90deg, #06b6d4, transparent)",
    icon:    CreditCard,
    note:    "Aguardando dados",
  },
  {
    label:   "Contas Conectadas",
    value:   "0",
    change:  null,
    accent:  "linear-gradient(90deg, #67e8f9, transparent)",
    icon:    Building2,
    note:    "Adicione no Open Finance",
  },
  {
    label:   "Transações Pendentes",
    value:   "—",
    change:  null,
    accent:  "linear-gradient(90deg, #ec4899, transparent)",
    icon:    ArrowDownLeft,
    note:    "Sem dados ainda",
  },
];

const SOURCE_OPTIONS = [
  { value: "ALL", label: "Todos" },
  { value: "MANUAL", label: "Manual" },
  { value: "OPEN_FINANCE", label: "Open Finance" }
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "", label: "Todas" },
  { value: "CREDIT", label: "Crédito" },
  { value: "DEBIT", label: "Débito" },
  { value: "PIX", label: "PIX" },
  { value: "CASH", label: "Dinheiro" },
  { value: "BOLETO", label: "Boleto" },
  { value: "SAVINGS", label: "Poupança" },
  { value: "TRANSFER", label: "Transferência" },
  { value: "OTHER", label: "Outro" }
];

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number(value || 0));
}

function formatDate(value) {
  return value ? new Intl.DateTimeFormat("pt-BR").format(new Date(value)) : "-";
}

function StatCard({ stat, loading }) {
  const Icon = stat.icon;
  return (
    <div className="stat-card">
      <div className="stat-accent" style={{ background: stat.accent }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: ".75rem",
        }}
      >
        <div className="stat-label">{stat.label}</div>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: "var(--s3)",
            border: "1px solid var(--border-b2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--muted-2)",
          }}
        >
          <Icon size={13} />
        </div>
      </div>
      <div className="stat-value">{loading ? "..." : stat.value}</div>
      {stat.change !== null ? (
        <div className={`stat-change ${stat.change >= 0 ? "up" : "down"}`}>
          {stat.change >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownLeft size={11} />}
          {Math.abs(stat.change)}% vs. mês anterior
        </div>
      ) : (
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: ".6rem",
            color: "var(--dim)",
            marginTop: ".2rem",
          }}
        >
          {stat.note}
        </div>
      )}
    </div>
  );
}

function AccountsOverview({ accounts = [], loading }) {
  return (
    <div>
      <div className="dash-section-title">
        <Building2 size={15} style={{ color: "var(--muted-2)" }} />
        <span>Contas bancárias reais</span>
      </div>
      <div className="card" style={{ padding: "1rem", minHeight: 220 }}>
        {loading ? (
          <div className="chart-placeholder">
            <Building2 size={32} />
            <span>Carregando contas bancárias...</span>
          </div>
        ) : accounts.length === 0 ? (
          <div className="chart-placeholder">
            <Building2 size={32} />
            <span>Nenhuma conta sincronizada ainda</span>
          </div>
        ) : (
          <div style={{ display: "grid", gap: ".75rem" }}>
            {accounts.slice(0, 6).map((account) => (
              <div
                key={account.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: ".75rem",
                  alignItems: "center",
                  paddingBottom: ".75rem",
                  borderBottom: "1px solid var(--border-b2)"
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: ".85rem" }}>
                    {account.marketingName || account.name || "Conta bancária"}
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: ".72rem", marginTop: ".2rem" }}>
                    {account.connection?.institution || "Instituição não informada"}
                    {account.type ? ` · ${account.type}` : ""}
                  </div>
                </div>
                <div style={{ fontWeight: 900, fontFamily: "var(--mono)", fontSize: ".82rem" }}>
                  {formatCurrency(account.balance)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LatestTransactions({ items = [], loading }) {
  return (
    <div>
      <div className="dash-section-title">
        <ReceiptText size={15} style={{ color: "var(--muted-2)" }} />
        <span>Últimas transações reais</span>
      </div>
      <div className="card" style={{ padding: "1rem", minHeight: 220 }}>
        {loading ? (
          <div className="chart-placeholder">
            <ReceiptText size={32} />
            <span>Carregando transações...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="chart-placeholder">
            <ReceiptText size={32} />
            <span>Nenhuma transação sincronizada ainda</span>
          </div>
        ) : (
          <div style={{ display: "grid", gap: ".75rem" }}>
            {items.slice(0, 8).map((transaction) => {
              const isExpense = transaction.amount < 0 || transaction.type === "DEBIT";

              return (
                <div
                  key={transaction.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: ".75rem",
                    alignItems: "center",
                    paddingBottom: ".75rem",
                    borderBottom: "1px solid var(--border-b2)"
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: ".82rem" }}>
                      {transaction.description || "Transação bancária"}
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: ".7rem", marginTop: ".2rem" }}>
                      {formatDate(transaction.date)} · {transaction.connection?.institution || transaction.bankAccount?.marketingName || "-"}
                    </div>
                  </div>
                  <div
                    style={{
                      color: isExpense ? "#06b6d4" : "#a78bfa",
                      fontWeight: 900,
                      fontFamily: "var(--mono)",
                      fontSize: ".78rem"
                    }}
                  >
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentMethodsChart({ items = [] }) {
  const max = Math.max(...items.map((item) => item.amount), 1);

  return (
    <div>
      <div className="dash-section-title">
        <CreditCard size={15} style={{ color: "var(--muted-2)" }} />
        <span>Formas de pagamento</span>
      </div>
      <div className="card" style={{ padding: "1rem", minHeight: 220 }}>
        {items.length === 0 ? (
          <div className="chart-placeholder">
            <CreditCard size={32} />
            <span>Sem formas de pagamento no filtro atual</span>
          </div>
        ) : (
          <div style={{ display: "grid", gap: ".75rem" }}>
            {items.slice(0, 8).map((item) => (
              <div key={item.paymentMethod}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".75rem", marginBottom: ".3rem" }}>
                  <span>{item.paymentMethod}</span>
                  <span>{formatCurrency(item.amount)}</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "var(--s3)", overflow: "hidden" }}>
                  <div style={{ width: `${Math.max((item.amount / max) * 100, 4)}%`, height: "100%", background: "#a78bfa" }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardFilters({ filters, onChange, onClear }) {
  function updateFilter(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <div className="dashboard-filters card">
      <div className="input-group">
        <label className="input-label">Mês</label>
        <input className="input" type="number" min="1" max="12" value={filters.month} onChange={(event) => updateFilter("month", event.target.value)} />
      </div>
      <div className="input-group">
        <label className="input-label">Ano</label>
        <input className="input" type="number" min="2000" value={filters.year} onChange={(event) => updateFilter("year", event.target.value)} />
      </div>
      <div className="input-group">
        <label className="input-label">Origem</label>
        <select className="input" value={filters.source} onChange={(event) => updateFilter("source", event.target.value)}>
          {SOURCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <div className="input-group">
        <label className="input-label">Categoria</label>
        <input className="input" placeholder="Todas" value={filters.category} onChange={(event) => updateFilter("category", event.target.value)} />
      </div>
      <div className="input-group">
        <label className="input-label">Forma</label>
        <select className="input" value={filters.paymentMethod} onChange={(event) => updateFilter("paymentMethod", event.target.value)}>
          {PAYMENT_METHOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <button className="btn btn-ghost btn-sm" type="button" onClick={onClear}>Limpar</button>
    </div>
  );
}

function CategoryChart({ items = [] }) {
  const max = Math.max(...items.map((item) => item.amount), 1);
  return (
    <div>
      <div className="dash-section-title">
        <BarChart3 size={15} style={{ color: "var(--muted-2)" }} />
        <span>Gastos por Categoria</span>
      </div>
      <div className="card" style={{ padding: "1rem", minHeight: 220 }}>
        {items.length === 0 ? (
          <div className="chart-placeholder">
            <BarChart3 size={32} />
            <span>Sem gastos categorizados ainda</span>
          </div>
        ) : (
          <div style={{ display: "grid", gap: ".75rem" }}>
            {items.slice(0, 8).map((item) => (
              <div key={item.category}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".75rem", marginBottom: ".3rem" }}>
                  <span>{item.category}</span>
                  <span>{formatCurrency(item.amount)}</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "var(--s3)", overflow: "hidden" }}>
                  <div style={{ width: `${Math.max((item.amount / max) * 100, 4)}%`, height: "100%", background: "#06b6d4" }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MonthlyFlowChart({ items = [] }) {
  const max = Math.max(...items.map((item) => Math.max(item.income, item.expenses)), 1);

  return (
    <div>
      <div className="dash-section-title">
        <BarChart3 size={15} style={{ color: "var(--muted-2)" }} />
        <span>Fluxo Mensal</span>
      </div>
      <div className="card" style={{ padding: "1rem", minHeight: 220 }}>
        {items.length === 0 ? (
          <div className="chart-placeholder">
            <BarChart3 size={32} />
            <span>Sem fluxo mensal importado ainda</span>
          </div>
        ) : (
          <div style={{ display: "grid", gap: ".85rem" }}>
            {items.slice(-6).map((item) => (
              <div key={item.month}>
                <div style={{ fontFamily: "var(--mono)", fontSize: ".7rem", color: "var(--muted)", marginBottom: ".35rem" }}>
                  {item.month}
                </div>
                <div style={{ display: "grid", gap: ".3rem" }}>
                  <div style={{ height: 7, borderRadius: 999, background: "var(--s3)", overflow: "hidden" }}>
                    <div style={{ width: `${Math.max((item.income / max) * 100, item.income ? 4 : 0)}%`, height: "100%", background: "#7c3aed" }} />
                  </div>
                  <div style={{ height: 7, borderRadius: 999, background: "var(--s3)", overflow: "hidden" }}>
                    <div style={{ width: `${Math.max((item.expenses / max) * 100, item.expenses ? 4 : 0)}%`, height: "100%", background: "#06b6d4" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function FinancialDashboard({
  summary,
  accounts = [],
  filters,
  loading = false,
  error = "",
  onFiltersChange,
  onFiltersClear
}) {
  const connectionCount = summary?.connectedAccounts ?? 0;
  const stats = [
    {
      ...EMPTY_STATS[0],
      value: formatCurrency(summary?.totalBalance),
      label: "Saldo Total Estimado",
      note: "Saldo Open Finance + saldo manual"
    },
    {
      label: "Receitas do Mês",
      value: formatCurrency(summary?.monthIncome),
      change: null,
      accent: "linear-gradient(90deg, #10b981, transparent)",
      icon: ArrowUpRight,
      note: "Receitas filtradas no período"
    },
    {
      ...EMPTY_STATS[1],
      value: formatCurrency(summary?.monthExpenses),
      note: "Despesas importadas no mês atual"
    },
    {
      ...EMPTY_STATS[2],
      value: String(summary?.connectedAccounts ?? 0),
      note: "Contas bancárias importadas"
    },
    {
      label: "Lançamentos Manuais",
      value: String(summary?.manualTransactionsCount ?? 0),
      change: null,
      accent: "linear-gradient(90deg, #ec4899, transparent)",
      icon: ReceiptText,
      note: "Registros feitos pelo usuário"
    },
    {
      label: "Transações Importadas",
      value: String(summary?.importedTransactionsCount ?? 0),
      change: null,
      accent: "linear-gradient(90deg, #06b6d4, transparent)",
      icon: ReceiptText,
      note: "Histórico Open Finance"
    }
  ];

  return (
    <div className="anim-fade-in">
      {/* Page title */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="dash-page-title">Visão Financeira</h1>
        <p className="dash-page-sub">
          Dados reais sincronizados do banco e persistidos no banco de dados da plataforma.
        </p>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>{error}</div>}

      {filters && onFiltersChange && (
        <DashboardFilters filters={filters} onChange={onFiltersChange} onClear={onFiltersClear} />
      )}

      {/* Stats row */}
      <div className="stats-grid stagger">
        {stats.map((s) => (
          <StatCard key={s.label} stat={s} loading={loading} />
        ))}
      </div>

      {/* CTA if no connections */}
      {connectionCount === 0 && (
        <div
          className="card"
          style={{
            padding: "1.5rem",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "1.25rem",
            flexWrap: "wrap",
            background: "var(--s2)",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "var(--green-10)",
              border: "1px solid var(--green-20)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--green)",
              flexShrink: 0,
            }}
          >
            <Link2 size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 700, fontSize: ".95rem", marginBottom: ".3rem" }}>
              Nenhum banco conectado
            </div>
            <div style={{ fontSize: ".82rem", color: "var(--muted)", lineHeight: 1.6 }}>
              Conecte sua conta bancária pelo Open Finance para começar a acompanhar suas finanças
              automaticamente.
            </div>
          </div>
          <a
            href="/open-finance/connect"
            className="btn btn-primary btn-sm"
            style={{ flexShrink: 0 }}
          >
            Ir para Open Finance
          </a>
        </div>
      )}

      {/* Charts grid */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: ".85rem" }}
      >
        <AccountsOverview accounts={accounts} loading={loading} />
        <LatestTransactions items={summary?.latestTransactions ?? []} loading={loading} />
        <CategoryChart items={summary?.expensesByCategory ?? []} />
        <PaymentMethodsChart items={summary?.paymentMethods ?? []} />
        <MonthlyFlowChart items={summary?.monthlyFlow ?? []} />
      </div>

      {/* Beta sections */}
      <div style={{ marginTop: "2rem" }}>
        <div className="divider">Módulos Beta</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
            gap: ".6rem",
            marginTop: "1rem",
          }}
        >
          {[
            { label: "IA Financeira", to: "/financial-ai" },
            { label: "Metas", to: "/goals" },
            { label: "Cartões", to: "/cards" },
            { label: "Investimentos", to: "/investments" },
            { label: "Alertas", to: "/alerts" }
          ].map((feature) => (
            <Link
              key={feature.to}
              to={feature.to}
              className="card"
              style={{
                padding: ".75rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: ".6rem",
                fontSize: ".8rem",
                color: "var(--text)",
              }}
            >
              <span className="badge badge-green">Beta</span>
              {feature.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
