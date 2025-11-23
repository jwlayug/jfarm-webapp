import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { orderBy } from 'firebase/firestore';
import { FirestoreService } from '../lib/FirestoreService';
import { getFarms, addFarm, deleteFarm } from '../services/farmService';
import { 
  Employee, Group, Travel, Land, Plate, 
  Destination, Driver, Debt, OtherExpense, Loan, Farm, CalculatorComputation
} from '../types';

interface FarmContextType {
  farms: Farm[];
  activeFarmId: string | null;
  setActiveFarmId: (id: string | null) => void;
  createFarm: (name: string) => Promise<void>;
  removeFarm: (id: string) => Promise<void>;

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
  computations: CalculatorComputation[];
  
  // Status
  isLoading: boolean;
  error: Error | null;

  // Exposed Services for Mutations (Dynamic based on active farm)
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
    computations: FirestoreService<CalculatorComputation>;
  }
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- Farm State ---
  const [farms, setFarms] = useState<Farm[]>([]);
  const [activeFarmId, setActiveFarmId] = useState<string | null>(() => localStorage.getItem('activeFarmId'));

  // --- Data State ---
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
  const [computations, setComputations] = useState<CalculatorComputation[]>([]);
  
  const [loadingState, setLoadingState] = useState({
    farms: true,
    employees: true, groups: true, travels: true, lands: true,
    plates: true, destinations: true, drivers: true, debts: true,
    expenses: true, loans: true, computations: true
  });
  const [error, setError] = useState<Error | null>(null);

  // Helper to update loading state
  const loaded = (key: keyof typeof loadingState) => {
    setLoadingState(prev => ({ ...prev, [key]: false }));
  };

  // --- 1. Fetch Farms on Load ---
  useEffect(() => {
    const initFarms = async () => {
      try {
        const fetchedFarms = await getFarms();
        setFarms(fetchedFarms);
        
        // If we have an active ID in local storage but it's not in the list, reset (or if list empty)
        if (activeFarmId && !fetchedFarms.find(f => f.id === activeFarmId)) {
           if (fetchedFarms.length > 0) {
             setActiveFarmId(fetchedFarms[0].id);
             localStorage.setItem('activeFarmId', fetchedFarms[0].id);
           } else {
             setActiveFarmId(null);
             localStorage.removeItem('activeFarmId');
           }
        } else if (!activeFarmId && fetchedFarms.length > 0) {
           // Default to first farm if none selected
           setActiveFarmId(fetchedFarms[0].id);
           localStorage.setItem('activeFarmId', fetchedFarms[0].id);
        }
        
        loaded('farms');
      } catch (e) {
        console.error("Failed to fetch farms", e);
        setError(e as Error);
      }
    };
    initFarms();
  }, []);

  // Handler to switch farms
  const handleSetActiveFarm = (id: string | null) => {
    // 1. Clear existing data immediately to ensure "Clean Slate" visually
    // This ensures that when you create/switch to a new farm, you see empty tables immediately
    // instead of stale data from the previous farm while the new data loads.
    setEmployees([]);
    setGroups([]);
    setTravels([]);
    setLands([]);
    setPlates([]);
    setDestinations([]);
    setDrivers([]);
    setDebts([]);
    setExpenses([]);
    setLoans([]);
    setComputations([]);

    // 2. Update ID
    setActiveFarmId(id);
    if (id) localStorage.setItem('activeFarmId', id);
    else localStorage.removeItem('activeFarmId');
    
    // 3. Reset loading states for data to trigger spinners if needed
    setLoadingState(prev => ({
        ...prev,
        employees: true, groups: true, travels: true, lands: true,
        plates: true, destinations: true, drivers: true, debts: true,
        expenses: true, loans: true, computations: true
    }));
  };

  const handleCreateFarm = async (name: string) => {
    const newFarm = await addFarm(name);
    setFarms(prev => [...prev, newFarm]);
    handleSetActiveFarm(newFarm.id);
  };

  const handleRemoveFarm = async (id: string) => {
    await deleteFarm(id);
    const updatedFarms = farms.filter(f => f.id !== id);
    setFarms(updatedFarms);
    
    // If deleted active farm, switch to another or null
    if (activeFarmId === id) {
      if (updatedFarms.length > 0) {
        handleSetActiveFarm(updatedFarms[0].id);
      } else {
        handleSetActiveFarm(null);
      }
    }
  };

  // --- 2. Dynamic Services ---
  // Re-create service instances whenever activeFarmId changes.
  // If activeFarmId is null, use root collections (Legacy mode).
  // If activeFarmId is set, use `farms/{id}/{collection}`.
  const services = useMemo(() => {
    const getPath = (col: string) => activeFarmId ? `farms/${activeFarmId}/${col}` : col;

    return {
        employees: new FirestoreService<Employee>(getPath('employees')),
        groups: new FirestoreService<Group>(getPath('groups')),
        travels: new FirestoreService<Travel>(getPath('travels')),
        lands: new FirestoreService<Land>(getPath('lands')),
        plates: new FirestoreService<Plate>(getPath('plates')),
        destinations: new FirestoreService<Destination>(getPath('destinations')),
        drivers: new FirestoreService<Driver>(getPath('drivers')),
        debts: new FirestoreService<Debt>(getPath('debts')),
        expenses: new FirestoreService<OtherExpense>(getPath('expenses')),
        loans: new FirestoreService<Loan>(getPath('loans')),
        computations: new FirestoreService<CalculatorComputation>(getPath('computations')),
    };
  }, [activeFarmId]);

  // --- 3. Data Subscriptions ---
  useEffect(() => {
    // Subscribe using the dynamic services
    const unsubEmp = services.employees.subscribe(data => { setEmployees(data); loaded('employees'); }, setError, [orderBy('name')]);
    const unsubGrp = services.groups.subscribe(data => { setGroups(data); loaded('groups'); }, setError, [orderBy('created_at', 'desc')]);
    const unsubTrv = services.travels.subscribe(data => { setTravels(data); loaded('travels'); }, setError); 
    const unsubLnd = services.lands.subscribe(data => { setLands(data); loaded('lands'); }, setError, [orderBy('name')]);
    const unsubPlt = services.plates.subscribe(data => { setPlates(data); loaded('plates'); }, setError, [orderBy('name')]);
    const unsubDst = services.destinations.subscribe(data => { setDestinations(data); loaded('destinations'); }, setError, [orderBy('name')]);
    const unsubDrv = services.drivers.subscribe(data => { setDrivers(data); loaded('drivers'); }, setError);
    const unsubDbt = services.debts.subscribe(data => { setDebts(data); loaded('debts'); }, setError);
    const unsubExp = services.expenses.subscribe(data => { setExpenses(data); loaded('expenses'); }, setError, [orderBy('date', 'desc')]);
    const unsubComp = services.computations.subscribe(data => { setComputations(data); loaded('computations'); }, setError, [orderBy('createdAt', 'desc')]);
    
    // Changed: Removed orderBy constraint and sorting client-side to show legacy/all loans
    const unsubLn = services.loans.subscribe(data => { 
      const sortedLoans = data.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setLoans(sortedLoans); 
      loaded('loans'); 
    }, setError);

    return () => {
      unsubEmp(); unsubGrp(); unsubTrv(); unsubLnd();
      unsubPlt(); unsubDst(); unsubDrv(); unsubDbt();
      unsubExp(); unsubLn(); unsubComp();
    };
  }, [services]); // Re-run when services change (which happens when activeFarmId changes)

  const isLoading = Object.values(loadingState).some(s => s);

  const value = {
    farms, activeFarmId, setActiveFarmId: handleSetActiveFarm, createFarm: handleCreateFarm, removeFarm: handleRemoveFarm,
    employees, groups, travels, lands, plates, destinations, drivers, debts, expenses, loans, computations,
    isLoading,
    error,
    services
  };

  return (
    <FarmContext.Provider value={value}>
      {children}
    </FarmContext.Provider>
  );
};

export const useFarmData = () => {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarmData must be used within a FarmProvider');
  }
  return context;
};