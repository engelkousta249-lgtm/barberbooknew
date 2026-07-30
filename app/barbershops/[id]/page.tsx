"use client"
import { use } from "react"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://xcfkhdjiragblsiqetes.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZmtoZGppcmFnYmxzaXFldGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTY0ODYsImV4cCI6MjA5NzI3MjQ4Nn0.EkmgRuYzrvF0A_pgT9vaOouMRKeQ2kasPZxpoIuCgeE"
)

const DOW_SHORT = ["ΔΕΥ","ΤΡΙ","ΤΕΤ","ΠΕΜ","ΠΑΡ","ΣΑΒ","ΚΥΡ"]

const DEFAULT_HERO = [
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=700",
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=700",
]

function slotsInRange(open: string, close: string, isToday: boolean = false) {
  const [oh, om] = open.split(":").map(Number)
  const [ch] = close.split(":").map(Number)
  let cur = oh * 60 + om
  const end = ch * 60
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const out: string[] = []
  while (cur < end) {
    const slot = String(Math.floor(cur/60)).padStart(2,"0") + ":" + String(cur%60).padStart(2,"0")
    if (!isToday || cur > nowMinutes + 30) {
      out.push(slot)
    }
    cur += 30
  }
  return out
}

function nextDays(n: number) {
  const out = []
  const today = new Date()
  const startOffset = today.getHours() >= 20 ? 1 : 0
  for (let i = startOffset; i < n + startOffset; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const jsIdx = (d.getDay() + 6) % 7
    out.push({ date: d, hIdx: jsIdx })
  }
  return out
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("el-GR", { day:"2-digit", month:"2-digit" })
}

function fmtDateISO(d: Date) {
  return d.toISOString().split("T")[0]
}

export default function ShopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [shop, setShop] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<any[]>([])
  const [hours, setHours] = useState<any[]>([])
  const [photos, setPhotos] = useState<string[]>([])
  const [heroImgs, setHeroImgs] = useState<string[]>(DEFAULT_HERO)
  const [barbersList, setBarbersList] = useState<any[]>([])
  const [heroIdx, setHeroIdx] = useState(0)
  const [lightbox, setLightbox] = useState<string|null>(null)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [barberId, setBarberId] = useState<any>(null)
  const [serviceId, setServiceId] = useState<number|null>(null)
  const [svcFilter, setSvcFilter] = useState("Όλες")
  const [dayIndex, setDayIndex] = useState<number|null>(null)
  const [time, setTime] = useState<string|null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [takenSlots, setTakenSlots] = useState<string[]>([])
  const [toast, setToast] = useState("")
  const [viewMonth, setViewMonth] = useState(() => nextDays(7)[0].date)
  const wizardRef = useRef<HTMLDivElement>(null)

  const days = nextDays(7)

  useEffect(() => {
    async function load() {
      // Shop
      const { data: shopData } = await supabase
        .from("barbershops").select("*").eq("id", id).single()
      if (shopData) setShop(shopData)

      // Services
      const { data: svcData } = await supabase
        .from("services").select("*").eq("shop_id", id)
      if (svcData && svcData.length > 0) {
        setServices(svcData.map((s: any, i: number) => ({
          id: i + 1, name: s.name, duration: s.duration_minutes || 30,
          price: s.price, cat: "Υπηρεσίες", sub: ""
        })))
      }

      // Hours
      const { data: hoursData } = await supabase
        .from("working_hours").select("*").eq("shop_id", id).order("day_of_week")
      const dayNames = ["Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο","Κυριακή"]
      if (hoursData && hoursData.length > 0) {
        setHours(hoursData.map((h: any) => ({
          short: dayNames[h.day_of_week].slice(0,3),
          full: dayNames[h.day_of_week],
          active: h.is_active,
          open: h.open_time || "09:00",
          close: h.close_time || "19:00",
        })))
      } else {
        setHours([
          { short:"Δευ", full:"Δευτέρα", active:true, open:"09:00", close:"19:00" },
          { short:"Τρί", full:"Τρίτη", active:true, open:"09:00", close:"19:00" },
          { short:"Τετ", full:"Τετάρτη", active:true, open:"09:00", close:"19:00" },
          { short:"Πέμ", full:"Πέμπτη", active:true, open:"09:00", close:"21:00" },
          { short:"Παρ", full:"Παρασκευή", active:true, open:"09:00", close:"21:00" },
          { short:"Σάβ", full:"Σάββατο", active:true, open:"10:00", close:"16:00" },
          { short:"Κυρ", full:"Κυριακή", active:false, open:"", close:"" },
        ])
      }

      // Photos
      const { data: photosData } = await supabase
        .from("portfolio_photos").select("*").eq("shop_id", id)
      if (photosData && photosData.length > 0) {
        const urls = photosData.map((p: any) => p.url)
        setPhotos(urls)
        setHeroImgs(urls)
      }

      // Barbers
      const { data: barbersData } = await supabase
        .from("barbers").select("*").eq("shop_id", id)
      if (barbersData) setBarbersList(barbersData)

      setLoading(false)
    }
    load()
  }, [id])

  useEffect(() => {
    if (heroImgs.length <= 1) return
    const interval = setInterval(() => {
      setHeroIdx(i => (i + 1) % heroImgs.length)
    }, 3200)
    return () => clearInterval(interval)
  }, [heroImgs])

  useEffect(() => {
    if (dayIndex === null) return
    const date = fmtDateISO(days[dayIndex].date)
    supabase.from("appointments").select("time")
      .eq("barbershop_id", id).eq("date", date).neq("status", "cancelled")
      .then(({ data }) => setTakenSlots(data?.map((a: any) => a.time) || []))
  }, [dayIndex, id])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 2000)
  }

  async function handleSubmit() {
    setSubmitting(true)
    // Check freemium limit
  const { data: shopData } = await supabase
    .from("barbershops").select("plan").eq("id", id).single()
  
  if (shopData?.plan === "freemium" || !shopData?.plan) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const { count } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("barbershop_id", id)
      .neq("status", "cancelled")
      .gte("created_at", startOfMonth)
    
    if ((count || 0) >= 150) {
      showToast("Το κουρείο έχει φτάσει το μηνιαίο όριο κρατήσεων!")
      setSubmitting(false)
      return
    }
  }

  // ... υπόλοιπος κώδικας
    const svc = services.find(s => s.id === serviceId)
    const day = days[dayIndex!]
    const barberName = barbersList.find(b => b.id === barberId)?.name || "Οποιονδήποτε"

    const { error } = await supabase.from("appointments").insert({
      barbershop_id: id,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      service: svc?.name,
      date: fmtDateISO(day.date),
      time: time,
      status: "pending",
    })
    if (error) { showToast("Κάτι πήγε στραβά!"); setSubmitting(false); return }

    
// Στείλε emails
await fetch("/api/send-email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "new_appointment",
    to: email,
    data: {
      shopName: shop.name,
      shopEmail: shop.email,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      service: svc?.name,
      date: fmtDate(day.date),
      time: time,
    }
  })
})
    setDone(true)
    setSubmitting(false)
  }

  // Step 1 valid: αν έχει barbers πρέπει να επιλέξει, αλλιώς auto-pass
  const step1Valid = barbersList.length === 0 || barberId !== null

  const canNext =
    (step === 1 && step1Valid) ||
    (step === 2 && serviceId !== null) ||
    (step === 3 && dayIndex !== null && time !== null) ||
    (step === 4 && name.trim() && phone.trim() && email.trim()) ||
    step === 5

  const svc = services.find(s => s.id === serviceId)
  const day = dayIndex !== null ? days[dayIndex] : null
  const barber = barbersList.find(b => b.id === barberId)
  const cats = ["Όλες", ...Array.from(new Set(services.map(s => s.cat)))]
  const filteredSvcs = services.filter(s => svcFilter === "Όλες" || s.cat === svcFilter)

  // Calendar month bounds (based on available booking window)
  const firstAvailDate = days[0].date
  const lastAvailDate = days[days.length-1].date
  const canPrevMonth = viewMonth.getFullYear() > firstAvailDate.getFullYear() ||
    (viewMonth.getFullYear() === firstAvailDate.getFullYear() && viewMonth.getMonth() > firstAvailDate.getMonth())
  const canNextMonth = viewMonth.getFullYear() < lastAvailDate.getFullYear() ||
    (viewMonth.getFullYear() === lastAvailDate.getFullYear() && viewMonth.getMonth() < lastAvailDate.getMonth())

  if (loading) return (
    <div style={{background:"#070c16",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Inter,sans-serif",color:"#8a97ac"}}>
      ⏳ Φορτώνει...
    </div>
  )

  if (!shop) return (
    <div style={{background:"#070c16",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Inter,sans-serif",color:"#8a97ac"}}>
      ❌ Το κουρείο δεν βρέθηκε
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        :root{--navy-900:#070c16;--navy-800:#0b1424;--navy-700:#101c33;--navy-600:#16233f;--blue:#3b7bff;--blue-soft:rgba(59,123,255,.14);--gold:#d4af37;--gold2:#f0c040;--text:#eaeef6;--muted:#8a97ac;--line:rgba(255,255,255,.08);--green:#3ecf8e;--red:#ff5c72;}
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{font-family:'Inter',sans-serif;background:radial-gradient(1100px 500px at 85% -10%,rgba(59,123,255,.12),transparent 60%),radial-gradient(900px 500px at -10% 110%,rgba(212,175,55,.08),transparent 60%),var(--navy-900);color:var(--text);min-height:100vh;overflow-x:hidden;perspective:1600px;}
        h1,h2,h3{font-family:'Outfit',sans-serif;}
        button,input,textarea{font-family:inherit;}

        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(18px) rotateX(-6deg);}to{opacity:1;transform:translateY(0) rotateX(0);}}
        @keyframes popIn{0%{opacity:0;transform:scale(.6) rotateY(-90deg);}70%{transform:scale(1.08) rotateY(10deg);}100%{opacity:1;transform:scale(1) rotateY(0);}}
        @keyframes pulseRing{0%{box-shadow:0 0 0 0 rgba(59,123,255,.45);}100%{box-shadow:0 0 0 12px rgba(59,123,255,0);}}
        @keyframes pinDrop{0%{transform:translate(-50%,-260%);opacity:0;}70%{transform:translate(-50%,-90%);}100%{transform:translate(-50%,-100%);opacity:1;}}
        @keyframes kenBurns{0%{transform:scale(1) translateZ(0);}100%{transform:scale(1.12) translateZ(0);}}
        @keyframes shine-sweep{0%{background-position:200% 0;}100%{background-position:-50% 0;}}
        @keyframes float-soft{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}
        @keyframes cube-spin{to{transform:rotateY(360deg);}}
        @keyframes glow-breathe{0%,100%{box-shadow:0 0 0 0 rgba(59,123,255,.0),0 10px 30px -10px rgba(0,0,0,.5);}50%{box-shadow:0 0 22px 2px rgba(59,123,255,.25),0 10px 30px -10px rgba(0,0,0,.5);}}

        .wrap{max-width:680px;margin:0 auto;padding-bottom:110px;}

        /* HERO */
        .hero{position:relative;height:230px;overflow:hidden;background:var(--navy-800);perspective:1000px;}
        .hero-slide{position:absolute;inset:0;background-size:cover;background-position:center;transition:opacity .6s;opacity:0;}
        .hero-slide.active{opacity:1;animation:kenBurns 9s ease-in-out infinite alternate;}
        .hero-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:64px;opacity:0.3;}
        .hero-fade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,12,22,0) 40%,var(--navy-900) 100%);}
        .hero-dots{position:absolute;bottom:12px;left:0;right:0;display:flex;justify-content:center;gap:5px;z-index:3;}
        .hero-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.35);transition:.25s;cursor:pointer;}
        .hero-dot.active{background:#fff;width:14px;border-radius:3px;box-shadow:0 0 8px rgba(255,255,255,.6);}
        .back-btn{position:absolute;top:16px;left:16px;width:36px;height:36px;border-radius:50%;background:rgba(7,12,22,.55);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:16px;backdrop-filter:blur(4px);z-index:3;cursor:pointer;color:var(--text);transition:transform .18s ease-out,background .2s;}
        .back-btn:hover{transform:translateY(-2px) scale(1.06);background:rgba(59,123,255,.25);}
        .gallery-chip{position:absolute;bottom:12px;right:14px;background:rgba(7,12,22,.65);border:1px solid var(--line);backdrop-filter:blur(4px);font-size:11px;font-weight:700;padding:6px 11px;border-radius:999px;z-index:3;}

        /* HEADER CARD */
        .header-card{margin:-40px 16px 0;background:linear-gradient(165deg,rgba(16,28,51,0.95),rgba(11,20,36,0.98));border:1px solid var(--line);border-radius:18px;padding:16px;position:relative;z-index:2;animation:fadeSlideIn .55s cubic-bezier(.2,.8,.2,1) both;transform-style:preserve-3d;box-shadow:0 26px 50px -22px rgba(0,0,0,.6);}
        .shop-name-row{font-size:19px;font-weight:800;display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-family:'Outfit',sans-serif;}
        .verified{font-size:10px;font-weight:800;color:var(--navy-900);background:linear-gradient(120deg,var(--gold),var(--gold2));padding:2px 8px;border-radius:999px;box-shadow:0 4px 12px rgba(212,175,55,.35);}
        .shop-meta{font-size:12.5px;color:var(--muted);margin-top:6px;display:flex;gap:12px;flex-wrap:wrap;}
        .stars{color:var(--gold);font-weight:700;}
        .status-pill{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:999px;margin-top:10px;background:rgba(62,207,142,.14);color:var(--green);}
        .status-dot{width:6px;height:6px;border-radius:50%;background:currentColor;animation:pulseRing 1.6s infinite;}

        .section-title{font-size:15px;font-weight:700;margin:26px 16px 12px;display:flex;align-items:center;gap:8px;font-family:'Outfit',sans-serif;}

        /* PORTFOLIO */
        .pf-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 16px 8px;perspective:900px;}
        .pf-item{aspect-ratio:1;border-radius:13px;overflow:hidden;border:1px solid var(--line);cursor:pointer;transform-style:preserve-3d;transition:transform .25s ease-out,box-shadow .25s;}
        .pf-item:hover{transform:translateY(-4px) rotateX(6deg) scale(1.02);box-shadow:0 16px 30px -12px rgba(0,0,0,.6);}
        .pf-item img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s;}
        .pf-item:hover img{transform:scale(1.1);}
        .pf-empty{aspect-ratio:1;border-radius:13px;border:1px dashed var(--line);display:flex;align-items:center;justify-content:center;font-size:24px;opacity:0.3;}

        /* MAP */
        .map-card{margin:0 16px 8px;border-radius:18px;overflow:hidden;border:1px solid var(--line);background:var(--navy-800);transition:box-shadow .25s;}
        .map-card:hover{box-shadow:0 20px 40px -18px rgba(59,123,255,.35);}
        .map-visual{height:150px;position:relative;overflow:hidden;background:linear-gradient(var(--navy-700) 1px,transparent 1px) 0 0/30px 30px,linear-gradient(90deg,var(--navy-700) 1px,transparent 1px) 0 0/30px 30px,var(--navy-600);}
        .map-iframe{width:100%;height:170px;border:0;display:block;filter:grayscale(0.15) contrast(1.05);}
        .map-visual::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 55%,rgba(59,123,255,.16),transparent 60%);}
        .map-road-h{position:absolute;background:rgba(255,255,255,.05);top:38%;left:0;right:0;height:2px;}
        .map-road-v1{position:absolute;background:rgba(255,255,255,.05);left:32%;top:0;bottom:0;width:2px;}
        .map-road-v2{position:absolute;background:rgba(255,255,255,.05);left:68%;top:0;bottom:0;width:2px;}
        .map-pin{position:absolute;top:55%;left:50%;font-size:28px;animation:pinDrop .7s cubic-bezier(.34,1.56,.64,1) both;filter:drop-shadow(0 6px 8px rgba(0,0,0,.4));}
        .map-info{padding:14px 16px;display:flex;justify-content:space-between;align-items:center;gap:10px;}
        .map-address{font-size:13px;font-weight:700;}
        .map-sub{font-size:11.5px;color:var(--muted);margin-top:2px;}
        .map-btn{padding:9px 14px;border-radius:10px;background:var(--blue-soft);border:1px solid rgba(59,123,255,.3);color:#cfe0ff;font-size:12px;font-weight:700;white-space:nowrap;cursor:pointer;text-decoration:none;transition:transform .15s ease-out,background .2s;display:inline-block;}
        .map-btn:hover{transform:translateY(-2px);background:rgba(59,123,255,.3);}

        /* CTA */
        .cta-hero{margin:16px;}
        .btn-start{width:100%;padding:15px;border-radius:14px;border:none;font-size:15px;font-weight:700;background:linear-gradient(135deg,var(--blue),#2a5fd9);color:#fff;cursor:pointer;box-shadow:0 10px 30px -8px rgba(59,123,255,.5);transition:transform .15s ease-out,box-shadow .2s,filter .2s;font-family:'Outfit',sans-serif;transform-style:preserve-3d;}
        .btn-start:hover{filter:brightness(1.08);transform:translateY(-3px) translateZ(6px);box-shadow:0 18px 40px -10px rgba(59,123,255,.6);}
        .btn-start:active{transform:translateY(0) translateZ(0) scale(.98);}

        /* WIZARD STEPPER */
        .wizard{padding:0 16px;perspective:1000px;}
        .stepper{display:flex;align-items:center;margin:18px 0 6px;gap:4px;}
        .step-dot{width:26px;height:26px;border-radius:50%;background:var(--navy-700);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--muted);flex-shrink:0;transition:all .3s cubic-bezier(.2,.8,.2,1);transform-style:preserve-3d;}
        .step-dot.active{background:linear-gradient(135deg,var(--blue),#2a5fd9);border-color:var(--blue);color:#fff;animation:pulseRing 1.6s infinite;box-shadow:0 4px 14px rgba(59,123,255,.4);}
        .step-dot.done{background:linear-gradient(135deg,var(--green),#28a97a);border-color:var(--green);color:var(--navy-900);}
        .step-line{flex:1;height:2px;background:var(--line);transition:background .3s;}
        .step-line.done{background:linear-gradient(90deg,var(--green),rgba(62,207,142,.4));}
        .step-labels{display:flex;justify-content:space-between;font-size:9.5px;color:var(--muted);margin-bottom:16px;}
        .step-labels span{flex:1;text-align:center;}
        .step-labels span:first-child{text-align:left;}
        .step-labels span:last-child{text-align:right;}

        .panel{background:linear-gradient(165deg,rgba(16,28,51,0.9),rgba(11,20,36,0.96));border:1px solid var(--line);border-radius:18px;padding:20px;animation:fadeSlideIn .4s cubic-bezier(.2,.8,.2,1) both;box-shadow:0 24px 50px -24px rgba(0,0,0,.6);transform-style:preserve-3d;}
        .panel h2{font-size:16px;font-weight:700;margin-bottom:4px;font-family:'Outfit',sans-serif;}
        .hint{font-size:12.5px;color:var(--muted);margin-bottom:16px;}

        /* BARBERS */
        .barber-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;perspective:900px;}
        .barber-card{border-radius:14px;border:1.5px solid var(--line);background:var(--navy-700);padding:12px 8px;text-align:center;cursor:pointer;transition:transform .18s ease-out,border-color .18s,background .18s,box-shadow .18s;transform-style:preserve-3d;}
        .barber-card:hover{border-color:rgba(59,123,255,.4);transform:translateY(-4px) rotateX(6deg);box-shadow:0 14px 26px -14px rgba(59,123,255,.4);}
        .barber-card.selected{border-color:var(--blue);background:var(--blue-soft);box-shadow:0 0 0 3px rgba(59,123,255,.15),0 14px 30px -14px rgba(59,123,255,.5);animation:glow-breathe 2.4s ease-in-out infinite;}
        .barber-avatar{width:52px;height:52px;border-radius:50%;margin:0 auto 8px;background:linear-gradient(135deg,var(--blue),var(--gold));display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#fff;transition:transform .2s;}
        .barber-card:hover .barber-avatar{transform:scale(1.08) translateZ(10px);}
        .barber-name{font-size:11.5px;font-weight:700;}
        .barber-role{font-size:9.5px;color:var(--muted);margin-top:2px;}
        .no-barbers{text-align:center;padding:20px;color:var(--muted);}

        /* SERVICE FILTER + CARDS */
        .filter-tabs{display:flex;gap:6px;margin-bottom:14px;overflow-x:auto;scrollbar-width:none;}
        .filter-tabs::-webkit-scrollbar{display:none;}
        .filter-tab{flex-shrink:0;padding:7px 14px;border-radius:999px;font-size:12px;font-weight:700;background:var(--navy-700);border:1px solid var(--line);color:var(--muted);cursor:pointer;transition:all .18s;}
        .filter-tab:hover{color:var(--text);}
        .filter-tab.active{background:linear-gradient(135deg,var(--blue),#2a5fd9);border-color:rgba(59,123,255,.4);color:#fff;box-shadow:0 6px 16px -6px rgba(59,123,255,.45);}
        .svc-card{display:flex;justify-content:space-between;align-items:center;padding:14px;border-radius:13px;border:1.5px solid var(--line);background:var(--navy-700);margin-bottom:10px;cursor:pointer;transition:transform .18s ease-out,border-color .18s,background .18s,box-shadow .18s;transform-style:preserve-3d;}
        .svc-card:hover{border-color:rgba(59,123,255,.4);transform:translateX(3px) translateY(-2px) rotateY(-1.5deg);box-shadow:0 14px 26px -16px rgba(59,123,255,.4);}
        .svc-card.selected{border-color:var(--blue);background:var(--blue-soft);box-shadow:0 0 0 3px rgba(59,123,255,.12),0 14px 30px -16px rgba(59,123,255,.5);}
        .svc-name{font-size:14.5px;font-weight:700;}
        .svc-dur{font-size:12px;color:var(--muted);margin-top:3px;}
        .svc-price{font-size:15px;font-weight:800;color:var(--gold);font-family:'Outfit',sans-serif;background:linear-gradient(120deg,var(--gold),var(--gold2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}

        /* CALENDAR (date picker replacing day-pills) */
        .cal-wrap{margin-bottom:18px;}
        .cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
        .cal-month{font-size:13.5px;font-weight:700;font-family:'Outfit',sans-serif;text-transform:capitalize;}
        .cal-nav-btn{width:30px;height:30px;border-radius:8px;border:1px solid var(--line);background:var(--navy-700);color:var(--muted);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s ease-out;font-size:13px;}
        .cal-nav-btn:hover:not(:disabled){border-color:var(--blue);color:var(--blue);transform:translateY(-2px);}
        .cal-nav-btn:disabled{opacity:.2;cursor:not-allowed;}
        .cal-dow-row{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:6px;}
        .cal-dow{text-align:center;font-size:9.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;padding:4px 0;}
        .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;perspective:900px;}
        .cal-day{aspect-ratio:1;border-radius:10px;border:1.5px solid var(--line);background:var(--navy-700);
          display:flex;align-items:center;justify-content:center;position:relative;transform-style:preserve-3d;
          transition:transform .16s ease-out,border-color .2s,box-shadow .2s,background .2s,opacity .2s;}
        .cal-day-num{font-size:12.5px;font-weight:700;color:var(--muted);transition:color .2s;}
        .cal-day.disabled{opacity:.18;}
        .cal-day.avail{cursor:pointer;border-color:rgba(59,123,255,.25);background:rgba(59,123,255,.06);}
        .cal-day.avail .cal-day-num{color:var(--text);}
        .cal-day.avail:hover{transform:translateY(-3px) rotateX(10deg) scale(1.05);box-shadow:0 14px 26px -12px rgba(59,123,255,.45);border-color:var(--blue);}
        .cal-day.closed{cursor:not-allowed;opacity:.35;}
        .cal-day.closed .cal-day-num{text-decoration:line-through;}
        .cal-day.today:not(.selected){border-color:var(--blue);box-shadow:0 0 0 1px rgba(59,123,255,.35) inset;}
        .cal-day.selected{border-color:var(--blue);background:linear-gradient(160deg,var(--blue),#2a5fd9);
          box-shadow:0 10px 24px -8px rgba(59,123,255,.6);transform:translateY(-2px) scale(1.06);}
        .cal-day.selected .cal-day-num{color:#fff;font-weight:800;}

        .slot-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
        .slot{padding:11px 4px;text-align:center;border-radius:10px;border:1.5px solid var(--line);background:var(--navy-700);font-size:12.5px;font-weight:700;cursor:pointer;transition:transform .15s ease-out,border-color .15s,background .15s,box-shadow .15s;}
        .slot:hover{border-color:rgba(59,123,255,.4);transform:translateY(-2px);}
        .slot.selected{border-color:var(--blue);background:linear-gradient(160deg,var(--blue),#2a5fd9);color:#fff;box-shadow:0 8px 20px -8px rgba(59,123,255,.6);transform:translateY(-2px) scale(1.03);}
        .slot.taken{opacity:.3;text-decoration:line-through;cursor:not-allowed;}
        .slot.taken:hover{transform:none;border-color:var(--line);}

        /* FIELDS */
        .field-group{margin-bottom:14px;}
        .field-group label{font-size:11.5px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.3px;display:block;margin-bottom:6px;}
        .field-group input{width:100%;background:var(--navy-700);border:1px solid var(--line);border-radius:10px;padding:12px 13px;font-size:14px;color:var(--text);transition:border-color .18s,box-shadow .18s;outline:none;}
        .field-group input:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(59,123,255,.15);}
        .field-group input::placeholder{color:var(--muted);}

        /* SUMMARY */
        .summary-row{display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--line);font-size:13.5px;}
        .summary-row:last-of-type{border-bottom:none;}
        .summary-row .lbl{color:var(--muted);}
        .summary-row .val{font-weight:700;text-align:right;}
        .summary-total{display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:14px;border-top:1px solid var(--line);font-size:15px;font-weight:700;}
        .summary-total .amt{font-family:'Outfit',sans-serif;font-size:20px;background:linear-gradient(120deg,var(--gold),var(--gold2) 45%,#fff 55%,var(--gold2) 65%,var(--gold));background-size:250% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shine-sweep 5s linear infinite;}

        /* BOTTOM BAR */
        .bottom-bar{position:fixed;bottom:0;left:0;right:0;z-index:20;background:rgba(11,20,36,.92);backdrop-filter:blur(14px);border-top:1px solid var(--line);padding:12px 18px calc(12px + env(safe-area-inset-bottom));display:flex;justify-content:center;}
        .bottom-bar-in{max-width:680px;width:100%;display:flex;gap:10px;}
        .btn{padding:14px 20px;border-radius:12px;font-size:14.5px;font-weight:700;border:1px solid var(--line);background:var(--navy-700);color:var(--text);cursor:pointer;transition:transform .15s ease-out,border-color .18s;flex-shrink:0;}
        .btn:hover{border-color:var(--blue);transform:translateY(-2px);}
        .btn.primary{background:linear-gradient(135deg,var(--blue),#2a5fd9);border:none;color:#fff;flex:1;box-shadow:0 10px 26px -10px rgba(59,123,255,.5);}
        .btn.primary:disabled{opacity:.4;cursor:not-allowed;box-shadow:none;}
        .btn.primary:disabled:hover{transform:none;}
        .btn.primary:not(:disabled):hover{filter:brightness(1.08);box-shadow:0 16px 34px -10px rgba(59,123,255,.6);}
        .btn.ghost{background:none;}

        /* SUCCESS */
        .success{text-align:center;padding:30px 10px;}
        .check{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--green),#28a97a);color:var(--navy-900);font-size:34px;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;animation:popIn .55s cubic-bezier(.34,1.56,.64,1) both;box-shadow:0 14px 34px -10px rgba(62,207,142,.5);}
        .success h2{font-size:19px;margin-bottom:8px;font-family:'Outfit',sans-serif;}
        .success p{color:var(--muted);font-size:13.5px;margin-bottom:22px;}

        /* LIGHTBOX */
        .lightbox-overlay{position:fixed;inset:0;background:rgba(3,6,12,.86);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:80;padding:24px;}
        .lightbox-img{max-width:100%;max-height:78vh;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.5);animation:popIn .4s cubic-bezier(.34,1.56,.64,1) both;}
        .lightbox-close{position:absolute;top:22px;right:20px;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.1);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;cursor:pointer;transition:transform .15s ease-out,background .2s;}
        .lightbox-close:hover{transform:scale(1.1) rotate(90deg);background:rgba(255,255,255,.2);}

        /* TOAST */
        .toast-bar{position:fixed;bottom:90px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--navy-700);border:1px solid var(--blue);color:var(--text);padding:10px 18px;border-radius:10px;font-size:12.5px;font-weight:600;opacity:0;transition:.25s;pointer-events:none;z-index:50;white-space:nowrap;box-shadow:0 10px 26px -10px rgba(59,123,255,.4);}
        .toast-bar.show{opacity:1;transform:translateX(-50%) translateY(0);}

        @media(max-width:420px){.slot-grid{grid-template-columns:repeat(3,1fr);}.barber-grid{grid-template-columns:repeat(2,1fr);}}
      `}</style>

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
          <img className="lightbox-img" src={lightbox} alt=""/>
        </div>
      )}

      {/* HERO */}
      <div className="hero">
        {heroImgs.length > 0 ? (
          heroImgs.map((img, i) => (
            <div key={i} className={`hero-slide ${heroIdx===i?"active":""}`}
              style={{backgroundImage:`url(${img})`}}/>
          ))
        ) : (
          <div className="hero-empty">💈</div>
        )}
        <div className="hero-fade"/>
        <button className="back-btn" onClick={() => window.history.back()}>←</button>
        {photos.length > 0 && (
          <div className="gallery-chip">📷 {photos.length} φωτογραφίες</div>
        )}
        {heroImgs.length > 1 && (
          <div className="hero-dots">
            {heroImgs.map((_, i) => (
              <div key={i} className={`hero-dot ${heroIdx===i?"active":""}`} onClick={() => setHeroIdx(i)}/>
            ))}
          </div>
        )}
      </div>

      <div className="wrap">
        {/* HEADER */}
        <div className="header-card">
          <div className="shop-name-row">
            {shop.logo_url && (
              <img src={shop.logo_url} alt="logo" style={{width:36,height:36,borderRadius:"50%",objectFit:"cover",border:"2px solid var(--gold)"}}/>
            )}
            {shop.name}
            <span className="verified">✓ VERIFIED</span>
          </div>
          <div className="shop-meta">
            <span className="stars">★ {shop.rating}</span>
            <span>📍 {shop.address}, {shop.city}</span>
            {shop.phone && <span>📞 {shop.phone}</span>}
          </div>
          <div className="status-pill">
            <span className="status-dot"/>Ανοιχτά τώρα
          </div>
        </div>

        {!wizardOpen && (
          <>
            {/* PORTFOLIO */}
            {photos.length > 0 && (
              <>
                <div className="section-title">💈 Πορτφόλιο</div>
                <div className="pf-grid">
                  {photos.map((url, i) => (
                    <div key={i} className="pf-item" onClick={() => setLightbox(url)}>
                      <img src={url} alt="" loading="lazy"/>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* MAP */}
            <div className="section-title">📍 Τοποθεσία</div>
            <div className="map-card">
              <iframe
                className="map-iframe"
                src={`https://www.google.com/maps?q=${encodeURIComponent((shop.address||"") + " " + (shop.city||""))}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Χάρτης τοποθεσίας"
              />
              <div className="map-info">
                <div>
                  <div className="map-address">{shop.address}</div>
                  <div className="map-sub">{shop.city}</div>
                </div>
                <a className="map-btn"
                  href={`https://maps.google.com/?q=${encodeURIComponent((shop.address||"")+" "+(shop.city||""))}`}
                  target="_blank" rel="noopener">
                  Οδηγίες
                </a>
              </div>
            </div>

            {/* CTA */}
            <div className="cta-hero">
              <button className="btn-start" onClick={() => {
                // Αν δεν έχει barbers, auto-select
                if (barbersList.length === 0) setBarberId("any")
                setWizardOpen(true)
                setTimeout(() => wizardRef.current?.scrollIntoView({behavior:"smooth"}), 100)
              }}>
                Κλείσε Ραντεβού →
              </button>
            </div>
          </>
        )}

        {/* WIZARD */}
        {wizardOpen && !done && (
          <div className="wizard" ref={wizardRef}>
            <div className="stepper">
              {[1,2,3,4,5].map((s,i) => (
                <div key={s} style={{display:"flex",alignItems:"center",flex:i<4?1:"unset"}}>
                  <div className={`step-dot ${step===s?"active":""} ${step>s?"done":""}`}>
                    {step>s?"✓":s}
                  </div>
                  {i<4 && <div className={`step-line ${step>s?"done":""}`}/>}
                </div>
              ))}
            </div>
            <div className="step-labels">
              {["Barber","Υπηρεσία","Ώρα","Στοιχεία","Επιβεβαίωση"].map(l => (
                <span key={l}>{l}</span>
              ))}
            </div>

            <div className="panel">
              {/* STEP 1 — BARBER */}
              {step===1 && (
                <>
                  <h2>Επίλεξε Barber</h2>
                  <p className="hint">Ποιον προτιμάς για το ραντεβού σου;</p>
                  {barbersList.length > 0 ? (
                    <div className="barber-grid">
                      {barbersList.map(b => (
                        <div key={b.id}
                          className={`barber-card ${barberId===b.id?"selected":""}`}
                          onClick={() => setBarberId(b.id)}>
                          <div className="barber-avatar">
                            {b.name.slice(0,2).toUpperCase()}
                          </div>
                          <div className="barber-name">{b.name}</div>
                          <div className="barber-role">{b.role || "Barber"}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-barbers">
                      <div style={{fontSize:40,marginBottom:12}}>💈</div>
                      <p style={{fontSize:13}}>Κλείσε με τον διαθέσιμο barber</p>
                    </div>
                  )}
                </>
              )}

              {/* STEP 2 — SERVICE */}
              {step===2 && (
                <>
                  <h2>Επίλεξε Υπηρεσία</h2>
                  <p className="hint">Τι θα ήθελες να κάνεις;</p>
                  {services.length > 1 && (
                    <div className="filter-tabs">
                      {cats.map(c => (
                        <div key={c} className={`filter-tab ${svcFilter===c?"active":""}`}
                          onClick={() => setSvcFilter(c)}>{c}</div>
                      ))}
                    </div>
                  )}
                  {filteredSvcs.length === 0 ? (
                    <p className="hint">Δεν υπάρχουν διαθέσιμες υπηρεσίες</p>
                  ) : filteredSvcs.map(s => (
                    <div key={s.id} className={`svc-card ${serviceId===s.id?"selected":""}`}
                      onClick={() => setServiceId(s.id)}>
                      <div>
                        <div className="svc-name">{s.name}</div>
                        <div className="svc-dur">{s.duration} λεπτά</div>
                      </div>
                      <div className="svc-price">€{s.price}</div>
                    </div>
                  ))}
                </>
              )}

              {/* STEP 3 — DATE & TIME */}
              {step===3 && (
                <>
                  <h2>Ημέρα & Ώρα</h2>
                  <p className="hint">Διαλέξε πότε θέλεις να έρθεις</p>

                  <div className="cal-wrap">
                    <div className="cal-head">
                      <button className="cal-nav-btn" disabled={!canPrevMonth}
                        onClick={() => {
                          const d = new Date(viewMonth)
                          d.setMonth(d.getMonth()-1)
                          setViewMonth(d)
                        }}>←</button>
                      <span className="cal-month">
                        {viewMonth.toLocaleDateString("el-GR",{month:"long",year:"numeric"})}
                      </span>
                      <button className="cal-nav-btn" disabled={!canNextMonth}
                        onClick={() => {
                          const d = new Date(viewMonth)
                          d.setMonth(d.getMonth()+1)
                          setViewMonth(d)
                        }}>→</button>
                    </div>

                    <div className="cal-dow-row">
                      {DOW_SHORT.map(d => <div key={d} className="cal-dow">{d}</div>)}
                    </div>

                    <div className="cal-grid">
                      {(() => {
                        const year = viewMonth.getFullYear()
                        const month = viewMonth.getMonth()
                        const firstDay = new Date(year, month, 1)
                        const lastDay = new Date(year, month+1, 0)
                        let startDow = firstDay.getDay()-1
                        if (startDow < 0) startDow = 6
                        const todayIso = fmtDateISO(new Date())
                        const cells = []
                        for (let i=0; i<startDow; i++) cells.push(<div key={`e${i}`}/>)
                        for (let d=1; d<=lastDay.getDate(); d++) {
                          const iso = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`
                          const availIdx = days.findIndex(dd => fmtDateISO(dd.date) === iso)
                          const avail = availIdx !== -1
                          const dayObj = avail ? days[availIdx] : null
                          const isClosed = avail && !hours[dayObj!.hIdx]?.active
                          const isSelected = avail && dayIndex === availIdx
                          const isToday = iso === todayIso
                          cells.push(
                            <div key={d}
                              className={`cal-day ${avail?"avail":"disabled"} ${isClosed?"closed":""} ${isSelected?"selected":""} ${isToday?"today":""}`}
                              onClick={() => {
                                if (!avail) return
                                if (isClosed) { showToast("Κλειστό αυτή την ημέρα"); return }
                                setDayIndex(availIdx); setTime(null)
                              }}>
                              <span className="cal-day-num">{d}</span>
                            </div>
                          )
                        }
                        return cells
                      })()}
                    </div>
                  </div>

                  {dayIndex===null ? (
                    <p className="hint">Επίλεξε πρώτα ημέρα</p>
                  ) : !hours[days[dayIndex].hIdx]?.active ? (
                    <p className="hint">Κλειστό αυτή την ημέρα</p>
                  ) : (
                    <div className="slot-grid">
                      {slotsInRange(
  hours[days[dayIndex].hIdx].open,
  hours[days[dayIndex].hIdx].close,
  fmtDateISO(days[dayIndex].date) === new Date().toISOString().split("T")[0]
).map(t => (
                        <div key={t}
                          className={`slot ${time===t?"selected":""} ${takenSlots.includes(t)?"taken":""}`}
                          onClick={() => { if (!takenSlots.includes(t)) setTime(t) }}>
                          {t}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* STEP 4 — DETAILS */}
              {step===4 && (
                <>
                  <h2>Τα Στοιχεία σου</h2>
                  <p className="hint">Ώστε το κατάστημα να επικοινωνήσει μαζί σου</p>
                  <div className="field-group">
                    <label>Ονοματεπώνυμο</label>
                    <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="π.χ. Γιώργος Παπαδόπουλος"/>
                  </div>
                  <div className="field-group">
                    <label>Τηλέφωνο</label>
                    <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="π.χ. 6971234567"/>
                  </div>
                  <div className="field-group">
                    <label>Email</label>
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@example.com"/>
                  </div>
                </>
              )}

              {/* STEP 5 — SUMMARY */}
              {step===5 && svc && day && (
                <>
                  <h2>Επιβεβαίωση Ραντεβού</h2>
                  <p className="hint">Έλεγξε τα στοιχεία πριν την οριστικοποίηση</p>
                  <div className="summary-row"><span className="lbl">Κατάστημα</span><span className="val">{shop.name}</span></div>
                  {barbersList.length > 0 && barber && (
                    <div className="summary-row"><span className="lbl">Barber</span><span className="val">{barber.name}</span></div>
                  )}
                  <div className="summary-row"><span className="lbl">Υπηρεσία</span><span className="val">{svc.name}</span></div>
                  <div className="summary-row"><span className="lbl">Ημέρα</span><span className="val">{DOW_SHORT[day.hIdx]}, {fmtDate(day.date)}</span></div>
                  <div className="summary-row"><span className="lbl">Ώρα</span><span className="val">{time}</span></div>
                  <div className="summary-row"><span className="lbl">Πελάτης</span><span className="val">{name}</span></div>
                  <div className="summary-row"><span className="lbl">Τηλέφωνο</span><span className="val">{phone}</span></div>
                  <div className="summary-total"><span>Σύνολο</span><span className="amt">€{svc.price}</span></div>
                </>
              )}
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {done && (
          <div className="panel" style={{margin:"16px 0"}}>
            <div className="success">
              <div className="check">✓</div>
              <h2>Το ραντεβού κλείστηκε!</h2>
              <p>{svc?.name} · {day?fmtDate(day.date):""} · {time}</p>
              <div className="summary-row"><span className="lbl">Κατάστημα</span><span className="val">{shop.name}</span></div>
              <div className="summary-row"><span className="lbl">Υπηρεσία</span><span className="val">{svc?.name}</span></div>
              <div className="summary-row"><span className="lbl">Ημερομηνία</span><span className="val">{day?fmtDate(day.date):""} · {time}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM BAR */}
      {(wizardOpen||done) && (
        <div className="bottom-bar">
          <div className="bottom-bar-in">
            {done ? (
              <button className="btn primary" onClick={() => window.location.href="/"}>🏠 Πίσω στην Αρχική</button>
            ) : (
              <>
                {step>1 && <button className="btn ghost" onClick={() => setStep(s=>s-1)}>← Πίσω</button>}
                <button className="btn primary" disabled={!canNext||submitting}
                  onClick={() => {
                    if(step<5) setStep(s=>s+1)
                    else handleSubmit()
                  }}>
                  {submitting?"⏳ Αποστολή...":step===5?"Οριστικοποίηση Ραντεβού":"Επόμενο →"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className={`toast-bar ${toast?"show":""}`}>{toast}</div>
    </>
  )
}