"use client";

import { useState } from "react";
import { updateResumeContent, deleteResume } from "@/lib/actions/resumes";
import RichTextEditor from "@/components/RichTextEditor";
import type { Resume } from "@/lib/types";

export default function ResumeCard({
  resume,
  jobId,
}: {
  resume: Resume;
  jobId: string;
}) {
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generatePdf() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/resume-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to generate PDF.");
        return;
      }
      setPdfUrl(json.url);
    } finally {
      setGenerating(false);
    }
  }

  const update = async (formData: FormData) => {
    await updateResumeContent(resume.id, jobId, formData);
  };

  const remove = async () => {
    await deleteResume(resume.id, jobId);
  };

  return (
    <div className="rounded-md border border-zinc-200 p-4">
      <form action={update} className="space-y-2">
        <input
          name="title"
          defaultValue={resume.title}
          className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium"
        />
        <RichTextEditor
          name="content"
          defaultValue={resume.content}
          placeholder="Paste or edit your resume content here — links and formatting are preserved."
          minHeight="16rem"
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={generatePdf}
            disabled={generating}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {generating ? "Generating PDF..." : "Generate PDF"}
          </button>
          {(pdfUrl || resume.pdf_path) && (
            <a
              href={pdfUrl ?? `/api/resume-pdf/${resume.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View PDF
            </a>
          )}
          <button
            type="button"
            onClick={remove}
            className="ml-auto text-sm text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
