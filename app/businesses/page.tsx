"use client"
import { useState } from "react"

export default function BusinessPage() {
  const [openFaq, setOpenFaq] = useState<number|null>(null)

  const faqs = [
    { q: "Είναι δωρεάν;", a: "Το Freemium πλάνο είναι εντελώς δωρεάν για πάντα. Μπορείς να αναβαθμίσεις οποτεδήποτε." },
    { q: "Πόσο χρόνο παίρνει η εγγραφή;", a: "Μόλις 5 λεπτά! Βάζεις τα στοιχεία σου, τις υπηρεσίες και το ωράριο και είσαι online." },
    { q: "Μπορώ να έχω πολλούς barbers;", a: "Ναι! Με το Duo πλάνο έχεις 2 barbers, με το Team έως 10." },
    { q: "Πώς κλείνουν ραντεβού οι πελάτες;", a: "Μέσα από το προφίλ σου στο BarberBook. Μπορείς να βάλεις το link στο Instagram bio σου." },
    { q: "Παίρνω ειδοποιήσεις για νέα ραντεβού;", a: "Ναι! Στέλνουμε email κάθε φορά που κλείνει νέο ραντεβού." },
    { q: "Μπορώ να ακυρώσω οποτεδήποτε;", a: "Φυσικά! Δεν υπάρχει δέσμευση. Ακύρωση με ένα κλικ." },
  ]

  const testimonials = [
    { quote: "Από τότε που μπήκα στο BarberBook, γέμισε το ημερολόγιό μου!", name: "Νίκος Π.", shop: "NickBarber, Αθήνα", emoji: "💈" },
    { quote: "Τέλεια εφαρμογή, οι πελάτες μου αγαπούν το online booking!", name: "Κώστας Μ.", shop: "ClassicCuts, Θεσσαλονίκη", emoji: "✂️" },
    { quote: "Εξοικονόμησα ώρες κάθε εβδομάδα από τηλεφωνήματα.", name: "Γιώργης Σ.", shop: "FadeKing, Ηράκλειο", emoji: "👑" },
  ]

  const plans = [
    { name: "Freemium", price: "€0", period: "/μήνα", desc: "Για να ξεκινήσεις", features: ["1 Barber", "20 κρατήσεις/μήνα", "Προφίλ καταστήματος", "Email ειδοποιήσεις"], featured: false },
    { name: "Solo", price: "€20", period: "/μήνα", desc: "Για επαγγελματίες", features: ["1 Barber", "Απεριόριστες κρατήσεις", "Προφίλ καταστήματος", "Email ειδοποιήσεις"], featured: false },
    { name: "Duo", price: "€24", period: "/μήνα", desc: "Για ζευγάρια barbers", features: ["2 Barbers", "Απεριόριστες κρατήσεις", "Προφίλ καταστήματος", "Email ειδοποιήσεις"], featured: true },
    { name: "Team", price: "€28", period: "/μήνα", desc: "Για μεγάλες ομάδες", features: ["3-10 Barbers", "Απεριόριστες κρατήσεις", "Προφίλ καταστήματος", "Email ειδοποιήσεις"], featured: false },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        :root{
          --navy:#050d1a;--deep:#08142a;--accent:#1e5fff;--glow:#4d8aff;
          --light:#a8c8ff;--white:#f0f6ff;--gold:#c9a84c;--gold2:#f0c040;
          --line:rgba(30,95,255,0.12);
        }
        *{margin:0;padding:0;box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        body{background:var(--navy);color:var(--white);font-family:'Inter',sans-serif;overflow-x:hidden;}

        /* NAV */
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 2rem;height:68px;
          display:flex;align-items:center;justify-content:space-between;
          background:rgba(5,13,26,0.92);backdrop-filter:blur(24px);
          border-bottom:1px solid var(--line);}
        .nav-logo{font-family:'Bebas Neue',sans-serif;font-size:1.7rem;letter-spacing:0.08em;
          background:linear-gradient(120deg,var(--glow),var(--gold));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;cursor:pointer;}
        .btn-ghost{background:none;border:1px solid rgba(168,200,255,0.2);color:var(--light);
          padding:0.5rem 1.1rem;border-radius:2rem;font-size:0.82rem;font-weight:600;
          cursor:pointer;transition:all 0.2s;font-family:'Inter',sans-serif;}
        .btn-ghost:hover{border-color:var(--glow);color:var(--glow);}
        .btn-primary-nav{background:linear-gradient(135deg,#1e5fff,#0a3ab8);border:none;color:#fff;
          padding:0.5rem 1.2rem;border-radius:2rem;font-size:0.82rem;font-weight:700;
          cursor:pointer;transition:all 0.2s;font-family:'Inter',sans-serif;}
        .btn-primary-nav:hover{filter:brightness(1.1);}

        /* HERO */
        .biz-hero{min-height:100vh;display:flex;align-items:center;justify-content:center;
          padding:8rem 2rem 4rem;text-align:center;
          background:radial-gradient(ellipse 120% 80% at 50% 0%,rgba(30,95,255,0.15),transparent 60%),
          radial-gradient(ellipse 60% 60% at 90% 90%,rgba(201,168,76,0.08),transparent 60%),
          var(--navy);}
        .biz-hero-badge{display:inline-flex;align-items:center;gap:0.5rem;
          background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.25);
          border-radius:2rem;padding:0.4rem 1rem;font-size:0.72rem;font-weight:700;
          color:var(--gold);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:1.5rem;}
        .biz-hero-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(3rem,8vw,6rem);
          line-height:0.95;letter-spacing:0.03em;margin-bottom:1rem;}
        .biz-hero-title .hl{background:linear-gradient(120deg,var(--glow),var(--gold2));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .biz-hero-sub{font-size:1rem;color:var(--light);opacity:0.6;line-height:1.8;
          max-width:560px;margin:0 auto 2.5rem;}
        .biz-hero-btns{display:flex;align-items:center;justify-content:center;gap:1rem;flex-wrap:wrap;}
        .btn-big{padding:0.9rem 2rem;border-radius:0.8rem;font-size:0.95rem;font-weight:700;
          cursor:pointer;transition:all 0.2s;font-family:'Inter',sans-serif;}
        .btn-big.primary{background:linear-gradient(135deg,var(--gold),#a87820);
          border:none;color:#1a0f00;box-shadow:0 8px 24px rgba(201,168,76,0.3);}
        .btn-big.primary:hover{filter:brightness(1.1);transform:translateY(-2px);}
        .btn-big.ghost{background:none;border:1px solid rgba(168,200,255,0.2);color:var(--light);}
        .btn-big.ghost:hover{border-color:var(--glow);color:var(--glow);}

        /* STATS */
        .biz-stats{display:flex;justify-content:center;gap:4rem;flex-wrap:wrap;
          padding:3rem 2rem;background:rgba(8,20,42,0.6);
          border-top:1px solid var(--line);border-bottom:1px solid var(--line);}
        .biz-stat{text-align:center;}
        .biz-stat-num{font-family:'Bebas Neue',sans-serif;font-size:2.5rem;
          background:linear-gradient(120deg,var(--glow),var(--gold));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .biz-stat-label{font-size:0.72rem;color:var(--light);opacity:0.5;
          text-transform:uppercase;letter-spacing:0.1em;margin-top:0.2rem;}

        /* FEATURES */
        .features-section{padding:5rem 2rem;}
        .features-inner{max-width:1100px;margin:0 auto;}
        .section-label{font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;
          color:var(--glow);font-weight:700;margin-bottom:0.8rem;}
        .section-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(2rem,4vw,3rem);
          letter-spacing:0.04em;margin-bottom:3rem;}
        .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;}
        .feature-card{background:rgba(8,20,42,0.6);border:1px solid var(--line);
          border-radius:1.2rem;padding:2rem;transition:all 0.25s;}
        .feature-card:hover{border-color:rgba(30,95,255,0.3);transform:translateY(-3px);}
        .feature-icon{font-size:2rem;margin-bottom:1rem;}
        .feature-title{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;
          letter-spacing:0.04em;margin-bottom:0.6rem;}
        .feature-desc{font-size:0.85rem;color:var(--light);opacity:0.55;line-height:1.7;}

        /* PRICING */
        .pricing-section{padding:5rem 2rem;
          background:linear-gradient(135deg,rgba(8,20,42,0.8),var(--navy));}
        .pricing-inner{max-width:1000px;margin:0 auto;}
        .pricing-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-top:3rem;}
        .pricing-card{background:rgba(8,20,42,0.8);border:1px solid var(--line);
          border-radius:1.2rem;padding:1.8rem;position:relative;transition:all 0.25s;}
        .pricing-card:hover{transform:translateY(-3px);}
        .pricing-card.featured{border-color:rgba(201,168,76,0.5);
          background:rgba(201,168,76,0.06);
          box-shadow:0 0 40px rgba(201,168,76,0.1);}
        .pricing-popular{position:absolute;top:-12px;left:50%;transform:translateX(-50%);
          background:linear-gradient(135deg,var(--gold),#a87820);color:#1a0f00;
          font-size:0.65rem;font-weight:800;padding:0.25rem 0.8rem;
          border-radius:2rem;white-space:nowrap;letter-spacing:0.05em;}
        .pricing-name{font-family:'Bebas Neue',sans-serif;font-size:1.5rem;
          letter-spacing:0.05em;margin-bottom:0.5rem;}
        .pricing-price{font-size:2rem;font-weight:900;color:var(--gold);margin-bottom:0.3rem;}
        .pricing-price span{font-size:0.8rem;color:var(--light);opacity:0.5;font-weight:400;}
        .pricing-desc{font-size:0.78rem;color:var(--light);opacity:0.5;margin-bottom:1.5rem;}
        .pricing-features{list-style:none;display:flex;flex-direction:column;gap:0.6rem;}
        .pricing-features li{font-size:0.82rem;color:var(--light);opacity:0.7;
          display:flex;align-items:center;gap:0.5rem;}
        .pricing-features li::before{content:"✓";color:var(--gold);font-weight:700;flex-shrink:0;}
        .pricing-btn{width:100%;margin-top:1.5rem;padding:0.8rem;border-radius:0.7rem;
          font-size:0.85rem;font-weight:700;cursor:pointer;transition:all 0.2s;
          font-family:'Inter',sans-serif;border:1px solid rgba(30,95,255,0.3);
          background:rgba(30,95,255,0.1);color:var(--glow);}
        .pricing-btn:hover{background:rgba(30,95,255,0.2);}
        .pricing-card.featured .pricing-btn{background:linear-gradient(135deg,var(--gold),#a87820);
          border:none;color:#1a0f00;}

        /* TESTIMONIALS */
        .test-section{padding:5rem 2rem;}
        .test-inner{max-width:1000px;margin:0 auto;}
        .test-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;margin-top:2rem;}
        .test-card{background:rgba(8,20,42,0.6);border:1px solid var(--line);
          border-radius:1.2rem;padding:1.8rem;}
        .test-stars{color:var(--gold);font-size:0.9rem;margin-bottom:0.8rem;}
        .test-quote{font-size:0.88rem;color:var(--light);opacity:0.7;line-height:1.7;
          margin-bottom:1.2rem;font-style:italic;}
        .test-author{display:flex;align-items:center;gap:0.8rem;}
        .test-ava{width:38px;height:38px;border-radius:50%;
          background:linear-gradient(135deg,rgba(30,95,255,0.3),rgba(201,168,76,0.2));
          display:flex;align-items:center;justify-content:center;font-size:18px;}
        .test-name{font-size:0.85rem;font-weight:700;}
        .test-shop{font-size:0.72rem;color:var(--light);opacity:0.45;margin-top:2px;}

        /* FAQ */
        .faq-section{padding:5rem 2rem;max-width:700px;margin:0 auto;}
        .faq-item{border-bottom:1px solid var(--line);padding:1.2rem 0;cursor:pointer;}
        .faq-q{display:flex;justify-content:space-between;align-items:center;
          font-size:0.95rem;font-weight:600;}
        .faq-arrow{font-size:1.4rem;color:var(--glow);transition:transform 0.25s;flex-shrink:0;}
        .faq-arrow.open{transform:rotate(45deg);}
        .faq-a{font-size:0.85rem;color:var(--light);opacity:0.6;line-height:1.7;
          max-height:0;overflow:hidden;transition:all 0.3s;margin-top:0;}
        .faq-a.open{max-height:200px;margin-top:0.8rem;}

        /* BOTTOM CTA */
        .biz-bottom-cta{padding:5rem 2rem;text-align:center;
          background:radial-gradient(ellipse 80% 60% at 50% 50%,rgba(30,95,255,0.1),transparent 70%),
          rgba(8,20,42,0.6);}
        .biz-bottom-cta h2{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.5rem,5vw,4rem);
          letter-spacing:0.04em;margin-bottom:1rem;}
        .biz-bottom-cta p{font-size:0.95rem;color:var(--light);opacity:0.55;
          margin-bottom:2rem;max-width:500px;margin-left:auto;margin-right:auto;}
        .biz-cta-row{display:flex;justify-content:center;gap:1rem;flex-wrap:wrap;}

        /* FOOTER */
        footer{padding:2.5rem 2rem;border-top:1px solid var(--line);
          display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;}
        .flogo{font-family:'Bebas Neue',sans-serif;font-size:1.5rem;letter-spacing:0.08em;
          background:linear-gradient(120deg,var(--glow),var(--gold));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .flinks{list-style:none;display:flex;gap:1.5rem;}
        .flinks a{font-size:0.82rem;color:var(--light);opacity:0.45;cursor:pointer;}
        .flinks a:hover{opacity:0.8;}

        @media(max-width:900px){
          .features-grid{grid-template-columns:repeat(2,1fr);}
          .pricing-grid{grid-template-columns:repeat(2,1fr);}
          .test-grid{grid-template-columns:1fr;}
          .biz-stats{gap:2rem;}
        }
        @media(max-width:600px){
          .features-grid{grid-template-columns:1fr;}
          .pricing-grid{grid-template-columns:1fr;}
          .nav{padding:0 1rem;}
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo" onClick={() => window.location.href="/"}>BarberBook</div>
        <div style={{display:"flex",gap:"0.8rem"}}>
          <button className="btn-ghost" onClick={() => window.location.href="/"}>← Αρχική</button>
          <button className="btn-primary-nav" onClick={() => window.location.href="/onboarding"}>Ξεκίνα Δωρεάν</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="biz-hero">
        <div>
          <div className="biz-hero-badge">💼 Για Κουρεία & Barbershops</div>
          <h1 className="biz-hero-title">
            Βάλε το Κουρείο σου<br/>
            <span className="hl">Online Σήμερα</span>
          </h1>
          <p className="biz-hero-sub">
            Διαχειρίσου ραντεβού, ομάδα και πελάτες από ένα dashboard. Απλά, γρήγορα, επαγγελματικά.
          </p>
          <div className="biz-hero-btns">
            <button className="btn-big primary" onClick={() => window.location.href="/onboarding"}>
              🚀 Ξεκίνα Δωρεάν
            </button>
            <button className="btn-big ghost" onClick={() => window.location.href="/"}>
              Δες τα Κουρεία →
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="biz-stats">
        {[
          { num:"400+", label:"Ενεργά Κουρεία" },
          { num:"10K+", label:"Ραντεβού/Μήνα" },
          { num:"50+", label:"Πόλεις" },
          { num:"€0", label:"Για να Ξεκινήσεις" },
        ].map(s => (
          <div key={s.label} className="biz-stat">
            <div className="biz-stat-num">{s.num}</div>
            <div className="biz-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section className="features-section">
        <div className="features-inner">
          <div className="section-label">Γιατί το BarberBook</div>
          <h2 className="section-title">Όλα όσα χρειάζεσαι<br/>σε ένα μέρος</h2>
          <div className="features-grid">
            {[
              { icon:"📅", title:"Online Κρατήσεις", desc:"Οι πελάτες κλείνουν ραντεβού 24/7 χωρίς τηλεφωνήματα. Εσύ δέχεσαι αυτόματες ειδοποιήσεις." },
              { icon:"👥", title:"Διαχείριση Ομάδας", desc:"Πρόσθεσε τους barbers σου και οι πελάτες επιλέγουν ποιον προτιμούν." },
              { icon:"📊", title:"Dashboard", desc:"Δες τα ραντεβού σου, τα έσοδά σου και τη δραστηριότητα του καταστήματος." },
              { icon:"📧", title:"Email Ειδοποιήσεις", desc:"Αυτόματα emails σε εσένα και τον πελάτη για κάθε νέο ραντεβού." },
              { icon:"🖼️", title:"Προφίλ Καταστήματος", desc:"Gallery φωτογραφιών, υπηρεσίες, ωράριο. Όλα σε μια σελίδα για τους πελάτες σου." },
              { icon:"🔗", title:"Link για Bio", desc:"Ένα link για το Instagram bio σου. Οι πελάτες πάνε κατευθείαν στο κουρείο σου." },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing-section">
        <div className="pricing-inner">
          <div className="section-label">Τιμολόγηση</div>
          <h2 className="section-title">Απλά & Διαφανή Πλάνα</h2>
          <div className="pricing-grid">
            {plans.map(p => (
              <div key={p.name} className={`pricing-card ${p.featured?"featured":""}`}>
                {p.featured && <div className="pricing-popular">⭐ Πιο Δημοφιλές</div>}
                <div className="pricing-name">{p.name}</div>
                <div className="pricing-price">{p.price}<span>{p.period}</span></div>
                <div className="pricing-desc">{p.desc}</div>
                <ul className="pricing-features">
                  {p.features.map(f => <li key={f}>{f}</li>)}
                </ul>
                <button className="pricing-btn" onClick={() => window.location.href="/onboarding"}>
                  Ξεκίνα Τώρα
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="test-section">
        <div className="test-inner">
          <div className="section-label">Τι Λένε οι Barbers</div>
          <h2 className="section-title">Αληθινές Ιστορίες</h2>
          <div className="test-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="test-card">
                <div className="test-stars">★★★★★</div>
                <p className="test-quote">«{t.quote}»</p>
                <div className="test-author">
                  <div className="test-ava">{t.emoji}</div>
                  <div>
                    <div className="test-name">{t.name}</div>
                    <div className="test-shop">{t.shop}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="section-label">Συχνές Ερωτήσεις</div>
        <h2 className="section-title">Απορίες;</h2>
        {faqs.map((f, i) => (
          <div key={i} className="faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
            <div className="faq-q">
              {f.q}
              <span className={`faq-arrow ${openFaq === i ? "open" : ""}`}>+</span>
            </div>
            <div className={`faq-a ${openFaq === i ? "open" : ""}`}>{f.a}</div>
          </div>
        ))}
      </section>

      {/* BOTTOM CTA */}
      <section className="biz-bottom-cta">
        <h2>Έτοιμος να Γεμίσεις<br/>το Ημερολόγιό σου;</h2>
        <p>Γίνε μέλος στα 400+ ελληνικά μπαρμπέρικα που μεγαλώνουν με το BarberBook.</p>
        <div className="biz-cta-row">
          <button className="btn-big primary" onClick={() => window.location.href="/onboarding"}>
            🚀 Ξεκίνα Δωρεάν
          </button>
          <button className="btn-big ghost" onClick={() => window.location.href="/"}>
            Δες τα Κουρεία
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div>
          <div className="flogo">BarberBook</div>
          <small style={{fontSize:"0.7rem",color:"var(--light)",opacity:0.3,display:"block",marginTop:"0.2rem"}}>© 2026 BarberBook. Με επιφύλαξη παντός δικαιώματος.</small>
          <small style={{fontSize:"0.7rem",color:"var(--light)",opacity:0.3,display:"block",marginTop:"0.2rem"}}>Made with ❤️ in Greece 🇬🇷</small>
        </div>
        <ul className="flinks">
          <li><a onClick={() => window.location.href="/"}>Αρχική</a></li>
          <li><a onClick={() => window.location.href="/onboarding"}>Εγγραφή</a></li>
        </ul>
      </footer>
    </>
  )
}