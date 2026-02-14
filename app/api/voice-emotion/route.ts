import { NextResponse } from "next/server";
import { logVoiceEmotion } from "@/lib/interview-logger";

interface VoiceItem {
  ts: number;
  label: string;
  confidence: number;
  rms?: number;
  zcr?: number;
}

function computeVoiceMetrics(batch: VoiceItem[]) {
  const counts: Record<string, number> = {};
  let total = 0;
  let totalConf = 0;
  let energySum = 0;

  for (const item of batch) {
    const label = item.label || "unknown";
    const conf = Number(item.confidence || 0);
    counts[label] = (counts[label] || 0) + 1;
    total += 1;
    totalConf += conf;
    if (typeof item.rms === "number") {
      energySum += item.rms;
    }
  }

  const percentages: Record<string, number> = {};
  for (const k of Object.keys(counts)) {
    percentages[k] = (counts[k] / total) * 100;
  }

  const meanConfidence = total ? totalConf / total : 0;
  const meanRms = total ? energySum / total : 0;

  let energyScore = 50;
  if (meanRms < 0.02) {
    energyScore = 60;
  } else if (meanRms < 0.05) {
    energyScore = 75;
  } else {
    energyScore = 85;
  }

  const tensePct = percentages["tense"] || 0;
  const energeticPct = percentages["energetic"] || 0;
  const calmPct = percentages["calm"] || 0;

  let stabilityScore = 80;
  if (tensePct > 40) stabilityScore -= 20;
  if (energeticPct > 70) stabilityScore -= 10;
  if (calmPct < 10) stabilityScore -= 5;
  stabilityScore = Math.max(0, Math.min(100, stabilityScore));

  let dominantTone: string | null = null;
  for (const k of Object.keys(counts)) {
    if (!dominantTone || counts[k] > counts[dominantTone]) {
      dominantTone = k;
    }
  }

  return {
    counts,
    percentages,
    meanConfidence,
    meanRms,
    energyScore,
    stabilityScore,
    dominantTone,
  };
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    if (!payload || !Array.isArray(payload.batch)) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const batch: VoiceItem[] = payload.batch.map(
      (b: Record<string, unknown>) => ({
        ts: Number(b.ts) || Date.now() / 1000,
        label: String(b.label || "unknown"),
        confidence: Number(b.confidence || 0),
        rms: typeof b.rms === "number" ? b.rms : undefined,
        zcr: typeof b.zcr === "number" ? b.zcr : undefined,
      })
    );

    if (!batch.length) {
      return NextResponse.json(
        { ok: false, error: "Empty batch" },
        { status: 400 }
      );
    }

    const metrics = computeVoiceMetrics(batch);

    const userId: string | undefined = payload.userId || undefined;
    const sessionId: string | undefined = payload.sessionId || undefined;

    // Log to MongoDB
    try {
      await logVoiceEmotion({
        userId,
        sessionId,
        emotions: batch.map((b) => ({
          label: b.label,
          confidence: b.confidence,
          ts: b.ts,
        })),
        audioMetadata: {
          dominantTone: metrics.dominantTone,
          energyScore: metrics.energyScore,
          stabilityScore: metrics.stabilityScore,
          meanConfidence: metrics.meanConfidence,
          meanRms: metrics.meanRms,
          tonePercentages: metrics.percentages,
        },
      });
    } catch (logErr) {
      console.error("MongoDB voice emotion log error:", logErr);
    }

    return NextResponse.json({
      ok: true,
      received: batch.length,
      metrics,
    });
  } catch (err) {
    console.error("Error in /api/voice-emotion:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "voice-emotion endpoint running",
  });
}
