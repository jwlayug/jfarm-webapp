
import React, { useMemo, useState } from 'react';
import { Users, DollarSign, Layers, CreditCard, Loader2 } from 'lucide-react';
import { useFarmData } from '../context/FarmContext';
import { AnalyticsEngine } from '../utils/AnalyticsEngine';
import { Travel } from '../types';
import TravelDetailsModal from '../components/modals/TravelDetailsModal';

import {
  WelcomeSection,
  TargetCard,
  RecentTravelsList,
  StatCard,
  RevenueChart,
  EmployeePerformanceChart,
  DistributionChart,
  DebtStatusCard,
  RecentActivities,
  RecentTravelsTable,
  ExpenseStructureChart,
  GroupProductivityChart,
  DailyTonnageChart
} from '../features/dashboard/DashboardWidgets';

const Dashboard: React.FC = () => {
  // Consume global real-time data
  const { 
    travels, employees, debts, lands, groups, plates, destinations, drivers, expenses,
    isLoading 
  } = useFarmData();

  // --- Modal State ---
  const [viewingTravel, setViewingTravel] = useState<Travel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- ANALYTICS (Processed via OOP Engine) ---
  
  const globalStats = useMemo(() => 
    AnalyticsEngine.getGlobalStats(travels, groups, employees, debts, drivers), 
    [travels, groups, employees, debts, drivers]
  );

  const revenueChartData = useMemo(() => 
      AnalyticsEngine.getDailyRevenueData(travels, groups, drivers), 
    [travels, groups, drivers]
  );

  const tonnageChartData = useMemo(() => 
    AnalyticsEngine.getDailyTonnageData(travels),
    [travels]
  );

  const landChartData = useMemo(() => 
    AnalyticsEngine.getLandDistribution(travels, lands), 
    [travels, lands]
  );

  const destinationChartData = useMemo(() => 
    AnalyticsEngine.getDestinationDistribution(travels, destinations),
    [travels, destinations]
  );

  const expenseData = useMemo(() => 
    AnalyticsEngine.getExpenseBreakdown(travels, groups, expenses, drivers),
    [travels, groups, expenses, drivers]
  );

  const groupPerformanceData = useMemo(() => 
    AnalyticsEngine.getGroupPerformance(travels, groups),
    [travels, groups]
  );

  const employeePerformance = useMemo(() => {
    return AnalyticsEngine.getEmployeeEarningsReport(employees, travels, groups, debts, drivers)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(emp => ({ 
        name: emp.name, 
        totalWage: emp.totalWage, 
        daysWorked: emp.daysWorked,
        unpaidDebt: emp.unpaidDebt
      }));
  }, [employees, travels, groups, debts, drivers]);

  const debtStats = useMemo(() => ({
      paid: debts.filter(d => d.paid).length,
      unpaid: debts.filter(d => !d.paid).length
  }), [debts]);

  // Sort travels for lists (UI logic)
  const sortedTravels = useMemo(() => 
    [...travels].sort((a, b) => {
       const getDate = (t: Travel) => {
          // 1. Try parsing the Name as user names travels by date (e.g. "November 17, 2025")
          const nameTime = new Date(t.name).getTime();
          if (!isNaN(nameTime)) return nameTime;
          
          // 2. Fallback to explicit date field
          if (t.date) return new Date(t.date).getTime();
          return 0;
       };

       return getDate(b) - getDate(a);
    }), 
  [travels]);

  // Helpers for Child Components
  const getLandName = (id: string) => lands.find(l => l.id === id)?.name || id;
  const getPlateName = (id: string) => plates.find(p => p.id === id)?.name || id;
  const getDestName = (id: string) => destinations.find(d => d.id === id)?.name || id;
  const getDriverName = (id: string) => employees.find(e => e.id === id)?.name || id;

  const handleViewTravel = (travel: Travel) => {
    setViewingTravel(travel);
    setIsModalOpen(true);
  };

  if (isLoading) {
      return (
          <div className="flex h-screen items-center justify-center text-sage-500">
              <Loader2 size={48} className="animate-spin mb-2" />
          </div>
      );
  }

  const activeGroup = viewingTravel ? groups.find(g => g.id === viewingTravel.groupId) || null : null;

  return (
    <>
      <WelcomeSection />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="md:col-span-1 xl:col-span-3 flex flex-col gap-6 order-2 xl:order-1">
          <TargetCard totalTons={globalStats.totalTons} />
          <RecentTravelsList travels={sortedTravels} getLandName={getLandName} getDestName={getDestName} />
          <DailyTonnageChart data={tonnageChartData} />
          <DistributionChart data={destinationChartData} totalValue={travels.length} title="Travels by Destination" />
          <ExpenseStructureChart data={expenseData} />
        </div>

        {/* MIDDLE COLUMN */}
        <div className="md:col-span-2 xl:col-span-6 flex flex-col gap-6 order-1 xl:order-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <StatCard 
                label="Total Revenue" 
                value={`₱${globalStats.totalRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}`} 
                color="#778873" 
                icon={DollarSign} 
                trend={12} trendUp={true}
                data={[10, 20, 15, 30, 25, 40]} 
             />
             <StatCard 
                label="Employees" 
                value={globalStats.totalEmployees.toString()} 
                color="#A1BC98" 
                icon={Users} 
             />
             <StatCard 
                label="Active Groups" 
                value={globalStats.activeGroups.toString()} 
                color="#D2DCB6" 
                icon={Layers} 
             />
              <StatCard 
                label="Unpaid Debt" 
                value={`₱${globalStats.unpaidDebts.toLocaleString()}`} 
                color="#F87171" 
                icon={CreditCard} 
                trend={5} trendUp={false}
             />
          </div>
          <RevenueChart data={revenueChartData} />
        </div>

        {/* RIGHT COLUMN */}
        <div className="md:col-span-1 xl:col-span-3 flex flex-col gap-6 order-3">
          <DistributionChart data={landChartData} totalValue={travels.length} title="Travels by Land" />
          <DebtStatusCard paidCount={debtStats.paid} unpaidCount={debtStats.unpaid} totalUnpaid={globalStats.unpaidDebts} />
          <RecentActivities />
          <GroupProductivityChart data={groupPerformanceData} />
        </div>

        {/* FULL WIDTH ROWS */}
        <div className="col-span-1 md:col-span-2 xl:col-span-12 order-4">
          <EmployeePerformanceChart data={employeePerformance} />
        </div>

        <div className="col-span-1 md:col-span-2 xl:col-span-12 order-5">
          <RecentTravelsTable 
             travels={sortedTravels} 
             getLandName={getLandName} 
             getPlateName={getPlateName} 
             getDriverName={getDriverName}
             onView={handleViewTravel}
          />
        </div>
      </div>

      {/* Detail Modal */}
      <TravelDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        travel={viewingTravel}
        group={activeGroup}
        employees={employees}
        lands={lands}
        plates={plates}
        destinations={destinations}
        drivers={drivers}
      />
    </>
  );
};

export default Dashboard;
