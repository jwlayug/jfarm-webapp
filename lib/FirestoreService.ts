
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  QueryConstraint,
  Firestore,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Generic Abstract Service Class for Firestore Collections
 * Implements CRUD and Real-time Subscription patterns.
 */
export class FirestoreService<T extends { id: string }> {
  protected collectionName: string;
  protected db: Firestore;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.db = db;
  }

  /**
   * Subscribe to real-time updates for this collection
   */
  subscribe(
    onData: (data: T[]) => void, 
    onError: (error: Error) => void,
    constraints: QueryConstraint[] = []
  ): () => void {
    const q = query(collection(this.db, this.collectionName), ...constraints);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      onData(data);
    }, (error) => {
      console.error(`Error in ${this.collectionName} subscription:`, error);
      onError(error);
    });

    return unsubscribe;
  }

  async add(data: Omit<T, 'id'>): Promise<T> {
    const docRef = await addDoc(collection(this.db, this.collectionName), data);
    return { id: docRef.id, ...data } as T;
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    const docRef = doc(this.db, this.collectionName, id);
    await updateDoc(docRef, data as any);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(this.db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  // Utility for batch operations if needed
  getBatch() {
    return writeBatch(this.db);
  }
}
