import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { z } from "zod";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

export const runtime = "nodejs";

const ClauseSchema = z.object({
  clauses: z.array(
    z.object({
      text: z.string().min(10),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((item) => item instanceof File) as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const limitedFiles = files.slice(0, 2);
    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
    const documents: Array<{ name: string; context: string }> = [];

    for (const file of limitedFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      let extractedText = "";

      try {
        const parsed = await pdfParse(buffer);
        extractedText = parsed.text ?? "";
      } catch (error) {
        console.warn("PDF text extraction failed", error);
      }

      const trimmedText = extractedText.replace(/\s+/g, " ").trim().slice(0, 4000);
      let clauses: string[] = [];

      if (hasOpenAI && trimmedText.length > 50) {
        try {
          const result = await generateObject({
            model: openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini"),
            schema: ClauseSchema,
            system:
              "You are an HR policy analyst. Extract concise policy clauses from the provided text. Return exact wording when possible.",
            prompt: `Extract 3-5 key clauses from this document. Return JSON with clauses[].text only.\n\nDocument text:\n${trimmedText}`,
          });
          clauses = result.object.clauses.map((clause) => clause.text).slice(0, 5);
        } catch (error) {
          console.warn("AI clause extraction failed", error);
        }
      }

      const context = clauses.length
        ? clauses.map((clause) => `- ${clause} (${file.name})`).join("\n")
        : trimmedText.slice(0, 800);

      documents.push({ name: file.name, context });
    }

    return NextResponse.json({
      documents,
      combinedContext: documents.map((doc) => doc.context).join("\n"),
    });
  } catch (error) {
    console.error("Prepare docs error:", error);
    return NextResponse.json({ error: "Failed to prepare document context" }, { status: 500 });
  }
}
