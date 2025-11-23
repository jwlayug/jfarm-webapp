
import React, { createContext, useContext, useEffect, useState } from 'react';
import { orderBy } from 'firebase/firestore';
import { FirestoreService } from '../lib/FirestoreService';
import { 
  Employee, Group, Travel, Land, Plate, 
  Destination, Driver, Debt, OtherExpense, Loan 
} from '../types';

// --- SERVICES INSTANTIATION ---
// We instantiate services here to keep them as Singletons within the context
const employeeSvc = new FirestoreService<Employee>('employees');
const groupSvc = new FirestoreService<Group>('groups');
const travelSvc = new FirestoreService<Travel>('travels');
const landSvc = new FirestoreService<Land>('lands');
const plateSvc = new FirestoreService<Plate>('plates');
const destSvc = new FirestoreService<Destination>('destinations');
const driverSvc = new FirestoreService<Driver>('drivers');
const debtSvc = new FirestoreService<Debt>('debts');
const expenseSvc = new FirestoreService<OtherExpense>('expenses');
const loanSvc = new FirestoreService<Loan>('loans');

interface FarmContextType {
  employees: Employee[];
  groups: Group[];
  travels: Travel[];
  lands: Land[];
  plates: Plate[];
  destinations: Destination[];
  drivers: Driver[];
  debts: Debt[];
  expenses: OtherExpense[];
  loans: Loan[];
  
  // Status
  isLoading: boolean;
  error: Error | null;

  // Exposed Services for Mutations
  services: {
    employees: FirestoreService<Employee>;
    groups: FirestoreService<Group>;
    travels: FirestoreService<Travel>;
    lands: FirestoreService<Land>;
    plates: FirestoreService<Plate>;
    destinations: FirestoreService<Destination>;
    drivers: FirestoreService<Driver>;
    debts: FirestoreService<Debt>;
    expenses: FirestoreService<OtherExpense>;
    loans: FirestoreService<Loan>;
  }
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [travels, setTravels] = useState<Travel[]>([]);
  const [lands, setLands] = useState<Land[]>([]);
  const [plates, setPlates] = useState<Plate[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [expenses, setExpenses] = useState<OtherExpense[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  
  const [loadingState, setLoadingState] = useState({
    employees: true, groups: true, travels: true, lands: true,
    plates: true, destinations: true, drivers: true, debts: true,
    expenses: true, loans: true
  });
  const [error, setError] = useState<Error | null>(null);

  // Helper to update loading state
  const loaded = (key: keyof typeof loadingState) => {
    setLoadingState(prev => ({ ...prev, [key]: false }));
  };

  useEffect(() => {
    // --- REALTIME SUBSCRIPTIONS ---
    // Order constraints can be passed here
    
    const unsubEmp = employeeSvc.subscribe(data => { setEmployees(data); loaded('employees'); }, setError, [orderBy('name')]);
    const unsubGrp = groupSvc.subscribe(data => { setGroups(data); loaded('groups'); }, setError, [orderBy('created_at', 'desc')]);
    const unsubTrv = travelSvc.subscribe(data => { setTravels(data); loaded('travels'); }, setError); // Client-side sort usually better for complex dates
    const unsubLnd = landSvc.subscribe(data => { setLands(data); loaded('lands'); }, setError, [orderBy('name')]);
    const unsubPlt = plateSvc.subscribe(data => { setPlates(data); loaded('plates'); }, setError, [orderBy('name')]);
    const unsubDst = destSvc.subscribe(data => { setDestinations(data); loaded('destinations'); }, setError, [orderBy('name')]);
    const unsubDrv = driverSvc.subscribe(data => { setDrivers(data); loaded('drivers'); }, setError);
    const unsubDbt = debtSvc.subscribe(data => { setDebts(data); loaded('debts'); }, setError);
    const unsubExp = expenseSvc.subscribe(data => { setExpenses(data); loaded('expenses'); }, setError, [orderBy('date', 'desc')]);
    const unsubLn = loanSvc.subscribe(data => { setLoans(data); loaded('loans'); }, setError, [orderBy('createdAt', 'desc')]);

    return () => {
      // Clean up listeners on unmount
      unsubEmp(); unsubGrp(); unsubTrv(); unsubLnd();
      unsubPlt(); unsubDst(); unsubDrv(); unsubDbt();
      unsubExp(); unsubLn();
    };
  }, []);

  const isLoading = Object.values(loadingState).some(s => s);

  const value = {
    employees, groups, travels, lands, plates, destinations, drivers, debts, expenses, loans,
    isLoading,
    error,
    services: {
      employees: employeeSvc,
      groups: groupSvc,
      travels: travelSvc,
      lands: landSvc,
      plates: plateSvc,
      destinations: destSvc,
      drivers: driverSvc,
      debts: debtSvc,
      expenses: expenseSvc,
      loans: loanSvc
    }
  };

  return (
    <FarmContext.Provider value={value}>
      {children}
    </FarmContext.Provider>
  );
};

// Custom Hook for consuming the context
export const useFarmData = () => {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarmData must be used within a FarmProvider');
  }
  return context;
};