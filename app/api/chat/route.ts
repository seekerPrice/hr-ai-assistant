import { NextResponse } from "next/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, model, temperature, maxTokens, policyContext, documentContext } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "messages must be an array" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "OpenAI is not configured yet. Add OPENAI_API_KEY to enable live responses.",
        },
        { status: 400 }
      );
    }

    const baseSystem =
      "You are Vera, an HR operations assistant. Provide concise, actionable responses and ask clarifying questions when needed.";
    const policyBlock = policyContext
      ? `\n\nPolicy context (cite when relevant):\n${policyContext}`
      : "";
    const documentBlock = documentContext
      ? `\n\nAttached document context (cite when relevant):\n${documentContext}`
      : "";
    const system = `${baseSystem}${policyBlock}${documentBlock}`;

    const result = await streamText({
      model: openai(model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini"),
      system,
      messages,
      temperature: typeof temperature === "number" ? temperature : 0.2,
      maxTokens: typeof maxTokens === "number" ? maxTokens : 400,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("OpenAI error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", service: "chat" });
}
