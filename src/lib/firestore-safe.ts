
import {
  setDoc,
  updateDoc,
  DocumentReference,
  SetOptions,
  UpdateData,
  onSnapshot,
  DocumentSnapshot,
  FirestoreError,
} from 'firebase/firestore';

// Track recent writes to prevent loops
const writeTimestamps = new Map<string, number>();
const WRITE_DEBOUNCE_MS = 100;

/**
 * Remove all undefined values from object (Firestore doesn't accept undefined)
 */
export function sanitizeForFirestore<T extends Record<string, any>>(
  data: T,
  visited = new WeakSet()
): Partial<T> {
  // Handle primitives
  if (data === null || typeof data !== 'object') {
    return data;
  }

  // Prevent circular references
  if (visited.has(data)) {
    console.warn('Circular reference detected, skipping');
    return {}; // Return empty object for circular refs
  }
  visited.add(data);

  // Handle arrays
  if (Array.isArray(data)) {
    return data
      .map(item => sanitizeForFirestore(item, visited))
      .filter(item => item !== undefined) as any;
  }

  // Handle objects
  const sanitized: any = {};
  Object.entries(data).forEach(([key, value]) => {
    // Skip undefined values entirely
    if (value === undefined) return;

    // Recursively sanitize nested objects
    if (value && typeof value === 'object' && value.constructor === Object) {
      sanitized[key] = sanitizeForFirestore(value, visited);
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
}

/**
 * Safe setDoc - automatically sanitizes and prevents rapid duplicate writes
 */
export async function safeSetDoc<T>(
  reference: DocumentReference,
  data: T,
  options?: SetOptions
): Promise<void> {
  const docPath = reference.path;
  const now = Date.now();
  const lastWrite = writeTimestamps.get(docPath) || 0;

  // Prevent writes within debounce window
  if (now - lastWrite < WRITE_DEBOUNCE_MS) {
    console.warn(`Write to ${docPath} prevented by debounce.`);
    return;
  }

  writeTimestamps.set(docPath, now);

  const sanitized = sanitizeForFirestore(data as any);
  return setDoc(reference, sanitized as any, options);
}

/**
 * Safe updateDoc - automatically sanitizes
 */
export async function safeUpdateDoc<T>(
  reference: DocumentReference<T>,
  data: UpdateData<T>
): Promise<void> {
  const sanitized = sanitizeForFirestore(data as any);
  return updateDoc(reference, sanitized as UpdateData<T>);
}

/**
 * Safe onSnapshot - prevents listener loops by deep-comparing data
 */
export function safeOnSnapshot<T>(
  reference: DocumentReference,
  callback: (snapshot: DocumentSnapshot) => void,
  errorCallback?: (error: FirestoreError) => void
) {
  let lastData: string | null = null;

  return onSnapshot(
    reference,
    (snapshot) => {
      // Stringify for a deep, albeit inefficient, comparison.
      const currentData = JSON.stringify(snapshot.data());

      // Only trigger callback if data has materially changed
      if (currentData !== lastData) {
        lastData = currentData;
        callback(snapshot);
      }
    },
    errorCallback
  );
}
