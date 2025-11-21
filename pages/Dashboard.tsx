import React, { useEffect, useState, useMemo } from 'react';
import { Users, DollarSign, Layers, CreditCard, Loader2 } from 'lucide-react';
import * as TravelService from '../services/travelService';
import * as EmployeeService from '../services/employeeService';
import * as DebtService from '../services/debtService';
import * as LandService from '../services/landService';
import * as GroupService from '../services/groupService';
import * as PlateService from '../services/plateService';
import * as DestinationService from '../services/destinationService';
import { Travel, Employee, Debt, Land, Group, Plate, Destination } from '../types';

import {
  WelcomeSection,
  TargetCard,
  RecentTravelsList,
  StatCard,
  RevenueChart,
  LandDistributionChart,
  DebtStatusCard,
  RecentActivities,
  RecentTravelsTable
} from '../features/dashboard/DashboardWidgets';

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [travels, setTravels] = useState<Travel[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [lands, setLands] = useState<Land[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [plates, setPlates] = useState<Plate[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          travelsData, 
          employeesData, 
          debtsData, 
          landsData,
          groupsData,
          platesData,
          destData
        ] = await Promise.all([
          TravelService.getAllTravels(),
          EmployeeService.getEmployees(),
          DebtService.getDebts(),
          LandService.getLands(),
          GroupService.getGroups(),
          PlateService.getPlates(),
          DestinationService.getDestinations()
        ]);

        // Sort travels by date desc if available, else by ID
        const sortedTravels = travelsData.sort((a, b) => {
           const dateA = a.date ? new Date(a.date).getTime() : 0;
           const dateB = b.date ? new Date(b.date).getTime() : 0;
           return dateB - dateA;
        });

        setTravels(sortedTravels);
        setEmployees(employeesData);
        setDebts(debtsData);
        setLands(landsData);
        setGroups(groupsData);
        setPlates(platesData);
        setDestinations(destData);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // --- HELPERS ---
  const getLandName = (id: string) => lands.find(l => l.id === id)?.name || id;
  const getPlateName = (id: string) => plates.find(p => p.id === id)?.name || id;
  const getDestName = (id: string) => destinations.find(d => d.id === id)?.name || id;
  const getDriverName = (id: string) => employees.find(e => e.id === id)?.name || id;

  // --- ANALYTICS ---

  const totalEmployees = employees.length;
  const totalGroups = groups.length;
  const totalDebtsUnpaid = debts.reduce((sum, d) => !d.paid ? sum + d.amount : sum, 0);
  const totalTons = travels.reduce((sum, t) => sum + (t.tons || 0), 0);

  // Financials
  const financialSummary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    travels.forEach(t => {
       const income = ((t.sugarcane_price || 0) * (t.bags || 0)) + ((t.molasses_price || 0) * (t.molasses || 0));
       
       const group = groups.find(g => g.id === t.groupId);
       const wageRate = group?.wage || 0;
       const wages = (t.tons || 0) * wageRate;
       const otherExp = t.expenses?.reduce((s, e) => s + e.amount, 0) || 0;
       const expense = wages + (t.driverTip || 0) + otherExp;

       totalIncome += income;
       totalExpense += expense;
    });
    return { totalIncome, totalExpense, net: totalIncome - totalExpense };
  }, [travels, groups]);

  // Revenue Chart Data (Weekly - Current Year)
  const revenueChartData = useMemo(() => {
     const weekMap: Record<string, { income: number, expense: number, dateVal: number }> = {};
     const currentYear = new Date().getFullYear();

     // Helper to get Monday of the week for a given date object
     const getMonday = (d: Date) => {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
     };

     travels.forEach(t => {
        if (!t.date) return;
        
        // Force interpretation as local date based on YYYY-MM-DD string to match "GMT+8" user intent
        // splitting prevents timezone offsets from shifting the day
        const parts = t.date.split('-');
        if (parts.length !== 3) return;
        
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // JS months are 0-11
        const day = parseInt(parts[2]);
        const d = new Date(year, month, day);

        // Filter for Current Year
        if (d.getFullYear() === currentYear) {
            // Get Start of Week (Monday)
            const monday = getMonday(new Date(d.getTime())); // clone to avoid mutation
            monday.setHours(0, 0, 0, 0);
            
            const sortKey = monday.getTime();

            if (!weekMap[sortKey]) {
                weekMap[sortKey] = { income: 0, expense: 0, dateVal: sortKey };
            }
            
            const income = ((t.sugarcane_price || 0) * (t.bags || 0)) + ((t.molasses_price || 0) * (t.molasses || 0));
            
            const group = groups.find(g => g.id === t.groupId);
            const wages = (t.tons || 0) * (group?.wage || 0);
            const otherExp = t.expenses?.reduce((s, e) => s + e.amount, 0) || 0;
            const expense = wages + (t.driverTip || 0) + otherExp;

            weekMap[sortKey].income += income;
            weekMap[sortKey].expense += expense;
        }
     });

     return Object.values(weekMap)
        .sort((a, b) => a.dateVal - b.dateVal)
        .map(item => ({
            name: new Date(item.dateVal).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            income: item.income,
            expense: item.expense,
            profit: item.income - item.expense
        }));

  }, [travels, groups]);

  // Land Distribution Data (Pie Chart)
  const landChartData = useMemo(() => {
     const counts: Record<string, number> = {};
     travels.forEach(t => {
        const name = getLandName(t.land);
        counts[name] = (counts[name] || 0) + 1;
     });

     const colors = ['#778873', '#A1BC98', '#D2DCB6', '#E5ECD0', '#F87171'];
     return Object.entries(counts).map(([name, value], idx) => ({
        name,
        value,
        color: colors[idx % colors.length]
     }));
  }, [travels, lands]);

  // Debt Stats
  const debtStats = useMemo(() => {
      const paid = debts.filter(d => d.paid).length;
      const unpaid = debts.filter(d => !d.paid).length;
      return { paid, unpaid };
  }, [debts]);


  if (isLoading) {
      return (
          <div className="flex h-screen items-center justify-center text-sage-500">
              <Loader2 size={48} className="animate-spin mb-2" />
          </div>
      );
  }

  return (
    <>
      <WelcomeSection />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
        {/* LEFT COLUMN (3 spans desktop, 1 span mobile/tablet) */}
        <div className="md:col-span-1 xl:col-span-3 flex flex-col gap-6 order-2 xl:order-1">
          <TargetCard totalTons={totalTons} />
          <RecentTravelsList travels={travels} getLandName={getLandName} getDestName={getDestName} />
        </div>

        {/* MIDDLE COLUMN (6 spans desktop, 2 spans tablet) */}
        <div className="md:col-span-2 xl:col-span-6 flex flex-col gap-6 order-1 xl:order-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <StatCard 
                label="Total Revenue" 
                value={`₱${financialSummary.totalIncome.toLocaleString()}`} 
                color="#778873" 
                icon={DollarSign} 
                trend={12} trendUp={true}
                data={[10, 20, 15, 30, 25, 40]} // Mock sparkline for now as historical aggregation is complex
             />
             <StatCard 
                label="Employees" 
                value={totalEmployees.toString()} 
                color="#A1BC98" 
                icon={Users} 
             />
             <StatCard 
                label="Active Groups" 
                value={totalGroups.toString()} 
                color="#D2DCB6" 
                icon={Layers} 
             />
              <StatCard 
                label="Unpaid Debt" 
                value={`₱${totalDebtsUnpaid.toLocaleString()}`} 
                color="#F87171" 
                icon={CreditCard} 
                trend={5} trendUp={false}
             />
          </div>
          <RevenueChart data={revenueChartData} />
        </div>

        {/* RIGHT COLUMN (3 spans desktop, 1 span tablet) */}
        <div className="md:col-span-1 xl:col-span-3 flex flex-col gap-6 order-3">
          <LandDistributionChart data={landChartData} totalValue={travels.length} title="Travels by Land" />
          <DebtStatusCard paidCount={debtStats.paid} unpaidCount={debtStats.unpaid} totalUnpaid={totalDebtsUnpaid} />
          <RecentActivities />
        </div>

        {/* BOTTOM ROW (Full Width) - Deals Statistics Table */}
        <div className="col-span-1 md:col-span-2 xl:col-span-12 order-4">
          <RecentTravelsTable travels={travels} getLandName={getLandName} getPlateName={getPlateName} getDriverName={getDriverName} />
        </div>
      </div>
    </>
  );
};

export default Dashboard;