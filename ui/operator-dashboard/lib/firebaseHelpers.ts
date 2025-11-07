// Firebase Firestore Helper Functions
// Provides utility functions for common Firestore operations

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
  DocumentData,
  CollectionReference,
  DocumentReference,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

// ============================================================================
// COLLECTION REFERENCES
// ============================================================================

export function getRecommendationsCollection() {
  return collection(getFirebaseDb(), "recommendations");
}

export function getUsersCollection() {
  return collection(getFirebaseDb(), "users");
}

export function getUserSignalsCollection() {
  return collection(getFirebaseDb(), "user_signals");
}

export function getPersonaHistoryCollection() {
  return collection(getFirebaseDb(), "persona_history");
}

export function getAuditLogsCollection() {
  return collection(getFirebaseDb(), "audit_logs");
}

export function getOperatorNotesCollection() {
  return collection(getFirebaseDb(), "operator_notes");
}

export function getTagsCollection() {
  return collection(getFirebaseDb(), "tags");
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Get a single document by ID
 */
export async function getDocument<T = DocumentData>(
  collectionName: string,
  documentId: string
): Promise<T | null> {
  try {
    const docRef = doc(getFirebaseDb(), collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as T;
    }
    return null;
  } catch (error) {
    console.error(`Error getting document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Get all documents from a collection with optional filtering
 */
export async function getDocuments<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const collectionRef = collection(getFirebaseDb(), collectionName);
    const q =
      constraints.length > 0
        ? query(collectionRef, ...constraints)
        : collectionRef;
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Create or update a document
 */
export async function setDocument(
  collectionName: string,
  documentId: string,
  data: DocumentData
): Promise<void> {
  try {
    const docRef = doc(getFirebaseDb(), collectionName, documentId);
    await setDoc(docRef, {
      ...data,
      updated_at: Timestamp.now(),
    });
  } catch (error) {
    console.error(`Error setting document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Update specific fields of a document
 */
export async function updateDocument(
  collectionName: string,
  documentId: string,
  updates: Partial<DocumentData>
): Promise<void> {
  try {
    const docRef = doc(getFirebaseDb(), collectionName, documentId);
    await updateDoc(docRef, {
      ...updates,
      updated_at: Timestamp.now(),
    });
  } catch (error) {
    console.error(`Error updating document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(
  collectionName: string,
  documentId: string
): Promise<void> {
  try {
    const docRef = doc(getFirebaseDb(), collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document ${documentId}:`, error);
    throw error;
  }
}

// ============================================================================
// QUERY HELPERS
// ============================================================================

/**
 * Build a query with common filters for recommendations
 */
export function buildRecommendationsQuery(filters: {
  status?: string;
  persona?: string;
  priority?: string;
  userId?: string;
  limitCount?: number;
}) {
  const constraints: QueryConstraint[] = [];

  if (filters.status && filters.status !== "all") {
    constraints.push(where("status", "==", filters.status));
  }

  if (filters.persona && filters.persona !== "all") {
    constraints.push(where("persona_primary", "==", filters.persona));
  }

  if (filters.priority && filters.priority !== "all") {
    constraints.push(where("priority", "==", filters.priority));
  }

  if (filters.userId) {
    constraints.push(where("user_id", "==", filters.userId));
  }

  // Always order by created_at descending
  constraints.push(orderBy("created_at", "desc"));

  if (filters.limitCount) {
    constraints.push(limit(filters.limitCount));
  }

  return constraints;
}

// ============================================================================
// DATA CONVERSION HELPERS
// ============================================================================

/**
 * Convert Firestore Timestamp to ISO string
 */
export function timestampToISO(
  timestamp: Timestamp | null | undefined
): string | null {
  if (!timestamp) return null;
  return timestamp.toDate().toISOString();
}

/**
 * Convert ISO string to Firestore Timestamp
 */
export function isoToTimestamp(
  isoString: string | null | undefined
): Timestamp | null {
  if (!isoString) return null;
  return Timestamp.fromDate(new Date(isoString));
}

/**
 * Prepare data for Firestore (convert dates, etc.)
 */
export function prepareForFirestore(data: any): DocumentData {
  const prepared: DocumentData = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      // Skip null/undefined values
      continue;
    }

    if (typeof value === "string" && isISODate(value)) {
      // Convert ISO date strings to Timestamps
      prepared[key] = isoToTimestamp(value);
    } else if (typeof value === "object" && value instanceof Date) {
      // Convert Date objects to Timestamps
      prepared[key] = Timestamp.fromDate(value);
    } else {
      prepared[key] = value;
    }
  }

  return prepared;
}

/**
 * Prepare Firestore data for app use (convert Timestamps to ISO strings)
 */
export function prepareFromFirestore(data: DocumentData): any {
  const prepared: any = {};

  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      prepared[key] = timestampToISO(value);
    } else {
      prepared[key] = value;
    }
  }

  return prepared;
}

/**
 * Check if string is an ISO date
 */
function isISODate(str: string): boolean {
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  return isoDatePattern.test(str);
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Batch update multiple documents
 * Note: Firestore batches support up to 500 operations
 */
export async function batchUpdateDocuments(
  updates: Array<{
    collection: string;
    documentId: string;
    data: Partial<DocumentData>;
  }>
): Promise<void> {
  if (updates.length === 0) return;
  if (updates.length > 500) {
    throw new Error("Batch operations limited to 500 documents");
  }

  try {
    const { writeBatch } = await import("firebase/firestore");
    const batch = writeBatch(getFirebaseDb());

    updates.forEach(({ collection: collectionName, documentId, data }) => {
      const docRef = doc(getFirebaseDb(), collectionName, documentId);
      batch.update(docRef, {
        ...data,
        updated_at: Timestamp.now(),
      });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error in batch update:", error);
    throw error;
  }
}
