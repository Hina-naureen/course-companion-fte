import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { chapter_id, question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are Aria, a friendly AI tutor for a Generative AI course.
The student is studying chapter: "${chapter_id}".
Answer this question clearly and concisely in 2-3 paragraphs:

${question}`,
        },
      ],
    });

    const answer = (message.content[0] as { type: string; text: string }).text;

    return NextResponse.json({ answer, audio_url: null });
  } catch (error) {
    console.error("Aria error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
