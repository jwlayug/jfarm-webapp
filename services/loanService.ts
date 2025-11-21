import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loan, LoanPayment, LoanUsage } from '../types';

const COLLECTION_NAME = 'loans';

// --- CREATE ---
export const addLoan = async (loanData: Omit<Loan, 'id' | 'payments' | 'usages' | 'createdAt' | 'updatedAt'>): Promise<Loan> => {
  try {
    const now = new Date().toISOString();
    const newLoan: Omit<Loan, 'id'> = {
      ...loanData,
      remainingBalance: loanData.totalAmount,
      totalPaidCurrent: 0,
      totalPaidLifetime: 0,
      paid: false,
      payments: [],
      usages: [],
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newLoan);
    return { id: docRef.id, ...newLoan };
  } catch (error) {
    console.error("Error adding loan: ", error);
    throw error;
  }
};

// --- READ ---
export const getLoans = async (): Promise<Loan[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const loans: Loan[] = [];
    querySnapshot.forEach((doc) => {
      loans.push({ id: doc.id, ...doc.data() } as Loan);
    });
    
    return loans;
  } catch (error) {
    console.error("Error fetching loans: ", error);
    throw error;
  }
};

// --- UPDATE LOAN DETAILS ---
export const updateLoan = async (id: string, data: Partial<Loan>): Promise<void> => {
  try {
    const loanRef = doc(db, COLLECTION_NAME, id);
    const now = new Date().toISOString();
    
    await updateDoc(loanRef, { ...data, updatedAt: now });
  } catch (error) {
    console.error("Error updating loan: ", error);
    throw error;
  }
};

// --- ADD PAYMENT ---
export const addLoanPayment = async (loanId: string, payment: Omit<LoanPayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    const loanRef = doc(db, COLLECTION_NAME, loanId);
    const loanSnap = await getDoc(loanRef);
    
    if (loanSnap.exists()) {
      const loanData = loanSnap.data() as Loan;
      const now = new Date().toISOString();
      
      const newPayment: LoanPayment = {
        id: Date.now().toString(), // Simple ID generation
        ...payment,
        createdAt: now,
        updatedAt: now
      };

      const updatedPayments = [...(loanData.payments || []), newPayment];
      const newTotalPaidCurrent = (loanData.totalPaidCurrent || 0) + payment.amount;
      const newTotalPaidLifetime = (loanData.totalPaidLifetime || 0) + payment.amount;
      const newRemainingBalance = (loanData.totalAmount) - newTotalPaidCurrent;
      const isPaid = newRemainingBalance <= 0;

      await updateDoc(loanRef, {
        payments: updatedPayments,
        totalPaidCurrent: newTotalPaidCurrent,
        totalPaidLifetime: newTotalPaidLifetime,
        remainingBalance: Math.max(0, newRemainingBalance),
        paid: isPaid,
        updatedAt: now
      });
    }
  } catch (error) {
    console.error("Error adding payment: ", error);
    throw error;
  }
};

// --- ADD USAGE ---
export const addLoanUsage = async (loanId: string, usage: Omit<LoanUsage, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    const loanRef = doc(db, COLLECTION_NAME, loanId);
    const loanSnap = await getDoc(loanRef);
    
    if (loanSnap.exists()) {
      const loanData = loanSnap.data() as Loan;
      const now = new Date().toISOString();
      
      const newUsage: LoanUsage = {
        id: Date.now().toString(),
        ...usage,
        createdAt: now,
        updatedAt: now
      };

      const updatedUsages = [...(loanData.usages || []), newUsage];

      await updateDoc(loanRef, {
        usages: updatedUsages,
        updatedAt: now
      });
    }
  } catch (error) {
    console.error("Error adding usage: ", error);
    throw error;
  }
};

// --- DELETE ---
export const deleteLoan = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting loan: ", error);
    throw error;
  }
};

// --- RENEW (Reset Cycle) ---
export const renewLoan = async (id: string, newDueDate: string, renewalPaymentAmount: number): Promise<void> => {
  try {
     const loanRef = doc(db, COLLECTION_NAME, id);
     const loanSnap = await getDoc(loanRef);
     
     if(loanSnap.exists()) {
         const loanData = loanSnap.data() as Loan;
         const now = new Date().toISOString();

         // 1. Deduct renewal payment from current balance (if any)
         // If the user pays 5000 on a 20000 balance, the new loan starts at 15000.
         let currentBalance = loanData.remainingBalance;
         
         // Ensure we don't go below zero if they overpay
         let effectiveNewPrincipal = Math.max(0, currentBalance - renewalPaymentAmount);

         // 2. Record the renewal payment if > 0? 
         // The user mentioned "This payment will be recorded in Other Expenses".
         // Since we don't have an explicit expenses link yet, we just account for it in the balance reduction.
         // Optionally we could add a "closing payment" to the history, but standard renewal 
         // usually implies starting fresh. 
         
         // 3. Reset Metrics
         // The new Principal is the remaining balance from previous cycle.
         // Current Paid resets to 0.
         // Payments array resets (or we could archive, but we'll clear for now as per request).

         await updateDoc(loanRef, {
             totalAmount: effectiveNewPrincipal,
             remainingBalance: effectiveNewPrincipal,
             totalPaidCurrent: 0,
             dueDate: newDueDate,
             paid: effectiveNewPrincipal <= 0,
             payments: [], // Clear current payments list for the new cycle
             updatedAt: now
         });
     }
  } catch (error) {
      console.error("Error renewing loan", error);
      throw error;
  }
}
