import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../lib/api";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function AuthCallback() {
  const navigate = useNavigate();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const hash = window.location.hash || "";
    const m = hash.match(/session_id=([^&]+)/);
    if (!m) { navigate("/admin/login"); return; }
    const sessionId = m[1];

    authApi.exchange(sessionId)
      .then((res) => {
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate("/admin", { replace: true, state: { user: res.data.user } });
      })
      .catch(() => navigate("/admin/login", { replace: true }));
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-[#94A3B8]" data-testid="auth-callback">
      Memproses sesi...
    </div>
  );
}
