import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Debt } from '../types';

const COLLECTION_NAME = 'debts';

export const addDebt = async (debt: Omit<Debt, 'id'>): Promise<Debt> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), debt);
    return { id: docRef.id, ...debt };
  } catch (error) {
    console.error("Error adding debt: ", error);
    throw error;
  }
};

export const getDebts = async (): Promise<Debt[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const debts: Debt[] = [];
    querySnapshot.forEach((doc) => {
      debts.push({ id: doc.id, ...doc.data() } as Debt);
    });
    return debts;
  } catch (error) {
    console.error("Error fetching debts: ", error);
    throw error;
  }
};

export const getDebtsByEmployee = async (employeeId: string): Promise<Debt[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where("employeeId", "==", employeeId));
    const querySnapshot = await getDocs(q);
    const debts: Debt[] = [];
    querySnapshot.forEach((doc) => {
      debts.push({ id: doc.id, ...doc.data() } as Debt);
    });
    return debts;
  } catch (error) {
    console.error("Error fetching employee debts: ", error);
    throw error;
  }
};

export const updateDebt = async (id: string, data: Partial<Debt>): Promise<void> => {
  try {
    const debtRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(debtRef, data);
  } catch (error) {
    console.error("Error updating debt: ", error);
    throw error;
  }
};

export const deleteDebt = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting debt: ", error);
    throw error;
  }
};
