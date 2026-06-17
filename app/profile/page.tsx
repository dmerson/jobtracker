import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/actions/profile";
import { redirect } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <div className="li-card">
        <p className="li-section-title">Base Profile</p>
        <div className="px-4 pt-2 pb-1">
          <p className="text-sm text-black/50">
            Your master resume and skills profile. Used as the starting point for
            AI-generated cover letters and tailored resumes.
          </p>
        </div>

        <form action={updateProfile} className="space-y-4 p-4">
          <div>
            <label className="li-label">Full Name</label>
            <input
              name="full_name"
              defaultValue={profile?.full_name ?? ""}
              className="li-input"
            />
          </div>

          <div>
            <label className="li-label">Professional Summary</label>
            <RichTextEditor
              name="summary"
              defaultValue={profile?.summary ?? ""}
              placeholder="A short summary of your experience and goals…"
              minHeight="6rem"
            />
          </div>

          <div>
            <label className="li-label">Skills</label>
            <textarea
              name="skills"
              rows={2}
              defaultValue={profile?.skills ?? ""}
              className="li-input resize-y"
              placeholder="TypeScript, React, SQL, Project Management…"
            />
          </div>

          <div>
            <label className="li-label">Base Resume Content</label>
            <RichTextEditor
              name="base_resume_content"
              defaultValue={profile?.base_resume_content ?? ""}
              placeholder="Paste your full resume here — links, bold text, and formatting will be preserved."
              minHeight="20rem"
            />
          </div>

          <button type="submit" className="li-btn li-btn-primary py-2">
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}
