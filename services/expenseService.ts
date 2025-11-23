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
import { OtherExpense } from '../types';

const COLLECTION_NAME = 'expenses';

export const addExpense = async (expense: Omit<OtherExpense, 'id'>): Promise<OtherExpense> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), expense);
    return { id: docRef.id, ...expense };
  } catch (error) {
    console.error("Error adding expense: ", error);
    throw error;
  }
};

export const getExpenses = async (): Promise<OtherExpense[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const expenses: OtherExpense[] = [];
    querySnapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() } as OtherExpense);
    });
    return expenses;
  } catch (error) {
    console.error("Error fetching expenses: ", error);
    throw error;
  }
};

export const updateExpense = async (id: string, data: Partial<OtherExpense>): Promise<void> => {
  try {
    const expenseRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(expenseRef, data);
  } catch (error) {
    console.error("Error updating expense: ", error);
    throw error;
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting expense: ", error);
    throw error;
  }
};