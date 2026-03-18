import { NextResponse } from "next/server";

// Server-side proxy → Render backend. Browser never calls Render directly so
// no CORS headers are required on the backend.
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(
      "https://course-companion-backend.onrender.com/api/v1/ai/tutor",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}