import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Eye, Loader2, Pencil, Square, Wand2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Disclaimer } from "@/components/AppShell";
import { streamAI } from "@/lib/ai-client";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select";
  options?: string[];
  placeholder?: string;
  required?: boolean;
  rows?: number;
};

export function ToolPage(props: {
  title: string;
  intro: string;
  fields: Field[];
  system: string;
  buildPrompt: (v: Record<string, string>) => string;
  cta: string;
}) {
  const init = Object.fromEntries(props.fields.map((f) => [f.name, f.options?.[0] ?? ""]));
  const [values, setValues] = useState<Record<string, string>>(init);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const abort = useRef<AbortController | null>(null);

  const prompt = props.buildPrompt(values);
  const missing = props.fields.some((f) => f.required && !values[f.name]?.trim());

  async function run() {
    abort.current = new AbortController();
    setLoading(true);
    setEditing(false);
    setOutput("");
    try {
      await streamAI(
        { system: props.system, messages: [{ role: "user", content: prompt }], signal: abort.current.signal },
        setOutput,
      );
    } catch (e) {
      if ((e as Error).name !== "AbortError") toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{props.title}</h1>
        <p className="mt-1 text-muted-foreground">{props.intro}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section className="space-y-4 rounded-xl border bg-card p-5 shadow-soft">
          {props.fields.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <Label htmlFor={f.name}>
                {f.label} {f.required && <span className="text-accent">*</span>}
              </Label>
              {f.type === "textarea" ? (
                <Textarea id={f.name} rows={f.rows ?? 5} placeholder={f.placeholder} value={values[f.name]}
                  onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
              ) : f.type === "select" ? (
                <select id={f.name} value={values[f.name]}
                  onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {f.options!.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <Input id={f.name} placeholder={f.placeholder} value={values[f.name]}
                  onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
              )}
            </div>
          ))}
          <div className="flex flex-wrap gap-2 pt-1">
            {loading ? (
              <Button variant="outline" onClick={() => abort.current?.abort()}><Square /> Stop</Button>
            ) : (
              <Button onClick={run} disabled={missing}><Wand2 /> {props.cta}</Button>
            )}
            <Button variant="ghost" onClick={() => setShowPrompt((s) => !s)}>
              <Eye /> {showPrompt ? "Hide" : "View"} prompt
            </Button>
          </div>
          {showPrompt && (
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-xs text-muted-foreground">{prompt}</pre>
          )}
          <Disclaimer />
        </section>

        <section className="flex min-h-[420px] flex-col rounded-xl border bg-card shadow-soft">
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <span className="text-sm font-medium">
              Output {loading && <Loader2 className="ml-1 inline size-3.5 animate-spin" />}
            </span>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" disabled={!output || loading} onClick={() => setEditing((e) => !e)}>
                {editing ? <><Eye /> Preview</> : <><Pencil /> Edit</>}
              </Button>
              <Button size="sm" variant="ghost" disabled={!output || loading} onClick={run}><RotateCcw /> Redo</Button>
              <Button size="sm" variant="ghost" disabled={!output}
                onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }}>
                <Copy /> Copy
              </Button>
            </div>
          </div>
          {editing ? (
            <Textarea className="flex-1 resize-none rounded-none border-0 p-4 font-mono text-sm focus-visible:ring-0"
              value={output} onChange={(e) => setOutput(e.target.value)} />
          ) : output ? (
            <div className="prose-output flex-1 overflow-auto p-5"><ReactMarkdown>{output}</ReactMarkdown></div>
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center text-sm text-muted-foreground">
              Fill in the details and click “{props.cta}”. You can edit the result afterwards.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
