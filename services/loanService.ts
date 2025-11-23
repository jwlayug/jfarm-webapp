
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

// --- CREATE ---
export const addLoan = async (loanData: Omit<Loan, 'id' | 'payments' | 'usages' | 'createdAt' | 'updatedAt'>, farmId?: string | null): Promise<Loan> => {
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
    
    const docRef = await addDoc(getCollectionRef(COLLECTION_NAME, farmId), newLoan);
    return { id: docRef.id, ...newLoan };
  } catch (error) {
    console.error("Error adding loan: ", error);
    throw error;
  }
};

// --- READ ---
export const getLoans = async (farmId?: string | null): Promise<Loan[]> => {
  try {
    // Removed orderBy constraint to ensure all loans show up
    const q = query(getCollectionRef(COLLECTION_NAME, farmId));
    const querySnapshot = await getDocs(q);
    
    const loans: Loan[] = [];
    querySnapshot.forEach((doc) => {
      loans.push({ id: doc.id, ...doc.data() } as Loan);
    });
    
    // Sort client-side
    return loans.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching loans: ", error);
    throw error;
  }
};

// --- UPDATE LOAN DETAILS ---
export const updateLoan = async (id: string, data: Partial<Loan>, farmId?: string | null): Promise<void> => {
  try {
    const loanRef = getDocRef(COLLECTION_NAME, id, farmId);
    const now = new Date().toISOString();
    
    await updateDoc(loanRef, { ...data, updatedAt: now });
  } catch (error) {
    console.error("Error updating loan: ", error);
    throw error;
  }
};

// --- ADD PAYMENT ---
export const addLoanPayment = async (loanId: string, payment: Omit<LoanPayment, 'id' | 'createdAt' | 'updatedAt'>, farmId?: string | null): Promise<void> => {
  try {
    const loanRef = getDocRef(COLLECTION_NAME, loanId, farmId);
    const loanSnap = await getDoc(loanRef);
    
    if (loanSnap.exists()) {
      const loanData = loanSnap.data() as Loan;
      const now = new Date().toISOString();
      
      // Create a linked Expense record in the correct scope (Farm or Root)
      let expenseId: string | undefined;
      try {
        const expenseRef = await addDoc(getCollectionRef(EXPENSES_COLLECTION, farmId), {
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
export const addLoanUsage = async (loanId: string, usage: Omit<LoanUsage, 'id' | 'createdAt' | 'updatedAt'>, farmId?: string | null): Promise<void> => {
  try {
    const loanRef = getDocRef(COLLECTION_NAME, loanId, farmId);
    const loanSnap = await getDoc(loanRef);
    
    if (loanSnap.exists()) {
      const loanData = loanSnap.data() as Loan;
      const now = new Date().toISOString();
      
      // Create a linked Expense record for the usage
      let expenseId: string | undefined;
      try {
        const expenseRef = await addDoc(getCollectionRef(EXPENSES_COLLECTION, farmId), {
          name: 'Loan Usage', 
          description: `${usage.description} - Loan: ${loanData.description}`,
          amount: usage.amount,
          date: usage.usageDate,
          category: 'Loan Usage',
          relatedLoanId: loanId, // Link for cascade delete
          created_at: now
        });
        expenseId = expenseRef.id;
      } catch (e) {
        console.error("Failed to create linked expense record for usage", e);
      }

      const newUsage: LoanUsage = {
        id: Date.now().toString(),
        ...usage,
        otherExpenseId: expenseId, // Store reference to the expense
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
export const deleteLoan = async (id: string, farmId?: string | null): Promise<void> => {
  try {
    // 1. Delete all related expenses (Payments & Renewals & Usages)
    try {
      // Query the correct expenses collection (Active Farm or Root)
      const expensesQuery = query(getCollectionRef(EXPENSES_COLLECTION, farmId), where('relatedLoanId', '==', id));
      const expensesSnap = await getDocs(expensesQuery);
      
      const deletePromises = expensesSnap.docs.map(docSnap => deleteDoc(docSnap.ref));
      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
      }
    } catch (expError) {
      console.warn("Service Warning: Failed to clean up related expenses. Check Firestore Indexes.", expError);
    }

    // 2. Delete the loan document itself
    await deleteDoc(getDocRef(COLLECTION_NAME, id, farmId));
  } catch (error) {
    console.error("Service Error: Error deleting loan: ", error);
    throw error;
  }
};

// --- RENEW (Reset Cycle) ---
export const renewLoan = async (id: string, newDueDate: string, renewalPaymentAmount: number, farmId?: string | null): Promise<void> => {
  try {
     const loanRef = getDocRef(COLLECTION_NAME, id, farmId);
     const loanSnap = await getDoc(loanRef);
     
     if(loanSnap.exists()) {
         const loanData = loanSnap.data() as Loan;
         const now = new Date().toISOString();
         let expenseId: string | undefined;
         
         // Record renewal payment as an expense if amount > 0
         if (renewalPaymentAmount > 0) {
            try {
              const expRef = await addDoc(getCollectionRef(EXPENSES_COLLECTION, farmId), {
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

         // 1. Usage (Reduces Available Usage - acts as a deduction from proceeds)
         // We reset usages array, and add the renewal deduction if applicable.
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

         // 2. Payment (Cleared - Full reset of loan balance)
         // We do NOT add the renewal amount here because the user requested not to deduct it from remaining balance.
         const newPayments: LoanPayment[] = [];

         // Reset remaining balance to the original full amount
         const newBalance = loanData.totalAmount;

         await updateDoc(loanRef, {
             remainingBalance: newBalance, // Full reset
             totalPaidCurrent: 0, // Reset paid amount
             dueDate: newDueDate,
             paid: false,
             payments: newPayments, // Clear payments
             usages: newUsages, // Reset usages, but add the renewal deduction if any
             updatedAt: now
         });
     }
  } catch (error) {
      console.error("Error renewing loan", error);
      throw error;
  }
}
