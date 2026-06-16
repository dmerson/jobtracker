import Anthropic from "@anthropic-ai/sdk";
import type { Profile, JobApplication } from "@/lib/types";

const MODEL = "claude-sonnet-4-6";

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
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
        content: `Write a tailored, concise cover letter (under 400 words) for the job below, written in the voice of the candidate described. Do not invent experience the candidate doesn't have. Output only the letter text, no preamble.

CANDIDATE NAME: ${profile.full_name}
CANDIDATE SUMMARY: ${profile.summary}
CANDIDATE SKILLS: ${profile.skills}
CANDIDATE RESUME:
${profile.base_resume_content}

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
        content: `Rewrite the resume below, tailored to the target job. Keep it truthful — reorder, re-emphasize, and rephrase existing content to match the job description, but do not fabricate experience, skills, or accomplishments not present in the original. Output the full tailored resume as plain text, ready to use.

ORIGINAL RESUME:
${profile.base_resume_content}

CANDIDATE SKILLS: ${profile.skills}

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
