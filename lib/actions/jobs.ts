"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { JobStatus } from "@/lib/types";

async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  return { supabase, userId: data.user.id };
}

export async function createJob(formData: FormData) {
  const { supabase, userId } = await requireUser();

  const company = String(formData.get("company") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const job_description = String(formData.get("job_description") ?? "");
  const application_url = String(formData.get("application_url") ?? "");
  const applied_date = String(formData.get("applied_date") ?? "") || null;

  const { data, error } = await supabase
    .from("job_applications")
    .insert({
      user_id: userId,
      company,
      title,
      job_description,
      application_url,
      applied_date,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  redirect(`/jobs/${data.id}`);
}

export async function updateJob(jobId: string, formData: FormData) {
  const { supabase, userId } = await requireUser();

  const company = String(formData.get("company") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const job_description = String(formData.get("job_description") ?? "");
  const application_url = String(formData.get("application_url") ?? "");
  const status = String(formData.get("status") ?? "applied") as JobStatus;
  const next_step = String(formData.get("next_step") ?? "");
  const applied_date = String(formData.get("applied_date") ?? "") || null;

  const { error } = await supabase
    .from("job_applications")
    .update({
      company,
      title,
      job_description,
      application_url,
      status,
      next_step,
      applied_date,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/jobs/${jobId}`);
}

export async function deleteJob(jobId: string) {
  const { supabase, userId } = await requireUser();

  const { error } = await supabase
    .from("job_applications")
    .delete()
    .eq("id", jobId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  redirect("/");
}
