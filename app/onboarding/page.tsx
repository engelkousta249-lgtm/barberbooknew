"use client"
import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://xcfkhdjiragblsiqetes.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZmtoZGppcmFnYmxzaXFldGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTY0ODYsImV4cCI6MjA5NzI3MjQ4Nn0.EkmgRuYzrvF0A_pgT9vaOouMRKeQ2kasPZxpoIuCgeE"
)

const CITIES = ["Αθήνα","Θεσσαλονίκη","Πάτρα","Ηράκλειο","Λάρισα","Βόλος","Ιωάννινα","Χανιά","Ρόδος","Κέρκυρα"]

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)

  const [shopName, setShopName] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")

  const [services, setServices] = useState([
    { name: "Κούρεμα", duration: 30, price: 15 },
    { name: "Κούρεμα + Γένια", duration: 45, price: 22 },
    { name: "Fade", duration: 40, price: 18 },
  ])

  const [hours, setHours] = useState([
    { day: "Δευτέρα", active: true, open: "09:00", close: "19:00" },
    { day: "Τρίτη", active: true, open: "09:00", close: "19:00" },
    { day: "Τετάρτη", active: true, open: "09:00", close: "19:00" },
    { day: "Πέμπτη", active: true, open: "09:00", close: "21:00" },
    { day: "Παρασκευή", active: true, open: "09:00", close: "21:00" },
    { day: "Σάββατο", active: true, open: "10:00", close: "16:00" },
    { day: "Κυριακή", active: false, open: "", close: "" },
  ])

  const canNext =
    (step === 1 && fullName.trim() && email.trim() && password.length >= 6) ||
    (step === 2 && shopName.trim() && city && address.trim() && phone.trim()) ||
    step === 3 || step === 4

  async function handleFinish() {
    setLoading(true)
    setError("")
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName } }
      })
      if (authError) { setError(authError.message); setLoading(false); return }
      const userId = authData.user?.id
      if (!userId) { setError("Σφάλμα εγγραφής!"); setLoading(false); return }

      const { data: shopData, error: shopError } = await supabase
        .from("barbershops")
        .insert({ name: shopName, city, address, phone, email, description: "", rating: 5.0 })
        .select().single()
      if (shopError) { setError("Σφάλμα δημιουργίας κουρείου!"); setLoading(false); return }

      await supabase.from("profiles").upsert({
        id: userId, full_name: fullName, role: "owner", barbershop_id: shopData.id,
      })
      setDone(true)
    } catch { setError("Κάτι πήγε στραβά!") }
    setLoading(false)
  }

  const steps = [
    { num: 1, icon: "👤", label: "Λογαριασμός", desc: "Στοιχεία εισόδου" },
    { num: 2, icon: "💈", label: "Κουρείο", desc: "Πληροφορίες καταστήματος" },
    { num: 3, icon: "✂️", label: "Υπηρεσίες", desc: "Τιμοκατάλογος" },
    { num: 4, icon: "🕒", label: "Ωράριο", desc: "Ώρες λειτουργίας" },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        :root{
          --bg:#0a0f1e;--card:#111827;--card2:#1a2235;--border:rgba(255,255,255,.07);
          --blue:#3b82f6;--blue-soft:rgba(59,130,246,.12);--blue-glow:rgba(59,130,246,.3);
          --gold:#f59e0b;--gold-soft:rgba(245,158,11,.1);
          --text:#f1f5f9;--muted:#64748b;--muted2:#94a3b8;
          --green:#10b981;--red:#ef4444;
        }
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{min-height:100vh;}
        body{
          font-family:'Inter',sans-serif;color:var(--text);
          background:var(--bg);
          background-image:
            radial-gradient(ellipse 800px 600px at 20% 0%,rgba(59,130,246,.08),transparent),
            radial-gradient(ellipse 600px 400px at 80% 100%,rgba(245,158,11,.05),transparent);
          overflow-x:hidden;
        }
        h1,h2,h3,.brand{font-family:'Outfit',sans-serif;}
        button,input,select{font-family:inherit;}

        /* NAV */
        .nav{
          position:fixed;top:0;left:0;right:0;z-index:50;
          height:60px;padding:0 32px;
          display:flex;align-items:center;justify-content:space-between;
          background:rgba(10,15,30,.85);backdrop-filter:blur(16px);
          border-bottom:1px solid var(--border);
        }
        .brand{
          font-size:20px;font-weight:800;
          background:linear-gradient(135deg,var(--blue),var(--gold));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          cursor:pointer;
        }
        .nav-back{
          display:flex;align-items:center;gap:6px;color:var(--muted2);
          font-size:13px;font-weight:500;cursor:pointer;
          background:none;border:none;transition:color .2s;
        }
        .nav-back:hover{color:var(--text);}

        /* MAIN */
        .main{min-height:100vh;padding:80px 24px 48px;display:flex;align-items:flex-start;justify-content:center;}
        .container{width:100%;max-width:960px;display:grid;grid-template-columns:280px 1fr;gap:24px;align-items:start;}

        /* SIDEBAR */
        .sidebar{
          background:var(--card);border:1px solid var(--border);border-radius:20px;
          padding:28px 20px;position:sticky;top:80px;
        }
        .sidebar-title{font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:20px;}
        .step-item{
          display:flex;align-items:center;gap:14px;padding:12px 14px;
          border-radius:12px;margin-bottom:6px;cursor:pointer;transition:all .2s;
          border:1px solid transparent;
        }
        .step-item.active{background:var(--blue-soft);border-color:rgba(59,130,246,.25);}
        .step-item.done{opacity:.7;}
        .step-icon{
          width:38px;height:38px;border-radius:10px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;font-size:18px;
          background:var(--card2);border:1px solid var(--border);transition:all .2s;
        }
        .step-item.active .step-icon{background:var(--blue-soft);border-color:rgba(59,130,246,.3);}
        .step-item.done .step-icon{background:rgba(16,185,129,.1);border-color:rgba(16,185,129,.25);}
        .step-info{min-width:0;}
        .step-name{font-size:13.5px;font-weight:700;color:var(--text);transition:color .2s;}
        .step-item.active .step-name{color:#93c5fd;}
        .step-item.done .step-name{color:var(--green);}
        .step-desc{font-size:11px;color:var(--muted);margin-top:2px;}
        .step-check{margin-left:auto;font-size:14px;color:var(--green);flex-shrink:0;}
        .progress-wrap{margin-top:24px;padding-top:20px;border-top:1px solid var(--border);}
        .progress-label{display:flex;justify-content:space-between;font-size:11.5px;color:var(--muted);margin-bottom:8px;}
        .progress-bar{height:4px;background:rgba(255,255,255,.06);border-radius:4px;overflow:hidden;}
        .progress-fill{height:100%;background:linear-gradient(90deg,var(--blue),var(--gold));border-radius:4px;transition:width .4s ease;}

        /* CARD */
        .card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:32px;animation:fadeIn .3s ease;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        .card-header{margin-bottom:28px;}
        .card-icon{
          width:48px;height:48px;border-radius:14px;margin-bottom:16px;
          display:flex;align-items:center;justify-content:center;font-size:24px;
          background:var(--blue-soft);border:1px solid rgba(59,130,246,.2);
        }
        .card-title{font-size:20px;font-weight:700;margin-bottom:6px;}
        .card-sub{font-size:13.5px;color:var(--muted2);line-height:1.6;}

        /* FIELDS */
        .field{margin-bottom:16px;}
        .field label{
          display:block;font-size:11.5px;font-weight:600;color:var(--muted2);
          text-transform:uppercase;letter-spacing:.5px;margin-bottom:7px;
        }
        .field input,.field select{
          width:100%;background:var(--card2);border:1px solid var(--border);
          border-radius:10px;padding:12px 14px;font-size:14px;color:var(--text);outline:none;transition:all .2s;
        }
        .field input:focus,.field select:focus{border-color:var(--blue);box-shadow:0 0 0 3px var(--blue-soft);}
        .field input::placeholder{color:var(--muted);}
        .field select option{background:var(--card2);}
        .field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .pass-wrap{position:relative;}
        .pass-wrap input{padding-right:44px;}
        .pass-eye{
          position:absolute;right:12px;top:50%;transform:translateY(-50%);
          background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px;padding:4px;
          transition:color .2s;
        }
        .pass-eye:hover{color:var(--text);}
        .hint{font-size:11px;color:var(--muted);margin-top:5px;}

        /* ERROR */
        .error-box{
          display:flex;align-items:center;gap:10px;
          background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);
          border-radius:10px;padding:12px 14px;font-size:13px;color:var(--red);margin-bottom:16px;
        }

        /* SERVICES */
        .svc-head{
          display:grid;grid-template-columns:1fr 80px 80px 32px;gap:8px;
          font-size:10.5px;color:var(--muted);text-transform:uppercase;
          letter-spacing:.5px;font-weight:600;margin-bottom:10px;padding:0 2px;
        }
        .svc-row{display:grid;grid-template-columns:1fr 80px 80px 32px;gap:8px;align-items:center;margin-bottom:8px;}
        .svc-inp{
          width:100%;background:var(--card2);border:1px solid var(--border);
          border-radius:9px;padding:9px 11px;font-size:13.5px;color:var(--text);outline:none;transition:all .2s;
        }
        .svc-inp:focus{border-color:var(--blue);}
        .svc-inp.gold{color:var(--gold);font-weight:700;}
        .del-btn{
          width:32px;height:32px;border-radius:8px;
          background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.15);
          color:var(--red);cursor:pointer;display:flex;align-items:center;justify-content:center;
          font-size:14px;transition:all .2s;
        }
        .del-btn:hover{background:rgba(239,68,68,.15);border-color:rgba(239,68,68,.3);}
        .add-btn{
          width:100%;padding:11px;border-radius:10px;
          border:1.5px dashed rgba(59,130,246,.25);background:rgba(59,130,246,.04);
          color:#60a5fa;font-size:13px;font-weight:600;cursor:pointer;
          margin-top:8px;transition:all .2s;
        }
        .add-btn:hover{border-color:var(--blue);background:var(--blue-soft);}

        /* HOURS */
        .hour-row{
          display:flex;align-items:center;gap:12px;padding:12px 14px;
          background:var(--card2);border:1px solid var(--border);border-radius:12px;
          margin-bottom:8px;transition:all .2s;
        }
        .hour-row.off{opacity:.45;}
        .hour-day{font-size:13px;font-weight:700;width:36px;flex-shrink:0;}
        .hour-inp{
          background:rgba(255,255,255,.05);border:1px solid var(--border);
          border-radius:8px;padding:7px 9px;font-size:12.5px;color:var(--text);
          font-family:'Inter',sans-serif;outline:none;transition:border-color .2s;
        }
        .hour-inp:focus{border-color:var(--blue);}
        .hour-sep{color:var(--muted);font-size:12px;}
        .hour-closed{font-size:12px;color:var(--muted);flex:1;}
        .toggle{
          width:40px;height:22px;border-radius:999px;
          background:rgba(255,255,255,.08);border:1px solid var(--border);
          position:relative;cursor:pointer;flex-shrink:0;margin-left:auto;transition:all .25s;
        }
        .toggle::after{
          content:'';position:absolute;top:3px;left:3px;
          width:14px;height:14px;border-radius:50%;background:var(--muted);transition:all .25s;
        }
        .toggle.on{background:rgba(59,130,246,.25);border-color:rgba(59,130,246,.4);}
        .toggle.on::after{left:21px;background:var(--blue);}

        /* ACTIONS */
        .actions{display:flex;gap:10px;margin-top:28px;}
        .btn{
          padding:13px 24px;border-radius:12px;font-size:14px;font-weight:700;
          cursor:pointer;transition:all .2s;border:1px solid var(--border);
          background:var(--card2);color:var(--text);font-family:'Inter',sans-serif;
        }
        .btn:hover{border-color:var(--blue);}
        .btn.primary{
          background:linear-gradient(135deg,var(--blue),#1d4ed8);
          border:none;color:#fff;flex:1;
          box-shadow:0 8px 24px -8px var(--blue-glow);
        }
        .btn.primary:hover{filter:brightness(1.08);transform:translateY(-1px);}
        .btn.primary:disabled{opacity:.4;cursor:not-allowed;transform:none;filter:none;}
        .btn.ghost{background:none;flex-shrink:0;}

        /* SUCCESS */
        .success{text-align:center;padding:16px 0;}
        .check-wrap{
          width:80px;height:80px;border-radius:50%;
          background:linear-gradient(135deg,var(--green),#059669);
          display:flex;align-items:center;justify-content:center;font-size:36px;
          margin:0 auto 24px;
          box-shadow:0 0 0 12px rgba(16,185,129,.1),0 0 40px rgba(16,185,129,.25);
          animation:popIn .5s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes popIn{0%{opacity:0;transform:scale(0);}70%{transform:scale(1.1);}100%{opacity:1;transform:scale(1);}}
        .success h2{font-size:22px;font-weight:700;margin-bottom:10px;}
        .success p{color:var(--muted2);font-size:14px;line-height:1.7;margin-bottom:24px;}
        .success-card{
          background:var(--card2);border:1px solid var(--border);
          border-radius:14px;padding:18px;margin-bottom:24px;text-align:left;
        }
        .sc-row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--border);font-size:13.5px;}
        .sc-row:last-child{border-bottom:none;}
        .sc-label{color:var(--muted2);}
        .sc-val{font-weight:700;}

        @media(max-width:768px){
          .container{grid-template-columns:1fr;}
          .sidebar{display:none;}
          .card{padding:24px 20px;}
          .field-row{grid-template-columns:1fr;}
          .svc-row,.svc-head{grid-template-columns:1fr 68px 68px 30px;}
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="brand">BarberBook</div>
        <button className="nav-back" onClick={() => window.location.href="/"}>← Πίσω</button>
      </nav>

      <div className="main">
        <div className="container">

          {/* SIDEBAR */}
          <div className="sidebar">
            <div className="sidebar-title">Πρόοδος Εγγραφής</div>
            {steps.map(s => (
              <div key={s.num} className={`step-item ${step===s.num?"active":""} ${step>s.num?"done":""}`}>
                <div className="step-icon">{step > s.num ? "✓" : s.icon}</div>
                <div className="step-info">
                  <div className="step-name">{s.label}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
                {step > s.num && <span className="step-check">✓</span>}
              </div>
            ))}
            <div className="progress-wrap">
              <div className="progress-label">
                <span>Ολοκλήρωση</span>
                <span>{Math.round(((step-1)/4)*100)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width:`${((step-1)/4)*100}%`}}/>
              </div>
            </div>
          </div>

          {/* MAIN CARD */}
          <div className="card">
            {error && <div className="error-box">⚠️ {error}</div>}

            {!done ? (
              <>
                {/* STEP 1 */}
                {step === 1 && (
                  <>
                    <div className="card-header">
                      <div className="card-icon">👤</div>
                      <div className="card-title">Δημιούργησε Λογαριασμό</div>
                      <div className="card-sub">Τα στοιχεία σου για να συνδέεσαι στο BarberBook</div>
                    </div>
                    <div className="field">
                      <label>Ονοματεπώνυμο</label>
                      <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="π.χ. Νίκος Παπαδόπουλος"/>
                    </div>
                    <div className="field">
                      <label>Email</label>
                      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@example.com"/>
                    </div>
                    <div className="field">
                      <label>Κωδικός</label>
                      <div className="pass-wrap">
                        <input type={showPass?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Τουλάχιστον 6 χαρακτήρες"/>
                        <button className="pass-eye" type="button" onClick={()=>setShowPass(!showPass)}>
                          {showPass?"🙈":"👁️"}
                        </button>
                      </div>
                      <p className="hint">Τουλάχιστον 6 χαρακτήρες</p>
                    </div>
                  </>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <>
                    <div className="card-header">
                      <div className="card-icon">💈</div>
                      <div className="card-title">Στοιχεία Κουρείου</div>
                      <div className="card-sub">Πού βρίσκεται το κουρείο σου;</div>
                    </div>
                    <div className="field">
                      <label>Όνομα Κουρείου</label>
                      <input type="text" value={shopName} onChange={e=>setShopName(e.target.value)} placeholder="π.χ. Barbershop Νίκος"/>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Πόλη</label>
                        <select value={city} onChange={e=>setCity(e.target.value)}>
                          <option value="">Επίλεξε...</option>
                          {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="field">
                        <label>Τηλέφωνο</label>
                        <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="69XXXXXXXX"/>
                      </div>
                    </div>
                    <div className="field">
                      <label>Διεύθυνση</label>
                      <input type="text" value={address} onChange={e=>setAddress(e.target.value)} placeholder="π.χ. Σταδίου 15"/>
                    </div>
                  </>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <>
                    <div className="card-header">
                      <div className="card-icon">✂️</div>
                      <div className="card-title">Υπηρεσίες</div>
                      <div className="card-sub">Ποιες υπηρεσίες προσφέρεις και σε τι τιμή;</div>
                    </div>
                    <div className="svc-head">
                      <span>Υπηρεσία</span><span>Λεπτά</span><span>Τιμή €</span><span/>
                    </div>
                    {services.map((s,i)=>(
                      <div key={i} className="svc-row">
                        <input className="svc-inp" value={s.name} placeholder="π.χ. Κούρεμα"
                          onChange={e=>{const n=[...services];n[i].name=e.target.value;setServices(n)}}/>
                        <input className="svc-inp" type="number" value={s.duration}
                          onChange={e=>{const n=[...services];n[i].duration=+e.target.value;setServices(n)}}/>
                        <input className="svc-inp gold" type="number" value={s.price}
                          onChange={e=>{const n=[...services];n[i].price=+e.target.value;setServices(n)}}/>
                        <button className="del-btn" onClick={()=>setServices(p=>p.filter((_,j)=>j!==i))}>✕</button>
                      </div>
                    ))}
                    <button className="add-btn" onClick={()=>setServices(p=>[...p,{name:"",duration:30,price:15}])}>
                      + Προσθήκη Υπηρεσίας
                    </button>
                  </>
                )}

                {/* STEP 4 */}
                {step === 4 && (
                  <>
                    <div className="card-header">
                      <div className="card-icon">🕒</div>
                      <div className="card-title">Ωράριο Λειτουργίας</div>
                      <div className="card-sub">Πότε είσαι ανοιχτός; Μπορείς να το αλλάξεις αργότερα.</div>
                    </div>
                    {hours.map((h,i)=>(
                      <div key={h.day} className={`hour-row ${h.active?"":"off"}`}>
                        <span className="hour-day">{h.day.slice(0,3)}</span>
                        {h.active ? (
                          <>
                            <input type="time" className="hour-inp" value={h.open}
                              onChange={e=>{const n=[...hours];n[i].open=e.target.value;setHours(n)}}/>
                            <span className="hour-sep">–</span>
                            <input type="time" className="hour-inp" value={h.close}
                              onChange={e=>{const n=[...hours];n[i].close=e.target.value;setHours(n)}}/>
                          </>
                        ) : (
                          <span className="hour-closed">Κλειστά</span>
                        )}
                        <div className={`toggle ${h.active?"on":""}`} onClick={()=>{
                          const n=[...hours]
                          n[i].active=!n[i].active
                          if(n[i].active&&!n[i].open){n[i].open="09:00";n[i].close="19:00"}
                          setHours(n)
                        }}/>
                      </div>
                    ))}
                  </>
                )}

                <div className="actions">
                  {step > 1 && (
                    <button className="btn ghost" onClick={()=>{setStep(s=>s-1);setError("")}}>← Πίσω</button>
                  )}
                  <button
                    className="btn primary"
                    disabled={!canNext||loading}
                    onClick={()=>{
                      if(step<4){setStep(s=>s+1);setError("")}
                      else handleFinish()
                    }}>
                    {loading?"⏳ Δημιουργία...":step===4?"Ολοκλήρωση 🚀":"Επόμενο →"}
                  </button>
                </div>
              </>
            ) : (
              <div className="success">
                <div className="check-wrap">✓</div>
                <h2>Καλώς ήρθες στο BarberBook! 💈</h2>
                <p>Το κουρείο σου <strong>{shopName}</strong> δημιουργήθηκε επιτυχώς και είναι τώρα ζωντανό!</p>
                <div className="success-card">
                  <div className="sc-row"><span className="sc-label">Κουρείο</span><span className="sc-val">{shopName}</span></div>
                  <div className="sc-row"><span className="sc-label">Πόλη</span><span className="sc-val">{city}</span></div>
                  <div className="sc-row"><span className="sc-label">Email</span><span className="sc-val">{email}</span></div>
                  <div className="sc-row"><span className="sc-label">Υπηρεσίες</span><span className="sc-val">{services.length}</span></div>
                </div>
                <button className="btn primary" style={{width:"100%"}}
                  onClick={()=>window.location.href="/dashboard"}>
                  Πήγαινε στο Dashboard →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}