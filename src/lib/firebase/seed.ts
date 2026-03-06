/**
 * Firestore Seed Script
 * Populates the database with initial data from mock files.
 * Run: npx ts-node --esm src/lib/firebase/seed.ts
 */
import { collection, writeBatch, doc } from "firebase/firestore";
import { getDb } from "./config";
import { municipalities, crises, incidents, crisisResources, communicationChannels } from "@/data/crisis-data";
import { systemUsers, auditLogs, apiEndpoints, microserviceNodes } from "@/data/governance-data";
import { sensors, alerts, infrastructures } from "@/data/mock-data";
import { COLLECTIONS } from "./collections";

export async function seedDatabase() {
  const db = getDb();
  const batch = writeBatch(db);

  const seedCollection = <T extends Record<string, unknown>>(name: string, items: (T & { id: string })[]) => {
    items.forEach((item) => {
      const { id, ...data } = item;
      const ref = doc(db, name, id);
      batch.set(ref, { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    });
  };

  seedCollection(COLLECTIONS.MUNICIPALITIES, municipalities as any);
  seedCollection(COLLECTIONS.CRISES, crises as any);
  seedCollection(COLLECTIONS.INCIDENTS, incidents as any);
  seedCollection(COLLECTIONS.RESOURCES, crisisResources as any);
  seedCollection(COLLECTIONS.SENSORS, sensors as any);
  seedCollection(COLLECTIONS.ALERTS, alerts as any);
  seedCollection(COLLECTIONS.USERS, systemUsers as any);
  seedCollection(COLLECTIONS.AUDIT_LOGS, auditLogs as any);

  await batch.commit();
  console.log("Database seeded successfully!");
}
