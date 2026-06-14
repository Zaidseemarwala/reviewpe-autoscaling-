import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { searchLocations } from "../services/location";

/* ─────────────────────────── STYLES ─────────────────────────── */
const Styles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes slideRight {
      from { transform: translateX(-12px); opacity: 0; }
      to   { transform: translateX(0);     opacity: 1; }
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
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes progressFill {
      from { width: 0; } to { width: var(--prog-w); }
    }
    @keyframes successPop {
      0%  { transform: scale(0.7); opacity: 0; }
      65% { transform: scale(1.08); }
      100%{ transform: scale(1);   opacity: 1; }
    }
    @keyframes floatY {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-6px); }
    }
    @keyframes scanLine {
      0%   { top: 4px; }
      100% { top: calc(100% - 4px); }
    }

    .fade-up   { animation: fadeUp   0.45s ease both; }
    .fade-in   { animation: fadeIn   0.35s ease both; }
    .slide-r   { animation: slideRight 0.35s ease both; }
    .success-pop { animation: successPop 0.55s cubic-bezier(.34,1.56,.64,1) both; }
    .float-el  { animation: floatY 3s ease-in-out infinite; }
    .logo-pulse { animation: pulseRing 2.5s ease infinite; }

    .shimmer-text {
      background: linear-gradient(90deg,#6366f1 0%,#a5b4fc 45%,#6366f1 90%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s linear infinite;
    }

    .left-panel {
      background: linear-gradient(145deg,#4338ca 0%,#6366f1 50%,#7c3aed 100%);
      width: 38%;
      min-width: 320px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 48px 40px;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow: hidden;
    }

    .glass-card {
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.22);
      border-radius: 16px;
      backdrop-filter: blur(8px);
    }

    .right-panel {
      flex: 1;
      background: #f8fafc;
      min-height: 100vh;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 48px 24px 80px;
    }

    .form-card {
      width: 100%;
      max-width: 520px;
    }

    .input-field {
      width: 100%;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 13px 16px;
      font-size: 14px;
      color: #0f172a;
      outline: none;
      background: #fff;
      transition: border-color 0.2s, box-shadow 0.2s;
      font-family: inherit;
    }
    .input-field:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
    }
    .input-field::placeholder { color: #94a3b8; }
    .input-field:read-only { background: #f8fafc; color: #64748b; cursor: default; }
    .input-field.error { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.10); }

    .input-label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: #374151;
      margin-bottom: 6px;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .required-star { color: #ef4444; margin-left: 2px; }

    .btn-primary {
      width: 100%;
      background: #6366f1;
      color: #fff;
      font-weight: 700;
      font-size: 14px;
      padding: 14px;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      font-family: inherit;
    }
    .btn-primary:hover:not(:disabled) {
      background: #4f46e5;
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(99,102,241,0.32);
    }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-ghost {
      width: 100%;
      background: #fff;
      color: #6366f1;
      font-weight: 600;
      font-size: 14px;
      padding: 13px;
      border-radius: 12px;
      border: 1.5px solid #e0e7ff;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .btn-ghost:hover:not(:disabled) {
      background: #eef2ff;
      border-color: #6366f1;
      transform: translateY(-1px);
    }
    .btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-google {
      width: 100%;
      background: #fff;
      color: #374151;
      font-weight: 600;
      font-size: 14px;
      padding: 13px;
      border-radius: 12px;
      border: 1.5px solid #e2e8f0;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .btn-google:hover { border-color: #6366f1; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-1px); }

    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block; flex-shrink: 0;
    }
    .spinner-indigo {
      width: 16px; height: 16px;
      border: 2px solid rgba(99,102,241,0.2);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block; flex-shrink: 0;
    }

    /* Progress bar */
    .progress-track {
      height: 4px;
      background: #e2e8f0;
      border-radius: 99px;
      overflow: hidden;
      margin-bottom: 32px;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg,#6366f1,#7c3aed);
      border-radius: 99px;
      transition: width 0.5s cubic-bezier(.34,1.56,.64,1);
    }

    /* Step indicator */
    .step-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 28px;
    }
    .step-chip {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 12px;
      border-radius: 99px;
      font-size: 12px;
      font-weight: 700;
    }
    .step-chip.active {
      background: #eef2ff;
      color: #4f46e5;
    }
    .step-chip.done {
      background: #f0fdf4;
      color: #16a34a;
    }
    .step-chip.inactive {
      background: #f1f5f9;
      color: #94a3b8;
    }

    /* Location dropdown */
    .location-drop {
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.10);
      overflow: hidden;
      margin-top: 6px;
    }
    .location-item {
      padding: 12px 16px;
      font-size: 13px;
      color: #374151;
      cursor: pointer;
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.15s;
      display: flex; align-items: flex-start; gap: 8px;
    }
    .location-item:last-child { border-bottom: none; }
    .location-item:hover { background: #eef2ff; }

    /* File upload zone */
    .upload-zone {
      border: 2px dashed #c7d2fe;
      border-radius: 12px;
      padding: 28px;
      text-align: center;
      background: #fafafa;
      cursor: pointer;
      transition: all 0.2s;
    }
    .upload-zone:hover, .upload-zone.drag-over {
      border-color: #6366f1;
      background: #eef2ff;
    }
    .upload-zone.has-file {
      border-color: #6366f1;
      background: #eef2ff;
    }

    /* GST processing overlay */
    .gst-processing {
      background: #fff;
      border: 1.5px solid #e0e7ff;
      border-radius: 16px;
      padding: 28px;
      text-align: center;
    }
    .scan-frame {
      width: 80px; height: 80px;
      border: 3px solid #6366f1;
      border-radius: 12px;
      margin: 0 auto 16px;
      position: relative;
      overflow: hidden;
    }
    .scan-line {
      position: absolute;
      left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg,transparent,#6366f1,transparent);
      animation: scanLine 1.4s ease-in-out infinite alternate;
    }

    /* GST result card */
    .gst-result {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 16px 20px;
    }
    .gst-row {
      display: flex; align-items: flex-start;
      gap: 8px;
      padding: 5px 0;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      font-size: 13px;
    }
    .gst-row:last-child { border-bottom: none; }
    .gst-label { color: #64748b; font-weight: 600; min-width: 110px; }
    .gst-value { color: #0f172a; font-weight: 700; }

    /* Match score bar */
    .score-bar {
      height: 8px;
      background: #e2e8f0;
      border-radius: 99px;
      overflow: hidden;
      margin-top: 6px;
    }
    .score-fill {
      height: 100%;
      border-radius: 99px;
      transition: width 1s ease;
    }

    /* OTP boxes */
    .otp-box-wrap { display: flex; gap: 10px; justify-content: center; }
    .otp-box-wrap input {
      width: 46px; height: 54px;
      text-align: center;
      font-size: 1.25rem; font-weight: 700;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      color: #1e293b; background: #fff;
      font-family: inherit;
    }
    .otp-box-wrap input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
    }
    .otp-box-wrap input.filled {
      border-color: #6366f1;
      background: #eef2ff;
    }

    /* Toast */
    .toast {
      position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
      z-index: 9999; padding: 12px 24px; border-radius: 12px;
      font-weight: 600; font-size: 14px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      animation: fadeUp 0.3s ease both;
      white-space: nowrap;
    }

    .field-error {
      font-size: 11px; color: #ef4444; margin-top: 5px; font-weight: 600;
    }

    /* Success page */
    .qr-frame {
      border: 3px solid #6366f1;
      border-radius: 20px;
      padding: 16px;
      background: #fff;
      display: inline-block;
      box-shadow: 0 12px 40px rgba(99,102,241,0.2);
    }

    .tag-badge {
      display: inline-flex; align-items: center; gap: 5px;
      background: #eef2ff; color: #4f46e5;
      padding: 4px 12px; border-radius: 99px;
      font-size: 12px; font-weight: 700;
      border: 1px solid #c7d2fe;
    }

    /* Category custom */
    .cat-other-reveal { animation: fadeUp 0.3s ease both; }

    @media (max-width: 768px) {
      .left-panel { display: none; }
    }
  `}</style>
);

/* ─────────────────────────── HELPERS ─────────────────────────── */
const CATEGORIES = [
  "Pharmacy","Restaurant","Hotel","Clinic","Hospital","Salon",
  "Gym","Retail Store","Electronics","Clothing","Jewellery",
  "Automobile","Beauty & Wellness","Education","Other",
];

const STEPS = [
  { n: 1, label: "Verify Mobile" },
  { n: 2, label: "Business Info" },
  { n: 3, label: "GST & Logo" },
  { n: 4, label: "Done" },
];

function OtpInput({ value, onChange }) {
  const digits = value.padEnd(6, " ").split("");
  const handle = (e, idx) => {
    const d = e.key;
    if (d === "Backspace") {
      const next = value.slice(0, idx === 0 ? 0 : idx) ;
      onChange((value.slice(0,idx-1<0?0:idx-1)+value.slice(idx)).replace(/\D/g,"").slice(0,6));
      if (idx > 0) document.getElementById(`rotp-${idx-1}`)?.focus();
      return;
    }
    if (!/^\d$/.test(d)) return;
    const arr = value.split("");
    arr[idx] = d;
    const next = arr.join("").replace(/\D/g,"").slice(0,6);
    onChange(next);
    if (idx < 5) document.getElementById(`rotp-${idx+1}`)?.focus();
  };
  return (
    <div className="otp-box-wrap">
      {[0,1,2,3,4,5].map(i => (
        <input key={i} id={`rotp-${i}`} type="text" inputMode="numeric" maxLength={1}
          value={digits[i]===" "?"":digits[i]}
          className={digits[i] && digits[i]!==" " ? "filled" : ""}
          onChange={()=>{}}
          onKeyDown={e=>handle(e,i)}
          onPaste={e=>{
            const p=e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
            onChange(p);
            document.getElementById(`rotp-${Math.min(p.length,5)}`)?.focus();
          }}
        />
      ))}
    </div>
  );
}

function FieldError({ msg }) {
  return msg ? <p className="field-error">⚠ {msg}</p> : null;
}

function Tag({ children }) {
  return <span className="tag-badge">{children}</span>;
}

/* ─────────────────────────── MAIN ─────────────────────────── */
export default function Register() {
  const navigate = useNavigate();

  // Step: 1=mobile/otp, 2=business info, 3=gst+logo, 4=success
  const [step, setStep] = useState(1);

  // Mobile / OTP
  const [mobile, setMobile]           = useState("");
  const [otp, setOtp]                 = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent]         = useState(false);
  const [sendingOtp, setSendingOtp]   = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Location
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState([]);
  const [manualAddress, setManualAddress] = useState(false);

  // Files
  const [gstFile, setGstFile]   = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const gstInputRef  = useRef();
  const logoInputRef = useRef();

  // GST processing
  const [gstProcessing, setGstProcessing]   = useState(false);
  const [gstProcessStep, setGstProcessStep] = useState(""); // "uploading"|"extracting"|"verifying"|"done"
  const [gstData, setGstData]               = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  // Logo
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploaded, setLogoUploaded]   = useState(false);

  // Registering
  const [registering, setRegistering] = useState(false);

  // Custom category
  const [customCategory, setCustomCategory] = useState("");

  // Success
  const [successData, setSuccessData] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  // Field errors
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    business_name: "", owner_name: "", mobile: "",
    category: "", address: "", city: "", state: "",
    pincode: "", latitude: null, longitude: null,
    formatted_address: "", email: "", gst_number: "",
    logo_url: "", gst_certificate_url: "",
    gst_verification_status: "PENDING", gst_match_score: 0,
    website: "", description: "",
  });

  /* ── Utilities ── */
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const setField = (key, val) => {
    setFormData(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: "" }));
  };

  const progressPct = { 1: 20, 2: 55, 3: 80, 4: 100 }[step] || 0;

  /* ── Resend timer ── */
  const startResend = () => {
    setResendTimer(30);
    const iv = setInterval(() => setResendTimer(t => { if (t<=1){clearInterval(iv);return 0;} return t-1; }), 1000);
  };

  /* ── Google sign-in simulation ── */
  const handleGoogle = () => {
    // In production: trigger Google OAuth. Here we simulate auto-fill.
    const email = "business@gmail.com";
    setField("email", email);
    showToast("success", "Google account connected — email pre-filled!");
  };

  /* ─── STEP 1: Send OTP ─── */
  const sendOtp = async () => {
    if (mobile.length !== 10) {
      setErrors(p => ({ ...p, mobile: "Enter a valid 10-digit number." }));
      return;
    }
    setErrors(p => ({ ...p, mobile: "" }));
    setSendingOtp(true);
    try {
      const res = await api.post("/send-otp", { mobile });
      setGeneratedOtp(res.data.otp);
      setOtpSent(true);
      startResend();
      showToast("success", `OTP sent to +91 ${mobile}`);
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Couldn't send OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setErrors(p => ({ ...p, otp: "Enter the complete 6-digit OTP." }));
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await api.post("/verify-otp", { mobile, otp });
      if (res.data.success) {
        localStorage.setItem("token", res.data.access_token);
        setField("mobile", mobile);
        showToast("success", "Mobile verified! Let's set up your business.");
        setTimeout(() => setStep(2), 700);
      } else {
        showToast("error", res.data.message || "Invalid OTP.");
      }
    } catch (err) {
      showToast("error", err?.response?.data?.message || "OTP verification failed.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  /* ─── STEP 2: Location search ─── */
  const handleLocationSearch = async (val) => {
    setLocationQuery(val);
    if (val.length < 3) { setLocationResults([]); return; }
    try {
      const data = await searchLocations(val);
      setLocationResults(data.features || []);
    } catch {}
  };

  const selectLocation = (item) => {
    const p = item.properties;
    setFormData(prev => ({
      ...prev,
      address: p.address_line2 || p.formatted,
      city: p.city || "",
      state: p.state || "",
      pincode: p.postcode || "",
      latitude: p.lat,
      longitude: p.lon,
      formatted_address: p.formatted,
    }));
    setLocationQuery(p.formatted);
    setLocationResults([]);
    setManualAddress(false);
    setErrors(p => ({ ...p, address: "" }));
  };

  /* ─── Validate step 2 ─── */
  const validateStep2 = () => {
    const e = {};
    if (!formData.business_name.trim()) e.business_name = "Business name is required.";
    if (!formData.owner_name.trim())    e.owner_name = "Owner name is required.";
    if (!formData.email.trim())         e.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Enter a valid email.";
    if (!formData.category)             e.category = "Select a business category.";
    if (formData.category === "Other" && !customCategory.trim()) e.customCategory = "Please specify your category.";
    if (!formData.formatted_address && !manualAddress) e.address = "Select or enter your location.";
    if (manualAddress && !formData.address.trim()) e.address = "Address is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goToStep3 = () => {
    if (!validateStep2()) return;
    if (formData.category === "Other" && customCategory) {
      setField("category", customCategory);
    }
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ─── STEP 3: Upload GST ─── */
  const uploadGST = async () => {
    if (!gstFile) { showToast("error", "Please select a GST certificate file."); return; }
    setGstProcessing(true);
    setGstData(null);
    setVerificationResult(null);
    try {
      setGstProcessStep("uploading");
      const form = new FormData();
      form.append("file", gstFile);
      const uploadRes = await api.post("/upload-gst", form, { headers: { "Content-Type": "multipart/form-data" } });
      const filePath = uploadRes.data.file_url;
      setField("gst_certificate_url", filePath);

      setGstProcessStep("extracting");
      const extractRes = await api.post(`/extract-gst?file_path=${filePath}`);
      const extracted = extractRes.data.data;
      setGstData(extracted);
      setFormData(prev => ({
        ...prev,
        gst_number:    extracted.gst_number    || "",
        business_name: extracted.business_name || prev.business_name,
      }));

      setGstProcessStep("verifying");
      const verifyRes = await api.post("/verify-gst-address", {
        gst_address:   extracted?.gst_address  || "",
        store_address: formData.formatted_address || "",
      });
      setVerificationResult(verifyRes.data);
      setFormData(prev => ({
        ...prev,
        gst_match_score:        verifyRes.data.match_score,
        gst_verification_status: verifyRes.data.verification_status,
      }));

      setGstProcessStep("done");
      showToast("success", "GST verified successfully!");
    } catch (err) {
      showToast("error", err?.response?.data?.message || "GST verification failed.");
      setGstProcessStep("");
    } finally {
      setGstProcessing(false);
    }
  };

  /* ─── Upload Logo ─── */
  const uploadLogo = async () => {
    if (!logoFile) { showToast("error", "Please select a logo image."); return; }
    setLogoUploading(true);
    try {
      const form = new FormData();
      form.append("file", logoFile);
      const res = await api.post("/upload-logo", form, { headers: { "Content-Type": "multipart/form-data" } });
      setField("logo_url", res.data.file_url);
      setLogoUploaded(true);
      showToast("success", "Logo uploaded!");
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Logo upload failed.");
    } finally {
      setLogoUploading(false);
    }
  };

  /* ─── Register ─── */
  const registerBusiness = async () => {
    setRegistering(true);
    try {
      const payload = { ...formData };
      const res = await api.post("/register-business", payload);
      if (res.data.success) {
        setSuccessData(res.data);
        setStep(4);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        showToast("error", res.data.message || "Registration failed.");
      }
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  /* ─── Score colour ─── */
  const scoreColor = (s) => s >= 80 ? "#16a34a" : s >= 50 ? "#d97706" : "#dc2626";

  /* ─── Process step labels ─── */
  const processLabels = {
    uploading:  "Uploading certificate…",
    extracting: "Reading GST details with AI…",
    verifying:  "Verifying address match…",
    done:       "All done!",
  };

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Styles />

      {/* Toast */}
      {toast && (
        <div className="toast" style={{
          background: toast.type === "success" ? "#f0fdf4" : "#fef2f2",
          color:      toast.type === "success" ? "#15803d" : "#dc2626",
          border: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`,
        }}>
          {toast.type === "success" ? "✓ " : "✕ "}{toast.msg}
        </div>
      )}

      {/* ══ LEFT PANEL ══ */}
      <div className="left-panel">
        {/* Logo */}
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:40 }}>
            <div className="logo-pulse" style={{
              width:40, height:40, borderRadius:12,
              background:"rgba(255,255,255,0.18)", border:"1px solid rgba(255,255,255,0.3)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="white"/>
              </svg>
            </div>
            <span style={{ color:"#fff", fontWeight:800, fontSize:22, letterSpacing:"-0.5px" }}>ReviewPe</span>
          </div>

          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:12, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>
            Business Registration
          </p>
          <h2 style={{ color:"#fff", fontSize:30, fontWeight:800, lineHeight:1.2, letterSpacing:"-0.5px", margin:"0 0 14px" }}>
            Join 5,000+ verified Indian businesses.
          </h2>
          <p style={{ color:"rgba(255,255,255,0.7)", fontSize:14, lineHeight:1.7, marginBottom:36 }}>
            Get your ReviewPe QR badge and start collecting invoice-verified reviews that customers actually trust.
          </p>

          {/* Steps list */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {STEPS.map((s, i) => {
              const done   = step > s.n;
              const active = step === s.n;
              return (
                <div key={s.n} style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{
                    width:32, height:32, borderRadius:"50%", flexShrink:0,
                    background: done   ? "#fff"
                               : active ? "rgba(255,255,255,0.25)"
                               : "rgba(255,255,255,0.08)",
                    border: `1px solid ${done ? "#fff" : active ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)"}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:12, fontWeight:800,
                    color: done ? "#6366f1" : "#fff",
                    transition:"all 0.3s",
                  }}>
                    {done ? "✓" : s.n}
                  </div>
                  <div>
                    <p style={{
                      margin:0,
                      fontSize:13, fontWeight: active ? 700 : 500,
                      color: active || done ? "#fff" : "rgba(255,255,255,0.45)",
                      transition:"all 0.3s",
                    }}>{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom glass card */}
        <div className="glass-card" style={{ padding:"18px 20px" }}>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 8px" }}>
            What you'll get
          </p>
          {["Unique QR badge for your store","Invoice-verified reviews only","AI moderation, auto 24/7","Trust score visible to customers"].map((t,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0" }}>
              <span style={{ fontSize:14, flexShrink:0 }}>✓</span>
              <p style={{ margin:0, fontSize:13, color:"rgba(255,255,255,0.8)", fontWeight:500 }}>{t}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div className="right-panel">
        <div className="form-card">

          {/* Back */}
          {step < 4 && (
            <div style={{ marginBottom:28 }} className="fade-up">
              <Link to="/login" style={{
                display:"inline-flex", alignItems:"center", gap:6,
                color:"#64748b", fontSize:13, fontWeight:600, textDecoration:"none",
                padding:"6px 12px", borderRadius:8, background:"#fff",
                border:"1px solid #e2e8f0",
              }}>
                ← Already registered? Login
              </Link>
            </div>
          )}

          {/* Progress */}
          {step < 4 && (
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          )}

          {/* ══ STEP 1: Mobile + OTP ══ */}
          {step === 1 && (
            <div className="fade-up">
              <p style={{ fontSize:12, fontWeight:700, color:"#6366f1", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Step 1 of 3</p>
              <h1 style={{ fontSize:26, fontWeight:800, color:"#0f172a", margin:"0 0 6px", letterSpacing:"-0.5px" }}>Verify your mobile</h1>
              <p style={{ color:"#64748b", fontSize:14, marginBottom:28 }}>We'll send a 6-digit OTP to confirm your number.</p>

              {/* Google sign-in */}
              <button className="btn-google" onClick={handleGoogle} style={{ marginBottom:20 }}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>

              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
                <div style={{ flex:1, height:1, background:"#e2e8f0" }} />
                <span style={{ fontSize:12, color:"#94a3b8", fontWeight:500 }}>or use mobile OTP</span>
                <div style={{ flex:1, height:1, background:"#e2e8f0" }} />
              </div>

              <div style={{ marginBottom:14 }}>
                <label className="input-label">Mobile Number <span className="required-star">*</span></label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", fontSize:14, fontWeight:600, color:"#94a3b8" }}>+91</span>
                  <input className={`input-field${errors.mobile?" error":""}`} type="tel" placeholder="98765 43210"
                    value={mobile} maxLength={10} style={{ paddingLeft:52 }}
                    onChange={e=>{
                      const v=e.target.value.replace(/\D/g,"");
                      if(v.length<=10) setMobile(v);
                      if(errors.mobile) setErrors(p=>({...p,mobile:""}));
                    }}
                    onKeyDown={e=>{ if(e.key==="Enter"&&!otpSent) sendOtp(); }}
                  />
                </div>
                <FieldError msg={errors.mobile} />
              </div>

              {!otpSent ? (
                <button className="btn-primary" onClick={sendOtp} disabled={sendingOtp||mobile.length!==10} style={{ marginBottom:16 }}>
                  {sendingOtp ? <><span className="spinner"/>Sending OTP…</> : "Send OTP →"}
                </button>
              ) : (
                <button className="btn-ghost" onClick={sendOtp} disabled={sendingOtp||resendTimer>0} style={{ marginBottom:16 }}>
                  {sendingOtp ? "Resending…" : resendTimer>0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                </button>
              )}

              {/* Dev OTP */}
              {generatedOtp && (
                <div className="fade-in" style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
                  <p style={{ fontSize:11, fontWeight:700, color:"#15803d", margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.06em" }}>🔧 Dev mode OTP</p>
                  <p style={{ fontSize:24, fontWeight:800, color:"#166534", margin:0, letterSpacing:"0.18em" }}>{generatedOtp}</p>
                </div>
              )}

              {otpSent && (
                <div className="fade-in">
                  <div style={{ marginBottom:12 }}>
                    <label className="input-label">Enter OTP <span className="required-star">*</span></label>
                    <p style={{ fontSize:12, color:"#64748b", margin:"0 0 14px" }}>6-digit code sent to +91 {mobile}</p>
                  </div>
                  <OtpInput value={otp} onChange={setOtp} />
                  <FieldError msg={errors.otp} />
                  <button className="btn-primary" onClick={verifyOtp} disabled={verifyingOtp||otp.length!==6} style={{ marginTop:18 }}>
                    {verifyingOtp ? <><span className="spinner"/>Verifying…</> : "Verify & Continue →"}
                  </button>
                </div>
              )}

              <p style={{ textAlign:"center", fontSize:12, color:"#94a3b8", marginTop:24 }}>
                Already registered?{" "}
                <Link to="/login" style={{ color:"#6366f1", fontWeight:700, textDecoration:"none" }}>Login here</Link>
              </p>
            </div>
          )}

          {/* ══ STEP 2: Business Details ══ */}
          {step === 2 && (
            <div className="fade-up">
              <p style={{ fontSize:12, fontWeight:700, color:"#6366f1", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Step 2 of 3</p>
              <h1 style={{ fontSize:26, fontWeight:800, color:"#0f172a", margin:"0 0 6px", letterSpacing:"-0.5px" }}>Tell us about your business</h1>
              <p style={{ color:"#64748b", fontSize:14, marginBottom:28 }}>This info will appear on your public ReviewPe profile.</p>

              {/* Google email connect */}
              <div style={{ background:"#eef2ff", border:"1px solid #c7d2fe", borderRadius:12, padding:"14px 16px", marginBottom:24, display:"flex", alignItems:"center", gap:12 }}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                <div style={{ flex:1 }}>
                  <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#4f46e5" }}>Connect Google to auto-fill email</p>
                  <p style={{ margin:0, fontSize:12, color:"#6366f1" }}>{formData.email || "Not connected"}</p>
                </div>
                <button className="btn-ghost" onClick={handleGoogle} style={{ width:"auto", padding:"6px 14px", fontSize:12 }}>
                  {formData.email ? "Change" : "Connect"}
                </button>
              </div>

              {/* Business name */}
              <div style={{ marginBottom:16 }}>
                <label className="input-label">Business Name <span className="required-star">*</span></label>
                <input className={`input-field${errors.business_name?" error":""}`} placeholder="e.g. Sharma Electronics" value={formData.business_name}
                  onChange={e=>setField("business_name",e.target.value)} />
                <FieldError msg={errors.business_name} />
              </div>

              {/* Owner name */}
              <div style={{ marginBottom:16 }}>
                <label className="input-label">Owner / Manager Name <span className="required-star">*</span></label>
                <input className={`input-field${errors.owner_name?" error":""}`} placeholder="e.g. Rajesh Sharma" value={formData.owner_name}
                  onChange={e=>setField("owner_name",e.target.value)} />
                <FieldError msg={errors.owner_name} />
              </div>

              {/* Email */}
              <div style={{ marginBottom:16 }}>
                <label className="input-label">Business Email <span className="required-star">*</span></label>
                <input className={`input-field${errors.email?" error":""}`} type="email" placeholder="you@business.com" value={formData.email}
                  onChange={e=>setField("email",e.target.value)} />
                <FieldError msg={errors.email} />
              </div>

              {/* Category */}
              <div style={{ marginBottom:16 }}>
                <label className="input-label">Business Category <span className="required-star">*</span></label>
                <select className={`input-field${errors.category?" error":""}`} value={formData.category}
                  onChange={e=>{ setField("category",e.target.value); setCustomCategory(""); }}>
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
                <FieldError msg={errors.category} />
              </div>
              {formData.category === "Other" && (
                <div className="cat-other-reveal" style={{ marginBottom:16 }}>
                  <label className="input-label">Specify Your Category <span className="required-star">*</span></label>
                  <input className={`input-field${errors.customCategory?" error":""}`} placeholder="e.g. Bakery, Bookshop…" value={customCategory}
                    onChange={e=>{ setCustomCategory(e.target.value); if(errors.customCategory) setErrors(p=>({...p,customCategory:""})); }} />
                  <FieldError msg={errors.customCategory} />
                </div>
              )}

              {/* Location */}
              <div style={{ marginBottom:8 }}>
                <label className="input-label">Store Location <span className="required-star">*</span></label>
                <input className={`input-field${errors.address?" error":""}`} placeholder="Search your store address…"
                  value={locationQuery}
                  onChange={e=>handleLocationSearch(e.target.value)} />
                <FieldError msg={errors.address} />
              </div>
              {locationResults.length > 0 && (
                <div className="location-drop fade-in" style={{ marginBottom:12 }}>
                  {locationResults.map((item,i)=>(
                    <div key={i} className="location-item" onClick={()=>selectLocation(item)}>
                      <span style={{ fontSize:16, flexShrink:0 }}>📍</span>
                      <span>{item.properties.formatted}</span>
                    </div>
                  ))}
                </div>
              )}
              {formData.formatted_address && !manualAddress && (
                <div className="fade-in" style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, padding:"10px 14px", marginBottom:12, fontSize:13, color:"#166534", display:"flex", gap:8, alignItems:"flex-start" }}>
                  <span style={{ flexShrink:0 }}>✓</span>
                  <span>{formData.formatted_address}</span>
                </div>
              )}
              {!manualAddress && (
                <button style={{ background:"none", border:"none", color:"#6366f1", fontSize:12, fontWeight:700, cursor:"pointer", padding:"4px 0", marginBottom:16 }}
                  onClick={()=>{ setManualAddress(true); setLocationResults([]); }}>
                  Can't find your address? Enter manually →
                </button>
              )}
              {manualAddress && (
                <div className="cat-other-reveal" style={{ marginBottom:16 }}>
                  <div style={{ display:"grid", gap:12 }}>
                    <input className="input-field" placeholder="Full Address" value={formData.address} onChange={e=>setField("address",e.target.value)} />
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                      <input className="input-field" placeholder="City" value={formData.city} onChange={e=>setField("city",e.target.value)} />
                      <input className="input-field" placeholder="State" value={formData.state} onChange={e=>setField("state",e.target.value)} />
                    </div>
                    <input className="input-field" placeholder="Pincode" value={formData.pincode} maxLength={6} onChange={e=>setField("pincode",e.target.value.replace(/\D/g,""))} />
                  </div>
                </div>
              )}

              {/* Optional */}
              <div style={{ marginBottom:16 }}>
                <label className="input-label">Website <span style={{ color:"#94a3b8", fontWeight:400, fontSize:11 }}>(optional)</span></label>
                <input className="input-field" placeholder="https://yourbusiness.com" value={formData.website} onChange={e=>setField("website",e.target.value)} />
              </div>
              <div style={{ marginBottom:24 }}>
                <label className="input-label">Business Description <span style={{ color:"#94a3b8", fontWeight:400, fontSize:11 }}>(optional)</span></label>
                <textarea className="input-field" rows={3} placeholder="Briefly describe what your business does…" value={formData.description}
                  onChange={e=>setField("description",e.target.value)} style={{ resize:"vertical", lineHeight:1.6 }} />
              </div>

              <button className="btn-primary" onClick={goToStep3}>
                Continue to GST &amp; Logo →
              </button>
            </div>
          )}

          {/* ══ STEP 3: GST + Logo ══ */}
          {step === 3 && (
            <div className="fade-up">
              <p style={{ fontSize:12, fontWeight:700, color:"#6366f1", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Step 3 of 3</p>
              <h1 style={{ fontSize:26, fontWeight:800, color:"#0f172a", margin:"0 0 6px", letterSpacing:"-0.5px" }}>GST Verification &amp; Logo</h1>
              <p style={{ color:"#64748b", fontSize:14, marginBottom:28 }}>Upload your GST certificate — our AI will read and verify it automatically.</p>

              {/* ── GST Upload zone ── */}
              {!gstProcessing && !gstData && (
                <div>
                  <label className="input-label" style={{ marginBottom:10 }}>GST Certificate <span style={{ color:"#94a3b8", fontWeight:400, fontSize:11 }}>(PDF, PNG, JPG)</span></label>
                  <div className={`upload-zone${gstFile?" has-file":""}`}
                    onClick={()=>gstInputRef.current?.click()}
                    onDragOver={e=>{e.preventDefault();}}
                    onDrop={e=>{e.preventDefault(); const f=e.dataTransfer.files[0]; if(f) setGstFile(f);}}>
                    <div style={{ fontSize:32, marginBottom:10 }}>📄</div>
                    <p style={{ fontSize:14, fontWeight:700, color: gstFile?"#4f46e5":"#374151", margin:"0 0 4px" }}>
                      {gstFile ? gstFile.name : "Click or drag your GST certificate here"}
                    </p>
                    <p style={{ fontSize:12, color:"#94a3b8", margin:0 }}>PDF, PNG or JPG · Max 10MB</p>
                    <input ref={gstInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display:"none" }}
                      onChange={e=>setGstFile(e.target.files[0])} />
                  </div>
                  <div style={{ display:"flex", gap:12, marginTop:16 }}>
                    {gstFile && (
                      <button className="btn-primary" onClick={uploadGST}>
                        Upload &amp; Verify with AI →
                      </button>
                    )}
                    <button className="btn-ghost" onClick={()=>setStep(3.5||"logo")} style={{ flex: gstFile?"0 0 auto":"1", width:"auto", padding:"13px 20px" }}
                      onClick={()=>{
                        // Skip GST, go straight to logo section – represented by setting a flag
                        setGstProcessStep("skipped");
                      }}>
                      Skip GST for now
                    </button>
                  </div>
                </div>
              )}

              {/* ── Processing indicator ── */}
              {gstProcessing && (
                <div className="gst-processing fade-in">
                  <div className="scan-frame">
                    <div className="scan-line" />
                    <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12h6M9 16h6M9 8h6M5 3H3v18h18V3h-2" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <p style={{ fontWeight:800, fontSize:16, color:"#0f172a", margin:"0 0 6px" }}>
                    {processLabels[gstProcessStep] || "Processing…"}
                  </p>
                  <p style={{ fontSize:13, color:"#64748b", margin:"0 0 20px" }}>
                    This takes just a few seconds
                  </p>
                  {/* Step pills */}
                  <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
                    {["uploading","extracting","verifying"].map((s,i)=>{
                      const states=["uploading","extracting","verifying","done"];
                      const cur=states.indexOf(gstProcessStep);
                      const sIdx=states.indexOf(s);
                      const done2=cur>sIdx, active=cur===sIdx;
                      return (
                        <span key={s} style={{
                          display:"flex", alignItems:"center", gap:5,
                          padding:"5px 12px", borderRadius:99, fontSize:12, fontWeight:700,
                          background: done2?"#f0fdf4" : active?"#eef2ff" : "#f1f5f9",
                          color:       done2?"#16a34a" : active?"#4f46e5" : "#94a3b8",
                          border:`1px solid ${done2?"#bbf7d0":active?"#c7d2fe":"#e2e8f0"}`,
                        }}>
                          {done2 ? "✓" : active ? <span className="spinner-indigo"/> : i+1}
                          {["Upload","AI Extract","Verify"][i]}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── GST Result ── */}
              {gstData && !gstProcessing && (
                <div className="fade-in" style={{ marginBottom:24 }}>
                  <div className="gst-result" style={{ marginBottom:16 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                      <span style={{ fontSize:20 }}>✅</span>
                      <p style={{ margin:0, fontWeight:800, color:"#15803d", fontSize:15 }}>GST Certificate Read Successfully</p>
                    </div>
                    {[["GST Number",gstData.gst_number],["Business Name",gstData.business_name],["Registered Address",gstData.gst_address]].map(([l,v])=>
                      v ? (
                        <div key={l} className="gst-row">
                          <span className="gst-label">{l}</span>
                          <span className="gst-value">{v}</span>
                        </div>
                      ) : null
                    )}
                  </div>

                  {verificationResult && (
                    <div className="fade-in" style={{ background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"16px 20px" }}>
                      <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:700, color:"#374151" }}>Address Match Score</p>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ flex:1 }}>
                          <div className="score-bar">
                            <div className="score-fill" style={{
                              width:`${verificationResult.match_score}%`,
                              background: scoreColor(verificationResult.match_score),
                            }}/>
                          </div>
                        </div>
                        <span style={{ fontSize:18, fontWeight:800, color:scoreColor(verificationResult.match_score) }}>
                          {verificationResult.match_score}%
                        </span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8 }}>
                        <span style={{
                          padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700,
                          background: verificationResult.verification_status==="VERIFIED"?"#f0fdf4":"#fefce8",
                          color:       verificationResult.verification_status==="VERIFIED"?"#15803d":"#a16207",
                          border:`1px solid ${verificationResult.verification_status==="VERIFIED"?"#bbf7d0":"#fde68a"}`,
                        }}>
                          {verificationResult.verification_status}
                        </span>
                        <span style={{ fontSize:12, color:"#64748b" }}>{verificationResult.verification_status==="VERIFIED"?"Address matches your store location":"Low match — please verify manually"}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Logo Upload ── */}
              {(gstData || gstProcessStep === "skipped") && !gstProcessing && (
                <div className="fade-in" style={{ marginTop:24, paddingTop:24, borderTop:"1.5px solid #f1f5f9" }}>
                  <label className="input-label" style={{ marginBottom:10 }}>
                    Business Logo <span style={{ color:"#94a3b8", fontWeight:400, fontSize:11 }}>(optional but recommended)</span>
                  </label>
                  <div className={`upload-zone${logoFile?" has-file":""}`}
                    onClick={()=>!logoUploaded&&logoInputRef.current?.click()}>
                    {logoUploaded ? (
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                        <div style={{ width:56, height:56, borderRadius:12, background:"#eef2ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>🖼️</div>
                        <p style={{ margin:0, fontWeight:700, color:"#4f46e5", fontSize:14 }}>Logo uploaded ✓</p>
                        <p style={{ margin:0, fontSize:12, color:"#94a3b8" }}>{logoFile?.name}</p>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize:32, marginBottom:10 }}>🖼️</div>
                        <p style={{ fontSize:14, fontWeight:700, color:logoFile?"#4f46e5":"#374151", margin:"0 0 4px" }}>
                          {logoFile ? logoFile.name : "Click to upload your logo"}
                        </p>
                        <p style={{ fontSize:12, color:"#94a3b8", margin:0 }}>PNG, JPG · Recommended 400×400px</p>
                      </>
                    )}
                    <input ref={logoInputRef} type="file" accept="image/*" style={{ display:"none" }}
                      onChange={e=>{ setLogoFile(e.target.files[0]); setLogoUploaded(false); }} />
                  </div>

                  {logoFile && !logoUploaded && (
                    <button className="btn-ghost" onClick={uploadLogo} disabled={logoUploading} style={{ marginTop:12 }}>
                      {logoUploading ? <><span className="spinner-indigo"/>Uploading…</> : "Upload Logo"}
                    </button>
                  )}
                </div>
              )}

              {/* ── Submit ── */}
              {(gstData || gstProcessStep === "skipped") && !gstProcessing && (
                <div className="fade-in" style={{ marginTop:28 }}>
                  <button className="btn-primary" onClick={registerBusiness} disabled={registering}>
                    {registering ? <><span className="spinner"/>Registering your business…</> : "Complete Registration 🎉"}
                  </button>
                  <p style={{ fontSize:12, color:"#94a3b8", textAlign:"center", marginTop:12 }}>
                    By registering, you agree to ReviewPe's{" "}
                    <a href="#" style={{ color:"#6366f1", textDecoration:"none" }}>Terms</a> &amp;{" "}
                    <a href="#" style={{ color:"#6366f1", textDecoration:"none" }}>Privacy Policy</a>
                  </p>
                </div>
              )}

              {/* Back */}
              <button style={{ background:"none", border:"none", color:"#94a3b8", fontSize:13, cursor:"pointer", marginTop:16, padding:"4px 0" }}
                onClick={()=>setStep(2)}>
                ← Back to Business Info
              </button>
            </div>
          )}

          {/* ══ STEP 4: Success ══ */}
          {step === 4 && successData && (
            <div className="fade-up" style={{ textAlign:"center", paddingTop:16 }}>
              <div className="success-pop" style={{ fontSize:64, marginBottom:8 }}>🎉</div>
              <h1 style={{ fontSize:28, fontWeight:800, color:"#0f172a", margin:"0 0 8px", letterSpacing:"-0.5px" }}>
                You're on ReviewPe!
              </h1>
              <p style={{ color:"#64748b", fontSize:15, marginBottom:28 }}>
                Your business is live. Customers can now scan your QR code to leave verified reviews.
              </p>

              {/* ID + badges */}
              <div style={{ display:"flex", justifyContent:"center", gap:10, flexWrap:"wrap", marginBottom:28 }}>
                <Tag>✓ GST Verified</Tag>
                <Tag>⭐ Trust Score Active</Tag>
                <Tag>📱 QR Ready</Tag>
              </div>

              {/* Business ID */}
              <div style={{ background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:14, padding:"16px 24px", marginBottom:28, display:"inline-block", minWidth:280 }}>
                <p style={{ margin:"0 0 4px", fontSize:12, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em" }}>Your ReviewPe ID</p>
                <p style={{ margin:0, fontSize:22, fontWeight:800, color:"#4f46e5", letterSpacing:"0.08em" }}>
                  {successData.reviewpe_business_id}
                </p>
              </div>

              {/* QR code */}
              <div style={{ marginBottom:28 }}>
                <p style={{ fontSize:13, fontWeight:700, color:"#374151", marginBottom:14 }}>Print & display this at your store</p>
                <div className="qr-frame float-el" style={{ display:"inline-block" }}>
                  <img
                    src={`http://127.0.0.1:8000/${successData.qr_code_url}`}
                    alt="Your ReviewPe QR Code"
                    style={{ width:180, height:180, display:"block" }}
                  />
                </div>
                <p style={{ fontSize:12, color:"#94a3b8", marginTop:12 }}>Customers scan this to leave a verified review</p>
              </div>

              {/* CTA */}
              <button className="btn-primary" onClick={()=>navigate("/dashboard")} style={{ maxWidth:340, margin:"0 auto" }}>
                Go to My Dashboard →
              </button>
              <p style={{ fontSize:12, color:"#94a3b8", marginTop:12 }}>
                You can download and print your QR from the dashboard anytime.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}