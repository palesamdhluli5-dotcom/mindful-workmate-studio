import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/ToolPage";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner · Prioritised work plans" },
      { name: "description", content: "Break goals into prioritised, time-boxed tasks with an AI planner." },
      { property: "og:title", content: "AI Task Planner · Prioritised work plans" },
      { property: "og:description", content: "Break goals into prioritised, time-boxed tasks with an AI planner." },
    ],
  }),
  component: () => (
    <ToolPage
      title="AI Task Planner"
      intro="List your goals and constraints — get a realistic, prioritised plan."
      cta="Build plan"
      system="You are a pragmatic productivity coach skilled in prioritisation (Eisenhower matrix, time-blocking) and realistic estimation."
      fields={[
        { name: "goals", label: "Goals and tasks", type: "textarea", rows: 7, required: true, placeholder: "e.g. Finish client proposal, prepare board deck, hire a designer…" },
        { name: "timeframe", label: "Timeframe", type: "select", options: ["Today", "This week", "Next 2 weeks", "This month"] },
        { name: "hours", label: "Available hours per day", placeholder: "e.g. 6" },
        { name: "constraints", label: "Deadlines & constraints", type: "textarea", rows: 3, placeholder: "e.g. Proposal due Friday, meetings every morning 9–10" },
      ]}
      buildPrompt={(v) => `## Task
Create a prioritised work plan for: ${v["timeframe"]}.

## Inputs
- Goals/tasks:
${v["goals"]}
- Available hours per day: ${v["hours"] || "not specified (assume 6)"}
- Deadlines & constraints: ${v["constraints"] || "none given"}

## Output format
### Priorities
| # | Task | Priority (High/Med/Low) | Est. time | Deadline |
### Schedule
Day-by-day time blocks.
### Quick wins
### Risks & tips

## Rules
- Keep total planned time within available hours. Break big tasks into subtasks.`}
    />
  ),
});
