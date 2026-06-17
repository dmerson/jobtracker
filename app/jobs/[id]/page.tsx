import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import JobEditForm from "@/components/JobEditForm";
import InterviewsSection from "@/components/InterviewsSection";
import CoverLetterSection from "@/components/CoverLetterSection";
import ResumeSection from "@/components/ResumeSection";
import { JOB_STATUSES, type JobStatus } from "@/lib/types";

const STATUS_STYLES: Record<JobStatus, string> = {
  applied:   "bg-[#EEF3F8] text-[#0A66C2]",
  contacted: "bg-[#E8F5E9] text-[#1B6B1B]",
  interview: "bg-[#FFF3E0] text-[#B25800]",
  offer:     "bg-[#E6F4EA] text-[#1B6B1B] font-semibold",
  rejected:  "bg-[#FEE7E7] text-[#B71C1C]",
  closed:    "bg-[#F3F2EF] text-[rgba(0,0,0,0.4)]",
};

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
      supabase.from("interviews").select("*").eq("job_application_id", id).order("interview_date", { ascending: true }),
      supabase.from("cover_letters").select("*").eq("job_application_id", id).order("created_at", { ascending: false }),
      supabase.from("resumes").select("*").eq("job_application_id", id).order("created_at", { ascending: false }),
    ]);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-6">
      {/* Header card */}
      <div className="li-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-black/50">{job.company}</p>
            <h1 className="mt-0.5 text-xl font-semibold text-black/90">{job.title}</h1>
            {job.applied_date && (
              <p className="mt-1 text-xs text-black/40">
                Applied {new Date(job.applied_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
            {job.application_url && (
              <a
                href={job.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs text-[#0A66C2] hover:underline"
              >
                View job posting ↗
              </a>
            )}
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[job.status as JobStatus]}`}>
            {JOB_STATUSES.find((s) => s.value === job.status)?.label}
          </span>
        </div>
        {job.next_step && (
          <div className="mt-3 rounded-md bg-[#EEF3F8] px-3 py-2 text-sm text-[#0A66C2]">
            <span className="font-semibold">Next step:</span> {job.next_step}
          </div>
        )}
      </div>

      <JobEditForm job={job} />
      <InterviewsSection jobId={id} interviews={interviews ?? []} />
      <CoverLetterSection jobId={id} initialCoverLetters={coverLetters ?? []} />
      <ResumeSection jobId={id} resumes={resumes ?? []} />
    </div>
  );
}
