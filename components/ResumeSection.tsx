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
    <div className="rounded-lg border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Resume</h2>
        <div className="flex gap-2">
          <button
            onClick={copyBase}
            disabled={loading !== null}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            {loading === "copy" ? "Copying..." : "Copy Base Resume"}
          </button>
          <button
            onClick={generateWithAi}
            disabled={loading !== null}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {loading === "ai" ? "Generating..." : "Tailor with AI"}
          </button>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 space-y-4">
        {resumes.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No resume for this job yet. Copy your base resume or generate a
            tailored one with AI to get started.
          </p>
        ) : (
          resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} jobId={jobId} />
          ))
        )}
      </div>
    </div>
  );
}
