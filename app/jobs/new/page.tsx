import { createJob } from "@/lib/actions/jobs";

export default function NewJobPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <div className="li-card">
        <p className="li-section-title">New Application</p>
        <form action={createJob} className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="li-label">Company</label>
              <input name="company" required className="li-input" />
            </div>
            <div>
              <label className="li-label">Job Title</label>
              <input name="title" required className="li-input" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="li-label">Application URL</label>
              <input name="application_url" type="url" placeholder="https://..." className="li-input" />
            </div>
            <div>
              <label className="li-label">Date Applied</label>
              <input name="applied_date" type="date" className="li-input" />
            </div>
          </div>

          <div>
            <label className="li-label">Job Description</label>
            <textarea
              name="job_description"
              rows={12}
              className="li-input resize-y"
              placeholder="Paste the full job description here…"
            />
          </div>

          <button type="submit" className="li-btn li-btn-primary py-2">
            Create Application
          </button>
        </form>
      </div>
    </div>
  );
}
