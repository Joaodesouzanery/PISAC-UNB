import { NextResponse } from "next/server";
import { getAll, create, update, COLLECTIONS, where } from "@/lib/firebase/collections";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { incidents } from "@/data/crisis-data";
import type { Incident } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const crisisId = searchParams.get("crisisId");
  const priority = searchParams.get("priority");

  if (!isFirebaseConfigured()) {
    let filtered = incidents;
    if (status) filtered = filtered.filter((i) => i.status === status);
    if (crisisId) filtered = filtered.filter((i) => i.crisisId === crisisId);
    if (priority) filtered = filtered.filter((i) => i.priority === priority);
    return NextResponse.json({ data: filtered, source: "mock" });
  }

  const constraints = [];
  if (status) constraints.push(where("status", "==", status));
  if (crisisId) constraints.push(where("crisisId", "==", crisisId));
  if (priority) constraints.push(where("priority", "==", priority));

  const data = await getAll<Incident>(COLLECTIONS.INCIDENTS, constraints);
  return NextResponse.json({ data, source: "firestore" });
}

export async function POST(request: Request) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const body = await request.json();
  const id = await create(COLLECTIONS.INCIDENTS, body);
  return NextResponse.json({ id, success: true }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await update(COLLECTIONS.INCIDENTS, id, data);
  return NextResponse.json({ success: true });
}
