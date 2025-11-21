import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Driver } from '../types';

const COLLECTION_NAME = 'drivers';

export const addDriver = async (driver: Omit<Driver, 'id'>): Promise<Driver> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), driver);
    return { id: docRef.id, ...driver };
  } catch (error) {
    console.error("Error adding driver: ", error);
    throw error;
  }
};

export const getDrivers = async (): Promise<Driver[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const drivers: Driver[] = [];
    querySnapshot.forEach((doc) => {
      drivers.push({ id: doc.id, ...doc.data() } as Driver);
    });
    return drivers;
  } catch (error) {
    console.error("Error fetching drivers: ", error);
    throw error;
  }
};

export const updateDriver = async (id: string, data: Partial<Driver>): Promise<void> => {
  try {
    const driverRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(driverRef, data);
  } catch (error) {
    console.error("Error updating driver: ", error);
    throw error;
  }
};

export const deleteDriver = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting driver: ", error);
    throw error;
  }
};