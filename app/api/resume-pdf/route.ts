import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderResumePdf } from "@/lib/pdf";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { resumeId } = await request.json();
  if (!resumeId) {
    return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
  }

  const { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .eq("user_id", userData.user.id)
    .single();

  if (resumeError || !resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const pdfBuffer = await renderResumePdf(
    resume.title || "Resume",
    resume.content,
  );

  const path = `${userData.user.id}/${resume.id}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(path, pdfBuffer, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("resumes")
    .update({ pdf_path: path, updated_at: new Date().toISOString() })
    .eq("id", resumeId)
    .eq("user_id", userData.user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { data: signed } = await supabase.storage
    .from("resumes")
    .createSignedUrl(path, 60 * 60);

  return NextResponse.json({ url: signed?.signedUrl });
}
