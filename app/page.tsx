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
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"
          style={{width:"100%",padding:"0.75rem 1rem",background:"rgba(10,22,40,0.8)",border:"1px solid rgba(30,95,255,0.2)",borderRadius:"0.7rem",color:"var(--white)",fontFamily:"Inter,sans-serif",fontSize:"0.88rem",outline:"none"}}/>
      </div>
      <div style={{marginBottom:"1.1rem"}}>
        <label style={{display:"block",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--light)",opacity:0.5,marginBottom:"0.4rem"}}>Κωδικός</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
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
        <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Νίκος Παπαδόπουλος"
          style={{width:"100%",padding:"0.75rem 1rem",background:"rgba(10,22,40,0.8)",border:"1px solid rgba(30,95,255,0.2)",borderRadius:"0.7rem",color:"var(--white)",fontFamily:"Inter,sans-serif",fontSize:"0.88rem",outline:"none"}}/>
      </div>
      <div style={{marginBottom:"1.1rem"}}>
        <label style={{display:"block",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--light)",opacity:0.5,marginBottom:"0.4rem"}}>Email</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"
          style={{width:"100%",padding:"0.75rem 1rem",background:"rgba(10,22,40,0.8)",border:"1px solid rgba(30,95,255,0.2)",borderRadius:"0.7rem",color:"var(--white)",fontFamily:"Inter,sans-serif",fontSize:"0.88rem",outline:"none"}}/>
      </div>
      <div style={{marginBottom:"1.1rem"}}>
        <label style={{display:"block",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--light)",opacity:0.5,marginBottom:"0.4rem"}}>Κωδικός</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Τουλάχιστον 6 χαρακτήρες"
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
  const [barbershops, setBarbershops] = useState<any[]>([])
  const [shopPhotos, setShopPhotos] = useState<Record<string, string>>({})
  const [user, setUser] = useState<any>(null)
  const [modal, setModal] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState("")
  const [nearShow, setNearShow] = useState(false)
  const [nearLoading, setNearLoading] = useState(false)
  const [nearResults, setNearResults] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const now = new Date()
  const featuredShops = barbershops.filter(b => {
    const created = new Date(b.created_at)
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays >= 14
  })
  const newShops = barbershops.filter(b => {
    const created = new Date(b.created_at)
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays < 14
  })

  useEffect(() => {
    supabase.from("barbershops").select("*")
      .order("created_at", { ascending: false })
      .then(async ({ data }) => {
        if (data) {
          setBarbershops(data)
          // Φόρτωσε πρώτη φωτογραφία για κάθε κουρείο
          const photos: Record<string, string> = {}
          await Promise.all(data.map(async (shop: any) => {
            const { data: photoData } = await supabase
              .from("portfolio_photos")
              .select("url")
              .eq("shop_id", shop.id)
              .order("is_cover", { ascending: false })
              .limit(1)
            if (photoData && photoData.length > 0) {
              photos[shop.id] = photoData[0].url
            }
          }))
          setShopPhotos(photos)
        }
      })

    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  // Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }
    const q = searchQuery.toLowerCase()
    const results = barbershops.filter(b =>
      b.name?.toLowerCase().includes(q) ||
      b.city?.toLowerCase().includes(q) ||
      b.address?.toLowerCase().includes(q)
    )
    setSearchResults(results)
    setShowSearchResults(true)
  }, [searchQuery, barbershops])

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const particles: any[] = []
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        o: Math.random() * 0.5 + 0.1,
      })
    }
    let raf: number
    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(100,160,255,${p.o})`
        ctx.fill()
        p.x += p.dx; p.y += p.dy
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true); setAuthError("")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
    else setModal("")
    setAuthLoading(false)
  }

  const handleRegister = async (fullName: string, email: string, password: string) => {
    setAuthLoading(true); setAuthError("")
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
    if (error) setAuthError(error.message)
    else { setModal(""); alert("✅ Επιβεβαίωσε το email σου!") }
    setAuthLoading(false)
  }

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null) }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } })
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
          )
          setNearResults(nearby.length > 0 ? nearby : barbershops.slice(0, 6))
          setNearShow(true)
        } catch {
          setNearResults(barbershops.slice(0, 6))
          setNearShow(true)
        }
        setNearLoading(false)
      },
      () => { setNearResults(barbershops.slice(0, 6)); setNearShow(true); setNearLoading(false) }
    )
  }

  function ShopCard({ b }: { b: any }) {
    const coverPhoto = shopPhotos[b.id]
    const bgImage = coverPhoto || b.logo_url
    return (
      <div className="shop-card" onClick={() => window.location.href=`/barbershops/${b.id}`}>
        <div className="shop-card-img">
          {bgImage ? (
            <img src={bgImage} alt={b.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
          ) : (
            <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,background:"linear-gradient(135deg,rgba(30,95,255,0.2),rgba(201,168,76,0.1))"}}>💈</div>
          )}
          <div className="shop-card-overlay"/>
          {b.logo_url && (
            <div className="shop-card-logo">
              <img src={b.logo_url} alt="logo" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/>
            </div>
          )}
        </div>
        <div className="shop-card-body">
          <div className="shop-card-name">{b.name}</div>
          <div className="shop-card-addr">📍 {b.address ? `${b.address}, ${b.city}` : b.city}</div>
          <div className="shop-card-bottom">
          
            <button className="shop-card-btn" onClick={e => { e.stopPropagation(); window.location.href=`/barbershops/${b.id}` }}>
              Κλείσε →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap');
        :root{
          --navy:#050d1a;--deep:#08142a;--accent:#1e5fff;--glow:#4d8aff;
          --light:#a8c8ff;--white:#f0f6ff;--gold:#c9a84c;--gold2:#f0c040;
          --card:rgba(8,20,42,0.85);--line:rgba(30,95,255,0.12);
        }
        *{margin:0;padding:0;box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        body{background:var(--navy);color:var(--white);font-family:'Inter',sans-serif;overflow-x:hidden;}
@media(max-width:768px){
  .nav-center{display:none !important;}
}
}
        /* NAV */
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 2rem;height:68px;
          display:flex;align-items:center;justify-content:space-between;
          background:rgba(5,13,26,0.92);backdrop-filter:blur(24px);
          border-bottom:1px solid var(--line);}
        .nav-logo{font-family:'Bebas Neue',sans-serif;font-size:1.7rem;letter-spacing:0.08em;
          background:linear-gradient(120deg,var(--glow),var(--gold));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;cursor:pointer;}
        .nav-right{display:flex;align-items:center;gap:0.8rem;}
        .btn-ghost{background:none;border:1px solid rgba(168,200,255,0.2);color:var(--light);
          padding:0.5rem 1.1rem;border-radius:2rem;font-size:0.82rem;font-weight:600;
          cursor:pointer;transition:all 0.2s;font-family:'Inter',sans-serif;}
        .btn-ghost:hover{border-color:var(--glow);color:var(--glow);}
        .btn-primary{background:linear-gradient(135deg,#1e5fff,#0a3ab8);border:none;color:#fff;
          padding:0.5rem 1.2rem;border-radius:2rem;font-size:0.82rem;font-weight:700;
          cursor:pointer;transition:all 0.2s;font-family:'Inter',sans-serif;
          box-shadow:0 4px 15px rgba(30,95,255,0.3);}
        .btn-primary:hover{filter:brightness(1.1);transform:translateY(-1px);}
        .hamburger{background:none;border:none;cursor:pointer;display:none;flex-direction:column;gap:5px;padding:4px;}
        .hamburger span{display:block;width:22px;height:2px;background:var(--light);border-radius:2px;transition:all 0.3s;}
        .hamburger.open span:nth-child(1){transform:rotate(45deg) translate(5px,5px);}
        .hamburger.open span:nth-child(2){opacity:0;}
        .hamburger.open span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px);}
@media(max-width:768px){
  .nav-center{display:none !important;}
}
        /* HERO */
        .hero{min-height:100vh;display:flex;align-items:center;justify-content:center;
          position:relative;overflow:hidden;padding:0 2rem;
          background:radial-gradient(ellipse 120% 80% at 50% 0%,rgba(30,95,255,0.15),transparent 60%),
          radial-gradient(ellipse 80% 60% at 100% 100%,rgba(201,168,76,0.08),transparent 60%),
          var(--navy);}
        .hero-canvas{position:absolute;inset:0;pointer-events:none;z-index:0;}
        .hero-glow{position:absolute;width:600px;height:600px;border-radius:50%;
          background:radial-gradient(circle,rgba(30,95,255,0.12),transparent 70%);
          top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:0;}
        .hero-content{position:relative;z-index:2;text-align:center;max-width:800px;}
        .hero-badge{display:inline-flex;align-items:center;gap:0.5rem;
          background:rgba(30,95,255,0.1);border:1px solid rgba(30,95,255,0.25);
          border-radius:2rem;padding:0.4rem 1rem;font-size:0.75rem;font-weight:600;
          color:var(--light);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:1.5rem;}
        .hero-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(3.5rem,9vw,7rem);
          line-height:0.95;letter-spacing:0.03em;margin-bottom:1rem;}
        .hero-title .line1{display:block;color:var(--white);}
        .hero-title .line2{display:block;
          background:linear-gradient(120deg,var(--glow),var(--gold2));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .hero-sub{font-size:1.05rem;color:var(--light);opacity:0.65;line-height:1.7;
          max-width:520px;margin:0 auto 2.5rem;}
        .hero-search{position:relative;max-width:560px;margin:0 auto 1.5rem;}
        .search-input-wrap{position:relative;}
        .search-input{width:100%;padding:1rem 1.2rem 1rem 3rem;
          background:rgba(10,22,40,0.9);border:1px solid rgba(30,95,255,0.25);
          border-radius:1rem;color:var(--white);font-family:'Inter',sans-serif;
          font-size:0.95rem;outline:none;transition:all 0.2s;
          box-shadow:0 8px 32px rgba(0,0,0,0.3);}
        .search-input:focus{border-color:var(--glow);box-shadow:0 0 0 3px rgba(30,95,255,0.15),0 8px 32px rgba(0,0,0,0.3);}
        .search-input::placeholder{color:rgba(168,200,255,0.4);}
        .search-icon{position:absolute;left:1rem;top:50%;transform:translateY(-50%);
          color:rgba(168,200,255,0.5);font-size:1rem;pointer-events:none;}
        .search-results{position:absolute;top:calc(100% + 8px);left:0;right:0;
          background:rgba(8,20,42,0.98);border:1px solid rgba(30,95,255,0.2);
          border-radius:1rem;overflow:hidden;z-index:50;
          box-shadow:0 16px 48px rgba(0,0,0,0.5);}
        .search-result-item{display:flex;align-items:center;gap:1rem;padding:0.9rem 1.2rem;
          cursor:pointer;transition:background 0.15s;border-bottom:1px solid rgba(30,95,255,0.06);}
        .search-result-item:last-child{border-bottom:none;}
        .search-result-item:hover{background:rgba(30,95,255,0.1);}
        .sri-avatar{width:38px;height:38px;border-radius:0.6rem;overflow:hidden;flex-shrink:0;
          background:linear-gradient(135deg,rgba(30,95,255,0.3),rgba(201,168,76,0.2));
          display:flex;align-items:center;justify-content:center;font-size:18px;}
        .sri-info{flex:1;min-width:0;}
        .sri-name{font-size:0.88rem;font-weight:700;}
        .sri-addr{font-size:0.75rem;color:var(--light);opacity:0.5;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .sri-rating{font-size:0.75rem;color:var(--gold);font-weight:700;flex-shrink:0;}
        .hero-cta-row{display:flex;align-items:center;justify-content:center;gap:1rem;flex-wrap:wrap;}
        .btn-near{background:rgba(30,95,255,0.1);border:1px solid rgba(30,95,255,0.3);
          color:var(--light);padding:0.75rem 1.5rem;border-radius:0.8rem;
          font-size:0.88rem;font-weight:600;cursor:pointer;transition:all 0.2s;
          font-family:'Inter',sans-serif;display:flex;align-items:center;gap:0.5rem;}
        .btn-near:hover{background:rgba(30,95,255,0.2);border-color:var(--glow);}
        .btn-biz{background:linear-gradient(135deg,var(--gold),#a87820);border:none;
          color:#1a0f00;padding:0.75rem 1.5rem;border-radius:0.8rem;
          font-size:0.88rem;font-weight:800;cursor:pointer;transition:all 0.2s;
          font-family:'Inter',sans-serif;}
        .btn-biz:hover{filter:brightness(1.1);transform:translateY(-1px);}

        /* NEAR ME */
        .near-section{max-width:560px;margin:1.5rem auto 0;}
        .near-result{background:rgba(8,20,42,0.95);border:1px solid rgba(30,95,255,0.2);
          border-radius:1rem;padding:1.2rem;box-shadow:0 16px 48px rgba(0,0,0,0.4);}
        .near-title{font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;
          color:var(--light);opacity:0.5;margin-bottom:0.8rem;font-weight:600;}
        .near-row{display:flex;align-items:center;gap:0.8rem;padding:0.65rem 0.5rem;
          border-radius:0.6rem;cursor:pointer;transition:background 0.15s;
          border-bottom:1px solid rgba(30,95,255,0.05);}
        .near-row:last-child{border-bottom:none;}
        .near-row:hover{background:rgba(30,95,255,0.08);}
        .near-dot{width:8px;height:8px;border-radius:50%;background:var(--glow);
          box-shadow:0 0 8px var(--glow);flex-shrink:0;}
        .nr-name{font-size:0.85rem;font-weight:700;}
        .nr-addr{font-size:0.72rem;color:var(--light);opacity:0.5;margin-top:1px;}
        .nr-arrow{margin-left:auto;color:var(--glow);font-size:0.8rem;}

        /* STATS BAR */
        .stats-bar{background:rgba(8,20,42,0.6);border-top:1px solid var(--line);
          border-bottom:1px solid var(--line);padding:1.5rem 2rem;
          display:flex;justify-content:center;gap:4rem;flex-wrap:wrap;}
        .stat-item{text-align:center;}
        .stat-num{font-family:'Bebas Neue',sans-serif;font-size:2.2rem;letter-spacing:0.05em;
          background:linear-gradient(120deg,var(--glow),var(--gold));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .stat-label{font-size:0.72rem;color:var(--light);opacity:0.5;
          text-transform:uppercase;letter-spacing:0.08em;margin-top:0.2rem;}

        /* SECTIONS */
        .section{padding:4rem 2rem;}
        .section-header{display:flex;align-items:center;justify-content:space-between;
          margin-bottom:1.8rem;flex-wrap:wrap;gap:1rem;}
        .section-title-wrap{}
        .section-eyebrow{font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;
          color:var(--glow);font-weight:700;margin-bottom:0.4rem;}
        .section-title{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:0.04em;}
        .scroll-arrows{display:flex;gap:0.5rem;}
        .scroll-arrow{width:36px;height:36px;border-radius:50%;
          border:1px solid rgba(30,95,255,0.25);background:rgba(8,20,42,0.8);
          color:var(--glow);font-size:14px;cursor:pointer;transition:all 0.2s;
          display:flex;align-items:center;justify-content:center;}
        .scroll-arrow:hover{border-color:var(--glow);background:rgba(30,95,255,0.15);}

        /* SHOP CARDS */
        .cards-wrap{overflow-x:auto;padding-bottom:1rem;scrollbar-width:none;cursor:grab;}
        .cards-wrap::-webkit-scrollbar{display:none;}
        .cards-wrap:active{cursor:grabbing;}
        .cards{display:flex;gap:1.2rem;width:max-content;}
        .shop-card{width:260px;flex-shrink:0;background:var(--card);
          border:1px solid var(--line);border-radius:1.2rem;overflow:hidden;
          cursor:pointer;transition:all 0.25s;position:relative;}
        .shop-card:hover{transform:translateY(-4px);border-color:rgba(30,95,255,0.3);
          box-shadow:0 16px 40px rgba(0,0,0,0.4);}
        .shop-card-img{height:160px;position:relative;overflow:hidden;background:rgba(8,20,42,0.8);}
        .shop-card-overlay{position:absolute;inset:0;
          background:linear-gradient(to top,rgba(5,13,26,0.8) 0%,transparent 50%);}
        .shop-card-logo{position:absolute;bottom:10px;left:12px;
          width:40px;height:40px;border-radius:50%;
          border:2px solid rgba(201,168,76,0.6);overflow:hidden;background:var(--navy);}
        .shop-card-body{padding:1rem;}
        .shop-card-name{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;
          letter-spacing:0.04em;margin-bottom:0.3rem;}
        .shop-card-addr{font-size:0.72rem;color:var(--light);opacity:0.5;
          margin-bottom:0.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .shop-card-bottom{display:flex;align-items:center;justify-content:space-between;}
        .shop-card-rating{font-size:0.78rem;font-weight:700;color:var(--gold);}
        .shop-card-btn{background:rgba(30,95,255,0.15);border:1px solid rgba(30,95,255,0.3);
          color:var(--glow);padding:0.4rem 0.9rem;border-radius:2rem;
          font-size:0.72rem;font-weight:700;cursor:pointer;transition:all 0.2s;
          font-family:'Inter',sans-serif;}
        .shop-card-btn:hover{background:rgba(30,95,255,0.3);}

        /* PHOTO BANNER */
        .photo-banner{display:grid;grid-template-columns:repeat(4,1fr);gap:0;
          height:220px;overflow:hidden;margin:0;}
        .photo-banner-item{overflow:hidden;position:relative;}
        .photo-banner-item img{width:100%;height:100%;object-fit:cover;
          filter:brightness(0.6) saturate(0.8);transition:all 0.4s;}
        .photo-banner-item:hover img{filter:brightness(0.8) saturate(1);transform:scale(1.05);}

        /* BUSINESS SECTION */
        .biz-section{padding:5rem 2rem;
          background:linear-gradient(135deg,rgba(8,20,42,0.8),rgba(5,13,26,0.95));
          border-top:1px solid var(--line);border-bottom:1px solid var(--line);}
        .biz-inner{max-width:1100px;margin:0 auto;display:grid;
          grid-template-columns:1fr 1fr;gap:4rem;align-items:center;}
        .biz-badge{display:inline-flex;align-items:center;gap:0.5rem;
          background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.25);
          border-radius:2rem;padding:0.4rem 1rem;font-size:0.72rem;font-weight:700;
          color:var(--gold);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:1rem;}
        .biz-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.2rem,5vw,3.5rem);
          letter-spacing:0.03em;line-height:1;margin-bottom:1rem;}
        .biz-title span{background:linear-gradient(120deg,var(--gold),var(--gold2));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .biz-sub{font-size:0.92rem;color:var(--light);opacity:0.6;line-height:1.8;margin-bottom:2rem;}
        .biz-features{display:flex;flex-direction:column;gap:0.8rem;margin-bottom:2rem;}
        .biz-feature{display:flex;align-items:center;gap:0.8rem;font-size:0.88rem;color:var(--light);opacity:0.8;}
        .biz-feature-dot{width:6px;height:6px;border-radius:50%;background:var(--gold);flex-shrink:0;}
        .biz-plans{display:grid;grid-template-columns:repeat(2,1fr);gap:0.8rem;}
        .biz-plan{background:rgba(10,22,40,0.8);border:1px solid var(--line);
          border-radius:1rem;padding:1.2rem;transition:all 0.2s;}
        .biz-plan:hover{border-color:rgba(201,168,76,0.3);}
        .biz-plan.featured{border-color:rgba(201,168,76,0.4);
          background:rgba(201,168,76,0.05);}
        .biz-plan-name{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;
          letter-spacing:0.05em;margin-bottom:0.2rem;}
        .biz-plan-price{font-size:1.6rem;font-weight:900;color:var(--gold);
          font-family:'Inter',sans-serif;}
        .biz-plan-desc{font-size:0.72rem;color:var(--light);opacity:0.5;margin-top:0.3rem;}

        /* DRAWER */
        .drawer-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);
          z-index:150;backdrop-filter:blur(4px);}
        .mob-drawer{position:fixed;top:0;right:0;bottom:0;width:280px;
          background:rgba(5,13,26,0.98);border-left:1px solid var(--line);
          z-index:200;padding:2rem 1.5rem;display:flex;flex-direction:column;
          transform:translateX(100%);transition:transform 0.3s ease;}
        .mob-drawer.open{transform:translateX(0);}
        .drawer-close{background:none;border:none;color:var(--light);font-size:1.4rem;
          cursor:pointer;align-self:flex-end;opacity:0.6;margin-bottom:1.5rem;}
        .drawer-logo{font-family:'Bebas Neue',sans-serif;font-size:1.5rem;letter-spacing:0.08em;
          background:linear-gradient(120deg,var(--glow),var(--gold));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:2rem;}
        .drawer-links{list-style:none;margin-bottom:2rem;}
        .drawer-links li{margin-bottom:0.5rem;}
        .drawer-links a{display:block;padding:0.8rem 1rem;border-radius:0.7rem;
          color:var(--light);font-size:0.9rem;font-weight:500;cursor:pointer;
          transition:background 0.15s;}
        .drawer-links a:hover{background:rgba(30,95,255,0.1);}
        .drawer-divider{height:1px;background:var(--line);margin:0.8rem 0;}
        .drawer-btns{display:flex;flex-direction:column;gap:0.8rem;margin-top:auto;}

        /* MODAL */
        .modal-overlay{position:fixed;inset:0;z-index:300;
          background:rgba(5,13,26,0.92);backdrop-filter:blur(12px);
          display:flex;align-items:center;justify-content:center;padding:1rem;}
        .modal-box{background:rgba(8,20,42,0.98);border:1px solid rgba(30,95,255,0.2);
          border-radius:1.5rem;padding:2.5rem;width:100%;max-width:420px;
          position:relative;box-shadow:0 24px 64px rgba(0,0,0,0.6);}
        .modal-close{position:absolute;top:1.2rem;right:1.2rem;background:none;
          border:none;color:var(--light);opacity:0.5;font-size:1.4rem;cursor:pointer;}

        /* FOOTER */
        .footer{background:rgba(5,13,26,0.8);border-top:1px solid var(--line);
          padding:3rem 2rem 2rem;text-align:center;}
        .footer-logo{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:0.08em;
          background:linear-gradient(120deg,var(--glow),var(--gold));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:0.5rem;}
        .footer-sub{font-size:0.8rem;color:var(--light);opacity:0.35;}

        /* EMPTY STATE */
        .empty-cards{text-align:center;padding:3rem;color:var(--light);opacity:0.4;font-size:0.9rem;}

        @media(max-width:768px){
          .nav{padding:0 1rem;}
          .nav-right .btn-ghost,.nav-right .btn-primary{display:none;}
          .hamburger{display:flex;}
          .hero{padding:0 1rem;padding-top:5rem;}
          .hero-title{font-size:clamp(2.8rem,12vw,5rem);}
          .stats-bar{gap:2rem;}
          .section{padding:3rem 1rem;}
          .biz-inner{grid-template-columns:1fr;gap:2rem;}
          .photo-banner{grid-template-columns:repeat(2,1fr);}
          .biz-plans{grid-template-columns:1fr;}
        }
        @media(max-width:480px){
          .biz-plans{grid-template-columns:1fr;}
          .stats-bar{gap:1.5rem;}
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo" onClick={() => window.location.href="/"}>BarberBook</div>
        <div className="nav-center" style={{display:"flex",gap:"1.5rem",alignItems:"center"}}>
  <a onClick={() => window.location.href="/businesses"}
    style={{fontSize:"0.85rem",color:"var(--light)",opacity:0.7,cursor:"pointer",fontWeight:500,transition:"opacity 0.2s"}}
    onMouseOver={e=>(e.currentTarget.style.opacity="1")}
    onMouseOut={e=>(e.currentTarget.style.opacity="0.7")}>
    Για Επιχειρήσεις
  </a>
</div>
        <div className="nav-right">
          {user ? (
            <>
              <span style={{fontSize:"0.8rem",color:"var(--light)",opacity:0.7}}>
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
          <button className={`hamburger ${menuOpen?"open":""}`} onClick={() => setMenuOpen(!menuOpen)}>
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* DRAWER */}
      {menuOpen && <div className="drawer-overlay" onClick={() => setMenuOpen(false)}/>}
      <div className={`mob-drawer ${menuOpen?"open":""}`}>
        <button className="drawer-close" onClick={() => setMenuOpen(false)}>×</button>
        <div className="drawer-logo">BarberBook</div>
        <ul className="drawer-links">
          <li><a onClick={() => { window.location.href="/businesses"; setMenuOpen(false) }}>💼 Για Επιχειρήσεις</a></li>
          <div className="drawer-divider"/>
          {user ? (
            <>
              <li><a onClick={() => { window.location.href="/dashboard"; setMenuOpen(false) }}>📊 Dashboard</a></li>
              <li><a onClick={() => { handleLogout(); setMenuOpen(false) }}>🚪 Αποσύνδεση</a></li>
            </>
          ) : (
            <>
              <li><a onClick={() => { setModal("login"); setMenuOpen(false) }}>🔑 Σύνδεση</a></li>
              <li><a onClick={() => { setModal("register"); setMenuOpen(false) }}>✨ Εγγραφή</a></li>
            </>
          )}
        </ul>
        <div className="drawer-btns">
          {user ? (
            <button className="btn-primary" onClick={() => { window.location.href="/dashboard"; setMenuOpen(false) }}>Dashboard</button>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => { setModal("login"); setMenuOpen(false) }}>Σύνδεση</button>
              <button className="btn-primary" onClick={() => { setModal("register"); setMenuOpen(false) }}>Εγγραφή</button>
            </>
          )}
        </div>
      </div>

      {/* HERO */}
      <section className="hero">
        <canvas className="hero-canvas" ref={canvasRef}/>
        <div className="hero-glow"/>
        <div className="hero-content">
          <div className="hero-badge">✂️ Η #1 Πλατφόρμα Κουρείων στην Ελλάδα</div>
          <h1 className="hero-title">
            <span className="line1">Βρες τον</span>
            <span className="line2">Barber σου</span>
          </h1>
          <p className="hero-sub">Κλείσε ραντεβού στο αγαπημένο σου κουρείο σε δευτερόλεπτα. Χωρίς αναμονή, χωρίς τηλεφωνήματα.</p>

          {/* SEARCH */}
          <div className="hero-search" ref={searchRef}>
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Αναζήτησε κουρείο, πόλη ή περιοχή..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowSearchResults(true) }}
              />
            </div>
            {showSearchResults && searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(b => (
                  <div key={b.id} className="search-result-item"
                    onClick={() => { window.location.href=`/barbershops/${b.id}`; setShowSearchResults(false) }}>
                    <div className="sri-avatar">
                      {shopPhotos[b.id] ? (
                        <img src={shopPhotos[b.id]} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"0.6rem"}}/>
                      ) : b.logo_url ? (
                        <img src={b.logo_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"0.6rem"}}/>
                      ) : "💈"}
                    </div>
                    <div className="sri-info">
                      <div className="sri-name">{b.name}</div>
                      <div className="sri-addr">{b.address ? `${b.address}, ${b.city}` : b.city}</div>
                    </div>
                    <div className="sri-rating">★ {b.rating || "5.0"}</div>
                  </div>
                ))}
              </div>
            )}
            {showSearchResults && searchResults.length === 0 && searchQuery.trim() && (
              <div className="search-results">
                <div style={{padding:"1.2rem",textAlign:"center",color:"var(--light)",opacity:0.5,fontSize:"0.85rem"}}>
                  Δεν βρέθηκαν αποτελέσματα για "{searchQuery}"
                </div>
              </div>
            )}
          </div>

          <div className="hero-cta-row">
            <button className="btn-near" onClick={handleNearMe}>
              {nearLoading ? "⏳ Εντοπισμός..." : "📍 Κοντά μου"}
            </button>
            <button className="btn-biz" onClick={() => window.location.href="/onboarding"}>
              💈 Είσαι Barber; Ξεκίνα Δωρεάν
            </button>
          </div>

          {/* NEAR ME RESULTS */}
          {nearShow && (
            <div className="near-section">
              <div className="near-result">
                <div className="near-title">📍 Barbers Κοντά σου</div>
                {nearResults.length === 0 ? (
                  <div style={{fontSize:"0.82rem",color:"var(--light)",opacity:0.4,padding:"0.5rem"}}>
                    Δεν βρέθηκαν κουρεία κοντά σου.
                  </div>
                ) : nearResults.map(b => (
                  <div key={b.id} className="near-row" onClick={() => window.location.href=`/barbershops/${b.id}`}>
                    <div className="near-dot"/>
                    <div>
                      <div className="nr-name">{b.name}</div>
                      <div className="nr-addr">{b.address ? `${b.address}, ${b.city}` : b.city}</div>
                    </div>
                    <div className="nr-arrow">→</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      

      {/* FEATURED BARBERS */}
      <section className="section">
        <div style={{maxWidth:"100%"}}>
          <div className="section-header">
            <div className="section-title-wrap">
              <div className="section-eyebrow">Κορυφαίες Επιλογές</div>
              <div className="section-title">⭐ Featured Barbers</div>
            </div>
            <div className="scroll-arrows">
              <button className="scroll-arrow" onClick={() => {
                const el = document.getElementById("featured-scroll")
                if (el) el.scrollLeft -= 290
              }}>←</button>
              <button className="scroll-arrow" onClick={() => {
                const el = document.getElementById("featured-scroll")
                if (el) el.scrollLeft += 290
              }}>→</button>
            </div>
          </div>
          <div className="cards-wrap" id="featured-scroll">
            <div className="cards">
              {featuredShops.length === 0 ? (
                <div className="empty-cards">Δεν υπάρχουν featured κουρεία ακόμα</div>
              ) : featuredShops.map(b => (
                <ShopCard key={b.id} b={b}/>
              ))}
            </div>
          </div>
        </div>
      </section>

      

      {/* NEW BARBERS */}
      <section className="section">
        <div style={{maxWidth:"100%"}}>
          <div className="section-header">
            <div className="section-title-wrap">
              <div className="section-eyebrow">Μόλις Άνοιξαν</div>
              <div className="section-title">🆕 Νέα Μπαρμπέρικα</div>
            </div>
            <div className="scroll-arrows">
              <button className="scroll-arrow" onClick={() => {
                const el = document.getElementById("new-scroll")
                if (el) el.scrollLeft -= 290
              }}>←</button>
              <button className="scroll-arrow" onClick={() => {
                const el = document.getElementById("new-scroll")
                if (el) el.scrollLeft += 290
              }}>→</button>
            </div>
          </div>
          <div className="cards-wrap" id="new-scroll">
            <div className="cards">
              {newShops.length === 0 ? (
                <div className="empty-cards">Δεν υπάρχουν νέα κουρεία ακόμα</div>
              ) : newShops.map(b => (
                <ShopCard key={b.id} b={b}/>
              ))}
            </div>
          </div>
        </div>
      </section>

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

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">BarberBook</div>
        <div className="footer-sub">© 2026 BarberBook · Made with ❤️ in Greece 🇬🇷</div>
      </footer>

      {/* MODAL */}
      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setModal(""); setAuthError("") } }}>
          <div className="modal-box">
            <button className="modal-close" onClick={() => { setModal(""); setAuthError("") }}>×</button>
            {modal === "login" ? (
              <LoginForm onSubmit={handleLogin} onSwitch={() => { setModal("register"); setAuthError("") }}
                onGoogle={handleGoogleLogin} loading={authLoading} error={authError}/>
            ) : (
              <RegisterForm onSubmit={handleRegister} onSwitch={() => { setModal("login"); setAuthError("") }}
                onGoogle={handleGoogleLogin} loading={authLoading} error={authError}/>
            )}
          </div>
        </div>
      )}
    </>
  )
}