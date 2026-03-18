import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    // 🔥 Direct OpenAI call (no backend needed)
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful AI tutor." },
          { role: "user", content: question },
        ],
      }),
    });

    const data = await res.json();

    return NextResponse.json({
      answer: data.choices[0].message.content,
    });

  } catch (error) {
    return NextResponse.json({ error: "AI failed" }, { status: 500 });
  }
}