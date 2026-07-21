import Stripe from "stripe"
import { NextResponse } from "next/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PLANS = {
  solo: {
    name: "Solo Plan",
    price: 2000, // €20 σε cents
    description: "1 Barber · Απεριόριστες κρατήσεις",
  },
  duo: {
    name: "Duo Plan",
    price: 2400, // €24
    description: "2 Barbers · Απεριόριστες κρατήσεις",
  },
  team: {
    name: "Team Plan",
    price: 2800, // €28
    description: "3-10 Barbers · Πλήρης διαχείριση",
  },
}

export async function POST(req: Request) {
  const { plan, barbershopId } = await req.json()

  const planData = PLANS[plan as keyof typeof PLANS]
  if (!planData) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: planData.name,
            description: planData.description,
          },
          unit_amount: planData.price,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL || "https://barberbooknew-eqfi.vercel.app"}/onboarding/${plan}?success=true&shop=${barbershopId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL || "https://barberbooknew-eqfi.vercel.app"}/onboarding/${plan}?cancelled=true`,
    metadata: { plan, barbershopId },
  })

  return NextResponse.json({ url: session.url })
}