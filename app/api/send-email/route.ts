import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = new Resend("re_RXYqydKa_PQ54wZv65QBgyu7qzBRYqqZ3")

export async function POST(req: Request) {
  const { type, to, data } = await req.json()

  try {
    if (type === "welcome_owner") {
      await resend.emails.send({
        from: "BarberBook <onboarding@resend.dev>",
        to,
        subject: "Καλώς ήρθες στο BarberBook! 💈",
        html: `
          <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0f1e;color:#f1f5f9;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);padding:32px;text-align:center;">
              <h1 style="font-size:28px;font-weight:800;margin:0;color:white;">BarberBook 💈</h1>
              <p style="color:rgba(255,255,255,.8);margin:8px 0 0;font-size:15px;">Η #1 πλατφόρμα κουρείων στην Ελλάδα</p>
            </div>
            <div style="padding:32px;">
              <h2 style="font-size:22px;font-weight:700;margin:0 0 12px;">Καλώς ήρθες, ${data.ownerName}! 🎉</h2>
              <p style="color:#94a3b8;line-height:1.7;margin:0 0 24px;">Το κουρείο σου <strong style="color:#f1f5f9;">${data.shopName}</strong> δημιουργήθηκε επιτυχώς και είναι τώρα ζωντανό στο BarberBook!</p>
              <div style="background:#111827;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:20px;margin-bottom:24px;">
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Κουρείο</span>
                  <span style="font-weight:600;">${data.shopName}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Πόλη</span>
                  <span style="font-weight:600;">${data.city}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;">
                  <span style="color:#64748b;">Email</span>
                  <span style="font-weight:600;">${to}</span>
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
        to: data.shopEmail,
        subject: `Νέο Ραντεβού — ${data.customerName} 📅`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0f1e;color:#f1f5f9;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);padding:32px;text-align:center;">
              <h1 style="font-size:24px;font-weight:800;margin:0;color:white;">Νέο Ραντεβού! 📅</h1>
            </div>
            <div style="padding:32px;">
              <p style="color:#94a3b8;margin:0 0 20px;">Έχεις νέο ραντεβού στο <strong style="color:#f1f5f9;">${data.shopName}</strong>:</p>
              <div style="background:#111827;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:20px;margin-bottom:24px;">
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Πελάτης</span>
                  <span style="font-weight:600;">${data.customerName}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Υπηρεσία</span>
                  <span style="font-weight:600;">${data.service}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Ημερομηνία</span>
                  <span style="font-weight:600;">${data.date}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Ώρα</span>
                  <span style="font-weight:600;">${data.time}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;">
                  <span style="color:#64748b;">Τηλέφωνο</span>
                  <span style="font-weight:600;">${data.customerPhone}</span>
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
        to: data.customerEmail,
        subject: `Το ραντεβού σου επιβεβαιώθηκε! ✅`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0f1e;color:#f1f5f9;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#10b981,#059669);padding:32px;text-align:center;">
              <h1 style="font-size:24px;font-weight:800;margin:0;color:white;">Ραντεβού Επιβεβαιώθηκε! ✅</h1>
            </div>
            <div style="padding:32px;">
              <p style="color:#94a3b8;margin:0 0 20px;">Το ραντεβού σου στο <strong style="color:#f1f5f9;">${data.shopName}</strong> επιβεβαιώθηκε:</p>
              <div style="background:#111827;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:20px;margin-bottom:24px;">
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Κουρείο</span>
                  <span style="font-weight:600;">${data.shopName}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Υπηρεσία</span>
                  <span style="font-weight:600;">${data.service}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;">
                  <span style="color:#64748b;">Ημερομηνία</span>
                  <span style="font-weight:600;">${data.date}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;">
                  <span style="color:#64748b;">Ώρα</span>
                  <span style="font-weight:600;">${data.time}</span>
                </div>
              </div>
              <p style="color:#64748b;font-size:13px;text-align:center;">Μπορείς να ακυρώσεις ή να αλλάξεις ώρα επικοινωνώντας με το κουρείο.</p>
            </div>
            <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,.06);text-align:center;font-size:12px;color:#64748b;">
              © 2026 BarberBook · Made with ❤️ in Greece 🇬🇷
            </div>
          </div>
        `
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}