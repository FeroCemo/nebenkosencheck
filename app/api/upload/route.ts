import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, free_analyses_used")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  if (
    profile.subscription_status !== "pro" &&
    profile.subscription_status !== "one_time" &&
    profile.free_analyses_used >= 1
  ) {
    return Response.json({ error: "LIMIT_REACHED" }, { status: 403 });
  }

  const body = await request.json();
  const { fileName } = body;

  if (!fileName) {
    return Response.json({ error: "fileName required" }, { status: 400 });
  }

  const storagePath = `${user.id}/${Date.now()}-${fileName}`;

  const { data: signedData, error: signedError } = await supabase.storage
    .from("nebenkostenanalysen")
    .createSignedUploadUrl(storagePath);

  if (signedError || !signedData) {
    return Response.json({ error: "Could not create upload URL" }, { status: 500 });
  }

  const { data: analysis, error: insertError } = await supabase
    .from("analyses")
    .insert({
      user_id: user.id,
      status: "pending",
      pdf_storage_path: storagePath,
    })
    .select("id")
    .single();

  if (insertError || !analysis) {
    return Response.json({ error: "Could not create analysis" }, { status: 500 });
  }

  return Response.json({
    signedUrl: signedData.signedUrl,
    storagePath,
    analysisId: analysis.id,
  });
}
