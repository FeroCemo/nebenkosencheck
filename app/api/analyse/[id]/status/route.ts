import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("analyses")
    .select("status, risk_score")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!data) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ status: data.status, risk_score: data.risk_score });
}
