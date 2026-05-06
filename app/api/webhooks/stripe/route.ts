import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import Stripe from "stripe";
import { NextRequest } from "next/server";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = getAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.supabase_user_id;

    if (!userId) return new Response("OK");

    if (session.mode === "subscription") {
      await supabase
        .from("profiles")
        .update({ subscription_status: "pro" })
        .eq("id", userId);
    } else if (session.mode === "payment") {
      await supabase
        .from("profiles")
        .update({ subscription_status: "one_time" })
        .eq("id", userId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;

    await supabase
      .from("profiles")
      .update({ subscription_status: "free" })
      .eq("stripe_customer_id", customerId);
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId =
      typeof invoice.customer === "string"
        ? invoice.customer
        : invoice.customer?.id;

    if (customerId) {
      await supabase
        .from("profiles")
        .update({ subscription_status: "free" })
        .eq("stripe_customer_id", customerId);
    }
  }

  return new Response("OK");
}
