import { NextResponse } from "next/server";
import { getAll, COLLECTIONS, where } from "@/lib/firebase/collections";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { municipalities } from "@/data/crisis-data";
import type { Municipality } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  if (!isFirebaseConfigured()) {
    let filtered = municipalities;
    if (status) filtered = filtered.filter((m) => m.status === status);
    return NextResponse.json({ data: filtered, source: "mock" });
  }

  const constraints = [];
  if (status) constraints.push(where("status", "==", status));

  const data = await getAll<Municipality>(COLLECTIONS.MUNICIPALITIES, constraints);
  return NextResponse.json({ data, source: "firestore" });
}
