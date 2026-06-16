"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  return { supabase, userId: data.user.id };
}

export async function createResumeFromBase(jobId: string) {
  const { supabase, userId } = await requireUser();

  const [{ data: profile }, { data: job }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("job_applications").select("*").eq("id", jobId).eq("user_id", userId).single(),
  ]);

  if (!profile) throw new Error("Set up your base profile first.");
  if (!job) throw new Error("Job not found.");

  const { error } = await supabase.from("resumes").insert({
    job_application_id: jobId,
    user_id: userId,
    title: `${job.title} @ ${job.company}`,
    content: profile.base_resume_content,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/jobs/${jobId}`);
}

export async function updateResumeContent(
  resumeId: string,
  jobId: string,
  formData: FormData,
) {
  const { supabase, userId } = await requireUser();

  const title = String(formData.get("title") ?? "");
  const content = String(formData.get("content") ?? "");

  const { error } = await supabase
    .from("resumes")
    .update({ title, content, updated_at: new Date().toISOString() })
    .eq("id", resumeId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  revalidatePath(`/jobs/${jobId}`);
}

export async function deleteResume(resumeId: string, jobId: string) {
  const { supabase, userId } = await requireUser();

  const { data: resume } = await supabase
    .from("resumes")
    .select("pdf_path")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .single();

  if (resume?.pdf_path) {
    await supabase.storage.from("resumes").remove([resume.pdf_path]);
  }

  const { error } = await supabase
    .from("resumes")
    .delete()
    .eq("id", resumeId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  revalidatePath(`/jobs/${jobId}`);
}
