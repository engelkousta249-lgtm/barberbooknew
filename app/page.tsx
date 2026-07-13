"use client"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://xcfkhdjiragblsiqetes.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZmtoZGppcmFnYmxzaXFldGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTY0ODYsImV4cCI6MjA5NzI3MjQ4Nn0.EkmgRuYzrvF0A_pgT9vaOouMRKeQ2kasPZxpoIuCgeE"
)

function LoginForm({ onSubmit, onSwitch, onGoogle, loading, error }: any) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  return (
    <>
      <h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"2rem",letterSpacing:"0.05em",marginBottom:"0.4rem"}}>Καλώς Ήρθες</h3>
      <p style={{fontSize:"0.82rem",color:"var(--light)",opacity:0.55,marginBottom:"1.8rem"}}>Συνδέσου για να διαχειριστείς τις κρατήσεις σου</p>
      {error && <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"0.5rem",padding:"0.7rem 1rem",fontSize:"0.82rem",color:"#ef4444",marginBottom:"1rem"}}>{error}</div>}
      <div style={{marginBottom:"1.1rem"}}>
        <label style={{display:"block",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--light)",opacity:0.5,marginBottom:"0.4rem"}}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
          style={{width:"100%",padding:"0.75rem 1rem",background:"rgba(10,22,40,0.8)",border:"1px solid rgba(30,95,255,0.2)",borderRadius:"0.7rem",color:"var(--white)",fontFamily:"Inter,sans-serif",fontSize:"0.88rem",outline:"none"}}/>
      </div>
      <div style={{marginBottom:"1.1rem"}}>
        <label style={{display:"block",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--light)",opacity:0.5,marginBottom:"0.4rem"}}>Κωδικός</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
          style={{width:"100%",padding:"0.75rem 1rem",background:"rgba(10,22,40,0.8)",border:"1px solid rgba(30,95,255,0.2)",borderRadius:"0.7rem",color:"var(--white)",fontFamily:"Inter,sans-serif",fontSize:"0.88rem",outline:"none"}}/>
      </div>
      <button disabled={loading} onClick={() => onSubmit(email, password)}
        style={{width:"100%",padding:"0.85rem",background:"linear-gradient(135deg,#1e5fff,#0a3ab8)",border:"none",color:"#fff",borderRadius:"0.8rem",fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:"0.9rem",cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1}}>
        {loading ? "⏳ Σύνδεση..." : "Σύνδεση"}
      </button>
      <div style={{display:"flex",alignItems:"center",gap:"1rem",margin:"1rem 0"}}>
        <div style={{flex:1,height:1,background:"rgba(30,95,255,0.15)"}}/>
        <span style={{fontSize:"0.7rem",color:"var(--light)",opacity:0.4}}>ή</span>
        <div style={{flex:1,height:1,background:"rgba(30,95,255,0.15)"}}/>
      </div>
      <button onClick={onGoogle}
        style={{width:"100%",padding:"0.85rem",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(168,200,255,0.2)",borderRadius:"0.8rem",color:"var(--white)",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:"0.88rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.6rem"}}>
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.2-2.7-.4-4z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.7-2.9-11.9-7.2l-6.5 5C9.5 39.6 16.3 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.6-2.6 4.8-4.9 6.3l6.2 5.2C40.5 36.2 44 30.6 44 24c0-1.3-.2-2.7-.4-4z"/>
        </svg>
        Συνέχεια με Google
      </button>
      <div style={{fontSize:"0.78rem",textAlign:"center",marginTop:"1.2rem",color:"var(--light)",opacity:0.5}}>
        Δεν έχεις λογαριασμό; <a style={{color:"var(--glow)",cursor:"pointer",opacity:1}} onClick={onSwitch}>Εγγραφή →</a>
      </div>
    </>
  )
}

function RegisterForm({ onSubmit, onSwitch, onGoogle, loading, error }: any) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  return (
    <>
      <h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"2rem",letterSpacing:"0.05em",marginBottom:"0.4rem"}}>Δημιουργία Λογαριασμού</h3>
      <p style={{fontSize:"0.82rem",color:"var(--light)",opacity:0.55,marginBottom:"1.8rem"}}>Κλείσε το πρώτο σου ραντεβού σε δευτερόλεπτα</p>
      {error && <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"0.5rem",padding:"0.7rem 1rem",fontSize:"0.82rem",color:"#ef4444",marginBottom:"1rem"}}>{error}</div>}
      <div style={{marginBottom:"1.1rem"}}>
        <label style={{display:"block",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--light)",opacity:0.5,marginBottom:"0.4rem"}}>Ονοματεπώνυμο</label>
        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Νίκος Παπαδόπουλος"
          style={{width:"100%",padding:"0.75rem 1rem",background:"rgba(10,22,40,0.8)",border:"1px solid rgba(30,95,255,0.2)",borderRadius:"0.7rem",color:"var(--white)",fontFamily:"Inter,sans-serif",fontSize:"0.88rem",outline:"none"}}/>
      </div>
      <div style={{marginBottom:"1.1rem"}}>
        <label style={{display:"block",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--light)",opacity:0.5,marginBottom:"0.4rem"}}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
          style={{width:"100%",padding:"0.75rem 1rem",background:"rgba(10,22,40,0.8)",border:"1px solid rgba(30,95,255,0.2)",borderRadius:"0.7rem",color:"var(--white)",fontFamily:"Inter,sans-serif",fontSize:"0.88rem",outline:"none"}}/>
      </div>
      <div style={{marginBottom:"1.1rem"}}>
        <label style={{display:"block",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--light)",opacity:0.5,marginBottom:"0.4rem"}}>Κωδικός</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Τουλάχιστον 6 χαρακτήρες"
          style={{width:"100%",padding:"0.75rem 1rem",background:"rgba(10,22,40,0.8)",border:"1px solid rgba(30,95,255,0.2)",borderRadius:"0.7rem",color:"var(--white)",fontFamily:"Inter,sans-serif",fontSize:"0.88rem",outline:"none"}}/>
      </div>
      <button disabled={loading} onClick={() => onSubmit(fullName, email, password)}
        style={{width:"100%",padding:"0.85rem",background:"linear-gradient(135deg,#1e5fff,#0a3ab8)",border:"none",color:"#fff",borderRadius:"0.8rem",fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:"0.9rem",cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1}}>
        {loading ? "⏳ Δημιουργία..." : "Δημιουργία Λογαριασμού"}
      </button>
      <div style={{display:"flex",alignItems:"center",gap:"1rem",margin:"1rem 0"}}>
        <div style={{flex:1,height:1,background:"rgba(30,95,255,0.15)"}}/>
        <span style={{fontSize:"0.7rem",color:"var(--light)",opacity:0.4}}>ή</span>
        <div style={{flex:1,height:1,background:"rgba(30,95,255,0.15)"}}/>
      </div>
      <button onClick={onGoogle}
        style={{width:"100%",padding:"0.85rem",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(168,200,255,0.2)",borderRadius:"0.8rem",color:"var(--white)",fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:"0.88rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.6rem"}}>
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.2-2.7-.4-4z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.7-2.9-11.9-7.2l-6.5 5C9.5 39.6 16.3 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.6-2.6 4.8-4.9 6.3l6.2 5.2C40.5 36.2 44 30.6 44 24c0-1.3-.2-2.7-.4-4z"/>
        </svg>
        Συνέχεια με Google
      </button>
      <div style={{fontSize:"0.78rem",textAlign:"center",marginTop:"1.2rem",color:"var(--light)",opacity:0.5}}>
        Έχεις ήδη λογαριασμό; <a style={{color:"var(--glow)",cursor:"pointer",opacity:1}} onClick={onSwitch}>Σύνδεση →</a>
      </div>
    </>
  )
}

export default function Home() {
  const [page, setPage] = useState<"home"|"business">("home")
  const [menuOpen, setMenuOpen] = useState(false)
  const [modal, setModal] = useState<""|"login"|"register">("")
  const [barbershops, setBarbershops] = useState<any[]>([])
  const [nearShow, setNearShow] = useState(false)
  const [nearLoading, setNearLoading] = useState(false)
  const [nearResults, setNearResults] = useState<any[]>([])
  const [cuts, setCuts] = useState(13)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState("")
  const [user, setUser] = useState<any>(null)
  const [price, setPrice] = useState(13)
  const [barbers, setBarbers] = useState(1)
  const [noshow, setNoshow] = useState(60)
  const [openFaq, setOpenFaq] = useState<number|null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const revenue = Math.round(cuts * price * barbers * 26 * (noshow / 100) * 0.35)
  const handleLogin = async (email: string, password: string) => {
  setAuthLoading(true)
  setAuthError("")
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) setAuthError(error.message)
  else setModal("")
  setAuthLoading(false)
}

const handleRegister = async (fullName: string, email: string, password: string) => {
  setAuthLoading(true)
  setAuthError("")
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  })
  if (error) setAuthError(error.message)
  else { setModal(""); alert("✅ Επιβεβαίωσε το email σου!") }
  setAuthLoading(false)
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  setUser(null)
}

const handleGoogleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin }
  })
}
  const handleNearMe = () => {
  if (!navigator.geolocation) { alert("Ο browser σου δεν υποστηρίζει geolocation!"); return }
  setNearLoading(true)  
  navigator.geolocation.getCurrentPosition(
    async pos => {
      const { latitude, longitude } = pos.coords
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
        const data = await res.json()
        const cityName = data.address?.city || data.address?.town || data.address?.village || ""
        const nearby = barbershops.filter(b =>
          b.city && cityName && (
            b.city.toLowerCase().includes(cityName.toLowerCase()) ||
            cityName.toLowerCase().includes(b.city.toLowerCase())
          )
        ).slice(0, 4)
        setNearResults(nearby.length > 0 ? nearby : barbershops.slice(0, 4))
        setNearShow(true)
      } catch {
        setNearResults(barbershops.slice(0, 4))
        setNearShow(true)
      }
      setNearLoading(false)
    },
    () => {
      setNearResults(barbershops.slice(0, 4))
      setNearShow(true)
      setNearLoading(false)
    }
  )
}

 useEffect(() => {
  supabase.from("barbershops").select("*")
  .order("created_at", { ascending: false })
  .then(({ data }) => {
    if (data) setBarbershops(data)
if (data) {
  setBarbershops(data)
  console.log("Κουρεία:", data)
}
    })

  supabase.auth.getUser().then(({ data }) => {
    setUser(data.user)
  })
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null)
  })
  return () => listener.subscription.unsubscribe()
}, [])  

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight
    type P = { x: number; y: number; vx: number; vy: number; r: number; o: number; hue: number }
    let particles: P[] = []
    const initP = () => {
      particles = []
      const n = Math.floor(W * H / 20000)
      for (let i = 0; i < n; i++) particles.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: Math.random() * 1.2 + 0.3, o: Math.random() * 0.35 + 0.08, hue: Math.random() > 0.7 ? 45 : 215 })
    }
    initP()
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; initP() }
    window.addEventListener("resize", onResize)
    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue},80%,70%,${p.o})`; ctx.fill()
      })
      for (let i = 0; i < particles.length; i++) for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y, d = Math.sqrt(dx * dx + dy * dy)
        if (d < 110) { ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.strokeStyle = `rgba(30,95,255,${0.055 * (1 - d / 110)})`; ctx.lineWidth = 0.5; ctx.stroke() }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { window.removeEventListener("resize", onResize); cancelAnimationFrame(raf) }
  }, [])

  const shopImages = [
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400",
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400",
    "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400",
    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400",
    "https://images.unsplash.com/photo-1512864084360-7c0c4d0a0c3b?w=400",
    "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400",
  ]

 const featuredStatic: any[] = []
const newStatic: any[] = []

  const faqs = [
    { q: "Πόσο χρόνο χρειάζεται η εγκατάσταση;", a: "Τα περισσότερα καταστήματα είναι online σε 20 λεπτά. Χρειάζεται να προσθέσεις τις υπηρεσίες, τιμές και ωράριο — τίποτα άλλο." },
    { q: "Το δωρεάν πλάνο είναι όντως δωρεάν;", a: "Ναι, εντελώς. Το Freemium πλάνο είναι δωρεάν για πάντα χωρίς πιστωτική κάρτα. Αναβαθμίζεις όποτε είσαι έτοιμος." },
    { q: "Πώς λειτουργούν οι υπενθυμίσεις SMS;", a: "Το BarberBook στέλνει αυτόματα Viber ή SMS στους πελάτες 3 ώρες πριν το ραντεβού. Τα περισσότερα καταστήματα βλέπουν 60–80% λιγότερα no-shows τον πρώτο μήνα." },
    { q: "Μπορώ να διαχειριστώ πολλούς barbers;", a: "Ναι. Το Duo υποστηρίζει 2 barbers και το Team 3+. Κάθε barber έχει το δικό του πρόγραμμα." },
    { q: "Μπορούν οι πελάτες να με βρουν χωρίς εφαρμογή;", a: "Απολύτως. Κάθε κατάστημα παίρνει ένα δημόσιο booking link που μπορείς να μοιραστείς παντού." },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800&display=swap');
        :root{--navy:#050d1a;--deep:#0a1628;--accent:#1e5fff;--glow:#2d7cff;--steel:#4a90d9;--light:#a8c8ff;--white:#f0f6ff;--gold:#c9a84c;--gold2:#e8c870;--green:#22c55e;}
        *{margin:0;padding:0;box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        body{background:var(--navy);color:var(--white);font-family:'Inter',sans-serif;overflow-x:hidden;}
        #bg-canvas{position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;}
        .orb{position:fixed;border-radius:50%;pointer-events:none;filter:blur(80px);z-index:0;}
        .orb1{width:600px;height:600px;background:radial-gradient(circle,rgba(30,95,255,0.12),transparent 70%);top:-200px;left:-200px;animation:orbMove1 12s ease-in-out infinite;}
        .orb2{width:500px;height:500px;background:radial-gradient(circle,rgba(201,168,76,0.08),transparent 70%);bottom:-100px;right:-100px;animation:orbMove2 15s ease-in-out infinite;}
        .orb3{width:400px;height:400px;background:radial-gradient(circle,rgba(30,95,255,0.07),transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);animation:orbMove3 10s ease-in-out infinite;}
        @keyframes orbMove1{0%,100%{transform:translate(0,0);}50%{transform:translate(80px,60px);}}
        @keyframes orbMove2{0%,100%{transform:translate(0,0);}50%{transform:translate(-60px,-40px);}}
        @keyframes orbMove3{0%,100%{transform:translate(-50%,-50%) scale(1);}50%{transform:translate(-50%,-50%) scale(1.3);}}
        .grid-overlay{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(30,95,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(30,95,255,0.025) 1px,transparent 1px);background-size:60px 60px;}

        /* NAV */
        nav{position:fixed;top:0;left:0;right:0;z-index:200;display:flex;align-items:center;justify-content:space-between;padding:1rem 2.5rem;background:rgba(5,13,26,0.82);backdrop-filter:blur(20px);border-bottom:1px solid rgba(30,95,255,0.15);}
        .logo{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:0.08em;background:linear-gradient(120deg,var(--glow),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;cursor:pointer;}
        .nav-links{display:flex;align-items:center;gap:2rem;list-style:none;}
        .nav-links a{color:var(--light);font-size:0.83rem;font-weight:500;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;transition:color 0.3s;opacity:0.8;cursor:pointer;}
        .nav-links a:hover{color:var(--glow);opacity:1;}
        .nav-right{display:flex;align-items:center;gap:0.8rem;}
        .btn-ghost{background:none;border:1px solid rgba(168,200,255,0.25);color:var(--light);padding:0.5rem 1.1rem;border-radius:2rem;font-size:0.8rem;font-weight:500;cursor:pointer;font-family:'Inter',sans-serif;transition:all 0.3s;}
        .btn-ghost:hover{border-color:var(--glow);color:var(--glow);}
        .btn-primary{background:linear-gradient(135deg,var(--accent),#0a3ab8);color:#fff;padding:0.5rem 1.3rem;border-radius:2rem;font-size:0.8rem;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;border:none;box-shadow:0 0 20px rgba(30,95,255,0.35);transition:all 0.3s;}
        .btn-primary:hover{box-shadow:0 0 35px rgba(30,95,255,0.65);transform:translateY(-1px);}
        .hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;background:rgba(255,255,255,0.06);border:1px solid rgba(168,200,255,0.15);border-radius:0.6rem;padding:0.5rem 0.6rem;}
        .hamburger span{display:block;width:22px;height:2px;background:var(--light);transition:all 0.35s;border-radius:2px;}
        .hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg);}
        .hamburger.open span:nth-child(2){opacity:0;}
        .hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}

        /* DRAWER */
        .drawer-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:290;display:none;backdrop-filter:blur(2px);}
        .drawer-overlay.open{display:block;}
        .mob-drawer{position:fixed;top:0;right:0;bottom:0;width:min(320px,85vw);background:rgba(5,13,26,0.97);backdrop-filter:blur(24px);border-left:1px solid rgba(30,95,255,0.18);z-index:300;transform:translateX(110%);transition:transform 0.4s cubic-bezier(0.23,1,0.32,1);display:flex;flex-direction:column;padding:5rem 2rem 2.5rem;box-shadow:-20px 0 60px rgba(0,0,0,0.5);}
        .mob-drawer.open{transform:translateX(0);}
        .drawer-close{position:absolute;top:1.2rem;right:1.2rem;background:rgba(255,255,255,0.06);border:1px solid rgba(168,200,255,0.12);border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;color:var(--light);font-size:1.2rem;cursor:pointer;}
        .drawer-logo{font-family:'Bebas Neue',sans-serif;font-size:2.2rem;background:linear-gradient(120deg,var(--glow),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:2.5rem;}
        .drawer-links{list-style:none;display:flex;flex-direction:column;gap:0.4rem;margin-bottom:2rem;}
        .drawer-links a{display:flex;align-items:center;gap:0.9rem;color:var(--light);font-size:1rem;font-weight:500;text-decoration:none;padding:0.9rem 1rem;border-radius:0.8rem;transition:all 0.25s;cursor:pointer;}
        .drawer-links a:hover{background:rgba(30,95,255,0.12);color:var(--glow);}
        .drawer-divider{height:1px;background:rgba(30,95,255,0.12);margin:0.5rem 0;}
        .drawer-btns{display:flex;flex-direction:column;gap:0.8rem;margin-top:auto;}
        .drawer-btns button{width:100%;padding:0.85rem;font-family:'Inter',sans-serif;font-size:0.9rem;font-weight:700;border-radius:0.9rem;cursor:pointer;}

        /* HERO */
        section{position:relative;z-index:1;}
        .hero{position:relative;z-index:1;min-height:100vh;display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:4rem;padding:7rem 5rem 4rem;overflow:hidden;}
        .hero-left{display:flex;flex-direction:column;}
        .hero-badge{display:inline-flex;align-items:center;gap:0.5rem;background:rgba(30,95,255,0.12);border:1px solid rgba(30,95,255,0.3);padding:0.4rem 1.1rem;border-radius:2rem;font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--light);width:fit-content;margin-bottom:1.5rem;animation:fadeDown 0.8s ease both;}
        .badge-dot{width:6px;height:6px;border-radius:50%;background:var(--glow);box-shadow:0 0 8px var(--glow);animation:pulse 1.5s ease-in-out infinite;}
        .hero h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.8rem,5.5vw,5rem);line-height:0.97;letter-spacing:0.02em;margin-bottom:1.3rem;animation:fadeUp 0.9s 0.2s ease both;}
        .hero h1 .l1{display:block;color:var(--white);}
        .hero h1 .l2{display:block;background:linear-gradient(100deg,var(--glow),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:glow3d 3s ease-in-out infinite alternate;}
        @keyframes glow3d{from{filter:drop-shadow(0 0 15px rgba(30,95,255,0.4));}to{filter:drop-shadow(0 0 45px rgba(30,95,255,0.85));}}
        .hero p{font-size:1rem;color:var(--light);opacity:0.72;line-height:1.75;margin-bottom:2rem;max-width:420px;animation:fadeUp 0.9s 0.35s ease both;}
        .search-wrap{animation:fadeUp 0.9s 0.5s ease both;margin-bottom:2.5rem;}
        .search-box{display:flex;background:rgba(10,22,40,0.9);border:1px solid rgba(30,95,255,0.3);border-radius:3rem;padding:0.45rem 0.45rem 0.45rem 1.4rem;box-shadow:0 0 40px rgba(30,95,255,0.18);backdrop-filter:blur(10px);}
        .search-box input{background:none;border:none;outline:none;color:var(--white);font-size:0.9rem;flex:1;font-family:'Inter',sans-serif;}
        .search-box input::placeholder{color:rgba(168,200,255,0.45);}
        .search-box button{background:linear-gradient(135deg,var(--accent),#0a3ab8);border:none;color:#fff;padding:0.7rem 1.6rem;border-radius:2.5rem;font-family:'Inter',sans-serif;font-weight:600;font-size:0.83rem;cursor:pointer;box-shadow:0 0 18px rgba(30,95,255,0.45);transition:all 0.3s;}
        .near-result{display:none;margin-top:1rem;background:rgba(10,22,40,0.95);border:1px solid rgba(30,95,255,0.25);border-radius:1rem;padding:1rem;backdrop-filter:blur(12px);}
        .near-result.show{display:block;animation:fadeUp 0.4s ease both;}
        .near-row{display:flex;align-items:center;gap:0.8rem;padding:0.65rem 0.5rem;border-bottom:1px solid rgba(30,95,255,0.08);cursor:pointer;border-radius:0.5rem;}
        .near-row:hover{background:rgba(30,95,255,0.08);}
        .near-dot{width:10px;height:10px;border-radius:50%;background:var(--green);box-shadow:0 0 6px var(--green);flex-shrink:0;}
        .nr-name{font-size:0.85rem;font-weight:600;}
        .nr-dist{font-size:0.72rem;color:var(--light);opacity:0.5;margin-left:auto;}
        .nr-stars{font-size:0.72rem;color:var(--gold2);}
        .hero-stats{display:flex;gap:2.5rem;animation:fadeUp 0.9s 0.7s ease both;}
        .stat-num{font-family:'Bebas Neue',sans-serif;font-size:2.2rem;background:linear-gradient(120deg,var(--glow),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1;}
        .stat-lbl{font-size:0.68rem;color:var(--light);opacity:0.55;letter-spacing:0.1em;text-transform:uppercase;margin-top:0.2rem;}
        .hero-right{position:relative;height:560px;animation:fadeUp 1s 0.4s ease both;}
        .hero-photo{width:100%;height:100%;border-radius:2rem;overflow:hidden;position:relative;background:linear-gradient(145deg,#0d1f3a,#091525);box-shadow:0 40px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(30,95,255,0.15);}
        .barber-scene{width:100%;height:100%;position:relative;background:linear-gradient(160deg,#0d1a30 0%,#050d1a 60%,#0a1520 100%);overflow:hidden;display:flex;align-items:flex-end;justify-content:center;}
        .barber-scene::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 40% 30%,rgba(30,95,255,0.13) 0%,transparent 60%),radial-gradient(ellipse at 80% 60%,rgba(201,168,76,0.07) 0%,transparent 50%);}
        .beam{position:absolute;top:0;width:1px;background:linear-gradient(180deg,rgba(30,95,255,0.35),transparent);animation:beamPulse 3s ease-in-out infinite;}
        .beam1{left:30%;height:65%;}.beam2{left:55%;height:48%;animation-delay:-1s;opacity:0.6;}.beam3{left:72%;height:38%;animation-delay:-2s;opacity:0.4;}
        @keyframes beamPulse{0%,100%{opacity:0.3;}50%{opacity:1;}}
        .chair-sil{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:200px;height:280px;background:linear-gradient(180deg,#1a2a45,#0a1628);clip-path:polygon(30% 0%,70% 0%,80% 30%,90% 30%,90% 45%,80% 45%,78% 100%,22% 100%,20% 45%,10% 45%,10% 30%,20% 30%);opacity:0.7;}
        .person-sil{position:absolute;bottom:80px;left:50%;transform:translateX(-35%);width:100px;height:200px;background:linear-gradient(180deg,#1a3060,#0d1f3a);clip-path:polygon(35% 0%,65% 0%,70% 12%,75% 12%,78% 30%,65% 35%,65% 100%,35% 100%,35% 35%,22% 30%,25% 12%,30% 12%);opacity:0.8;}
        .barber-sil{position:absolute;bottom:60px;right:22%;width:80px;height:220px;background:linear-gradient(180deg,#243a6a,#0f2044);clip-path:polygon(30% 0%,70% 0%,72% 15%,80% 15%,82% 40%,70% 45%,68% 100%,32% 100%,30% 45%,18% 40%,20% 15%,28% 15%);opacity:0.75;}
        .scissors-anim{position:absolute;right:18%;bottom:245px;font-size:1.8rem;animation:scissorSnip 1.5s ease-in-out infinite;filter:drop-shadow(0 0 10px var(--glow));}
        @keyframes scissorSnip{0%,100%{transform:rotate(-10deg) scale(1);}50%{transform:rotate(10deg) scale(1.1);}}
        .barber-pole{position:absolute;top:2rem;right:2rem;width:28px;height:120px;border-radius:14px;overflow:hidden;box-shadow:0 0 20px rgba(30,95,255,0.4);background:#0a1628;}
        .pole-stripe{position:absolute;width:200%;height:200%;background:repeating-linear-gradient(60deg,rgba(30,95,255,0.8) 0px,rgba(30,95,255,0.8) 8px,transparent 8px,transparent 16px,rgba(255,255,255,0.15) 16px,rgba(255,255,255,0.15) 24px,transparent 24px,transparent 32px);animation:poleRotate 2s linear infinite;}
        @keyframes poleRotate{from{transform:translateY(0);}to{transform:translateY(-32px);}}
        .scene-label{position:absolute;bottom:2rem;left:50%;transform:translateX(-50%);background:rgba(10,22,40,0.82);backdrop-filter:blur(12px);border:1px solid rgba(30,95,255,0.25);border-radius:3rem;padding:0.6rem 1.4rem;font-size:0.78rem;color:var(--light);opacity:0.85;white-space:nowrap;animation:floatLabel 4s ease-in-out infinite;}
        @keyframes floatLabel{0%,100%{transform:translateX(-50%) translateY(0);}50%{transform:translateX(-50%) translateY(-6px);}}

        /* BARBERS */
        .barbers{padding:6rem 0;position:relative;z-index:1;}
        .barbers-inner{padding:0 2rem;}
        .section-label{text-align:center;font-size:0.72rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--glow);margin-bottom:0.8rem;}
        .section-title{text-align:center;font-family:'Bebas Neue',sans-serif;font-size:clamp(2.5rem,5vw,3.8rem);letter-spacing:0.05em;margin-bottom:0.8rem;}
        .section-sub{text-align:center;color:var(--light);opacity:0.6;font-size:0.92rem;max-width:500px;margin:0 auto 4rem;line-height:1.7;}
        .scroll-section{margin-bottom:3.5rem;}
        .scroll-header{display:flex;align-items:baseline;justify-content:space-between;max-width:calc(100% - 4rem);margin:0 auto 1.2rem;padding:0 0.2rem;}
        .scroll-header h3{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:0.05em;color:var(--white);}
        .scroll-header span{font-size:0.75rem;color:var(--glow);opacity:0.8;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;}
        .cards{display:flex;flex-direction:row;gap:1.2rem;overflow-x:auto;padding:0.5rem 2rem 1.2rem;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
        .cards::-webkit-scrollbar{display:none;}
        .card{background:rgba(10,22,40,0.7);border:1px solid rgba(30,95,255,0.1);border-radius:1.2rem;overflow:hidden;transition:all 0.45s cubic-bezier(0.23,1,0.32,1);position:relative;cursor:pointer;min-width:240px;max-width:240px;flex-shrink:0;scroll-snap-align:start;}
        .card:hover{transform:translateY(-10px);box-shadow:0 28px 70px rgba(30,95,255,0.22),0 0 0 1px rgba(30,95,255,0.28);}
        .card-img{height:175px;display:flex;align-items:center;justify-content:center;font-size:4.5rem;position:relative;overflow:hidden;}
        .card-img::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(5,13,26,0.85));}
        .card-emoji{transition:transform 0.5s;filter:drop-shadow(0 0 18px rgba(30,95,255,0.4));}
        .card:hover .card-emoji{transform:scale(1.12);}
        .certified{position:absolute;top:0.6rem;left:0.6rem;z-index:2;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#1a0f00;font-size:0.6rem;font-weight:700;padding:0.2rem 0.55rem;border-radius:1rem;letter-spacing:0.06em;}
        .card-body{padding:1.1rem;}
        .card-avatar{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--steel));display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-top:-26px;margin-bottom:0.6rem;border:3px solid var(--navy);position:relative;z-index:1;box-shadow:0 0 14px rgba(30,95,255,0.35);}
        .card h4{font-size:0.95rem;font-weight:700;margin-bottom:0.25rem;color:var(--white);}
        .card .loc{font-size:0.72rem;color:var(--light);opacity:0.5;margin-bottom:0.7rem;}
        .card-stars{display:flex;align-items:center;gap:0.35rem;font-size:0.75rem;color:var(--gold2);margin-bottom:0.9rem;}
        .book-btn{width:100%;padding:0.6rem;background:linear-gradient(135deg,rgba(30,95,255,0.12),rgba(30,95,255,0.04));border:1px solid rgba(30,95,255,0.28);border-radius:0.65rem;color:var(--glow);font-size:0.76rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;font-family:'Inter',sans-serif;transition:all 0.3s;}
        .book-btn:hover{background:linear-gradient(135deg,var(--accent),#0a3ab8);border-color:var(--accent);color:#fff;box-shadow:0 6px 22px rgba(30,95,255,0.35);}

        /* PHOTO BANNER */
        .photo-banner{position:relative;z-index:1;margin:0 2rem 4rem;border-radius:2rem;overflow:hidden;min-height:520px;display:grid;grid-template-columns:1fr 1fr;align-items:center;background:linear-gradient(135deg,#050d1a,#0d1f3a);border:1px solid rgba(30,95,255,0.18);box-shadow:0 40px 80px rgba(0,0,0,0.5);}
        .pb-photo{position:relative;height:100%;min-height:520px;overflow:hidden;}
        .pb-photo img{width:100%;height:100%;object-fit:cover;object-position:center top;filter:brightness(0.75) saturate(0.9);transition:transform 6s ease;}
        .photo-banner:hover .pb-photo img{transform:scale(1.04);}
        .pb-photo::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent 55%,#050d1a 100%);}
        .pb-chip{position:absolute;z-index:10;background:rgba(10,22,40,0.9);backdrop-filter:blur(14px);border:1px solid rgba(30,95,255,0.28);border-radius:0.9rem;padding:0.7rem 1rem;}
        .pb-chip1{top:1.8rem;right:1.5rem;animation:floatLabel 4s ease-in-out infinite;}
        .pb-chip2{bottom:1.8rem;right:1.5rem;animation:floatLabel 5s ease-in-out infinite;animation-delay:-2s;}
        .chip-label{font-size:0.58rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--light);opacity:0.45;margin-bottom:0.35rem;}
        .chip-row{display:flex;align-items:center;gap:0.5rem;}
        .chip-ava{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--steel));display:flex;align-items:center;justify-content:center;font-size:0.75rem;}
        .chip-title{font-size:0.78rem;font-weight:700;color:var(--white);}
        .chip-sub{font-size:0.62rem;color:var(--light);opacity:0.5;margin-top:0.1rem;}
        .chip-badge{display:inline-block;font-size:0.58rem;font-weight:700;padding:0.12rem 0.5rem;border-radius:1rem;margin-top:0.35rem;}
        .badge-g{background:rgba(34,197,94,0.14);color:var(--green);border:1px solid rgba(34,197,94,0.28);}
        .badge-b{background:rgba(30,95,255,0.14);color:var(--glow);border:1px solid rgba(30,95,255,0.28);}
        .pb-content{padding:3.5rem 3rem 3.5rem 2rem;position:relative;z-index:2;}
        .pb-tag{display:inline-flex;align-items:center;gap:0.5rem;background:rgba(30,95,255,0.14);border:1px solid rgba(30,95,255,0.3);padding:0.35rem 1rem;border-radius:2rem;font-size:0.68rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--light);margin-bottom:1.5rem;}
        .pb-content h2{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.2rem,4vw,3.4rem);letter-spacing:0.04em;line-height:1;margin-bottom:1rem;}
        .pb-content h2 em{display:block;background:linear-gradient(100deg,var(--glow),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-style:normal;}
        .pb-content p{font-size:0.92rem;color:var(--light);opacity:0.62;line-height:1.75;margin-bottom:2rem;max-width:340px;}
        .pb-stats{display:flex;gap:2rem;margin-bottom:2.2rem;}
        .ps-num{font-family:'Bebas Neue',sans-serif;font-size:2rem;background:linear-gradient(120deg,var(--glow),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1;}
        .ps-lbl{font-size:0.65rem;color:var(--light);opacity:0.5;letter-spacing:0.1em;text-transform:uppercase;margin-top:0.15rem;}
        .pb-cta-row{display:flex;gap:0.8rem;flex-wrap:wrap;}
        .pb-btn{padding:0.75rem 1.8rem;border-radius:2rem;font-size:0.85rem;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;text-decoration:none;display:inline-flex;align-items:center;gap:0.45rem;transition:all 0.3s;border:none;}
        .pb-btn.fill{background:linear-gradient(135deg,var(--accent),#0a3ab8);color:#fff;box-shadow:0 0 22px rgba(30,95,255,0.4);}
        .pb-btn.fill:hover{box-shadow:0 0 38px rgba(30,95,255,0.7);transform:translateY(-2px);}
        .pb-btn.out{background:none;border:1px solid rgba(168,200,255,0.22);color:var(--light);}
        .pb-btn.out:hover{border-color:var(--glow);color:var(--glow);}

        /* BUSINESS PAGE */
        .biz-hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:8rem 2rem 5rem;position:relative;z-index:1;}
        .biz-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(30,95,255,0.1),transparent 65%);}
        .biz-social-proof{display:flex;align-items:center;gap:0.8rem;margin-bottom:2rem;animation:fadeDown 0.8s ease both;}
        .biz-avatars{display:flex;}
        .bav{width:32px;height:32px;border-radius:50%;border:2px solid var(--navy);background:linear-gradient(135deg,var(--accent),var(--steel));display:flex;align-items:center;justify-content:center;font-size:0.9rem;margin-left:-8px;}
        .bav:first-child{margin-left:0;}
        .biz-social-proof span{font-size:0.82rem;color:var(--light);opacity:0.7;}
        .biz-hero h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(3.5rem,9vw,7.5rem);line-height:0.93;letter-spacing:0.03em;margin-bottom:1.5rem;animation:fadeUp 0.9s 0.2s ease both;}
        .bhl1{display:block;color:var(--white);}
        .bhl2{display:block;background:linear-gradient(100deg,var(--glow),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 35px rgba(30,95,255,0.55));animation:glow3d 3s ease-in-out infinite alternate;}
        .biz-hero p{font-size:1.05rem;color:var(--light);opacity:0.68;max-width:560px;line-height:1.75;margin-bottom:2.5rem;animation:fadeUp 0.9s 0.4s ease both;}
        .biz-cta-row{display:flex;gap:1rem;justify-content:center;animation:fadeUp 0.9s 0.55s ease both;}
        .btn-big{padding:0.85rem 2.2rem;border-radius:3rem;font-size:0.92rem;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;letter-spacing:0.04em;display:inline-flex;align-items:center;gap:0.5rem;transition:all 0.3s;border:none;}
        .btn-big.primary{background:linear-gradient(135deg,var(--accent),#0a3ab8);color:#fff;box-shadow:0 0 30px rgba(30,95,255,0.45);}
        .btn-big.primary:hover{box-shadow:0 0 50px rgba(30,95,255,0.75);transform:translateY(-2px);}
        .btn-big.ghost{background:none;border:1px solid rgba(168,200,255,0.25);color:var(--light);}
        .btn-big.ghost:hover{border-color:var(--glow);color:var(--glow);}

        /* TICKER */
        .ticker-wrap{background:rgba(30,95,255,0.06);border-top:1px solid rgba(30,95,255,0.12);border-bottom:1px solid rgba(30,95,255,0.12);padding:0.8rem 0;overflow:hidden;position:relative;z-index:1;}
        .ticker-inner{display:flex;gap:3rem;white-space:nowrap;animation:tickerScroll 25s linear infinite;}
        .ticker-item{font-size:0.78rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--light);opacity:0.55;flex-shrink:0;}
        .ticker-item span{color:var(--glow);opacity:1;font-weight:600;}
        @keyframes tickerScroll{from{transform:translateX(0);}to{transform:translateX(-50%);}}

        /* CALCULATOR */
        .calc-section{padding:6rem 2rem;max-width:900px;margin:0 auto;position:relative;z-index:1;}
        .calc-box{background:rgba(10,22,40,0.8);border:1px solid rgba(30,95,255,0.2);border-radius:1.5rem;padding:3rem;box-shadow:0 0 60px rgba(30,95,255,0.08);}
        .calc-box h3{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:0.05em;margin-bottom:0.5rem;}
        .calc-box>p{font-size:0.88rem;color:var(--light);opacity:0.55;margin-bottom:2.5rem;}
        .calc-grid{display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-bottom:2rem;}
        .calc-field label{display:block;font-size:0.72rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--light);opacity:0.55;margin-bottom:0.5rem;}
        .calc-field input[type=range]{width:100%;-webkit-appearance:none;height:4px;background:rgba(30,95,255,0.2);border-radius:2px;outline:none;}
        .calc-field input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--glow));cursor:pointer;box-shadow:0 0 10px rgba(30,95,255,0.5);}
        .calc-val{font-family:'Bebas Neue',sans-serif;font-size:1.4rem;color:var(--glow);margin-top:0.4rem;}
        .calc-result{background:linear-gradient(135deg,rgba(30,95,255,0.12),rgba(30,95,255,0.04));border:1px solid rgba(30,95,255,0.25);border-radius:1rem;padding:1.5rem;text-align:center;}
        .cr-label{font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--light);opacity:0.5;margin-bottom:0.5rem;}
        .cr-num{font-family:'Bebas Neue',sans-serif;font-size:3rem;letter-spacing:0.05em;background:linear-gradient(120deg,var(--glow),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .cr-sub{font-size:0.78rem;color:var(--light);opacity:0.45;margin-top:0.3rem;}

        /* FEATURES */
        .features-section{padding:6rem 2rem;max-width:1100px;margin:0 auto;position:relative;z-index:1;}
        .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;}
        .feat-card{background:rgba(10,22,40,0.65);border:1px solid rgba(30,95,255,0.12);border-radius:1.2rem;padding:2rem;transition:all 0.4s;position:relative;overflow:hidden;}
        .feat-card:hover{transform:translateY(-6px);border-color:rgba(30,95,255,0.3);box-shadow:0 20px 50px rgba(30,95,255,0.15);}
        .feat-icon{font-size:2rem;margin-bottom:1rem;display:block;filter:drop-shadow(0 0 10px var(--glow));}
        .feat-card h4{font-family:'Bebas Neue',sans-serif;font-size:1.25rem;letter-spacing:0.05em;margin-bottom:0.6rem;}
        .feat-card p{font-size:0.82rem;color:var(--light);opacity:0.55;line-height:1.65;}

        /* STEPS */
        .biz-steps{padding:5rem 2rem;max-width:900px;margin:0 auto;position:relative;z-index:1;}
        .biz-step-row{display:flex;gap:2rem;align-items:flex-start;margin-bottom:2.5rem;position:relative;}
        .biz-step-row:not(:last-child)::after{content:'';position:absolute;left:22px;top:52px;width:2px;height:calc(100% + 1rem);background:linear-gradient(180deg,rgba(30,95,255,0.3),transparent);}
        .step-num{width:46px;height:46px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,var(--accent),#0a3ab8);display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:1.3rem;box-shadow:0 0 20px rgba(30,95,255,0.35);}
        .step-body h4{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:0.04em;margin-bottom:0.4rem;}
        .step-body p{font-size:0.85rem;color:var(--light);opacity:0.55;line-height:1.65;}

        /* PRICING */
        .pricing-section{padding:6rem 2rem;max-width:1000px;margin:0 auto;position:relative;z-index:1;}
        .pricing-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.2rem;}
        .price-card{background:rgba(10,22,40,0.7);border:1px solid rgba(30,95,255,0.12);border-radius:1.3rem;padding:2rem 1.8rem;transition:all 0.4s;position:relative;overflow:hidden;}
        .price-card.popular{border-color:rgba(30,95,255,0.4);box-shadow:0 0 40px rgba(30,95,255,0.15);}
        .pop-label{position:absolute;top:0;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,var(--accent),#0a3ab8);color:#fff;font-size:0.65rem;font-weight:700;padding:0.25rem 1rem;border-radius:0 0 0.75rem 0.75rem;letter-spacing:0.08em;}
        .price-card:hover{transform:translateY(-6px);border-color:rgba(30,95,255,0.35);box-shadow:0 20px 50px rgba(30,95,255,0.15);}
        .price-name{font-size:0.75rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--light);opacity:0.55;margin-bottom:0.8rem;margin-top:1rem;}
        .price-amount{font-family:'Bebas Neue',sans-serif;font-size:3rem;letter-spacing:0.04em;line-height:1;}
        .price-amount sup{font-size:1.2rem;vertical-align:super;}
        .price-period{font-size:0.72rem;color:var(--light);opacity:0.45;margin-bottom:1.5rem;}
        .price-features{list-style:none;margin-bottom:2rem;}
        .price-features li{font-size:0.82rem;color:var(--light);opacity:0.7;padding:0.4rem 0;border-bottom:1px solid rgba(30,95,255,0.06);display:flex;align-items:center;gap:0.5rem;}
        .price-features li::before{content:'✓';color:var(--green);font-weight:700;flex-shrink:0;}
        .price-btn{width:100%;padding:0.75rem;border-radius:0.8rem;font-family:'Inter',sans-serif;font-weight:700;font-size:0.83rem;cursor:pointer;transition:all 0.3s;border:none;}
        .price-btn.outline{background:none;border:1px solid rgba(30,95,255,0.3);color:var(--glow);}
        .price-btn.filled{background:linear-gradient(135deg,var(--accent),#0a3ab8);color:#fff;box-shadow:0 6px 20px rgba(30,95,255,0.3);}
        .price-btn:hover{transform:translateY(-2px);}

        /* TESTIMONIALS */
        .testimonials{padding:6rem 2rem;max-width:1100px;margin:0 auto;position:relative;z-index:1;}
        .test-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;}
        .test-card{background:rgba(10,22,40,0.65);border:1px solid rgba(30,95,255,0.12);border-radius:1.2rem;padding:1.8rem;transition:all 0.4s;}
        .test-card:hover{transform:translateY(-4px);border-color:rgba(30,95,255,0.28);box-shadow:0 16px 45px rgba(30,95,255,0.12);}
        .test-stars{color:var(--gold2);font-size:0.85rem;margin-bottom:0.8rem;}
        .test-quote{font-size:0.88rem;color:var(--light);opacity:0.72;line-height:1.7;margin-bottom:1.2rem;font-style:italic;}
        .test-author{display:flex;align-items:center;gap:0.7rem;}
        .test-ava{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--steel));display:flex;align-items:center;justify-content:center;font-size:1rem;}
        .test-name{font-size:0.82rem;font-weight:600;}
        .test-shop{font-size:0.68rem;color:var(--light);opacity:0.45;}

        /* FAQ */
        .faq-section{padding:6rem 2rem;max-width:720px;margin:0 auto;position:relative;z-index:1;}
        .faq-item{border-bottom:1px solid rgba(30,95,255,0.1);padding:1.2rem 0;cursor:pointer;}
        .faq-q{display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:0.95rem;}
        .faq-arrow{color:var(--glow);transition:transform 0.3s;font-size:1.2rem;}
        .faq-arrow.open{transform:rotate(45deg);}
        .faq-a{font-size:0.85rem;color:var(--light);opacity:0.6;line-height:1.7;max-height:0;overflow:hidden;transition:max-height 0.4s ease,padding 0.3s;}
        .faq-a.open{max-height:200px;padding-top:0.8rem;}

        /* BIZ BOTTOM CTA */
        .biz-bottom-cta{padding:6rem 2rem;text-align:center;position:relative;z-index:1;background:linear-gradient(180deg,transparent,rgba(30,95,255,0.05),transparent);}
        .biz-bottom-cta h2{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.5rem,6vw,5rem);letter-spacing:0.04em;margin-bottom:1rem;}
        .biz-bottom-cta p{color:var(--light);opacity:0.6;font-size:0.95rem;max-width:480px;margin:0 auto 2.5rem;line-height:1.7;}

        /* MODAL */
        .modal-overlay{position:fixed;inset:0;z-index:500;background:rgba(5,13,26,0.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;}
        .modal-box{background:var(--deep);border:1px solid rgba(30,95,255,0.25);border-radius:1.5rem;padding:2.5rem;width:100%;max-width:420px;position:relative;animation:fadeUp 0.35s ease both;box-shadow:0 0 80px rgba(30,95,255,0.15);}
        .modal-close{position:absolute;top:1rem;right:1rem;background:none;border:none;color:var(--light);opacity:0.5;font-size:1.4rem;cursor:pointer;}
        .modal-box h3{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:0.05em;margin-bottom:0.4rem;}
        .modal-sub{font-size:0.82rem;color:var(--light);opacity:0.55;margin-bottom:1.8rem;}
        .form-field{margin-bottom:1.1rem;}
        .form-field label{display:block;font-size:0.72rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--light);opacity:0.5;margin-bottom:0.4rem;}
        .form-field input{width:100%;padding:0.75rem 1rem;background:rgba(10,22,40,0.8);border:1px solid rgba(30,95,255,0.2);border-radius:0.7rem;color:var(--white);font-family:'Inter',sans-serif;font-size:0.88rem;outline:none;transition:border-color 0.3s;}
        .form-field input:focus{border-color:var(--glow);}
        .form-submit{width:100%;padding:0.85rem;margin-top:0.5rem;background:linear-gradient(135deg,var(--accent),#0a3ab8);border:none;color:#fff;border-radius:0.8rem;font-family:'Inter',sans-serif;font-weight:700;font-size:0.9rem;cursor:pointer;box-shadow:0 0 25px rgba(30,95,255,0.4);transition:all 0.3s;}
        .form-submit:hover{box-shadow:0 0 40px rgba(30,95,255,0.65);}
        .modal-switch{font-size:0.78rem;text-align:center;margin-top:1.2rem;color:var(--light);opacity:0.5;}
        .modal-switch a{color:var(--glow);cursor:pointer;opacity:1;}

        /* FOOTER */
        footer{border-top:1px solid rgba(30,95,255,0.1);padding:2.5rem 3rem;display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1;}
        .flogo{font-family:'Bebas Neue',sans-serif;font-size:1.7rem;background:linear-gradient(120deg,var(--glow),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .flinks{display:flex;gap:2rem;list-style:none;}
        .flinks a{color:var(--light);opacity:0.5;font-size:0.8rem;text-decoration:none;transition:opacity 0.3s;cursor:pointer;}
        .flinks a:hover{opacity:1;color:var(--glow);}

        @keyframes fadeUp{from{opacity:0;transform:translateY(25px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-15px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.5);opacity:0.6;}}

        @media(max-width:1024px){
          .hero{grid-template-columns:1fr;gap:3rem;padding:7rem 2rem 4rem;text-align:center;}
          .hero-left{align-items:center;}
          .hero-right{height:360px;width:100%;max-width:460px;margin:0 auto;}
          .pricing-grid{grid-template-columns:1fr 1fr;}
          .test-grid{grid-template-columns:1fr 1fr;}
          .feat-grid{grid-template-columns:1fr 1fr;}
          .photo-banner{grid-template-columns:1fr;margin:0 1rem 3rem;}
          .pb-photo{min-height:260px;height:260px;}
        }
        @media(max-width:768px){
          nav{padding:1rem 1.5rem;}
          .nav-links{display:none;}
          .hamburger{display:flex;}
          .hamburger{display:flex;}
  .nav-auth-btns{display:none;}
          .hero-stats{gap:1.5rem;}
          .feat-grid{grid-template-columns:1fr;}
          .calc-grid{grid-template-columns:1fr;}
          .test-grid{grid-template-columns:1fr;}
          .pricing-grid{grid-template-columns:1fr 1fr;}
          footer{flex-direction:column;gap:1.5rem;text-align:center;}
          .biz-cta-row{flex-direction:column;align-items:center;}
          .pb-chip2{display:none;}
        }
        @media(max-width:480px){.pricing-grid{grid-template-columns:1fr;}}
      `}</style>

      <canvas ref={canvasRef} id="bg-canvas"/>
      <div className="orb orb1"/><div className="orb orb2"/><div className="orb orb3"/>
      <div className="grid-overlay"/>

      {/* DRAWER OVERLAY */}
      {menuOpen && <div className="drawer-overlay open" onClick={() => setMenuOpen(false)}/>}

      {/* MOBILE DRAWER */}
      <div className={`mob-drawer ${menuOpen ? "open" : ""}`}>
        <button className="drawer-close" onClick={() => setMenuOpen(false)}>×</button>
        <div className="drawer-logo">BarberBook</div>
        <ul className="drawer-links">
          <li><a onClick={() => { setPage("business"); setMenuOpen(false) }}>💼 Για Επιχειρήσεις</a></li>
          <div className="drawer-divider"/>
          {user ? (
            <li><a onClick={() => { window.location.href="/dashboard"; setMenuOpen(false) }}>📊 Dashboard</a></li>
          ) : (
            <>
              <li><a onClick={() => { setModal("login"); setMenuOpen(false) }}>🔑 Σύνδεση</a></li>
              <li><a onClick={() => { setModal("register"); setMenuOpen(false) }}>✨ Εγγραφή</a></li>
            </>
          )}
        </ul>
        <div className="drawer-btns">
          {user ? (
            <>
              <span style={{fontSize:"0.82rem",color:"var(--light)",opacity:0.6,textAlign:"center"}}>
                👤 {user.user_metadata?.full_name || user.email}
              </span>
              <button className="btn-ghost" onClick={() => { handleLogout(); setMenuOpen(false) }}>
                Αποσύνδεση
              </button>
              <button className="btn-primary" onClick={() => { window.location.href="/dashboard"; setMenuOpen(false) }}>
                Dashboard
              </button>
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => { setModal("login"); setMenuOpen(false) }}>
                Σύνδεση
              </button>
              <button className="btn-primary" onClick={() => { setModal("register"); setMenuOpen(false) }}>
                Εγγραφή
              </button>
            </>
          )}
        </div>
      </div>

      {/* NAV */}
      <nav>
        <div className="logo" onClick={() => setPage("home")}>BarberBook</div>
        <ul className="nav-links">
          <li><a onClick={() => setPage("business")}>Για Επιχειρήσεις</a></li>
        </ul>
      <div className="nav-right">
  <div className="nav-auth-btns" style={{display:"flex",alignItems:"center",gap:"0.8rem"}}>
    {user ? (
      <>
        <span style={{color:"var(--light)",fontSize:"0.8rem",opacity:0.7}}>
          👤 {user.user_metadata?.full_name || user.email}
        </span>
        <button className="btn-ghost" onClick={handleLogout}>Αποσύνδεση</button>
        <button className="btn-primary" onClick={() => window.location.href="/dashboard"}>Dashboard</button>
      </>
    ) : (
      <>
        <button className="btn-ghost" onClick={() => setModal("login")}>Σύνδεση</button>
        <button className="btn-primary" onClick={() => setModal("register")}>Εγγραφή</button>
      </>
    )}
  </div>
  <button className={`hamburger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
    <span/><span/><span/>
  </button>
</div>
      </nav>

      {/* ═══ HOME PAGE ═══ */}
      {page === "home" && (
        <>
          <section className="hero">
            <div className="hero-left">
              <div className="hero-badge"><span className="badge-dot"/>#1 Πλατφόρμα Κρατήσεων για Barbers στην Ελλάδα</div>
              <h1>
                <span className="l1">Το Κούρεμα που Θες,</span>
                <span className="l2">ΟΠΟΤΕ ΤΟ ΘΕΛΕΙΣ</span>
              </h1>
              <p>Κλείσε ραντεβού με τους καλύτερους barbers κοντά σου — άμεσα, χωρίς τηλέφωνο, χωρίς αναμονή.</p>
              <div className="search-wrap">
                <div className="search-box">
  <input placeholder="Αναζήτησε barber, πόλη ή περιοχή…"/>
  <button onClick={handleNearMe}>{nearLoading ? "⏳ Εντοπισμός..." : "Εύρεση Barber"}</button>
</div>
{nearShow && (
  <div className="near-result show">
    <div style={{fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--light)",opacity:0.5,marginBottom:"0.7rem"}}>📍 Barbers Κοντά Σου</div>
    {nearResults.length === 0 ? (
      <div style={{fontSize:"0.82rem",color:"var(--light)",opacity:0.5,padding:"0.5rem"}}>Δεν βρέθηκαν κουρεία κοντά σου.</div>
    ) : nearResults.map(b => (
      <div key={b.id} className="near-row" onClick={() => window.location.href = `/barbershops/${b.id}`}>
        <div className="near-dot"/>
        <div><div className="nr-name">{b.name}</div><div className="nr-stars">★★★★★ {b.rating} · {b.city}</div></div>
        <div className="nr-dist">→</div>
      </div>
    ))}
  </div>
)}
              </div>
              <div className="hero-stats">
                <div><div className="stat-num">50+</div><div className="stat-lbl">Κουρεία</div></div>
                <div><div className="stat-num">500+</div><div className="stat-lbl">Ραντεβού</div></div>
                <div><div className="stat-num">4.9★</div><div className="stat-lbl">Βαθμολογία</div></div>
             </div>
            </div>
          </section>

          {/* BARBERS */}
          <section className="barbers" id="barbers">
            <div className="barbers-inner">
              <p className="section-label">Κορυφαία Αξιολόγηση</p>
              <h2 className="section-title">Barbers</h2>
              <p className="section-sub">Πιστοποιημένα μπαρμπέρικα με μοναδικά στυλ και επαληθευμένες κριτικές 5 αστέρων.</p>
            </div>

            {/* FEATURED */}
            <div className="scroll-section">
              <div className="scroll-header">
  <h3>⭐ Featured Barbers</h3>
  <div style={{display:"flex",gap:"8px"}}>
    <button onClick={() => { const el = document.getElementById("featured-scroll"); if (el) el.scrollLeft -= 280 }} style={{width:32,height:32,borderRadius:"50%",border:"1px solid rgba(30,95,255,0.3)",background:"rgba(10,22,40,0.7)",color:"var(--glow)",fontSize:14,cursor:"pointer"}}>←</button>
    <button onClick={() => { const el = document.getElementById("featured-scroll"); if (el) el.scrollLeft += 280 }} style={{width:32,height:32,borderRadius:"50%",border:"1px solid rgba(30,95,255,0.3)",background:"rgba(10,22,40,0.7)",color:"var(--glow)",fontSize:14,cursor:"pointer"}}>→</button>
  </div>
</div>
<div className="cards" id="featured-scroll">
                {featuredStatic.map((b, i) => (
                  <div key={b.name} className="card">
                    <div className="card-img" style={{background:`linear-gradient(135deg,#0d1f3a,#${['091830','162040','1a2f5a','111c35','1c2e55','142240'][i]})`}}>
                      <span className="card-emoji">{b.emoji}</span>
                      <div className="certified">✓ Πιστοποιημένο</div>
                    </div>
                    <div className="card-body">
                      <div className="card-avatar">{b.emoji}</div>
                      <h4>{b.name}</h4>
                      <p className="loc">📍 {b.loc}</p>
                      <div className="card-stars">★★★★★ <span style={{color:"var(--light)",opacity:0.5}}>{b.rating} ({b.reviews})</span></div>
                      <button className="book-btn">Κλείσε Ραντεβού</button>
                    </div>
                  </div>
                ))}
                {barbershops.filter(b => b.rating >= 4.8).slice(0, 4).map((b, i) => (
                  <div key={b.id} className="card" onClick={() => window.location.href = `/barbershops/${b.id}`}>
                    <div className="card-img" style={{overflow:"hidden",padding:0}}>
                      <img src={shopImages[i % shopImages.length]} alt={b.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      <div className="certified">✓ Verified</div>
                    </div>
                    <div className="card-body">
                      <div className="card-avatar">💈</div>
                      <h4>{b.name}</h4>
                      <p className="loc">📍 {b.city}</p>
                      <div className="card-stars">★★★★★ <span style={{color:"var(--light)",opacity:0.5}}>{b.rating}</span></div>
                      <button className="book-btn" onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); window.location.href = `/barbershops/${b.id}` }}>Κλείσε Ραντεβού</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* NEW */}
            <div className="scroll-section">
             <div className="scroll-header">
  <h3>🆕 Νέα Μπαρμπέρικα</h3>
  <div style={{display:"flex",gap:"8px"}}>
    <button onClick={() => { const el = document.getElementById("new-scroll"); if (el) el.scrollLeft -= 280 }} style={{width:32,height:32,borderRadius:"50%",border:"1px solid rgba(30,95,255,0.3)",background:"rgba(10,22,40,0.7)",color:"var(--glow)",fontSize:14,cursor:"pointer"}}>←</button>
    <button onClick={() => { const el = document.getElementById("new-scroll"); if (el) el.scrollLeft += 280 }} style={{width:32,height:32,borderRadius:"50%",border:"1px solid rgba(30,95,255,0.3)",background:"rgba(10,22,40,0.7)",color:"var(--glow)",fontSize:14,cursor:"pointer"}}>→</button>
  </div>
</div>
<div className="cards" id="new-scroll">
                {newStatic.map((b, i) => (
                  <div key={b.name} className="card">
                    <div className="card-img" style={{background:`linear-gradient(135deg,#0c1a32,#${['142540','182c4a','131f38','172843','1a2e50','13223a'][i]})`}}>
                      <span className="card-emoji">{b.emoji}</span>
                    </div>
                    <div className="card-body">
                      <div className="card-avatar">{b.emoji}</div>
                      <h4>{b.name}</h4>
                      <p className="loc">📍 {b.loc}</p>
                      <div className="card-stars">★★★★☆ <span style={{color:"var(--light)",opacity:0.5}}>{b.rating} ({b.reviews})</span></div>
                      <button className="book-btn">Κλείσε Ραντεβού</button>
                    </div>
                  </div>
                ))}
                {barbershops.filter(b => b.rating < 4.8).slice(0, 4).map((b, i) => (
                  <div key={b.id} className="card" onClick={() => window.location.href = `/barbershops/${b.id}`}>
                    <div className="card-img" style={{overflow:"hidden",padding:0}}>
                      <img src={shopImages[(i+3) % shopImages.length]} alt={b.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    </div>
                    <div className="card-body">
                      <div className="card-avatar">💈</div>
                      <h4>{b.name}</h4>
                      <p className="loc">📍 {b.city}</p>
                      <div className="card-stars">★★★★☆ <span style={{color:"var(--light)",opacity:0.5}}>{b.rating||"Νέο"}</span></div>
                      <button className="book-btn" onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); window.location.href = `/barbershops/${b.id}` }}>Κλείσε Ραντεβού</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PHOTO BANNER */}
          <div className="photo-banner">
            <div className="pb-photo">
              <img src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=900&auto=format&fit=crop&q=80" alt="Barber"/>
              <div className="pb-chip pb-chip1">
                <div className="chip-label">Επόμενο Ραντεβού</div>
                <div className="chip-row"><div className="chip-ava">✂️</div><div><div className="chip-title">Durden Barbershop</div><div className="chip-sub">Σήμερα · 14:30</div></div></div>
                <div className="chip-badge badge-g">✓ Επιβεβαιώθηκε</div>
              </div>
              <div className="pb-chip pb-chip2">
                <div className="chip-label">Κοντά σου · 0.3km</div>
                <div className="chip-row"><div className="chip-ava">💈</div><div><div className="chip-title">Sir Barbershop</div><div className="chip-sub">★★★★★ 5.0</div></div></div>
                <div className="chip-badge badge-b">Διαθέσιμο σήμερα</div>
              </div>
            </div>
            <div className="pb-content">
              <div className="pb-tag"><span className="badge-dot"/>Η Πλατφόρμα Αρ.1 για Barbers</div>
              <h2>Βρες τον <em>Καλύτερο Barber</em> Κοντά σου</h2>
              <p>Κλείσε ραντεβού online σε δευτερόλεπτα. Χωρίς κλήσεις, χωρίς αναμονή.</p>
              <div className="pb-stats">
                <div><div className="ps-num">50+</div><div className="ps-lbl">Κουρεία</div></div>
                <div><div className="ps-num">500+</div><div className="ps-lbl">Ραντεβού</div></div>
                <div><div className="ps-num">4.9★</div><div className="ps-lbl">Βαθμολογία</div></div>
              </div>
              <div className="pb-cta-row">
                <button className="pb-btn fill" onClick={() => document.getElementById("barbers")?.scrollIntoView({behavior:"smooth"})}>✂️ Βρες Barber</button>
                <button className="pb-btn out" onClick={() => setPage("business")}>Για Επιχειρήσεις →</button>
              </div>
            </div>
          </div>

          <footer>
            <div>
              <div className="flogo">BarberBook</div>
              <small style={{fontSize:"0.7rem",color:"var(--light)",opacity:0.3,display:"block",marginTop:"0.2rem"}}>© 2026 BarberBook. Με επιφύλαξη παντός δικαιώματος.</small>
              <small style={{fontSize:"0.7rem",color:"var(--light)",opacity:0.3,display:"block",marginTop:"0.2rem"}}>Made with ❤️ in Greece 🇬🇷</small>
            </div>
            <ul className="flinks">
              <li><a onClick={() => setPage("business")}>Για Επιχειρήσεις</a></li>
              <li><a onClick={() => setModal("login")}>Σύνδεση</a></li>
            </ul>
          </footer>
        </>
      )}

      {/* ═══ BUSINESS PAGE ═══ */}
      {page === "business" && (
        <>
          <section className="biz-hero">
            <div className="biz-social-proof">
              <div className="biz-avatars">
                <div className="bav">✂️</div><div className="bav">💈</div><div className="bav">👔</div>
              </div>
              <span>400+ μπαρμπέρικα εμπιστεύονται ήδη το BarberBook</span>
            </div>
            <h1>
              <span className="bhl1">Περισσότερα Ραντεβού.</span>
              <span className="bhl2">Λιγότερη Ταλαιπωρία.</span>
            </h1>
            <p>Διαφήμισε το μπαρμπέρικό σου, οργάνωσε τα ραντεβού σου και δες τα έσοδά σου να αυξάνονται.</p>
            <div className="biz-cta-row">
             <button className="btn-big primary" onClick={() => window.location.href="/onboarding"}>🚀 Ξεκίνα Δωρεάν</button>
              <button className="btn-big ghost">Δες τα χαρακτηριστικά →</button>
            </div>
          </section>

          <div className="ticker-wrap">
            <div className="ticker-inner">
              {[...Array(2)].map((_, j) => (
                ["Ικανοποίηση ιδιοκτητών ✦","98% επανακράτηση σε 20 μέρες ✦","24/7 ραντεβού χωρίς τηλέφωνο ✦","2.000.000+ κουρέματα ✦","700 κριτικές 5 αστέρων ✦","350+ ενεργά καταστήματα ✦"].map((t, i) => (
                  <div key={`${j}-${i}`} className="ticker-item">{t} </div>
                ))
              ))}
            </div>
          </div>

          {/* CALCULATOR */}
          <div className="calc-section">
            <p className="section-label" style={{textAlign:"left"}}>Υπολογιστής Εσόδων</p>
            <h2 className="section-title" style={{textAlign:"left",fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(2.5rem,5vw,3.8rem)",letterSpacing:"0.05em"}}>Δες Τι Μπορείς να Κερδίσεις</h2>
            <div className="calc-box">
              <h3>Εκτιμώμενα Έσοδα / Μήνα</h3>
              <p>Βασισμένο σε πραγματικά δεδομένα από μπαρμπέρικα που χρησιμοποιούν το BarberBook</p>
              <div className="calc-grid">
                {[
                  { label: "Κουρέματα ανά barber / μέρα", val: cuts, set: setCuts, min: 5, max: 20, display: String(cuts) },
                  { label: "Μέση τιμή ανά κούρεμα (€)", val: price, set: setPrice, min: 8, max: 30, display: "€" + price },
                  { label: "Αριθμός barbers", val: barbers, set: setBarbers, min: 1, max: 6, display: String(barbers) },
                  { label: "Μείωση χαμένων ραντεβού %", val: noshow, set: setNoshow, min: 0, max: 80, display: noshow + "%" },
                ].map(f => (
                  <div key={f.label} className="calc-field">
                    <label>{f.label}</label>
                    <input type="range" min={f.min} max={f.max} value={f.val} onChange={e => f.set(Number(e.target.value))}/>
                    <div className="calc-val">{f.display}</div>
                  </div>
                ))}
              </div>
              <div className="calc-result">
                <div className="cr-label">Εκτιμώμενα Επιπλέον Έσοδα / Μήνα</div>
                <div className="cr-num">+€{revenue.toLocaleString("el-GR")}</div>
                <div className="cr-sub">Βασισμένο σε πραγματικά δεδομένα του BarberBook</div>
              </div>
            </div>
          </div>

          {/* FEATURES */}
          <section className="features-section">
            <p className="section-label">Φτιαγμένο για Barbers</p>
            <h2 className="section-title" style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(2.5rem,5vw,3.8rem)",letterSpacing:"0.05em"}}>Όλα Όσα Χρειάζεσαι</h2>
            <p className="section-sub">Μία πλατφόρμα για κρατήσεις, πελάτες, ομάδα και έσοδα.</p>
            <div className="feat-grid">
              {[
                { icon: "🗓️", title: "Έξυπνο Ημερολόγιο", desc: "Ρύθμισε ωράριο, ρεπό και διαλείμματα μία φορά. Δεν θα χτυπήσει ποτέ ξανά το τηλέφωνο." },
                { icon: "📱", title: "Αυτόματα SMS & Υπενθυμίσεις", desc: "Υπενθυμίσεις Viber / SMS / email 3 ώρες πριν κάθε ραντεβού. Έως 80% λιγότερα no-shows." },
                { icon: "👤", title: "Βάση Πελατών", desc: "Πλήρες ιστορικό, προτιμήσεις και επισκέψεις προσβάσιμα σε 2 δευτερόλεπτα." },
                { icon: "👥", title: "Διαχείριση Ομάδας", desc: "Πρόσθεσε barbers, ανάθεσε υπηρεσίες και παρακολούθησε αμοιβές." },
                { icon: "⭐", title: "Κριτικές & Φήμη", desc: "Συλλογή επαληθευμένων κριτικών αυτόματα μετά από κάθε επίσκεψη." },
                { icon: "📊", title: "Ανάλυση Εσόδων", desc: "Δες ημερήσια έσοδα, πολυσύχναστες ώρες και κορυφαίες υπηρεσίες." },
              ].map(f => (
                <div key={f.title} className="feat-card">
                  <span className="feat-icon">{f.icon}</span>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* STEPS */}
          <div className="biz-steps">
            <p className="section-label">Ξεκίνα Σήμερα</p>
            <h2 className="section-title" style={{textAlign:"left",fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(2.5rem,5vw,3.8rem)"}}>Online σε Λίγα Λεπτά</h2>
            {[
              { num: "1", title: "Δημιούργησε το Προφίλ σου", desc: "Πρόσθεσε υπηρεσίες, τιμές, φωτογραφίες και ωράριο. Ανεβαίνεις αμέσως στον κατάλογο." },
              { num: "2", title: "Ρύθμισε τη Διαθεσιμότητά σου", desc: "Όρισε ωράριο και διαλείμματα. Το ημερολόγιο διαχειρίζεται αυτόματα τα slots." },
              { num: "3", title: "Ξεκίνα να Δέχεσαι Κρατήσεις", desc: "Μοιράσου το booking link σου και τα ραντεβού έρχονται μόνα τους." },
            ].map(s => (
              <div key={s.num} className="biz-step-row">
                <div className="step-num">{s.num}</div>
                <div className="step-body"><h4>{s.title}</h4><p>{s.desc}</p></div>
              </div>
            ))}
          </div>

          {/* PRICING */}
          <section className="pricing-section">
            <p className="section-label">Τιμολόγηση</p>
            <h2 className="section-title" style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(2.5rem,5vw,3.8rem)",letterSpacing:"0.05em"}}>Απλή & Διαφανής Τιμολόγηση</h2>
            <p className="section-sub">Ξεκίνα δωρεάν, αναβάθμισε όταν μεγαλώνεις.</p>
            <div className="pricing-grid">
              {[
                { name: "Freemium", price: "0", period: "Δωρεάν για πάντα", features: ["1 barber profile","Έως 20 κρατήσεις/μήνα","Βασικό ημερολόγιο","Ειδοποιήσεις email","Listing στον κατάλογο"], btn: "outline", cta: "Ξεκίνα Δωρεάν" },
                { name: "Solo", price: "20", period: "/ μήνα · 1 barber", features: ["1 barber profile","Απεριόριστες κρατήσεις","SMS & Viber υπενθυμίσεις","Ιστορικό πελατών","Βασική ανάλυση εσόδων"], btn: "outline", cta: "Δοκίμασε 14 μέρες" },
                { name: "Duo", price: "24", period: "/ μήνα · 2 barbers", features: ["2 barber profiles","Απεριόριστες κρατήσεις","SMS & Viber υπενθυμίσεις","Βάση πελατών","Ανάλυση εσόδων","Προτεραιότητα αναζητήσεων"], btn: "filled", cta: "Δοκίμασε 14 μέρες", popular: true },
                { name: "Team", price: "28", period: "/ μήνα · 3+ barbers", features: ["3+ barber profiles","Απεριόριστες κρατήσεις","Πλήρης διαχείριση ομάδας","Παρακολούθηση αμοιβών","Προσαρμοσμένη σελίδα","Αποκλειστική υποστήριξη"], btn: "outline", cta: "Δοκίμασε 14 μέρες" },
              ].map(p => (
                <div key={p.name} className={`price-card ${p.popular ? "popular" : ""}`}>
                  {p.popular && <div className="pop-label">ΠΙΟ ΔΗΜΟΦΙΛΕΣ</div>}
                  <div className="price-name">{p.name}</div>
                  <div className="price-amount"><sup>€</sup>{p.price}</div>
                  <div className="price-period">{p.period}</div>
                  <ul className="price-features">
                    {p.features.map(f => <li key={f}>{f}</li>)}
                  </ul>
                  <button type="button" className={`price-btn ${p.btn}`} onClick={() => { window.location.href = "/onboarding" }}>{p.cta}</button>
                </div>
              ))}
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section className="testimonials">
            <p className="section-label">Τι Λένε οι Barbers</p>
            <h2 className="section-title" style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(2.5rem,5vw,3.8rem)",letterSpacing:"0.05em"}}>Πραγματικά Αποτελέσματα</h2>
            <p className="section-sub">Πάνω από 400 μπαρμπέρικα σε όλη την Ελλάδα βασίζονται καθημερινά στο BarberBook.</p>
            <div className="test-grid">
              {[
                { quote: "Από τότε που ξεκίνησα το BarberBook, τα no-shows μειώθηκαν κατά 70%. Το ημερολόγιό μου είναι πάντα γεμάτο.", name: "Νίκος Α.", shop: "Durden Barbershop, Μενεμένη", emoji: "✂️" },
                { quote: "Έστησα το προφίλ μου σε 20 λεπτά. Σε μία εβδομάδα είχα νέους πελάτες που με βρήκαν μέσα από την εφαρμογή.", name: "Γιώργος Κ.", shop: "Sir Barbershop, Πέζα", emoji: "💈" },
                { quote: "Η διαχείριση 3 barbers ήταν χάος. Τώρα το ημερολόγιο τρέχει μόνο του και βλέπω όλα τα στατιστικά σε ένα μέρος.", name: "Άρης Π.", shop: "ArisArtFade, Αθήνα", emoji: "👔" },
              ].map((t, i) => (
                <div key={i} className="test-card">
                  <div className="test-stars">★★★★★</div>
                  <p className="test-quote">«{t.quote}»</p>
                  <div className="test-author">
                    <div className="test-ava">{t.emoji}</div>
                    <div><div className="test-name">{t.name}</div><div className="test-shop">{t.shop}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="faq-section">
            <p className="section-label">Συχνές Ερωτήσεις</p>
            <h2 className="section-title" style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(2.5rem,5vw,3.8rem)",letterSpacing:"0.05em"}}>Απορίες;</h2>
            {faqs.map((f, i) => (
              <div key={i} className="faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="faq-q">{f.q} <span className={`faq-arrow ${openFaq === i ? "open" : ""}`}>+</span></div>
                <div className={`faq-a ${openFaq === i ? "open" : ""}`}>{f.a}</div>
              </div>
            ))}
          </section>

          {/* BOTTOM CTA */}
          <section className="biz-bottom-cta">
            <h2 style={{fontFamily:"'Bebas Neue',sans-serif"}}>Έτοιμος να Γεμίσεις<br/>το Ημερολόγιό σου;</h2>
            <p>Γίνε μέλος στα 400+ ελληνικά μπαρμπέρικα που μεγαλώνουν με το BarberBook.</p>
            <div className="biz-cta-row">
              <button className="btn-big primary" onClick={() => window.location.href="/onboarding"}>🚀 Ξεκίνα Δωρεάν</button>
            </div>
          </section>

          <footer>
            <div>
              <div className="flogo">BarberBook</div>
              <small style={{fontSize:"0.7rem",color:"var(--light)",opacity:0.3,display:"block",marginTop:"0.2rem"}}>© 2026 BarberBook. Με επιφύλαξη παντός δικαιώματος.</small>
              <small style={{fontSize:"0.7rem",color:"var(--light)",opacity:0.3,display:"block",marginTop:"0.2rem"}}>Made with ❤️ in Greece 🇬🇷</small>
            </div>
            <ul className="flinks">
              <li><a onClick={() => setPage("home")}>Αρχική</a></li>
              <li><a onClick={() => setModal("login")}>Σύνδεση</a></li>
            </ul>
          </footer>
        </>
      )}

      {/* MODALS */}
      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setModal(""); setAuthError("") } }}>
          <div className="modal-box">
            <button className="modal-close" onClick={() => { setModal(""); setAuthError("") }}>×</button>
            {modal === "login" ? (
              <LoginForm
                onSubmit={handleLogin}
                onSwitch={() => { setModal("register"); setAuthError("") }}
                onGoogle={handleGoogleLogin}
                loading={authLoading}
                error={authError}
              />
            ) : (
              <RegisterForm
                onSubmit={handleRegister}
                onSwitch={() => { setModal("login"); setAuthError("") }}
                onGoogle={handleGoogleLogin}
                loading={authLoading}
                error={authError}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}