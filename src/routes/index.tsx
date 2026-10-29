import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Pencil, Layers } from "lucide-react";
import { tools, Disclaimer } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Task Planner · Productivity Assistant" },
      { name: "description", content: "Automate workplace tasks with AI: emails, meeting summaries, task plans, research and chat." },
      { property: "og:title", content: "AI Task Planner · Productivity Assistant" },
      { property: "og:description", content: "Automate workplace tasks with AI: emails, meeting summaries, task plans, research and chat." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-hero p-8 text-primary-foreground shadow-soft md:p-12">
        <p className="text-sm uppercase tracking-[0.2em] opacity-70">Productivity Assistant</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight md:text-5xl">
          Hand off the busywork. Keep the judgement.
        </h1>
        <p className="mt-4 max-w-xl opacity-80">
          Five AI tools for the everyday work of professionals — every result is editable, and you stay in control.
        </p>
        <Link to="/planner" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90">
          Plan my week <ArrowRight className="size-4" />
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <Link key={t.url} to={t.url}
            className="group rounded-xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40">
            <span className="grid size-10 place-items-center rounded-lg bg-secondary text-primary"><t.icon className="size-5" /></span>
            <h2 className="mt-4 font-display text-lg font-semibold">{t.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Layers, t: "Structured prompts", d: "Each tool turns your input into a clear, consistent prompt you can inspect." },
          { icon: Pencil, t: "Editable outputs", d: "Refine any result in place before copying it into your work." },
          { icon: ShieldCheck, t: "Responsible by design", d: "Tools avoid invented facts and flag what needs checking." },
        ].map((f) => (
          <div key={f.t} className="flex gap-3 rounded-xl border bg-card p-4">
            <f.icon className="mt-0.5 size-5 shrink-0 text-accent" />
            <div><h3 className="font-semibold">{f.t}</h3><p className="text-sm text-muted-foreground">{f.d}</p></div>
          </div>
        ))}
      </section>
      <Disclaimer />
    </div>
  );
}
