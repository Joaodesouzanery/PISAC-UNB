import { NextResponse } from "next/server";
import { getAll, create, update, COLLECTIONS, where } from "@/lib/firebase/collections";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { crisisResources } from "@/data/crisis-data";
import type { CrisisResource } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");

  if (!isFirebaseConfigured()) {
    let filtered = crisisResources;
    if (status) filtered = filtered.filter((r) => r.status === status);
    if (type) filtered = filtered.filter((r) => r.type === type);
    return NextResponse.json({ data: filtered, source: "mock" });
  }

  const constraints = [];
  if (status) constraints.push(where("status", "==", status));
  if (type) constraints.push(where("type", "==", type));

  const data = await getAll<CrisisResource>(COLLECTIONS.RESOURCES, constraints);
  return NextResponse.json({ data, source: "firestore" });
}

export async function POST(request: Request) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const body = await request.json();
  const id = await create(COLLECTIONS.RESOURCES, body);
  return NextResponse.json({ id, success: true }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await update(COLLECTIONS.RESOURCES, id, data);
  return NextResponse.json({ success: true });
}
