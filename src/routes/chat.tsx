import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUp, Compass, Pencil, Square, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Disclaimer } from "@/components/AppShell";
import { streamAI, type ChatMsg } from "@/lib/ai-client";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot · AI Task Planner" },
      { name: "description", content: "Chat with an AI productivity assistant about any work task." },
      { property: "og:title", content: "AI Chatbot · AI Task Planner" },
      { property: "og:description", content: "Chat with an AI productivity assistant about any work task." },
    ],
  }),
  component: Chat,
});

const SYSTEM =
  "You are a friendly, expert workplace productivity assistant. Help with writing, planning, analysis and problem-solving. Ask a clarifying question when the request is ambiguous. Keep answers practical and well-structured.";
const SUGGESTIONS = [
  "Help me prioritise my week",
  "Write a polite reminder to a colleague",
  "Explain OKRs in simple terms",
  "Give me an agenda for a 30-min kickoff",
];

function Chat() {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const abort = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [msgs]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const history: ChatMsg[] = [...msgs, { role: "user", content: text }];
    setMsgs([...history, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);
    abort.current = new AbortController();
    try {
      await streamAI({ system: SYSTEM, messages: history, signal: abort.current.signal }, (t) =>
        setMsgs([...history, { role: "assistant", content: t }]),
      );
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        toast.error((e as Error).message);
        setMsgs(history);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold tracking-tight">AI Chatbot</h1>
        {msgs.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setMsgs([])} disabled={loading}><Trash2 /> Clear</Button>
        )}
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto rounded-xl border bg-card p-4 shadow-soft">
        {msgs.length === 0 && (
          <div className="grid h-full place-items-center text-center">
            <div>
              <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-primary text-primary-foreground"><Compass /></span>
              <p className="text-muted-foreground">How can I help you get work done today?</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <Button key={s} variant="outline" size="sm" onClick={() => send(s)}>{s}</Button>
                ))}
              </div>
            </div>
          </div>
        )}
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.content}</div>
            </div>
          ) : (
            <div key={i} className="group flex gap-3">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground"><Compass className="size-3.5" /></span>
              <div className="min-w-0 flex-1">
                {editIdx === i ? (
                  <Textarea rows={8} value={m.content} className="text-sm"
                    onChange={(e) => setMsgs(msgs.map((x, j) => (j === i ? { ...x, content: e.target.value } : x)))} />
                ) : (
                  <div className="prose-output">
                    {m.content ? <ReactMarkdown>{m.content}</ReactMarkdown> : <span className="text-sm text-muted-foreground">Thinking…</span>}
                  </div>
                )}
                {m.content && !(loading && i === msgs.length - 1) && (
                  <Button size="sm" variant="ghost" className="mt-1 h-7 text-xs opacity-70"
                    onClick={() => setEditIdx(editIdx === i ? null : i)}>
                    {editIdx === i ? <><Check /> Done</> : <><Pencil /> Edit</>}
                  </Button>
                )}
              </div>
            </div>
          ),
        )}
        <div ref={end} />
      </div>
      <form className="mt-3 flex items-end gap-2 rounded-xl border bg-card p-2 shadow-soft"
        onSubmit={(e) => { e.preventDefault(); send(input); }}>
        <Textarea rows={1} value={input} placeholder="Message the assistant…"
          className="max-h-40 min-h-10 resize-none border-0 shadow-none focus-visible:ring-0"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} />
        {loading ? (
          <Button type="button" size="icon" variant="outline" onClick={() => abort.current?.abort()}><Square /></Button>
        ) : (
          <Button type="submit" size="icon" disabled={!input.trim()}><ArrowUp /></Button>
        )}
      </form>
      <div className="mt-3"><Disclaimer /></div>
    </div>
  );
}
