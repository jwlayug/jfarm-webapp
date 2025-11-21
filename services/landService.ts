import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Land } from '../types';

const COLLECTION_NAME = 'lands';

export const addLand = async (land: Omit<Land, 'id'>): Promise<Land> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), land);
    return { id: docRef.id, ...land };
  } catch (error) {
    console.error("Error adding land: ", error);
    throw error;
  }
};

export const getLands = async (): Promise<Land[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('name'));
    const querySnapshot = await getDocs(q);
    const lands: Land[] = [];
    querySnapshot.forEach((doc) => {
      lands.push({ id: doc.id, ...doc.data() } as Land);
    });
    return lands;
  } catch (error) {
    console.error("Error fetching lands: ", error);
    throw error;
  }
};

export const updateLand = async (id: string, data: Partial<Land>): Promise<void> => {
  try {
    const landRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(landRef, data);
  } catch (error) {
    console.error("Error updating land: ", error);
    throw error;
  }
};

export const deleteLand = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting land: ", error);
    throw error;
  }
};