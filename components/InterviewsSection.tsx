import { addInterview, deleteInterview } from "@/lib/actions/interviews";
import type { Interview } from "@/lib/types";

export default function InterviewsSection({
  jobId,
  interviews,
}: {
  jobId: string;
  interviews: Interview[];
}) {
  const add = async (formData: FormData) => {
    "use server";
    await addInterview(jobId, formData);
  };

  return (
    <div className="li-card">
      <p className="li-section-title">Interview Notes</p>

      <div className="p-4">
        {interviews.length === 0 && (
          <p className="text-sm text-black/40">No interviews logged yet.</p>
        )}

        <div className="space-y-3">
          {interviews.map((interview) => {
            const remove = async () => {
              "use server";
              await deleteInterview(jobId, interview.id);
            };
            return (
              <div key={interview.id} className="rounded-lg border border-black/10 bg-[#F3F2EF] p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-black/90">
                      {interview.round_type || "Interview"}
                      {interview.interview_date && (
                        <span className="ml-2 font-normal text-black/50">
                          {new Date(interview.interview_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                    </p>
                    {interview.interviewers && (
                      <p className="mt-0.5 text-xs text-black/50">With: {interview.interviewers}</p>
                    )}
                  </div>
                  <form action={remove}>
                    <button className="text-xs text-red-500 hover:text-red-700 hover:underline">Remove</button>
                  </form>
                </div>
                {interview.notes && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-black/75">{interview.notes}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Add form */}
        <form action={add} className="mt-4 space-y-3 border-t border-black/[.06] pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/40">Log an interview</p>
          <div className="grid grid-cols-3 gap-3">
            <input name="round_type" placeholder="Round (e.g. Phone Screen)" className="li-input" />
            <input name="interview_date" type="date" className="li-input" />
            <input name="interviewers" placeholder="Interviewer(s)" className="li-input" />
          </div>
          <textarea name="notes" rows={3} placeholder="Notes..." className="li-input resize-y" />
          <button type="submit" className="li-btn li-btn-secondary">
            Add Interview
          </button>
        </form>
      </div>
    </div>
  );
}
