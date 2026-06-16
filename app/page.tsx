import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { JOB_STATUSES, type JobStatus } from "@/lib/types";

const STATUS_STYLES: Record<JobStatus, string> = {
  applied: "bg-zinc-100 text-zinc-700",
  contacted: "bg-blue-100 text-blue-700",
  interview: "bg-amber-100 text-amber-700",
  offer: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  closed: "bg-zinc-200 text-zinc-500",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("job_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: jobs } = await query;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Applications</h1>
        <Link
          href="/jobs/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          + New Application
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/"
          className={`rounded-full px-3 py-1 ${!status ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"}`}
        >
          All
        </Link>
        {JOB_STATUSES.map((s) => (
          <Link
            key={s.value}
            href={`/?status=${s.value}`}
            className={`rounded-full px-3 py-1 ${status === s.value ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"}`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
        {!jobs || jobs.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">
            No applications yet. Click &ldquo;New Application&rdquo; to add one.
          </p>
        ) : (
          jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="flex items-center justify-between gap-4 p-4 hover:bg-zinc-50"
            >
              <div>
                <p className="font-medium text-zinc-900">
                  {job.title} <span className="text-zinc-400">@</span> {job.company}
                </p>
                {job.next_step && (
                  <p className="mt-1 text-sm text-zinc-500">
                    Next: {job.next_step}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[job.status as JobStatus]}`}
              >
                {JOB_STATUSES.find((s) => s.value === job.status)?.label}
              </span>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
