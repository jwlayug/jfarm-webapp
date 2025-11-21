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
import { Employee } from '../types';

const COLLECTION_NAME = 'employees';

// --- CREATE ---
export const addEmployee = async (employee: Omit<Employee, 'id'>): Promise<Employee> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), employee);
    return { id: docRef.id, ...employee };
  } catch (error) {
    console.error("Error adding employee: ", error);
    throw error;
  }
};

// --- READ ---
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    // Fetch employees ordered by name for better UX
    const q = query(collection(db, COLLECTION_NAME), orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    const employees: Employee[] = [];
    querySnapshot.forEach((doc) => {
      employees.push({ id: doc.id, ...doc.data() } as Employee);
    });
    
    return employees;
  } catch (error) {
    console.error("Error fetching employees: ", error);
    throw error;
  }
};

// --- UPDATE ---
export const updateEmployee = async (id: string, data: Partial<Employee>): Promise<void> => {
  try {
    const employeeRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(employeeRef, data);
  } catch (error) {
    console.error("Error updating employee: ", error);
    throw error;
  }
};

// --- DELETE ---
export const deleteEmployee = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting employee: ", error);
    throw error;
  }
};