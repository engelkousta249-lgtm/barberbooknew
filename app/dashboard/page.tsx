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
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState("overview")
  const [appointments, setAppointments] = useState<any[]>([])
  const [barbershop, setBarbershop] = useState<any>(null)
  const [toast, setToast] = useState("")
  const [modal, setModal] = useState<null|"new"|"block"|"cancel"|"reschedule">(null)
  const [selectedAppt, setSelectedAppt] = useState<any>(null)
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")
  const [newClient, setNewClient] = useState("")
  const [newService, setNewService] = useState("Κούρεμα")
  const [blockReason, setBlockReason] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [teamMembers, setTeamMembers] = useState<{name:string, role:string}[]>([])

  const [editServices, setEditServices] = useState<{name:string,duration:number,price:number}[]>([])
  const [hours, setHours] = useState([
    {day:"Δευ", active:true, open:"09:00", close:"19:00"},
    {day:"Τρί", active:true, open:"09:00", close:"19:00"},
    {day:"Τετ", active:true, open:"09:00", close:"19:00"},
    {day:"Πέμ", active:true, open:"09:00", close:"21:00"},
    {day:"Παρ", active:true, open:"09:00", close:"21:00"},
    {day:"Σάβ", active:true, open:"10:00", close:"16:00"},
    {day:"Κυρ", active:false, open:"", close:""},
  ])

  const today = new Date().toISOString().split("T")[0]
  const todayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
  const SERVICES = ["Κούρεμα","Κούρεμα + Γένια","Ξύρισμα + Styling","Full Service","Fade","Παιδικό Κούρεμα"]

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

      if (profile?.role !== "owner") {
        window.location.href = "/"
        return
      }

      if (profile?.barbershop_id) {
        const { data: shop } = await supabase
          .from("barbershops").select("*").eq("id", profile.barbershop_id).single()
        setBarbershop(shop)

        const { data: appts } = await supabase
          .from("appointments").select("*")
          .eq("barbershop_id", profile.barbershop_id)
          .order("date", { ascending: true })
        setAppointments(appts || [])

        // Φόρτωσε services
        const { data: svcData } = await supabase
          .from("services").select("*").eq("shop_id", profile.barbershop_id)
        if (svcData && svcData.length > 0) {
          setEditServices(svcData.map((s:any) => ({
            name: s.name,
            duration: s.duration_minutes,
            price: s.price,
          })))
        }

        // Φόρτωσε working hours
        const { data: hoursData } = await supabase
          .from("working_hours").select("*")
          .eq("shop_id", profile.barbershop_id)
          .order("day_of_week")
        if (hoursData && hoursData.length > 0) {
          const dayShorts = ["Δευ","Τρί","Τετ","Πέμ","Παρ","Σάβ","Κυρ"]
          setHours(hoursData.map((h:any) => ({
            day: dayShorts[h.day_of_week],
            active: h.is_active,
            open: h.open_time || "09:00",
            close: h.close_time || "19:00",
          })))
        }

        // Φόρτωσε barbers
        const { data: barbersData } = await supabase
          .from("barbers").select("*").eq("shop_id", profile.barbershop_id)
        if (barbersData && barbersData.length > 0) {
          setTeamMembers(barbersData.map((b:any) => ({ name: b.name, role: b.role })))
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  async function handleCancel(id: string) {
    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id)
    setAppointments(prev => prev.map(a => a.id === id ? {...a, status:"cancelled"} : a))
    setModal(null)
    showToast("Το ραντεβού ακυρώθηκε")
  }

  async function handleReschedule() {
    if (!newDate || !newTime) { showToast("Επέλεξε ημερομηνία και ώρα!"); return }
    await supabase.from("appointments")
      .update({ date: newDate, time: newTime, status: "pending" })
      .eq("id", selectedAppt.id)
    setAppointments(prev => prev.map(a =>
      a.id === selectedAppt.id ? {...a, date:newDate, time:newTime, status:"pending"} : a
    ))
    setModal(null); setNewDate(""); setNewTime("")
    showToast("Το ραντεβού αλλάχτηκε ✓")
  }

  const todayAppts = appointments.filter(a => a.date === today && a.status !== "cancelled")
  const upcomingAppts = appointments.filter(a => a.date > today && a.status !== "cancelled")
  const totalRevenue = appointments.filter(a => a.status !== "cancelled").length * 15
  const cancelledCount = appointments.filter(a => a.status === "cancelled").length

  const weekDays = DAYS.map((name, i) => {
    const d = new Date()
    const cur = d.getDay() === 0 ? 6 : d.getDay() - 1
    const diff = i - cur
    const date = new Date(d)
    date.setDate(d.getDate() + diff)
    const iso = date.toISOString().split("T")[0]
    return {
      name, iso,
      isToday: iso === today,
      appts: appointments.filter(a => a.date === iso && a.status !== "cancelled")
    }
  })

  const initials = (user?.user_metadata?.full_name || user?.email || "?")
    .split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase()

  const navItems = [
    {v:"overview", icon:"⊞", label:"Επισκόπηση"},
    {v:"week", icon:"📅", label:"Εβδομάδα"},
    {v:"services", icon:"✂️", label:"Υπηρεσίες"},
    {v:"hours", icon:"🕒", label:"Ωράριο"},
    {v:"team", icon:"👥", label:"Ομάδα"},
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
          --border:rgba(255,255,255,.07);--border2:rgba(255,255,255,.04);
          --blue:#3b82f6;--blue-soft:rgba(59,130,246,.12);--blue-glow:rgba(59,130,246,.3);
          --gold:#f59e0b;--gold-soft:rgba(245,158,11,.1);
          --text:#f1f5f9;--muted:#64748b;--muted2:#94a3b8;
          --green:#10b981;--red:#ef4444;--purple:#8b5cf6;
        }
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{height:100%;}
        body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);overflow-x:hidden;}
        h1,h2,h3{font-family:'Outfit',sans-serif;}
        button,input,select{font-family:inherit;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        @keyframes slideIn{from{transform:translateX(-100%);}to{transform:translateX(0);}}
        .layout{display:flex;min-height:100vh;}
        .sidebar{width:220px;flex-shrink:0;background:var(--sidebar);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:0;position:sticky;top:0;height:100vh;overflow:hidden;}
        .sidebar-top{padding:20px 16px;border-bottom:1px solid var(--border);}
        .brand{font-family:'Outfit',sans-serif;font-size:18px;font-weight:800;background:linear-gradient(135deg,var(--blue),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:4px;cursor:pointer;}
        .shop-name-side{font-size:11px;color:var(--muted);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .sidebar-nav{padding:12px 10px;flex:1;overflow-y:auto;}
        .nav-section{font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--muted);padding:8px 8px 4px;}
        .nav-btn{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;font-size:13.5px;font-weight:500;color:var(--muted2);cursor:pointer;transition:all .18s;background:none;border:none;width:100%;text-align:left;margin-bottom:2px;}
        .nav-btn:hover{background:rgba(255,255,255,.04);color:var(--text);}
        .nav-btn.active{background:var(--blue-soft);color:#93c5fd;font-weight:600;}
        .nav-btn .nav-ic{font-size:16px;width:20px;text-align:center;flex-shrink:0;}
        .sidebar-foot{padding:14px 16px;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px;}
        .avatar{width:34px;height:34px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,var(--gold),#b45309);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#1a0f00;}
        .foot-name{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .foot-role{font-size:10.5px;color:var(--muted);}
        .logout-btn{margin-left:auto;background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px;flex-shrink:0;transition:color .2s;padding:4px;}
        .logout-btn:hover{color:var(--red);}
        .topbar{background:rgba(13,21,38,.8);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);padding:0 28px;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:30;}
        .topbar-left{display:flex;align-items:center;gap:14px;}
        .menu-btn{display:none;background:none;border:1px solid var(--border);border-radius:8px;color:var(--muted2);cursor:pointer;padding:6px 8px;font-size:16px;}
        .page-title{font-family:'Outfit',sans-serif;font-size:17px;font-weight:700;}
        .page-sub{font-size:12px;color:var(--muted);margin-top:1px;}
        .topbar-right{display:flex;align-items:center;gap:10px;}
        .status-badge{display:flex;align-items:center;gap:7px;padding:7px 14px;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);border-radius:999px;font-size:12px;font-weight:600;color:var(--green);cursor:pointer;}
        .status-dot{width:7px;height:7px;border-radius:50%;background:var(--green);animation:pulse 2s infinite;}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
        .icon-btn-top{width:36px;height:36px;border-radius:10px;background:var(--card2);border:1px solid var(--border);color:var(--muted2);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;transition:all .2s;}
        .icon-btn-top:hover{border-color:var(--blue);color:var(--blue);}
        .main{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden;}
        .content{padding:24px 28px;flex:1;overflow-y:auto;}
        .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px;}
        .stat{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:18px 20px;transition:all .2s;position:relative;overflow:hidden;}
        .stat::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;border-radius:2px 2px 0 0;}
        .stat.blue::before{background:linear-gradient(90deg,var(--blue),transparent);}
        .stat.gold::before{background:linear-gradient(90deg,var(--gold),transparent);}
        .stat.green::before{background:linear-gradient(90deg,var(--green),transparent);}
        .stat.purple::before{background:linear-gradient(90deg,var(--purple),transparent);}
        .stat:hover{border-color:rgba(255,255,255,.12);transform:translateY(-1px);}
        .stat-label{font-size:11.5px;color:var(--muted);font-weight:600;margin-bottom:10px;text-transform:uppercase;letter-spacing:.3px;}
        .stat-val{font-family:'Outfit',sans-serif;font-size:26px;font-weight:800;line-height:1;}
        .stat-val.blue{color:var(--blue);}
        .stat-val.gold{color:var(--gold);}
        .stat-val.green{color:var(--green);}
        .stat-val.purple{color:var(--purple);}
        .stat-delta{font-size:11px;color:var(--muted);margin-top:6px;font-weight:500;}
        .grid2{display:grid;grid-template-columns:1.4fr 1fr;gap:16px;margin-bottom:16px;}
        .panel{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;animation:fadeIn .3s ease;}
        .panel-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;}
        .panel-head h2{font-size:14.5px;font-weight:700;}
        .link-btn{font-size:12px;color:var(--blue);cursor:pointer;background:none;border:none;font-weight:600;}
        .appt-list{display:flex;flex-direction:column;gap:8px;}
        .appt-card{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--card2);border:1px solid var(--border);border-radius:12px;transition:all .2s;}
        .appt-card:hover{border-color:rgba(59,130,246,.2);}
        .appt-card.cancelled{opacity:.4;}
        .appt-time-box{background:var(--blue-soft);border:1px solid rgba(59,130,246,.2);border-radius:8px;padding:6px 10px;text-align:center;flex-shrink:0;min-width:52px;}
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
        .appt-btn{padding:5px 10px;border-radius:7px;font-size:11.5px;font-weight:600;cursor:pointer;transition:all .2s;border:1px solid var(--border);background:var(--card);color:var(--muted2);}
        .appt-btn:hover{border-color:var(--blue);color:var(--blue);}
        .appt-btn.danger:hover{border-color:var(--red);color:var(--red);}
        .week-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:10px;}
        .day-col{background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:12px 10px;min-width:0;}
        .day-col.today{border-color:rgba(59,130,246,.35);background:var(--blue-soft);}
        .day-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px;}
        .day-name{font-size:12px;font-weight:700;}
        .day-count{font-size:10px;color:var(--muted);}
        .mini-appt{background:var(--card);border-radius:8px;padding:7px 8px;margin-bottom:6px;border:1px solid var(--border);}
        .mini-time{font-size:10.5px;font-weight:700;color:var(--blue);}
        .mini-name{font-size:12px;font-weight:600;margin-top:1px;}
        .mini-svc{font-size:10.5px;color:var(--muted);margin-top:1px;}
        .day-empty{color:var(--muted);font-size:11px;text-align:center;padding:12px 0;}
        .svc-head{display:grid;grid-template-columns:1fr 80px 80px 32px;gap:8px;font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.3px;font-weight:600;padding:0 2px;margin-bottom:8px;}
        .svc-row{display:grid;grid-template-columns:1fr 80px 80px 32px;gap:8px;align-items:center;margin-bottom:8px;}
        .svc-inp{width:100%;background:var(--card2);border:1px solid var(--border);border-radius:9px;padding:9px 11px;font-size:13.5px;color:var(--text);outline:none;transition:all .2s;}
        .svc-inp:focus{border-color:var(--blue);box-shadow:0 0 0 2px var(--blue-soft);}
        .svc-inp.gold{color:var(--gold);font-weight:700;}
        .del-btn{width:32px;height:32px;border-radius:8px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.15);color:var(--red);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;transition:all .2s;}
        .del-btn:hover{background:rgba(239,68,68,.15);}
        .add-svc-btn{width:100%;padding:10px;border-radius:10px;border:1.5px dashed rgba(59,130,246,.25);background:rgba(59,130,246,.04);color:#60a5fa;font-size:13px;font-weight:600;cursor:pointer;margin-top:8px;transition:all .2s;}
        .add-svc-btn:hover{border-color:var(--blue);background:var(--blue-soft);}
        .hour-row{display:flex;align-items:center;gap:12px;padding:11px 14px;background:var(--card2);border:1px solid var(--border);border-radius:12px;margin-bottom:8px;}
        .hour-row.off{opacity:.45;}
        .hour-day{font-size:13px;font-weight:700;width:36px;flex-shrink:0;}
        .hour-inp{background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:7px 9px;font-size:12.5px;color:var(--text);font-family:'Inter',sans-serif;outline:none;}
        .hour-inp:focus{border-color:var(--blue);}
        .hour-sep{color:var(--muted);font-size:12px;}
        .hour-closed{font-size:12px;color:var(--muted);flex:1;}
        .toggle{width:40px;height:22px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid var(--border);position:relative;cursor:pointer;flex-shrink:0;margin-left:auto;transition:all .25s;}
        .toggle::after{content:'';position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:var(--muted);transition:all .25s;}
        .toggle.on{background:rgba(59,130,246,.2);border-color:rgba(59,130,246,.4);}
        .toggle.on::after{left:21px;background:var(--blue);}
        .settings-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:22px;margin-bottom:14px;}
        .settings-card h3{font-size:15px;font-weight:700;margin-bottom:16px;}
        .settings-row{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid var(--border);}
        .settings-row:last-child{border-bottom:none;}
        .settings-label{font-size:13px;color:var(--muted2);}
        .settings-val{font-size:13px;font-weight:600;}
        .btn{padding:10px 18px;border-radius:10px;font-size:13.5px;font-weight:700;cursor:pointer;transition:all .2s;border:1px solid var(--border);background:var(--card2);color:var(--text);}
        .btn:hover{border-color:var(--blue);}
        .btn.primary{background:linear-gradient(135deg,var(--blue),#1d4ed8);border:none;color:#fff;box-shadow:0 6px 20px -6px var(--blue-glow);}
        .btn.primary:hover{filter:brightness(1.08);transform:translateY(-1px);}
        .btn.danger{background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.2);color:var(--red);}
        .btn.danger:hover{background:rgba(239,68,68,.15);}
        .btn.sm{padding:7px 13px;font-size:12px;}
        .quick-actions{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;}
        .overlay{position:fixed;inset:0;z-index:60;background:rgba(5,10,20,.75);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;}
        .modal{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:26px;width:100%;max-width:420px;animation:fadeIn .25s ease;}
        .modal h3{font-size:17px;font-weight:700;margin-bottom:6px;}
        .modal p{font-size:13px;color:var(--muted2);margin-bottom:20px;line-height:1.6;}
        .modal-field{margin-bottom:14px;}
        .modal-field label{display:block;font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.3px;margin-bottom:6px;}
        .modal-field input,.modal-field select{width:100%;background:var(--card2);border:1px solid var(--border);border-radius:10px;padding:11px 13px;font-size:14px;color:var(--text);outline:none;transition:all .2s;}
        .modal-field input:focus,.modal-field select:focus{border-color:var(--blue);}
        .modal-actions{display:flex;gap:10px;margin-top:20px;}
        .modal-actions .btn{flex:1;text-align:center;}
        .time-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px;}
        .time-slot{padding:9px 4px;text-align:center;border-radius:9px;border:1px solid var(--border);background:var(--card2);font-size:12px;font-weight:700;cursor:pointer;transition:all .18s;color:var(--muted2);}
        .time-slot:hover,.time-slot.sel{background:var(--blue-soft);border-color:rgba(59,130,246,.35);color:var(--blue);}
        .mobile-overlay{display:none;}
        .bottom-nav{display:none;}
        .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--card);border:1px solid var(--border);color:var(--text);padding:11px 20px;border-radius:12px;font-size:13px;font-weight:600;opacity:0;transition:all .25s;pointer-events:none;z-index:99;white-space:nowrap;box-shadow:0 8px 32px rgba(0,0,0,.3);}
        .toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
        .empty{text-align:center;padding:32px;color:var(--muted);font-size:13px;}
        .empty-icon{font-size:32px;display:block;margin-bottom:10px;}
        .team-row{display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin-bottom:8px;}
        .upgrade-box{text-align:center;padding:40px 20px;background:var(--card2);border-radius:14px;border:1px dashed var(--border);}
        .upgrade-box .ub-icon{font-size:40px;margin-bottom:12px;}
        .upgrade-box p{font-size:13px;color:var(--muted);line-height:1.7;}
        @media(max-width:1024px){.stats{grid-template-columns:repeat(2,1fr);}.grid2{grid-template-columns:1fr;}.week-grid{grid-template-columns:repeat(3,1fr);}}
        @media(max-width:768px){
          .sidebar{display:none;}
          .sidebar.mobile-open{display:flex;position:fixed;z-index:50;height:100vh;animation:slideIn .25s ease;}
          .mobile-overlay{display:block;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:40;}
          .menu-btn{display:flex;}
          .content{padding:16px;}
          .week-grid{grid-template-columns:repeat(2,1fr);}
          .bottom-nav{display:flex;position:fixed;bottom:0;left:0;right:0;z-index:30;background:var(--card);border-top:1px solid var(--border);padding:8px 4px calc(8px + env(safe-area-inset-bottom));justify-content:space-around;}
          .bn-item{display:flex;flex-direction:column;align-items:center;gap:2px;background:none;border:none;color:var(--muted);font-size:9.5px;font-weight:600;padding:5px 8px;border-radius:10px;cursor:pointer;}
          .bn-item .ic{font-size:18px;}
          .bn-item.active{color:var(--blue);}
          .content{padding-bottom:80px;}
          .team-row{grid-template-columns:1fr auto;}
        }
        @media(max-width:480px){.stats{grid-template-columns:repeat(2,1fr);}.week-grid{grid-template-columns:1fr;}}
      `}</style>

      <div className="layout">
        {sidebarOpen && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)}/>}
        <aside className={`sidebar ${sidebarOpen ? "mobile-open" : ""}`}>
          <div className="sidebar-top">
            <div className="brand" onClick={() => window.location.href="/"}>BarberBook</div>
            <div className="shop-name-side">{barbershop?.name || "Dashboard"}</div>
          </div>
          <div className="sidebar-nav">
            <div className="nav-section">Κύριο</div>
            {navItems.slice(0,2).map(n => (
              <button key={n.v} className={`nav-btn ${view===n.v?"active":""}`}
                onClick={() => { setView(n.v); setSidebarOpen(false) }}>
                <span className="nav-ic">{n.icon}</span>{n.label}
              </button>
            ))}
            <div className="nav-section" style={{marginTop:8}}>Κατάστημα</div>
            {navItems.slice(2).map(n => (
              <button key={n.v} className={`nav-btn ${view===n.v?"active":""}`}
                onClick={() => { setView(n.v); setSidebarOpen(false) }}>
                <span className="nav-ic">{n.icon}</span>{n.label}
              </button>
            ))}
          </div>
          <div className="sidebar-foot">
            <div className="avatar">{initials}</div>
            <div style={{minWidth:0}}>
              <div className="foot-name">{user?.user_metadata?.full_name || user?.email}</div>
              <div className="foot-role">Owner</div>
            </div>
            <button className="logout-btn"
              onClick={async () => { await supabase.auth.signOut(); window.location.href="/" }}>
              ⏻
            </button>
          </div>
        </aside>

        <div className="main">
          <div className="topbar">
            <div className="topbar-left">
              <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
              <div>
                <div className="page-title">
                  {view==="overview"?"Επισκόπηση":view==="week"?"Εβδομάδα":view==="services"?"Υπηρεσίες":view==="hours"?"Ωράριο":view==="team"?"Ομάδα":"Ρυθμίσεις"}
                </div>
                <div className="page-sub">{todayName} · {barbershop?.name || "BarberBook"}</div>
              </div>
            </div>
            <div className="topbar-right">
              <div className="status-badge"><span className="status-dot"/>Ανοιχτά</div>
              <button className="icon-btn-top" onClick={() => setModal("new")}>+</button>
            </div>
          </div>

          <div className="content">

            {/* OVERVIEW */}
            {view === "overview" && (
              <>
                <div className="stats">
                  <div className="stat blue"><div className="stat-label">Σήμερα</div><div className="stat-val blue">{todayAppts.length}</div><div className="stat-delta">ραντεβού</div></div>
                  <div className="stat gold"><div className="stat-label">Εκτιμ. Έσοδα</div><div className="stat-val gold">€{totalRevenue}</div><div className="stat-delta">συνολικά</div></div>
                  <div className="stat green"><div className="stat-label">Επερχόμενα</div><div className="stat-val green">{upcomingAppts.length}</div><div className="stat-delta">ραντεβού</div></div>
                  <div className="stat purple"><div className="stat-label">Ακυρώσεις</div><div className="stat-val purple">{cancelledCount}</div><div className="stat-delta">σύνολο</div></div>
                </div>
                <div className="grid2">
                  <div className="panel">
                    <div className="panel-head">
                      <h2>📅 Σημερινό Πρόγραμμα</h2>
                      <button className="link-btn" onClick={() => setView("week")}>Εβδομάδα →</button>
                    </div>
                    {todayAppts.length === 0 ? (
                      <div className="empty"><span className="empty-icon">😴</span>Κανένα ραντεβού σήμερα</div>
                    ) : (
                      <div className="appt-list">
                        {todayAppts.map(a => (
                          <ApptCard key={a.id} appt={a}
                            onCancel={() => { setSelectedAppt(a); setModal("cancel") }}
                            onReschedule={() => { setSelectedAppt(a); setModal("reschedule") }}/>
                        ))}
                      </div>
                    )}
                    <div className="quick-actions">
                      <button className="btn primary sm" onClick={() => setModal("new")}>+ Νέο Ραντεβού</button>
                      <button className="btn sm" onClick={() => setModal("block")}>🚫 Αποκλεισμός</button>
                    </div>
                  </div>
                  <div className="panel">
                    <div className="panel-head">
                      <h2>📋 Επερχόμενα</h2>
                      <span style={{fontSize:12,color:"var(--muted)"}}>{upcomingAppts.length}</span>
                    </div>
                    {upcomingAppts.length === 0 ? (
                      <div className="empty"><span className="empty-icon">📭</span>Κανένα επερχόμενο</div>
                    ) : (
                      <div className="appt-list">
                        {upcomingAppts.slice(0,5).map(a => (
                          <ApptCard key={a.id} appt={a}
                            onCancel={() => { setSelectedAppt(a); setModal("cancel") }}
                            onReschedule={() => { setSelectedAppt(a); setModal("reschedule") }}/>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* WEEK */}
            {view === "week" && (
              <div className="panel">
                <div className="panel-head">
                  <h2>📅 Εβδομαδιαίο Πρόγραμμα</h2>
                  <button className="btn sm primary" onClick={() => setModal("new")}>+ Νέο</button>
                </div>
                <div className="week-grid">
                  {weekDays.map(d => (
                    <div key={d.name} className={`day-col ${d.isToday?"today":""}`}>
                      <div className="day-head">
                        <span className="day-name">{d.name.slice(0,3)}</span>
                        <span className="day-count">{d.appts.length}</span>
                      </div>
                      {d.appts.length === 0 ? <div className="day-empty">—</div> :
                        d.appts.map(a => (
                          <div key={a.id} className="mini-appt">
                            <div className="mini-time">{a.time}</div>
                            <div className="mini-name">{a.customer_name}</div>
                            <div className="mini-svc">{a.service}</div>
                          </div>
                        ))
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SERVICES */}
            {view === "services" && (
              <div className="panel" style={{maxWidth:580}}>
                <div className="panel-head">
                  <h2>✂️ Υπηρεσίες & Τιμές</h2>
                  <button className="btn sm primary" onClick={async () => {
                    if (!barbershop?.id) return
                    await supabase.from("services").delete().eq("shop_id", barbershop.id)
                    await supabase.from("services").insert(
                      editServices.map(s => ({
                        shop_id: barbershop.id,
                        name: s.name,
                        price: s.price,
                        duration_minutes: s.duration,
                      }))
                    )
                    showToast("Αποθηκεύτηκε ✓")
                  }}>Αποθήκευση</button>
                </div>
                <div className="svc-head">
                  <span>Υπηρεσία</span><span>Λεπτά</span><span>Τιμή €</span><span/>
                </div>
                {editServices.map((s,i) => (
                  <div key={i} className="svc-row">
                    <input className="svc-inp" value={s.name}
                      onChange={e => { const n=[...editServices]; n[i].name=e.target.value; setEditServices(n) }}/>
                    <input className="svc-inp" type="number" value={s.duration}
                      onChange={e => { const n=[...editServices]; n[i].duration=+e.target.value; setEditServices(n) }}/>
                    <input className="svc-inp gold" type="number" value={s.price}
                      onChange={e => { const n=[...editServices]; n[i].price=+e.target.value; setEditServices(n) }}/>
                    <button className="del-btn" onClick={() => setEditServices(p=>p.filter((_,j)=>j!==i))}>✕</button>
                  </div>
                ))}
                <button className="add-svc-btn" onClick={() => setEditServices(p=>[...p,{name:"",duration:30,price:15}])}>
                  + Προσθήκη Υπηρεσίας
                </button>
              </div>
            )}

            {/* HOURS */}
            {view === "hours" && (
              <div className="panel" style={{maxWidth:480}}>
                <div className="panel-head">
                  <h2>🕒 Ωράριο Λειτουργίας</h2>
                  <button className="btn sm primary" onClick={async () => {
                    if (!barbershop?.id) return
                    await supabase.from("working_hours").delete().eq("shop_id", barbershop.id)
                    await supabase.from("working_hours").insert(
                      hours.map((h, i) => ({
                        shop_id: barbershop.id,
                        day_of_week: i,
                        is_active: h.active,
                        open_time: h.active ? h.open : null,
                        close_time: h.active ? h.close : null,
                      }))
                    )
                    showToast("Αποθηκεύτηκε ✓")
                  }}>Αποθήκευση</button>
                </div>
                {hours.map((h,i) => (
                  <div key={h.day} className={`hour-row ${h.active?"":"off"}`}>
                    <span className="hour-day">{h.day}</span>
                    {h.active ? (
                      <>
                        <input type="time" className="hour-inp" value={h.open}
                          onChange={e => { const n=[...hours]; n[i].open=e.target.value; setHours(n) }}/>
                        <span className="hour-sep">–</span>
                        <input type="time" className="hour-inp" value={h.close}
                          onChange={e => { const n=[...hours]; n[i].close=e.target.value; setHours(n) }}/>
                      </>
                    ) : (
                      <span className="hour-closed">Κλειστά</span>
                    )}
                    <div className={`toggle ${h.active?"on":""}`} onClick={() => {
                      const n=[...hours]
                      n[i].active=!n[i].active
                      if(n[i].active&&!n[i].open){n[i].open="09:00";n[i].close="19:00"}
                      setHours(n)
                    }}/>
                  </div>
                ))}
              </div>
            )}

            {/* TEAM */}
            {view === "team" && (
              <div className="panel" style={{maxWidth:520}}>
                <div className="panel-head">
                  <h2>👥 Ομάδα Barbers</h2>
                  {barbershop?.num_barbers > 1 && (
                    <button className="btn sm primary" onClick={async () => {
                      if (!barbershop?.id) return
                      await supabase.from("barbers").delete().eq("shop_id", barbershop.id)
                      if (teamMembers.length > 0) {
                        await supabase.from("barbers").insert(
                          teamMembers.filter(b => b.name.trim()).map(b => ({
                            shop_id: barbershop.id,
                            name: b.name,
                            role: b.role || "Barber",
                          }))
                        )
                      }
                      showToast("Αποθηκεύτηκε ✓")
                    }}>Αποθήκευση</button>
                  )}
                </div>

               {(() => {
  const plan = barbershop?.num_barbers || 1
  const maxBarbers = plan === 1 ? 1 : plan === 2 ? 2 : 10
  const canAdd = teamMembers.length < maxBarbers

  return plan >= 1 ? (
    <>
      <p style={{fontSize:13,color:"var(--muted)",marginBottom:16,lineHeight:1.6}}>
        Το πλάνο σου επιτρέπει <strong>{maxBarbers} barber{maxBarbers>1?"s":""}</strong>.
      </p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:8,marginBottom:8,fontSize:10.5,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".3px",fontWeight:600,padding:"0 2px"}}>
        <span>Όνομα</span><span>Ρόλος</span><span/>
      </div>
      <p style={{fontSize:13,color:"var(--muted)",marginBottom:16,lineHeight:1.6}}>
        Πρόσθεσε τα ονόματα των barbers σου. Οι πελάτες θα μπορούν να επιλέξουν barber κατά την κράτηση.
      </p>
      {teamMembers.map((b, i) => (
        <div key={i} className="team-row">
          <input className="svc-inp" value={b.name} placeholder="π.χ. Νίκος Π."
            onChange={e => { const n=[...teamMembers]; n[i].name=e.target.value; setTeamMembers(n) }}/>
          <input className="svc-inp" value={b.role} placeholder="π.χ. Barber"
            onChange={e => { const n=[...teamMembers]; n[i].role=e.target.value; setTeamMembers(n) }}/>
          <button className="del-btn" onClick={() => setTeamMembers(p=>p.filter((_,j)=>j!==i))}>✕</button>
        </div>
      ))}
      {canAdd ? (
        <button className="add-svc-btn" onClick={() => setTeamMembers(p=>[...p,{name:"",role:"Barber"}])}>
          + Προσθήκη Barber
        </button>
      ) : (
        <div style={{textAlign:"center",padding:"16px",background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",borderRadius:10,marginTop:8}}>
          <p style={{fontSize:13,color:"var(--gold)"}}>
            Έχεις φτάσει το όριο του πλάνου σου ({maxBarbers} barbers).
          </p>
          <button className="btn primary sm" style={{marginTop:10}}
            onClick={() => window.location.href="/#pricing"}>
            Αναβάθμισε Πλάνο →
          </button>
        </div>
      )}
    </>
  ) : null
})()}
              </div>
            )}

            {/* SETTINGS */}
            {view === "settings" && (
              <>
                <div className="settings-card">
                  <h3>👤 Στοιχεία Λογαριασμού</h3>
                  <div className="settings-row"><span className="settings-label">Email</span><span className="settings-val">{user?.email}</span></div>
                  <div className="settings-row"><span className="settings-label">Όνομα</span><span className="settings-val">{user?.user_metadata?.full_name||"—"}</span></div>
                  <div className="settings-row"><span className="settings-label">Εγγραφή</span><span className="settings-val">{new Date(user?.created_at).toLocaleDateString("el-GR")}</span></div>
                </div>
                {barbershop && (
                  <div className="settings-card">
                    <h3>💈 Στοιχεία Κουρείου</h3>
                    <div className="settings-row"><span className="settings-label">Όνομα</span><span className="settings-val">{barbershop.name}</span></div>
                    <div className="settings-row"><span className="settings-label">Πόλη</span><span className="settings-val">{barbershop.city}</span></div>
                    <div className="settings-row"><span className="settings-label">Barbers</span><span className="settings-val">{barbershop.num_barbers || 1}</span></div>
                    <div className="settings-row"><span className="settings-label">Βαθμολογία</span><span className="settings-val">⭐ {barbershop.rating}</span></div>
                  </div>
                )}
                <div className="settings-card">
                  <h3>🔐 Ασφάλεια</h3>
                  <div className="settings-row">
                    <span className="settings-label">Αποσύνδεση</span>
                    <button className="btn danger sm" onClick={async()=>{await supabase.auth.signOut();window.location.href="/"}}>Αποσύνδεση</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        {navItems.map(n => (
          <button key={n.v} className={`bn-item ${view===n.v?"active":""}`} onClick={() => setView(n.v)}>
            <span className="ic">{n.icon}</span>{n.label}
          </button>
        ))}
      </nav>

      {/* CANCEL MODAL */}
      {modal==="cancel" && selectedAppt && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setModal(null)}}>
          <div className="modal">
            <h3>❌ Ακύρωση Ραντεβού</h3>
            <p>Είσαι σίγουρος ότι θέλεις να ακυρώσεις το ραντεβού του <strong>{selectedAppt.customer_name}</strong> στις {selectedAppt.date} {selectedAppt.time};</p>
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
            <p>Ραντεβού: <strong>{selectedAppt.customer_name}</strong> — {selectedAppt.service}</p>
            <div className="modal-field">
              <label>Νέα Ημερομηνία</label>
              <input type="date" value={newDate} min={today} onChange={e=>{setNewDate(e.target.value);setNewTime("")}}/>
            </div>
            {newDate && (
              <div className="modal-field">
                <label>Νέα Ώρα</label>
                <div className="time-grid">
                  {timeSlots().filter((_,i)=>i%2===0).slice(2,20).map(t=>(
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
              <label>Πελάτης</label>
              <input type="text" value={newClient} onChange={e=>setNewClient(e.target.value)} placeholder="Ονοματεπώνυμο"/>
            </div>
            <div className="modal-field">
              <label>Ημερομηνία</label>
              <input type="date" value={newDate} min={today} onChange={e=>setNewDate(e.target.value)}/>
            </div>
            {newDate && (
              <div className="modal-field">
                <label>Ώρα</label>
                <div className="time-grid">
                  {timeSlots().filter((_,i)=>i%2===0).slice(2,20).map(t=>(
                    <div key={t} className={`time-slot ${newTime===t?"sel":""}`} onClick={()=>setNewTime(t)}>{t}</div>
                  ))}
                </div>
              </div>
            )}
            <div className="modal-field">
              <label>Υπηρεσία</label>
              <select value={newService} onChange={e=>setNewService(e.target.value)}>
                {(editServices.length > 0 ? editServices.map(s=>s.name) : SERVICES).map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={()=>{setModal(null);setNewClient("");setNewDate("");setNewTime("")}}>Πίσω</button>
              <button className="btn primary" onClick={async()=>{
                if(!newClient||!newDate||!newTime){showToast("Συμπλήρωσε όλα!");return}
                const {data} = await supabase.from("appointments").insert({
                  customer_name:newClient,customer_email:user.email,
                  service:newService,date:newDate,time:newTime,
                  status:"confirmed",barbershop_id:barbershop?.id||null
                }).select().single()
                if(data) setAppointments(p=>[...p,data].sort((a,b)=>a.date.localeCompare(b.date)))
                setModal(null);setNewClient("");setNewDate("");setNewTime("")
                showToast("Το ραντεβού προστέθηκε ✓")
              }}>Αποθήκευση</button>
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
                  {timeSlots().filter((_,i)=>i%2===0).slice(2,20).map(t=>(
                    <div key={t} className={`time-slot ${newTime===t?"sel":""}`} onClick={()=>setNewTime(t)}>{t}</div>
                  ))}
                </div>
              </div>
            )}
            <div className="modal-field">
              <label>Αιτία (προαιρετικό)</label>
              <input type="text" value={blockReason} onChange={e=>setBlockReason(e.target.value)} placeholder="π.χ. Διάλειμμα"/>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={()=>{setModal(null);setNewDate("");setNewTime("");setBlockReason("")}}>Πίσω</button>
              <button className="btn primary" onClick={async()=>{
                if(!newDate||!newTime){showToast("Επέλεξε ημερομηνία και ώρα!");return}
                await supabase.from("appointments").insert({
                  customer_name:"🚫 Αποκλεισμένο",customer_email:user.email,
                  service:blockReason||"Μη διαθέσιμο",date:newDate,time:newTime,
                  status:"cancelled",barbershop_id:barbershop?.id||null
                })
                setModal(null);setNewDate("");setNewTime("");setBlockReason("")
                showToast("Η ώρα αποκλείστηκε ✓")
              }}>Αποκλεισμός</button>
            </div>
          </div>
        </div>
      )}

      <div className={`toast ${toast?"show":""}`}>{toast}</div>
    </>
  )
}

function ApptCard({ appt, onCancel, onReschedule }: any) {
  const date = new Date(appt.date)
  const day = date.getDate()
  const month = date.toLocaleDateString("el-GR", { month: "short" })
  return (
    <div className={`appt-card ${appt.status==="cancelled"?"cancelled":""}`}>
      <div className="appt-time-box">
        <div className="appt-time">{appt.time}</div>
        <div className="appt-date">{day} {month}</div>
      </div>
      <div className="appt-info">
        <div className="appt-name">{appt.customer_name}</div>
        <div className="appt-svc">{appt.service}</div>
        {appt.customer_email && <div className="appt-contact">{appt.customer_email}</div>}
      </div>
      <span className={`badge ${appt.status||"pending"}`}>
        {appt.status==="cancelled"?"Ακυρώθηκε":appt.status==="confirmed"?"✅ Επιβ.":"⏳ Εκκρ."}
      </span>
      {appt.status !== "cancelled" && (
        <div className="appt-btns">
          <button className="appt-btn" onClick={onReschedule}>🔄</button>
          <button className="appt-btn danger" onClick={onCancel}>✕</button>
        </div>
      )}
    </div>
  )
}