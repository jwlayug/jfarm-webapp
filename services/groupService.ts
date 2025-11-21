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
import { Group } from '../types';

const COLLECTION_NAME = 'groups';

// --- CREATE ---
export const addGroup = async (group: Omit<Group, 'id'>): Promise<Group> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), group);
    return { id: docRef.id, ...group };
  } catch (error) {
    console.error("Error adding group: ", error);
    throw error;
  }
};

// --- READ ---
export const getGroups = async (): Promise<Group[]> => {
  try {
    // Order by name for better organization
    const q = query(collection(db, COLLECTION_NAME), orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    const groups: Group[] = [];
    querySnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() } as Group);
    });
    
    return groups;
  } catch (error) {
    console.error("Error fetching groups: ", error);
    throw error;
  }
};

// --- UPDATE ---
export const updateGroup = async (id: string, data: Partial<Group>): Promise<void> => {
  try {
    const groupRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(groupRef, data);
  } catch (error) {
    console.error("Error updating group: ", error);
    throw error;
  }
};

// --- DELETE ---
export const deleteGroup = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting group: ", error);
    throw error;
  }
};