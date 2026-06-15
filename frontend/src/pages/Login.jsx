import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

/* ─── Animations & base styles ─── */
const Styles = () => (
  <style>{`
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes pulseRing {
      0%   { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
      70%  { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
      100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }

    .rp-fade-1 { animation: fadeUp .45s ease .05s both; }
    .rp-fade-2 { animation: fadeUp .45s ease .12s both; }
    .rp-fade-3 { animation: fadeUp .45s ease .20s both; }
    .rp-fade-4 { animation: fadeUp .45s ease .28s both; }
    .rp-fade-5 { animation: fadeUp .45s ease .36s both; }
    .rp-fade-6 { animation: fadeUp .45s ease .44s both; }
    .rp-slide  { animation: slideIn .35s ease both; }

    /* ── Layout ── */
    .rp-root {
      display: flex;
      min-height: 100vh;
      font-family: Inter, system-ui, sans-serif;
    }

    /* ── Left panel ── */
    .rp-left {
      width: 42%;
      flex-shrink: 0;
      background: linear-gradient(145deg, #4338ca 0%, #6366f1 50%, #7c3aed 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 48px 44px;
    }
    .rp-logo-row { display: flex; align-items: center; gap: 10px; }
    .rp-logo-icon {
      width: 40px; height: 40px; border-radius: 12px;
      background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.3);
      display: flex; align-items: center; justify-content: center;
      animation: pulseRing 2.5s ease infinite;
    }
    .rp-brand { color: #fff; font-weight: 800; font-size: 22px; letter-spacing: -.5px; }
    .rp-left-headline {
      color: #fff; font-size: 32px; font-weight: 800;
      line-height: 1.2; letter-spacing: -.5px; margin: 36px 0 10px;
    }
    .rp-left-sub { color: rgba(255,255,255,.7); font-size: 15px; line-height: 1.6; }
    .rp-trust-list { display: flex; flex-direction: column; gap: 14px; margin: 28px 0; }
    .rp-trust-item { display: flex; align-items: center; gap: 12px; }
    .rp-trust-dot {
      width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
      background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25);
      display: flex; align-items: center; justify-content: center; font-size: 14px;
    }
    .rp-trust-text { color: rgba(255,255,255,.85); font-size: 14px; font-weight: 500; }
    .rp-review-card {
      background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
      border-radius: 16px; padding: 18px 20px;
      backdrop-filter: blur(8px);
    }
    .rp-review-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .rp-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: rgba(255,255,255,.25);
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0;
    }
    .rp-review-name { color: #fff; font-size: 13px; font-weight: 700; margin: 0; }
    .rp-review-biz  { color: rgba(255,255,255,.55); font-size: 11px; margin: 0; }
    .rp-stars { color: #fbbf24; font-size: 12px; margin-left: auto; }
    .rp-review-body { color: rgba(255,255,255,.8); font-size: 13px; line-height: 1.55; margin: 0; }
    .rp-verified {
      display: inline-flex; align-items: center; gap: 4px;
      background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25);
      border-radius: 20px; padding: 3px 10px;
      font-size: 11px; color: #fff; font-weight: 600; margin-top: 10px;
    }

    /* ── Right panel ── */
    .rp-right {
      flex: 1;
      background: #f8fafc;
      display: flex; align-items: center; justify-content: center;
      padding: 48px 32px;
    }
    .rp-form-box { width: 100%; max-width: 420px; }

    /* ── Back button ── */
    .rp-back {
      display: inline-flex; align-items: center; gap: 6px;
      color: #64748b; font-size: 13px; font-weight: 600;
      text-decoration: none; padding: 6px 14px;
      border-radius: 8px; background: #fff;
      border: 1px solid #e2e8f0; transition: all .2s;
      margin-bottom: 28px;
    }
    .rp-back:hover { border-color: #6366f1; color: #6366f1; }

    /* ── Step indicator ── */
    .rp-steps { display: flex; align-items: center; margin: 20px 0 28px; }
    .rp-step-item { display: flex; align-items: center; gap: 6px; }
    .rp-step-num {
      width: 24px; height: 24px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; transition: all .3s; flex-shrink: 0;
    }
    .rp-step-num.idle   { background: #fff; border: 1.5px solid #e2e8f0; color: #94a3b8; }
    .rp-step-num.active { background: #6366f1; color: #fff; border: none; }
    .rp-step-num.done   { background: #10b981; color: #fff; border: none; }
    .rp-step-label { font-size: 12px; font-weight: 600; color: #94a3b8; transition: color .3s; }
    .rp-step-label.active { color: #6366f1; }
    .rp-step-label.done   { color: #10b981; }
    .rp-step-conn { flex: 1; height: 1px; background: #e2e8f0; margin: 0 8px; }

    /* ── Form elements ── */
    .rp-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 7px; }
    .rp-phone-wrap { position: relative; }
    .rp-prefix {
      position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
      font-size: 14px; font-weight: 600; color: #94a3b8; pointer-events: none;
    }
    .rp-phone-input {
      width: 100%; border: 1.5px solid #e2e8f0; border-radius: 12px;
      padding: 14px 16px 14px 52px; font-size: 15px; color: #1e293b;
      outline: none; background: #fff; box-sizing: border-box;
      transition: border-color .2s, box-shadow .2s;
    }
    .rp-phone-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.12); }
    .rp-phone-input::placeholder { color: #94a3b8; }
    .rp-phone-input.valid { border-color: #10b981; }
    .rp-phone-input:disabled { background: #f8fafc; color: #64748b; }

    /* Strength bar */
    .rp-strength-bar {
      height: 3px; border-radius: 2px; background: #e2e8f0;
      margin-top: 6px; overflow: hidden;
    }
    .rp-strength-fill { height: 100%; border-radius: 2px; transition: width .4s, background .4s; }

    /* Buttons */
    .rp-btn-primary {
      width: 100%; background: #6366f1; color: #fff;
      font-weight: 700; font-size: 15px; padding: 15px;
      border-radius: 12px; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: background .2s, transform .15s, box-shadow .2s;
    }
    .rp-btn-primary:hover:not(:disabled) {
      background: #4f46e5; transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(99,102,241,.3);
    }
    .rp-btn-primary:disabled { opacity: .65; cursor: not-allowed; }
    .rp-btn-primary.success { background: #10b981; }

    .rp-btn-ghost {
      width: 100%; background: transparent; color: #6366f1;
      font-weight: 600; font-size: 15px; padding: 14px;
      border-radius: 12px; border: 1.5px solid #e0e7ff; cursor: pointer;
      transition: background .2s, border-color .2s, transform .15s;
    }
    .rp-btn-ghost:hover:not(:disabled) {
      background: #eef2ff; border-color: #6366f1; transform: translateY(-1px);
    }
    .rp-btn-ghost:disabled { opacity: .5; cursor: not-allowed; }

    .rp-spinner {
      width: 17px; height: 17px;
      border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
      border-radius: 50%; animation: spin .7s linear infinite; display: inline-block;
    }

    /* OTP boxes */
    .rp-otp-row { display: flex; gap: 10px; justify-content: center; }
    .rp-otp-digit {
      width: 48px; height: 56px; text-align: center;
      font-size: 1.25rem; font-weight: 700;
      border: 1.5px solid #e2e8f0; border-radius: 12px;
      outline: none; transition: border-color .2s, box-shadow .2s, background .2s;
      color: #1e293b; background: #fff;
    }
    .rp-otp-digit:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.14); }
    .rp-otp-digit.filled { border-color: #6366f1; background: #eef2ff; }
    .rp-otp-digit.error  { border-color: #ef4444; background: #fef2f2; animation: shake .3s ease; }

    @keyframes shake {
      0%,100% { transform: translateX(0); }
      25%      { transform: translateX(-4px); }
      75%      { transform: translateX(4px); }
    }

    /* Timer */
    .rp-timer-wrap { display: flex; align-items: center; gap: 8px; justify-content: center; margin: 12px 0; }
    .rp-timer-circle { width: 34px; height: 34px; position: relative; }
    .rp-timer-circle svg { transform: rotate(-90deg); }
    .rp-timer-num {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%,-50%);
      font-size: 9px; font-weight: 700; color: #6366f1;
    }
    .rp-resend-txt { font-size: 13px; color: #64748b; }
    .rp-resend-link { font-size: 13px; color: #6366f1; font-weight: 600; cursor: pointer; }
    .rp-resend-link:hover { text-decoration: underline; }

    /* Dev OTP */
    .rp-dev-otp {
      background: #f0fdf4; border: 1px solid #bbf7d0;
      border-radius: 12px; padding: 12px 16px;
      animation: slideIn .3s ease both;
    }
    .rp-dev-label { font-size: 11px; font-weight: 700; color: #15803d; margin: 0 0 4px; }
    .rp-dev-code  { font-size: 22px; font-weight: 800; color: #166534; margin: 0; letter-spacing: .2em; }

    /* Toast */
    .rp-toast {
      position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
      z-index: 9999; padding: 12px 24px; border-radius: 12px;
      font-weight: 600; font-size: 14px; white-space: nowrap;
      box-shadow: 0 8px 24px rgba(0,0,0,.12);
      animation: slideIn .3s ease both;
    }
    .rp-toast.success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
    .rp-toast.error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

    /* Divider */
    .rp-divider { display: flex; align-items: center; gap: 12px; margin: 22px 0; }
    .rp-divider-line { flex: 1; height: 1px; background: #e2e8f0; }
    .rp-divider-txt  { font-size: 12px; color: #94a3b8; font-weight: 500; }

    .rp-footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 24px; }
    .rp-footer a { color: #6366f1; text-decoration: none; }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .rp-root { flex-direction: column; }
      .rp-left {
        width: 100%; padding: 24px 20px;
        flex-direction: row; align-items: center;
        justify-content: space-between; gap: 12px;
      }
      .rp-left-top { display: flex; flex-direction: column; gap: 4px; }
      .rp-left-headline { font-size: 18px; margin: 0; }
      .rp-left-sub { display: none; }
      .rp-trust-list { display: none; }
      .rp-review-card { display: none; }
      .rp-right { padding: 28px 20px; }
      .rp-otp-digit { width: 40px; height: 48px; font-size: 1rem; }
    }

    @media (max-width: 400px) {
      .rp-otp-row { gap: 6px; }
      .rp-otp-digit { width: 36px; height: 44px; font-size: .9rem; border-radius: 8px; }
    }
  `}</style>
);

/* ── OTP Input ── */
function OtpInput({ value, onChange, hasError }) {
  const refs = useRef([]);
  const digits = value.padEnd(6, " ").split("");

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const arr = value.split("");
      if (arr[i] && arr[i] !== " ") {
        arr[i] = " ";
      } else if (i > 0) {
        arr[i - 1] = " ";
        refs.current[i - 1]?.focus();
      }
      onChange(arr.join("").trimEnd());
      return;
    }
    if (!/^\d$/.test(e.key)) { e.preventDefault(); return; }
    e.preventDefault();
    const arr = value.padEnd(6, " ").split("");
    arr[i] = e.key;
    onChange(arr.join("").trimEnd());
    if (i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    refs.current[focusIdx]?.focus();
  };

  return (
    <div className="rp-otp-row">
      {[0,1,2,3,4,5].map(i => {
        const ch = digits[i] === " " ? "" : digits[i];
        return (
          <input
            key={i}
            ref={el => refs.current[i] = el}
            className={`rp-otp-digit${ch ? " filled" : ""}${hasError ? " error" : ""}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={ch}
            onChange={() => {}}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
            aria-label={`OTP digit ${i + 1}`}
          />
        );
      })}
    </div>
  );
}

/* ── Countdown timer ring ── */
const RING_CIRC = 81.7;
function TimerRing({ seconds, total }) {
  const offset = ((total - seconds) / total) * RING_CIRC;
  return (
    <div className="rp-timer-circle">
      <svg width="34" height="34" viewBox="0 0 34 34">
        <circle cx="17" cy="17" r="13" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
        <circle
          cx="17" cy="17" r="13" fill="none" stroke="#6366f1" strokeWidth="2.5"
          strokeDasharray={RING_CIRC} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <span className="rp-timer-num">{seconds}</span>
    </div>
  );
}

/* ── Step indicator ── */
function Steps({ step }) {
  const state = (n) =>
    step > n ? "done" : step === n ? "active" : "idle";

  return (
    <div className="rp-steps">
      {[["1", "Mobile"], ["2", "OTP"], ["3", "Dashboard"]].map(([num, label], i) => {
        const s = state(i + 1);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 2 ? "1 1 auto" : "none" }}>
            <div className="rp-step-item">
              <div className={`rp-step-num ${s}`}>{s === "done" ? "✓" : num}</div>
              <span className={`rp-step-label ${s}`}>{label}</span>
            </div>
            {i < 2 && <div className="rp-step-conn" />}
          </div>
        );
      })}
    </div>
  );
}

/* ── Trust points ── */
const trustPoints = [
  { icon: "🛡️", text: "Invoice-verified reviews only" },
  { icon: "🤖", text: "AI moderation catches fakes instantly" },
  { icon: "⭐", text: "Build a trust score customers believe" },
];

/* ── Main Login component ── */
export default function Login() {
  const navigate = useNavigate();

  const [mobile, setMobile]         = useState("");
  const [otp, setOtp]               = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent]       = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [loggingIn, setLoggingIn]   = useState(false);
  const [otpError, setOtpError]     = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [toast, setToast]           = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [step, setStep]             = useState(1);

  const timerRef = useRef(null);

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const startResendTimer = useCallback((secs = 30) => {
    clearInterval(timerRef.current);
    setResendTimer(secs);
    timerRef.current = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => clearInterval(timerRef.current), []);

  /* Phone strength bar width */
  const strengthPct = (mobile.length / 10) * 100;
  const strengthColor = mobile.length === 10 ? "#10b981" : "#6366f1";

  const sendOtp = async () => {
    if (mobile.length !== 10) {
      showToast("error", "Please enter a valid 10-digit mobile number.");
      return;
    }
    setSendingOtp(true);
    try {
      const res = await api.post("/login-send-otp", { mobile });
      if (!res.data.success) { showToast("error", res.data.message); return; }
      setGeneratedOtp(res.data.otp);
      setOtpSent(true);
      setStep(2);
      startResendTimer(30);
      showToast("success", `OTP sent to +91 ${mobile}`);
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Couldn't send OTP. Try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const resendOtp = async () => {
    setOtp("");
    setOtpError(false);
    await sendOtp();
  };

  const login = async () => {
    if (otp.replace(/ /g, "").length !== 6) {
      showToast("error", "Please enter the complete 6-digit OTP.");
      return;
    }
    setLoggingIn(true);
    setOtpError(false);
    try {
      const res = await api.post("/verify-otp", { mobile, otp: otp.replace(/ /g, "") });
      if (!res.data.success) {
        setOtpError(true);
        setOtp("");
        showToast("error", res.data.message);
        return;
      }
      localStorage.setItem("token", res.data.access_token);
      setLoginSuccess(true);
      setStep(3);
      showToast("success", "Welcome back! Redirecting to your dashboard…");
      setTimeout(() => navigate("/dashboard"), 1400);
    } catch (err) {
      setOtpError(true);
      setOtp("");
      showToast("error", err?.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  const otpComplete = otp.replace(/ /g, "").length === 6;

  return (
    <div className="rp-root">
      <Styles />

      {/* Toast */}
      {toast && (
        <div className={`rp-toast ${toast.type}`}>
          {toast.type === "success" ? "✓ " : "✕ "}{toast.msg}
        </div>
      )}

      {/* ── LEFT PANEL ── */}
      <div className="rp-left" aria-hidden="true">
        <div className="rp-left-top">
          <div className="rp-logo-row">
            <div className="rp-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="white"/>
              </svg>
            </div>
            <span className="rp-brand">ReviewPe</span>
          </div>

          <div>
            <p style={{ color: "rgba(255,255,255,.6)", fontSize: 12, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10, marginTop: 36 }}>
              Business Portal
            </p>
            <h2 className="rp-left-headline">Real reviews.<br />Verified with proof.</h2>
            <p className="rp-left-sub">Join 5,000+ Indian businesses building customer trust the right way.</p>
          </div>

          <div className="rp-trust-list">
            {trustPoints.map((p, i) => (
              <div className="rp-trust-item" key={i}>
                <div className="rp-trust-dot">{p.icon}</div>
                <span className="rp-trust-text">{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review card */}
        <div className="rp-review-card">
          <div className="rp-review-row">
            <div className="rp-avatar">DR</div>
            <div>
              <p className="rp-review-name">Deepa R.</p>
              <p className="rp-review-biz">on Rao Textiles</p>
            </div>
            <div className="rp-stars">★★★★★</div>
          </div>
          <p className="rp-review-body">"3x more reviews in a week after getting the QR badge!"</p>
          <span className="rp-verified">✓ Verified Purchase</span>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="rp-right">
        <div className="rp-form-box">

          {/* Back link */}
          <div className="rp-fade-1">
            <Link to="/" className="rp-back">← Back to home</Link>
          </div>

          {/* Header */}
          <div className="rp-fade-2" style={{ marginBottom: 4 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-.5px" }}>
              Welcome back 👋
            </h1>
            <p style={{ color: "#64748b", fontSize: 15, marginTop: 8 }}>
              Log in to your ReviewPe business dashboard.
            </p>
          </div>

          {/* Step indicator */}
          <div className="rp-fade-3">
            <Steps step={step} />
          </div>

          {/* Mobile number */}
          <div className="rp-fade-4" style={{ marginBottom: 14 }}>
            <label className="rp-label" htmlFor="rp-mobile">Mobile Number</label>
            <div className="rp-phone-wrap">
              <span className="rp-prefix">+91</span>
              <input
                id="rp-mobile"
                className={`rp-phone-input${mobile.length === 10 ? " valid" : ""}`}
                type="tel"
                placeholder="98765 43210"
                value={mobile}
                maxLength={10}
                disabled={otpSent}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  if (v.length <= 10) setMobile(v);
                }}
                onKeyDown={(e) => { if (e.key === "Enter" && !otpSent) sendOtp(); }}
              />
            </div>
            {/* Strength bar */}
            <div className="rp-strength-bar">
              <div
                className="rp-strength-fill"
                style={{ width: `${strengthPct}%`, background: strengthColor }}
              />
            </div>
          </div>

          {/* Send OTP / Resend */}
          <div className="rp-fade-5" style={{ marginBottom: 14 }}>
            {!otpSent ? (
              <button
                className="rp-btn-primary"
                onClick={sendOtp}
                disabled={sendingOtp || mobile.length !== 10}
              >
                {sendingOtp ? <><span className="rp-spinner" /> Sending OTP…</> : "Send OTP →"}
              </button>
            ) : (
              <button
                className={`rp-btn-primary${otpSent && !sendingOtp ? " success" : ""}`}
                disabled
              >
                OTP Sent ✓
              </button>
            )}
          </div>

          {/* Dev OTP display */}
          {generatedOtp && (
            <div className="rp-dev-otp rp-slide" style={{ marginBottom: 14 }}>
              <p className="rp-dev-label">🔧 Development mode — OTP</p>
              <p className="rp-dev-code">{generatedOtp}</p>
            </div>
          )}

          {/* OTP entry section */}
          {otpSent && (
            <div className="rp-slide" style={{ marginBottom: 14 }}>
              <div style={{ marginBottom: 12 }}>
                <label className="rp-label">Enter OTP</label>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                  Sent to +91 {mobile}
                </p>
              </div>

              <OtpInput value={otp} onChange={setOtp} hasError={otpError} />

              {/* Timer */}
              {resendTimer > 0 ? (
                <div className="rp-timer-wrap">
                  <TimerRing seconds={resendTimer} total={30} />
                  <span className="rp-resend-txt">
                    Resend OTP in <strong>{resendTimer}s</strong>
                  </span>
                </div>
              ) : (
                <div style={{ textAlign: "center", margin: "12px 0" }}>
                  <span className="rp-resend-link" onClick={resendOtp}>
                    Didn't get it? Resend OTP
                  </span>
                </div>
              )}

              {/* Login button */}
              <button
                className={`rp-btn-primary${loginSuccess ? " success" : ""}`}
                onClick={login}
                disabled={loggingIn || !otpComplete || loginSuccess}
                style={{ marginTop: 4 }}
              >
                {loginSuccess
                  ? "✓ Verified! Redirecting…"
                  : loggingIn
                  ? <><span className="rp-spinner" /> Verifying…</>
                  : "Log in to Dashboard →"}
              </button>
            </div>
          )}

          {/* Divider + Register CTA */}
          <div className="rp-fade-6">
            <div className="rp-divider">
              <div className="rp-divider-line" />
              <span className="rp-divider-txt">New to ReviewPe?</span>
              <div className="rp-divider-line" />
            </div>
            <button className="rp-btn-ghost" onClick={() => navigate("/register")}>
              Register your business now!
            </button>
          </div>

          {/* Footer */}
          <p className="rp-footer">
            By logging in, you agree to ReviewPe's{" "}
            <a href="#">Terms</a> &amp; <a href="#">Privacy Policy</a>
          </p>

        </div>
      </div>
    </div>
  );
}