import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { priceType } = await request.json();

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email || profile?.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    success_url: `${appUrl}/dashboard?success=1`,
    cancel_url: `${appUrl}/settings`,
    metadata: { supabase_user_id: user.id },
    line_items: [],
    mode: "payment",
  };

  if (priceType === "pro") {
    sessionConfig.mode = "subscription";
    sessionConfig.line_items = [
      { price: process.env.STRIPE_PRICE_PRO_MONTHLY!, quantity: 1 },
    ];
  } else if (priceType === "one_time") {
    sessionConfig.mode = "payment";
    sessionConfig.line_items = [
      { price: process.env.STRIPE_PRICE_ONE_TIME!, quantity: 1 },
    ];
  } else {
    return Response.json({ error: "Invalid priceType" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);

  return Response.json({ url: session.url });
}
