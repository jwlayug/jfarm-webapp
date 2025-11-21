import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Travel } from '../types';

const COLLECTION_NAME = 'travels';

export const addTravel = async (travel: Omit<Travel, 'id'>): Promise<Travel> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), travel);
    return { id: docRef.id, ...travel };
  } catch (error) {
    console.error("Error adding travel: ", error);
    throw error;
  }
};

export const getTravelsByGroup = async (groupId: string): Promise<Travel[]> => {
  try {
    // Note: Compound queries might require an index in Firestore. 
    // If this fails, check console for index creation link.
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("groupId", "==", groupId)
      // We'll sort in memory if index is missing initially to prevent crashes
    );
    const querySnapshot = await getDocs(q);
    
    const travels: Travel[] = [];
    querySnapshot.forEach((doc) => {
      travels.push({ id: doc.id, ...doc.data() } as Travel);
    });
    
    // Sort by created_at or date derived from name/ticket if available?
    // For now, let's assume we just want them.
    return travels;
  } catch (error) {
    console.error("Error fetching group travels: ", error);
    throw error;
  }
};

export const getAllTravels = async (): Promise<Travel[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const travels: Travel[] = [];
      querySnapshot.forEach((doc) => {
        travels.push({ id: doc.id, ...doc.data() } as Travel);
      });
      return travels;
    } catch (error) {
      console.error("Error fetching all travels: ", error);
      throw error;
    }
  };

export const updateTravel = async (id: string, data: Partial<Travel>): Promise<void> => {
  try {
    const travelRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(travelRef, data);
  } catch (error) {
    console.error("Error updating travel: ", error);
    throw error;
  }
};

export const deleteTravel = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting travel: ", error);
    throw error;
  }
};