import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: resume } = await supabase
    .from("resumes")
    .select("pdf_path")
    .eq("id", id)
    .eq("user_id", userData.user.id)
    .single();

  if (!resume?.pdf_path) {
    return NextResponse.json({ error: "No PDF for this resume" }, { status: 404 });
  }

  const { data: signed, error } = await supabase.storage
    .from("resumes")
    .createSignedUrl(resume.pdf_path, 60 * 60);

  if (error || !signed) {
    return NextResponse.json({ error: "Failed to sign URL" }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
