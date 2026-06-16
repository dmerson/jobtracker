import Anthropic from "@anthropic-ai/sdk";
import type { Profile, JobApplication } from "@/lib/types";

const MODEL = "claude-sonnet-4-6";

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// Profile fields are stored as HTML (from the rich text editor).
// Strip tags so Claude receives clean prose, not markup.
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function generateCoverLetter(
  profile: Profile,
  job: JobApplication,
): Promise<string> {
  const client = getClient();

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Write a tailored, concise cover letter (under 400 words) for the job below, written in the voice of the candidate described. Do not invent experience the candidate doesn't have.

Output ONLY valid HTML using these tags: <p>, <strong>, <em>. No <html>, <body>, <head>, or markdown — just the letter body as HTML paragraphs, ready to render in a rich text editor.

CANDIDATE NAME: ${profile.full_name}
CANDIDATE SUMMARY: ${stripHtml(profile.summary)}
CANDIDATE SKILLS: ${stripHtml(profile.skills)}
CANDIDATE RESUME:
${stripHtml(profile.base_resume_content)}

JOB TITLE: ${job.title}
COMPANY: ${job.company}
JOB DESCRIPTION:
${job.job_description}`,
      },
    ],
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

export async function suggestResumeEdits(
  profile: Profile,
  job: JobApplication,
): Promise<string> {
  const client = getClient();

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Rewrite the resume below, tailored to the target job. Keep it truthful — reorder, re-emphasize, and rephrase existing content to match the job description, but do not fabricate experience, skills, or accomplishments not present in the original.

Output ONLY valid HTML using these tags: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <a href="...">. No <html>, <body>, <head>, or markdown — just the resume body as HTML, ready to load into a rich text editor.

ORIGINAL RESUME:
${stripHtml(profile.base_resume_content)}

CANDIDATE SKILLS: ${stripHtml(profile.skills)}

TARGET JOB TITLE: ${job.title}
TARGET COMPANY: ${job.company}
TARGET JOB DESCRIPTION:
${job.job_description}`,
      },
    ],
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}
