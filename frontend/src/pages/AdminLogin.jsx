import { GoogleLogo, ShieldCheck } from "@phosphor-icons/react";

export default function AdminLogin() {
  const login = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/admin";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4" data-testid="admin-login-page">
      <div className="w-full max-w-md bg-[#12141A] border border-[#2D3342] rounded-lg p-8">
        <div className="w-12 h-12 rounded-md bg-[#00D4AA]/10 text-[#00D4AA] flex items-center justify-center mb-4">
          <ShieldCheck size={24} weight="bold" />
        </div>
        <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#F97316]">Admin Area</div>
        <h1 className="font-display font-black text-3xl uppercase mt-1">Log Masuk Admin</h1>
        <p className="mt-2 text-[#94A3B8] text-sm">Hanya untuk urus setia SMK26. Log masuk melalui Google.</p>

        <button onClick={login} data-testid="admin-google-login" className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-white text-[#0A0A0A] font-bold py-3 rounded-md uppercase tracking-wider">
          <GoogleLogo size={18} weight="bold" /> Log Masuk dengan Google
        </button>
      </div>
    </div>
  );
}
