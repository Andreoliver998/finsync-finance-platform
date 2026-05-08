import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Filter,
  ReceiptText,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AppLayout from "../layouts/AppLayout.jsx";
import { getTransactions } from "../services/financialSyncApi.js";

const now = new Date();

const TYPE_OPTIONS = [
  { value: "", label: "Todos os tipos" },
  { value: "CREDIT", label: "Crédito" },
  { value: "DEBIT", label: "Débito" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Todos os status" },
  { value: "POSTED", label: "Efetivado" },
  { value: "PENDING", label: "Pendente" },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function SkeletonRow() {
  return (
    <div className="txn-row txn-row-skeleton">
      <div className="skeleton" style={{ height: 14, width: "60%" }} />
      <div className="skeleton" style={{ height: 14, width: "80%" }} />
      <div className="skeleton" style={{ height: 14, width: "50%" }} />
      <div className="skeleton" style={{ height: 14, width: "40%" }} />
      <div className="skeleton" style={{ height: 20, width: 70, borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 14, width: "55%" }} />
    </div>
  );
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="txn-empty">
      <div className="txn-empty-icon">
        <ReceiptText size={28} />
      </div>
      <h2>
        {hasFilters ? "Nenhuma transação encontrada" : "Sem transações importadas"}
      </h2>
      <p>
        {hasFilters
          ? "Tente ajustar os filtros ou limpar a busca."
          : "Sincronize uma conexão bancária no Open Finance para importar seu histórico."}
      </p>
      {hasFilters && (
        <button className="btn btn-secondary btn-sm" style={{ marginTop: ".75rem" }} onClick={onClear}>
          <X size={13} />
          Limpar filtros
        </button>
      )}
    </div>
  );
}

function TypeBadge({ amount, type }) {
  const isCredit = amount > 0 || type === "CREDIT";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: ".3rem",
        fontSize: ".65rem",
        fontFamily: "var(--mono)",
        fontWeight: 700,
        padding: ".15rem .55rem",
        borderRadius: 4,
        background: isCredit ? "rgba(16,185,129,.10)" : "rgba(6,182,212,.10)",
        color: isCredit ? "var(--success)" : "var(--cyan)",
        border: `1px solid ${isCredit ? "rgba(16,185,129,.22)" : "rgba(6,182,212,.22)"}`,
      }}
    >
      {isCredit ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
      {isCredit ? "Crédito" : "Débito"}
    </span>
  );
}

function StatusBadge({ status }) {
  const config = {
    POSTED:  { label: "Efetivado", color: "rgba(167,139,250,.10)", text: "var(--purple-light)", border: "rgba(167,139,250,.22)" },
    PENDING: { label: "Pendente",  color: "rgba(245,158,11,.10)",  text: "var(--warning)",     border: "rgba(245,158,11,.22)"  },
  };
  const c = config[status] ?? config.POSTED;
  return (
    <span
      style={{
        fontSize: ".62rem",
        fontFamily: "var(--mono)",
        fontWeight: 600,
        padding: ".15rem .55rem",
        borderRadius: 4,
        background: c.color,
        color: c.text,
        border: `1px solid ${c.border}`,
        textTransform: "uppercase",
        letterSpacing: ".05em",
      }}
    >
      {c.label}
    </span>
  );
}

export default function TransactionsPage() {
  const [all, setAll]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [search, setSearch] = useState("");
  const [type,   setType]   = useState("");
  const [status, setStatus] = useState("");
  const [month,  setMonth]  = useState(String(now.getMonth() + 1));
  const [year,   setYear]   = useState(String(now.getFullYear()));
  const [showFilters, setShowFilters] = useState(false);

  function load() {
    setLoading(true);
    setError("");
    getTransactions({ limit: 500 })
      .then((data) => setAll(Array.isArray(data) ? data : []))
      .catch(() => setError("Não foi possível carregar as transações importadas."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return all.filter((t) => {
      if (search) {
        const q = search.toLowerCase();
        const matches =
          t.description?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          t.connection?.institution?.toLowerCase().includes(q) ||
          t.bankAccount?.marketingName?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (type) {
        const isCredit = t.amount > 0 || t.type === "CREDIT";
        if (type === "CREDIT" && !isCredit) return false;
        if (type === "DEBIT"  && isCredit)  return false;
      }
      if (status && t.status !== status) return false;
      if (month || year) {
        const d = new Date(t.date);
        if (month && String(d.getMonth() + 1) !== String(month)) return false;
        if (year  && String(d.getFullYear())  !== String(year))  return false;
      }
      return true;
    });
  }, [all, search, type, status, month, year]);

  const summary = useMemo(() => {
    return filtered.reduce(
      (acc, t) => {
        if (t.amount > 0) acc.income  += t.amount;
        else              acc.expenses += Math.abs(t.amount);
        return acc;
      },
      { income: 0, expenses: 0 }
    );
  }, [filtered]);

  const hasFilters = search || type || status || month !== String(now.getMonth() + 1) || year !== String(now.getFullYear());

  function clearFilters() {
    setSearch("");
    setType("");
    setStatus("");
    setMonth(String(now.getMonth() + 1));
    setYear(String(now.getFullYear()));
  }

  return (
    <AppLayout breadcrumb="Transações">
      <div className="anim-fade-in">

        {/* ── Header ── */}
        <div className="txn-page-header">
          <div>
            <h1 className="dash-page-title">Transações importadas</h1>
            <p className="dash-page-sub">Histórico sincronizado via Open Finance.</p>
          </div>
          <div style={{ display: "flex", gap: ".6rem", alignItems: "center" }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={load}
              disabled={loading}
              title="Recarregar"
            >
              <RefreshCw size={13} style={loading ? { animation: "spin 1s linear infinite" } : {}} />
            </button>
            <button
              className={`btn btn-sm ${showFilters ? "btn-secondary" : "btn-ghost"}`}
              onClick={() => setShowFilters((v) => !v)}
            >
              <Filter size={13} />
              Filtros
              {hasFilters && (
                <span
                  style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "var(--purple)", marginLeft: ".1rem",
                  }}
                />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {/* ── Summary stats ── */}
        <div className="txn-summary-row">
          <div className="txn-stat">
            <span className="txn-stat-label">Total filtrado</span>
            <span className="txn-stat-value mono">{filtered.length}</span>
          </div>
          <div className="txn-stat txn-stat-income">
            <span className="txn-stat-label">
              <ArrowUpRight size={12} />
              Entradas
            </span>
            <span className="txn-stat-value mono">{formatCurrency(summary.income)}</span>
          </div>
          <div className="txn-stat txn-stat-expense">
            <span className="txn-stat-label">
              <ArrowDownLeft size={12} />
              Saídas
            </span>
            <span className="txn-stat-value mono">{formatCurrency(summary.expenses)}</span>
          </div>
        </div>

        {/* ── Search bar ── */}
        <div className="txn-search-bar">
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 13,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted-2)",
                pointerEvents: "none",
              }}
            />
            <input
              className="input"
              placeholder="Buscar por descrição, categoria, banco…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "2.4rem" }}
            />
          </div>
          {search && (
            <button className="btn btn-ghost btn-sm" onClick={() => setSearch("")}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* ── Collapsible filter panel ── */}
        {showFilters && (
          <div className="txn-filter-panel card anim-fade-in">
            <div className="input-group">
              <label className="input-label">Mês</label>
              <input className="input" type="number" min="1" max="12" value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Ano</label>
              <input className="input" type="number" min="2000" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Tipo</label>
              <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Status</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {hasFilters && (
              <div className="input-group" style={{ justifyContent: "flex-end" }}>
                <label className="input-label" style={{ visibility: "hidden" }}>_</label>
                <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                  <X size={12} />
                  Limpar
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Table ── */}
        <div className="txn-table card">
          {/* Header */}
          <div className="txn-head">
            <span>Data</span>
            <span>Descrição</span>
            <span>Categoria</span>
            <span>Banco / Conta</span>
            <span>Tipo</span>
            <span style={{ textAlign: "right" }}>Valor</span>
          </div>

          {/* Rows */}
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
          ) : filtered.length === 0 ? (
            <EmptyState hasFilters={Boolean(hasFilters)} onClear={clearFilters} />
          ) : (
            filtered.map((t) => {
              const isCredit = t.amount > 0 || t.type === "CREDIT";
              const institution =
                t.connection?.institution ||
                t.bankAccount?.marketingName ||
                t.bankAccount?.name ||
                "—";

              return (
                <div className="txn-row" key={t.id}>
                  <span className="txn-date mono">{formatDate(t.date)}</span>

                  <span className="txn-desc">
                    <strong>{t.description || "Transação bancária"}</strong>
                    {t.status && <StatusBadge status={t.status} />}
                  </span>

                  <span className="txn-category">
                    {t.category || <span style={{ color: "var(--dim)" }}>—</span>}
                  </span>

                  <span className="txn-bank">
                    <Building2 size={11} style={{ color: "var(--muted-2)", flexShrink: 0 }} />
                    {institution}
                  </span>

                  <span>
                    <TypeBadge amount={t.amount} type={t.type} />
                  </span>

                  <span
                    className="txn-amount mono"
                    style={{ color: isCredit ? "var(--success)" : "var(--cyan)" }}
                  >
                    {formatCurrency(t.amount)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Row count footer */}
        {!loading && filtered.length > 0 && (
          <div
            style={{
              marginTop: ".75rem",
              textAlign: "center",
              fontFamily: "var(--mono)",
              fontSize: ".62rem",
              color: "var(--dim)",
            }}
          >
            {filtered.length} {filtered.length === 1 ? "transação" : "transações"} · {all.length} no total
          </div>
        )}
      </div>
    </AppLayout>
  );
}
