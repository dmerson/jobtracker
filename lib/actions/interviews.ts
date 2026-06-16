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

export async function addInterview(jobId: string, formData: FormData) {
  const { supabase, userId } = await requireUser();

  const interview_date = String(formData.get("interview_date") ?? "") || null;
  const round_type = String(formData.get("round_type") ?? "");
  const interviewers = String(formData.get("interviewers") ?? "");
  const notes = String(formData.get("notes") ?? "");

  const { error } = await supabase.from("interviews").insert({
    job_application_id: jobId,
    user_id: userId,
    interview_date,
    round_type,
    interviewers,
    notes,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/jobs/${jobId}`);
}

export async function deleteInterview(jobId: string, interviewId: string) {
  const { supabase, userId } = await requireUser();

  const { error } = await supabase
    .from("interviews")
    .delete()
    .eq("id", interviewId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  revalidatePath(`/jobs/${jobId}`);
}
