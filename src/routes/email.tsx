import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/ToolPage";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator · AI Task Planner" },
      { name: "description", content: "Draft clear, professional workplace emails with AI in seconds." },
      { property: "og:title", content: "Smart Email Generator · AI Task Planner" },
      { property: "og:description", content: "Draft clear, professional workplace emails with AI in seconds." },
    ],
  }),
  component: () => (
    <ToolPage
      title="Smart Email Generator"
      intro="Describe what you need to say — get a polished, ready-to-edit email."
      cta="Generate email"
      system="You are an expert business communication writer. You write concise, clear, culturally sensitive workplace emails."
      fields={[
        { name: "purpose", label: "Purpose / key points", type: "textarea", required: true, placeholder: "e.g. Follow up with client about delayed invoice, propose a call next week" },
        { name: "recipient", label: "Recipient", placeholder: "e.g. Client – Thandi, Finance Manager" },
        { name: "tone", label: "Tone", type: "select", options: ["Professional", "Friendly", "Formal", "Persuasive", "Apologetic", "Concise"] },
        { name: "length", label: "Length", type: "select", options: ["Short", "Medium", "Detailed"] },
      ]}
      buildPrompt={(v) => `## Task
Write a workplace email.

## Context
- Recipient: ${v.recipient || "not specified"}
- Tone: ${v.tone}
- Length: ${v.length}
- Purpose and key points:
${v.purpose}

## Output format
**Subject:** <subject line>

<email body with greeting, clear paragraphs, a specific call to action, and sign-off using [Your Name]>

## Rules
- Do not invent facts, dates or numbers; use [placeholders] for unknowns.`}
    />
  ),
});
