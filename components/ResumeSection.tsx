"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createResumeFromBase } from "@/lib/actions/resumes";
import ResumeCard from "@/components/ResumeCard";
import type { Resume } from "@/lib/types";

export default function ResumeSection({
  jobId,
  resumes,
}: {
  jobId: string;
  resumes: Resume[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"copy" | "ai" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function copyBase() {
    setLoading("copy");
    setError(null);
    try {
      await createResumeFromBase(jobId);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to copy base resume.");
    } finally {
      setLoading(null);
    }
  }

  async function generateWithAi() {
    setLoading("ai");
    setError(null);
    try {
      const res = await fetch("/api/resume-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to generate tailored resume.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="li-card">
      <div className="flex items-center justify-between li-section-title">
        <span>Resume</span>
        <div className="flex gap-2">
          <button
            onClick={copyBase}
            disabled={loading !== null}
            className="li-btn li-btn-secondary text-xs px-3 py-1 disabled:opacity-50"
          >
            {loading === "copy" ? "Copying…" : "Copy Base Resume"}
          </button>
          <button
            onClick={generateWithAi}
            disabled={loading !== null}
            className="li-btn li-btn-primary text-xs px-3 py-1 disabled:opacity-50"
          >
            {loading === "ai" ? "Generating…" : "Tailor with AI"}
          </button>
        </div>
      </div>

      <div className="p-4">
        {error && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        {resumes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-black/20 p-6 text-center">
            <p className="text-sm text-black/40">
              No resume for this job yet. Copy your base resume to edit manually, or{" "}
              <span className="font-medium text-[#0A66C2]">Tailor with AI</span> to generate one automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} jobId={jobId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
