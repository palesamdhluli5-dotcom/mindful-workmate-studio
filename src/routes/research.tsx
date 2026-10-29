import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/ToolPage";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant · AI Task Planner" },
      { name: "description", content: "Get structured research briefings on any workplace topic." },
      { property: "og:title", content: "AI Research Assistant · AI Task Planner" },
      { property: "og:description", content: "Get structured research briefings on any workplace topic." },
    ],
  }),
  component: () => (
    <ToolPage
      title="AI Research Assistant"
      intro="Ask a research question — get a structured, balanced briefing."
      cta="Research"
      system="You are a careful research analyst. You present balanced perspectives, distinguish established facts from opinion, and clearly state the limits of your knowledge. You do not fabricate citations."
      fields={[
        { name: "topic", label: "Research question", type: "textarea", rows: 4, required: true, placeholder: "e.g. What are best practices for hybrid work policies in mid-sized companies?" },
        { name: "audience", label: "Audience", placeholder: "e.g. HR leadership team" },
        { name: "depth", label: "Depth", type: "select", options: ["Quick overview", "Standard briefing", "Deep dive"] },
      ]}
      buildPrompt={(v) => `## Task
Produce a ${(v["depth"] ?? "").toLowerCase()} on the question below for: ${v["audience"] || "a general professional audience"}.

## Question
${v["topic"]}

## Output format
### TL;DR
### Key findings
### Perspectives & trade-offs
### Recommendations
### What to verify
List claims that should be checked against current, authoritative sources, and suggest types of sources to consult.

## Rules
- Do not invent statistics, quotes or URLs. Mark uncertain points as such. Note your knowledge may be out of date.`}
    />
  ),
});
