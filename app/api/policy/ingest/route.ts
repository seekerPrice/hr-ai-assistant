import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import pdfParse from "pdf-parse";
import { z } from "zod";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { ingestPolicyDocuments, PolicyDocument } from "@/lib/policyStore";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((item) => item instanceof File) as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const limitedFiles = files.slice(0, 2);
    const ingestedDocs: PolicyDocument[] = [];

    const clauseSchema = z.object({
      clauses: z.array(
        z.object({
          text: z.string().min(10),
        })
      ),
    });

    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

    for (const file of limitedFiles) {
      const arrayBuffer = await file.arrayBuffer();
      let pageCount = 0;
      let extractedText = "";

      try {
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        pageCount = pdfDoc.getPageCount();
      } catch (error) {
        console.warn("PDF parse failed", error);
      }

      try {
        const parsed = await pdfParse(Buffer.from(arrayBuffer));
        extractedText = parsed.text ?? "";
      } catch (error) {
        console.warn("PDF text extraction failed", error);
      }

      const trimmedText = extractedText.replace(/\s+/g, " ").trim().slice(0, 4000);
      let aiClauses: string[] = [];

      if (hasOpenAI && trimmedText.length > 50) {
        try {
          const result = await generateObject({
            model: openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini"),
            schema: clauseSchema,
            system:
              "You are an HR policy analyst. Extract concise policy clauses from the provided text. Return exact wording when possible.",
            prompt: `Extract 3-5 key clauses from this policy text. Return JSON with clauses[].text only.\n\nPolicy text:\n${trimmedText}`,
          });
          aiClauses = result.object.clauses.map((clause) => clause.text).slice(0, 5);
        } catch (error) {
          console.warn("AI clause extraction failed", error);
        }
      }

      const fallbackClauses = [
        "Policy uploaded. Full clause extraction pending. Update ingestion pipeline to chunk text for embeddings.",
      ];

      const clausesToStore = (aiClauses.length ? aiClauses : fallbackClauses).map(
        (text, index) => ({
          id: `clause-${index + 1}`,
          text,
          source: `${file.name} · Uploaded PDF`,
          page: pageCount || undefined,
        })
      );

      ingestedDocs.push({
        id: file.name.toLowerCase().replace(/\s+/g, "-") + "-policy",
        title: file.name.replace(/\.pdf$/i, ""),
        clauses: clausesToStore,
      });
    }

    ingestPolicyDocuments(ingestedDocs);

    return NextResponse.json({
      status: "ingested",
      count: ingestedDocs.length,
      documents: ingestedDocs.map((doc) => ({
        id: doc.id,
        title: doc.title,
        clauses: doc.clauses.map((clause) => ({
          text: clause.text,
          source: clause.source,
          page: clause.page,
        })),
      })),
      storage: process.env.PINECONE_HOST ? "pinecone-ready" : "memory",
    });
  } catch (error) {
    console.error("Policy ingest error:", error);
    return NextResponse.json({ error: "Failed to ingest policies" }, { status: 500 });
  }
}
