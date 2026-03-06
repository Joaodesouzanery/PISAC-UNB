import { NextResponse } from "next/server";
import { getAll, create, update, COLLECTIONS, where } from "@/lib/firebase/collections";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { crises } from "@/data/crisis-data";
import type { Crisis } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  if (!isFirebaseConfigured()) {
    let filtered = crises;
    if (status) filtered = filtered.filter((c) => c.status === status);
    return NextResponse.json({ data: filtered, source: "mock" });
  }

  const constraints = [];
  if (status) constraints.push(where("status", "==", status));

  const data = await getAll<Crisis>(COLLECTIONS.CRISES, constraints);
  return NextResponse.json({ data, source: "firestore" });
}

export async function POST(request: Request) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const body = await request.json();
  const id = await create(COLLECTIONS.CRISES, body);
  return NextResponse.json({ id, success: true }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await update(COLLECTIONS.CRISES, id, data);
  return NextResponse.json({ success: true });
}
