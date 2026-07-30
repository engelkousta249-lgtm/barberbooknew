"use client"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://xcfkhdjiragblsiqetes.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZmtoZGppcmFnYmxzaXFldGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTY0ODYsImV4cCI6MjA5NzI3MjQ4Nn0.EkmgRuYzrvF0A_pgT9vaOouMRKeQ2kasPZxpoIuCgeE"
)

const DAYS = ["Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο","Κυριακή"]

function timeSlots() {
  const arr = []
  for (let h = 8; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) continue
      arr.push(String(h).padStart(2,"0") + ":" + String(m).padStart(2,"0"))
    }
  }
  return arr
}

export default function Dashboard() {
 const [calMonth, setCalMonth] = useState(new Date().toISOString().split("T")[0])
const [calSelectedDay, setCalSelectedDay] = useState<string|null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState("overview")
  const [appointments, setAppointments] = useState<any[]>([])
  const [barbershop, setBarbershop] = useState<any>(null)
  const [toast, setToast] = useState("")
  const [modal, setModal] = useState<null|"new"|"block"|"cancel"|"reschedule"|"detail">(null)
  const [selectedAppt, setSelectedAppt] = useState<any>(null)
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")
  const [newClient, setNewClient] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newService, setNewService] = useState("")
  const [newBarber, setNewBarber] = useState("")
  const [blockReason, setBlockReason] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [teamMembers, setTeamMembers] = useState<{id?:string,name:string,role:string,photo_url?:string}[]>([])
  const [editServices, setEditServices] = useState<{name:string,duration:number,price:number}[]>([])
  const [hours, setHours] = useState([
    {day:"Δευ",active:true,open:"09:00",close:"19:00"},
    {day:"Τρί",active:true,open:"09:00",close:"19:00"},
    {day:"Τετ",active:true,open:"09:00",close:"19:00"},
    {day:"Πέμ",active:true,open:"09:00",close:"21:00"},
    {day:"Παρ",active:true,open:"09:00",close:"21:00"},
    {day:"Σάβ",active:true,open:"10:00",close:"16:00"},
    {day:"Κυρ",active:false,open:"",close:""},
  ])
  const [photos, setPhotos] = useState<{id:string,url:string,is_cover:boolean}[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingBarberPhoto, setUploadingBarberPhoto] = useState<number|null>(null)
  const [reviews, setReviews] = useState<any[]>([])

  const today = new Date().toISOString().split("T")[0]
  const todayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 2500)
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = "/"; return }
      setUser(user)

      const { data: profile } = await supabase
        .from("profiles").select("*").eq("id", user.id).single()
      if (profile?.role !== "owner") { window.location.href = "/"; return }

      if (profile?.barbershop_id) {
        const { data: shop } = await supabase
          .from("barbershops").select("*").eq("id", profile.barbershop_id).single()
        setBarbershop(shop)

        const { data: appts } = await supabase
          .from("appointments").select("*")
          .eq("barbershop_id", profile.barbershop_id)
          .order("date", { ascending: true })
        setAppointments(appts || [])

        const { data: svcData } = await supabase
          .from("services").select("*").eq("shop_id", profile.barbershop_id)
        if (svcData && svcData.length > 0) {
          setEditServices(svcData.map((s:any) => ({name:s.name,duration:s.duration_minutes,price:s.price})))
          setNewService(svcData[0]?.name || "")
        }

        const { data: hoursData } = await supabase
          .from("working_hours").select("*").eq("shop_id", profile.barbershop_id).order("day_of_week")
        if (hoursData && hoursData.length > 0) {
          const dayShorts = ["Δευ","Τρί","Τετ","Πέμ","Παρ","Σάβ","Κυρ"]
          setHours(hoursData.map((h:any) => ({
            day: dayShorts[h.day_of_week], active:h.is_active,
            open:h.open_time||"09:00", close:h.close_time||"19:00",
          })))
        }

        const { data: barbersData } = await supabase
          .from("barbers").select("*").eq("shop_id", profile.barbershop_id)
        if (barbersData) {
          setTeamMembers(barbersData.map((b:any) => ({id:b.id,name:b.name,role:b.role,photo_url:b.photo_url})))
          if (barbersData.length > 0) setNewBarber(barbersData[0]?.name || "")
        }

        const { data: photosData } = await supabase
          .from("portfolio_photos").select("*").eq("shop_id", profile.barbershop_id)
        if (photosData) setPhotos(photosData)

        const { data: reviewsData } = await supabase
          .from("reviews").select("*").eq("shop_id", profile.barbershop_id)
          .order("created_at", { ascending: false })
        if (reviewsData) setReviews(reviewsData)
      }
      setLoading(false)
    }
    init()
  }, [])

  async function handleCancel(id: string) {
    const appt = appointments.find(a => a.id === id)
    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id)
    setAppointments(prev => prev.map(a => a.id === id ? {...a, status:"cancelled"} : a))
    setModal(null)
    showToast("Το ραντεβού ακυρώθηκε")
    if (appt?.customer_email) {
      await fetch("/api/send-email", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          type:"cancel_appointment", to:appt.customer_email,
          data:{shopName:barbershop?.name,customerName:appt.customer_name,service:appt.service,date:appt.date,time:appt.time}
        })
      })
    }
  }

  async function handleReschedule() {
    if (!newDate || !newTime) { showToast("Επέλεξε ημερομηνία και ώρα!"); return }
    await supabase.from("appointments")
      .update({ date:newDate, time:newTime, status:"pending" }).eq("id", selectedAppt.id)
    setAppointments(prev => prev.map(a =>
      a.id === selectedAppt.id ? {...a,date:newDate,time:newTime,status:"pending"} : a
    ))
    setModal(null); setNewDate(""); setNewTime("")
    showToast("Το ραντεβού αλλάχτηκε ✓")
  }

  async function handleNewAppt() {
    if (!newClient||!newDate||!newTime) { showToast("Συμπλήρωσε υποχρεωτικά πεδία!"); return }
    const { data } = await supabase.from("appointments").insert({
      customer_name:newClient, customer_email:newEmail,
      customer_phone:newPhone, service:newService,
      barber_name:newBarber, date:newDate, time:newTime,
      status:"confirmed", barbershop_id:barbershop?.id||null
    }).select().single()
    if (data) setAppointments(p=>[...p,data].sort((a,b)=>a.date.localeCompare(b.date)))
    setModal(null)
    setNewClient(""); setNewPhone(""); setNewEmail(""); setNewDate(""); setNewTime("")
    showToast("Το ραντεβού προστέθηκε ✓")
  }

  async function handleBlock() {
    if (!newDate||!newTime) { showToast("Επέλεξε ημερομηνία και ώρα!"); return }
    await supabase.from("appointments").insert({
      customer_name:"🚫 Αποκλεισμένο", customer_email:"",
      service:blockReason||"Μη διαθέσιμο", date:newDate, time:newTime,
      status:"cancelled", barbershop_id:barbershop?.id||null
    })
    setModal(null); setNewDate(""); setNewTime(""); setBlockReason("")
    showToast("Η ώρα αποκλείστηκε ✓")
  }

  async function saveTeam() {
    if (!barbershop?.id) return
    await supabase.from("barbers").delete().eq("shop_id", barbershop.id)
    if (teamMembers.filter(b=>b.name.trim()).length > 0) {
      await supabase.from("barbers").insert(
        teamMembers.filter(b=>b.name.trim()).map(b => ({
          shop_id:barbershop.id, name:b.name, role:b.role||"Barber", photo_url:b.photo_url||null,
        }))
      )
    }
    showToast("Αποθηκεύτηκε ✓")
  }

  async function uploadBarberPhoto(file: File, index: number) {
    if (!user) return
    setUploadingBarberPhoto(index)
    try {
      const path = `${user.id}/barber-${index}-${Date.now()}`
      const { error: upErr } = await supabase.storage.from("shop-media").upload(path, file, {upsert:true})
      if (upErr) { showToast("Σφάλμα upload!"); return }
      const { data } = supabase.storage.from("shop-media").getPublicUrl(path)
      const n = [...teamMembers]
      n[index].photo_url = data.publicUrl
      setTeamMembers(n)
      showToast("Φωτογραφία ανέβηκε ✓")
    } catch { showToast("Σφάλμα!") }
    setUploadingBarberPhoto(null)
  }

  async function uploadPhoto(file: File) {
    if (!barbershop?.id || !user) return
    setUploadingPhoto(true)
    try {
      const path = `${user.id}/photo-${Date.now()}`
      const { error: upErr } = await supabase.storage.from("shop-media").upload(path, file, {upsert:true})
      if (upErr) { showToast("Σφάλμα upload!"); return }
      const { data } = supabase.storage.from("shop-media").getPublicUrl(path)
      const { data: newPhoto } = await supabase.from("portfolio_photos").insert({
        shop_id:barbershop.id, url:data.publicUrl, is_cover:photos.length===0,
      }).select().single()
      if (newPhoto) setPhotos(p=>[...p,newPhoto])
      showToast("Φωτογραφία προστέθηκε ✓")
    } catch { showToast("Σφάλμα!") }
    setUploadingPhoto(false)
  }

  async function deletePhoto(id: string) {
    await supabase.from("portfolio_photos").delete().eq("id", id)
    setPhotos(p=>p.filter(ph=>ph.id!==id))
    showToast("Φωτογραφία διαγράφηκε")
  }

  async function setCover(id: string) {
    await supabase.from("portfolio_photos").update({is_cover:false}).eq("shop_id", barbershop.id)
    await supabase.from("portfolio_photos").update({is_cover:true}).eq("id", id)
    setPhotos(p=>p.map(ph=>({...ph,is_cover:ph.id===id})))
    showToast("Εξώφυλλο ενημερώθηκε ✓")
  }

  const todayAppts = appointments.filter(a => a.date===today && a.status!=="cancelled")
  const upcomingAppts = appointments.filter(a => a.date>today && a.status!=="cancelled")
  const cancelledCount = appointments.filter(a => a.status==="cancelled").length
  const totalRevenue = appointments
    .filter(a => a.status!=="cancelled")
    .reduce((sum, a) => {
      const svc = editServices.find(s => s.name === a.service)
      return sum + (svc?.price || 0)
    }, 0)

  const weekDays = DAYS.map((name, i) => {
    const d = new Date()
    const cur = d.getDay()===0 ? 6 : d.getDay()-1
    const diff = i - cur
    const date = new Date(d)
    date.setDate(d.getDate()+diff)
    const iso = date.toISOString().split("T")[0]
    return {
      name, iso, isToday:iso===today,
      appts: appointments.filter(a => a.date===iso && a.status!=="cancelled")
    }
  })

  const initials = (user?.user_metadata?.full_name || user?.email || "?")
    .split(" ").map((w:string) => w[0]).join("").slice(0,2).toUpperCase()

  const maxBarbers = barbershop?.plan==="duo" ? 2 : barbershop?.plan==="team" ? 10 : 1

  // Πότε λήγει το πλάνο (2 μήνες από εγγραφή)
  const planExpiry = barbershop?.created_at
    ? new Date(new Date(barbershop.created_at).getTime() + 60*24*60*60*1000)
    : null
  const daysLeft = planExpiry
    ? Math.max(0, Math.ceil((planExpiry.getTime() - Date.now()) / (1000*60*60*24)))
    : null

  const navItems = [
    {v:"overview", icon:"⊞", label:"Επισκόπηση"},
    {v:"week", icon:"📅", label:"Εβδομάδα"},
    {v:"services", icon:"✂️", label:"Υπηρεσίες"},
    {v:"hours", icon:"🕒", label:"Ωράριο"},
    {v:"team", icon:"👥", label:"Ομάδα"},
    {v:"gallery", icon:"🖼️", label:"Gallery"},
    {v:"reviews", icon:"⭐", label:"Κριτικές"},
    {v:"plan", icon:"💳", label:"Πλάνο"},
    {v:"settings", icon:"⚙️", label:"Ρυθμίσεις"},
  ]

  if (loading) return (
    <div style={{background:"#0a0f1e",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Inter,sans-serif",color:"#64748b",fontSize:16}}>
      ⏳ Φορτώνει...
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        :root{
          --bg:#0a0f1e;--sidebar:#0d1526;--card:#111827;--card2:#1a2235;
          --border:rgba(255,255,255,.07);--blue:#3b82f6;--blue-soft:rgba(59,130,246,.12);
          --blue-glow:rgba(59,130,246,.3);--gold:#f59e0b;--text:#f1f5f9;--muted:#64748b;
          --muted2:#94a3b8;--green:#10b981;--red:#ef4444;--purple:#8b5cf6;
        }
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{height:100%;}
        body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);overflow-x:hidden;}
        h1,h2,h3{font-family:'Outfit',sans-serif;}
        button,input,select,textarea{font-family:inherit;}

        @keyframes fadeIn{from{opacity:0;transform:translateY(10px) rotateX(-4deg);}to{opacity:1;transform:translateY(0) rotateX(0);}}
        @keyframes slideIn{from{transform:translateX(-100%);}to{transform:translateX(0);}}
        @keyframes popIn{0%{opacity:0;transform:scale(.85) rotateX(-8deg);}100%{opacity:1;transform:scale(1) rotateX(0);}}
        @keyframes pulseGlow{0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,.35);}50%{box-shadow:0 0 0 7px rgba(59,130,246,0);}}
        @keyframes shineSweep{0%{background-position:200% 0;}100%{background-position:-50% 0;}}
        @keyframes dotPulse{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.3);opacity:.6;}}

        .layout{display:flex;min-height:100vh;perspective:2000px;}
        .sidebar{width:220px;flex-shrink:0;background:var(--sidebar);border-right:1px solid var(--border);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto;}
        .sidebar-top{padding:20px 16px;border-bottom:1px solid var(--border);}
        .brand{font-family:'Outfit',sans-serif;font-size:18px;font-weight:800;background:linear-gradient(135deg,var(--blue),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;cursor:pointer;}
        .shop-name-side{font-size:11px;color:var(--muted);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:4px;}
        .sidebar-nav{padding:12px 10px;flex:1;}
        .nav-section{font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--muted);padding:8px 8px 4px;}
        .nav-btn{position:relative;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;font-size:13px;font-weight:500;color:var(--muted2);cursor:pointer;transition:all .18s ease-out;background:none;border:none;width:100%;text-align:left;margin-bottom:2px;overflow:hidden;}
        .nav-btn:hover{background:rgba(255,255,255,.04);color:var(--text);transform:translateX(2px);}
        .nav-btn.active{background:var(--blue-soft);color:#93c5fd;font-weight:600;box-shadow:0 4px 14px -6px rgba(59,130,246,.4);}
        .nav-btn.active::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:60%;background:linear-gradient(180deg,var(--blue),#60a5fa);border-radius:0 3px 3px 0;box-shadow:0 0 8px rgba(59,130,246,.6);}
        .nav-btn .nav-ic{font-size:15px;width:20px;text-align:center;flex-shrink:0;transition:transform .18s;}
        .nav-btn:hover .nav-ic{transform:scale(1.15);}
        .sidebar-foot{padding:14px 16px;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px;}
        .avatar{width:34px;height:34px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,var(--gold),#b45309);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#1a0f00;box-shadow:0 4px 12px rgba(245,158,11,.3);}
        .foot-name{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .foot-role{font-size:10.5px;color:var(--muted);}
        .logout-btn{margin-left:auto;background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px;transition:all .2s;padding:4px;}
        .logout-btn:hover{color:var(--red);transform:rotate(-8deg) scale(1.1);}
        .topbar{background:rgba(13,21,38,.85);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);padding:0 28px;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:30;}
        .topbar-left{display:flex;align-items:center;gap:14px;}
        .menu-btn{display:none;background:none;border:1px solid var(--border);border-radius:8px;color:var(--muted2);cursor:pointer;padding:6px 8px;font-size:16px;}
        .page-title{font-family:'Outfit',sans-serif;font-size:17px;font-weight:700;}
        .page-sub{font-size:12px;color:var(--muted);margin-top:1px;}
        .topbar-right{display:flex;align-items:center;gap:10px;}
        .preview-btn{display:flex;align-items:center;gap:6px;padding:7px 14px;background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.25);border-radius:999px;font-size:12px;font-weight:600;color:#93c5fd;cursor:pointer;transition:all .2s ease-out;}
        .preview-btn:hover{background:rgba(59,130,246,.2);transform:translateY(-2px);box-shadow:0 6px 16px -6px rgba(59,130,246,.4);}
        .icon-btn-top{width:36px;height:36px;border-radius:10px;background:var(--card2);border:1px solid var(--border);color:var(--muted2);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;transition:all .2s ease-out;}
        .icon-btn-top:hover{border-color:var(--blue);color:var(--blue);transform:translateY(-2px) rotate(90deg);box-shadow:0 6px 16px -6px rgba(59,130,246,.4);}
        .main{flex:1;display:flex;flex-direction:column;min-width:0;}
        .content{padding:24px 28px;flex:1;overflow-y:auto;}

        /* STATS — 3D tilt + shine */
        .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px;perspective:1200px;}
        .stat{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:18px 20px;transition:transform .18s ease-out,border-color .2s,box-shadow .2s;position:relative;overflow:hidden;transform-style:preserve-3d;animation:fadeIn .4s ease both;}
        .stats .stat:nth-child(1){animation-delay:.03s;}
        .stats .stat:nth-child(2){animation-delay:.09s;}
        .stats .stat:nth-child(3){animation-delay:.15s;}
        .stats .stat:nth-child(4){animation-delay:.21s;}
        .stat::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;border-radius:2px 2px 0 0;}
        .stat.blue::before{background:linear-gradient(90deg,var(--blue),transparent);}
        .stat.gold::before{background:linear-gradient(90deg,var(--gold),transparent);}
        .stat.green::before{background:linear-gradient(90deg,var(--green),transparent);}
        .stat.purple::before{background:linear-gradient(90deg,var(--purple),transparent);}
        .stat:hover{border-color:rgba(255,255,255,.14);transform:translateY(-5px) rotateX(5deg);box-shadow:0 20px 40px -18px rgba(0,0,0,.6);}
        .stat.blue:hover{box-shadow:0 20px 40px -16px rgba(59,130,246,.35);}
        .stat.gold:hover{box-shadow:0 20px 40px -16px rgba(245,158,11,.3);}
        .stat.green:hover{box-shadow:0 20px 40px -16px rgba(16,185,129,.3);}
        .stat.purple:hover{box-shadow:0 20px 40px -16px rgba(139,92,246,.3);}
        .stat-label{font-size:11.5px;color:var(--muted);font-weight:600;margin-bottom:10px;text-transform:uppercase;letter-spacing:.3px;}
        .stat-val{font-family:'Outfit',sans-serif;font-size:26px;font-weight:800;line-height:1;transform:translateZ(10px);}
        .stat-val.blue{color:var(--blue);}
        .stat-val.gold{color:var(--gold);}
        .stat-val.green{color:var(--green);}
        .stat-val.purple{color:var(--purple);}
        .stat-delta{font-size:11px;color:var(--muted);margin-top:6px;font-weight:500;}

        .grid2{display:grid;grid-template-columns:1.4fr 1fr;gap:16px;margin-bottom:16px;}
        .panel{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;animation:fadeIn .35s cubic-bezier(.2,.8,.2,1) both;box-shadow:0 20px 44px -26px rgba(0,0,0,.6);}
        .panel-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;}
        .panel-head h2{font-size:14.5px;font-weight:700;}
        .link-btn{font-size:12px;color:var(--blue);cursor:pointer;background:none;border:none;font-weight:600;transition:transform .15s;}
        .link-btn:hover{transform:translateX(3px);}

        /* APPOINTMENT CARDS */
        .appt-list{display:flex;flex-direction:column;gap:8px;perspective:1000px;}
        .appt-card{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--card2);border:1px solid var(--border);border-radius:12px;transition:transform .18s ease-out,border-color .2s,box-shadow .2s;cursor:pointer;transform-style:preserve-3d;animation:fadeIn .3s ease both;}
        .appt-card:hover{border-color:rgba(59,130,246,.35);transform:translateY(-3px) rotateX(3deg);box-shadow:0 14px 28px -16px rgba(59,130,246,.35);}
        .appt-card.cancelled{opacity:.4;}
        .appt-time-box{background:var(--blue-soft);border:1px solid rgba(59,130,246,.2);border-radius:8px;padding:6px 10px;text-align:center;flex-shrink:0;min-width:52px;transform:translateZ(6px);}
        .appt-time{font-size:13px;font-weight:800;color:var(--blue);}
        .appt-date{font-size:10px;color:var(--muted);margin-top:1px;}
        .appt-info{flex:1;min-width:0;}
        .appt-name{font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .appt-svc{font-size:11.5px;color:var(--muted);margin-top:2px;}
        .appt-contact{font-size:11px;color:var(--muted);margin-top:2px;}
        .badge{font-size:10.5px;font-weight:700;padding:4px 9px;border-radius:999px;white-space:nowrap;flex-shrink:0;}
        .badge.pending{background:rgba(245,158,11,.12);color:var(--gold);border:1px solid rgba(245,158,11,.2);}
        .badge.confirmed{background:rgba(16,185,129,.1);color:var(--green);border:1px solid rgba(16,185,129,.2);}
        .badge.cancelled{background:rgba(239,68,68,.1);color:var(--red);border:1px solid rgba(239,68,68,.2);}
        .appt-btns{display:flex;gap:6px;flex-shrink:0;}
        .appt-btn{padding:5px 10px;border-radius:7px;font-size:11.5px;font-weight:600;cursor:pointer;transition:all .18s ease-out;border:1px solid var(--border);background:var(--card);color:var(--muted2);}
        .appt-btn:hover{border-color:var(--blue);color:var(--blue);transform:translateY(-2px);}
        .appt-btn.danger:hover{border-color:var(--red);color:var(--red);}

        /* LEGACY WEEK STRIP (kept, enhanced) */
        .week-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:10px;perspective:1000px;}
        .day-col{background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:12px 10px;min-width:0;transition:transform .18s ease-out,border-color .2s;}
        .day-col:hover{transform:translateY(-3px);border-color:rgba(59,130,246,.3);}
        .day-col.today{border-color:rgba(59,130,246,.35);background:var(--blue-soft);animation:pulseGlow 2.4s ease-in-out infinite;}
        .day-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px;}
        .day-name{font-size:12px;font-weight:700;}
        .day-count{font-size:10px;color:var(--muted);}
        .mini-appt{background:var(--card);border-radius:8px;padding:7px 8px;margin-bottom:6px;border:1px solid var(--border);cursor:pointer;transition:all .15s ease-out;}
        .mini-appt:hover{border-color:rgba(59,130,246,.3);transform:translateX(2px);}
        .mini-time{font-size:10.5px;font-weight:700;color:var(--blue);}
        .mini-name{font-size:12px;font-weight:600;margin-top:1px;}
        .mini-svc{font-size:10.5px;color:var(--muted);margin-top:1px;}
        .day-empty{color:var(--muted);font-size:11px;text-align:center;padding:12px 0;}

        /* CALENDAR (view === "week") — premium 3D */
        .cal-grid{perspective:1100px;}
        .cal-day{aspect-ratio:1;border-radius:10px;border:1px solid var(--border);background:var(--card2);
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          cursor:default;padding:4px;position:relative;transform-style:preserve-3d;
          transition:transform .16s ease-out,border-color .2s,box-shadow .2s,background .2s,opacity .2s;
          animation:fadeIn .3s ease both;}
        .cal-day.has-appts{cursor:pointer;border-color:rgba(59,130,246,.28);background:rgba(59,130,246,.07);}
        .cal-day.has-appts:hover{transform:translateY(-4px) rotateX(10deg) scale(1.03);
          box-shadow:0 16px 30px -14px rgba(59,130,246,.45);border-color:var(--blue);}
        .cal-day.today{border-color:var(--blue);background:var(--blue-soft);
          box-shadow:0 0 0 1px rgba(59,130,246,.3) inset;animation:pulseGlow 2.4s ease-in-out infinite;}
        .cal-day.past{opacity:.4;}
        .cal-day-num{font-size:13px;font-weight:600;color:var(--text);transition:color .2s;transform:translateZ(8px);}
        .cal-day.today .cal-day-num{font-weight:800;color:var(--blue);}
        .cal-dot{width:6px;height:6px;border-radius:50%;background:var(--blue);margin-top:3px;
          box-shadow:0 0 8px rgba(59,130,246,.7);animation:dotPulse 1.8s ease-in-out infinite;}
        .cal-badge{position:absolute;top:4px;right:4px;background:linear-gradient(135deg,var(--blue),#60a5fa);
          color:#fff;font-size:9px;font-weight:800;width:16px;height:16px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(59,130,246,.55);
          transform:translateZ(14px);}

        .svc-head{display:grid;grid-template-columns:1fr 80px 80px 32px;gap:8px;font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.3px;font-weight:600;padding:0 2px;margin-bottom:8px;}
        .svc-row{display:grid;grid-template-columns:1fr 80px 80px 32px;gap:8px;align-items:center;margin-bottom:8px;}
        .svc-inp{width:100%;background:var(--card2);border:1px solid var(--border);border-radius:9px;padding:9px 11px;font-size:13.5px;color:var(--text);outline:none;transition:all .2s;}
        .svc-inp:focus{border-color:var(--blue);box-shadow:0 0 0 2px var(--blue-soft);}
        .svc-inp.gold{color:var(--gold);font-weight:700;}
        .del-btn{width:32px;height:32px;border-radius:8px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.15);color:var(--red);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;transition:all .2s ease-out;}
        .del-btn:hover{background:rgba(239,68,68,.15);transform:scale(1.1) rotate(90deg);}
        .add-svc-btn{width:100%;padding:10px;border-radius:10px;border:1.5px dashed rgba(59,130,246,.25);background:rgba(59,130,246,.04);color:#60a5fa;font-size:13px;font-weight:600;cursor:pointer;margin-top:8px;transition:all .2s ease-out;}
        .add-svc-btn:hover{border-color:var(--blue);background:var(--blue-soft);transform:translateY(-2px);}
        .hour-row{display:flex;align-items:center;gap:12px;padding:11px 14px;background:var(--card2);border:1px solid var(--border);border-radius:12px;margin-bottom:8px;transition:transform .15s ease-out;}
        .hour-row:hover{transform:translateX(2px);}
        .hour-row.off{opacity:.45;}
        .hour-day{font-size:13px;font-weight:700;width:36px;flex-shrink:0;}
        .hour-inp{background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:7px 9px;font-size:12.5px;color:var(--text);font-family:'Inter',sans-serif;outline:none;}
        .hour-sep{color:var(--muted);font-size:12px;}
        .hour-closed{font-size:12px;color:var(--muted);flex:1;}
        .toggle{width:40px;height:22px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid var(--border);position:relative;cursor:pointer;flex-shrink:0;margin-left:auto;transition:all .25s;}
        .toggle::after{content:'';position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:var(--muted);transition:all .25s;}
        .toggle.on{background:rgba(59,130,246,.2);border-color:rgba(59,130,246,.4);}
        .toggle.on::after{left:21px;background:var(--blue);box-shadow:0 0 8px rgba(59,130,246,.6);}
        .team-card{background:var(--card2);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:10px;display:flex;align-items:center;gap:14px;transition:transform .15s ease-out,border-color .2s;}
        .team-card:hover{transform:translateY(-2px);border-color:rgba(59,130,246,.25);}
        .team-avatar{width:52px;height:52px;border-radius:50%;flex-shrink:0;overflow:hidden;border:2px solid var(--border);background:linear-gradient(135deg,var(--blue-soft),var(--card2));display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;position:relative;}
        .team-avatar img{width:100%;height:100%;object-fit:cover;}
        .team-avatar-upload{position:absolute;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;opacity:0;transition:.2s;cursor:pointer;font-size:16px;}
        .team-card:hover .team-avatar-upload{opacity:1;}
        .team-inputs{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:8px;}
        .gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;perspective:1000px;}
        .gallery-item{aspect-ratio:1;border-radius:14px;overflow:hidden;position:relative;border:1px solid var(--border);background:var(--card2);transition:transform .18s ease-out,box-shadow .2s;}
        .gallery-item:hover{transform:translateY(-4px) rotateX(4deg);box-shadow:0 18px 32px -16px rgba(0,0,0,.6);}
        .gallery-item img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .35s;}
        .gallery-item:hover img{transform:scale(1.08);}
        .gallery-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7),transparent 50%);opacity:0;transition:opacity .2s;display:flex;align-items:flex-end;padding:10px;gap:6px;}
        .gallery-item:hover .gallery-overlay{opacity:1;}
        .gallery-btn{padding:5px 10px;border-radius:7px;font-size:11px;font-weight:700;cursor:pointer;border:none;transition:all .2s;}
        .gallery-btn.cover{background:var(--gold);color:#1a0f00;}
        .gallery-btn.del{background:var(--red);color:#fff;}
        .gallery-cover-badge{position:absolute;top:8px;left:8px;background:var(--gold);color:#1a0f00;font-size:9.5px;font-weight:800;padding:3px 8px;border-radius:999px;}
        .gallery-add{aspect-ratio:1;border-radius:14px;border:2px dashed rgba(59,130,246,.25);background:rgba(59,130,246,.04);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:#60a5fa;font-size:12px;font-weight:600;gap:6px;transition:all .2s ease-out;}
        .gallery-add:hover{border-color:var(--blue);background:var(--blue-soft);transform:translateY(-3px);}
        .gallery-add .plus{font-size:28px;}
        .review-card{background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:10px;transition:transform .15s ease-out;}
        .review-card:hover{transform:translateY(-2px);}
        .plan-card-d{background:var(--card2);border:1px solid var(--border);border-radius:16px;padding:24px;margin-bottom:14px;}
        .plan-expiry-bar{height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden;margin:12px 0;}
        .plan-expiry-fill{height:100%;border-radius:3px;transition:width .4s;}
        .settings-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:22px;margin-bottom:14px;}
        .settings-card h3{font-size:15px;font-weight:700;margin-bottom:16px;}
        .settings-row{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid var(--border);}
        .settings-row:last-child{border-bottom:none;}
        .settings-label{font-size:13px;color:var(--muted2);}
        .settings-val{font-size:13px;font-weight:600;}
        .btn{padding:10px 18px;border-radius:10px;font-size:13.5px;font-weight:700;cursor:pointer;transition:all .18s ease-out;border:1px solid var(--border);background:var(--card2);color:var(--text);}
        .btn:hover{border-color:var(--blue);transform:translateY(-2px);}
        .btn.primary{position:relative;background:linear-gradient(135deg,var(--blue),#1d4ed8);border:none;color:#fff;box-shadow:0 6px 20px -6px var(--blue-glow);overflow:hidden;}
        .btn.primary::after{content:'';position:absolute;inset:0;background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.25) 50%,transparent 70%);background-size:250% 100%;background-position:200% 0;}
        .btn.primary:hover{filter:brightness(1.08);transform:translateY(-2px);box-shadow:0 10px 26px -8px var(--blue-glow);}
        .btn.primary:hover::after{animation:shineSweep .8s ease;}
        .btn.danger{background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.2);color:var(--red);}
        .btn.danger:hover{background:rgba(239,68,68,.15);}
        .btn.sm{padding:7px 13px;font-size:12px;}
        .quick-actions{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;}
        .overlay{position:fixed;inset:0;z-index:60;background:rgba(5,10,20,.82);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;}
        .modal{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:26px;width:100%;max-width:460px;animation:popIn .28s cubic-bezier(.2,.9,.25,1.1) both;max-height:90vh;overflow-y:auto;box-shadow:0 40px 80px -24px rgba(0,0,0,.7);}
        .modal h3{font-size:17px;font-weight:700;margin-bottom:6px;}
        .modal p{font-size:13px;color:var(--muted2);margin-bottom:16px;line-height:1.6;}
        .modal-field{margin-bottom:12px;}
        .modal-field label{display:block;font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.3px;margin-bottom:6px;}
        .modal-field input,.modal-field select,.modal-field textarea{width:100%;background:var(--card2);border:1px solid var(--border);border-radius:10px;padding:11px 13px;font-size:14px;color:var(--text);outline:none;transition:all .2s;}
        .modal-field input:focus,.modal-field select:focus{border-color:var(--blue);box-shadow:0 0 0 2px var(--blue-soft);}
        .modal-field textarea{resize:none;min-height:60px;}
        .modal-actions{display:flex;gap:10px;margin-top:20px;}
        .modal-actions .btn{flex:1;text-align:center;}
        .time-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px;}
        .time-slot{padding:9px 4px;text-align:center;border-radius:9px;border:1px solid var(--border);background:var(--card2);font-size:12px;font-weight:700;cursor:pointer;transition:all .16s ease-out;color:var(--muted2);}
        .time-slot:hover{transform:translateY(-2px);}
        .time-slot:hover,.time-slot.sel{background:var(--blue-soft);border-color:rgba(59,130,246,.35);color:var(--blue);}
        .detail-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13.5px;}
        .detail-row:last-child{border-bottom:none;}
        .detail-label{color:var(--muted2);font-weight:500;}
        .detail-val{font-weight:700;text-align:right;}
        .mobile-overlay{display:none;}
        .bottom-nav{display:none;}
        .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--card);border:1px solid var(--border);color:var(--text);padding:11px 20px;border-radius:12px;font-size:13px;font-weight:600;opacity:0;transition:all .25s;pointer-events:none;z-index:99;white-space:nowrap;box-shadow:0 8px 32px rgba(0,0,0,.3);}
        .toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
        .empty{text-align:center;padding:32px;color:var(--muted);font-size:13px;}
        .empty-icon{font-size:32px;display:block;margin-bottom:10px;}
        @media(max-width:1024px){.stats{grid-template-columns:repeat(2,1fr);}.grid2{grid-template-columns:1fr;}.week-grid{grid-template-columns:repeat(3,1fr);}}
        @media(max-width:768px){
          .sidebar{display:none;}
          .sidebar.mobile-open{display:flex;position:fixed;z-index:50;height:100vh;animation:slideIn .25s ease;}
          .mobile-overlay{display:block;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:40;}
          .menu-btn{display:flex;}
          .content{padding:16px;padding-bottom:80px;}
          .week-grid{grid-template-columns:repeat(2,1fr);}
          .bottom-nav{display:flex;position:fixed;bottom:0;left:0;right:0;z-index:30;background:var(--card);border-top:1px solid var(--border);padding:8px 4px calc(8px + env(safe-area-inset-bottom));justify-content:space-around;overflow-x:auto;}
          .bn-item{display:flex;flex-direction:column;align-items:center;gap:2px;background:none;border:none;color:var(--muted);font-size:8.5px;font-weight:600;padding:5px 6px;border-radius:10px;cursor:pointer;flex-shrink:0;}
          .bn-item .ic{font-size:16px;}
          .bn-item.active{color:var(--blue);}
          .gallery-grid{grid-template-columns:repeat(2,1fr);}
          .team-inputs{grid-template-columns:1fr;}
          .svc-row,.svc-head{grid-template-columns:1fr 70px 70px 30px;}
        }
        @media(max-width:480px){.stats{grid-template-columns:repeat(2,1fr);}.week-grid{grid-template-columns:1fr;}}
      `}</style>

      <div className="layout">
        {sidebarOpen && <div className="mobile-overlay" onClick={()=>setSidebarOpen(false)}/>}
        <aside className={`sidebar ${sidebarOpen?"mobile-open":""}`}>
          <div className="sidebar-top">
            <div className="brand" onClick={()=>window.location.href="/"}>BarberBook</div>
            <div className="shop-name-side">{barbershop?.name||"Dashboard"}</div>
          </div>
          <div className="sidebar-nav">
            <div className="nav-section">Κύριο</div>
            {navItems.slice(0,2).map(n=>(
              <button key={n.v} className={`nav-btn ${view===n.v?"active":""}`}
                onClick={()=>{setView(n.v);setSidebarOpen(false)}}>
                <span className="nav-ic">{n.icon}</span>{n.label}
              </button>
            ))}
            <div className="nav-section" style={{marginTop:8}}>Κατάστημα</div>
            {navItems.slice(2).map(n=>(
              <button key={n.v} className={`nav-btn ${view===n.v?"active":""}`}
                onClick={()=>{setView(n.v);setSidebarOpen(false)}}>
                <span className="nav-ic">{n.icon}</span>{n.label}
              </button>
            ))}
          </div>
          <div className="sidebar-foot">
            <div className="avatar">{initials}</div>
            <div style={{minWidth:0}}>
              <div className="foot-name">{user?.user_metadata?.full_name||user?.email}</div>
              <div className="foot-role">Owner · {barbershop?.plan||"freemium"}</div>
            </div>
            <button className="logout-btn"
              onClick={async()=>{await supabase.auth.signOut();window.location.href="/"}}>⏻</button>
          </div>
        </aside>

        <div className="main">
          <div className="topbar">
            <div className="topbar-left">
              <button className="menu-btn" onClick={()=>setSidebarOpen(!sidebarOpen)}>☰</button>
              <div>
                <div className="page-title">{navItems.find(n=>n.v===view)?.label||"Dashboard"}</div>
                <div className="page-sub">{todayName} · {barbershop?.name||"BarberBook"}</div>
              </div>
            </div>
            <div className="topbar-right">
              {barbershop?.id && (
                <button className="preview-btn"
                  onClick={()=>window.open(`/barbershops/${barbershop.id}`,"_blank")}>
                  👁️ Preview
                </button>
              )}
              <button className="icon-btn-top" onClick={()=>setModal("new")} title="Νέο Ραντεβού">+</button>
            </div>
          </div>

          <div className="content">

            {/* OVERVIEW */}
            {view==="overview" && (<>
              <div className="stats">
                <div className="stat blue"><div className="stat-label">Σήμερα</div><div className="stat-val blue">{todayAppts.length}</div><div className="stat-delta">ραντεβού</div></div>
                <div className="stat gold"><div className="stat-label">Έσοδα</div><div className="stat-val gold">€{totalRevenue}</div><div className="stat-delta">συνολικά</div></div>
                <div className="stat green"><div className="stat-label">Επερχόμενα</div><div className="stat-val green">{upcomingAppts.length}</div><div className="stat-delta">ραντεβού</div></div>
                <div className="stat purple"><div className="stat-label">Ακυρώσεις</div><div className="stat-val purple">{cancelledCount}</div><div className="stat-delta">σύνολο</div></div>
              </div>
              <div className="grid2">
                <div className="panel">
                  <div className="panel-head">
                    <h2>📅 Σημερινό Πρόγραμμα</h2>
                    <button className="link-btn" onClick={()=>setView("week")}>Εβδομάδα →</button>
                  </div>
                  {todayAppts.length===0 ? (
                    <div className="empty"><span className="empty-icon">😴</span>Κανένα ραντεβού σήμερα</div>
                  ) : (
                    <div className="appt-list">
                      {todayAppts.map(a=>(
                        <ApptCard key={a.id} appt={a}
                          onClick={()=>{setSelectedAppt(a);setModal("detail")}}
                          onCancel={()=>{setSelectedAppt(a);setModal("cancel")}}
                          onReschedule={()=>{setSelectedAppt(a);setModal("reschedule")}}/>
                      ))}
                    </div>
                  )}
                  <div className="quick-actions">
                    <button className="btn primary sm" onClick={()=>setModal("new")}>+ Νέο Ραντεβού</button>
                    <button className="btn sm" onClick={()=>setModal("block")}>🚫 Αποκλεισμός</button>
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-head">
                    <h2>📋 Επερχόμενα</h2>
                    <span style={{fontSize:12,color:"var(--muted)"}}>{upcomingAppts.length}</span>
                  </div>
                  {upcomingAppts.length===0 ? (
                    <div className="empty"><span className="empty-icon">📭</span>Κανένα επερχόμενο</div>
                  ) : (
                    <div className="appt-list">
                      {upcomingAppts.slice(0,6).map(a=>(
                        <ApptCard key={a.id} appt={a}
                          onClick={()=>{setSelectedAppt(a);setModal("detail")}}
                          onCancel={()=>{setSelectedAppt(a);setModal("cancel")}}
                          onReschedule={()=>{setSelectedAppt(a);setModal("reschedule")}}/>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>)}

            {view==="week" && (
  <div className="panel">
    <div className="panel-head">
      <h2>📅 Ημερολόγιο</h2>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button className="btn sm" onClick={()=>{
          const d = new Date(calMonth)
          d.setMonth(d.getMonth()-1)
          setCalMonth(d.toISOString().split("T")[0])
        }}>←</button>
        <span style={{fontSize:14,fontWeight:700,minWidth:120,textAlign:"center"}}>
          {new Date(calMonth).toLocaleDateString("el-GR",{month:"long",year:"numeric"})}
        </span>
        <button className="btn sm" onClick={()=>{
          const d = new Date(calMonth)
          d.setMonth(d.getMonth()+1)
          setCalMonth(d.toISOString().split("T")[0])
        }}>→</button>
        <button className="btn sm primary" onClick={()=>setModal("new")}>+ Νέο</button>
      </div>
    </div>

    {/* Day headers */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:8}}>
      {["Δευ","Τρί","Τετ","Πέμ","Παρ","Σάβ","Κυρ"].map(d=>(
        <div key={d} style={{textAlign:"center",fontSize:11,fontWeight:700,color:"var(--muted)",padding:"6px 0",textTransform:"uppercase",letterSpacing:".5px"}}>
          {d}
        </div>
      ))}
    </div>

    {/* Calendar grid */}
    <div className="cal-grid" style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
      {(() => {
        const year = new Date(calMonth).getFullYear()
        const month = new Date(calMonth).getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month+1, 0)
        // Δευτέρα = 0
        let startDow = firstDay.getDay()-1
        if (startDow < 0) startDow = 6
        const cells = []
        // Empty cells before
        for (let i=0; i<startDow; i++) {
          cells.push(<div key={`e${i}`}/>)
        }
        // Days
        for (let d=1; d<=lastDay.getDate(); d++) {
          const iso = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`
          const dayAppts = appointments.filter(a=>a.date===iso&&a.status!=="cancelled")
          const isToday = iso===today
          const isPast = iso<today
          cells.push(
            <div key={d}
              className={`cal-day ${isToday?"today":""} ${dayAppts.length>0?"has-appts":""} ${isPast&&!isToday?"past":""}`}
              onClick={()=>{
                if(dayAppts.length>0) setCalSelectedDay(iso)
              }}>
              <span className="cal-day-num">{d}</span>
              {dayAppts.length>0 && <div className="cal-dot"/>}
              {dayAppts.length>1 && <div className="cal-badge">{dayAppts.length}</div>}
            </div>
          )
        }
        return cells
      })()}
    </div>

    {/* Selected day appointments */}
    {calSelectedDay && (
      <div style={{marginTop:20,paddingTop:20,borderTop:"1px solid var(--border)"}}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>
          📅 {new Date(calSelectedDay).toLocaleDateString("el-GR",{weekday:"long",day:"numeric",month:"long"})}
          <span style={{fontSize:12,color:"var(--muted)",marginLeft:8}}>
            {appointments.filter(a=>a.date===calSelectedDay&&a.status!=="cancelled").length} ραντεβού
          </span>
        </div>
        <div className="appt-list">
          {appointments
            .filter(a=>a.date===calSelectedDay&&a.status!=="cancelled")
            .sort((a,b)=>a.time.localeCompare(b.time))
            .map(a=>(
              <ApptCard key={a.id} appt={a}
                onClick={()=>{setSelectedAppt(a);setModal("detail")}}
                onCancel={()=>{setSelectedAppt(a);setModal("cancel")}}
                onReschedule={()=>{setSelectedAppt(a);setModal("reschedule")}}/>
            ))
          }
        </div>
      </div>
    )}
  </div>
)}

            {/* SERVICES */}
            {view==="services" && (
              <div className="panel" style={{maxWidth:580}}>
                <div className="panel-head">
                  <h2>✂️ Υπηρεσίες & Τιμές</h2>
                  <button className="btn sm primary" onClick={async()=>{
                    if (!barbershop?.id) return
                    await supabase.from("services").delete().eq("shop_id",barbershop.id)
                    await supabase.from("services").insert(
                      editServices.map(s=>({shop_id:barbershop.id,name:s.name,price:s.price,duration_minutes:s.duration}))
                    )
                    showToast("Αποθηκεύτηκε ✓")
                  }}>Αποθήκευση</button>
                </div>
                <div className="svc-head"><span>Υπηρεσία</span><span>Λεπτά</span><span>Τιμή €</span><span/></div>
                {editServices.map((s,i)=>(
                  <div key={i} className="svc-row">
                    <input className="svc-inp" value={s.name} onChange={e=>{const n=[...editServices];n[i].name=e.target.value;setEditServices(n)}}/>
                    <input className="svc-inp" type="number" value={s.duration} onChange={e=>{const n=[...editServices];n[i].duration=+e.target.value;setEditServices(n)}}/>
                    <input className="svc-inp gold" type="number" value={s.price} onChange={e=>{const n=[...editServices];n[i].price=+e.target.value;setEditServices(n)}}/>
                    <button className="del-btn" onClick={()=>setEditServices(p=>p.filter((_,j)=>j!==i))}>✕</button>
                  </div>
                ))}
                <button className="add-svc-btn" onClick={()=>setEditServices(p=>[...p,{name:"",duration:30,price:15}])}>
                  + Προσθήκη Υπηρεσίας
                </button>
              </div>
            )}

            {/* HOURS */}
            {view==="hours" && (
              <div className="panel" style={{maxWidth:480}}>
                <div className="panel-head">
                  <h2>🕒 Ωράριο Λειτουργίας</h2>
                  <button className="btn sm primary" onClick={async()=>{
                    if (!barbershop?.id) return
                    await supabase.from("working_hours").delete().eq("shop_id",barbershop.id)
                    await supabase.from("working_hours").insert(
                      hours.map((h,i)=>({shop_id:barbershop.id,day_of_week:i,is_active:h.active,open_time:h.active?h.open:null,close_time:h.active?h.close:null}))
                    )
                    showToast("Αποθηκεύτηκε ✓")
                  }}>Αποθήκευση</button>
                </div>
                {hours.map((h,i)=>(
                  <div key={h.day} className={`hour-row ${h.active?"":"off"}`}>
                    <span className="hour-day">{h.day}</span>
                    {h.active ? (<>
                      <input type="time" className="hour-inp" value={h.open} onChange={e=>{const n=[...hours];n[i].open=e.target.value;setHours(n)}}/>
                      <span className="hour-sep">–</span>
                      <input type="time" className="hour-inp" value={h.close} onChange={e=>{const n=[...hours];n[i].close=e.target.value;setHours(n)}}/>
                    </>) : <span className="hour-closed">Κλειστά</span>}
                    <div className={`toggle ${h.active?"on":""}`} onClick={()=>{
                      const n=[...hours];n[i].active=!n[i].active
                      if(n[i].active&&!n[i].open){n[i].open="09:00";n[i].close="19:00"}
                      setHours(n)
                    }}/>
                  </div>
                ))}
              </div>
            )}

            {/* TEAM */}
            {view==="team" && (
              <div className="panel" style={{maxWidth:560}}>
                <div className="panel-head">
                  <h2>👥 Ομάδα Barbers</h2>
                  {maxBarbers>1 && <button className="btn sm primary" onClick={saveTeam}>Αποθήκευση</button>}
                </div>
                {maxBarbers===1 ? (
                  <div style={{textAlign:"center",padding:"32px",background:"var(--card2)",borderRadius:14,border:"1px dashed var(--border)"}}>
                    <div style={{fontSize:36,marginBottom:12}}>👤</div>
                    <p style={{fontSize:14,fontWeight:600,marginBottom:6}}>Πλάνο: {barbershop?.plan||"freemium"}</p>
                    <p style={{fontSize:13,color:"var(--muted)",marginBottom:16}}>Αναβάθμισε σε Duo ή Team για να προσθέσεις barbers!</p>
                    <button className="btn primary sm" onClick={()=>setView("plan")}>Αναβάθμισε →</button>
                  </div>
                ) : (<>
                  <p style={{fontSize:13,color:"var(--muted)",marginBottom:16}}>
                    Πλάνο <strong style={{color:"var(--text)"}}>{barbershop?.plan}</strong> · μέγιστο {maxBarbers} barbers
                  </p>
                  {teamMembers.map((b,i)=>(
                    <div key={i} className="team-card">
                      <div className="team-avatar">
                        {b.photo_url ? (
                          <img src={b.photo_url} alt={b.name}/>
                        ) : (
                          <span>{b.name?b.name[0].toUpperCase():"?"}</span>
                        )}
                        <label className="team-avatar-upload">
                          {uploadingBarberPhoto===i ? "⏳" : "📷"}
                          <input type="file" accept="image/*" style={{display:"none"}}
                            onChange={e=>{const f=e.target.files?.[0];if(f)uploadBarberPhoto(f,i)}}/>
                        </label>
                      </div>
                      <div className="team-inputs">
                        <input className="svc-inp" value={b.name} placeholder="Όνομα barber"
                          onChange={e=>{const n=[...teamMembers];n[i].name=e.target.value;setTeamMembers(n)}}/>
                        <input className="svc-inp" value={b.role} placeholder="Ρόλος"
                          onChange={e=>{const n=[...teamMembers];n[i].role=e.target.value;setTeamMembers(n)}}/>
                      </div>
                      <button className="del-btn" onClick={()=>setTeamMembers(p=>p.filter((_,j)=>j!==i))}>✕</button>
                    </div>
                  ))}
                  {teamMembers.length<maxBarbers && (
                    <button className="add-svc-btn" onClick={()=>setTeamMembers(p=>[...p,{name:"",role:"Barber"}])}>
                      + Προσθήκη Barber ({teamMembers.length}/{maxBarbers})
                    </button>
                  )}
                </>)}
              </div>
            )}

            {/* GALLERY */}
            {view==="gallery" && (
              <div className="panel">
                <div className="panel-head">
                  <h2>🖼️ Gallery</h2>
                  <span style={{fontSize:12,color:"var(--muted)"}}>{photos.length}/6</span>
                </div>
                <div className="gallery-grid">
                  {photos.map(ph=>(
                    <div key={ph.id} className="gallery-item">
                      <img src={ph.url} alt=""/>
                      {ph.is_cover && <div className="gallery-cover-badge">⭐ Cover</div>}
                      <div className="gallery-overlay">
                        {!ph.is_cover && <button className="gallery-btn cover" onClick={()=>setCover(ph.id)}>⭐ Cover</button>}
                        <button className="gallery-btn del" onClick={()=>deletePhoto(ph.id)}>🗑️</button>
                      </div>
                    </div>
                  ))}
                  {photos.length<6 && (
                    <label className="gallery-add">
                      {uploadingPhoto ? <span>⏳</span> : (<><span className="plus">+</span><span>Φωτογραφία</span></>)}
                      <input type="file" accept="image/*" style={{display:"none"}}
                        onChange={async e=>{const f=e.target.files?.[0];if(f)await uploadPhoto(f);e.target.value=""}}/>
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* REVIEWS */}
            {view==="reviews" && (
              <div className="panel">
                <div className="panel-head">
                  <h2>⭐ Κριτικές</h2>
                  <span style={{fontSize:12,color:"var(--muted)"}}>{reviews.length} κριτικές</span>
                </div>
                {reviews.length===0 ? (
                  <div className="empty"><span className="empty-icon">⭐</span>Δεν υπάρχουν κριτικές ακόμα</div>
                ) : reviews.map(r=>(
                  <div key={r.id} className="review-card">
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                      <div style={{fontWeight:700}}>{r.customer_name}</div>
                      <div style={{color:"var(--gold)"}}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</div>
                    </div>
                    {r.comment && <div style={{fontSize:13,color:"var(--muted2)",lineHeight:1.6}}>{r.comment}</div>}
                    <div style={{fontSize:11,color:"var(--muted)",marginTop:6}}>{new Date(r.created_at).toLocaleDateString("el-GR")}</div>
                  </div>
                ))}
              </div>
            )}

            {/* PLAN */}
            {view==="plan" && (
              <div style={{maxWidth:520}}>
             {/* BOOKING METER — μόνο για freemium */}
    {(barbershop?.plan==="freemium" || !barbershop?.plan) && (
      <div className="plan-card-d" style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <h3 style={{fontFamily:"Outfit,sans-serif",fontSize:15,margin:0}}>📊 Κρατήσεις Μήνα</h3>
          <span style={{
            fontSize:12,fontWeight:700,
            color: appointments.filter(a => {
              const d = new Date(a.created_at || a.date)
              const now = new Date()
              return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear() && a.status!=="cancelled"
            }).length >= 150 ? "var(--red)" : "var(--muted)"
          }}>
            {appointments.filter(a => {
              const d = new Date(a.created_at || a.date)
              const now = new Date()
              return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear() && a.status!=="cancelled"
            }).length} / 150
          </span>
        </div>

        {(() => {
          const monthlyCount = appointments.filter(a => {
            const d = new Date(a.created_at || a.date)
            const now = new Date()
            return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear() && a.status!=="cancelled"
          }).length
          const pct = Math.min(100, (monthlyCount/150)*100)
          const color = pct >= 100 ? "var(--red)" : pct >= 80 ? "var(--gold)" : "var(--green)"
          return (
            <>
              <div style={{height:10,background:"rgba(255,255,255,.06)",borderRadius:5,overflow:"hidden",marginBottom:8}}>
                <div style={{
                  height:"100%",borderRadius:5,
                  background:color,
                  width:`${pct}%`,
                  transition:"width .4s ease",
                  boxShadow:`0 0 10px ${color}`,
                }}/>
              </div>
              <div style={{fontSize:12,color:"var(--muted)"}}>
                {pct >= 100 ? (
                  <span style={{color:"var(--red)",fontWeight:700}}>⚠️ Έφτασες το όριο! Αναβάθμισε για να δέχεσαι κρατήσεις.</span>
                ) : pct >= 80 ? (
                  <span style={{color:"var(--gold)"}}>⚡ Πλησιάζεις το όριο — {150-monthlyCount} κρατήσεις απομένουν</span>
                ) : (
                  <span>{150-monthlyCount} κρατήσεις απομένουν για τον μήνα</span>
                )}
              </div>
            </>
          )
        })()}

        {appointments.filter(a => {
          const d = new Date(a.created_at || a.date)
          const now = new Date()
          return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear() && a.status!=="cancelled"
        }).length >= 120 && (
          <div style={{
            marginTop:16,padding:"14px 16px",
            background:"rgba(239,68,68,.08)",
            border:"1px solid rgba(239,68,68,.2)",
            borderRadius:12,
          }}>
            <div style={{fontSize:13,fontWeight:700,color:"var(--red)",marginBottom:8}}>
              🚨 Μην χάνεις ραντεβού!
            </div>
            <div style={{fontSize:12,color:"var(--muted2)",marginBottom:12,lineHeight:1.6}}>
              Με το Solo πλάνο έχεις απεριόριστες κρατήσεις για μόλις €20/μήνα.
            </div>
            <button className="btn primary sm" onClick={async()=>{
              const res = await fetch("/api/create-checkout",{
                method:"POST",headers:{"Content-Type":"application/json"},
                body:JSON.stringify({plan:"solo",barbershopId:barbershop.id})
              })
              const {url} = await res.json()
              if (url) window.location.href=url
            }}>
              ⚡ Αναβάθμισε σε Solo — €20/μήνα
            </button>
          </div>
        )}
      </div>
    )}
  {/* Υπόλοιπο plan view... */}
            
                <div className="plan-card-d">
                  <h3 style={{fontFamily:"Outfit,sans-serif",fontSize:16,marginBottom:16}}>💳 Τρέχον Πλάνο</h3>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div>
                      <div style={{fontSize:20,fontWeight:800,fontFamily:"Outfit,sans-serif"}}>{barbershop?.plan?.toUpperCase()}</div>
                      <div style={{fontSize:13,color:"var(--muted)",marginTop:2}}>
                        {barbershop?.plan==="freemium" ? "€0/μήνα" : barbershop?.plan==="solo" ? "€20/μήνα" : barbershop?.plan==="duo" ? "€24/μήνα" : "€28/μήνα"}
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      {daysLeft !== null && (
                        <>
                          <div style={{fontSize:22,fontWeight:900,color:daysLeft<10?"var(--red)":"var(--green)",fontFamily:"Outfit,sans-serif"}}>{daysLeft}</div>
                          <div style={{fontSize:11,color:"var(--muted)"}}>μέρες απομένουν</div>
                        </>
                      )}
                    </div>
                  </div>
                  {daysLeft !== null && (
                    <>
                      <div className="plan-expiry-bar">
                        <div className="plan-expiry-fill" style={{
                          width:`${Math.min(100,((60-daysLeft)/60)*100)}%`,
                          background:daysLeft<10?"var(--red)":"linear-gradient(90deg,var(--blue),var(--green))"
                        }}/>
                      </div>
                      <div style={{fontSize:12,color:"var(--muted)"}}>
                        Λήξη: {planExpiry?.toLocaleDateString("el-GR")}
                      </div>
                    </>
                  )}
                </div>

                {barbershop?.plan==="freemium" ? (
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {[
                      {key:"solo",name:"Solo",price:"€20",desc:"1 barber · Απεριόριστες κρατήσεις"},
                      {key:"duo",name:"Duo",price:"€24",desc:"2 barbers · Απεριόριστες κρατήσεις"},
                      {key:"team",name:"Team",price:"€28",desc:"3-10 barbers · Πλήρης διαχείριση"},
                    ].map(p=>(
                      <div key={p.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:12}}>
                        <div>
                          <div style={{fontWeight:700,fontSize:14}}>{p.name} · {p.price}/μήνα</div>
                          <div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>{p.desc}</div>
                        </div>
                        <button className="btn primary sm" onClick={async()=>{
                          const res = await fetch("/api/create-checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({plan:p.key,barbershopId:barbershop.id})})
                          const {url} = await res.json()
                          if (url) window.location.href=url
                        }}>Αναβάθμιση →</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="plan-card-d">
                    <div style={{fontSize:13,color:"var(--muted)",marginBottom:16}}>Διαχείριση συνδρομής</div>
                    <div style={{display:"flex",gap:10}}>
                      <button className="btn primary" onClick={async()=>{
                        const res = await fetch("/api/create-checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({plan:barbershop.plan,barbershopId:barbershop.id})})
                        const {url} = await res.json()
                        if (url) window.location.href=url
                      }}>🔄 Ανανέωση Πλάνου</button>
                      <button className="btn danger" onClick={async()=>{
                        if (confirm("Είσαι σίγουρος ότι θέλεις να ακυρώσεις το πλάνο;")) {
                          await supabase.from("barbershops").update({plan:"freemium"}).eq("id",barbershop.id)
                          setBarbershop({...barbershop,plan:"freemium"})
                          showToast("Το πλάνο ακυρώθηκε")
                        }
                      }}>Ακύρωση Πλάνου</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS */}
            {view==="settings" && (<>
              <div className="settings-card">
                <h3>👤 Λογαριασμός</h3>
                <div className="settings-row"><span className="settings-label">Email</span><span className="settings-val">{user?.email}</span></div>
                <div className="settings-row"><span className="settings-label">Όνομα</span><span className="settings-val">{user?.user_metadata?.full_name||"—"}</span></div>
                <div className="settings-row"><span className="settings-label">Εγγραφή</span><span className="settings-val">{new Date(user?.created_at).toLocaleDateString("el-GR")}</span></div>
              </div>
              {barbershop && (
                <div className="settings-card">
                  <h3>💈 Κουρείο</h3>
                  <div className="settings-row"><span className="settings-label">Όνομα</span><span className="settings-val">{barbershop.name}</span></div>
                  <div className="settings-row"><span className="settings-label">Πόλη</span><span className="settings-val">{barbershop.city}</span></div>
                  <div className="settings-row"><span className="settings-label">Πλάνο</span><span className="settings-val">{barbershop.plan}</span></div>
                  <div className="settings-row">
                    <span className="settings-label">Link</span>
                    <button className="btn sm" onClick={()=>{
                      navigator.clipboard.writeText(`${window.location.origin}/barbershops/${barbershop.id}`)
                      showToast("Link αντιγράφηκε ✓")
                    }}>📋 Αντιγραφή</button>
                  </div>
                </div>
              )}
              <div className="settings-card">
                <h3>🔐 Ασφάλεια</h3>
                <div className="settings-row">
                  <span className="settings-label">Αποσύνδεση</span>
                  <button className="btn danger sm" onClick={async()=>{await supabase.auth.signOut();window.location.href="/"}}>Αποσύνδεση</button>
                </div>
              </div>
            </>)}

          </div>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        {navItems.map(n=>(
          <button key={n.v} className={`bn-item ${view===n.v?"active":""}`} onClick={()=>setView(n.v)}>
            <span className="ic">{n.icon}</span>{n.label}
          </button>
        ))}
      </nav>

      {/* DETAIL MODAL */}
      {modal==="detail" && selectedAppt && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setModal(null)}}>
          <div className="modal">
            <h3>📋 Στοιχεία Ραντεβού</h3>
            <div style={{marginTop:16}}>
              <div className="detail-row"><span className="detail-label">Πελάτης</span><span className="detail-val">{selectedAppt.customer_name}</span></div>
              {selectedAppt.customer_phone && <div className="detail-row"><span className="detail-label">📱 Τηλέφωνο</span><span className="detail-val"><a href={`tel:${selectedAppt.customer_phone}`} style={{color:"var(--blue)"}}>{selectedAppt.customer_phone}</a></span></div>}
              {selectedAppt.customer_email && <div className="detail-row"><span className="detail-label">📧 Email</span><span className="detail-val" style={{fontSize:12}}>{selectedAppt.customer_email}</span></div>}
              <div className="detail-row"><span className="detail-label">✂️ Υπηρεσία</span><span className="detail-val">{selectedAppt.service}</span></div>
              {selectedAppt.barber_name && <div className="detail-row"><span className="detail-label">👤 Barber</span><span className="detail-val">{selectedAppt.barber_name}</span></div>}
              <div className="detail-row"><span className="detail-label">📅 Ημερομηνία</span><span className="detail-val">{selectedAppt.date}</span></div>
              <div className="detail-row"><span className="detail-label">🕒 Ώρα</span><span className="detail-val">{selectedAppt.time}</span></div>
              <div className="detail-row"><span className="detail-label">Κατάσταση</span>
                <span className={`badge ${selectedAppt.status||"pending"}`}>
                  {selectedAppt.status==="cancelled"?"Ακυρώθηκε":selectedAppt.status==="confirmed"?"✅ Επιβεβαιωμένο":"⏳ Εκκρεμές"}
                </span>
              </div>
            </div>
            <div className="modal-actions" style={{marginTop:16}}>
              <button className="btn" onClick={()=>setModal(null)}>Κλείσιμο</button>
              {selectedAppt.status!=="cancelled" && (<>
                <button className="btn" onClick={()=>{setModal("reschedule")}}>🔄 Αλλαγή</button>
                <button className="btn danger" onClick={()=>{setModal("cancel")}}>✕ Ακύρωση</button>
              </>)}
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {modal==="cancel" && selectedAppt && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setModal(null)}}>
          <div className="modal">
            <h3>❌ Ακύρωση Ραντεβού</h3>
            <p>Είσαι σίγουρος ότι θέλεις να ακυρώσεις το ραντεβού του <strong>{selectedAppt.customer_name}</strong>;</p>
            <div className="modal-actions">
              <button className="btn" onClick={()=>setModal(null)}>Πίσω</button>
              <button className="btn danger" onClick={()=>handleCancel(selectedAppt.id)}>Ακύρωση</button>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {modal==="reschedule" && selectedAppt && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget){setModal(null);setNewDate("");setNewTime("")}}}>
          <div className="modal">
            <h3>🔄 Αλλαγή Ώρας</h3>
            <p>{selectedAppt.customer_name} — {selectedAppt.service}</p>
            <div className="modal-field">
              <label>Νέα Ημερομηνία</label>
              <input type="date" value={newDate} min={today} onChange={e=>{setNewDate(e.target.value);setNewTime("")}}/>
            </div>
            {newDate && (
              <div className="modal-field">
                <label>Νέα Ώρα</label>
                <div className="time-grid">
                  {timeSlots().slice(2,28).map(t=>(
                    <div key={t} className={`time-slot ${newTime===t?"sel":""}`} onClick={()=>setNewTime(t)}>{t}</div>
                  ))}
                </div>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn" onClick={()=>{setModal(null);setNewDate("");setNewTime("")}}>Πίσω</button>
              <button className="btn primary" onClick={handleReschedule}>✅ Αποθήκευση</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW APPOINTMENT MODAL */}
      {modal==="new" && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setModal(null)}}>
          <div className="modal">
            <h3>+ Νέο Ραντεβού</h3>
            <div className="modal-field">
              <label>Ονοματεπώνυμο *</label>
              <input type="text" value={newClient} onChange={e=>setNewClient(e.target.value)} placeholder="π.χ. Γιώργος Παπαδόπουλος"/>
            </div>
            <div className="modal-field">
              <label>Τηλέφωνο</label>
              <input type="tel" value={newPhone} onChange={e=>setNewPhone(e.target.value)} placeholder="69XXXXXXXX"/>
            </div>
            <div className="modal-field">
              <label>Email</label>
              <input type="email" value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="email@example.com"/>
            </div>
            <div className="modal-field">
              <label>Υπηρεσία</label>
              <select value={newService} onChange={e=>setNewService(e.target.value)}>
                {editServices.map(s=><option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            {teamMembers.length>0 && (
              <div className="modal-field">
                <label>Barber</label>
                <select value={newBarber} onChange={e=>setNewBarber(e.target.value)}>
                  <option value="">Οποιονδήποτε</option>
                  {teamMembers.map(b=><option key={b.name} value={b.name}>{b.name}</option>)}
                </select>
              </div>
            )}
            <div className="modal-field">
              <label>Ημερομηνία *</label>
              <input type="date" value={newDate} min={today} onChange={e=>setNewDate(e.target.value)}/>
            </div>
            {newDate && (
              <div className="modal-field">
                <label>Ώρα *</label>
                <div className="time-grid">
                  {timeSlots().slice(2,28).map(t=>(
                    <div key={t} className={`time-slot ${newTime===t?"sel":""}`} onClick={()=>setNewTime(t)}>{t}</div>
                  ))}
                </div>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn" onClick={()=>{setModal(null);setNewClient("");setNewPhone("");setNewEmail("");setNewDate("");setNewTime("")}}>Πίσω</button>
              <button className="btn primary" onClick={handleNewAppt}>Αποθήκευση</button>
            </div>
          </div>
        </div>
      )}

      {/* BLOCK MODAL */}
      {modal==="block" && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setModal(null)}}>
          <div className="modal">
            <h3>🚫 Αποκλεισμός Ώρας</h3>
            <div className="modal-field">
              <label>Ημερομηνία</label>
              <input type="date" value={newDate} min={today} onChange={e=>setNewDate(e.target.value)}/>
            </div>
            {newDate && (
              <div className="modal-field">
                <label>Ώρα</label>
                <div className="time-grid">
                  {timeSlots().slice(2,28).map(t=>(
                    <div key={t} className={`time-slot ${newTime===t?"sel":""}`} onClick={()=>setNewTime(t)}>{t}</div>
                  ))}
                </div>
              </div>
            )}
            <div className="modal-field">
              <label>Αιτία (προαιρετικό)</label>
              <input type="text" value={blockReason} onChange={e=>setBlockReason(e.target.value)} placeholder="π.χ. Διάλειμμα, Άδεια"/>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={()=>{setModal(null);setNewDate("");setNewTime("");setBlockReason("")}}>Πίσω</button>
              <button className="btn primary" onClick={handleBlock}>🚫 Αποκλεισμός</button>
            </div>
          </div>
        </div>
      )}

      <div className={`toast ${toast?"show":""}`}>{toast}</div>
    </>
  )
}

function ApptCard({appt,onClick,onCancel,onReschedule}:any) {
  const date = new Date(appt.date)
  const day = date.getDate()
  const month = date.toLocaleDateString("el-GR",{month:"short"})
  return (
    <div className={`appt-card ${appt.status==="cancelled"?"cancelled":""}`} onClick={onClick}>
      <div className="appt-time-box">
        <div className="appt-time">{appt.time}</div>
        <div className="appt-date">{day} {month}</div>
      </div>
      <div className="appt-info">
        <div className="appt-name">{appt.customer_name}</div>
        <div className="appt-svc">{appt.service}{appt.barber_name?` · ${appt.barber_name}`:""}</div>
        {appt.customer_phone && <div className="appt-contact">📱 {appt.customer_phone}</div>}
      </div>
      <span className={`badge ${appt.status||"pending"}`}>
        {appt.status==="cancelled"?"Ακυρώθηκε":appt.status==="confirmed"?"✅ Επιβ.":"⏳ Εκκρ."}
      </span>
      {appt.status!=="cancelled" && (
        <div className="appt-btns" onClick={e=>e.stopPropagation()}>
          <button className="appt-btn" onClick={onReschedule}>🔄</button>
          <button className="appt-btn danger" onClick={onCancel}>✕</button>
        </div>
      )}
    </div>
  )
}