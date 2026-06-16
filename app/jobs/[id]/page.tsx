import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import JobEditForm from "@/components/JobEditForm";
import InterviewsSection from "@/components/InterviewsSection";
import CoverLetterSection from "@/components/CoverLetterSection";
import ResumeSection from "@/components/ResumeSection";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: job } = await supabase
    .from("job_applications")
    .select("*")
    .eq("id", id)
    .eq("user_id", userData.user.id)
    .single();

  if (!job) notFound();

  const [{ data: interviews }, { data: coverLetters }, { data: resumes }] =
    await Promise.all([
      supabase
        .from("interviews")
        .select("*")
        .eq("job_application_id", id)
        .order("interview_date", { ascending: true }),
      supabase
        .from("cover_letters")
        .select("*")
        .eq("job_application_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("resumes")
        .select("*")
        .eq("job_application_id", id)
        .order("created_at", { ascending: false }),
    ]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-6 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900">
        {job.title} <span className="text-zinc-400">@</span> {job.company}
      </h1>

      <JobEditForm job={job} />
      <InterviewsSection jobId={id} interviews={interviews ?? []} />
      <CoverLetterSection jobId={id} initialCoverLetters={coverLetters ?? []} />
      <ResumeSection jobId={id} resumes={resumes ?? []} />
    </main>
  );
}
