import { NextResponse } from "next/server";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

// Prototype inbox: appends inquiries to data/inquiries.jsonl.
// Swap for an email service (Resend, SendGrid) or CRM webhook before launch.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();
  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const record = {
    receivedAt: new Date().toISOString(),
    name,
    email,
    phone: String(body.phone || "").trim() || null,
    interest: String(body.interest || "").trim() || null,
    message,
  };

  const dir = path.join(process.cwd(), "data");
  await mkdir(dir, { recursive: true });
  await appendFile(path.join(dir, "inquiries.jsonl"), JSON.stringify(record) + "\n");
  console.log("[contact] inquiry received:", record.name, record.email);

  return NextResponse.json({ ok: true });
}
