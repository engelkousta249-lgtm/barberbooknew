"use client"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://xcfkhdjiragblsiqetes.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZmtoZGppcmFnYmxzaXFldGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTY0ODYsImV4cCI6MjA5NzI3MjQ4Nn0.EkmgRuYzrvF0A_pgT9vaOouMRKeQ2kasPZxpoIuCgeE"
)

const dayNames = ["Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο","Κυριακή"]

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
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState("overview")
  const [appointments, setAppointments] = useState<any[]>([])
  const [toast, setToast] = useState("")
  const [modal, setModal] = useState<null|"new"|"block"|"cancel"|"reschedule">(null)
  const [selectedAppt, setSelectedAppt] = useState<any>(null)
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")
  const [newClient, setNewClient] = useState("")
  const [newService, setNewService] = useState("Κούρεμα")
  const [blockReason, setBlockReason] = useState("")
  const [barbershop, setBarbershop] = useState<any>(null)

  const today = new Date().toISOString().split("T")[0]
  const todayName = dayNames[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]

  const services = ["Κούρεμα","Κούρεμα + Γένια","Ξύρισμα + Styling","Full Service","Fade","Παιδικό Κούρεμα"]

  const [hours, setHours] = useState([
    {short:"Δευ", active:true, open:"09:00", close:"19:00"},
    {short:"Τρί", active:true, open:"09:00", close:"19:00"},
    {short:"Τετ", active:true, open:"09:00", close:"19:00"},
    {short:"Πέμ", active:true, open:"09:00", close:"21:00"},
    {short:"Παρ", active:true, open:"09:00", close:"21:00"},
    {short:"Σάβ", active:true, open:"10:00", close:"16:00"},
    {short:"Κυρ", active:false, open:"", close:""},
  ])

  const [editServices, setEditServices] = useState([
    {name:"Κούρεμα", duration:30, price:15},
    {name:"Κούρεμα + Γένια", duration:45, price:22},
    {name:"Ξύρισμα + Styling", duration:40, price:18},
    {name:"Full Service", duration:60, price:30},
  ])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 2000)
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = "/"; return }
      setUser(user)

      const { data: profile } = await supabase
        .from("profiles").select("*").eq("id", user.id).single()

      if (profile?.barbershop_id) {
        const { data: shop } = await supabase
          .from("barbershops").select("*").eq("id", profile.barbershop_id).single()
        setBarbershop(shop)
        const { data: appts } = await supabase
          .from("appointments").select("*")
          .eq("barbershop_id", profile.barbershop_id)
          .order("date", { ascending: true })
        setAppointments(appts || [])
      } else {
        const { data: appts } = await supabase
          .from("appointments").select("*")
          .order("date", { ascending: false }).limit(50)
        setAppointments(appts || [])
      }
      setLoading(false)
    }
    init()
  }, [])

  async function handleCancel(id: string) {
    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id)
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "cancelled" } : a))
    setModal(null)
    showToast("Το ραντεβού ακυρώθηκε")
  }

  async function handleReschedule() {
    if (!newDate || !newTime) { showToast("Επέλεξε ημερομηνία και ώρα!"); return }
    await supabase.from("appointments")
      .update({ date: newDate, time: newTime, status: "pending" })
      .eq("id", selectedAppt.id)
    setAppointments(prev => prev.map(a =>
      a.id === selectedAppt.id ? { ...a, date: newDate, time: newTime, status: "pending" } : a
    ))
    setModal(null); setNewDate(""); setNewTime("")
    showToast("Το ραντεβού αλλάχτηκε")
  }

  const todayAppts = appointments.filter(a => a.date === today && a.status !== "cancelled")
  const upcomingAppts = appointments.filter(a => a.date > today && a.status !== "cancelled")
  const totalRevenue = appointments.filter(a => a.status !== "cancelled").length * 15
  const cancelledCount = appointments.filter(a => a.status === "cancelled").length

  const weekAppts = dayNames.map((_, i) => {
    const d = new Date()
    const day = d.getDay() === 0 ? 6 : d.getDay() - 1
    const diff = i - day
    const date = new Date(d)
    date.setDate(d.getDate() + diff)
    return {
      name: dayNames[i],
      date: date.toISOString().split("T")[0],
      isToday: date.toISOString().split("T")[0] === today,
      appts: appointments.filter(a =>
        a.date === date.toISOString().split("T")[0] && a.status !== "cancelled"
      )
    }
  })

  if (loading) return (
    <div style={{background:"#070c16",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Inter,sans-serif",color:"#8a97ac",fontSize:16}}>
      ⏳ Φορτώνει...
    </div>
  )

  const initials = (user?.user_metadata?.full_name || user?.email || "?")
    .split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        :root{--navy-900:#070c16;--navy-800:#0b1424;--navy-700:#101c33;--navy-600:#16233f;--blue:#3b7bff;--blue-soft:rgba(59,123,255,.14);--gold:#d4af37;--gold-soft:rgba(212,175,55,.14);--text:#eaeef6;--muted:#8a97ac;--line:rgba(255,255,255,.08);--green:#3ecf8e;--red:#ff5c72;}
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Inter',sans-serif;background:radial-gradient(1100px 500px at 85% -10%,rgba(59,123,255,.12),transparent 60%),radial-gradient(900px 500px at -10% 110%,rgba(212,175,55,.08),transparent 60%),var(--navy-900);color:var(--text);min-height:100vh;}
        h1,h2,h3,.brand{font-family:'Outfit',sans-serif;}
        button,input,select{font-family:inherit;}
        .layout{display:flex;min-height:100vh;}
        .sidebar{width:225px;flex-shrink:0;background:var(--navy-800);border-right:1px solid var(--line);display:flex;flex-direction:column;padding:22px 14px;position:sticky;top:0;height:100vh;}
        .brand{display:flex;align-items:center;gap:9px;font-weight:800;font-size:17px;padding:4px 8px 26px;}
        .brand .mark{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,var(--blue),var(--gold));display:flex;align-items:center;justify-content:center;font-size:15px;}
        .nav-group{margin-bottom:22px;}
        .nav-label{font-size:10.5px;letter-spacing:1.2px;text-transform:uppercase;color:var(--muted);padding:0 10px 8px;font-weight:600;}
        .nav-item{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:10px;color:var(--muted);font-size:14px;font-weight:500;cursor:pointer;transition:.15s;margin-bottom:2px;border:1px solid transparent;background:none;width:100%;text-align:left;color:var(--muted);}
        .nav-item:hover{background:var(--navy-700);color:var(--text);}
        .nav-item.active{background:var(--blue-soft);color:#cfe0ff;border-color:rgba(59,123,255,.3);}
        .nav-item .ic{width:18px;text-align:center;font-size:15px;}
        .sidebar-foot{margin-top:auto;padding:12px;border-radius:12px;background:var(--navy-700);border:1px solid var(--line);display:flex;align-items:center;gap:10px;}
        .avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--gold),#a97e15);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:var(--navy-900);flex-shrink:0;}
        .sidebar-foot .who{font-size:13px;font-weight:600;}
        .sidebar-foot .role{font-size:11.5px;color:var(--muted);}
        .main{flex:1;padding:26px 34px 60px;max-width:1200px;min-width:0;}
        .topbar{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;flex-wrap:wrap;gap:14px;}
        .topbar h1{font-size:22px;font-weight:700;}
        .topbar .sub{color:var(--muted);font-size:13.5px;margin-top:4px;}
        .chair-status{display:flex;align-items:center;gap:9px;background:var(--navy-800);border:1px solid var(--line);padding:9px 16px;border-radius:999px;font-size:13px;font-weight:600;white-space:nowrap;cursor:pointer;}
        .dot{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 0 4px rgba(62,207,142,.18);}
        .dot.busy{background:var(--red);box-shadow:0 0 0 4px rgba(255,92,114,.18);}
        .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;}
        .stat-card{background:var(--navy-800);border:1px solid var(--line);border-radius:14px;padding:16px;}
        .stat-card .label{font-size:12px;color:var(--muted);font-weight:600;margin-bottom:8px;}
        .stat-card .value{font-size:22px;font-weight:800;font-family:'Outfit',sans-serif;}
        .stat-card .delta{font-size:11.5px;margin-top:6px;font-weight:600;}
        .delta.up{color:var(--green);}
        .delta.flat{color:var(--muted);}
        .grid{display:grid;grid-template-columns:1.5fr 1fr;gap:18px;}
        .panel{background:var(--navy-800);border:1px solid var(--line);border-radius:16px;padding:18px 20px;}
        .panel-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:10px;flex-wrap:wrap;}
        .panel-head h2{font-size:15.5px;font-weight:700;}
        .link-btn{font-size:12.5px;color:var(--blue);cursor:pointer;font-weight:600;background:none;border:none;}
        .timeline{display:flex;flex-direction:column;}
        .appt{display:grid;grid-template-columns:52px 1fr auto;gap:12px;align-items:center;padding:11px 10px;border-radius:10px;border-left:2px solid var(--line);position:relative;margin-left:4px;}
        .appt::before{content:"";position:absolute;left:-6px;top:20px;width:10px;height:10px;border-radius:50%;background:var(--navy-600);border:2px solid var(--blue);}
        .appt.now::before{background:var(--blue);}
        .appt:hover{background:var(--navy-700);}
        .appt .atime{font-size:12.5px;font-weight:700;color:var(--muted);}
        .appt.now .atime{color:var(--blue);}
        .appt .client{font-size:13.5px;font-weight:600;}
        .appt .service{font-size:12px;color:var(--muted);margin-top:2px;}
        .badge{font-size:10.5px;font-weight:700;padding:4px 9px;border-radius:999px;white-space:nowrap;}
        .badge.confirmed{background:rgba(62,207,142,.14);color:var(--green);}
        .badge.pending{background:var(--gold-soft);color:var(--gold);}
        .badge.done{background:rgba(255,255,255,.06);color:var(--muted);}
        .badge.cancelled{background:rgba(255,92,114,.12);color:var(--red);}
        .appt-actions-row{display:flex;gap:6px;margin-top:4px;}
        .quick-actions{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;}
        .btn{padding:10px 16px;border-radius:10px;font-size:13px;font-weight:700;border:1px solid var(--line);background:var(--navy-700);color:var(--text);cursor:pointer;transition:.15s;}
        .btn:hover{border-color:var(--blue);}
        .btn.primary{background:linear-gradient(135deg,var(--blue),#2a5fd9);border:none;color:#fff;}
        .btn.primary:hover{filter:brightness(1.08);}
        .btn.danger{background:rgba(255,92,114,.1);border-color:rgba(255,92,114,.3);color:var(--red);}
        .btn.sm{padding:6px 12px;font-size:12px;}
        .week-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:10px;}
        .day-col{background:var(--navy-700);border:1px solid var(--line);border-radius:12px;padding:10px;min-width:0;}
        .day-col.today{border-color:var(--blue);}
        .day-col-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;}
        .day-col-head .dname{font-size:12.5px;font-weight:700;}
        .day-col-head .dcount{font-size:10.5px;color:var(--muted);}
        .mini-appt{background:var(--navy-800);border-radius:8px;padding:7px 8px;margin-bottom:6px;font-size:11.5px;}
        .mini-appt .mtime{font-weight:700;color:var(--blue);font-size:11px;}
        .mini-appt .mclient{font-weight:600;margin-top:1px;}
        .mini-appt .mservice{color:var(--muted);font-size:10.5px;margin-top:1px;}
        .day-empty{color:var(--muted);font-size:11px;text-align:center;padding:14px 0;}
        .service-row{display:grid;grid-template-columns:1fr 90px 90px 32px;gap:8px;align-items:center;padding:9px 4px;border-bottom:1px solid var(--line);}
        .service-row:last-child{border-bottom:none;}
        .field{background:var(--navy-700);border:1px solid var(--line);border-radius:8px;padding:8px 9px;font-size:12.5px;color:var(--text);width:100%;min-width:0;}
        .field:focus{outline:none;border-color:var(--blue);}
        .field.price{color:var(--gold);font-weight:700;}
        .row-labels{display:grid;grid-template-columns:1fr 90px 90px 32px;gap:8px;font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;padding:0 4px 8px;font-weight:600;}
        .icon-btn{width:30px;height:30px;border-radius:8px;border:1px solid var(--line);background:var(--navy-700);color:var(--red);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;}
        .icon-btn:hover{border-color:var(--red);background:rgba(255,92,114,.08);}
        .hours-grid{display:flex;flex-direction:column;gap:8px;}
        .hour-row{display:flex;align-items:center;gap:10px;font-size:13px;padding:10px;border-radius:10px;background:var(--navy-700);flex-wrap:wrap;}
        .hour-row.off{opacity:.55;}
        .hour-row .day{font-weight:700;width:42px;flex-shrink:0;}
        .time-field{background:var(--navy-800);border:1px solid var(--line);border-radius:8px;padding:7px 8px;font-size:12.5px;color:var(--text);}
        .time-field:focus{outline:none;border-color:var(--blue);}
        .hour-sep{color:var(--muted);font-size:12px;}
        .closed-label{color:var(--muted);font-size:12px;margin-right:auto;}
        .toggle-btn{width:36px;height:20px;border-radius:999px;background:var(--navy-600);position:relative;cursor:pointer;border:1px solid var(--line);flex-shrink:0;margin-left:auto;}
        .toggle-btn::after{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--muted);transition:.15s;}
        .toggle-btn.on{background:rgba(59,123,255,.35);border-color:var(--blue);}
        .toggle-btn.on::after{left:18px;background:var(--blue);}
        .portfolio-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;}
        .pf-tile{position:relative;aspect-ratio:1;border-radius:14px;overflow:hidden;border:1px solid var(--line);background:var(--navy-700);}
        .pf-tile img{width:100%;height:100%;object-fit:cover;display:block;}
        .pf-cover-badge{position:absolute;top:8px;left:8px;background:var(--gold);color:var(--navy-900);font-size:9.5px;font-weight:800;padding:4px 8px;border-radius:999px;}
        .pf-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.6),transparent 55%);display:flex;align-items:flex-end;justify-content:flex-end;gap:6px;padding:8px;opacity:0;transition:.15s;}
        .pf-tile:hover .pf-overlay{opacity:1;}
        .pf-btn{width:28px;height:28px;border-radius:50%;border:none;background:rgba(255,255,255,.92);color:var(--navy-900);font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
        .pf-btn.danger{background:var(--red);color:#fff;}
        .pf-add{aspect-ratio:1;border:1.5px dashed var(--line);border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:var(--muted);cursor:pointer;font-size:12px;font-weight:600;text-align:center;}
        .pf-add:hover{border-color:var(--blue);color:var(--blue);}
        .pf-add .plus{font-size:24px;font-weight:400;line-height:1;}
        .settings-card{background:var(--navy-800);border:1px solid var(--line);border-radius:16px;padding:20px;margin-bottom:14px;}
        .settings-card h3{font-size:15px;font-weight:700;margin-bottom:14px;}
        .settings-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--line);}
        .settings-row:last-child{border-bottom:none;}
        .settings-label{font-size:13px;color:var(--muted);}
        .settings-value{font-size:13px;font-weight:600;}
        .bottom-nav{display:none;}
        .toast-bar{position:fixed;bottom:20px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--navy-700);border:1px solid var(--blue);color:var(--text);padding:10px 20px;border-radius:10px;font-size:13px;font-weight:600;opacity:0;transition:.25s;pointer-events:none;z-index:99;white-space:nowrap;}
        .toast-bar.show{opacity:1;transform:translateX(-50%) translateY(0);}
        .modal-overlay{position:fixed;inset:0;z-index:60;background:rgba(3,6,12,.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:16px;}
        .modal-box{background:var(--navy-800);border:1px solid var(--line);border-radius:16px;padding:24px;width:100%;max-width:400px;box-shadow:0 20px 60px rgba(0,0,0,.4);}
        .modal-box h3{font-size:16px;font-weight:700;margin-bottom:16px;}
        .modal-field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px;}
        .modal-field label{font-size:11.5px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.3px;}
        .modal-field input,.modal-field select{background:var(--navy-700);border:1px solid var(--line);border-radius:9px;padding:10px 11px;font-size:13.5px;color:var(--text);}
        .modal-field input:focus,.modal-field select:focus{outline:none;border-color:var(--blue);}
        .modal-actions{display:flex;gap:10px;margin-top:18px;}
        .modal-actions .btn{flex:1;text-align:center;}
        .time-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px;}
        .time-slot{padding:8px 4px;background:rgba(59,123,255,.06);border:1px solid rgba(59,123,255,.15);border-radius:8px;text-align:center;font-size:12px;cursor:pointer;transition:.15s;color:var(--muted);}
        .time-slot:hover,.time-slot.sel{background:rgba(59,123,255,.2);border-color:var(--blue);color:var(--blue);}
        @media(max-width:980px){
          .sidebar{display:none;}
          .main{padding:16px 14px 84px;}
          .stats{grid-template-columns:repeat(2,1fr);}
          .grid{grid-template-columns:1fr;}
          .week-grid{grid-template-columns:repeat(2,1fr);}
          .bottom-nav{display:flex;position:fixed;bottom:0;left:0;right:0;z-index:30;background:var(--navy-800);border-top:1px solid var(--line);padding:8px 6px;justify-content:space-around;}
          .bn-item{display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;color:var(--muted);font-size:9.5px;font-weight:600;padding:5px 4px;border-radius:10px;cursor:pointer;}
          .bn-item .ic{font-size:18px;}
          .bn-item.active{color:var(--blue);}
        }
        @media(max-width:560px){
          .stats{grid-template-columns:repeat(2,1fr);}
          .week-grid{grid-template-columns:1fr;}
        }
      `}</style>

      <div className="layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="brand"><div className="mark">✂️</div>BarberBook</div>
          <div className="nav-group">
            <div className="nav-label">Πίνακας</div>
            {[
              {v:"overview", ic:"📊", label:"Επισκόπηση"},
              {v:"week", ic:"📅", label:"Εβδομάδα"},
            ].map(n => (
              <button key={n.v} className={`nav-item ${view===n.v?"active":""}`} onClick={() => setView(n.v)}>
                <span className="ic">{n.ic}</span>{n.label}
              </button>
            ))}
          </div>
          <div className="nav-group">
            <div className="nav-label">Κατάστημα</div>
            {[
              {v:"services", ic:"💈", label:"Υπηρεσίες"},
              {v:"hours", ic:"🕒", label:"Ωράριο"},
              {v:"portfolio", ic:"🖼️", label:"Πορτφόλιο"},
              {v:"settings", ic:"⚙️", label:"Ρυθμίσεις"},
            ].map(n => (
              <button key={n.v} className={`nav-item ${view===n.v?"active":""}`} onClick={() => setView(n.v)}>
                <span className="ic">{n.ic}</span>{n.label}
              </button>
            ))}
          </div>
          <div className="sidebar-foot">
            <div className="avatar">{initials}</div>
            <div>
              <div className="who">{user?.user_metadata?.full_name || "Barber"}</div>
              <div className="role">{barbershop?.name || "BarberBook"}</div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">

          {/* OVERVIEW */}
          {view === "overview" && (
            <>
              <div className="topbar">
                <div>
                  <h1>Καλησπέρα, {user?.user_metadata?.full_name?.split(" ")[0] || "Barber"} 👋</h1>
                  <div className="sub">{todayName} — έχεις {todayAppts.length} ραντεβού σήμερα</div>
                </div>
                <div className="chair-status">
                  <span className="dot busy"/>Καρέκλα απασχολημένη
                </div>
              </div>
              <div className="stats">
                <div className="stat-card"><div className="label">Ραντεβού Σήμερα</div><div className="value">{todayAppts.length}</div><div className="delta up">↑ ενεργά</div></div>
                <div className="stat-card"><div className="label">Επερχόμενα</div><div className="value">{upcomingAppts.length}</div><div className="delta flat">προσεχή</div></div>
                <div className="stat-card"><div className="label">Εκτιμ. Έσοδα</div><div className="value">€{totalRevenue}</div><div className="delta up">↑ συνολικά</div></div>
                <div className="stat-card"><div className="label">Ακυρώσεις</div><div className="value">{cancelledCount}</div><div className="delta flat">σύνολο</div></div>
              </div>
              <div className="grid">
                <div className="panel">
                  <div className="panel-head">
                    <h2>Πρόγραμμα Σήμερα</h2>
                    <button className="link-btn" onClick={() => setView("week")}>Προβολή Εβδομάδας →</button>
                  </div>
                  <div className="timeline">
                    {todayAppts.length === 0 ? (
                      <div style={{color:"var(--muted)",fontSize:13,textAlign:"center",padding:"2rem"}}>😴 Κανένα ραντεβού σήμερα</div>
                    ) : todayAppts.map((a,i) => (
                      <div key={a.id} className={`appt ${i===0?"now":""}`}>
                        <div className="atime">{a.time}</div>
                        <div>
                          <div className="client">{a.customer_name}</div>
                          <div className="service">{a.service}</div>
                          <div className="appt-actions-row">
                            <button className="btn sm" onClick={() => { setSelectedAppt(a); setModal("reschedule") }}>🔄 Αλλαγή</button>
                            <button className="btn sm danger" onClick={() => { setSelectedAppt(a); setModal("cancel") }}>❌ Ακύρωση</button>
                          </div>
                        </div>
                        <span className={`badge ${a.status==="confirmed"?"confirmed":i===0?"confirmed":"pending"}`}>
                          {a.status==="confirmed"?"✅ Επιβ.":"⏳ Εκκρ."}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="quick-actions">
                    <button className="btn primary" onClick={() => setModal("new")}>+ Νέο Ραντεβού</button>
                    <button className="btn" onClick={() => setModal("block")}>Αποκλεισμός Ώρας</button>
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-head">
                    <h2>Σημερινό Ωράριο</h2>
                    <button className="link-btn" onClick={() => setView("hours")}>Επεξεργασία</button>
                  </div>
                  {hours.map(h => (
                    <div key={h.short} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 4px",opacity:h.active?1:0.5}}>
                      <span style={{fontWeight:700,width:42,fontSize:13}}>{h.short}</span>
                      <span style={{color:"var(--muted)",fontSize:12.5}}>{h.active ? `${h.open} – ${h.close}` : "Κλειστά"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* WEEK */}
          {view === "week" && (
            <>
              <div className="topbar">
                <div><h1>Εβδομάδα</h1><div className="sub">Όλα τα ραντεβού της εβδομάδας</div></div>
              </div>
              <div className="panel">
                <div className="week-grid">
                  {weekAppts.map(day => (
                    <div key={day.name} className={`day-col ${day.isToday?"today":""}`}>
                      <div className="day-col-head">
                        <span className="dname">{day.name.slice(0,3)}</span>
                        <span className="dcount">{day.appts.length}</span>
                      </div>
                      {day.appts.length === 0 ? (
                        <div className="day-empty">Χωρίς ραντεβού</div>
                      ) : day.appts.map(a => (
                        <div key={a.id} className="mini-appt">
                          <div className="mtime">{a.time}</div>
                          <div className="mclient">{a.customer_name}</div>
                          <div className="mservice">{a.service}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* SERVICES */}
          {view === "services" && (
            <>
              <div className="topbar"><div><h1>Υπηρεσίες</h1><div className="sub">Πρόσθεσε, επεξεργάσου ή διάγραψε υπηρεσίες</div></div></div>
              <div className="panel" style={{maxWidth:640}}>
                <div className="row-labels"><span>Υπηρεσία</span><span>Λεπτά</span><span>Τιμή €</span><span/></div>
                {editServices.map((s, i) => (
                  <div key={i} className="service-row">
                    <input className="field" value={s.name} onChange={e => { const n=[...editServices]; n[i].name=e.target.value; setEditServices(n) }}/>
                    <input className="field" type="number" value={s.duration} onChange={e => { const n=[...editServices]; n[i].duration=+e.target.value; setEditServices(n) }}/>
                    <input className="field price" type="number" value={s.price} onChange={e => { const n=[...editServices]; n[i].price=+e.target.value; setEditServices(n) }}/>
                    <button className="icon-btn" onClick={() => { setEditServices(prev => prev.filter((_,j)=>j!==i)); showToast("Η υπηρεσία διαγράφηκε") }}>✕</button>
                  </div>
                ))}
                <div className="quick-actions">
                  <button className="btn primary" onClick={() => { setEditServices(prev => [...prev, {name:"Νέα Υπηρεσία",duration:30,price:15}]); showToast("Προστέθηκε νέα υπηρεσία") }}>+ Νέα Υπηρεσία</button>
                  <button className="btn" onClick={() => showToast("Οι υπηρεσίες αποθηκεύτηκαν ✓")}>Αποθήκευση</button>
                </div>
              </div>
            </>
          )}

          {/* HOURS */}
          {view === "hours" && (
            <>
              <div className="topbar"><div><h1>Ωράριο</h1><div className="sub">Όρισε τις ώρες λειτουργίας για κάθε ημέρα</div></div></div>
              <div className="panel" style={{maxWidth:520}}>
                <div className="hours-grid">
                  {hours.map((h, i) => (
                    <div key={h.short} className={`hour-row ${h.active?"":"off"}`}>
                      <span className="day">{h.short}</span>
                      {h.active ? (
                        <>
                          <input type="time" className="time-field" value={h.open} onChange={e => { const n=[...hours]; n[i].open=e.target.value; setHours(n); showToast("Ωράριο ενημερώθηκε") }}/>
                          <span className="hour-sep">–</span>
                          <input type="time" className="time-field" value={h.close} onChange={e => { const n=[...hours]; n[i].close=e.target.value; setHours(n); showToast("Ωράριο ενημερώθηκε") }}/>
                        </>
                      ) : (
                        <span className="closed-label">Κλειστά</span>
                      )}
                      <div className={`toggle-btn ${h.active?"on":""}`} onClick={() => {
                        const n=[...hours]
                        n[i].active=!n[i].active
                        if(n[i].active && !n[i].open){ n[i].open="09:00"; n[i].close="19:00" }
                        setHours(n)
                        showToast(n[i].active?"Ημέρα ενεργοποιήθηκε":"Ημέρα σημειώθηκε ως κλειστή")
                      }}/>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* PORTFOLIO */}
          {view === "portfolio" && (
            <>
              <div className="topbar"><div><h1>Πορτφόλιο</h1><div className="sub">Ανέβασε φωτογραφίες δουλειών σου</div></div></div>
              <div className="panel">
                <p style={{color:"var(--muted)",fontSize:13,marginBottom:14}}>Δεν έχεις ανεβάσει ακόμα φωτογραφίες. Η λειτουργία Photo Upload έρχεται σύντομα!</p>
                <div className="portfolio-grid">
                  <div className="pf-add" onClick={() => showToast("Photo upload σύντομα!")}>
                    <span className="plus">+</span><span>Προσθήκη</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* SETTINGS */}
          {view === "settings" && (
            <>
              <div className="topbar"><div><h1>Ρυθμίσεις</h1><div className="sub">Διαχείριση λογαριασμού και καταστήματος</div></div></div>
              <div className="settings-card">
                <h3>👤 Στοιχεία Λογαριασμού</h3>
                <div className="settings-row"><span className="settings-label">Email</span><span className="settings-value">{user?.email}</span></div>
                <div className="settings-row"><span className="settings-label">Όνομα</span><span className="settings-value">{user?.user_metadata?.full_name || "—"}</span></div>
                <div className="settings-row"><span className="settings-label">Εγγραφή</span><span className="settings-value">{new Date(user?.created_at).toLocaleDateString("el-GR")}</span></div>
              </div>
              {barbershop && (
                <div className="settings-card">
                  <h3>💈 Στοιχεία Κουρείου</h3>
                  <div className="settings-row"><span className="settings-label">Όνομα</span><span className="settings-value">{barbershop.name}</span></div>
                  <div className="settings-row"><span className="settings-label">Πόλη</span><span className="settings-value">{barbershop.city}</span></div>
                  <div className="settings-row"><span className="settings-label">Βαθμολογία</span><span className="settings-value">⭐ {barbershop.rating}</span></div>
                </div>
              )}
              <div className="settings-card">
                <h3>🔐 Ασφάλεια</h3>
                <div className="settings-row">
                  <span className="settings-label">Αποσύνδεση</span>
                  <button className="btn danger sm" onClick={async () => { await supabase.auth.signOut(); window.location.href="/" }}>Αποσύνδεση</button>
                </div>
              </div>
            </>
          )}

        </main>
      </div>

      {/* BOTTOM NAV (mobile) */}
      <nav className="bottom-nav">
        {[
          {v:"overview",ic:"📊",label:"Αρχική"},
          {v:"week",ic:"📅",label:"Εβδομάδα"},
          {v:"services",ic:"💈",label:"Υπηρεσίες"},
          {v:"hours",ic:"🕒",label:"Ωράριο"},
          {v:"settings",ic:"⚙️",label:"Ρυθμίσεις"},
        ].map(n => (
          <button key={n.v} className={`bn-item ${view===n.v?"active":""}`} onClick={() => setView(n.v)}>
            <span className="ic">{n.ic}</span>{n.label}
          </button>
        ))}
      </nav>

      {/* TOAST */}
      <div className={`toast-bar ${toast?"show":""}`}>{toast}</div>

      {/* CANCEL MODAL */}
      {modal === "cancel" && selectedAppt && (
        <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) setModal(null) }}>
          <div className="modal-box">
            <h3>❌ Ακύρωση Ραντεβού</h3>
            <p style={{fontSize:14,color:"var(--muted)",marginBottom:16}}>
              Είσαι σίγουρος ότι θέλεις να ακυρώσεις το ραντεβού του <strong style={{color:"var(--text)"}}>{selectedAppt.customer_name}</strong> στις {selectedAppt.date} {selectedAppt.time};
            </p>
            <div className="modal-actions">
              <button className="btn" onClick={() => setModal(null)}>Πίσω</button>
              <button className="btn primary danger" onClick={() => handleCancel(selectedAppt.id)}>Ακύρωση</button>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {modal === "reschedule" && selectedAppt && (
        <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget){ setModal(null); setNewDate(""); setNewTime("") } }}>
          <div className="modal-box">
            <h3>🔄 Αλλαγή Ώρας</h3>
            <p style={{fontSize:13,color:"var(--muted)",marginBottom:16}}>
              Ραντεβού: <strong style={{color:"var(--text)"}}>{selectedAppt.customer_name}</strong> — {selectedAppt.service}
            </p>
            <div className="modal-field">
              <label>Νέα Ημερομηνία</label>
              <input type="date" value={newDate} min={today} onChange={e => { setNewDate(e.target.value); setNewTime("") }}/>
            </div>
            {newDate && (
              <div className="modal-field">
                <label>Νέα Ώρα</label>
                <div className="time-grid">
                  {timeSlots().filter((_,i) => i % 2 === 0).slice(2, 22).map(t => (
                    <div key={t} className={`time-slot ${newTime===t?"sel":""}`} onClick={() => setNewTime(t)}>{t}</div>
                  ))}
                </div>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn" onClick={() => { setModal(null); setNewDate(""); setNewTime("") }}>Πίσω</button>
              <button className="btn primary" onClick={handleReschedule}>✅ Αποθήκευση</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW APPOINTMENT MODAL */}
      {modal === "new" && (
        <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) setModal(null) }}>
          <div className="modal-box">
            <h3>+ Νέο Ραντεβού</h3>
            <div className="modal-field">
              <label>Πελάτης</label>
              <input type="text" value={newClient} onChange={e => setNewClient(e.target.value)} placeholder="π.χ. Γιάννης Παπαδόπουλος"/>
            </div>
            <div className="modal-field">
              <label>Ημερομηνία</label>
              <input type="date" value={newDate} min={today} onChange={e => setNewDate(e.target.value)}/>
            </div>
            <div className="modal-field">
              <label>Ώρα</label>
              <div className="time-grid">
                {timeSlots().filter((_,i) => i % 2 === 0).slice(2, 22).map(t => (
                  <div key={t} className={`time-slot ${newTime===t?"sel":""}`} onClick={() => setNewTime(t)}>{t}</div>
                ))}
              </div>
            </div>
            <div className="modal-field">
              <label>Υπηρεσία</label>
              <select value={newService} onChange={e => setNewService(e.target.value)}>
                {services.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => { setModal(null); setNewClient(""); setNewDate(""); setNewTime("") }}>Πίσω</button>
              <button className="btn primary" onClick={async () => {
                if (!newClient || !newDate || !newTime) { showToast("Συμπλήρωσε όλα τα πεδία!"); return }
                const { data } = await supabase.from("appointments").insert({
                  customer_name: newClient,
                  customer_email: user.email,
                  service: newService,
                  date: newDate,
                  time: newTime,
                  status: "confirmed",
                  barbershop_id: barbershop?.id || null
                }).select().single()
                if (data) setAppointments(prev => [...prev, data].sort((a,b) => a.date.localeCompare(b.date)))
                setModal(null); setNewClient(""); setNewDate(""); setNewTime("")
                showToast("Το ραντεβού προστέθηκε ✓")
              }}>Αποθήκευση</button>
            </div>
          </div>
        </div>
      )}

      {/* BLOCK SLOT MODAL */}
      {modal === "block" && (
        <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) setModal(null) }}>
          <div className="modal-box">
            <h3>🚫 Αποκλεισμός Ώρας</h3>
            <div className="modal-field">
              <label>Ημερομηνία</label>
              <input type="date" value={newDate} min={today} onChange={e => setNewDate(e.target.value)}/>
            </div>
            <div className="modal-field">
              <label>Ώρα</label>
              <div className="time-grid">
                {timeSlots().filter((_,i) => i % 2 === 0).slice(2, 22).map(t => (
                  <div key={t} className={`time-slot ${newTime===t?"sel":""}`} onClick={() => setNewTime(t)}>{t}</div>
                ))}
              </div>
            </div>
            <div className="modal-field">
              <label>Αιτία (προαιρετικό)</label>
              <input type="text" value={blockReason} onChange={e => setBlockReason(e.target.value)} placeholder="π.χ. Διάλειμμα, Ραντεβού γιατρού"/>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => { setModal(null); setNewDate(""); setNewTime(""); setBlockReason("") }}>Πίσω</button>
              <button className="btn primary" onClick={async () => {
                if (!newDate || !newTime) { showToast("Επέλεξε ημερομηνία και ώρα!"); return }
                const { data } = await supabase.from("appointments").insert({
                  customer_name: "🚫 Αποκλεισμένο",
                  customer_email: user.email,
                  service: blockReason || "Μη διαθέσιμο",
                  date: newDate,
                  time: newTime,
                  status: "cancelled",
                  barbershop_id: barbershop?.id || null
                }).select().single()
                if (data) setAppointments(prev => [...prev, data])
                setModal(null); setNewDate(""); setNewTime(""); setBlockReason("")
                showToast("Η ώρα αποκλείστηκε ✓")
              }}>Αποκλεισμός</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}