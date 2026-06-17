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
    <div className="li-card">
      <p className="li-section-title">Application Details</p>
      <form action={action} className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="li-label">Company</label>
            <input name="company" defaultValue={job.company} required className="li-input" />
          </div>
          <div>
            <label className="li-label">Job Title</label>
            <input name="title" defaultValue={job.title} required className="li-input" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="li-label">Status</label>
            <select name="status" defaultValue={job.status} className="li-input">
              {JOB_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="li-label">Date Applied</label>
            <input name="applied_date" type="date" defaultValue={job.applied_date ?? ""} className="li-input" />
          </div>
          <div>
            <label className="li-label">Application URL</label>
            <input name="application_url" type="url" defaultValue={job.application_url} className="li-input" />
          </div>
        </div>

        <div>
          <label className="li-label">Next Step</label>
          <input
            name="next_step"
            defaultValue={job.next_step}
            placeholder="e.g. Waiting on recruiter, schedule technical screen..."
            className="li-input"
          />
        </div>

        <div>
          <label className="li-label">Job Description</label>
          <textarea
            name="job_description"
            defaultValue={job.job_description}
            rows={10}
            className="li-input resize-y"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button type="submit" className="li-btn li-btn-primary">
            Save Changes
          </button>
          <button formAction={remove} className="li-btn text-xs px-3 py-1.5 text-red-600 border border-red-300 hover:bg-red-50 rounded-full font-semibold">
            Delete Application
          </button>
        </div>
      </form>
    </div>
  );
}
