import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loan, LoanPayment, LoanUsage } from '../types';

const COLLECTION_NAME = 'loans';
const EXPENSES_COLLECTION = 'expenses';

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
      
      // Create a linked Expense record
      let expenseId: string | undefined;
      try {
        const expenseRef = await addDoc(collection(db, EXPENSES_COLLECTION), {
          name: 'Loan Payment',
          description: `Payment for loan: ${loanData.description}`,
          amount: payment.amount,
          date: payment.paymentDate,
          category: 'Loan Repayment',
          relatedLoanId: loanId, // Link for cascade delete
          created_at: now
        });
        expenseId = expenseRef.id;
      } catch (e) {
        console.error("Failed to create linked expense record", e);
      }

      const newPayment: LoanPayment = {
        id: Date.now().toString(), 
        ...payment,
        otherExpenseId: expenseId,
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
  console.log("Service: deleteLoan called for ID:", id);
  try {
    // 1. Delete all related expenses (Payments & Renewals)
    try {
      console.log("Service: Querying related expenses for deletion...");
      const expensesQuery = query(collection(db, EXPENSES_COLLECTION), where('relatedLoanId', '==', id));
      const expensesSnap = await getDocs(expensesQuery);
      
      const deletePromises = expensesSnap.docs.map(docSnap => deleteDoc(docSnap.ref));
      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
        console.log("Service: Related expenses deleted.");
      }
    } catch (expError) {
      console.warn("Service Warning: Failed to clean up related expenses. Check Firestore Indexes.", expError);
    }

    // 2. Delete the loan document itself
    console.log("Service: Deleting loan document...");
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    console.log("Service: Loan document deleted.");
  } catch (error) {
    console.error("Service Error: Error deleting loan: ", error);
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
         let expenseId: string | undefined;
         
         // Record renewal payment as an expense if amount > 0
         if (renewalPaymentAmount > 0) {
            try {
              const expRef = await addDoc(collection(db, EXPENSES_COLLECTION), {
                name: 'Loan Renewal Payment',
                description: `Renewal payment for loan: ${loanData.description}`,
                amount: renewalPaymentAmount,
                date: new Date().toISOString().split('T')[0],
                category: 'Loan Renewal',
                relatedLoanId: id, // Link for cascade delete
                created_at: now
              });
              expenseId = expRef.id;
            } catch (e) {
              console.error("Failed to create renewal expense record", e);
            }
         }

         // 1. Usage (Reduces Available)
         const newUsages: LoanUsage[] = [];
         if (renewalPaymentAmount > 0) {
             newUsages.push({
                 id: Date.now().toString(),
                 loanId: id,
                 description: 'Renewal Deduction',
                 amount: renewalPaymentAmount,
                 usageDate: new Date().toISOString().split('T')[0],
                 createdAt: now,
                 updatedAt: now,
                 otherExpenseId: expenseId
             });
         }

         // 2. Payment (Reduces Remaining Balance)
         const newPayments: LoanPayment[] = [];
         if (renewalPaymentAmount > 0) {
             newPayments.push({
                 id: (Date.now() + 1).toString(), // distinct ID from usage
                 loanId: id,
                 amount: renewalPaymentAmount,
                 paymentDate: new Date().toISOString().split('T')[0],
                 otherExpenseId: expenseId,
                 createdAt: now,
                 updatedAt: now
             });
         }

         // Reset remaining balance but deduct the renewal payment immediately
         const newBalance = loanData.totalAmount - renewalPaymentAmount;

         await updateDoc(loanRef, {
             remainingBalance: Math.max(0, newBalance),
             totalPaidCurrent: renewalPaymentAmount, 
             dueDate: newDueDate,
             paid: false,
             payments: newPayments, // Initialize with the renewal payment
             usages: newUsages, // Initialize with the renewal deduction
             updatedAt: now
         });
     }
  } catch (error) {
      console.error("Error renewing loan", error);
      throw error;
  }
}
