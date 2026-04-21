import { useEffect, useState } from "react";
import { publicApi, fileToBase64 } from "../lib/api";
import { ShoppingCart, UploadSimple, CheckCircle, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import FlashOffer from "../components/FlashOffer";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(null); // product
  const [form, setForm] = useState({ full_name:"", phone:"", email:"", address:"", quantity:1, delivery_method:"pickup" });
  const [order, setOrder] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { publicApi.listProducts().then(r => setProducts(r.data)); }, []);

  const submit = async () => {
    if (!form.full_name || !form.phone) { toast.error("Sila isi nama & telefon"); return; }
    setBusy(true);
    try {
      const res = await publicApi.createOrder({ ...form, product_id: open.product_id });
      setOrder(res.data);
      toast.success(`Tempahan: ${res.data.order_id}`);
    } catch { toast.error("Tempahan gagal"); }
    finally { setBusy(false); }
  };

  const uploadReceipt = async () => {
    if (!receipt || !order) return;
    setBusy(true);
    try {
      const b64 = await fileToBase64(receipt);
      await publicApi.uploadOrderReceipt(order.order_id, b64);
      toast.success("Resit diterima, menunggu pengesahan.");
      setOrder({ ...order, payment_status: "PENDING" });
    } catch { toast.error("Gagal muat naik"); }
    finally { setBusy(false); }
  };

  const close = () => { setOpen(null); setOrder(null); setReceipt(null); setForm({ full_name:"", phone:"", email:"", address:"", quantity:1, delivery_method:"pickup" }); };

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto" data-testid="shop-page">
      <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#FACC15] mb-2">Poutrecs Merch</div>
      <h1 className="font-display font-black text-4xl md:text-5xl uppercase leading-tight">eShop SMK<span className="text-[#F97316]">26</span></h1>
      <p className="mt-3 text-[#94A3B8] text-sm md:text-base">Merchandise rasmi acara. Preorder sebelum hari acara untuk jaminan saiz & warna.</p>

      <div className="mt-5">
        <FlashOffer />
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.product_id} className="bg-[#12141A] border border-[#2D3342] rounded-md overflow-hidden" data-testid={`product-card-${p.product_id}`}>
            <div className="aspect-square bg-[#0A0A0A] relative">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-90" />
              {p.badge && (
                <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded bg-[#F97316] text-white font-bold">{p.badge}</span>
              )}
            </div>
            <div className="p-4">
              <div className="font-display font-bold uppercase tracking-wide text-base">{p.name}</div>
              <div className="text-xs text-[#94A3B8] mt-1 min-h-[2.5rem]">{p.description}</div>
              <div className="mt-3 flex items-center justify-between">
                <div className="font-display font-black text-2xl text-[#00D4AA]">RM {p.price.toFixed(0)}</div>
                <button onClick={() => setOpen(p)} data-testid={`buy-${p.product_id}`} className="inline-flex items-center gap-1.5 bg-[#00D4AA] text-[#0A0A0A] font-bold px-3 py-2 rounded-md uppercase tracking-wider text-xs">
                  <ShoppingCart size={14} weight="bold" /> Beli
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] bg-[#0A0A0A]/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4" data-testid="order-modal">
          <div className="bg-[#12141A] border border-[#2D3342] rounded-t-2xl md:rounded-lg w-full md:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#2D3342]">
              <div className="font-display font-black uppercase tracking-wider">{order ? "Langkah 2: Bayar" : open.name}</div>
              <button onClick={close} data-testid="close-order-modal" className="w-9 h-9 flex items-center justify-center rounded-md bg-[#0A0A0A] border border-[#2D3342]"><X size={18}/></button>
            </div>

            {!order ? (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3 p-3 bg-[#0A0A0A] border border-[#2D3342] rounded-md">
                  <img src={open.image} className="w-14 h-14 rounded-md object-cover" alt="" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{open.name}</div>
                    <div className="text-xs text-[#94A3B8]">RM {open.price.toFixed(2)}</div>
                  </div>
                </div>

                {[
                  { k:"full_name", label:"Nama Penuh *" },
                  { k:"phone", label:"Telefon WhatsApp *" },
                  { k:"email", label:"Emel (pilihan)" },
                  { k:"address", label:"Alamat (jika penghantaran)" },
                ].map(f => (
                  <label key={f.k} className="block">
                    <span className="text-xs uppercase tracking-[0.2em] text-[#94A3B8]">{f.label}</span>
                    <input value={form[f.k]} onChange={(e)=>setForm({...form,[f.k]:e.target.value})} data-testid={`order-input-${f.k}`} className="mt-1 w-full bg-[#0A0A0A] border border-[#2D3342] rounded-md px-4 py-2.5 text-white focus:border-[#00D4AA] focus:outline-none" />
                  </label>
                ))}

                <label className="block">
                  <span className="text-xs uppercase tracking-[0.2em] text-[#94A3B8]">Kuantiti</span>
                  <input type="number" min={1} max={20} value={form.quantity} onChange={(e)=>setForm({...form, quantity:parseInt(e.target.value||"1")})} data-testid="order-input-quantity" className="mt-1 w-full bg-[#0A0A0A] border border-[#2D3342] rounded-md px-4 py-2.5 text-white" />
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {["pickup","delivery"].map(m => (
                    <button key={m} onClick={()=>setForm({...form,delivery_method:m})} data-testid={`delivery-${m}`} className={`py-2.5 rounded-md border font-bold uppercase tracking-wider text-xs ${form.delivery_method === m ? "bg-[#F97316] text-white border-[#F97316]" : "bg-[#0A0A0A] text-[#94A3B8] border-[#2D3342]"}`}>{m === "pickup" ? "Ambil di Acara" : "Hantar ke Rumah"}</button>
                  ))}
                </div>

                <button disabled={busy} onClick={submit} data-testid="submit-order-btn" className="w-full bg-[#00D4AA] text-[#0A0A0A] font-bold py-3 rounded-md uppercase tracking-wider disabled:opacity-50">{busy ? "Menghantar..." : `Tempah — RM ${(open.price * (form.quantity||1)).toFixed(2)}`}</button>
              </div>
            ) : (
              <div className="p-4 space-y-3" data-testid="order-confirmation">
                <div className="flex items-center gap-2 text-[#00D4AA]"><CheckCircle size={22} weight="fill" /><div className="font-display font-black uppercase">ID: {order.order_id}</div></div>
                <p className="text-sm text-[#94A3B8]">Status: <span className="font-bold text-white">{order.payment_status}</span> · Jumlah: RM {order.total.toFixed(2)}</p>
                <div className="p-4 rounded-md border border-[#2D3342] bg-[#0A0A0A] flex flex-col sm:flex-row gap-4">
                  <div className="w-32 h-32 mx-auto bg-white rounded-md flex items-center justify-center text-center text-xs text-black p-3">QR Pembayaran<br/><span className="text-[#F97316] font-bold">RM {order.total.toFixed(0)}</span></div>
                  <div className="flex-1 space-y-2">
                    <input type="file" accept="image/*" onChange={(e)=>setReceipt(e.target.files?.[0]||null)} data-testid="order-receipt-input" className="block text-sm text-[#94A3B8] file:mr-3 file:px-4 file:py-2 file:rounded-md file:border-0 file:bg-[#00D4AA] file:text-[#0A0A0A] file:font-bold file:uppercase file:text-xs" />
                    <button disabled={!receipt || busy} onClick={uploadReceipt} data-testid="upload-order-receipt-btn" className="inline-flex items-center gap-2 bg-[#00D4AA] disabled:opacity-50 text-[#0A0A0A] font-bold px-5 py-2.5 rounded-md uppercase tracking-wider text-sm"><UploadSimple size={16} weight="bold"/> Muat Naik Resit</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
