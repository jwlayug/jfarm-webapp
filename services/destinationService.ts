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
import { Destination } from '../types';

const COLLECTION_NAME = 'destinations';

export const addDestination = async (destination: Omit<Destination, 'id'>): Promise<Destination> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), destination);
    return { id: docRef.id, ...destination };
  } catch (error) {
    console.error("Error adding destination: ", error);
    throw error;
  }
};

export const getDestinations = async (): Promise<Destination[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('name'));
    const querySnapshot = await getDocs(q);
    const destinations: Destination[] = [];
    querySnapshot.forEach((doc) => {
      destinations.push({ id: doc.id, ...doc.data() } as Destination);
    });
    return destinations;
  } catch (error) {
    console.error("Error fetching destinations: ", error);
    throw error;
  }
};

export const updateDestination = async (id: string, data: Partial<Destination>): Promise<void> => {
  try {
    const destinationRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(destinationRef, data);
  } catch (error) {
    console.error("Error updating destination: ", error);
    throw error;
  }
};

export const deleteDestination = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting destination: ", error);
    throw error;
  }
};