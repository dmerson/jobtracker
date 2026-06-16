import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCoverLetter } from "@/lib/anthropic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await request.json();
  if (!jobId) {
    return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  }

  const [{ data: job, error: jobError }, { data: profile, error: profileError }] =
    await Promise.all([
      supabase
        .from("job_applications")
        .select("*")
        .eq("id", jobId)
        .eq("user_id", userData.user.id)
        .single(),
      supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userData.user.id)
        .maybeSingle(),
    ]);

  if (jobError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (profileError || !profile) {
    return NextResponse.json(
      { error: "Set up your base profile first." },
      { status: 400 },
    );
  }

  let content: string;
  try {
    content = await generateCoverLetter(profile, job);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate cover letter. Check your Anthropic API key." },
      { status: 502 },
    );
  }

  const { data: saved, error: saveError } = await supabase
    .from("cover_letters")
    .insert({ job_application_id: jobId, user_id: userData.user.id, content })
    .select("*")
    .single();

  if (saveError) {
    return NextResponse.json({ error: saveError.message }, { status: 500 });
  }

  return NextResponse.json({ coverLetter: saved });
}
