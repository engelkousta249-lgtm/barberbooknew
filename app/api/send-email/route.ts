import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { type, to, data } = await req.json()

  try {
    if (type === "welcome_owner") {
      await resend.emails.send({
        from: "BarberBook <onboarding@resend.dev>",
        to: "engelkousta249@gmail.com",
        subject: "Καλώς ήρθες στο BarberBook! 💈",
        html: `
          <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0f1e;color:#f1f5f9;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);padding:32px;text-align:center;">
              <h1 style="font-size:28px;font-weight:800;margin:0;color:white;">BarberBook 💈</h1>
              <p style="color:rgba(255,255,255,.8);margin:8px 0 0;font-size:15px;">Η #1 πλατφόρμα κουρείων στην Ελλάδα</p>
            </div>
            <div style="padding:32px;">
              <h2 style="font-size:22px;font-weight:700;margin:0 0 12px;">Καλώς ήρθες, ${data.ownerName}! 🎉</h2>
              <p style="color:#94a3b8;line-height:1.7;margin:0 0 24px;">Το κουρείο σου <strong style="color:#f1f5f9;">${data.shopName}</strong> δημιουργήθηκε επιτυχώς!</p>
              <div style="background:#111827;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:20px;margin-bottom:24px;">
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Κουρείο</span><span style="font-weight:600;">${data.shopName}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;">
                  <span style="color:#64748b;">Πόλη</span><span style="font-weight:600;">${data.city}</span>
                </div>
              </div>
              <a href="https://barberbooknew-eqfi.vercel.app/dashboard" style="display:block;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;text-decoration:none;text-align:center;padding:14px;border-radius:10px;font-weight:700;font-size:15px;">
                Πήγαινε στο Dashboard →
              </a>
            </div>
            <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,.06);text-align:center;font-size:12px;color:#64748b;">
              © 2026 BarberBook · Made with ❤️ in Greece 🇬🇷
            </div>
          </div>
        `
      })
    }

    if (type === "new_appointment") {
      // Email στο κουρείο
      await resend.emails.send({
        from: "BarberBook <onboarding@resend.dev>",
        to: "engelkousta249@gmail.com",
        subject: `🔔 Νέο Ραντεβού — ${data.customerName}`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0f1e;color:#f1f5f9;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);padding:32px;text-align:center;">
              <h1 style="font-size:24px;font-weight:800;margin:0;color:white;">Νέο Ραντεβού! 📅</h1>
            </div>
            <div style="padding:32px;">
              <p style="color:#94a3b8;margin:0 0 20px;">Νέο ραντεβού στο <strong style="color:#f1f5f9;">${data.shopName}</strong>:</p>
              <div style="background:#111827;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:20px;margin-bottom:24px;">
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Πελάτης</span><span style="font-weight:600;">${data.customerName}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Υπηρεσία</span><span style="font-weight:600;">${data.service}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Ημερομηνία</span><span style="font-weight:600;">${data.date}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Ώρα</span><span style="font-weight:600;">${data.time}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;">
                  <span style="color:#64748b;">Τηλέφωνο</span><span style="font-weight:600;">${data.customerPhone || "—"}</span>
                </div>
              </div>
              <a href="https://barberbooknew-eqfi.vercel.app/dashboard" style="display:block;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;text-decoration:none;text-align:center;padding:14px;border-radius:10px;font-weight:700;font-size:15px;">
                Δες το Dashboard →
              </a>
            </div>
            <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,.06);text-align:center;font-size:12px;color:#64748b;">
              © 2026 BarberBook · Made with ❤️ in Greece 🇬🇷
            </div>
          </div>
        `
      })

      // Email στον πελάτη
      await resend.emails.send({
        from: "BarberBook <onboarding@resend.dev>",
        to: "engelkousta249@gmail.com",
        subject: `✅ Το ραντεβού σου επιβεβαιώθηκε!`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0f1e;color:#f1f5f9;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#10b981,#059669);padding:32px;text-align:center;">
              <h1 style="font-size:24px;font-weight:800;margin:0;color:white;">Ραντεβού Επιβεβαιώθηκε! ✅</h1>
            </div>
            <div style="padding:32px;">
              <h2 style="font-size:18px;font-weight:700;margin:0 0 8px;">Γεια σου, ${data.customerName}!</h2>
              <p style="color:#94a3b8;margin:0 0 20px;">Το ραντεβού σου στο <strong style="color:#f1f5f9;">${data.shopName}</strong> επιβεβαιώθηκε:</p>
              <div style="background:#111827;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:20px;margin-bottom:24px;">
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Κουρείο</span><span style="font-weight:600;">${data.shopName}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Υπηρεσία</span><span style="font-weight:600;">${data.service}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Ημερομηνία</span><span style="font-weight:600;">${data.date}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;">
                  <span style="color:#64748b;">Ώρα</span><span style="font-weight:600;">${data.time}</span>
                </div>
              </div>
              <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">Για ακύρωση επικοινώνησε με το κουρείο.</p>
            </div>
            <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,.06);text-align:center;font-size:12px;color:#64748b;">
              © 2026 BarberBook · Made with ❤️ in Greece 🇬🇷
            </div>
          </div>
        `
      })
    }

    if (type === "cancel_appointment") {
      await resend.emails.send({
        from: "BarberBook <onboarding@resend.dev>",
        to: "engelkousta249@gmail.com",
        subject: `❌ Ακύρωση Ραντεβού — ${data.customerName}`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0f1e;color:#f1f5f9;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#ef4444,#b91c1c);padding:32px;text-align:center;">
              <h1 style="font-size:24px;font-weight:800;margin:0;color:white;">Ακύρωση Ραντεβού ❌</h1>
            </div>
            <div style="padding:32px;">
              <p style="color:#94a3b8;margin:0 0 20px;">Το ραντεβού του/της <strong style="color:#f1f5f9;">${data.customerName}</strong> ακυρώθηκε:</p>
              <div style="background:#111827;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:20px;margin-bottom:24px;">
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Κουρείο</span><span style="font-weight:600;">${data.shopName}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Υπηρεσία</span><span style="font-weight:600;">${data.service}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Ημερομηνία</span><span style="font-weight:600;">${data.date}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;">
                  <span style="color:#64748b;">Ώρα</span><span style="font-weight:600;">${data.time}</span>
                </div>
              </div>
            </div>
            <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,.06);text-align:center;font-size:12px;color:#64748b;">
              © 2026 BarberBook · Made with ❤️ in Greece 🇬🇷
            </div>
          </div>
        `
      })
    }

    if (type === "reschedule_appointment") {
      await resend.emails.send({
        from: "BarberBook <onboarding@resend.dev>",
        to: "engelkousta249@gmail.com",
        subject: `🔄 Αλλαγή Ώρας — ${data.customerName}`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0f1e;color:#f1f5f9;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#f59e0b,#b45309);padding:32px;text-align:center;">
              <h1 style="font-size:24px;font-weight:800;margin:0;color:white;">Αλλαγή Ώρας 🔄</h1>
            </div>
            <div style="padding:32px;">
              <p style="color:#94a3b8;margin:0 0 20px;">Το ραντεβού αλλάχτηκε:</p>
              <div style="background:#111827;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:20px;margin-bottom:24px;">
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Πελάτης</span><span style="font-weight:600;">${data.customerName}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Νέα Ημερομηνία</span><span style="font-weight:600;">${data.newDate}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;">
                  <span style="color:#64748b;">Νέα Ώρα</span><span style="font-weight:600;">${data.newTime}</span>
                </div>
              </div>
            </div>
            <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,.06);text-align:center;font-size:12px;color:#64748b;">
              © 2026 BarberBook · Made with ❤️ in Greece 🇬🇷
            </div>
          </div>
        `
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Email error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}