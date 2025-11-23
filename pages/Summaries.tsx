
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Download, Users, Layers, Map, 
  Calendar, Filter, Loader2, CreditCard, DollarSign, ChevronUp, ChevronDown, Sprout, Check, X 
} from 'lucide-react';
import { useFarmData } from '../context/FarmContext';
import { AnalyticsEngine } from '../utils/AnalyticsEngine';
import html2canvas from 'html2canvas';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// --- TYPES ---
type TabType = 'employee' | 'group' | 'land';

// --- COMPONENTS ---

interface MultiSelectProps {
  options: { id: string; label: string }[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label: string;
}

const MultiSelectDropdown: React.FC<MultiSelectProps> = ({ options, selectedIds, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(item => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const getDisplayLabel = () => {
    if (selectedIds.length === 0) return `All ${label}s`;
    if (selectedIds.length === options.length) return `All ${label}s`;
    if (selectedIds.length === 1) {
        return options.find(o => o.id === selectedIds[0])?.label || '1 Selected';
    }
    return `${selectedIds.length} ${label}s Selected`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3 py-2 bg-sage-50 border border-sage-200 rounded-lg text-sm font-medium focus:outline-none min-w-[160px] w-full sm:w-auto
            ${selectedIds.length > 0 ? 'text-sage-800 border-sage-400 bg-sage-100' : 'text-gray-600'}
        `}
      >
        <span className="truncate max-w-[140px]">{getDisplayLabel()}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-sage-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
           <div className="p-2 border-b border-sage-100 flex justify-between items-center bg-sage-50">
              <span className="text-xs font-bold text-sage-600 uppercase">Select {label}s</span>
              {selectedIds.length > 0 && (
                  <button 
                    onClick={() => onChange([])}
                    className="text-[10px] text-red-500 hover:underline"
                  >
                    Clear
                  </button>
              )}
           </div>
           <div className="max-h-60 overflow-y-auto p-1">
              {options.map(option => (
                 <div 
                    key={option.id}
                    onClick={() => toggleOption(option.id)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-sage-50 rounded-lg cursor-pointer transition-colors"
                 >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors
                        ${selectedIds.includes(option.id) ? 'bg-sage-600 border-sage-600 text-white' : 'border-sage-300 bg-white'}
                    `}>
                        {selectedIds.includes(option.id) && <Check size={10} strokeWidth={4} />}
                    </div>
                    <span className={`text-sm ${selectedIds.includes(option.id) ? 'font-medium text-sage-800' : 'text-gray-600'}`}>
                        {option.label}
                    </span>
                 </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

const Summaries: React.FC = () => {
  const { 
    employees, groups, travels, lands, plates, destinations, drivers, debts, isLoading 
  } = useFarmData();
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<TabType>('employee');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Filters
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]); // Multi-select state
  const [selectedLandId, setSelectedLandId] = useState<string>('all');
  
  // Additional Filters for Land Tab
  const [selectedDestId, setSelectedDestId] = useState<string>('all');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('all');

  // Table Controls
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // --- HELPERS ---
  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || id;
  const getGroupName = (id: string) => groups.find(g => g.id === id)?.name || 'Unknown Group';
  const getLandName = (id: string) => lands.find(l => l.id === id)?.name || id;
  const getPlateName = (id: string) => plates.find(p => p.id === id)?.name || id;
  const getDestName = (id: string) => destinations.find(d => d.id === id)?.name || id;
  
  const formatCurrency = (amount: number) => 
    `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // --- CALCULATIONS via AnalyticsEngine ---

  // Filtered Travels
  const filteredTravels = useMemo(() => {
    return travels.filter(t => {
      // Group Filter (Multi-select: If array has items, travel must be in one of them)
      if (selectedGroupIds.length > 0 && !selectedGroupIds.includes(t.groupId)) return false;
      
      if (activeTab === 'land') {
        if (selectedLandId !== 'all' && t.land !== selectedLandId) return false;
        
        // New Filters for Land Tab
        if (selectedDestId !== 'all' && t.destination !== selectedDestId) return false;
        if (selectedDriverId !== 'all' && t.driver !== selectedDriverId) return false;
      }
      return true;
    });
  }, [travels, selectedGroupIds, selectedLandId, selectedDestId, selectedDriverId, activeTab]);

  // 1. Employee Summary
  const employeeSummaryData = useMemo(() => {
    if (activeTab !== 'employee') return [];
    
    // Get Base Report (Earnings & Present Days)
    const baseReport = AnalyticsEngine.getEmployeeEarningsReport(employees, filteredTravels, groups, debts, drivers);

    // Calculate Absences
    // Logic: Find all groups the employee belongs to.
    // Filter 'filteredTravels' to find all trips made by those groups.
    // If employee was NOT present in a trip made by their group, it counts as absent.
    const extendedReport = baseReport.map(empData => {
        let absentCount = 0;
        const empObj = employees.find(e => e.id === empData.id);
        
        if (empObj && empObj.type !== 'Driver') { // Drivers usually don't have "absences" in the same group context
            const empGroupIds = groups.filter(g => g.employees.includes(empData.id)).map(g => g.id);
            
            if (empGroupIds.length > 0) {
                filteredTravels.forEach(t => {
                    if (empGroupIds.includes(t.groupId)) {
                        // This trip was for one of their groups. Were they present?
                        const isPresent = t.attendance.find(a => a.employeeId === empData.id)?.present;
                        if (!isPresent) {
                            absentCount++;
                        }
                    }
                });
            }
        }
        return { ...empData, daysAbsent: absentCount };
    });

    return extendedReport
      .filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.totalWage - a.totalWage);
  }, [employees, filteredTravels, groups, debts, drivers, activeTab, searchQuery]);

  const empAggregates = useMemo(() => {
    return employeeSummaryData.reduce((acc, curr) => ({
      totalDays: acc.totalDays + curr.daysWorked,
      totalWages: acc.totalWages + curr.totalWage,
      totalDebts: acc.totalDebts + curr.unpaidDebt
    }), { totalDays: 0, totalWages: 0, totalDebts: 0 });
  }, [employeeSummaryData]);

  // 2. Group/Land Summary
  const travelSummaryData = useMemo(() => {
    return filteredTravels
      .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(travel => {
       const financials = AnalyticsEngine.calculateTravelFinancials(travel, groups);
       return {
         ...travel,
         ...financials
       };
    })
    .sort((a, b) => {
       const getDate = (name: string, date?: string) => {
          // 1. Try parsing the Name as user names travels by date (e.g. "November 17, 2025")
          const nameTime = new Date(name).getTime();
          if (!isNaN(nameTime)) return nameTime;
          
          // 2. Fallback to explicit date field
          if (date) return new Date(date).getTime();
          return 0;
       };
       // Sort Descending (Latest First)
       return getDate(b.name, b.date) - getDate(a.name, a.date);
    });
  }, [filteredTravels, groups, searchQuery]);

  const travelAggregates = useMemo(() => {
    return travelSummaryData.reduce((acc, curr) => ({
      count: acc.count + 1,
      tons: acc.tons + (curr.tons || 0),
      income: acc.income + curr.totalIncome,
      expenses: acc.expenses + curr.totalExpenses,
      net: acc.net + curr.netIncome
    }), { count: 0, tons: 0, income: 0, expenses: 0, net: 0 });
  }, [travelSummaryData]);

  // Chart Data for Print View
  const printChartData = useMemo(() => {
    return [
        { name: 'Income', value: travelAggregates.income, fill: '#778873' }, // Sage
        { name: 'Expense', value: travelAggregates.expenses, fill: '#F87171' }, // Red
        { name: 'Net', value: travelAggregates.net, fill: travelAggregates.net >= 0 ? '#34D399' : '#EF4444' } // Green/Red
    ];
  }, [travelAggregates]);

  // --- PAGINATION ---
  const getPaginatedData = (data: any[]) => {
      const totalPages = Math.ceil(data.length / entriesPerPage);
      const indexOfLastItem = currentPage * entriesPerPage;
      const indexOfFirstItem = indexOfLastItem - entriesPerPage;
      const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
      return { currentItems, totalPages, indexOfFirstItem, indexOfLastItem };
  };

  const handleDownload = async () => {
    if (!printRef.current) return;
    setIsGeneratingReport(true);
    try {
      // Give time for charts to render (even with animation off, safer to wait a tick)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `JFarm_Report_${activeTab}_${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } catch (error) {
      console.error("Failed to generate report", error);
      alert("Failed to generate report.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // --- RENDER ---
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
        <div>Showing {totalItems > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries</div>
        <div className="flex gap-1">
            <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-sage-200 rounded hover:bg-sage-50 text-xs disabled:opacity-50"
            >
                Previous
            </button>
            <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 border border-sage-200 rounded hover:bg-sage-50 text-xs disabled:opacity-50"
            >
                Next
            </button>
        </div>
    </div>
  );

  // --- PRINT COMPONENTS ---
  // Updated PrintStatCard for Group/Land
  const PrintStatCard = ({ label, value, subText, accentColor = 'border-sage-200' }: any) => (
    <div className={`bg-white px-3 py-4 rounded-xl border ${accentColor} shadow-sm flex flex-col justify-center h-full`}>
       <div>
         <p className="text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-wider">{label}</p>
         <p className="text-lg font-bold text-gray-800 leading-normal">{value}</p>
       </div>
       {subText && <p className="text-[10px] text-gray-400 mt-1 leading-none">{subText}</p>}
    </div>
  );

  // Specific Card for Employee Summary Download (Solid Background)
  const EmployeePrintCard = ({ label, value, colorBg, colorText, icon: Icon }: any) => (
    <div className={`${colorBg} p-5 rounded-xl flex flex-col justify-between h-28`}>
       <div className="flex justify-between items-start">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${colorText} opacity-70`}>{label}</span>
          {Icon && <Icon size={18} className={`${colorText} opacity-80`} />}
       </div>
       <div className={`text-3xl font-bold ${colorText} mt-auto`}>{value}</div>
    </div>
  );

  const PrintHeader = ({ title }: { title: string }) => (
    <div className="bg-sage-600 p-6 flex justify-between items-center text-white mb-4">
      <div className="flex items-center gap-3">
         <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-sage-600 shadow-lg">
             <Sprout size={20} />
         </div>
         <div>
            <h1 className="text-2xl font-bold tracking-tight">JFarm</h1>
            <p className="text-sage-200 text-[10px] tracking-widest uppercase">SUGARCANE MANAGEMENT SYSTEM</p>
         </div>
      </div>
      <div className="text-right">
         <h2 className="text-xl font-bold">{title}</h2>
         <p className="text-sage-200 mt-0.5 text-xs">Generated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );

  // Group Options for MultiSelect
  const groupOptions = useMemo(() => groups.map(g => ({ id: g.id, label: g.name })), [groups]);

  return (
    <div className="space-y-6 min-h-screen pb-20 relative">
      {/* Header and Tabs */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Global Summary</h1>
          <p className="text-sage-500 text-sm">Comprehensive view of operations and finances.</p>
        </div>
        <div className="overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="bg-white p-1.5 rounded-xl border border-sage-100 shadow-sm inline-flex w-full md:w-auto min-w-max">
             {[{ id: 'employee', label: 'Employee Summary', icon: Users }, { id: 'group', label: 'Group Summary', icon: Layers }, { id: 'land', label: 'Land Summary', icon: Map }].map((tab) => (
               <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as TabType); setSearchQuery(''); setCurrentPage(1); }}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap
                    ${activeTab === tab.id ? 'bg-sage-600 text-white shadow-md' : 'text-sage-500 hover:bg-sage-50 hover:text-sage-700'}
                  `}
               >
                 <tab.icon size={16} /> {tab.label}
               </button>
             ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 text-sage-400">
          <Loader2 size={40} className="animate-spin mb-4" />
          <p>Loading data...</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-sage-100 shadow-sm flex flex-col lg:flex-row gap-4 justify-between z-10 relative">
             <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2 text-sage-400 mb-1 sm:mb-0 mr-2 font-medium text-sm">
                   <Filter size={16} /> Filters:
                </div>
                
                {/* 1. Group Multi-Select (Available for All Tabs) */}
                <MultiSelectDropdown 
                   label="Group"
                   options={groupOptions}
                   selectedIds={selectedGroupIds}
                   onChange={setSelectedGroupIds}
                />

                {/* 2. Land-Specific Filters */}
                {activeTab === 'land' && (
                  <>
                    <select 
                       value={selectedLandId} 
                       onChange={(e) => setSelectedLandId(e.target.value)} 
                       className="px-3 py-2 bg-sage-50 border border-sage-200 rounded-lg text-sm font-medium focus:outline-none min-w-[140px]"
                    >
                      <option value="all">All Lands</option>
                      {lands.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    
                    <select 
                       value={selectedDestId} 
                       onChange={(e) => setSelectedDestId(e.target.value)} 
                       className="px-3 py-2 bg-sage-50 border border-sage-200 rounded-lg text-sm font-medium focus:outline-none min-w-[140px]"
                    >
                      <option value="all">All Destinations</option>
                      {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>

                    <select 
                       value={selectedDriverId} 
                       onChange={(e) => setSelectedDriverId(e.target.value)} 
                       className="px-3 py-2 bg-sage-50 border border-sage-200 rounded-lg text-sm font-medium focus:outline-none min-w-[140px]"
                    >
                      <option value="all">All Drivers</option>
                      {drivers.map(d => {
                          const emp = employees.find(e => e.id === d.employeeId);
                          return <option key={d.id} value={d.employeeId}>{emp?.name || 'Unknown'}</option>;
                      })}
                    </select>
                  </>
                )}
             </div>
             
             <button onClick={handleDownload} disabled={isGeneratingReport} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors lg:ml-auto disabled:opacity-50">
                {isGeneratingReport ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span className="sm:hidden lg:inline">Download</span> Report
             </button>
          </div>

          {/* CONTENT */}
          {activeTab === 'employee' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                   <SummaryCard label="Total Days Worked" value={empAggregates.totalDays} colorClass="bg-blue-50 border-blue-100 text-blue-700" icon={Calendar} />
                   <SummaryCard label="Total Wages Paid" value={formatCurrency(empAggregates.totalWages)} colorClass="bg-green-50 border-green-100 text-green-700" icon={DollarSign} />
                   <SummaryCard label="Unpaid Debt" value={formatCurrency(empAggregates.totalDebts)} colorClass="bg-amber-50 border-amber-100 text-amber-700" icon={CreditCard} />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-hidden">
                   {(() => {
                      const { currentItems, totalPages, indexOfFirstItem, indexOfLastItem } = getPaginatedData(employeeSummaryData);
                      return (
                        <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead className="bg-sage-50 text-sage-700 text-xs uppercase font-bold tracking-wider border-b border-sage-200">
                                    <tr>
                                      <th className="px-6 py-4 text-center">Days Worked</th>
                                      <th className="px-6 py-4 text-right">Employee</th>
                                      <th className="px-6 py-4 text-left">Total Earnings</th>
                                      <th className="px-6 py-4 text-right text-red-600">Unpaid Debt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sage-100">
                                    {currentItems.map(emp => (
                                    <tr key={emp.id} className="hover:bg-sage-50 transition-colors">
                                        
                                 

                                        <td className="px-6 py-4 text-center">
                                          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-bold text-xs whitespace-nowrap">
                                            {emp.daysWorked} Present 
                                          </span>
                                          <span>-</span>
                                          <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-lg font-bold text-xs whitespace-nowrap">
                                            {emp.daysAbsent} Absent
                                          </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-bold text-sage-800">{emp.name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-left font-mono font-bold text-green-700">{formatCurrency(emp.totalWage)}</td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-red-500">{emp.unpaidDebt > 0 ? formatCurrency(emp.unpaidDebt) : '-'}</td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <PaginationControls totalItems={employeeSummaryData.length} totalPages={totalPages} indexOfFirstItem={indexOfFirstItem} indexOfLastItem={indexOfLastItem} />
                        </>
                      );
                  })()}
                </div>
             </div>
          )}

          {(activeTab === 'group' || activeTab === 'land') && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                   <SummaryCard label="Trips" value={travelAggregates.count} colorClass="bg-blue-50 border-blue-100 text-blue-700" />
                   <SummaryCard label="Tons" value={travelAggregates.tons.toFixed(2)} colorClass="bg-yellow-50 border-yellow-100 text-yellow-700" />
                   <SummaryCard label="Income" value={formatCurrency(travelAggregates.income)} colorClass="bg-indigo-50 border-indigo-100 text-indigo-700" />
                   <SummaryCard label="Expenses" value={formatCurrency(travelAggregates.expenses)} colorClass="bg-red-50 border-red-100 text-red-700" />
                   <SummaryCard label="Net" value={formatCurrency(travelAggregates.net)} colorClass={travelAggregates.net >= 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'} />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-hidden">
                   {(() => {
                        const { currentItems, totalPages, indexOfFirstItem, indexOfLastItem } = getPaginatedData(travelSummaryData);
                        return (
                            <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead className="bg-sage-50 text-sage-700 text-xs uppercase font-bold tracking-wider border-b border-sage-200">
                                        <tr>
                                        {activeTab === 'land' && <th className="px-6 py-4">Land</th>}
                                        <th className="px-6 py-4">Travel</th>
                                        <th className="px-6 py-4">Route</th>
                                        <th className="px-6 py-4">Driver</th>
                                        <th className="px-6 py-4 text-right">Tons</th>
                                        <th className="px-6 py-4 text-right text-indigo-600">Income</th>
                                        <th className="px-6 py-4 text-right text-red-500">Exp</th>
                                        <th className="px-6 py-4 text-right">Net</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-sage-100">
                                        {currentItems.map(travel => (
                                        <tr key={travel.id} className="hover:bg-sage-50 transition-colors">
                                            {activeTab === 'land' && <td className="px-6 py-4 text-xs text-sage-600">{getLandName(travel.land)}</td>}
                                            <td className="px-6 py-4 text-xs text-sage-600">{travel.name}</td>
                                            <td className="px-6 py-4 text-xs text-sage-600">{getPlateName(travel.plateNumber)} ➝ {getDestName(travel.destination)}</td>
                                            <td className="px-6 py-4 text-sm text-sage-700">{getEmployeeName(travel.driver)}</td>
                                            <td className="px-6 py-4 text-right font-medium text-sage-700">{travel.tons.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right font-mono text-indigo-600 text-sm">{formatCurrency(travel.totalIncome)}</td>
                                            <td className="px-6 py-4 text-right font-mono text-red-500 text-sm">-{formatCurrency(travel.totalExpenses)}</td>
                                            <td className={`px-6 py-4 text-right font-mono font-bold text-sm ${travel.netIncome >= 0 ? 'text-sage-700' : 'text-rose-600'}`}>{formatCurrency(travel.netIncome)}</td>
                                        </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <PaginationControls totalItems={travelSummaryData.length} totalPages={totalPages} indexOfFirstItem={indexOfFirstItem} indexOfLastItem={indexOfLastItem} />
                            </>
                        );
                   })()}
                </div>
             </div>
          )}
        </>
      )}

      {/* HIDDEN PRINT TEMPLATE (MODIFIED FOR BETTER PRESENTATION AND A4 FIT) */}
      <div 
        ref={printRef} 
        style={{ position: 'fixed', top: 0, left: -9999, width: '794px', minHeight: '1123px', backgroundColor: 'white' }}
        className="text-slate-800 font-sans"
      >
        <PrintHeader title={`${activeTab === 'employee' ? 'Employee' : activeTab === 'group' ? 'Group' : 'Land'} Summary Report`} />
        
        <div className="px-6 pb-8 space-y-6">
            {/* Filters Active */}
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex flex-wrap gap-4 text-[10px]">
                <div className="font-bold text-slate-700 uppercase tracking-wide">Filters Applied:</div>
                <div>Group: <span className="font-mono">{selectedGroupIds.length === 0 ? 'All' : `${selectedGroupIds.length} selected`}</span></div>
                {activeTab === 'land' && (
                    <>
                    <div>Land: <span className="font-mono">{selectedLandId === 'all' ? 'All' : getLandName(selectedLandId)}</span></div>
                    <div>Driver: <span className="font-mono">{selectedDriverId === 'all' ? 'All' : getEmployeeName(selectedDriverId)}</span></div>
                    </>
                )}
            </div>

            {/* --- Employee Summary Specific Layout --- */}
            {activeTab === 'employee' && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <EmployeePrintCard 
                        label="Total Days Worked" 
                        value={empAggregates.totalDays} 
                        colorBg="bg-blue-50" 
                        colorText="text-blue-600" 
                        icon={Calendar} 
                    />
                    <EmployeePrintCard 
                        label="Total Wages Paid" 
                        value={formatCurrency(empAggregates.totalWages)} 
                        colorBg="bg-emerald-50" 
                        colorText="text-emerald-700" 
                        icon={DollarSign} 
                    />
                    <EmployeePrintCard 
                        label="Unpaid Debt" 
                        value={formatCurrency(empAggregates.totalDebts)} 
                        colorBg="bg-amber-50" 
                        colorText="text-amber-700" 
                        icon={CreditCard} 
                    />
                </div>
            )}

            {/* --- Financial Summary Cards (For Group/Land) --- */}
            {(activeTab === 'group' || activeTab === 'land') && (
                <>
                    <div className="grid grid-cols-5 gap-2 items-stretch">
                        <PrintStatCard label="Total Trips" value={travelAggregates.count} accentColor="border-blue-200" />
                        <PrintStatCard label="Total Tons" value={travelAggregates.tons.toFixed(2)} subText="Metric Tons" accentColor="border-yellow-200" />
                        <PrintStatCard label="Gross Income" value={formatCurrency(travelAggregates.income)} accentColor="border-emerald-200" />
                        <PrintStatCard label="Expenses" value={formatCurrency(travelAggregates.expenses)} accentColor="border-red-200" />
                        <PrintStatCard label="Net Profit" value={formatCurrency(travelAggregates.net)} accentColor={travelAggregates.net >= 0 ? 'border-sage-400 bg-sage-50' : 'border-red-400 bg-red-50'} />
                    </div>

                    {/* --- Charts Section --- */}
                    <div className="grid grid-cols-3 gap-4 h-56">
                        <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-3">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 text-center">Financial Overview</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={printChartData} layout="horizontal" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#64748b'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#64748b'}} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} isAnimationActive={false}>
                                        {printChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="col-span-1 bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-center items-center text-center">
                             <div className="mb-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Profit Margin</p>
                                <p className="text-2xl font-bold text-sage-700">
                                    {travelAggregates.income > 0 
                                        ? `${((travelAggregates.net / travelAggregates.income) * 100).toFixed(1)}%`
                                        : '0%'}
                                </p>
                             </div>
                             <div className="w-full h-px bg-slate-200 my-2"></div>
                             <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Net / Trip</p>
                                <p className="text-lg font-bold text-slate-600">
                                    {travelAggregates.count > 0 
                                        ? formatCurrency(travelAggregates.net / travelAggregates.count) 
                                        : '₱0'}
                                </p>
                             </div>
                        </div>
                    </div>
                </>
            )}
            
            {/* Table Data */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
                 <table className="w-full text-left text-xs">
                    <thead className={activeTab === 'employee' ? 'bg-[#F1F3E0] text-sage-700 uppercase font-bold tracking-wider' : 'bg-slate-100 text-slate-600 uppercase font-bold'}>
                        <tr>
                            {activeTab === 'employee' ? (
                                <>
                                <th className="px-4 py-3 text-center">Days Worked</th>
                                <th className="px-4 py-3 text-right">Employee</th>
                                <th className="px-4 py-3 text-left">Total Earnings</th>
                                <th className="px-4 py-3 text-right">Unpaid Debt</th>
                                </>
                            ) : (
                                <>
                                {activeTab === 'land' && <th className="px-3 py-2">Land</th>}
                                <th className="px-3 py-2">Travel / Route</th>
                                <th className="px-3 py-2 text-right">Tons</th>
                                <th className="px-3 py-2 text-right">Income</th>
                                <th className="px-3 py-2 text-right">Expense</th>
                                <th className="px-3 py-2 text-right">Net</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {activeTab === 'employee' ? employeeSummaryData.map((emp, i) => (
                          <tr key={emp.id} className="bg-white">
                            <td className="px-6 py-4 text-center">
                              <span className=" text-blue-700 px-2.5 py-1 rounded-lg font-bold text-xs whitespace-nowrap">
                                {emp.daysWorked} Present
                              </span>
                              <span>-</span>
                              <span className="text-red-700 px-2.5 py-1 rounded-lg font-bold text-xs whitespace-nowrap">
                                {emp.daysAbsent} Absent
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sage-800 font-bold text-right">{emp.name}</td>
                            <td className="px-4 py-3 text-emerald-600 font-bold font-mono text-left">{formatCurrency(emp.totalWage)}</td>
                            <td className="px-4 py-3 text-right text-red-500 font-bold font-mono">{emp.unpaidDebt > 0 ? formatCurrency(emp.unpaidDebt) : '-'}</td>
                          </tr>
                        )) : travelSummaryData.map((t, i) => (
                             <tr key={t.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                {activeTab === 'land' && (
                                    <td className="px-3 py-1.5 text-slate-700 font-medium">
                                        {getLandName(t.land)}
                                    </td>
                                )}
                                <td className="px-3 py-1.5">
                                    <div className="text-slate-800 font-bold">{t.name}</div>
                                    <div className="text-[9px] text-slate-500">{getPlateName(t.plateNumber)} ➝ {getDestName(t.destination)}</div>
                                </td>
                                <td className="px-3 py-1.5 text-right text-slate-700">{t.tons.toFixed(2)}</td>
                                <td className="px-3 py-1.5 text-right text-emerald-600 font-mono">{formatCurrency(t.totalIncome)}</td>
                                <td className="px-3 py-1.5 text-right text-red-500 font-mono">{formatCurrency(t.totalExpenses)}</td>
                                <td className="px-3 py-1.5 text-right text-slate-700 font-mono font-bold">{formatCurrency(t.netIncome)}</td>
                             </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Summaries;
