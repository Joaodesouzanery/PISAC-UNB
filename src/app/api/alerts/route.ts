import { NextResponse } from "next/server";
import { getAll, create, COLLECTIONS, where } from "@/lib/firebase/collections";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { alerts } from "@/data/mock-data";
import type { Alert } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const severity = searchParams.get("severity");
  const category = searchParams.get("category");

  if (!isFirebaseConfigured()) {
    let filtered = alerts;
    if (severity) filtered = filtered.filter((a) => a.severity === severity);
    if (category) filtered = filtered.filter((a) => a.category === category);
    return NextResponse.json({ data: filtered, source: "mock" });
  }

  const constraints = [];
  if (severity) constraints.push(where("severity", "==", severity));
  if (category) constraints.push(where("category", "==", category));

  const data = await getAll<Alert>(COLLECTIONS.ALERTS, constraints);
  return NextResponse.json({ data, source: "firestore" });
}

export async function POST(request: Request) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const body = await request.json();
  const id = await create(COLLECTIONS.ALERTS, body);
  return NextResponse.json({ id, success: true }, { status: 201 });
}
