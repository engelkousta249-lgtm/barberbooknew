"use client"
import { useRouter } from "next/navigation"

export default function OnboardingLanding() {
  const router = useRouter()

  const plans = [
    {
      key: "freemium",
      name: "Freemium",
      price: "€0",
      period: "/μήνα",
      desc: "Ξεκίνα δωρεάν",
      features: ["1 Barber", "20 κρατήσεις/μήνα", "Προφίλ καταστήματος", "Email ειδοποιήσεις"],
      color: "#3b82f6",
      popular: false,
      emoji: "🆓",
    },
    {
      key: "solo",
      name: "Solo",
      price: "€20",
      period: "/μήνα",
      desc: "Για επαγγελματίες",
      features: ["1 Barber", "Απεριόριστες κρατήσεις", "Προφίλ καταστήματος", "Email ειδοποιήσεις"],
      color: "#3b82f6",
      popular: false,
      emoji: "👤",
    },
    {
      key: "duo",
      name: "Duo",
      price: "€24",
      period: "/μήνα",
      desc: "Για 2 barbers",
      features: ["2 Barbers", "Απεριόριστες κρατήσεις", "Προφίλ καταστήματος", "Email ειδοποιήσεις"],
      color: "#f59e0b",
      popular: true,
      emoji: "👥",
    },
    {
      key: "team",
      name: "Team",
      price: "€28",
      period: "/μήνα",
      desc: "Για μεγάλες ομάδες",
      features: ["3-10 Barbers", "Απεριόριστες κρατήσεις", "Προφίλ καταστήματος", "Email ειδοποιήσεις"],
      color: "#10b981",
      popular: false,
      emoji: "🏆",
    },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        :root{
          --bg:#0a0f1e;--card:#111827;--card2:#1a2235;--border:rgba(255,255,255,.07);
          --blue:#3b82f6;--gold:#f59e0b;--green:#10b981;
          --text:#f1f5f9;--muted:#64748b;--muted2:#94a3b8;
        }
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;
          background-image:radial-gradient(ellipse 800px 600px at 50% 0%,rgba(59,130,246,.1),transparent),
          radial-gradient(ellipse 600px 400px at 80% 100%,rgba(245,158,11,.06),transparent);}
        h1,h2{font-family:'Outfit',sans-serif;}
        .nav{position:fixed;top:0;left:0;right:0;z-index:50;height:60px;padding:0 32px;
          display:flex;align-items:center;justify-content:space-between;
          background:rgba(10,15,30,.85);backdrop-filter:blur(16px);
          border-bottom:1px solid var(--border);}
        .brand{font-size:20px;font-weight:800;
          background:linear-gradient(135deg,var(--blue),var(--gold));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;cursor:pointer;}
        .nav-back{color:var(--muted2);font-size:13px;font-weight:500;cursor:pointer;
          background:none;border:none;transition:color .2s;}
        .nav-back:hover{color:var(--text);}
        .main{min-height:100vh;padding:100px 24px 60px;display:flex;flex-direction:column;align-items:center;}
        .header{text-align:center;margin-bottom:48px;}
        .badge{display:inline-flex;align-items:center;gap:6px;
          background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.25);
          border-radius:999px;padding:6px 16px;font-size:12px;font-weight:700;
          color:#93c5fd;letter-spacing:.5px;text-transform:uppercase;margin-bottom:16px;}
        .title{font-size:clamp(2rem,5vw,3rem);font-weight:800;margin-bottom:12px;}
        .title span{background:linear-gradient(135deg,var(--blue),var(--gold));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .subtitle{font-size:15px;color:var(--muted2);line-height:1.7;max-width:480px;margin:0 auto;}
        .plans{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;max-width:1000px;width:100%;}
        .plan-card{background:var(--card);border:1.5px solid var(--border);border-radius:20px;
          padding:28px 22px;position:relative;transition:all .25s;cursor:pointer;display:flex;flex-direction:column;}
        .plan-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,.4);}
        .plan-card.popular{box-shadow:0 0 0 1px var(--gold),0 20px 40px rgba(245,158,11,.15);}
        .popular-badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);
          background:linear-gradient(135deg,var(--gold),#b45309);color:#1a0f00;
          font-size:10px;font-weight:800;padding:4px 14px;border-radius:999px;
          white-space:nowrap;letter-spacing:.5px;}
        .plan-emoji{font-size:36px;margin-bottom:14px;}
        .plan-name{font-family:'Outfit',sans-serif;font-size:22px;font-weight:800;margin-bottom:4px;}
        .plan-price{font-size:32px;font-weight:900;margin-bottom:4px;}
        .plan-price span{font-size:13px;color:var(--muted);font-weight:400;}
        .plan-desc{font-size:12.5px;color:var(--muted);margin-bottom:20px;}
        .plan-features{list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:24px;flex:1;}
        .plan-features li{font-size:13px;color:var(--muted2);display:flex;align-items:center;gap:8px;}
        .plan-features li::before{content:"✓";font-weight:800;flex-shrink:0;}
        .plan-btn{width:100%;padding:13px;border-radius:12px;font-size:14px;font-weight:700;
          cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif;border:none;
          margin-top:auto;}
        .plan-btn:hover{filter:brightness(1.1);transform:translateY(-1px);}
        .compare{margin-top:32px;text-align:center;font-size:13px;color:var(--muted);cursor:pointer;}
        .compare:hover{color:var(--muted2);}
        @media(max-width:900px){.plans{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:500px){.plans{grid-template-columns:1fr;}}
      `}</style>

      <nav className="nav">
        <div className="brand" onClick={() => window.location.href="/"}>BarberBook</div>
        <button className="nav-back" onClick={() => window.location.href="/"}>← Πίσω</button>
      </nav>

      <div className="main">
        <div className="header">
          <div className="badge">✂️ Εγγραφή Κουρείου</div>
          <h1 className="title">Επίλεξε το <span>Πλάνο σου</span></h1>
          <p className="subtitle">Ξεκίνα δωρεάν και αναβάθμισε όποτε θέλεις. Χωρίς δέσμευση.</p>
        </div>

        <div className="plans">
          {plans.map(p => (
            <div key={p.key}
              className={`plan-card ${p.popular?"popular":""}`}
              style={{borderColor: p.popular ? p.color : undefined}}
              onClick={() => router.push(`/onboarding/${p.key}`)}>
              {p.popular && <div className="popular-badge">⭐ Πιο Δημοφιλές</div>}
              <div className="plan-emoji">{p.emoji}</div>
              <div className="plan-name" style={{color: p.color}}>{p.name}</div>
              <div className="plan-price" style={{color: p.color}}>
                {p.price}<span>{p.period}</span>
              </div>
              <div className="plan-desc">{p.desc}</div>
              <ul className="plan-features">
                {p.features.map(f => (
                  <li key={f} style={{color: "var(--muted2)"}}>
                    <span style={{color: p.color}}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className="plan-btn" style={{
                background: p.popular
                  ? `linear-gradient(135deg,${p.color},#b45309)`
                  : `linear-gradient(135deg,${p.color}dd,${p.color}99)`,
                color: p.popular ? "#1a0f00" : "#fff",
              }}>
                Ξεκίνα με {p.name} →
              </button>
            </div>
          ))}
        </div>

        <div className="compare">🔒 Ασφαλής εγγραφή · Ακύρωση οποτεδήποτε · Χωρίς κρυφές χρεώσεις</div>
      </div>
    </>
  )
}