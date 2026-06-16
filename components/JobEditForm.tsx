import { updateJob, deleteJob } from "@/lib/actions/jobs";
import { JOB_STATUSES } from "@/lib/types";
import type { JobApplication } from "@/lib/types";

export default function JobEditForm({ job }: { job: JobApplication }) {
  const action = async (formData: FormData) => {
    "use server";
    await updateJob(job.id, formData);
  };

  const remove = async () => {
    "use server";
    await deleteJob(job.id);
  };

  return (
    <form action={action} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">Company</label>
          <input
            name="company"
            defaultValue={job.company}
            required
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Job Title</label>
          <input
            name="title"
            defaultValue={job.title}
            required
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">Status</label>
          <select
            name="status"
            defaultValue={job.status}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            {JOB_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Date Applied</label>
          <input
            name="applied_date"
            type="date"
            defaultValue={job.applied_date ?? ""}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Application URL</label>
          <input
            name="application_url"
            type="url"
            defaultValue={job.application_url}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">Next Step</label>
        <input
          name="next_step"
          defaultValue={job.next_step}
          placeholder="e.g. Waiting on recruiter, schedule technical screen..."
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">Job Description</label>
        <textarea
          name="job_description"
          defaultValue={job.job_description}
          rows={10}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Save Changes
        </button>
        <button
          formAction={remove}
          className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Delete Application
        </button>
      </div>
    </form>
  );
}
