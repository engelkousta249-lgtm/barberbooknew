"use client"
import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://xcfkhdjiragblsiqetes.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZmtoZGppcmFnYmxzaXFldGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTY0ODYsImV4cCI6MjA5NzI3MjQ4Nn0.EkmgRuYzrvF0A_pgT9vaOouMRKeQ2kasPZxpoIuCgeE"
)

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  // Step 1 - Account
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Step 2 - Shop Info
  const [shopName, setShopName] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")

  // Step 3 - Services
  const [services, setServices] = useState([
    { name: "Κούρεμα", duration: 30, price: 15 },
    { name: "Κούρεμα + Γένια", duration: 45, price: 22 },
  ])

  // Step 4 - Hours
  const [hours, setHours] = useState([
    { day: "Δευτέρα", active: true, open: "09:00", close: "19:00" },
    { day: "Τρίτη", active: true, open: "09:00", close: "19:00" },
    { day: "Τετάρτη", active: true, open: "09:00", close: "19:00" },
    { day: "Πέμπτη", active: true, open: "09:00", close: "21:00" },
    { day: "Παρασκευή", active: true, open: "09:00", close: "21:00" },
    { day: "Σάββατο", active: true, open: "10:00", close: "16:00" },
    { day: "Κυριακή", active: false, open: "", close: "" },
  ])

  const cities = ["Αθήνα","Θεσσαλονίκη","Πάτρα","Ηράκλειο","Λάρισα","Βόλος","Ιωάννινα","Χανιά","Ρόδος","Κέρκυρα"]

  async function handleFinish() {
    setLoading(true)
    setError("")

    try {
      // 1. Δημιουργία account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      })
      if (authError) { setError(authError.message); setLoading(false); return }

      const userId = authData.user?.id
      if (!userId) { setError("Σφάλμα εγγραφής!"); setLoading(false); return }

      // 2. Δημιουργία barbershop
      const { data: shopData, error: shopError } = await supabase
        .from("barbershops")
        .insert({
          name: shopName,
          city,
          address,
          phone,
          email,
          description: "",
          rating: 5.0,
        })
        .select()
        .single()

      if (shopError) { setError("Σφάλμα δημιουργίας κουρείου!"); setLoading(false); return }

      // 3. Update profile — owner + barbershop_id
      await supabase.from("profiles").upsert({
        id: userId,
        full_name: fullName,
        role: "owner",
        barbershop_id: shopData.id,
      })

      setDone(true)
    } catch (e) {
      setError("Κάτι πήγε στραβά!")
    }
    setLoading(false)
  }

  const steps = [
    { num: 1, label: "Λογαριασμός" },
    { num: 2, label: "Κουρείο" },
    { num: 3, label: "Υπηρεσίες" },
    { num: 4, label: "Ωράριο" },
  ]

  const canNext =
    (step === 1 && fullName.trim() && email.trim() && password.length >= 6) ||
    (step === 2 && shopName.trim() && city && address.trim() && phone.trim()) ||
    step === 3 ||
    step === 4

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        :root{--navy:#070c16;--navy-800:#0b1424;--navy-700:#101c33;--blue:#3b7bff;--blue-soft:rgba(59,123,255,.14);--gold:#d4af37;--text:#eaeef6;--muted:#8a97ac;--line:rgba(255,255,255,.08);--green:#3ecf8e;--red:#ff5c72;}
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Inter',sans-serif;background:radial-gradient(900px 500px at 80% -10%,rgba(59,123,255,.1),transparent 60%),var(--navy);color:var(--text);min-height:100vh;}
        .wrap{max-width:560px;margin:0 auto;padding:32px 20px 80px;}
        .logo{font-family:'Outfit',sans-serif;font-size:1.6rem;font-weight:800;background:linear-gradient(120deg,#3b7bff,#d4af37);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:28px;display:block;}
        .progress{display:flex;align-items:center;gap:6px;margin-bottom:28px;}
        .prog-step{display:flex;align-items:center;gap:6px;flex:1;}
        .prog-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;transition:all .25s;border:1.5px solid var(--line);color:var(--muted);background:var(--navy-700);}
        .prog-dot.active{background:var(--blue);border-color:var(--blue);color:#fff;}
        .prog-dot.done{background:var(--green);border-color:var(--green);color:var(--navy);}
        .prog-label{font-size:11px;color:var(--muted);font-weight:600;}
        .prog-label.active{color:#cfe0ff;}
        .prog-label.done{color:var(--green);}
        .prog-line{flex:1;height:2px;background:var(--line);margin:0 4px;}
        .prog-line.done{background:var(--green);}
        .panel{background:var(--navy-800);border:1px solid var(--line);border-radius:18px;padding:24px;}
        .panel h2{font-family:'Outfit',sans-serif;font-size:18px;font-weight:700;margin-bottom:4px;}
        .panel .sub{font-size:13px;color:var(--muted);margin-bottom:22px;}
        .field{margin-bottom:14px;}
        .field label{display:block;font-size:11.5px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.3px;margin-bottom:6px;}
        .field input,.field select{width:100%;background:var(--navy-700);border:1px solid var(--line);border-radius:10px;padding:12px 13px;font-size:14px;color:var(--text);font-family:'Inter',sans-serif;transition:.15s;outline:none;}
        .field input:focus,.field select:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(59,123,255,.15);}
        .field input::placeholder{color:var(--muted);}
        .field-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        .error-box{background:rgba(255,92,114,.1);border:1px solid rgba(255,92,114,.3);border-radius:10px;padding:10px 14px;font-size:13px;color:var(--red);margin-bottom:14px;}
        .svc-row{display:grid;grid-template-columns:1fr 80px 80px 32px;gap:8px;align-items:center;margin-bottom:10px;}
        .svc-input{background:var(--navy-700);border:1px solid var(--line);border-radius:8px;padding:9px 10px;font-size:13px;color:var(--text);font-family:'Inter',sans-serif;width:100%;outline:none;}
        .svc-input:focus{border-color:var(--blue);}
        .svc-input.gold{color:var(--gold);font-weight:700;}
        .svc-labels{display:grid;grid-template-columns:1fr 80px 80px 32px;gap:8px;font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.3px;font-weight:600;margin-bottom:8px;}
        .icon-btn{width:30px;height:30px;border-radius:8px;border:1px solid var(--line);background:var(--navy-700);color:var(--red);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;}
        .icon-btn:hover{border-color:var(--red);}
        .add-btn{width:100%;padding:10px;border-radius:10px;border:1.5px dashed var(--line);background:none;color:var(--muted);font-size:13px;font-weight:600;cursor:pointer;margin-top:4px;font-family:'Inter',sans-serif;transition:.15s;}
        .add-btn:hover{border-color:var(--blue);color:var(--blue);}
        .hour-row{display:flex;align-items:center;gap:10px;padding:10px;border-radius:10px;background:var(--navy-700);margin-bottom:8px;}
        .hour-row.off{opacity:.5;}
        .hour-day{font-size:13px;font-weight:700;width:80px;flex-shrink:0;}
        .hour-input{background:var(--navy-800);border:1px solid var(--line);border-radius:8px;padding:7px 8px;font-size:12.5px;color:var(--text);font-family:'Inter',sans-serif;outline:none;}
        .hour-input:focus{border-color:var(--blue);}
        .hour-sep{color:var(--muted);font-size:12px;}
        .hour-closed{font-size:12px;color:var(--muted);flex:1;}
        .toggle{width:36px;height:20px;border-radius:999px;border:1px solid var(--line);background:var(--navy-800);position:relative;cursor:pointer;flex-shrink:0;margin-left:auto;}
        .toggle::after{content:'';position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--muted);transition:.15s;}
        .toggle.on{background:rgba(59,123,255,.3);border-color:var(--blue);}
        .toggle.on::after{left:18px;background:var(--blue);}
        .bottom-bar{position:fixed;bottom:0;left:0;right:0;background:var(--navy-800);border-top:1px solid var(--line);padding:12px 20px;display:flex;justify-content:center;z-index:10;}
        .bottom-in{max-width:560px;width:100%;display:flex;gap:10px;}
        .btn{padding:13px 24px;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:.15s;border:1px solid var(--line);background:var(--navy-700);color:var(--text);}
        .btn.primary{background:linear-gradient(135deg,var(--blue),#2a5fd9);border:none;color:#fff;flex:1;}
        .btn.primary:disabled{opacity:.4;cursor:not-allowed;}
        .btn.ghost{background:none;}
        .success{text-align:center;padding:40px 20px;}
        .check{width:72px;height:72px;border-radius:50%;background:var(--green);color:var(--navy);font-size:34px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;}
        .success h2{font-family:'Outfit',sans-serif;font-size:22px;margin-bottom:10px;}
        .success p{color:var(--muted);font-size:14px;line-height:1.7;margin-bottom:24px;}
        @media(max-width:480px){.field-row{grid-template-columns:1fr;}.svc-row{grid-template-columns:1fr 70px 70px 30px;}}
      `}</style>

      <div className="wrap">
        <span className="logo">BarberBook</span>

        {!done ? (
          <>
            {/* PROGRESS */}
            <div className="progress">
              {steps.map((s, i) => (
                <div key={s.num} className="prog-step">
                  <div className={`prog-dot ${step === s.num ? "active" : step > s.num ? "done" : ""}`}>
                    {step > s.num ? "✓" : s.num}
                  </div>
                  <span className={`prog-label ${step === s.num ? "active" : step > s.num ? "done" : ""}`}>
                    {s.label}
                  </span>
                  {i < steps.length - 1 && <div className={`prog-line ${step > s.num ? "done" : ""}`}/>}
                </div>
              ))}
            </div>

            <div className="panel">
              {error && <div className="error-box">{error}</div>}

              {/* STEP 1 — ACCOUNT */}
              {step === 1 && (
                <>
                  <h2>Δημιούργησε Λογαριασμό</h2>
                  <p className="sub">Τα στοιχεία σου για να συνδέεσαι στο BarberBook</p>
                  <div className="field">
                    <label>Ονοματεπώνυμο</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="π.χ. Νίκος Παπαδόπουλος"/>
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com"/>
                  </div>
                  <div className="field">
                    <label>Κωδικός</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Τουλάχιστον 6 χαρακτήρες"/>
                  </div>
                </>
              )}

              {/* STEP 2 — SHOP */}
              {step === 2 && (
                <>
                  <h2>Στοιχεία Κουρείου</h2>
                  <p className="sub">Πληροφορίες για το κουρείο σου</p>
                  <div className="field">
                    <label>Όνομα Κουρείου</label>
                    <input type="text" value={shopName} onChange={e => setShopName(e.target.value)} placeholder="π.χ. Barbershop Νίκος"/>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label>Πόλη</label>
                      <select value={city} onChange={e => setCity(e.target.value)}>
                        <option value="">Επίλεξε πόλη</option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Τηλέφωνο</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="69XXXXXXXX"/>
                    </div>
                  </div>
                  <div className="field">
                    <label>Διεύθυνση</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="π.χ. Σταδίου 15"/>
                  </div>
                </>
              )}

              {/* STEP 3 — SERVICES */}
              {step === 3 && (
                <>
                  <h2>Υπηρεσίες</h2>
                  <p className="sub">Πρόσθεσε τις υπηρεσίες και τιμές του κουρείου σου</p>
                  <div className="svc-labels">
                    <span>Υπηρεσία</span><span>Λεπτά</span><span>Τιμή €</span><span/>
                  </div>
                  {services.map((s, i) => (
                    <div key={i} className="svc-row">
                      <input className="svc-input" value={s.name}
                        onChange={e => { const n=[...services]; n[i].name=e.target.value; setServices(n) }}
                        placeholder="π.χ. Κούρεμα"/>
                      <input className="svc-input" type="number" value={s.duration}
                        onChange={e => { const n=[...services]; n[i].duration=+e.target.value; setServices(n) }}/>
                      <input className="svc-input gold" type="number" value={s.price}
                        onChange={e => { const n=[...services]; n[i].price=+e.target.value; setServices(n) }}/>
                      <button className="icon-btn" onClick={() => setServices(prev => prev.filter((_,j)=>j!==i))}>✕</button>
                    </div>
                  ))}
                  <button className="add-btn" onClick={() => setServices(prev => [...prev, {name:"",duration:30,price:15}])}>
                    + Προσθήκη Υπηρεσίας
                  </button>
                </>
              )}

              {/* STEP 4 — HOURS */}
              {step === 4 && (
                <>
                  <h2>Ωράριο Λειτουργίας</h2>
                  <p className="sub">Όρισε τις ώρες που είσαι ανοιχτός κάθε μέρα</p>
                  {hours.map((h, i) => (
                    <div key={h.day} className={`hour-row ${h.active ? "" : "off"}`}>
                      <span className="hour-day">{h.day.slice(0,3)}</span>
                      {h.active ? (
                        <>
                          <input type="time" className="hour-input" value={h.open}
                            onChange={e => { const n=[...hours]; n[i].open=e.target.value; setHours(n) }}/>
                          <span className="hour-sep">–</span>
                          <input type="time" className="hour-input" value={h.close}
                            onChange={e => { const n=[...hours]; n[i].close=e.target.value; setHours(n) }}/>
                        </>
                      ) : (
                        <span className="hour-closed">Κλειστά</span>
                      )}
                      <div className={`toggle ${h.active ? "on" : ""}`} onClick={() => {
                        const n = [...hours]
                        n[i].active = !n[i].active
                        if (n[i].active && !n[i].open) { n[i].open = "09:00"; n[i].close = "19:00" }
                        setHours(n)
                      }}/>
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        ) : (
          /* SUCCESS */
          <div className="panel">
            <div className="success">
              <div className="check">✓</div>
              <h2>Καλώς ήρθες στο BarberBook! 💈</h2>
              <p>Το κουρείο σου <strong>{shopName}</strong> δημιουργήθηκε επιτυχώς! Μπορείς τώρα να συνδεθείς και να διαχειριστείς τα ραντεβού σου.</p>
              <button className="btn primary" style={{width:"100%"}}
                onClick={() => window.location.href = "/dashboard"}>
                Πήγαινε στο Dashboard →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM BAR */}
      {!done && (
        <div className="bottom-bar">
          <div className="bottom-in">
            {step > 1 && (
              <button className="btn ghost" onClick={() => { setStep(s => s-1); setError("") }}>← Πίσω</button>
            )}
            <button
              className="btn primary"
              disabled={!canNext || loading}
              onClick={() => {
                if (step < 4) { setStep(s => s+1); setError("") }
                else handleFinish()
              }}>
              {loading ? "⏳ Δημιουργία..." : step === 4 ? "Ολοκλήρωση 🚀" : "Επόμενο →"}
            </button>
          </div>
        </div>
      )}
    </>
  )
}       