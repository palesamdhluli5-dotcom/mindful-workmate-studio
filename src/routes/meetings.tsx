import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/ToolPage";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer · AI Task Planner" },
      { name: "description", content: "Turn messy meeting notes into summaries, decisions and action items." },
      { property: "og:title", content: "Meeting Notes Summarizer · AI Task Planner" },
      { property: "og:description", content: "Turn messy meeting notes into summaries, decisions and action items." },
    ],
  }),
  component: () => (
    <ToolPage
      title="Meeting Notes Summarizer"
      intro="Paste notes or a transcript. Get decisions, owners and next steps."
      cta="Summarize"
      system="You are a meticulous executive assistant who summarizes meetings faithfully, without adding information that is not in the notes."
      fields={[
        { name: "title", label: "Meeting title", placeholder: "e.g. Q4 marketing sync" },
        { name: "notes", label: "Notes or transcript", type: "textarea", rows: 10, required: true, placeholder: "Paste raw notes here…" },
        { name: "style", label: "Summary style", type: "select", options: ["Executive brief", "Detailed minutes", "Bullet highlights"] },
      ]}
      buildPrompt={(v) => `## Task
Summarize the meeting below in the style: ${v["style"]}.

## Meeting
Title: ${v["title"] || "Untitled"}
Notes:
"""
${v["notes"]}
"""

## Output format
### Summary
### Key decisions
### Action items
| Task | Owner | Due |
### Open questions / risks

## Rules
- Only use information in the notes. Write "Unassigned" or "TBD" when owner/date is missing.`}
    />
  ),
});
