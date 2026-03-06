import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  type QueryConstraint,
  serverTimestamp,
} from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "./config";

export const COLLECTIONS = {
  SENSORS: "sensors",
  ALERTS: "alerts",
  CRISES: "crises",
  INCIDENTS: "incidents",
  MUNICIPALITIES: "municipalities",
  RESOURCES: "resources",
  USERS: "users",
  AUDIT_LOGS: "audit_logs",
  API_KEYS: "api_keys",
} as const;

type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

export async function getAll<T>(
  collectionName: CollectionName,
  constraints: QueryConstraint[] = []
): Promise<(T & { id: string })[]> {
  if (!isFirebaseConfigured()) return [];
  const db = getDb();
  const ref = collection(db, collectionName);
  const q = constraints.length > 0 ? query(ref, ...constraints) : query(ref);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T & { id: string }));
}

export async function getById<T>(
  collectionName: CollectionName,
  id: string
): Promise<(T & { id: string }) | null> {
  if (!isFirebaseConfigured()) return null;
  const db = getDb();
  const docRef = doc(db, collectionName, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as T & { id: string };
}

export async function create<T extends Record<string, unknown>>(
  collectionName: CollectionName,
  data: T
): Promise<string> {
  const db = getDb();
  const ref = collection(db, collectionName);
  const docRef = await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function update<T extends Record<string, unknown>>(
  collectionName: CollectionName,
  id: string,
  data: Partial<T>
): Promise<void> {
  const db = getDb();
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

export async function remove(
  collectionName: CollectionName,
  id: string
): Promise<void> {
  const db = getDb();
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}

export { where, orderBy, limit };
