
import { 
  collection, 
  getDocs, 
  addDoc, 
  query,
  orderBy,
  writeBatch,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Farm } from '../types';

const COLLECTION_NAME = 'farms';

// List of all subcollections that need to be cleaned up when a farm is deleted
const SUB_COLLECTIONS = [
  'employees', 'groups', 'travels', 'lands', 'plates', 
  'destinations', 'drivers', 'debts', 'expenses', 'loans'
];

export const addFarm = async (name: string): Promise<Farm> => {
  try {
    const now = new Date().toISOString();
    const farmData = {
      name,
      createdAt: now
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), farmData);
    return { id: docRef.id, ...farmData };
  } catch (error) {
    console.error("Error adding farm: ", error);
    throw error;
  }
};

export const getFarms = async (): Promise<Farm[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const farms: Farm[] = [];
    querySnapshot.forEach((doc) => {
      farms.push({ id: doc.id, ...doc.data() } as Farm);
    });
    
    return farms;
  } catch (error) {
    console.error("Error fetching farms: ", error);
    throw error;
  }
};

export const deleteFarm = async (farmId: string): Promise<void> => {
  try {
    // 1. Delete all subcollections
    // Firestore does not delete subcollections automatically. We must do it manually.
    for (const subCol of SUB_COLLECTIONS) {
      const subColRef = collection(db, COLLECTION_NAME, farmId, subCol);
      const snapshot = await getDocs(subColRef);
      
      if (snapshot.empty) continue;

      // Batch delete (max 500 per batch)
      const chunks = [];
      let currentChunk: any[] = [];
      
      snapshot.docs.forEach(doc => {
        currentChunk.push(doc);
        if (currentChunk.length === 400) {
          chunks.push([...currentChunk]);
          currentChunk = [];
        }
      });
      if (currentChunk.length > 0) chunks.push(currentChunk);

      for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach((docSnap: any) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
      }
    }

    // 2. Delete the farm document itself
    await deleteDoc(doc(db, COLLECTION_NAME, farmId));
    
  } catch (error) {
    console.error("Error deleting farm: ", error);
    throw error;
  }
};
