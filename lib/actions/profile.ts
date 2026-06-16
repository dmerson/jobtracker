"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const full_name = String(formData.get("full_name") ?? "");
  const summary = String(formData.get("summary") ?? "");
  const skills = String(formData.get("skills") ?? "");
  const base_resume_content = String(formData.get("base_resume_content") ?? "");

  const { error } = await supabase.from("profiles").upsert({
    user_id: data.user.id,
    full_name,
    summary,
    skills,
    base_resume_content,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/profile");
}
