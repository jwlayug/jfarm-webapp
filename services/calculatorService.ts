import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CalculatorComputation } from '../types';

const COLLECTION_NAME = 'computations';

// Helper to get collection reference based on farm context
const getCollectionRef = (colName: string, farmId?: string | null) => {
  if (farmId) {
    return collection(db, 'farms', farmId, colName);
  }
  return collection(db, colName);
};

// Helper to get doc reference based on farm context
const getDocRef = (colName: string, id: string, farmId?: string | null) => {
  if (farmId) {
    return doc(db, 'farms', farmId, colName, id);
  }
  return doc(db, colName, id);
};

export const addComputation = async (data: Omit<CalculatorComputation, 'id'>, farmId?: string | null): Promise<CalculatorComputation> => {
  try {
    const docRef = await addDoc(getCollectionRef(COLLECTION_NAME, farmId), data);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error("Error saving computation: ", error);
    throw error;
  }
};

export const getComputations = async (farmId?: string | null): Promise<CalculatorComputation[]> => {
  try {
    const q = query(getCollectionRef(COLLECTION_NAME, farmId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const computations: CalculatorComputation[] = [];
    querySnapshot.forEach((doc) => {
      computations.push({ id: doc.id, ...doc.data() } as CalculatorComputation);
    });
    return computations;
  } catch (error) {
    console.error("Error fetching computations: ", error);
    throw error;
  }
};

export const deleteComputation = async (id: string, farmId?: string | null): Promise<void> => {
  try {
    await deleteDoc(getDocRef(COLLECTION_NAME, id, farmId));
  } catch (error) {
    console.error("Error deleting computation: ", error);
    throw error;
  }
};