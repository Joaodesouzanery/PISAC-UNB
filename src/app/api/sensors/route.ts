import { NextResponse } from "next/server";
import { getAll, create, COLLECTIONS, where, orderBy } from "@/lib/firebase/collections";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { sensors } from "@/data/mock-data";
import type { Sensor } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");

  if (!isFirebaseConfigured()) {
    let filtered = sensors;
    if (status) filtered = filtered.filter((s) => s.status === status);
    if (type) filtered = filtered.filter((s) => s.type === type);
    return NextResponse.json({ data: filtered, source: "mock" });
  }

  const constraints = [];
  if (status) constraints.push(where("status", "==", status));
  if (type) constraints.push(where("type", "==", type));

  const data = await getAll<Sensor>(COLLECTIONS.SENSORS, constraints);
  return NextResponse.json({ data, source: "firestore" });
}

export async function POST(request: Request) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const body = await request.json();
  const id = await create(COLLECTIONS.SENSORS, body);
  return NextResponse.json({ id, success: true }, { status: 201 });
}
