import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

/* ── tiny inline styles for animations not expressible in Tailwind ── */
const Styles = () => (
  <style>{`
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes pulseRing {
      0%   { box-shadow: 0 0 0 0 rgba(99,102,241,0.45); }
      70%  { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
      100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
    }
    @keyframes otpSlide {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .fade-up-1 { animation: fadeUp 0.5s ease 0.05s both; }
    .fade-up-2 { animation: fadeUp 0.5s ease 0.15s both; }
    .fade-up-3 { animation: fadeUp 0.5s ease 0.25s both; }
    .fade-up-4 { animation: fadeUp 0.5s ease 0.35s both; }
    .fade-up-5 { animation: fadeUp 0.5s ease 0.45s both; }
    .fade-up-6 { animation: fadeUp 0.5s ease 0.55s both; }

    .otp-reveal { animation: otpSlide 0.35s ease both; }

    .shimmer-text {
      background: linear-gradient(90deg, #6366f1 0%, #a5b4fc 45%, #6366f1 90%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s linear infinite;
    }

    .logo-pulse { animation: pulseRing 2.5s ease infinite; }

    .otp-box input {
      width: 44px;
      height: 52px;
      text-align: center;
      font-size: 1.25rem;
      font-weight: 700;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      color: #1e293b;
      background: #fff;
    }
    .otp-box input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
    }
    .otp-box input.filled {
      border-color: #6366f1;
      background: #eef2ff;
    }

    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }

    .left-panel {
      background: linear-gradient(145deg, #4338ca 0%, #6366f1 50%, #7c3aed 100%);
    }

    .trust-card {
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 16px;
      backdrop-filter: blur(8px);
    }

    .input-field {
      width: 100%;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 15px;
      color: #1e293b;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      background: #fff;
      box-sizing: border-box;
    }
    .input-field:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
    }
    .input-field::placeholder { color: #94a3b8; }

    .btn-primary {
      width: 100%;
      background: #6366f1;
      color: #fff;
      font-weight: 700;
      font-size: 15px;
      padding: 15px;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .btn-primary:hover:not(:disabled) {
      background: #4f46e5;
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(99,102,241,0.35);
    }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

    .btn-ghost {
      width: 100%;
      background: transparent;
      color: #6366f1;
      font-weight: 600;
      font-size: 15px;
      padding: 14px;
      border-radius: 12px;
      border: 1.5px solid #e0e7ff;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s, transform 0.15s;
    }
    .btn-ghost:hover:not(:disabled) {
      background: #eef2ff;
      border-color: #6366f1;
      transform: translateY(-1px);
    }
    .btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

    .dev-otp {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 14px 16px;
    }

    .step-dot {
      width: 28px; height: 28px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
    }
  `}</style>
);

/* ── OTP digit boxes ── */
function OtpInput({ value, onChange }) {
  const digits = value.padEnd(6, "").split("");

  const handleKey = (e, idx) => {
    const d = e.key;
    if (d === "Backspace") {
      const next = value.slice(0, idx === 0 ? 0 : idx - 1) + value.slice(idx);
      onChange(next.replace(/\D/g, "").slice(0, 6));
      if (idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus();
      return;
    }
    if (!/^\d$/.test(d)) return;
    const arr = value.split("");
    arr[idx] = d;
    const next = arr.join("").replace(/\D/g, "").slice(0, 6);
    onChange(next);
    if (idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  return (
    <div className="otp-box" style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
      {[0,1,2,3,4,5].map(i => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] === " " ? "" : digits[i]}
          className={digits[i] && digits[i] !== " " ? "filled" : ""}
          onChange={() => {}}
          onKeyDown={(e) => handleKey(e, i)}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            onChange(pasted);
            document.getElementById(`otp-${Math.min(pasted.length, 5)}`)?.focus();
          }}
        />
      ))}
    </div>
  );
}

/* ── trust signals for left panel ── */
const trustPoints = [
  { icon: "🛡️", text: "Invoice-verified reviews only" },
  { icon: "🤖", text: "AI moderation catches fakes instantly" },
  { icon: "⭐", text: "Build a trust score customers believe" },
];

const recentReview = {
  name: "Deepa R.",
  business: "Rao Textiles",
  body: "3x more reviews in a week after getting the QR badge!",
  rating: 5,
};

/* ── main ── */
export default function Login() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }
  const [resendTimer, setResendTimer] = useState(0);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const startResendTimer = () => {
    setResendTimer(30);
    const iv = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(iv); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const sendOtp = async () => {
    if (mobile.length !== 10) {
      showToast("error", "Please enter a valid 10-digit mobile number.");
      return;
    }
    setSendingOtp(true);
    try {
      const response = await api.post("/login-send-otp", { mobile });
      if (!response.data.success) {
        showToast("error", response.data.message);
        return;
      }
      setGeneratedOtp(response.data.otp);
      setOtpSent(true);
      startResendTimer();
      showToast("success", `OTP sent to +91 ${mobile}`);
    } catch (error) {
      showToast("error", error?.response?.data?.message || "Couldn't send OTP. Try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const login = async () => {
    if (mobile.length !== 10) {
      showToast("error", "Please enter a valid 10-digit mobile number.");
      return;
    }
    if (otp.length !== 6) {
      showToast("error", "Please enter the complete 6-digit OTP.");
      return;
    }
    setLoggingIn(true);
    try {
      const response = await api.post("/verify-otp", { mobile, otp });
      if (!response.data.success) {
        showToast("error", response.data.message);
        return;
      }
      localStorage.setItem("token", response.data.access_token);
      showToast("success", "Welcome back! Redirecting to your dashboard…");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (error) {
      showToast("error", error?.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Styles />

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
          zIndex: 9999, padding: "12px 24px", borderRadius: 12, fontWeight: 600,
          fontSize: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          background: toast.type === "success" ? "#f0fdf4" : "#fef2f2",
          color: toast.type === "success" ? "#15803d" : "#dc2626",
          border: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`,
          animation: "otpSlide 0.3s ease both",
        }}>
          {toast.type === "success" ? "✓ " : "✕ "}{toast.msg}
        </div>
      )}

      {/* ── LEFT PANEL ── */}
      <div className="left-panel" style={{
        width: "42%", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "60px 48px",
        display: "flex",
      }} aria-hidden="true">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48 }}>
          <div className="logo-pulse" style={{
            width: 40, height: 40, borderRadius: 12,
            background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="white"/>
            </svg>
          </div>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 22, letterSpacing: "-0.5px" }}>ReviewPe</span>
        </div>

        {/* Headline */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            Business Portal
          </p>
          <h2 style={{ color: "#fff", fontSize: 34, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.5px", margin: 0 }}>
            Real reviews.<br />Verified with proof.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, marginTop: 14, lineHeight: 1.6 }}>
            Join 5,000+ Indian businesses building customer trust the right way.
          </p>
        </div>

        {/* Trust points */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
          {trustPoints.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="step-dot">{p.icon}</div>
              <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500 }}>{p.text}</span>
            </div>
          ))}
        </div>

        {/* Mini review card */}
        <div className="trust-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,0.25)", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#fff",
            }}>DR</div>
            <div>
              <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, margin: 0 }}>{recentReview.name}</p>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, margin: 0 }}>on {recentReview.business}</p>
            </div>
            <div style={{ marginLeft: "auto", fontSize: 12, color: "#fbbf24" }}>★★★★★</div>
          </div>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
            "{recentReview.body}"
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
            <span style={{
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 20, padding: "2px 10px", fontSize: 11, color: "#fff", fontWeight: 600,
            }}>✓ Verified Purchase</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        flex: 1, background: "#f8fafc",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: 440 }}>

          {/* Back to home */}
          <div className="fade-up-1" style={{ marginBottom: 32 }}>
            <Link to="/" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              color: "#64748b", fontSize: 13, fontWeight: 600, textDecoration: "none",
              padding: "6px 12px", borderRadius: 8, background: "#fff",
              border: "1px solid #e2e8f0", transition: "all 0.2s",
            }}>
              ← Back to home
            </Link>
          </div>

          {/* Header */}
          <div className="fade-up-2" style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
              Welcome back 👋
            </h1>
            <p style={{ color: "#64748b", fontSize: 15, marginTop: 8 }}>
              Log in to your ReviewPe business dashboard.
            </p>
          </div>

          {/* Mobile field */}
          <div className="fade-up-3" style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
              Mobile Number
            </label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                fontSize: 14, fontWeight: 600, color: "#94a3b8",
              }}>+91</span>
              <input
                className="input-field"
                type="tel"
                placeholder="98765 43210"
                value={mobile}
                maxLength={10}
                style={{ paddingLeft: 52 }}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  if (v.length <= 10) setMobile(v);
                }}
                onKeyDown={(e) => { if (e.key === "Enter" && !otpSent) sendOtp(); }}
              />
            </div>
          </div>

          {/* Send OTP button */}
          <div className="fade-up-4" style={{ marginBottom: 20 }}>
            {!otpSent ? (
              <button className="btn-primary" onClick={sendOtp} disabled={sendingOtp || mobile.length !== 10}>
                {sendingOtp ? <><span className="spinner" /> Sending OTP…</> : "Send OTP →"}
              </button>
            ) : (
              <button
                className="btn-ghost"
                onClick={sendOtp}
                disabled={sendingOtp || resendTimer > 0}
              >
                {sendingOtp
                  ? "Resending…"
                  : resendTimer > 0
                  ? `Resend OTP in ${resendTimer}s`
                  : "Resend OTP"}
              </button>
            )}
          </div>

          {/* Dev OTP display */}
          {generatedOtp && (
            <div className="dev-otp otp-reveal" style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#15803d", margin: "0 0 4px" }}>
                🔧 Development mode — OTP
              </p>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#166534", margin: 0, letterSpacing: "0.15em" }}>
                {generatedOtp}
              </p>
            </div>
          )}

          {/* OTP section */}
          {otpSent && (
            <div className="otp-reveal" style={{ marginBottom: 20 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                  Enter OTP
                </label>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                  We sent a 6-digit code to +91 {mobile}
                </p>
              </div>
              <OtpInput value={otp} onChange={setOtp} />
            </div>
          )}

          {/* Login button */}
          {otpSent && (
            <div className="fade-up-5 otp-reveal" style={{ marginBottom: 24 }}>
              <button
                className="btn-primary"
                onClick={login}
                disabled={loggingIn || otp.length !== 6}
              >
                {loggingIn ? <><span className="spinner" /> Verifying…</> : "Log in to Dashboard →"}
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="fade-up-6" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, marginTop: otpSent ? 0 : 8 }}>
            <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>New to ReviewPe?</span>
            <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
          </div>

          {/* Register CTA */}
          <div className="fade-up-6">
            <button
              className="btn-ghost"
              onClick={() => navigate("/register")}
            >
              Register your business now!
            </button>
          </div>

          {/* Footer note */}
          <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 28 }}>
            By logging in, you agree to ReviewPe's{" "}
            <a href="#" style={{ color: "#6366f1", textDecoration: "none" }}>Terms</a> &{" "}
            <a href="#" style={{ color: "#6366f1", textDecoration: "none" }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}