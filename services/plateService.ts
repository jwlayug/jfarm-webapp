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
import { Plate } from '../types';

const COLLECTION_NAME = 'plates';

export const addPlate = async (plate: Omit<Plate, 'id'>): Promise<Plate> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), plate);
    return { id: docRef.id, ...plate };
  } catch (error) {
    console.error("Error adding plate: ", error);
    throw error;
  }
};

export const getPlates = async (): Promise<Plate[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('name'));
    const querySnapshot = await getDocs(q);
    const plates: Plate[] = [];
    querySnapshot.forEach((doc) => {
      plates.push({ id: doc.id, ...doc.data() } as Plate);
    });
    return plates;
  } catch (error) {
    console.error("Error fetching plates: ", error);
    throw error;
  }
};

export const updatePlate = async (id: string, data: Partial<Plate>): Promise<void> => {
  try {
    const plateRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(plateRef, data);
  } catch (error) {
    console.error("Error updating plate: ", error);
    throw error;
  }
};

export const deletePlate = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting plate: ", error);
    throw error;
  }
};