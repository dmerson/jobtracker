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
    <div className="rounded-lg border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Interview Notes</h2>

      <div className="mt-4 space-y-3">
        {interviews.length === 0 && (
          <p className="text-sm text-zinc-500">No interviews logged yet.</p>
        )}
        {interviews.map((interview) => {
          const remove = async () => {
            "use server";
            await deleteInterview(jobId, interview.id);
          };
          return (
            <div
              key={interview.id}
              className="rounded-md border border-zinc-200 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-900">
                  {interview.round_type || "Interview"}
                  {interview.interview_date && (
                    <span className="ml-2 text-zinc-500">
                      {interview.interview_date}
                    </span>
                  )}
                </p>
                <form action={remove}>
                  <button className="text-xs text-red-600 hover:underline">
                    Delete
                  </button>
                </form>
              </div>
              {interview.interviewers && (
                <p className="mt-1 text-sm text-zinc-600">
                  With: {interview.interviewers}
                </p>
              )}
              {interview.notes && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">
                  {interview.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <form action={add} className="mt-4 space-y-3 border-t border-zinc-200 pt-4">
        <div className="grid grid-cols-3 gap-3">
          <input
            name="round_type"
            placeholder="Round (e.g. Phone Screen)"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="interview_date"
            type="date"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="interviewers"
            placeholder="Interviewer(s)"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <textarea
          name="notes"
          rows={3}
          placeholder="Notes..."
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Add Interview
        </button>
      </form>
    </div>
  );
}
