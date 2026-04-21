import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { adminApi, authApi, API } from "../lib/api";
import { SPORT_BY_ID } from "../data/sports";
import { SignOut, Download, ArrowClockwise, CheckCircle, XCircle, Clock } from "@phosphor-icons/react";
import { toast } from "sonner";

const STATUS_COLORS = {
  UNPAID: "bg-red-500/10 text-red-500 border-red-500/20",
  PENDING: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  PAID: "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/20",
  REJECTED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function AdminDashboard() {
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [authState, setAuthState] = useState(user ? "ok" : "loading");
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [regs, setRegs] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (window.location.hash?.includes("session_id=")) return;
    if (user) return;
    authApi.me()
      .then(r => { setUser(r.data); setAuthState("ok"); })
      .catch(() => setAuthState("no"));
  }, [user]);

  const load = async () => {
    try {
      const [s, r, o] = await Promise.all([adminApi.stats(), adminApi.listRegistrations(), adminApi.listOrders()]);
      setStats(s.data); setRegs(r.data); setOrders(o.data);
    } catch { /* ignored */ }
  };

  useEffect(() => { if (authState === "ok") load(); }, [authState]);

  const updateRegStatus = async (reg_id, status) => {
    await adminApi.updateRegistrationPayment(reg_id, status);
    toast.success(`Status dikemaskini: ${status}`);
    load();
  };
  const updateOrdStatus = async (order_id, status) => {
    await adminApi.updateOrderPayment(order_id, status);
    toast.success(`Tempahan: ${status}`);
    load();
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null); setAuthState("no");
  };

  if (authState === "loading") return <div className="p-10 text-center text-[#94A3B8]" data-testid="admin-loading">Memuatkan...</div>;
  if (authState === "no") return <Navigate to="/admin/login" replace />;

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto" data-testid="admin-dashboard">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#F97316]">Admin Dashboard</div>
          <h1 className="font-display font-black text-3xl md:text-4xl uppercase leading-tight">Urus Setia SMK26</h1>
          <div className="text-xs text-[#94A3B8] mt-1">Log masuk: {user?.email}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={load} data-testid="admin-refresh-btn" className="inline-flex items-center gap-2 bg-[#12141A] border border-[#2D3342] hover:border-[#00D4AA] text-white px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider">
            <ArrowClockwise size={14}/> Muat Semula
          </button>
          <button onClick={logout} data-testid="admin-logout-btn" className="inline-flex items-center gap-2 bg-[#12141A] border border-[#2D3342] hover:border-red-500 text-red-400 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider">
            <SignOut size={14}/> Log Keluar
          </button>
        </div>
      </div>

      {stats && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="admin-stats">
          {[
            { label: "Jumlah Pendaftaran", value: stats.registrations_total, color: "#00D4AA" },
            { label: "Pendaftaran PAID", value: stats.registrations_paid, color: "#22C55E" },
            { label: "Tempahan eShop", value: stats.orders_total, color: "#F97316" },
            { label: "Tempahan PAID", value: stats.orders_paid, color: "#FACC15" },
          ].map((s,i)=>(
            <div key={i} className="bg-[#12141A] border border-[#2D3342] rounded-md p-4">
              <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: s.color }}>{s.label}</div>
              <div className="font-display font-black text-3xl mt-1">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {["overview","registrations","orders"].map(t => (
          <button key={t} onClick={()=>setTab(t)} data-testid={`admin-tab-${t}`} className={`flex-shrink-0 px-4 py-2 rounded-md border text-xs font-bold uppercase tracking-wider ${tab===t?"bg-[#00D4AA] text-[#0A0A0A] border-[#00D4AA]":"bg-[#12141A] text-[#94A3B8] border-[#2D3342]"}`}>
            {t === "overview" ? "Gambaran" : t === "registrations" ? `Pendaftaran (${regs.length})` : `Tempahan (${orders.length})`}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="admin-overview">
          <div className="bg-[#12141A] border border-[#2D3342] rounded-md p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-[#00D4AA] mb-2">Eksport CSV</div>
            <div className="flex flex-wrap gap-2">
              <a href={adminApi.exportRegistrationsUrl()} data-testid="export-regs-csv" className="inline-flex items-center gap-2 bg-[#00D4AA] text-[#0A0A0A] font-bold px-4 py-2 rounded-md uppercase tracking-wider text-xs"><Download size={14}/> Pendaftaran</a>
              <a href={adminApi.exportOrdersUrl()} data-testid="export-orders-csv" className="inline-flex items-center gap-2 bg-[#F97316] text-white font-bold px-4 py-2 rounded-md uppercase tracking-wider text-xs"><Download size={14}/> Tempahan</a>
            </div>
          </div>
          <div className="bg-[#12141A] border border-[#2D3342] rounded-md p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-[#F97316] mb-2">Perlu Tindakan</div>
            <div className="text-sm text-[#94A3B8]">
              {stats?.registrations_pending || 0} pendaftaran PENDING · {stats?.orders_pending || 0} tempahan PENDING.
            </div>
          </div>
          <div className="bg-[#12141A] border border-[#2D3342] rounded-md p-5 md:col-span-2">
            <div className="text-xs uppercase tracking-[0.2em] text-[#F97316] mb-2">Sistem Pertandingan</div>
            <p className="text-sm text-[#94A3B8] mb-3">Urus pasukan, jadual perlawanan, live scoring dan konfigurasi scoreboard per sukan.</p>
            <a href="/admin/tournament" data-testid="go-tournament-admin" className="inline-flex items-center gap-2 bg-[#F97316] text-white font-bold px-4 py-2 rounded-md uppercase tracking-wider text-xs">Buka Tournament Manager →</a>
          </div>
        </div>
      )}

      {tab === "registrations" && (
        <div className="mt-6 bg-[#12141A] border border-[#2D3342] rounded-md overflow-x-auto" data-testid="admin-registrations">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8] border-b border-[#2D3342]">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Nama</th>
                <th className="text-left p-3">Sukan</th>
                <th className="text-left p-3">Tel</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {regs.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-[#94A3B8]">Belum ada pendaftaran.</td></tr>}
              {regs.map(r => (
                <tr key={r.reg_id} className="border-b border-[#2D3342] last:border-b-0" data-testid={`reg-row-${r.reg_id}`}>
                  <td className="p-3 font-mono text-xs">{r.reg_id}</td>
                  <td className="p-3">{r.full_name}<div className="text-[10px] text-[#94A3B8]">{r.agency || "-"}</div></td>
                  <td className="p-3 text-xs">{SPORT_BY_ID[r.sport_id]?.name || r.sport_id}</td>
                  <td className="p-3 text-xs">{r.phone}</td>
                  <td className="p-3"><span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border ${STATUS_COLORS[r.payment_status]}`}>{r.payment_status}</span></td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button onClick={()=>updateRegStatus(r.reg_id, "PAID")} data-testid={`approve-reg-${r.reg_id}`} title="Approve" className="w-8 h-8 flex items-center justify-center rounded bg-[#00D4AA]/10 text-[#00D4AA] hover:bg-[#00D4AA]/20"><CheckCircle size={16}/></button>
                      <button onClick={()=>updateRegStatus(r.reg_id, "PENDING")} title="Pending" className="w-8 h-8 flex items-center justify-center rounded bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"><Clock size={16}/></button>
                      <button onClick={()=>updateRegStatus(r.reg_id, "REJECTED")} data-testid={`reject-reg-${r.reg_id}`} title="Reject" className="w-8 h-8 flex items-center justify-center rounded bg-red-500/10 text-red-500 hover:bg-red-500/20"><XCircle size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "orders" && (
        <div className="mt-6 bg-[#12141A] border border-[#2D3342] rounded-md overflow-x-auto" data-testid="admin-orders">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8] border-b border-[#2D3342]">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Nama</th>
                <th className="text-left p-3">Produk</th>
                <th className="text-left p-3">Jumlah</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-[#94A3B8]">Belum ada tempahan.</td></tr>}
              {orders.map(o => (
                <tr key={o.order_id} className="border-b border-[#2D3342] last:border-b-0" data-testid={`order-row-${o.order_id}`}>
                  <td className="p-3 font-mono text-xs">{o.order_id}</td>
                  <td className="p-3">{o.full_name}<div className="text-[10px] text-[#94A3B8]">{o.phone}</div></td>
                  <td className="p-3 text-xs">{o.product_name} × {o.quantity}</td>
                  <td className="p-3 font-display font-bold">RM {o.total.toFixed(0)}</td>
                  <td className="p-3"><span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border ${STATUS_COLORS[o.payment_status]}`}>{o.payment_status}</span></td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button onClick={()=>updateOrdStatus(o.order_id, "PAID")} data-testid={`approve-order-${o.order_id}`} className="w-8 h-8 flex items-center justify-center rounded bg-[#00D4AA]/10 text-[#00D4AA]"><CheckCircle size={16}/></button>
                      <button onClick={()=>updateOrdStatus(o.order_id, "PENDING")} className="w-8 h-8 flex items-center justify-center rounded bg-orange-500/10 text-orange-500"><Clock size={16}/></button>
                      <button onClick={()=>updateOrdStatus(o.order_id, "REJECTED")} data-testid={`reject-order-${o.order_id}`} className="w-8 h-8 flex items-center justify-center rounded bg-red-500/10 text-red-500"><XCircle size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
