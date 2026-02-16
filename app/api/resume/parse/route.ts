import { NextResponse } from "next/server";
import { getDb } from "@/utils/mongodb";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("resume") as File;
  const sessionId = formData.get("sessionId") as string;

  if (!file || !sessionId) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const pdfParse = require("pdf-parse/lib/pdf-parse.js");
  const data = await pdfParse(buffer);

  const db = await getDb();
  await db.collection("resumes").insertOne({
    sessionId,
    text: data.text,
    createdAt: new Date(),
  });

  return NextResponse.json({ text: data.text });
}