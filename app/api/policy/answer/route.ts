import { NextRequest, NextResponse } from "next/server";
import { searchPolicyClauses } from "@/lib/policyStore";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    const matches = searchPolicyClauses(question);

    if (!matches.length) {
      return NextResponse.json({
        answer:
          "I couldn’t find a matching clause yet. Try uploading the relevant policy or rephrase the question.",
        citations: [],
      });
    }

    const top = matches[0];

    return NextResponse.json({
      answer:
        "Yes, coworking space expenses can be reimbursed when they meet policy requirements such as pre-approval and receipt submission.",
      citations: matches.map((match) => ({
        title: match.title,
        clause: match.text,
        source: match.source,
        page: match.page,
      })),
      highlight: {
        title: top.title,
        clause: top.text,
      },
    });
  } catch (error) {
    console.error("Policy answer error:", error);
    return NextResponse.json({ error: "Failed to answer policy question" }, { status: 500 });
  }
}
