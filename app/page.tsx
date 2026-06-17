import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { JOB_STATUSES, type JobStatus } from "@/lib/types";

const STATUS_STYLES: Record<JobStatus, string> = {
  applied:   "bg-[#EEF3F8] text-[#0A66C2]",
  contacted: "bg-[#E8F5E9] text-[#1B6B1B]",
  interview: "bg-[#FFF3E0] text-[#B25800]",
  offer:     "bg-[#E6F4EA] text-[#1B6B1B] font-semibold",
  rejected:  "bg-[#FEE7E7] text-[#B71C1C]",
  closed:    "bg-[#F3F2EF] text-[rgba(0,0,0,0.4)]",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  const [{ data: jobs }, { data: allJobs }] = await Promise.all([
    supabase
      .from("job_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .then((q) => (status ? { data: q.data?.filter((j) => j.status === status) } : q)),
    supabase.from("job_applications").select("id, status"),
  ]);

  const counts = (allJobs ?? []).reduce<Record<string, number>>((acc, j) => {
    acc[j.status] = (acc[j.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <div className="flex gap-5">

        {/* Left sidebar */}
        <aside className="hidden w-56 shrink-0 flex-col gap-4 lg:flex">
          <div className="li-card">
            <p className="li-section-title">Activity</p>
            <div className="divide-y divide-black/[.06]">
              {JOB_STATUSES.map((s) => (
                <Link
                  key={s.value}
                  href={`/?status=${s.value}`}
                  className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-[#F3F2EF]"
                >
                  <span className="text-black/75">{s.label}</span>
                  <span className="font-semibold text-[#0A66C2]">
                    {counts[s.value] ?? 0}
                  </span>
                </Link>
              ))}
              <div className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold">
                <span>Total</span>
                <span>{allJobs?.length ?? 0}</span>
              </div>
            </div>
          </div>

          <Link
            href="/jobs/new"
            className="li-btn li-btn-primary w-full justify-center py-2"
          >
            + New Application
          </Link>
        </aside>

        {/* Main feed */}
        <main className="flex min-w-0 flex-1 flex-col gap-3">
          {/* Filter pills */}
          <div className="li-card flex flex-wrap gap-2 p-3">
            <Link
              href="/"
              className={`li-btn text-xs px-3 py-1 ${!status ? "li-btn-primary" : "li-btn-ghost"}`}
            >
              All ({allJobs?.length ?? 0})
            </Link>
            {JOB_STATUSES.map((s) => (
              <Link
                key={s.value}
                href={`/?status=${s.value}`}
                className={`li-btn text-xs px-3 py-1 ${status === s.value ? "li-btn-primary" : "li-btn-ghost"}`}
              >
                {s.label} {counts[s.value] ? `(${counts[s.value]})` : ""}
              </Link>
            ))}
          </div>

          {/* Job cards */}
          {!jobs || jobs.length === 0 ? (
            <div className="li-card p-8 text-center">
              <p className="text-sm text-black/50">No applications yet.</p>
              <Link href="/jobs/new" className="li-btn li-btn-primary mt-4 inline-flex">
                Add your first application
              </Link>
            </div>
          ) : (
            jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="li-card block p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {/* Company */}
                    <p className="text-xs font-medium text-black/50 uppercase tracking-wide">
                      {job.company}
                    </p>
                    {/* Title */}
                    <p className="mt-0.5 truncate text-base font-semibold text-[#0A66C2]">
                      {job.title}
                    </p>
                    {/* Meta */}
                    <p className="mt-1 text-xs text-black/40">
                      {job.applied_date
                        ? `Applied ${new Date(job.applied_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                        : "Date not set"}
                      {job.application_url && (
                        <> · <span className="text-[#0A66C2]">View posting ↗</span></>
                      )}
                    </p>
                    {/* Next step */}
                    {job.next_step && (
                      <p className="mt-2 text-sm text-black/70">
                        <span className="font-medium">Next:</span> {job.next_step}
                      </p>
                    )}
                  </div>
                  {/* Status */}
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[job.status as JobStatus]}`}>
                    {JOB_STATUSES.find((s) => s.value === job.status)?.label}
                  </span>
                </div>
              </Link>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
