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
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900">Base Profile</h1>
      <p className="mt-1 text-sm text-zinc-500">
        This is your master resume/skills profile. It&apos;s used as the
        starting point for AI-generated cover letters and tailored resumes
        for each job.
      </p>

      <form action={updateProfile} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Full Name
          </label>
          <input
            name="full_name"
            defaultValue={profile?.full_name ?? ""}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Professional Summary
          </label>
          <RichTextEditor
            name="summary"
            defaultValue={profile?.summary ?? ""}
            placeholder="A short summary of your experience and goals..."
            minHeight="6rem"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Skills
          </label>
          <textarea
            name="skills"
            rows={3}
            defaultValue={profile?.skills ?? ""}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            placeholder="Comma-separated list of skills, e.g. TypeScript, React, SQL, Project Management..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Base Resume Content
          </label>
          <RichTextEditor
            name="base_resume_content"
            defaultValue={profile?.base_resume_content ?? ""}
            placeholder="Paste your full resume content here — links, bold text, and formatting will be preserved."
            minHeight="20rem"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Save Profile
        </button>
      </form>
    </main>
  );
}
