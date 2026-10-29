export type ChatMsg = { role: "user" | "assistant"; content: string };

export async function streamAI(
  opts: { system?: string; messages: ChatMsg[]; signal?: AbortSignal },
  onChunk: (fullText: string) => void,
): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system: opts.system, messages: opts.messages }),
    signal: opts.signal,
  });
  if (!res.ok || !res.body) {
    throw new Error((await res.text()) || "The AI request failed.");
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += dec.decode(value, { stream: true });
    onChunk(text);
  }
  if (!text.trim()) throw new Error("The AI returned an empty response. Please try again.");
  return text;
}
