'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xcfkhdjiragblsiqetes.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZmtoZGppcmFnYmxzaXFldGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTY0ODYsImV4cCI6MjA5NzI3MjQ4Nn0.EkmgRuYzrvF0A_pgT9vaOouMRKeQ2kasPZxpoIuCgeE'
)

const DAY_LABELS = ['Δευ','Τρί','Τετ','Πέμ','Παρ','Σάβ','Κυρ']

function getPlanLimits(plan: string) {
  if (plan === 'duo') return { maxBarbers: 2, label: 'Duo' }
  if (plan === 'team') return { maxBarbers: 10, label: 'Team' }
  return { maxBarbers: 1, label: plan === 'solo' ? 'Solo' : 'Freemium' }
}

type Service = { name: string; price: number }
type Hour = { active: boolean; open: string; close: string }
type Barber = { name: string; role: string }

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [shopLink, setShopLink] = useState('')

  // Step 1 — Account
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [plan, setPlan] = useState('freemium')

  // Step 2 — Shop Info
  const [shopName, setShopName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [street, setStreet] = useState('')
  const [streetNumber, setStreetNumber] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [logoFile, setLogoFile] = useState<File|null>(null)
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

  // Step 5 — Gallery + Barbers
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([{ name: '', role: 'Barber' }])

  const { maxBarbers } = getPlanLimits(plan)
  const TOTAL_STEPS = 5

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
    if (step === 5) return true
    return false
  }

  async function uploadFile(file: File, path: string) {
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
        logoUrl = await uploadFile(logoFile, `${userId}/logo-${Date.now()}`)
      }

      // Upload gallery photos
      const photoUrls: string[] = []
      for (let i = 0; i < photoFiles.length; i++) {
        const url = await uploadFile(photoFiles[i], `${userId}/photo-${Date.now()}-${i}`)
        photoUrls.push(url)
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
          num_barbers: maxBarbers,
          plan,
          description: '',
          rating: 5.0,
        })
        .select().single()
      if (shopErr) { setError('Σφάλμα κουρείου: ' + shopErr.message); setLoading(false); return }

      // Services
      if (services.length > 0) {
        await supabase.from('services').insert(
          services.map(s => ({ shop_id: shop.id, name: s.name, price: s.price, duration_minutes: 30 }))
        )
      }

      // Working hours
      await supabase.from('working_hours').insert(
        hours.map((h, i) => ({
          shop_id: shop.id, day_of_week: i,
          is_active: h.active,
          open_time: h.active ? h.open : null,
          close_time: h.active ? h.close : null,
        }))
      )

      // Gallery photos
      if (photoUrls.length > 0) {
        await supabase.from('portfolio_photos').insert(
          photoUrls.map((url, i) => ({ shop_id: shop.id, url, is_cover: i === 0 }))
        )
      }

      // Barbers (αν maxBarbers > 1)
      if (maxBarbers > 1 && barbers.filter(b => b.name.trim()).length > 0) {
        await supabase.from('barbers').insert(
          barbers.filter(b => b.name.trim()).map(b => ({
            shop_id: shop.id, name: b.name, role: b.role || 'Barber'
          }))
        )
      }

      // Update profile
      await supabase.from('profiles').upsert({
        id: userId, full_name: shopName, role: 'owner', barbershop_id: shop.id,
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

      setShopLink(`${window.location.origin}/barbershops/${shop.id}`)
      setDone(true)
    } catch (e: any) {
      setError('Κάτι πήγε στραβά: ' + e.message)
    }
    setLoading(false)
  }

  const stepIcons = ['👤','💈','✂️','🕒','🖼️']
  const stepLabels = ['Λογαριασμός','Κατάστημα','Υπηρεσίες','Ωράριο','Φωτογραφίες & Ομάδα']
  const stepDescs = ['Στοιχεία εισόδου','Πληροφορίες καταστήματος','Τιμοκατάλογος','Ώρες λειτουργίας','Gallery & Barbers']

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
        .nav-back{color:var(--muted2);font-size:13px;font-weight:500;cursor:pointer;
          background:none;border:none;transition:color .2s;}
        .nav-back:hover{color:var(--text);}
        .main{min-height:100vh;padding:80px 24px 48px;display:flex;align-items:flex-start;justify-content:center;}
        .container{width:100%;max-width:960px;display:grid;grid-template-columns:280px 1fr;gap:24px;align-items:start;}
        .sidebar{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:28px 20px;position:sticky;top:80px;}
        .sidebar-title{font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:20px;}
        .step-item{display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:12px;margin-bottom:6px;border:1px solid transparent;transition:all .2s;}
        .step-item.active{background:var(--blue-soft);border-color:rgba(59,130,246,.25);}
        .step-icon{width:38px;height:38px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px;background:var(--card2);border:1px solid var(--border);}
        .step-item.active .step-icon{background:var(--blue-soft);border-color:rgba(59,130,246,.3);}
        .step-item.done .step-icon{background:rgba(16,185,129,.1);border-color:rgba(16,185,129,.25);}
        .step-name{font-size:13.5px;font-weight:700;color:var(--text);}
        .step-item.active .step-name{color:#93c5fd;}
        .step-item.done .step-name{color:var(--green);}
        .step-desc{font-size:11px;color:var(--muted);margin-top:2px;}
        .progress-wrap{margin-top:24px;padding-top:20px;border-top:1px solid var(--border);}
        .progress-label{display:flex;justify-content:space-between;font-size:11.5px;color:var(--muted);margin-bottom:8px;}
        .progress-bar{height:4px;background:rgba(255,255,255,.06);border-radius:4px;overflow:hidden;}
        .progress-fill{height:100%;background:linear-gradient(90deg,var(--blue),var(--gold));border-radius:4px;transition:width .4s ease;}
        .card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:32px;animation:fadeIn .3s ease;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        .card-icon{width:48px;height:48px;border-radius:14px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;font-size:24px;background:var(--blue-soft);border:1px solid rgba(59,130,246,.2);}
        .card-title{font-size:20px;font-weight:700;margin-bottom:6px;}
        .card-sub{font-size:13.5px;color:var(--muted2);line-height:1.6;margin-bottom:24px;}
        .field{margin-bottom:16px;}
        .field label{display:block;font-size:11.5px;font-weight:600;color:var(--muted2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:7px;}
        .field input,.field select{width:100%;background:var(--card2);border:1px solid var(--border);border-radius:10px;padding:12px 14px;font-size:14px;color:var(--text);outline:none;transition:all .2s;}
        .field input:focus,.field select:focus{border-color:var(--blue);box-shadow:0 0 0 3px var(--blue-soft);}
        .field input::placeholder{color:var(--muted);}
        .field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .pass-wrap{position:relative;}
        .pass-wrap input{padding-right:44px;}
        .pass-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px;padding:4px;}
        .error-box{display:flex;align-items:center;gap:10px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:10px;padding:12px 14px;font-size:13px;color:var(--red);margin-bottom:16px;}
        .plan-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:8px;}
        .plan-card{border:1.5px solid var(--border);border-radius:14px;padding:16px;cursor:pointer;transition:all .2s;background:var(--card2);}
        .plan-card:hover{border-color:rgba(59,130,246,.4);}
        .plan-card.selected{border-color:var(--blue);background:var(--blue-soft);}
        .plan-card.popular{border-color:var(--gold);}
        .plan-card.popular.selected{background:rgba(245,158,11,.1);}
        .plan-name{font-size:15px;font-weight:800;margin-bottom:4px;}
        .plan-price{font-size:20px;font-weight:900;color:var(--blue);font-family:'Outfit',sans-serif;}
        .plan-card.popular .plan-price{color:var(--gold);}
        .plan-desc{font-size:11.5px;color:var(--muted);margin-top:6px;}
        .plan-badge{display:inline-block;padding:2px 8px;background:rgba(245,158,11,.15);color:var(--gold);border-radius:20px;font-size:10px;font-weight:700;margin-bottom:6px;}
        .logo-upload{border:2px dashed rgba(59,130,246,.25);border-radius:14px;padding:24px;text-align:center;cursor:pointer;transition:all .2s;background:rgba(59,130,246,.04);display:block;}
        .logo-upload:hover{border-color:var(--blue);background:var(--blue-soft);}
        .logo-preview{width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid var(--blue);margin:0 auto 12px;display:block;}
        .svc-head{display:grid;grid-template-columns:1fr 80px 32px;gap:8px;font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;font-weight:600;margin-bottom:10px;padding:0 2px;}
        .svc-row{display:grid;grid-template-columns:1fr 80px 32px;gap:8px;align-items:center;margin-bottom:8px;}
        .svc-inp{width:100%;background:var(--card2);border:1px solid var(--border);border-radius:9px;padding:9px 11px;font-size:13.5px;color:var(--text);outline:none;transition:all .2s;}
        .svc-inp:focus{border-color:var(--blue);}
        .svc-inp.gold{color:var(--gold);font-weight:700;}
        .del-btn{width:32px;height:32px;border-radius:8px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.15);color:var(--red);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;transition:all .2s;}
        .del-btn:hover{background:rgba(239,68,68,.15);}
        .add-btn{width:100%;padding:10px;border-radius:10px;border:1.5px dashed rgba(59,130,246,.25);background:rgba(59,130,246,.04);color:#60a5fa;font-size:13px;font-weight:600;cursor:pointer;margin-top:8px;transition:all .2s;}
        .add-btn:hover{border-color:var(--blue);background:var(--blue-soft);}
        .add-btn:disabled{opacity:.4;cursor:not-allowed;}
        .hour-row{display:flex;align-items:center;gap:12px;padding:11px 14px;background:var(--card2);border:1px solid var(--border);border-radius:12px;margin-bottom:8px;}
        .hour-row.off{opacity:.45;}
        .hour-day{font-size:13px;font-weight:700;width:34px;flex-shrink:0;}
        .hour-inp{background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:7px 9px;font-size:12.5px;color:var(--text);font-family:'Inter',sans-serif;outline:none;}
        .hour-inp:focus{border-color:var(--blue);}
        .hour-sep{color:var(--muted);font-size:12px;}
        .hour-closed{font-size:12px;color:var(--muted);flex:1;}
        .toggle{width:40px;height:22px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid var(--border);position:relative;cursor:pointer;flex-shrink:0;margin-left:auto;transition:all .25s;}
        .toggle::after{content:'';position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:var(--muted);transition:all .25s;}
        .toggle.on{background:rgba(59,130,246,.25);border-color:rgba(59,130,246,.4);}
        .toggle.on::after{left:21px;background:var(--blue);}
        .gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px;}
        .gallery-item{aspect-ratio:1;border-radius:12px;overflow:hidden;position:relative;border:1px solid var(--border);}
        .gallery-item img{width:100%;height:100%;object-fit:cover;display:block;}
        .gallery-del{position:absolute;top:6px;right:6px;width:24px;height:24px;border-radius:50%;background:rgba(239,68,68,.85);border:none;color:#fff;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;}
        .gallery-add{aspect-ratio:1;border-radius:12px;border:2px dashed rgba(59,130,246,.25);background:rgba(59,130,246,.04);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;color:#60a5fa;font-size:12px;font-weight:600;gap:6px;}
        .gallery-add:hover{border-color:var(--blue);background:var(--blue-soft);}
        .gallery-add .plus{font-size:24px;}
        .team-section{margin-top:24px;padding-top:24px;border-top:1px solid var(--border);}
        .team-head{display:grid;grid-template-columns:1fr 1fr 32px;gap:8px;font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;font-weight:600;margin-bottom:10px;padding:0 2px;}
        .team-row{display:grid;grid-template-columns:1fr 1fr 32px;gap:8px;align-items:center;margin-bottom:8px;}
        .limit-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);border-radius:999px;font-size:12px;font-weight:600;color:var(--gold);margin-bottom:16px;}
        .locked-box{background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.15);border-radius:12px;padding:20px;text-align:center;}
        .locked-box p{font-size:13px;color:var(--muted2);line-height:1.7;}
        .actions{display:flex;gap:10px;margin-top:28px;}
        .btn{padding:13px 24px;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;border:1px solid var(--border);background:var(--card2);color:var(--text);}
        .btn:hover{border-color:var(--blue);}
        .btn.primary{background:linear-gradient(135deg,var(--blue),#1d4ed8);border:none;color:#fff;flex:1;box-shadow:0 8px 24px -8px var(--blue-glow);}
        .btn.primary:hover{filter:brightness(1.08);transform:translateY(-1px);}
        .btn.primary:disabled{opacity:.4;cursor:not-allowed;transform:none;filter:none;}
        .btn.ghost{background:none;flex-shrink:0;}
        .success{text-align:center;padding:16px 0;}
        .check-wrap{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--green),#059669);display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 24px;box-shadow:0 0 0 12px rgba(16,185,129,.1),0 0 40px rgba(16,185,129,.25);animation:popIn .5s cubic-bezier(.34,1.56,.64,1) both;}
        @keyframes popIn{0%{opacity:0;transform:scale(0);}70%{transform:scale(1.1);}100%{opacity:1;transform:scale(1);}}
        .success h2{font-size:22px;font-weight:700;margin-bottom:10px;}
        .success p{color:var(--muted2);font-size:14px;line-height:1.7;margin-bottom:24px;}
        .success-card{background:var(--card2);border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:20px;text-align:left;}
        .sc-row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--border);font-size:13.5px;}
        .sc-row:last-child{border-bottom:none;}
        .sc-label{color:var(--muted2);}
        .sc-val{font-weight:700;}
        .link-box{background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.25);border-radius:12px;padding:16px;margin-bottom:20px;display:flex;align-items:center;gap:12px;}
        .link-box input{flex:1;background:none;border:none;color:var(--blue);font-size:13px;font-weight:600;outline:none;cursor:text;}
        .copy-btn{padding:8px 14px;background:var(--blue);border:none;color:#fff;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;}
        @media(max-width:768px){
          .container{grid-template-columns:1fr;}
          .sidebar{display:none;}
          .card{padding:24px 20px;}
          .field-row{grid-template-columns:1fr;}
          .plan-grid{grid-template-columns:1fr 1fr;}
          .gallery-grid{grid-template-columns:repeat(3,1fr);}
          .team-row,.team-head{grid-template-columns:1fr 30px;}
        }
      `}</style>

      <nav className="nav">
        <div className="brand" onClick={() => window.location.href="/"}>BarberBook</div>
        <button className="nav-back" onClick={() => window.location.href="/"}>← Πίσω</button>
      </nav>

      <div className="main">
        <div className="container">

          {/* SIDEBAR */}
          {!done && (
            <div className="sidebar">
              <div className="sidebar-title">Πρόοδος Εγγραφής</div>
              {stepLabels.map((label, i) => {
                const sNum = i + 1
                return (
                  <div key={label} className={`step-item ${step===sNum?"active":""} ${step>sNum?"done":""}`}>
                    <div className="step-icon">{step > sNum ? "✓" : stepIcons[i]}</div>
                    <div>
                      <div className="step-name">{label}</div>
                      <div className="step-desc">{stepDescs[i]}</div>
                    </div>
                    {step > sNum && <span style={{marginLeft:"auto",color:"var(--green)"}}>✓</span>}
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
          )}

          {/* MAIN CARD */}
          <div className="card">
            {error && <div className="error-box">⚠️ {error}</div>}

            {!done ? (
              <>
                {/* STEP 1 — ACCOUNT + PLAN */}
                {step === 1 && (
                  <>
                    <div className="card-icon">👤</div>
                    <div className="card-title">Δημιούργησε Λογαριασμό</div>
                    <div className="card-sub">Ξεκίνα με το πλάνο που σου ταιριάζει</div>

                    <div className="field">
                      <label>Επίλεξε Πλάνο</label>
                      <div className="plan-grid">
                        {[
                          { key:'freemium', name:'Freemium', price:'€0', desc:'1 barber · Έως 20 κρατήσεις/μήνα', popular:false },
                          { key:'solo', name:'Solo', price:'€20', desc:'1 barber · Απεριόριστες κρατήσεις', popular:false },
                          { key:'duo', name:'Duo', price:'€24', desc:'2 barbers · Απεριόριστες κρατήσεις', popular:true },
                          { key:'team', name:'Team', price:'€28', desc:'3+ barbers · Πλήρης διαχείριση', popular:false },
                        ].map(p => (
                          <div key={p.key}
                            className={`plan-card ${plan===p.key?"selected":""} ${p.popular?"popular":""}`}
                            onClick={() => setPlan(p.key)}>
                            {p.popular && <div className="plan-badge">⭐ Πιο Δημοφιλές</div>}
                            <div className="plan-name">{p.name}</div>
                            <div className="plan-price">{p.price}<span style={{fontSize:12,color:"var(--muted)",fontWeight:400}}>/μήνα</span></div>
                            <div className="plan-desc">{p.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

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
                        <input type="text" value={streetNumber} onChange={e=>setStreetNumber(e.target.value)} placeholder="15"/>
                      </div>
                    </div>
                    <div className="field">
                      <label>ΤΚ</label>
                      <input type="text" value={postalCode} onChange={e=>setPostalCode(e.target.value)} placeholder="10431"/>
                    </div>
                    <div className="field">
                      <label>Logo (προαιρετικό)</label>
                      {logoPreview ? (
                        <div style={{textAlign:"center"}}>
                          <img src={logoPreview} className="logo-preview" alt="logo"/>
                          <button className="btn" style={{fontSize:12,padding:"6px 14px",marginTop:8}}
                            onClick={()=>{setLogoFile(null);setLogoPreview('')}}>Αλλαγή</button>
                        </div>
                      ) : (
                        <label className="logo-upload">
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

                {/* STEP 5 — GALLERY + BARBERS */}
                {step === 5 && (
                  <>
                    <div className="card-icon">🖼️</div>
                    <div className="card-title">Φωτογραφίες & Ομάδα</div>
                    <div className="card-sub">Ανέβασε φωτογραφίες του κουρείου σου (μέγιστο 6)</div>

                    {/* GALLERY */}
                    <div className="gallery-grid">
                      {photoPreviews.map((url, i) => (
                        <div key={i} className="gallery-item">
                          <img src={url} alt=""/>
                          <button className="gallery-del" onClick={() => {
                            setPhotoPreviews(p => p.filter((_,j)=>j!==i))
                            setPhotoFiles(p => p.filter((_,j)=>j!==i))
                          }}>✕</button>
                        </div>
                      ))}
                      {photoPreviews.length < 6 && (
                        <label className="gallery-add">
                          <span className="plus">+</span>
                          <span>Φωτογραφία</span>
                          <input type="file" accept="image/*" multiple style={{display:"none"}}
                            onChange={e => {
                              const files = Array.from(e.target.files || [])
                              const remaining = 6 - photoFiles.length
                              const toAdd = files.slice(0, remaining)
                              setPhotoFiles(p => [...p, ...toAdd])
                              setPhotoPreviews(p => [...p, ...toAdd.map(f => URL.createObjectURL(f))])
                            }}/>
                        </label>
                      )}
                    </div>

                    {/* BARBERS */}
                    <div className="team-section">
                      <div style={{fontSize:15,fontWeight:700,marginBottom:6,fontFamily:"Outfit,sans-serif"}}>
                        👥 Ομάδα Barbers
                      </div>
                      {maxBarbers === 1 ? (
                        <div className="locked-box">
                          <p>Το πλάνο <strong>{getPlanLimits(plan).label}</strong> υποστηρίζει <strong>1 barber</strong>.<br/>
                          Αναβάθμισε σε Duo ή Team για να προσθέσεις ομάδα!</p>
                        </div>
                      ) : (
                        <>
                          <div className="limit-badge">
                            👥 Μέγιστο {maxBarbers} barbers ({getPlanLimits(plan).label})
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
                          <button className="add-btn"
                            disabled={barbers.length >= maxBarbers}
                            onClick={()=>{
                              if(barbers.length < maxBarbers)
                                setBarbers(p=>[...p,{name:"",role:"Barber"}])
                            }}>
                            {barbers.length >= maxBarbers
                              ? `✕ Όριο ${maxBarbers} barbers`
                              : `+ Barber (${barbers.length}/${maxBarbers})`}
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}

                <div className="actions">
                  {step > 1 && (
                    <button className="btn ghost" onClick={() => { setError(''); setStep(s=>s-1) }}>← Πίσω</button>
                  )}
                  <button className="btn primary"
                    disabled={!canNext()||loading}
                    onClick={() => {
                      if(!canNext()) return
                      if(step === TOTAL_STEPS) handleFinish()
                      else setStep(s=>s+1)
                    }}>
                    {loading?"⏳ Δημιουργία...":step===TOTAL_STEPS?"Ολοκλήρωση 🚀":"Επόμενο →"}
                  </button>
                </div>
              </>
            ) : (
              /* SUCCESS */
              <div className="success">
                <div className="check-wrap">✓</div>
                <h2>Καλώς ήρθες στο BarberBook! 💈</h2>
                <p>Το κουρείο σου είναι τώρα ζωντανό! Μοιράσου το link σου στο Instagram bio σου.</p>

                {/* SHOP LINK */}
                <div className="link-box">
                  <input readOnly value={shopLink}/>
                  <button className="copy-btn" onClick={() => {
                    navigator.clipboard.writeText(shopLink)
                    alert('✅ Αντιγράφηκε!')
                  }}>Αντιγραφή</button>
                </div>

                <div className="success-card">
                  <div className="sc-row"><span className="sc-label">Κουρείο</span><span className="sc-val">{shopName}</span></div>
                  <div className="sc-row"><span className="sc-label">Πλάνο</span><span className="sc-val">{getPlanLimits(plan).label}</span></div>
                  <div className="sc-row"><span className="sc-label">Πόλη</span><span className="sc-val">{city}</span></div>
                  <div className="sc-row"><span className="sc-label">Υπηρεσίες</span><span className="sc-val">{services.length}</span></div>
                  <div className="sc-row"><span className="sc-label">Φωτογραφίες</span><span className="sc-val">{photoFiles.length}</span></div>
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


{/* CTA SECTION */}
<section style={{
  padding:"5rem 2rem",
  background:"radial-gradient(ellipse 80% 60% at 50% 50%,rgba(30,95,255,0.12),transparent 70%)",
  borderTop:"1px solid var(--line)",
  textAlign:"center"
}}>
  <div style={{maxWidth:700,margin:"0 auto"}}>
    <div style={{
      display:"inline-flex",alignItems:"center",gap:"0.5rem",
      background:"rgba(30,95,255,0.1)",border:"1px solid rgba(30,95,255,0.25)",
      borderRadius:"2rem",padding:"0.4rem 1rem",fontSize:"0.72rem",fontWeight:700,
      color:"var(--light)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"1.5rem"
    }}>✂️ Η Πλατφόρμα Αρ.1 για Barbers</div>

    <h2 style={{
      fontFamily:"'Bebas Neue',sans-serif",
      fontSize:"clamp(2.5rem,7vw,5rem)",
      letterSpacing:"0.03em",lineHeight:0.95,marginBottom:"1rem"
    }}>
      Βρες τον<br/>
      <span style={{
        background:"linear-gradient(120deg,var(--glow),var(--gold2))",
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"
      }}>Καλύτερο Barber</span><br/>
      Κοντά σου
    </h2>

    <p style={{
      fontSize:"1rem",color:"var(--light)",opacity:0.6,
      lineHeight:1.8,maxWidth:480,margin:"0 auto 2rem"
    }}>
      Κλείσε ραντεβού online σε δευτερόλεπτα. Χωρίς κλήσεις, χωρίς αναμονή.
    </p>

    <div style={{display:"flex",justifyContent:"center",gap:"3rem",flexWrap:"wrap",marginBottom:"2.5rem"}}>
      {[
        { num:"50+", label:"Κουρεία" },
        { num:"500+", label:"Ραντεβού" },
        { num:"4.9★", label:"Βαθμολογία" },
      ].map(s => (
        <div key={s.label} style={{textAlign:"center"}}>
          <div style={{
            fontFamily:"'Bebas Neue',sans-serif",fontSize:"2.2rem",
            background:"linear-gradient(120deg,var(--glow),var(--gold))",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"
          }}>{s.num}</div>
          <div style={{fontSize:"0.72rem",color:"var(--light)",opacity:0.5,
            textTransform:"uppercase",letterSpacing:"0.08em",marginTop:"0.2rem"}}>{s.label}</div>
        </div>
      ))}
    </div>

    <div style={{display:"flex",justifyContent:"center",gap:"1rem",flexWrap:"wrap"}}>
      <button onClick={() => window.scrollTo({top:0,behavior:"smooth"})}
        style={{
          padding:"0.9rem 2rem",borderRadius:"0.8rem",border:"none",
          background:"linear-gradient(135deg,#1e5fff,#0a3ab8)",color:"#fff",
          fontSize:"0.95rem",fontWeight:700,cursor:"pointer",
          fontFamily:"'Inter',sans-serif",boxShadow:"0 8px 24px rgba(30,95,255,0.3)"
        }}>
        ✂️ Βρες Barber
      </button>
      <button onClick={() => window.location.href="/businesses"}
        style={{
          padding:"0.9rem 2rem",borderRadius:"0.8rem",
          background:"none",border:"1px solid rgba(168,200,255,0.2)",
          color:"var(--light)",fontSize:"0.95rem",fontWeight:700,
          cursor:"pointer",fontFamily:"'Inter',sans-serif"
        }}>
        Για Επιχειρήσεις →
      </button>
    </div>
  </div>
</section>