import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const reviews = [
  { name: "Priya S.", initials: "PS", color: "bg-indigo-500", business: "Sharma Electronics", title: "Exactly what I ordered!", body: "Got my laptop repaired here. Invoice matched perfectly, review was approved instantly. Great service.", rating: 5 },
  { name: "Rahul M.", initials: "RM", color: "bg-sky-500", business: "Mehra Garments", title: "Love the verified badge", body: "Seeing the verified checkmark gave me confidence the reviews were real. Will definitely shop here again.", rating: 5 },
  { name: "Sunita K.", initials: "SK", color: "bg-emerald-500", business: "Kapoor Sweets", title: "Trustworthy and transparent", body: "The QR process was super smooth. Uploaded my bill, wrote my review — done in 2 minutes.", rating: 4 },
  { name: "Amit V.", initials: "AV", color: "bg-amber-500", business: "Verma Auto Works", title: "Finally, real reviews!", body: "ReviewPe's invoice verification is a game changer. My business trust score went up in a week.", rating: 5 },
  { name: "Deepa R.", initials: "DR", color: "bg-pink-500", business: "Rao Textiles", title: "Professional and clean", body: "The QR badge looks great on our counter. Customers use it — we've seen a 3x jump in reviews.", rating: 5 },
  { name: "Karan B.", initials: "KB", color: "bg-violet-500", business: "Bhatia Opticals", title: "AI moderation works", body: "A competitor tried leaving fake bad reviews. ReviewPe's AI caught and removed them automatically.", rating: 5 },
];

const testimonials = [
  { quote: "ReviewPe completely changed how customers perceive us. Our trust score jumped in the first month.", name: "Anand Mehta", role: "Owner, Mehta Electronics" },
  { quote: "Fake reviews were killing us. The invoice verification killed the fakes dead.", name: "Preethi R.", role: "Founder, Preethi's Salon" },
  { quote: "Setup took 10 minutes. Now we get 5x more reviews and all of them are real.", name: "Suresh Patel", role: "Manager, Patel Supermart" },
];

/* ── CSS-in-JS for animations Tailwind can't express ── */
const AnimStyles = () => (
  <style>{`
    @keyframes scrollLeft {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes floatY {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-8px); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes pulseRing {
      0%   { box-shadow: 0 0 0 0 rgba(99,102,241,0.5); }
      70%  { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
      100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
    }
    @keyframes badgePop {
      0%   { opacity:0; transform:scale(0.75) translateY(8px); }
      65%  { transform:scale(1.06) translateY(-2px); }
      100% { opacity:1; transform:scale(1) translateY(0); }
    }
    @keyframes countUp {
      from { opacity:0; transform:translateY(12px); }
      to   { opacity:1; transform:translateY(0); }
    }

    .anim-badge    { animation: badgePop  0.55s cubic-bezier(.34,1.56,.64,1) 0.1s  both; }
    .anim-line1    { animation: fadeUp    0.65s ease                          0.25s both; }
    .anim-line2    { animation: fadeUp    0.65s ease                          0.40s both; }
    .anim-sub      { animation: fadeUp    0.65s ease                          0.55s both; }
    .anim-btns     { animation: fadeUp    0.65s ease                          0.68s both; }
    .anim-stats    { animation: fadeUp    0.65s ease                          0.82s both; }

    .shimmer-text {
      background: linear-gradient(90deg, #6366f1 0%, #a5b4fc 45%, #6366f1 90%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s linear infinite;
    }

    .float-icon  { animation: floatY 3.2s ease-in-out infinite; }
    .float-icon2 { animation: floatY 3.5s ease-in-out 0.3s infinite; }
    .float-icon3 { animation: floatY 3.8s ease-in-out 0.6s infinite; }
    .float-icon4 { animation: floatY 4.0s ease-in-out 0.9s infinite; }
    .float-cta   { animation: floatY 3s ease-in-out infinite; }

    .logo-pulse  { animation: pulseRing 2.5s ease infinite; }

    .scroll-track { animation: scrollLeft 32s linear infinite; }

    .fade-up-scroll {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .fade-up-scroll.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `}</style>
);

/* ── hooks ── */
function useCountUp(target, duration = 1600, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, active]);
  return val;
}

function useFadeUp() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ── sub-components ── */
function Stars({ n }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill={i <= n ? "#f59e0b" : "#e5e7eb"}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ r }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 min-w-[300px] max-w-xs flex-shrink-0 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full ${r.color} text-white flex items-center justify-center font-bold text-xs flex-shrink-0`}>
          {r.initials}
        </div>
        <div>
          <p className="font-semibold text-sm text-slate-800">{r.name}</p>
          <p className="text-xs text-slate-500">on <span className="text-indigo-600 font-medium">{r.business}</span></p>
        </div>
      </div>
      <Stars n={r.rating} />
      <p className="font-semibold text-sm text-slate-800 mt-2.5">{r.title}</p>
      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{r.body}</p>
    </div>
  );
}

function StatBox({ target, suffix = "", label, active }) {
  const val = useCountUp(target, 1600, active);
  return (
    <div className="text-center">
      <p className="text-2xl font-extrabold tracking-tight text-slate-900">{val.toLocaleString()}{suffix}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}

/* ── main ── */
export default function Home() {
  const [statsOn, setStatsOn] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStatsOn(true); obs.disconnect(); }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const featRef  = useFadeUp();
  const howRef   = useFadeUp();
  const testRef  = useFadeUp();
  const ctaRef   = useFadeUp();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <AnimStyles />

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="logo-pulse w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="white"/>
              </svg>
            </div>
            <span className="font-extrabold text-xl tracking-tight">ReviewPe</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {["#features", "#how-it-works"].map((href, i) => (
              <a key={href} href={href} className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors relative group">
                {["Features", "How It Works"][i]}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-indigo-500 rounded-full transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
            <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Login</Link>
            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200">
              Register Business
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* glow orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-64 h-64 bg-violet-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
          <div className="anim-badge inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-semibold mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Invoice-verified reviews for Indian businesses
          </div>

          <h1 className="anim-line1 text-6xl md:text-7xl font-black tracking-tighter text-slate-900 leading-none mb-2">
            Real Experiences.
          </h1>
          <h1 className="anim-line2 shimmer-text text-6xl md:text-7xl font-black tracking-tighter leading-none mb-8">
            Verified With Proof.
          </h1>

          <p className="anim-sub max-w-xl mx-auto text-lg text-slate-500 leading-relaxed mb-10">
            ReviewPe helps customers share authentic experiences while helping businesses build trust through invoice verification and AI moderation.
          </p>

          <div className="anim-btns flex flex-wrap gap-3 justify-center">
            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-200">
              Register Your Business
            </Link>
            <Link to="/login" className="bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 font-semibold px-8 py-4 rounded-xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
              Business Login
            </Link>
          </div>

          {/* stats */}
          <div ref={statsRef} className="anim-stats flex items-center justify-center gap-12 mt-16 pt-8 border-t border-slate-100">
            <StatBox target={5000}  suffix="+" label="Businesses"        active={statsOn} />
            <div className="w-px h-8 bg-slate-200" />
            <StatBox target={50000} suffix="+" label="Verified Reviews"  active={statsOn} />
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-2xl font-extrabold tracking-tight text-slate-900">4.9★</p>
              <p className="text-xs text-slate-400 mt-1">Avg Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── REVIEW TICKER ── */}
      <section className="py-4 pb-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 mb-5">
          <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">🔥 Real reviews, live from the platform</p>
        </div>
        <div className="overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <div className="scroll-track flex gap-4" style={{ width: "max-content" }}>
            {[...reviews, ...reviews].map((r, i) => <ReviewCard key={i} r={r} />)}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="bg-slate-50 py-24">
        <div ref={featRef} className="fade-up-scroll max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Why businesses choose ReviewPe</h2>
            <p className="text-slate-500 text-lg">More transparency. More trust. Better customer relationships.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: "🛡️", cls: "float-icon",  title: "Invoice Verification", desc: "Every review is backed by proof of purchase. No more fake or unverified feedback." },
              { icon: "🤖", cls: "float-icon2", title: "AI Moderation",         desc: "Our AI detects spam, abuse, duplicates, and competitor attacks instantly." },
              { icon: "🏢", cls: "float-icon3", title: "GST Verification",      desc: "Verified businesses carry a trust badge that boosts customer confidence." },
              { icon: "⭐", cls: "float-icon4", title: "Trust Score",           desc: "A single score reflecting your credibility — beyond just star ratings." },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-lg hover:shadow-indigo-100 hover:-translate-y-1.5 hover:border-indigo-200 transition-all duration-250 group">
                <div className={`text-4xl mb-4 inline-block ${f.cls}`}>{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24">
        <div ref={howRef} className="fade-up-scroll max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">How ReviewPe works</h2>
            <p className="text-slate-500 text-lg">From QR scan to verified trust — in minutes.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-10">
            {[
              { n:"1", icon:"📋", cls:"float-icon",  title:"Business Registers",  desc:"Sign up and receive a unique ReviewPe QR badge for your store." },
              { n:"2", icon:"📱", cls:"float-icon2", title:"Customer Scans QR",   desc:"After purchase, customers scan and upload their invoice." },
              { n:"3", icon:"🤖", cls:"float-icon3", title:"AI Validates",        desc:"Our AI checks the invoice and moderates the review in seconds." },
              { n:"4", icon:"⭐", cls:"float-icon4", title:"Trust Grows",         desc:"Verified reviews build your trust score and attract more customers." },
            ].map(s => (
              <div key={s.n} className="text-center group">
                <div className={`w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl mx-auto mb-5 shadow-sm group-hover:scale-110 transition-transform duration-200 ${s.cls}`}>
                  {s.icon}
                </div>
                <p className="text-xs font-bold text-indigo-500 tracking-widest uppercase mb-2">Step {s.n}</p>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-slate-50 py-24">
        <div ref={testRef} className="fade-up-scroll max-w-5xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-14">Why businesses love us</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-7 border border-slate-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                <p className="text-4xl font-black text-indigo-400 leading-none mb-3" style={{fontFamily:"Georgia,serif"}}>"</p>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 py-24 px-6 text-center">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div ref={ctaRef} className="fade-up-scroll relative max-w-2xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white leading-tight mb-5">
            Ready to build customer trust?
          </h2>
          <p className="text-indigo-200 text-lg mb-10">
            Join 5,000+ Indian businesses on ReviewPe and showcase verified experiences.
          </p>
          <Link to="/register" className="float-cta inline-block bg-white text-indigo-600 font-extrabold text-base px-10 py-4 rounded-xl shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-200">
            Register Your Business — Free
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="white"/>
                </svg>
              </div>
              <span className="text-white font-bold text-base">ReviewPe</span>
            </div>
            <p className="text-slate-500 text-xs">Verified Experiences. Trusted Businesses.</p>
          </div>
          <p className="text-slate-500 text-xs">© 2026 ReviewPe. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}