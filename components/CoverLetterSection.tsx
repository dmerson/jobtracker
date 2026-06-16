"use client";

import { useState } from "react";
import type { CoverLetter } from "@/lib/types";

export default function CoverLetterSection({
  jobId,
  initialCoverLetters,
}: {
  jobId: string;
  initialCoverLetters: CoverLetter[];
}) {
  const [coverLetters, setCoverLetters] = useState(initialCoverLetters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latest = coverLetters[0];

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to generate cover letter.");
        return;
      }
      setCoverLetters((prev) => [json.coverLetter, ...prev]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Cover Letter</h2>
        <button
          onClick={generate}
          disabled={loading}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate with AI"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {latest ? (
        <pre className="mt-4 whitespace-pre-wrap rounded-md bg-zinc-50 p-4 text-sm text-zinc-800">
          {latest.content}
        </pre>
      ) : (
        <p className="mt-3 text-sm text-zinc-500">
          No cover letter yet. Make sure your base profile is filled in, then
          generate one.
        </p>
      )}
    </div>
  );
}
