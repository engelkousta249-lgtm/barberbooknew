"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://xcfkhdjiragblsiqetes.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZmtoZGppcmFnYmxzaXFldGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTY0ODYsImV4cCI6MjA5NzI3MjQ4Nn0.EkmgRuYzrvF0A_pgT9vaOouMRKeQ2kasPZxpoIuCgeE"
)

const DAY_LABELS = ["Δευ","Τρί","Τετ","Πέμ","Παρ","Σάβ","Κυρ"]

type Service = { name:string; price:number }
type Hour = { active:boolean; open:string; close:string }
type Barber = { name:string; role:string }

export default function DuoOnboarding() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [shopLink, setShopLink] = useState("")
  const [shopName, setShopName] = useState("")
  const [city, setCity] = useState("")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [phone, setPhone] = useState("")
  const [street, setStreet] = useState("")
  const [streetNumber, setStreetNumber] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [logoFile, setLogoFile] = useState<File|null>(null)
  const [logoPreview, setLogoPreview] = useState("")
  const [barbers, setBarbers] = useState<Barber[]>([
    {name:"",role:"Barber"},
    {name:"",role:"Barber"},
  ])
  const [services, setServices] = useState<Service[]>([
    {name:"Κούρεμα",price:15},{name:"Fade",price:18}
  ])
  const [hours, setHours] = useState<Hour[]>([
    {active:true,open:"09:00",close:"19:00"},
    {active:true,open:"09:00",close:"19:00"},
    {active:true,open:"09:00",close:"19:00"},
    {active:true,open:"09:00",close:"21:00"},
    {active:true,open:"09:00",close:"21:00"},
    {active:true,open:"10:00",close:"16:00"},
    {active:false,open:"",close:""},
  ])
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])

  const TOTAL_STEPS = 6

  useEffect(() => {
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) { setEmail(user.email||""); setStep(2) }
  })
  const params = new URLSearchParams(window.location.search)
  if (params.get("success") === "true") {
    const sid = params.get("shop")
    if (sid) {
      supabase.from("barbershops")
        .update({ is_active: true })
        .eq("id", sid)
        .then(() => {
          setShopLink(`${window.location.origin}/barbershops/${sid}`)
          setDone(true)
          window.history.replaceState({}, "", "/onboarding/duo")
        })
    }
  }
  if (params.get("cancelled") === "true") {
    setError("Η πληρωμή ακυρώθηκε. Δοκίμασε ξανά.")
    window.history.replaceState({}, "", "/onboarding/duo")
  }
}, [])

  function canNext() {
    if (step===1) return email.trim()!==""&&password.length>=6
    if (step===2) return shopName.trim()!==""&&phone.trim()!==""&&city.trim()!==""
    if (step===3) return services.length>0&&services.every(s=>s.name.trim()!=="")
    if (step===5) return barbers.every(b=>b.name.trim()!=="")
    return true
  }

  async function uploadFile(file:File, path:string) {
    const { error:upErr } = await supabase.storage.from("shop-media").upload(path,file,{upsert:true})
    if (upErr) throw upErr
    const { data } = supabase.storage.from("shop-media").getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSaveAndPay() {
    setLoading(true); setError("")
    try {
      let userId=""
      const { data: { user: existingUser } } = await supabase.auth.getUser()
      if (existingUser) { userId=existingUser.id }
      else {
       const { data: authData, error: authError } = await supabase.auth.signUp({
  email, password, options:{data:{full_name:shopName}}
})
if (authError) { setError(authError.message); setLoading(false); return }
if (!authData.user?.id) { setError("Σφάλμα!"); setLoading(false); return }
userId = authData.user.id
// Auto-login μετά το signUp για να μείνει συνδεδεμένος
await supabase.auth.signInWithPassword({ email, password })
      }

      let logoUrl:string|null=null
      if (logoFile) logoUrl=await uploadFile(logoFile,`${userId}/logo-${Date.now()}`)

      const photoUrls:string[]=[]
      for (let i=0;i<photoFiles.length;i++) {
        photoUrls.push(await uploadFile(photoFiles[i],`${userId}/photo-${Date.now()}-${i}`))
      }

      const fullAddress=`${street} ${streetNumber}, ${postalCode} ${city}`.trim()
      const { data: shop, error: shopErr } = await supabase.from("barbershops").insert({
        name:shopName, phone, address:fullAddress, city,
        email:existingUser?.email||email,
        logo_url:logoUrl, num_barbers:2, plan:"duo",
        is_active:false, // ανενεργό μέχρι πληρωμή
        description:"", rating:5.0,
      }).select().single()
      if (shopErr) { setError("Σφάλμα: "+shopErr.message); setLoading(false); return }

      if (services.length>0) await supabase.from("services").insert(
        services.map(s=>({shop_id:shop.id,name:s.name,price:s.price,duration_minutes:30}))
      )
      await supabase.from("working_hours").insert(
        hours.map((h,i)=>({shop_id:shop.id,day_of_week:i,is_active:h.active,open_time:h.active?h.open:null,close_time:h.active?h.close:null}))
      )
      if (photoUrls.length>0) await supabase.from("portfolio_photos").insert(
        photoUrls.map((url,i)=>({shop_id:shop.id,url,is_cover:i===0}))
      )
      const validBarbers=barbers.filter(b=>b.name.trim())
      if (validBarbers.length>0) await supabase.from("barbers").insert(
        validBarbers.map(b=>({shop_id:shop.id,name:b.name,role:b.role||"Barber"}))
      )
      await supabase.from("profiles").upsert({
        id:userId, full_name:shopName, role:"owner", barbershop_id:shop.id,
      })

      setPaymentLoading(true)
      const res = await fetch("/api/create-checkout", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ plan:"duo", barbershopId:shop.id })
      })
      const { url, error: stripeErr } = await res.json()
      if (stripeErr || !url) { setError("Σφάλμα πληρωμής!"); setLoading(false); setPaymentLoading(false); return }
      window.location.href = url

    } catch(e:any) { setError("Κάτι πήγε στραβά: "+e.message) }
    setLoading(false)
  }

  const stepLabels = ["Λογαριασμός","Κατάστημα","Υπηρεσίες","Ωράριο","Gallery & Ομάδα","Πληρωμή"]
  const stepIcons = ["👤","💈","✂️","🕒","🖼️","💳"]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        :root{--bg:#0a0f1e;--card:#111827;--card2:#1a2235;--border:rgba(255,255,255,.07);--blue:#3b82f6;--blue-soft:rgba(59,130,246,.12);--gold:#f59e0b;--gold-soft:rgba(245,158,11,.12);--text:#f1f5f9;--muted:#64748b;--muted2:#94a3b8;--green:#10b981;--red:#ef4444;}
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;background-image:radial-gradient(ellipse 800px 600px at 20% 0%,rgba(245,158,11,.1),transparent),radial-gradient(ellipse 600px 400px at 80% 100%,rgba(245,158,11,.06),transparent);}
        h1,h2,h3{font-family:'Outfit',sans-serif;}
        button,input{font-family:inherit;}
        .nav{position:fixed;top:0;left:0;right:0;z-index:50;height:60px;padding:0 32px;display:flex;align-items:center;justify-content:space-between;background:rgba(10,15,30,.85);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);}
        .brand{font-size:20px;font-weight:800;background:linear-gradient(135deg,var(--gold),#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;cursor:pointer;}
        .plan-chip{background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.3);border-radius:999px;padding:5px 14px;font-size:12px;font-weight:700;color:var(--gold);}
        .main{min-height:100vh;padding:80px 24px 48px;display:flex;align-items:flex-start;justify-content:center;}
        .container{width:100%;max-width:960px;display:grid;grid-template-columns:260px 1fr;gap:24px;align-items:start;}
        .sidebar{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:28px 20px;position:sticky;top:80px;}
        .sidebar-title{font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:20px;}
        .step-item{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;margin-bottom:6px;border:1px solid transparent;transition:all .2s;}
        .step-item.active{background:var(--gold-soft);border-color:rgba(245,158,11,.25);}
        .step-icon{width:36px;height:36px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:17px;background:var(--card2);border:1px solid var(--border);}
        .step-item.active .step-icon{background:var(--gold-soft);border-color:rgba(245,158,11,.3);}
        .step-item.done .step-icon{background:rgba(16,185,129,.1);border-color:rgba(16,185,129,.25);}
        .step-name{font-size:13px;font-weight:700;color:var(--text);}
        .step-item.active .step-name{color:var(--gold);}
        .step-item.done .step-name{color:var(--green);}
        .progress-wrap{margin-top:20px;padding-top:18px;border-top:1px solid var(--border);}
        .progress-label{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:8px;}
        .progress-bar{height:4px;background:rgba(255,255,255,.06);border-radius:4px;overflow:hidden;}
        .progress-fill{height:100%;background:linear-gradient(90deg,var(--gold),#f59e0b);border-radius:4px;transition:width .4s;}
        .card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:32px;animation:fadeIn .3s ease;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        .card-icon{width:48px;height:48px;border-radius:14px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;font-size:24px;background:var(--gold-soft);border:1px solid rgba(245,158,11,.2);}
        .card-title{font-size:20px;font-weight:700;margin-bottom:6px;}
        .card-sub{font-size:13.5px;color:var(--muted2);line-height:1.6;margin-bottom:24px;}
        .field{margin-bottom:16px;}
        .field label{display:block;font-size:11.5px;font-weight:600;color:var(--muted2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:7px;}
        .field input{width:100%;background:var(--card2);border:1px solid var(--border);border-radius:10px;padding:12px 14px;font-size:14px;color:var(--text);outline:none;transition:all .2s;}
        .field input:focus{border-color:var(--gold);box-shadow:0 0 0 3px var(--gold-soft);}
        .field input::placeholder{color:var(--muted);}
        .field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .pass-wrap{position:relative;}
        .pass-wrap input{padding-right:44px;}
        .pass-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px;padding:4px;}
        .error-box{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:10px;padding:12px 14px;font-size:13px;color:var(--red);margin-bottom:16px;}
        .svc-head{display:grid;grid-template-columns:1fr 80px 32px;gap:8px;font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;font-weight:600;margin-bottom:10px;padding:0 2px;}
        .svc-row{display:grid;grid-template-columns:1fr 80px 32px;gap:8px;align-items:center;margin-bottom:8px;}
        .svc-inp{width:100%;background:var(--card2);border:1px solid var(--border);border-radius:9px;padding:9px 11px;font-size:13.5px;color:var(--text);outline:none;}
        .svc-inp.gold{color:var(--gold);font-weight:700;}
        .del-btn{width:32px;height:32px;border-radius:8px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.15);color:var(--red);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;}
        .add-btn{width:100%;padding:10px;border-radius:10px;border:1.5px dashed rgba(245,158,11,.25);background:rgba(245,158,11,.04);color:var(--gold);font-size:13px;font-weight:600;cursor:pointer;margin-top:8px;}
        .hour-row{display:flex;align-items:center;gap:12px;padding:11px 14px;background:var(--card2);border:1px solid var(--border);border-radius:12px;margin-bottom:8px;}
        .hour-row.off{opacity:.45;}
        .hour-day{font-size:13px;font-weight:700;width:34px;flex-shrink:0;}
        .hour-inp{background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:7px 9px;font-size:12.5px;color:var(--text);font-family:'Inter',sans-serif;outline:none;}
        .hour-sep{color:var(--muted);font-size:12px;}
        .hour-closed{font-size:12px;color:var(--muted);flex:1;}
        .toggle{width:40px;height:22px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid var(--border);position:relative;cursor:pointer;flex-shrink:0;margin-left:auto;transition:all .25s;}
        .toggle::after{content:'';position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:var(--muted);transition:all .25s;}
        .toggle.on{background:rgba(245,158,11,.25);border-color:rgba(245,158,11,.4);}
        .toggle.on::after{left:21px;background:var(--gold);}
        .gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px;}
        .gallery-item{aspect-ratio:1;border-radius:12px;overflow:hidden;position:relative;border:1px solid var(--border);}
        .gallery-item img{width:100%;height:100%;object-fit:cover;display:block;}
        .gallery-del{position:absolute;top:6px;right:6px;width:24px;height:24px;border-radius:50%;background:rgba(239,68,68,.85);border:none;color:#fff;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;}
        .gallery-add{aspect-ratio:1;border-radius:12px;border:2px dashed rgba(245,158,11,.25);background:rgba(245,158,11,.04);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:var(--gold);font-size:12px;font-weight:600;gap:6px;}
        .gallery-add .plus{font-size:24px;}
        .logo-upload{border:2px dashed rgba(245,158,11,.25);border-radius:14px;padding:24px;text-align:center;cursor:pointer;background:rgba(245,158,11,.04);display:block;}
        .logo-preview{width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid var(--gold);margin:0 auto 12px;display:block;}
        .barber-section{margin-top:20px;padding-top:20px;border-top:1px solid var(--border);}
        .barber-section-title{font-size:15px;font-weight:700;margin-bottom:4px;}
        .barber-section-sub{font-size:12px;color:var(--muted);margin-bottom:16px;}
        .barber-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;padding:14px;background:var(--card2);border:1px solid var(--border);border-radius:12px;}
        .barber-num{font-size:11px;color:var(--gold);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;grid-column:1/-1;}
        .payment-box{background:var(--card2);border:1px solid rgba(245,158,11,.3);border-radius:16px;padding:24px;text-align:center;}
        .payment-price{font-family:'Outfit',sans-serif;font-size:48px;font-weight:900;color:var(--gold);margin:12px 0 4px;}
        .payment-period{font-size:14px;color:var(--muted);}
        .payment-features{list-style:none;margin:20px 0;text-align:left;display:flex;flex-direction:column;gap:10px;}
        .payment-features li{font-size:14px;color:var(--muted2);display:flex;align-items:center;gap:10px;}
        .payment-features li::before{content:"✓";color:var(--gold);font-weight:800;font-size:16px;}
        .payment-secure{font-size:11.5px;color:var(--muted);margin-top:16px;display:flex;align-items:center;justify-content:center;gap:6px;}
        .actions{display:flex;gap:10px;margin-top:28px;}
        .btn{padding:13px 24px;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;border:1px solid var(--border);background:var(--card2);color:var(--text);}
        .btn.primary{background:linear-gradient(135deg,var(--gold),#b45309);border:none;color:#1a0f00;flex:1;}
        .btn.primary:disabled{opacity:.4;cursor:not-allowed;}
        .btn.ghost{background:none;flex-shrink:0;}
        .success{text-align:center;padding:20px 0;}
        .check-wrap{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--green),#059669);display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 24px;animation:popIn .5s cubic-bezier(.34,1.56,.64,1) both;}
        @keyframes popIn{0%{opacity:0;transform:scale(0);}70%{transform:scale(1.1);}100%{opacity:1;transform:scale(1);}}
        .success h2{font-size:22px;font-weight:700;margin-bottom:10px;}
        .success p{color:var(--muted2);font-size:14px;margin-bottom:20px;}
        .link-box{background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.25);border-radius:12px;padding:16px;margin-bottom:20px;display:flex;align-items:center;gap:12px;}
        .link-box input{flex:1;background:none;border:none;color:var(--gold);font-size:13px;font-weight:600;outline:none;}
        .copy-btn{padding:8px 14px;background:var(--gold);border:none;color:#1a0f00;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;}
        .success-card{background:var(--card2);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:20px;text-align:left;}
        .sc-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;}
        .sc-row:last-child{border-bottom:none;}
        .sc-label{color:var(--muted2);}
        .sc-val{font-weight:700;}
        @media(max-width:768px){.container{grid-template-columns:1fr;}.sidebar{display:none;}.card{padding:24px 20px;}.field-row{grid-template-columns:1fr;}.barber-row{grid-template-columns:1fr;}}
      `}</style>

      <nav className="nav">
        <div className="brand" onClick={()=>window.location.href="/"}>BarberBook</div>
        <div className="plan-chip">👥 Duo · €24/μήνα</div>
      </nav>

      <div className="main">
        <div className="container">
          {!done && (
            <div className="sidebar">
              <div className="sidebar-title">Βήματα Εγγραφής</div>
              {stepLabels.map((label,i)=>{
                const sNum=i+1
                return (
                  <div key={label} className={`step-item ${step===sNum?"active":""} ${step>sNum?"done":""}`}>
                    <div className="step-icon">{step>sNum?"✓":stepIcons[i]}</div>
                    <div><div className="step-name">{label}</div></div>
                  </div>
                )
              })}
              <div className="progress-wrap">
                <div className="progress-label"><span>Πρόοδος</span><span>{Math.round(((step-1)/TOTAL_STEPS)*100)}%</span></div>
                <div className="progress-bar"><div className="progress-fill" style={{width:`${((step-1)/TOTAL_STEPS)*100}%`}}/></div>
              </div>
            </div>
          )}

          <div className="card">
            {error && <div className="error-box">⚠️ {error}</div>}
            {!done ? (
              <>
                {step===1 && (<>
                  <div className="card-icon">👤</div>
                  <div className="card-title">Δημιούργησε Λογαριασμό</div>
                  <div className="card-sub">Duo πλάνο · 2 barbers · €24/μήνα</div>
                  <div className="field"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@example.com"/></div>
                  <div className="field"><label>Κωδικός</label><div className="pass-wrap"><input type={showPass?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Τουλάχιστον 6 χαρακτήρες"/><button className="pass-eye" type="button" onClick={()=>setShowPass(!showPass)}>{showPass?"🙈":"👁️"}</button></div></div>
                </>)}

                {step===2 && (<>
                  <div className="card-icon">💈</div>
                  <div className="card-title">Στοιχεία Κουρείου</div>
                  <div className="card-sub">Πού βρίσκεται το κουρείο σου;</div>
                  <div className="field"><label>Όνομα Κουρείου</label><input type="text" value={shopName} onChange={e=>setShopName(e.target.value)} placeholder="π.χ. Barbershop Νίκος"/></div>
                  <div className="field-row">
                    <div className="field"><label>Τηλέφωνο</label><input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="69XXXXXXXX"/></div>
                    <div className="field"><label>Πόλη</label><input type="text" value={city} onChange={e=>setCity(e.target.value)} placeholder="π.χ. Αθήνα"/></div>
                  </div>
                  <div className="field-row">
                    <div className="field"><label>Οδός</label><input type="text" value={street} onChange={e=>setStreet(e.target.value)} placeholder="π.χ. Σταδίου"/></div>
                    <div className="field"><label>Αριθμός</label><input type="text" value={streetNumber} onChange={e=>setStreetNumber(e.target.value)} placeholder="15"/></div>
                  </div>
                  <div className="field"><label>ΤΚ</label><input type="text" value={postalCode} onChange={e=>setPostalCode(e.target.value)} placeholder="10431"/></div>
                  <div className="field">
                    <label>Logo (προαιρετικό)</label>
                    {logoPreview ? (
                      <div style={{textAlign:"center"}}><img src={logoPreview} className="logo-preview" alt=""/><button className="btn" style={{fontSize:12,padding:"6px 14px",marginTop:8}} onClick={()=>{setLogoFile(null);setLogoPreview("")}}>Αλλαγή</button></div>
                    ) : (
                      <label className="logo-upload"><div style={{fontSize:32,marginBottom:8}}>🖼️</div><div style={{fontSize:13,color:"var(--muted2)"}}>Ανέβασε το logo σου</div><input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f){setLogoFile(f);setLogoPreview(URL.createObjectURL(f))}}}/></label>
                    )}
                  </div>
                </>)}

                {step===3 && (<>
                  <div className="card-icon">✂️</div>
                  <div className="card-title">Υπηρεσίες</div>
                  <div className="card-sub">Ποιες υπηρεσίες προσφέρεις;</div>
                  <div className="svc-head"><span>Υπηρεσία</span><span>Τιμή €</span><span/></div>
                  {services.map((s,i)=>(<div key={i} className="svc-row"><input className="svc-inp" value={s.name} placeholder="π.χ. Κούρεμα" onChange={e=>{const n=[...services];n[i].name=e.target.value;setServices(n)}}/><input className="svc-inp gold" type="number" value={s.price} onChange={e=>{const n=[...services];n[i].price=+e.target.value;setServices(n)}}/><button className="del-btn" onClick={()=>setServices(p=>p.filter((_,j)=>j!==i))}>✕</button></div>))}
                  <button className="add-btn" onClick={()=>setServices(p=>[...p,{name:"",price:15}])}>+ Προσθήκη Υπηρεσίας</button>
                </>)}

                {step===4 && (<>
                  <div className="card-icon">🕒</div>
                  <div className="card-title">Ωράριο Λειτουργίας</div>
                  <div className="card-sub">Πότε είσαι ανοιχτός;</div>
                  {hours.map((h,i)=>(<div key={i} className={`hour-row ${h.active?"":"off"}`}><span className="hour-day">{DAY_LABELS[i]}</span>{h.active?(<><input type="time" className="hour-inp" value={h.open} onChange={e=>{const n=[...hours];n[i].open=e.target.value;setHours(n)}}/><span className="hour-sep">–</span><input type="time" className="hour-inp" value={h.close} onChange={e=>{const n=[...hours];n[i].close=e.target.value;setHours(n)}}/></>):<span className="hour-closed">Κλειστά</span>}<div className={`toggle ${h.active?"on":""}`} onClick={()=>{const n=[...hours];n[i].active=!n[i].active;if(n[i].active&&!n[i].open){n[i].open="09:00";n[i].close="19:00"}setHours(n)}}/></div>))}
                </>)}

                {step===5 && (<>
                  <div className="card-icon">🖼️</div>
                  <div className="card-title">Gallery & Ομάδα</div>
                  <div className="card-sub">Φωτογραφίες και ονόματα των 2 barbers σου</div>
                  <div className="gallery-grid">
                    {photoPreviews.map((url,i)=>(<div key={i} className="gallery-item"><img src={url} alt=""/><button className="gallery-del" onClick={()=>{setPhotoPreviews(p=>p.filter((_,j)=>j!==i));setPhotoFiles(p=>p.filter((_,j)=>j!==i))}}>✕</button></div>))}
                    {photoPreviews.length<6&&(<label className="gallery-add"><span className="plus">+</span><span>Φωτογραφία</span><input type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>{const files=Array.from(e.target.files||[]);const toAdd=files.slice(0,6-photoFiles.length);setPhotoFiles(p=>[...p,...toAdd]);setPhotoPreviews(p=>[...p,...toAdd.map(f=>URL.createObjectURL(f))])}}/></label>)}
                  </div>
                  <div className="barber-section">
                    <div className="barber-section-title">👥 Ομάδα (Duo)</div>
                    <div className="barber-section-sub">Βάλε τα ονόματα και των 2 barbers</div>
                    {barbers.map((b,i)=>(
                      <div key={i} className="barber-row">
                        <div className="barber-num">Barber {i+1}</div>
                        <input className="svc-inp" value={b.name} placeholder={`π.χ. ${i===0?"Νίκος Π.":"Κώστας Μ."}`} onChange={e=>{const n=[...barbers];n[i].name=e.target.value;setBarbers(n)}}/>
                        <input className="svc-inp" value={b.role} placeholder="Barber" onChange={e=>{const n=[...barbers];n[i].role=e.target.value;setBarbers(n)}}/>
                      </div>
                    ))}
                  </div>
                </>)}

                {step===6 && (<>
                  <div className="card-icon">💳</div>
                  <div className="card-title">Ολοκλήρωση Πληρωμής</div>
                  <div className="card-sub">Ένα βήμα πριν ανοίξει το κουρείο σου!</div>
                  <div className="payment-box">
                    <div style={{fontSize:13,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".8px",fontWeight:700}}>Duo Πλάνο</div>
                    <div className="payment-price">€24</div>
                    <div className="payment-period">ανά μήνα · ακύρωση οποτεδήποτε</div>
                    <ul className="payment-features">
                      <li>2 Barbers</li>
                      <li>Απεριόριστες κρατήσεις</li>
                      <li>Προφίλ καταστήματος</li>
                      <li>Email ειδοποιήσεις</li>
                      <li>Dashboard διαχείρισης</li>
                    </ul>
                    <div className="payment-secure">🔒 Ασφαλής πληρωμή μέσω Stripe</div>
                  </div>
                  <div style={{marginTop:16,background:"var(--card2)",border:"1px solid var(--border)",borderRadius:12,padding:16}}>
                    <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>📋 Σύνοψη</div>
                    <div style={{fontSize:12,color:"var(--muted2)",display:"flex",flexDirection:"column",gap:4}}>
                      <span>🏪 {shopName}</span>
                      <span>📍 {city}</span>
                      <span>✂️ {services.length} υπηρεσίες</span>
                      <span>👥 {barbers.filter(b=>b.name).map(b=>b.name).join(" & ")}</span>
                    </div>
                  </div>
                </>)}

                <div className="actions">
                  {step>1&&<button className="btn ghost" onClick={()=>{setError("");setStep(s=>s-1)}}>← Πίσω</button>}
                  <button className="btn primary" disabled={!canNext()||loading||paymentLoading}
                    onClick={()=>{
                      if(!canNext()) return
                      if(step===TOTAL_STEPS) handleSaveAndPay()
                      else setStep(s=>s+1)
                    }}>
                    {loading||paymentLoading?"⏳ Επεξεργασία...":step===TOTAL_STEPS?"💳 Πληρωμή & Ολοκλήρωση →":"Επόμενο →"}
                  </button>
                </div>
              </>
            ) : (
              <div className="success">
                <div className="check-wrap">✓</div>
                <h2>Το κουρείο σου είναι ζωντανό! 🎉</h2>
                <p>Μοιράσου το link σου στο Instagram bio!</p>
                <div className="link-box"><input readOnly value={shopLink}/><button className="copy-btn" onClick={()=>{navigator.clipboard.writeText(shopLink);alert("✅ Αντιγράφηκε!")}}>Αντιγραφή</button></div>
                <div className="success-card">
                  <div className="sc-row"><span className="sc-label">Κουρείο</span><span className="sc-val">{shopName}</span></div>
                  <div className="sc-row"><span className="sc-label">Πλάνο</span><span className="sc-val">👥 Duo · €24/μήνα</span></div>
                  <div className="sc-row"><span className="sc-label">Barbers</span><span className="sc-val">{barbers.filter(b=>b.name).map(b=>b.name).join(" & ")}</span></div>
                </div>
                <button className="btn primary" style={{width:"100%"}} onClick={()=>window.location.href="/dashboard"}>Πήγαινε στο Dashboard →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}