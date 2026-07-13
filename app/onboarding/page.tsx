'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xcfkhdjiragblsiqetes.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZmtoZGppcmFnYmxzaXFldGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTY0ODYsImV4cCI6MjA5NzI3MjQ4Nn0.EkmgRuYzrvF0A_pgT9vaOouMRKeQ2kasPZxpoIuCgeE'
)

const DAY_LABELS = ['Δευ', 'Τρί', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ', 'Κυρ']

function getMaxBarbers(numBarbers: number) {
  if (numBarbers <= 1) return 1      // Freemium/Solo
  if (numBarbers === 2) return 2     // Duo
  return 10                          // Team (3+)
}

type Service = { name: string; price: number }
type Hour = { active: boolean; open: string; close: string }
type Barber = { name: string; role: string }

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [finalLink, setFinalLink] = useState('')

  // Step 1 — Account
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  // Step 2 — Shop Info
  const [shopName, setShopName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [street, setStreet] = useState('')
  const [streetNumber, setStreetNumber] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [numBarbers, setNumBarbers] = useState(1)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')

  // Step 3 — Services
  const [services, setServices] = useState<Service[]>([
    { name: 'Κούρεμα', price: 15 },
    { name: 'Fade', price: 18 },
  ])

  // Step 4 — Hours
  const [hours, setHours] = useState<Hour[]>([
    { active: true, open: '09:00', close: '19:00' },
    { active: true, open: '09:00', close: '19:00' },
    { active: true, open: '09:00', close: '19:00' },
    { active: true, open: '09:00', close: '21:00' },
    { active: true, open: '09:00', close: '21:00' },
    { active: true, open: '10:00', close: '16:00' },
    { active: false, open: '', close: '' },
  ])

  // Step 5 — Barbers (μόνο αν numBarbers > 1)
  const [barbers, setBarbers] = useState<Barber[]>([{ name: '', role: 'Barber' }])

  const maxBarbers = getMaxBarbers(numBarbers)
  const hasBarberStep = numBarbers > 1
  const TOTAL_STEPS = hasBarberStep ? 5 : 4

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email || '')
        setStep(2)
      }
    })
  }, [])

  function canNext() {
    if (step === 1) return email.trim() !== '' && password.length >= 6
    if (step === 2) return shopName.trim() !== '' && phone.trim() !== '' && city.trim() !== ''
    if (step === 3) return services.length > 0 && services.every(s => s.name.trim() !== '')
    if (step === 4) return true
    if (step === 5) return barbers.length > 0 && barbers.every(b => b.name.trim() !== '')
    return false
  }

  async function uploadToBucket(file: File, path: string) {
    const { error: upErr } = await supabase.storage.from('shop-media').upload(path, file, { upsert: true })
    if (upErr) throw upErr
    const { data } = supabase.storage.from('shop-media').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleFinish() {
    setLoading(true)
    setError('')
    try {
      let userId = ''
      const { data: { user: existingUser } } = await supabase.auth.getUser()

      if (existingUser) {
        userId = existingUser.id
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: shopName } }
        })
        if (authError) { setError(authError.message); setLoading(false); return }
        if (!authData.user?.id) { setError('Σφάλμα εγγραφής!'); setLoading(false); return }
        userId = authData.user.id
      }

      // Upload logo
      let logoUrl: string | null = null
      if (logoFile) {
        logoUrl = await uploadToBucket(logoFile, `${userId}/logo-${Date.now()}`)
      }

      // Δημιουργία barbershop
      const fullAddress = `${street} ${streetNumber}, ${postalCode} ${city}`.trim()
      const { data: shop, error: shopErr } = await supabase
        .from('barbershops')
        .insert({
          name: shopName,
          phone,
          address: fullAddress,
          city,
          email: existingUser?.email || email,
          logo_url: logoUrl,
          num_barbers: numBarbers,
          description: '',
          rating: 5.0,
        })
        .select().single()
      if (shopErr) { setError('Σφάλμα κουρείου: ' + shopErr.message); setLoading(false); return }

      // Αποθήκευση services
      if (services.length > 0) {
        await supabase.from('services').insert(
          services.map(s => ({
            shop_id: shop.id,
            name: s.name,
            price: s.price,
            duration_minutes: 30,
          }))
        )
      }

      // Αποθήκευση working hours
      await supabase.from('working_hours').insert(
        hours.map((h, i) => ({
          shop_id: shop.id,
          day_of_week: i,
          is_active: h.active,
          open_time: h.active ? h.open : null,
          close_time: h.active ? h.close : null,
        }))
      )

      // Αποθήκευση barbers (αν > 1)
      if (hasBarberStep && barbers.length > 0) {
        await supabase.from('barbers').insert(
          barbers.filter(b => b.name.trim()).map(b => ({
            shop_id: shop.id,
            name: b.name,
            role: b.role || 'Barber',
          }))
        )
      }

      // Update profile → owner
      await supabase.from('profiles').upsert({
        id: userId,
        full_name: shopName,
        role: 'owner',
        barbershop_id: shop.id,
      })

      // Welcome email
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'welcome_owner',
          to: existingUser?.email || email,
          data: { ownerName: shopName, shopName, city }
        })
      })

      setFinalLink(`barberbook.gr/${shopName.toLowerCase()}`)
      setStep(TOTAL_STEPS + 1)
    } catch (e: any) {
      setError('Κάτι πήγε στραβά: ' + e.message)
    }
    setLoading(false)
  }

  function next() {
    if (!canNext()) return
    if (step === TOTAL_STEPS) handleFinish()
    else setStep(s => s + 1)
  }

  function back() {
    setError('')
    setStep(s => Math.max(1, s - 1))
  }

  const stepsDone = step > TOTAL_STEPS

  const stepLabels = [
    'Λογαριασμός',
    'Κατάστημα',
    'Υπηρεσίες',
    'Ωράριο',
    ...(hasBarberStep ? ['Ομάδα'] : []),
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        :root{
          --bg:#0a0f1e;--card:#111827;--card2:#1a2235;--border:rgba(255,255,255,.07);
          --blue:#3b82f6;--blue-soft:rgba(59,130,246,.12);--blue-glow:rgba(59,130,246,.3);
          --gold:#f59e0b;--text:#f1f5f9;--muted:#64748b;--muted2:#94a3b8;
          --green:#10b981;--red:#ef4444;
        }
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{min-height:100vh;}
        body{font-family:'Inter',sans-serif;color:var(--text);background:var(--bg);
          background-image:radial-gradient(ellipse 800px 600px at 20% 0%,rgba(59,130,246,.08),transparent),
          radial-gradient(ellipse 600px 400px at 80% 100%,rgba(245,158,11,.05),transparent);}
        h1,h2,h3{font-family:'Outfit',sans-serif;}
        button,input,select{font-family:inherit;}
        .nav{position:fixed;top:0;left:0;right:0;z-index:50;height:60px;padding:0 32px;
          display:flex;align-items:center;justify-content:space-between;
          background:rgba(10,15,30,.85);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);}
        .brand{font-size:20px;font-weight:800;background:linear-gradient(135deg,var(--blue),var(--gold));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;cursor:pointer;}
        .nav-back{display:flex;align-items:center;gap:6px;color:var(--muted2);font-size:13px;
          font-weight:500;cursor:pointer;background:none;border:none;transition:color .2s;}
        .nav-back:hover{color:var(--text);}
        .main{min-height:100vh;padding:80px 24px 48px;display:flex;align-items:flex-start;justify-content:center;}
        .container{width:100%;max-width:960px;display:grid;grid-template-columns:280px 1fr;gap:24px;align-items:start;}
        .sidebar{background:var(--card);border:1px solid var(--border);border-radius:20px;
          padding:28px 20px;position:sticky;top:80px;}
        .sidebar-title{font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;
          color:var(--muted);margin-bottom:20px;}
        .step-item{display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:12px;
          margin-bottom:6px;border:1px solid transparent;transition:all .2s;}
        .step-item.active{background:var(--blue-soft);border-color:rgba(59,130,246,.25);}
        .step-item.done{opacity:.7;}
        .step-icon{width:38px;height:38px;border-radius:10px;flex-shrink:0;display:flex;
          align-items:center;justify-content:center;font-size:18px;background:var(--card2);
          border:1px solid var(--border);transition:all .2s;}
        .step-item.active .step-icon{background:var(--blue-soft);border-color:rgba(59,130,246,.3);}
        .step-item.done .step-icon{background:rgba(16,185,129,.1);border-color:rgba(16,185,129,.25);}
        .step-info{min-width:0;}
        .step-name{font-size:13.5px;font-weight:700;color:var(--text);}
        .step-item.active .step-name{color:#93c5fd;}
        .step-item.done .step-name{color:var(--green);}
        .step-desc{font-size:11px;color:var(--muted);margin-top:2px;}
        .step-check{margin-left:auto;font-size:14px;color:var(--green);flex-shrink:0;}
        .progress-wrap{margin-top:24px;padding-top:20px;border-top:1px solid var(--border);}
        .progress-label{display:flex;justify-content:space-between;font-size:11.5px;color:var(--muted);margin-bottom:8px;}
        .progress-bar{height:4px;background:rgba(255,255,255,.06);border-radius:4px;overflow:hidden;}
        .progress-fill{height:100%;background:linear-gradient(90deg,var(--blue),var(--gold));
          border-radius:4px;transition:width .4s ease;}
        .card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:32px;
          animation:fadeIn .3s ease;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        .card-icon{width:48px;height:48px;border-radius:14px;margin-bottom:16px;display:flex;
          align-items:center;justify-content:center;font-size:24px;
          background:var(--blue-soft);border:1px solid rgba(59,130,246,.2);}
        .card-title{font-size:20px;font-weight:700;margin-bottom:6px;}
        .card-sub{font-size:13.5px;color:var(--muted2);line-height:1.6;margin-bottom:24px;}
        .field{margin-bottom:16px;}
        .field label{display:block;font-size:11.5px;font-weight:600;color:var(--muted2);
          text-transform:uppercase;letter-spacing:.5px;margin-bottom:7px;}
        .field input,.field select{width:100%;background:var(--card2);border:1px solid var(--border);
          border-radius:10px;padding:12px 14px;font-size:14px;color:var(--text);outline:none;transition:all .2s;}
        .field input:focus,.field select:focus{border-color:var(--blue);box-shadow:0 0 0 3px var(--blue-soft);}
        .field input::placeholder{color:var(--muted);}
        .field select option{background:var(--card2);}
        .field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .field-row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
        .pass-wrap{position:relative;}
        .pass-wrap input{padding-right:44px;}
        .pass-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);
          background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px;padding:4px;}
        .error-box{display:flex;align-items:center;gap:10px;
          background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);
          border-radius:10px;padding:12px 14px;font-size:13px;color:var(--red);margin-bottom:16px;}
        .svc-head{display:grid;grid-template-columns:1fr 80px 32px;gap:8px;
          font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;
          font-weight:600;margin-bottom:10px;padding:0 2px;}
        .svc-row{display:grid;grid-template-columns:1fr 80px 32px;gap:8px;align-items:center;margin-bottom:8px;}
        .svc-inp{width:100%;background:var(--card2);border:1px solid var(--border);border-radius:9px;
          padding:9px 11px;font-size:13.5px;color:var(--text);outline:none;transition:all .2s;}
        .svc-inp:focus{border-color:var(--blue);}
        .svc-inp.gold{color:var(--gold);font-weight:700;}
        .del-btn{width:32px;height:32px;border-radius:8px;background:rgba(239,68,68,.08);
          border:1px solid rgba(239,68,68,.15);color:var(--red);cursor:pointer;
          display:flex;align-items:center;justify-content:center;font-size:13px;transition:all .2s;}
        .del-btn:hover{background:rgba(239,68,68,.15);}
        .add-btn{width:100%;padding:10px;border-radius:10px;
          border:1.5px dashed rgba(59,130,246,.25);background:rgba(59,130,246,.04);
          color:#60a5fa;font-size:13px;font-weight:600;cursor:pointer;margin-top:8px;transition:all .2s;}
        .add-btn:hover{border-color:var(--blue);background:var(--blue-soft);}
        .add-btn:disabled{opacity:.4;cursor:not-allowed;}
        .hour-row{display:flex;align-items:center;gap:12px;padding:11px 14px;
          background:var(--card2);border:1px solid var(--border);border-radius:12px;margin-bottom:8px;}
        .hour-row.off{opacity:.45;}
        .hour-day{font-size:13px;font-weight:700;width:34px;flex-shrink:0;}
        .hour-inp{background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;
          padding:7px 9px;font-size:12.5px;color:var(--text);font-family:'Inter',sans-serif;outline:none;}
        .hour-inp:focus{border-color:var(--blue);}
        .hour-sep{color:var(--muted);font-size:12px;}
        .hour-closed{font-size:12px;color:var(--muted);flex:1;}
        .toggle{width:40px;height:22px;border-radius:999px;background:rgba(255,255,255,.08);
          border:1px solid var(--border);position:relative;cursor:pointer;flex-shrink:0;
          margin-left:auto;transition:all .25s;}
        .toggle::after{content:'';position:absolute;top:3px;left:3px;width:14px;height:14px;
          border-radius:50%;background:var(--muted);transition:all .25s;}
        .toggle.on{background:rgba(59,130,246,.25);border-color:rgba(59,130,246,.4);}
        .toggle.on::after{left:21px;background:var(--blue);}
        .logo-upload{border:2px dashed rgba(59,130,246,.25);border-radius:14px;padding:24px;
          text-align:center;cursor:pointer;transition:all .2s;background:rgba(59,130,246,.04);}
        .logo-upload:hover{border-color:var(--blue);background:var(--blue-soft);}
        .logo-preview{width:80px;height:80px;border-radius:50%;object-fit:cover;
          border:3px solid var(--blue);margin:0 auto 12px;display:block;}
        .team-head{display:grid;grid-template-columns:1fr 1fr 32px;gap:8px;
          font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;
          font-weight:600;margin-bottom:10px;padding:0 2px;}
        .team-row{display:grid;grid-template-columns:1fr 1fr 32px;gap:8px;align-items:center;margin-bottom:8px;}
        .limit-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;
          background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);
          border-radius:999px;font-size:12px;font-weight:600;color:var(--gold);margin-bottom:16px;}
        .actions{display:flex;gap:10px;margin-top:28px;}
        .btn{padding:13px 24px;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;
          transition:all .2s;border:1px solid var(--border);background:var(--card2);color:var(--text);}
        .btn:hover{border-color:var(--blue);}
        .btn.primary{background:linear-gradient(135deg,var(--blue),#1d4ed8);border:none;color:#fff;
          flex:1;box-shadow:0 8px 24px -8px var(--blue-glow);}
        .btn.primary:hover{filter:brightness(1.08);transform:translateY(-1px);}
        .btn.primary:disabled{opacity:.4;cursor:not-allowed;transform:none;filter:none;}
        .btn.ghost{background:none;flex-shrink:0;}
        .success{text-align:center;padding:16px 0;}
        .check-wrap{width:80px;height:80px;border-radius:50%;
          background:linear-gradient(135deg,var(--green),#059669);
          display:flex;align-items:center;justify-content:center;font-size:36px;
          margin:0 auto 24px;box-shadow:0 0 0 12px rgba(16,185,129,.1),0 0 40px rgba(16,185,129,.25);
          animation:popIn .5s cubic-bezier(.34,1.56,.64,1) both;}
        @keyframes popIn{0%{opacity:0;transform:scale(0);}70%{transform:scale(1.1);}100%{opacity:1;transform:scale(1);}}
        .success h2{font-size:22px;font-weight:700;margin-bottom:10px;}
        .success p{color:var(--muted2);font-size:14px;line-height:1.7;margin-bottom:24px;}
        .success-card{background:var(--card2);border:1px solid var(--border);border-radius:14px;
          padding:18px;margin-bottom:24px;text-align:left;}
        .sc-row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;
          border-bottom:1px solid var(--border);font-size:13.5px;}
        .sc-row:last-child{border-bottom:none;}
        .sc-label{color:var(--muted2);}
        .sc-val{font-weight:700;}
        @media(max-width:768px){
          .container{grid-template-columns:1fr;}
          .sidebar{display:none;}
          .card{padding:24px 20px;}
          .field-row,.field-row3{grid-template-columns:1fr;}
          .svc-row,.svc-head{grid-template-columns:1fr 68px 30px;}
          .team-row,.team-head{grid-template-columns:1fr 30px;}
        }
      `}</style>

      <nav className="nav">
        <div className="brand">BarberBook</div>
        <button className="nav-back" onClick={() => window.location.href="/"}>← Πίσω</button>
      </nav>

      <div className="main">
        <div className="container">

          {/* SIDEBAR */}
          <div className="sidebar">
            <div className="sidebar-title">Πρόοδος Εγγραφής</div>
            {stepLabels.map((label, i) => {
              const icons = ['👤','💈','✂️','🕒','👥']
              const descs = ['Στοιχεία εισόδου','Πληροφορίες καταστήματος','Τιμοκατάλογος','Ώρες λειτουργίας','Ομάδα barbers']
              const sNum = i + 1
              return (
                <div key={label} className={`step-item ${step===sNum?"active":""} ${step>sNum?"done":""}`}>
                  <div className="step-icon">{step > sNum ? "✓" : icons[i]}</div>
                  <div className="step-info">
                    <div className="step-name">{label}</div>
                    <div className="step-desc">{descs[i]}</div>
                  </div>
                  {step > sNum && <span className="step-check">✓</span>}
                </div>
              )
            })}
            <div className="progress-wrap">
              <div className="progress-label">
                <span>Ολοκλήρωση</span>
                <span>{Math.round(((step-1)/TOTAL_STEPS)*100)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width:`${((step-1)/TOTAL_STEPS)*100}%`}}/>
              </div>
            </div>
          </div>

          {/* MAIN CARD */}
          <div className="card">
            {error && <div className="error-box">⚠️ {error}</div>}

            {!stepsDone ? (
              <>
                {/* STEP 1 — ACCOUNT */}
                {step === 1 && (
                  <>
                    <div className="card-icon">👤</div>
                    <div className="card-title">Δημιούργησε Λογαριασμό</div>
                    <div className="card-sub">Τα στοιχεία σου για να συνδέεσαι στο BarberBook</div>
                    <div className="field">
                      <label>Email</label>
                      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@example.com"/>
                    </div>
                    <div className="field">
                      <label>Κωδικός</label>
                      <div className="pass-wrap">
                        <input type={showPass?"text":"password"} value={password}
                          onChange={e=>setPassword(e.target.value)} placeholder="Τουλάχιστον 6 χαρακτήρες"/>
                        <button className="pass-eye" type="button" onClick={()=>setShowPass(!showPass)}>
                          {showPass?"🙈":"👁️"}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 2 — SHOP */}
                {step === 2 && (
                  <>
                    <div className="card-icon">💈</div>
                    <div className="card-title">Στοιχεία Κουρείου</div>
                    <div className="card-sub">Πού βρίσκεται το κουρείο σου;</div>
                    <div className="field">
                      <label>Όνομα Κουρείου</label>
                      <input type="text" value={shopName} onChange={e=>setShopName(e.target.value)} placeholder="π.χ. Barbershop Νίκος"/>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Τηλέφωνο</label>
                        <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="69XXXXXXXX"/>
                      </div>
                      <div className="field">
                        <label>Πόλη</label>
                        <input type="text" value={city} onChange={e=>setCity(e.target.value)} placeholder="π.χ. Αθήνα"/>
                      </div>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Οδός</label>
                        <input type="text" value={street} onChange={e=>setStreet(e.target.value)} placeholder="π.χ. Σταδίου"/>
                      </div>
                      <div className="field">
                        <label>Αριθμός</label>
                        <input type="text" value={streetNumber} onChange={e=>setStreetNumber(e.target.value)} placeholder="π.χ. 15"/>
                      </div>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>ΤΚ</label>
                        <input type="text" value={postalCode} onChange={e=>setPostalCode(e.target.value)} placeholder="π.χ. 10431"/>
                      </div>
                      <div className="field">
                        <label>Αριθμός Barbers</label>
                        <select value={numBarbers} onChange={e=>setNumBarbers(+e.target.value)}>
                          <option value={1}>1 Barber (Freemium/Solo)</option>
                          <option value={2}>2 Barbers (Duo)</option>
                          <option value={3}>3+ Barbers (Team)</option>
                        </select>
                      </div>
                    </div>
                    <div className="field">
                      <label>Logo (προαιρετικό)</label>
                      {logoPreview ? (
                        <div style={{textAlign:"center",marginBottom:8}}>
                          <img src={logoPreview} className="logo-preview" alt="logo"/>
                          <button className="btn" style={{fontSize:12,padding:"6px 14px"}}
                            onClick={()=>{setLogoFile(null);setLogoPreview('')}}>Αλλαγή</button>
                        </div>
                      ) : (
                        <label className="logo-upload" style={{cursor:"pointer"}}>
                          <div style={{fontSize:32,marginBottom:8}}>🖼️</div>
                          <div style={{fontSize:13,color:"var(--muted2)"}}>Ανέβασε το logo σου</div>
                          <input type="file" accept="image/*" style={{display:"none"}}
                            onChange={e=>{
                              const f=e.target.files?.[0]
                              if(f){setLogoFile(f);setLogoPreview(URL.createObjectURL(f))}
                            }}/>
                        </label>
                      )}
                    </div>
                  </>
                )}

                {/* STEP 3 — SERVICES */}
                {step === 3 && (
                  <>
                    <div className="card-icon">✂️</div>
                    <div className="card-title">Υπηρεσίες</div>
                    <div className="card-sub">Ποιες υπηρεσίες προσφέρεις και σε τι τιμή;</div>
                    <div className="svc-head"><span>Υπηρεσία</span><span>Τιμή €</span><span/></div>
                    {services.map((s,i) => (
                      <div key={i} className="svc-row">
                        <input className="svc-inp" value={s.name} placeholder="π.χ. Κούρεμα"
                          onChange={e=>{const n=[...services];n[i].name=e.target.value;setServices(n)}}/>
                        <input className="svc-inp gold" type="number" value={s.price}
                          onChange={e=>{const n=[...services];n[i].price=+e.target.value;setServices(n)}}/>
                        <button className="del-btn" onClick={()=>setServices(p=>p.filter((_,j)=>j!==i))}>✕</button>
                      </div>
                    ))}
                    <button className="add-btn" onClick={()=>setServices(p=>[...p,{name:"",price:15}])}>
                      + Προσθήκη Υπηρεσίας
                    </button>
                  </>
                )}

                {/* STEP 4 — HOURS */}
                {step === 4 && (
                  <>
                    <div className="card-icon">🕒</div>
                    <div className="card-title">Ωράριο Λειτουργίας</div>
                    <div className="card-sub">Πότε είσαι ανοιχτός; Μπορείς να το αλλάξεις αργότερα.</div>
                    {hours.map((h,i) => (
                      <div key={i} className={`hour-row ${h.active?"":"off"}`}>
                        <span className="hour-day">{DAY_LABELS[i]}</span>
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

                {/* STEP 5 — TEAM (μόνο αν numBarbers > 1) */}
                {step === 5 && hasBarberStep && (
                  <>
                    <div className="card-icon">👥</div>
                    <div className="card-title">Ομάδα Barbers</div>
                    <div className="card-sub">Πρόσθεσε τα ονόματα των barbers σου.</div>

                    <div className="limit-badge">
                      👥 Μέγιστο {maxBarbers} barbers στο πλάνο σου
                    </div>

                    <div className="team-head"><span>Όνομα</span><span>Ρόλος</span><span/></div>
                    {barbers.map((b,i) => (
                      <div key={i} className="team-row">
                        <input className="svc-inp" value={b.name} placeholder="π.χ. Νίκος Π."
                          onChange={e=>{const n=[...barbers];n[i].name=e.target.value;setBarbers(n)}}/>
                        <input className="svc-inp" value={b.role} placeholder="Barber"
                          onChange={e=>{const n=[...barbers];n[i].role=e.target.value;setBarbers(n)}}/>
                        {barbers.length > 1 && (
                          <button className="del-btn" onClick={()=>setBarbers(p=>p.filter((_,j)=>j!==i))}>✕</button>
                        )}
                      </div>
                    ))}
                    <button
                      className="add-btn"
                      disabled={barbers.length >= maxBarbers}
                      onClick={()=>{
                        if(barbers.length < maxBarbers)
                          setBarbers(p=>[...p,{name:"",role:"Barber"}])
                      }}>
                      {barbers.length >= maxBarbers
                        ? `✕ Έχεις φτάσει το όριο (${maxBarbers} barbers)`
                        : `+ Προσθήκη Barber (${barbers.length}/${maxBarbers})`}
                    </button>
                  </>
                )}

                <div className="actions">
                  {step > 1 && (
                    <button className="btn ghost" onClick={back}>← Πίσω</button>
                  )}
                  <button className="btn primary" disabled={!canNext()||loading} onClick={next}>
                    {loading?"⏳ Δημιουργία...":step===TOTAL_STEPS?"Ολοκλήρωση 🚀":"Επόμενο →"}
                  </button>
                </div>
              </>
            ) : (
              /* SUCCESS */
              <div className="success">
                <div className="check-wrap">✓</div>
                <h2>Καλώς ήρθες στο BarberBook! 💈</h2>
                <p>Το κουρείο σου δημιουργήθηκε επιτυχώς και είναι τώρα ζωντανό!</p>
                <div className="success-card">
                  <div className="sc-row"><span className="sc-label">Κουρείο</span><span className="sc-val">{shopName}</span></div>
                  <div className="sc-row"><span className="sc-label">Πόλη</span><span className="sc-val">{city}</span></div>
                  <div className="sc-row"><span className="sc-label">Barbers</span><span className="sc-val">{numBarbers === 1 ? '1' : numBarbers === 2 ? '2' : '3+'}</span></div>
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