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
    <div className="li-card">
      <div className="flex items-center justify-between li-section-title">
        <span>Cover Letter</span>
        <button
          onClick={generate}
          disabled={loading}
          className="li-btn li-btn-primary text-xs px-3 py-1"
        >
          {loading ? "Generating…" : latest ? "Regenerate with AI" : "Generate with AI"}
        </button>
      </div>

      <div className="p-4">
        {error && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        {latest ? (
          <div
            className="prose prose-sm max-w-none rounded-lg bg-[#F3F2EF] p-4 text-black/80"
            dangerouslySetInnerHTML={{ __html: latest.content }}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-black/20 p-6 text-center">
            <p className="text-sm text-black/40">
              No cover letter yet. Fill in your base profile, then click{" "}
              <span className="font-medium text-[#0A66C2]">Generate with AI</span>.
            </p>
          </div>
        )}

        {coverLetters.length > 1 && (
          <p className="mt-2 text-xs text-black/40">
            Showing most recent of {coverLetters.length} generated versions.
          </p>
        )}
      </div>
    </div>
  );
}
