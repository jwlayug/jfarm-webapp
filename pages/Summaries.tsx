import React, { useEffect, useState, useMemo } from 'react';
import { 
  FileText, Download, Users, Layers, Map, 
  Calendar, Filter, TrendingUp, TrendingDown, 
  Loader2, CreditCard, DollarSign, ChevronUp, ChevronDown, Sprout 
} from 'lucide-react';
import { 
  Employee, Group, Travel, Land, 
  Plate, Destination, Driver, Debt 
} from '../types';
import * as EmployeeService from '../services/employeeService';
import * as GroupService from '../services/groupService';
import * as TravelService from '../services/travelService';
import * as LandService from '../services/landService';
import * as PlateService from '../services/plateService';
import * as DestinationService from '../services/destinationService';
import * as DriverService from '../services/driverService';
import * as DebtService from '../services/debtService';

// --- TYPES ---
type TabType = 'employee' | 'group' | 'land';

const Summaries: React.FC = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<TabType>('employee');
  const [isLoading, setIsLoading] = useState(true);

  // Data State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [travels, setTravels] = useState<Travel[]>([]);
  const [lands, setLands] = useState<Land[]>([]);
  const [plates, setPlates] = useState<Plate[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);

  // Filters
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [selectedLandId, setSelectedLandId] = useState<string>('all');
  const [selectedDestId, setSelectedDestId] = useState<string>('all');
  const [selectedPlateId, setSelectedPlateId] = useState<string>('all');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('all');

  // Table Controls
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [
          emps, grps, trvs, lnds, plts, dests, drvs, dbts
        ] = await Promise.all([
          EmployeeService.getEmployees(),
          GroupService.getGroups(),
          TravelService.getAllTravels(),
          LandService.getLands(),
          PlateService.getPlates(),
          DestinationService.getDestinations(),
          DriverService.getDrivers(),
          DebtService.getDebts(),
        ]);

        setEmployees(emps);
        setGroups(grps);
        setTravels(trvs);
        setLands(lnds);
        setPlates(plts);
        setDestinations(dests);
        setDrivers(drvs);
        setDebts(dbts);
      } catch (error) {
        console.error("Error loading summary data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Reset pagination when tabs or filters change
  useEffect(() => {
      setCurrentPage(1);
  }, [activeTab, selectedGroupId, selectedLandId, selectedDestId, selectedPlateId, selectedDriverId, searchQuery, entriesPerPage]);


  // --- HELPERS ---
  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || id;
  const getGroupName = (id: string) => groups.find(g => g.id === id)?.name || 'Unknown Group';
  const getLandName = (id: string) => lands.find(l => l.id === id)?.name || id;
  const getPlateName = (id: string) => plates.find(p => p.id === id)?.name || id;
  const getDestName = (id: string) => destinations.find(d => d.id === id)?.name || id;
  
  const formatCurrency = (amount: number) => 
    `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // --- CALCULATIONS ---

  // Filtered Travels based on active tab and selections
  const filteredTravels = useMemo(() => {
    return travels.filter(t => {
      // Group Filter (Applies to all tabs if relevant, but mostly Employee/Group)
      if (selectedGroupId !== 'all' && t.groupId !== selectedGroupId) return false;

      // Land Tab Specific Filters
      if (activeTab === 'land') {
        if (selectedLandId !== 'all' && t.land !== selectedLandId) return false;
        if (selectedDestId !== 'all' && t.destination !== selectedDestId) return false;
        if (selectedPlateId !== 'all' && t.plateNumber !== selectedPlateId) return false;
        if (selectedDriverId !== 'all' && t.driver !== selectedDriverId) return false;
      }

      return true;
    });
  }, [travels, selectedGroupId, selectedLandId, selectedDestId, selectedPlateId, selectedDriverId, activeTab]);

  // Helper to get financial metrics for a single travel
  const getTravelFinancials = (travel: Travel) => {
    // INCOME
    const sugarIncome = (travel.sugarcane_price || 0) * (travel.bags || 0);
    const molassesIncome = (travel.molasses_price || 0) * (travel.molasses || 0);
    const totalIncome = sugarIncome + molassesIncome;

    // EXPENSES
    const group = groups.find(g => g.id === travel.groupId);
    const groupWage = group?.wage || 0;
    const totalWagePot = (travel.tons || 0) * groupWage;
    const driverTip = travel.driverTip || 0;
    const otherExpenses = travel.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const totalExpenses = totalWagePot + driverTip + otherExpenses;

    // NET
    const netIncome = totalIncome - totalExpenses;

    // STAFF WAGE PER PERSON (For Employee View)
    const presentStaff = (travel.attendance || []).filter(a => {
      if (!a.present) return false;
      const emp = employees.find(e => e.id === a.employeeId);
      return emp?.type === 'Staff';
    });
    const wagePerStaff = presentStaff.length > 0 ? totalWagePot / presentStaff.length : 0;

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      wagePerStaff,
      presentStaffIds: presentStaff.map(a => a.employeeId),
      driverId: travel.driver,
      driverTip,
      tons: travel.tons || 0
    };
  };

  // --- VIEW 1: EMPLOYEE SUMMARY DATA ---
  const employeeSummaryData = useMemo(() => {
    if (activeTab !== 'employee') return [];

    return employees.map(emp => {
      let daysWorked = 0;
      let totalWage = 0;

      // Calculate Travel Earnings
      filteredTravels.forEach(travel => {
        const financials = getTravelFinancials(travel);
        
        if (emp.type === 'Staff') {
          if (financials.presentStaffIds.includes(emp.id)) {
            daysWorked++;
            totalWage += financials.wagePerStaff;
          }
        } else if (emp.type === 'Driver') {
          if (travel.driver === emp.id) {
             daysWorked++;
             const driverConfig = drivers.find(d => d.employeeId === emp.id);
             const baseWage = driverConfig?.wage || 0;
             totalWage += (baseWage - financials.driverTip);
          }
        }
      });

      // Debts
      const employeeDebts = debts
        .filter(d => d.employeeId === emp.id && !d.paid)
        .reduce((sum, d) => sum + d.amount, 0);

      return {
        ...emp,
        daysWorked,
        totalWage,
        unpaidDebt: employeeDebts
      };
    })
    .filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase())) // Apply local table search
    .sort((a, b) => b.totalWage - a.totalWage); // Sort by highest earner
  }, [employees, filteredTravels, debts, drivers, activeTab, searchQuery]);

  // Aggregates for Employee View
  const empAggregates = useMemo(() => {
    return employeeSummaryData.reduce((acc, curr) => ({
      totalDays: acc.totalDays + curr.daysWorked,
      totalWages: acc.totalWages + curr.totalWage,
      totalDebts: acc.totalDebts + curr.unpaidDebt
    }), { totalDays: 0, totalWages: 0, totalDebts: 0 });
  }, [employeeSummaryData]);


  // --- VIEW 2 & 3: GROUP / LAND SUMMARY DATA ---
  const travelSummaryData = useMemo(() => {
    return filteredTravels
      .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())) // Apply local table search
      .map(travel => {
       const financials = getTravelFinancials(travel);
       return {
         ...travel,
         ...financials
       };
    });
  }, [filteredTravels, groups, employees, searchQuery]);

  // Aggregates for Group/Land View
  const travelAggregates = useMemo(() => {
    return travelSummaryData.reduce((acc, curr) => ({
      count: acc.count + 1,
      tons: acc.tons + curr.tons,
      income: acc.income + curr.totalIncome,
      expenses: acc.expenses + curr.totalExpenses,
      net: acc.net + curr.netIncome
    }), { count: 0, tons: 0, income: 0, expenses: 0, net: 0 });
  }, [travelSummaryData]);

  // --- PAGINATION UTILS ---
  const getPaginatedData = (data: any[]) => {
      const totalPages = Math.ceil(data.length / entriesPerPage);
      const indexOfLastItem = currentPage * entriesPerPage;
      const indexOfFirstItem = indexOfLastItem - entriesPerPage;
      const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
      return { currentItems, totalPages, indexOfFirstItem, indexOfLastItem };
  };

  const handlePageChange = (page: number, totalPages: number) => {
      if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
      }
  };

  // --- COMPONENT RENDERERS ---

  const SummaryCard = ({ label, value, colorClass, icon: Icon, subValue }: any) => (
    <div className={`p-6 rounded-2xl shadow-sm border transition-all duration-200 ${colorClass}`}>
       <div className="flex justify-between items-start mb-2">
          <p className="text-xs font-bold uppercase tracking-wider opacity-70 truncate">{label}</p>
          {Icon && <div className="p-2 rounded-lg bg-white/50"><Icon size={18} /></div>}
       </div>
       <p className="text-3xl font-bold tracking-tight truncate">{value}</p>
       {subValue && <p className="text-xs mt-1 opacity-70 font-medium">{subValue}</p>}
    </div>
  );

  const PaginationControls = ({ totalItems, totalPages, indexOfFirstItem, indexOfLastItem }: any) => (
    <div className="p-4 border-t border-sage-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-sage-500">
        <div>
            Showing {totalItems > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
        </div>
        <div className="flex gap-1">
            <button 
                onClick={() => handlePageChange(currentPage - 1, totalPages)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-sage-200 rounded hover:bg-sage-50 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                    key={page}
                    onClick={() => handlePageChange(page, totalPages)}
                    className={`px-3 py-1 border rounded text-xs ${currentPage === page ? 'bg-sage-600 text-white border-sage-600' : 'border-sage-200 hover:bg-sage-50'}`}
                >
                    {page}
                </button>
            ))}

            <button 
                onClick={() => handlePageChange(currentPage + 1, totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 border border-sage-200 rounded hover:bg-sage-50 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
    </div>
  );

  return (
    <div className="space-y-6 min-h-screen pb-20">
      {/* HEADER & TABS */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Global Summary</h1>
          <p className="text-sage-500 text-sm">Comprehensive view of operations and finances.</p>
        </div>

        {/* Custom Tab Navigation - Responsive scrollable container */}
        <div className="overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="bg-white p-1.5 rounded-xl border border-sage-100 shadow-sm inline-flex w-full md:w-auto min-w-max">
             {[
               { id: 'employee', label: 'Employee Summary', icon: Users },
               { id: 'group', label: 'Group Summary', icon: Layers },
               { id: 'land', label: 'Land Summary', icon: Map },
             ].map((tab) => (
               <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as TabType); setSearchQuery(''); }}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap
                    ${activeTab === tab.id 
                      ? 'bg-sage-600 text-white shadow-md' 
                      : 'text-sage-500 hover:bg-sage-50 hover:text-sage-700'}
                  `}
               >
                 <tab.icon size={16} />
                 {tab.label}
               </button>
             ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 text-sage-400">
          <Loader2 size={40} className="animate-spin mb-4" />
          <p>Crunching the numbers...</p>
        </div>
      ) : (
        <>
          {/* --- FILTERS BAR (Dataset Control) --- */}
          <div className="bg-white p-4 rounded-xl border border-sage-100 shadow-sm flex flex-col lg:flex-row gap-4 justify-between">
             <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-1 text-sage-400 mb-1 sm:mb-0">
                    <Filter size={16} />
                </div>
                
                {/* Group Filter (Available on all tabs) */}
                <select 
                  value={selectedGroupId} 
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="flex-1 sm:flex-none w-full sm:w-auto px-3 py-2 bg-sage-50 border border-sage-200 rounded-lg text-sm font-medium text-sage-700 focus:outline-none focus:border-sage-400 hover:border-sage-300 transition-colors"
                >
                  <option value="all">All Groups</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>

                {/* Land Tab Specific Filters */}
                {activeTab === 'land' && (
                  <>
                    <select 
                      value={selectedLandId} 
                      onChange={(e) => setSelectedLandId(e.target.value)}
                      className="flex-1 sm:flex-none w-full sm:w-auto px-3 py-2 bg-sage-50 border border-sage-200 rounded-lg text-sm font-medium text-sage-700 focus:outline-none focus:border-sage-400 hover:border-sage-300 transition-colors"
                    >
                      <option value="all">All Lands</option>
                      {lands.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>

                     <select 
                      value={selectedDestId} 
                      onChange={(e) => setSelectedDestId(e.target.value)}
                      className="flex-1 sm:flex-none w-full sm:w-auto px-3 py-2 bg-sage-50 border border-sage-200 rounded-lg text-sm font-medium text-sage-700 focus:outline-none focus:border-sage-400 hover:border-sage-300 transition-colors"
                    >
                      <option value="all">All Destinations</option>
                      {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>

                    <select 
                      value={selectedPlateId} 
                      onChange={(e) => setSelectedPlateId(e.target.value)}
                      className="flex-1 sm:flex-none w-full sm:w-auto px-3 py-2 bg-sage-50 border border-sage-200 rounded-lg text-sm font-medium text-sage-700 focus:outline-none focus:border-sage-400 hover:border-sage-300 transition-colors"
                    >
                      <option value="all">All Plates</option>
                      {plates.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>

                    <select 
                      value={selectedDriverId} 
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      className="flex-1 sm:flex-none w-full sm:w-auto px-3 py-2 bg-sage-50 border border-sage-200 rounded-lg text-sm font-medium text-sage-700 focus:outline-none focus:border-sage-400 hover:border-sage-300 transition-colors"
                    >
                      <option value="all">All Drivers</option>
                      {drivers.map(d => {
                         const emp = employees.find(e => e.id === d.employeeId);
                         return <option key={d.id} value={d.employeeId}>{emp?.name || d.employeeId}</option>;
                      })}
                    </select>
                  </>
                )}
             </div>

             <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors lg:ml-auto">
                <Download size={16} /> <span className="sm:hidden lg:inline">Download</span> Report
             </button>
          </div>

          {/* --- CONTENT: EMPLOYEE VIEW --- */}
          {activeTab === 'employee' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Summary Cards - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                   <SummaryCard 
                      label="Total Days Worked" 
                      value={empAggregates.totalDays}
                      colorClass="bg-blue-50 border-blue-100 text-blue-700"
                      icon={Calendar}
                   />
                   <SummaryCard 
                      label="Total Wages Paid" 
                      value={formatCurrency(empAggregates.totalWages)}
                      colorClass="bg-green-50 border-green-100 text-green-700"
                      icon={DollarSign}
                   />
                   <SummaryCard 
                      label="Unpaid Debt" 
                      value={formatCurrency(empAggregates.totalDebts)}
                      colorClass="bg-amber-50 border-amber-100 text-amber-700"
                      icon={CreditCard}
                   />
                </div>

                {/* DATATABLE */}
                <div className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-hidden">
                   {/* Controls */}
                   <div className="p-4 border-b border-sage-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm text-sage-600">
                          <span>Show</span>
                          <select 
                              value={entriesPerPage}
                              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                              className="bg-sage-50 border border-sage-200 rounded px-2 py-1 focus:outline-none focus:border-sage-400 text-sage-700 text-xs"
                          >
                              <option value={10}>10</option>
                              <option value={25}>25</option>
                              <option value={50}>50</option>
                          </select>
                          <span>entries</span>
                      </div>
                      <div className="relative w-full sm:w-auto">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400 font-medium text-xs">Search:</span>
                          <input 
                              type="text" 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-16 pr-4 py-1.5 border border-sage-200 rounded-lg text-sm focus:outline-none focus:border-sage-400 w-full sm:w-64"
                          />
                      </div>
                  </div>

                  {/* Data Slicing for Employee */}
                  {(() => {
                      const { currentItems, totalPages, indexOfFirstItem, indexOfLastItem } = getPaginatedData(employeeSummaryData);
                      
                      return (
                        <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead className="bg-sage-50 text-sage-700 text-xs uppercase font-bold tracking-wider border-b border-sage-200">
                                    <tr>
                                    <th className="px-6 py-4 cursor-pointer hover:text-sage-800 group">
                                        <div className="flex items-center justify-between">
                                                Employee
                                                <div className="flex flex-col opacity-50 group-hover:opacity-100"><ChevronUp size={8} /><ChevronDown size={8} className="-mt-1"/></div>
                                            </div>
                                    </th>
                                    <th className="px-6 py-4 text-center">Days Present</th>
                                    <th className="px-6 py-4 text-right cursor-pointer hover:text-sage-800 group">
                                        <div className="flex items-center justify-end gap-2">
                                                Total Earnings
                                                <div className="flex flex-col opacity-50 group-hover:opacity-100"><ChevronUp size={8} /><ChevronDown size={8} className="-mt-1"/></div>
                                            </div>
                                    </th>
                                    <th className="px-6 py-4 text-right text-red-600">Unpaid Debt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sage-100">
                                    {currentItems.map(emp => (
                                    <tr key={emp.id} className="hover:bg-sage-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-sage-800">{emp.name}</div>
                                            <div className="text-xs text-sage-400 font-medium bg-sage-100 inline-block px-2 py-0.5 rounded mt-1">{emp.type}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-bold text-sm">{emp.daysWorked}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-sage-700">
                                            {formatCurrency(emp.totalWage)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-red-500">
                                            {emp.unpaidDebt > 0 ? formatCurrency(emp.unpaidDebt) : <span className="text-sage-300">-</span>}
                                        </td>
                                    </tr>
                                    ))}
                                    {currentItems.length === 0 && (
                                    <tr><td colSpan={4} className="p-8 text-center text-sage-400 italic">No employee data found based on filters.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <PaginationControls 
                            totalItems={employeeSummaryData.length} 
                            totalPages={totalPages} 
                            indexOfFirstItem={indexOfFirstItem} 
                            indexOfLastItem={indexOfLastItem} 
                        />
                        </>
                      );
                  })()}
                </div>
             </div>
          )}

          {/* --- CONTENT: GROUP & LAND VIEW --- */}
          {(activeTab === 'group' || activeTab === 'land') && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Summary Cards - Responsive Grid for Fold (2 cols) and Desktop (5 cols) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                   <SummaryCard 
                      label="Total Travels" 
                      value={travelAggregates.count}
                      colorClass="bg-blue-50 border-blue-100 text-blue-700"
                   />
                   <SummaryCard 
                      label="Total Tons" 
                      value={travelAggregates.tons.toFixed(2)}
                      colorClass="bg-yellow-50 border-yellow-100 text-yellow-700"
                   />
                   <SummaryCard 
                      label="Total Income" 
                      value={formatCurrency(travelAggregates.income)}
                      colorClass="bg-indigo-50 border-indigo-100 text-indigo-700"
                   />
                   <SummaryCard 
                      label="Total Expenses" 
                      value={formatCurrency(travelAggregates.expenses)}
                      colorClass="bg-red-50 border-red-100 text-red-700"
                   />
                   <SummaryCard 
                      label="Net Income" 
                      value={formatCurrency(travelAggregates.net)}
                      colorClass={`${travelAggregates.net >= 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}
                   />
                </div>

                {/* DATATABLE */}
                <div className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-hidden">
                    {/* Controls */}
                   <div className="p-4 border-b border-sage-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm text-sage-600">
                          <span>Show</span>
                          <select 
                              value={entriesPerPage}
                              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                              className="bg-sage-50 border border-sage-200 rounded px-2 py-1 focus:outline-none focus:border-sage-400 text-sage-700 text-xs"
                          >
                              <option value={10}>10</option>
                              <option value={25}>25</option>
                              <option value={50}>50</option>
                          </select>
                          <span>entries</span>
                      </div>
                      <div className="relative w-full sm:w-auto">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400 font-medium text-xs">Search:</span>
                          <input 
                              type="text" 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-16 pr-4 py-1.5 border border-sage-200 rounded-lg text-sm focus:outline-none focus:border-sage-400 w-full sm:w-64"
                          />
                      </div>
                  </div>

                   {/* Data Slicing for Travels */}
                   {(() => {
                        const { currentItems, totalPages, indexOfFirstItem, indexOfLastItem } = getPaginatedData(travelSummaryData);

                        return (
                            <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead className="bg-sage-50 text-sage-700 text-xs uppercase font-bold tracking-wider border-b border-sage-200">
                                        <tr>
                                        {activeTab === 'land' && <th className="px-6 py-4">Land Source</th>}
                                        <th className="px-6 py-4">Travel Record</th>
                                        <th className="px-6 py-4">Route Details</th>
                                        <th className="px-6 py-4">Driver</th>
                                        <th className="px-6 py-4 text-right">Tons</th>
                                        <th className="px-6 py-4 text-right text-indigo-600">Income</th>
                                        <th className="px-6 py-4 text-right text-red-500">Expenses</th>
                                        <th className="px-6 py-4 text-right cursor-pointer hover:text-sage-800 group">
                                            <div className="flex items-center justify-end gap-2">
                                                    Net
                                                    <div className="flex flex-col opacity-50 group-hover:opacity-100"><ChevronUp size={8} /><ChevronDown size={8} className="-mt-1"/></div>
                                                </div>
                                        </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-sage-100">
                                        {currentItems.map(travel => (
                                        <tr key={travel.id} className="hover:bg-sage-50 transition-colors group">
                                            {activeTab === 'land' && (
                                                <td className="px-6 py-4 font-medium text-sage-800">
                                                    <div className="flex items-center gap-2">
                                                    <Map size={14} className="text-sage-400"/>
                                                    {getLandName(travel.land)}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-sage-800">{travel.name}</div>
                                                {travel.ticket && (
                                                <div className="text-xs text-blue-600 bg-blue-50 inline-block px-1.5 rounded mt-1 font-mono">
                                                    {travel.ticket}
                                                </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-sage-600 flex items-center gap-2">
                                                    <span className="font-mono font-bold bg-gray-100 px-1 rounded">{getPlateName(travel.plateNumber)}</span>
                                                    <span className="text-sage-400 text-xs">➜</span>
                                                    <span className="font-medium">{getDestName(travel.destination)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-sage-700">
                                                {getEmployeeName(travel.driver)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-sage-700">
                                                {travel.tons.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-indigo-600 text-sm">
                                                {formatCurrency(travel.totalIncome)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-red-500 text-sm">
                                                -{formatCurrency(travel.totalExpenses)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-bold text-sm">
                                                <span className={`${travel.netIncome >= 0 ? 'text-sage-700' : 'text-rose-600'}`}>
                                                    {formatCurrency(travel.netIncome)}
                                                </span>
                                            </td>
                                        </tr>
                                        ))}
                                        {currentItems.length === 0 && (
                                        <tr><td colSpan={activeTab === 'land' ? 8 : 7} className="p-8 text-center text-sage-400 italic">No travel records found based on filters.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <PaginationControls 
                                totalItems={travelSummaryData.length} 
                                totalPages={totalPages} 
                                indexOfFirstItem={indexOfFirstItem} 
                                indexOfLastItem={indexOfLastItem} 
                            />
                            </>
                        );
                   })()}
                </div>
             </div>
          )}
        </>
      )}
    </div>
  );
};

export default Summaries;