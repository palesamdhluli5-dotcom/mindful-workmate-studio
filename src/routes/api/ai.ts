import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

const RUN = "X-Lovable-AIG-Run-ID";

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          system?: string;
          messages?: { role: "user" | "assistant"; content: string }[];
        };
        const messages = (body.messages ?? [])
          .filter((m) => typeof m.content === "string" && m.content.trim())
          .slice(-30) as ModelMessage[];
        if (!messages.length) return new Response("No input", { status: 400 });
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("AI is not configured", { status: 401 });

        let runId: string | undefined;
        const openai = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
          fetch: async (input, init) => {
            const h = new Headers(init?.headers);
            if (runId) h.set(RUN, runId);
            const res = await fetch(input, { ...init, headers: h });
            runId ??= res.headers.get(RUN) ?? undefined;
            if (!res.ok) {
              const text = await res.clone().text();
              throw Object.assign(new Error(text || res.statusText), { status: res.status });
            }
            return res;
          },
        });

        try {
          const result = streamText({
            model: openai.responses("openai/gpt-6-astra"),
            system:
              (body.system ?? "You are a helpful workplace productivity assistant.") +
              "\nFormat answers in clean Markdown. Be accurate; flag uncertainty and never invent facts, figures or sources.",
            messages,
            abortSignal: request.signal,
            providerOptions: {
              openai: {
                forceReasoning: true,
                reasoningEffort: "low",
                reasoningSummary: "auto",
                store: false,
                include: ["reasoning.encrypted_content"],
              },
            },
          });
          return result.toTextStreamResponse();
        } catch (e) {
          const status = (e as { status?: number }).status ?? 500;
          return new Response(
            status === 429
              ? "Too many requests — please wait a moment and try again."
              : status === 402
                ? "AI credits have run out. Please add credits to keep using AI features."
                : "The AI request failed. Please try again.",
            { status },
          );
        }
      },
    },
  },
});
