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
    <div className="rounded-lg border border-black/10 bg-[#F3F2EF] p-4">
      <form action={update} className="space-y-3">
        <input
          name="title"
          defaultValue={resume.title}
          className="li-input bg-white font-semibold"
        />
        <RichTextEditor
          name="content"
          defaultValue={resume.content}
          placeholder="Paste or edit your resume content here — links and formatting are preserved."
          minHeight="16rem"
        />
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button type="submit" className="li-btn li-btn-secondary text-xs px-3 py-1">
            Save
          </button>
          <button
            type="button"
            onClick={generatePdf}
            disabled={generating}
            className="li-btn li-btn-primary text-xs px-3 py-1 disabled:opacity-50"
          >
            {generating ? "Generating PDF…" : "Generate PDF"}
          </button>
          {(pdfUrl || resume.pdf_path) && (
            <a
              href={pdfUrl ?? `/api/resume-pdf/${resume.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#0A66C2] hover:underline"
            >
              View PDF ↗
            </a>
          )}
          <button
            type="button"
            onClick={remove}
            className="ml-auto text-xs text-red-500 hover:text-red-700 hover:underline font-medium"
          >
            Delete
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
