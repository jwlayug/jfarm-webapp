import React, { useState } from 'react';
import { X, Briefcase, TrendingUp, TrendingDown, Users, ArrowLeft, CheckCircle2, XCircle, ChevronRight, Receipt, Scale } from 'lucide-react';
import { Travel, Group, Employee } from '../../types';

interface TravelSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  travels: Travel[];
  group: Group | null;
  employees: Employee[];
}

const TravelSummaryModal: React.FC<TravelSummaryModalProps> = ({
  isOpen,
  onClose,
  travels,
  group,
  employees
}) => {
  const [activeTab, setActiveTab] = useState<'employee' | 'travel'>('employee');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedTravelId, setSelectedTravelId] = useState<string | null>(null);

  // Helper: Get Employee Name
  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || id;
  // Helper: Format Currency
  const formatCurrency = (val: number) => '₱' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (!isOpen || !group) return null;

  // --- AGGREGATION LOGIC ---

  // 1. Employee Aggregates
  const employeeEarnings: Record<string, number> = {};
  const employeeTravelCount: Record<string, number> = {};

  // Initialize all group employees with 0
  group.employees.forEach(empId => {
     const emp = employees.find(e => e.id === empId);
     if (emp?.type === 'Staff') { 
        employeeEarnings[empId] = 0;
        employeeTravelCount[empId] = 0;
     }
  });

  // 2. Travel Aggregates & Helper Function
  const getTravelMetrics = (travel: Travel) => {
      // Income
      const sugarIncome = (travel.sugarcane_price || 0) * (travel.bags || 0);
      const molassesIncome = (travel.molasses_price || 0) * (travel.molasses || 0);
      const totalIncome = sugarIncome + molassesIncome;

      // Wages
      const tons = travel.tons || 0;
      const groupWage = group.wage || 0;
      const totalWagePot = tons * groupWage;

      // Staff Wage Calc
      const presentAttendance = (travel.attendance || []).filter(a => a.present);
      const staffAttendance = presentAttendance.filter(a => {
        const emp = employees.find(e => e.id === a.employeeId);
        return emp?.type === 'Staff';
      });
      const staffCount = staffAttendance.length;
      const wagePerStaff = staffCount > 0 ? totalWagePot / staffCount : 0;

      // Expenses
      const otherExp = travel.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
      const tip = travel.driverTip || 0;
      const totalExpenses = totalWagePot + tip + otherExp;

      const netIncome = totalIncome - totalExpenses;

      return {
          totalIncome,
          sugarIncome,
          molassesIncome,
          totalExpenses,
          totalWagePot,
          tip,
          otherExp,
          netIncome,
          staffCount,
          wagePerStaff,
          staffAttendance
      };
  };

  let totalIncome = 0;
  let totalExpenses = 0;
  let totalSugarcaneIncome = 0;
  let totalMolassesIncome = 0;
  let totalWagesPaid = 0;
  let totalDriverTips = 0;
  let totalOtherExpenses = 0;

  travels.forEach(travel => {
    const metrics = getTravelMetrics(travel);

    totalSugarcaneIncome += metrics.sugarIncome;
    totalMolassesIncome += metrics.molassesIncome;
    totalIncome += metrics.totalIncome;

    totalWagesPaid += metrics.totalWagePot;
    totalDriverTips += metrics.tip;
    totalOtherExpenses += metrics.otherExp;
    totalExpenses += metrics.totalExpenses;

    // Distribute wages to map for employee tab
    metrics.staffAttendance.forEach(att => {
      if (employeeEarnings[att.employeeId] !== undefined) {
        employeeEarnings[att.employeeId] += metrics.wagePerStaff;
        employeeTravelCount[att.employeeId] += 1;
      } else {
        employeeEarnings[att.employeeId] = metrics.wagePerStaff;
        employeeTravelCount[att.employeeId] = 1;
      }
    });
  });

  const netIncome = totalIncome - totalExpenses;

  // Convert Employee Map to Array for display
  const employeeList = Object.entries(employeeEarnings)
    .map(([id, amount]) => ({
      id,
      name: getEmployeeName(id),
      amount,
      count: employeeTravelCount[id]
    }))
    .sort((a, b) => b.amount - a.amount);

  // --- RENDER FUNCTIONS ---

  const renderEmployeeDetail = () => {
    if (!selectedEmployeeId) return null;
    
    const empName = getEmployeeName(selectedEmployeeId);
    const empTotal = employeeEarnings[selectedEmployeeId] || 0;

    return (
      <div className="space-y-4 h-full flex flex-col">
         <div className="flex items-center gap-3 pb-4 border-b border-sage-100 shrink-0">
            <button 
              onClick={() => setSelectedEmployeeId(null)}
              className="p-2 hover:bg-sage-100 rounded-full text-sage-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
               <h3 className="text-lg font-bold text-sage-800">{empName}</h3>
               <p className="text-xs text-sage-500">Attendance History</p>
            </div>
            <div className="ml-auto text-right">
               <p className="text-xs text-sage-400 uppercase">Total Earned</p>
               <p className="text-xl font-bold text-green-600">{formatCurrency(empTotal)}</p>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {travels.map((travel, idx) => {
               const metrics = getTravelMetrics(travel);
               const isPresent = travel.attendance?.find(a => a.employeeId === selectedEmployeeId)?.present || false;
               const wageEarned = isPresent ? metrics.wagePerStaff : 0;

               return (
                  <div key={travel.id} className={`p-4 rounded-lg border flex items-center justify-between transition-colors
                      ${isPresent ? 'bg-white border-sage-200' : 'bg-gray-50 border-gray-100 opacity-70'}
                  `}>
                      <div className="flex items-center gap-4">
                         <div className="text-xs text-gray-400 font-mono w-6">{idx + 1}</div>
                         <div>
                            <div className="font-bold text-sage-800">{travel.name}</div>
                            <div className="text-xs text-gray-500 flex gap-2">
                               {travel.ticket && <span className="bg-blue-50 text-blue-600 px-1.5 rounded text-[10px]">{travel.ticket}</span>}
                               <span>{travel.tons} tons</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                         {isPresent ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                               <CheckCircle2 size={12} /> Present
                            </span>
                         ) : (
                            <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-50 px-2 py-1 rounded-full">
                               <XCircle size={12} /> Absent
                            </span>
                         )}
                         
                         <div className="w-24 text-right font-bold text-sage-700">
                            {isPresent ? formatCurrency(wageEarned) : '-'}
                         </div>
                      </div>
                  </div>
               );
            })}
         </div>
      </div>
    );
  };

  const renderTravelDetail = () => {
    if (!selectedTravelId) return null;
    const travel = travels.find(t => t.id === selectedTravelId);
    if (!travel) return null;

    const metrics = getTravelMetrics(travel);

    return (
      <div className="space-y-6 h-full flex flex-col">
         <div className="flex items-center gap-3 pb-4 border-b border-sage-100 shrink-0">
            <button 
              onClick={() => setSelectedTravelId(null)}
              className="p-2 hover:bg-sage-100 rounded-full text-sage-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
               <h3 className="text-lg font-bold text-sage-800">{travel.name}</h3>
               <p className="text-xs text-sage-500">{travel.ticket ? `Ticket: ${travel.ticket}` : 'No Ticket'} • {travel.tons} tons</p>
            </div>
            <div className="ml-auto text-right">
               <p className="text-xs text-sage-400 uppercase">Net Income</p>
               <p className={`text-xl font-bold ${metrics.netIncome >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {formatCurrency(metrics.netIncome)}
               </p>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {/* Income Breakdown */}
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <h4 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2"><TrendingUp size={16}/> Income Computation</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center bg-white p-2 rounded border border-green-100">
                        <span className="text-gray-600">Sugarcane ({travel.bags} bags × {formatCurrency(travel.sugarcane_price || 0)})</span>
                        <span className="font-medium text-green-700">{formatCurrency(metrics.sugarIncome)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded border border-green-100">
                        <span className="text-gray-600">Molasses ({travel.molasses} × {formatCurrency(travel.molasses_price || 0)})</span>
                        <span className="font-medium text-green-700">{formatCurrency(metrics.molassesIncome)}</span>
                    </div>
                    <div className="border-t border-green-200 pt-2 mt-1 flex justify-between font-bold text-green-900 px-2">
                        <span>Total Income</span>
                        <span>{formatCurrency(metrics.totalIncome)}</span>
                    </div>
                </div>
            </div>

             {/* Expenses Breakdown */}
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <h4 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2"><TrendingDown size={16}/> Expense Computation</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center bg-white p-2 rounded border border-red-100">
                        <div className="flex flex-col">
                            <span className="text-gray-600 font-medium">Staff Wages</span>
                            <span className="text-[10px] text-gray-400">{travel.tons} tons × {formatCurrency(group.wage)} wage rate</span>
                        </div>
                        <span className="font-medium text-red-700">{formatCurrency(metrics.totalWagePot)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded border border-red-100">
                        <span className="text-gray-600">Driver Tip</span>
                        <span className="font-medium text-red-700">{formatCurrency(metrics.tip)}</span>
                    </div>
                     {travel.expenses && travel.expenses.length > 0 && (
                         <div className="space-y-1">
                             {travel.expenses.map((exp, i) => (
                                 <div key={i} className="flex justify-between items-center bg-white p-2 rounded border border-red-100">
                                     <span className="text-gray-600">{exp.name}</span>
                                     <span className="font-medium text-red-700">{formatCurrency(exp.amount)}</span>
                                 </div>
                             ))}
                         </div>
                     )}
                    <div className="border-t border-red-200 pt-2 mt-1 flex justify-between font-bold text-red-900 px-2">
                        <span>Total Expenses</span>
                        <span>-{formatCurrency(metrics.totalExpenses)}</span>
                    </div>
                </div>
            </div>
            
            {/* Wage Distribution Info */}
            <div className="bg-sage-50 p-4 rounded-xl border border-sage-100">
                 <h4 className="text-sm font-bold text-sage-800 mb-3 flex items-center gap-2"><Users size={16}/> Wage Breakdown</h4>
                 <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-3 rounded-lg border border-sage-200 text-center">
                        <p className="text-xs text-sage-400 uppercase mb-1">Active Staff</p>
                        <p className="font-bold text-sage-700 text-lg">{metrics.staffCount}</p>
                    </div>
                     <div className="bg-white p-3 rounded-lg border border-sage-200 text-center">
                        <p className="text-xs text-sage-400 uppercase mb-1">Wage Per Person</p>
                        <p className="font-bold text-sage-700 text-lg">{formatCurrency(metrics.wagePerStaff)}</p>
                    </div>
                 </div>
                 
                 <div className="bg-white rounded-lg border border-sage-200 overflow-hidden">
                     <div className="bg-sage-100 px-3 py-2 text-xs font-bold text-sage-600 uppercase">Present Staff</div>
                     <div className="divide-y divide-sage-50 max-h-32 overflow-y-auto">
                        {metrics.staffAttendance.map(att => (
                            <div key={att.employeeId} className="flex justify-between items-center px-3 py-2 text-sm">
                                <span className="text-gray-700">{getEmployeeName(att.employeeId)}</span>
                                <span className="text-green-600 font-medium">{formatCurrency(metrics.wagePerStaff)}</span>
                            </div>
                        ))}
                        {metrics.staffAttendance.length === 0 && <div className="p-3 text-center text-gray-400 text-xs">No staff present</div>}
                     </div>
                 </div>
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="bg-sage-700 px-6 py-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">Group Summary</h2>
            <p className="text-sage-200 text-xs">{group.name} • {travels.length} Travels Recorded</p>
          </div>
          <button onClick={onClose} className="text-sage-200 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs (Hide if viewing detail) */}
        {!selectedEmployeeId && !selectedTravelId && (
          <div className="flex border-b border-sage-100 shrink-0">
            <button
              onClick={() => setActiveTab('employee')}
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors
                ${activeTab === 'employee' ? 'text-sage-700 border-b-2 border-sage-600 bg-sage-50' : 'text-gray-500 hover:text-sage-600'}
              `}
            >
              <Users size={16} /> Employee Summary
            </button>
            <button
              onClick={() => setActiveTab('travel')}
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors
                ${activeTab === 'travel' ? 'text-sage-700 border-b-2 border-sage-600 bg-sage-50' : 'text-gray-500 hover:text-sage-600'}
              `}
            >
              <Briefcase size={16} /> Travel Summary
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          
          {/* TAB: Employee Summary */}
          {activeTab === 'employee' && (
            selectedEmployeeId ? renderEmployeeDetail() : (
              <div className="space-y-6">
                <div className="bg-sage-50 p-5 rounded-xl border border-sage-100 flex justify-between items-center">
                  <div>
                      <p className="text-xs text-sage-500 uppercase font-bold mb-1">Total Wages Distributed</p>
                      <p className="text-3xl font-bold text-sage-800">{formatCurrency(totalWagesPaid)}</p>
                  </div>
                  <div className="text-right">
                      <p className="text-xs text-sage-400 uppercase mb-1">Active Staff</p>
                      <p className="text-xl font-bold text-sage-600">{employeeList.length}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3 border-b border-sage-100 pb-2">
                      <h3 className="text-sm font-bold text-sage-700">Staff Earnings Breakdown</h3>
                      <span className="text-xs text-sage-400">Click row for details</span>
                  </div>
                  
                  <div className="space-y-2">
                    {employeeList.length > 0 ? employeeList.map(emp => (
                      <div 
                        key={emp.id} 
                        onClick={() => setSelectedEmployeeId(emp.id)}
                        className="flex justify-between items-center p-3 bg-white border border-sage-100 rounded-lg shadow-sm hover:bg-sage-50 hover:border-sage-300 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center text-sage-600 font-bold text-xs group-hover:bg-sage-200 transition-colors">
                              {emp.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-sage-800 group-hover:text-sage-900">{emp.name}</p>
                              <p className="text-[10px] text-sage-400">Present in {emp.count} / {travels.length} travels</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-green-600">{formatCurrency(emp.amount)}</span>
                            <ArrowLeft size={16} className="text-sage-300 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-gray-400 italic text-center py-4">No staff earnings recorded.</p>
                    )}
                  </div>
                </div>
              </div>
            )
          )}

          {/* TAB: Travel Summary */}
          {activeTab === 'travel' && (
            selectedTravelId ? renderTravelDetail() : (
             <div className="space-y-6">
                {/* Net Income Card */}
                <div className={`p-5 rounded-xl border shadow-sm text-center
                  ${netIncome >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}
                `}>
                   <p className={`text-sm font-bold uppercase mb-1 ${netIncome >= 0 ? 'text-green-600' : 'text-red-500'}`}>Total Net Income</p>
                   <p className={`text-4xl font-bold ${netIncome >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(netIncome)}</p>
                   <p className="text-xs text-gray-500 mt-2">Across {travels.length} travels</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Income Section */}
                   <div className="bg-white p-4 rounded-xl border border-sage-100 shadow-sm">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-sage-700 mb-4">
                        <TrendingUp size={16} className="text-green-500" /> Income Sources
                      </h3>
                      <div className="space-y-3 text-sm">
                         <div className="flex justify-between items-center">
                            <span className="text-gray-600">Sugarcane Sales</span>
                            <span className="font-medium text-sage-800">{formatCurrency(totalSugarcaneIncome)}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-gray-600">Molasses Sales</span>
                            <span className="font-medium text-sage-800">{formatCurrency(totalMolassesIncome)}</span>
                         </div>
                         <div className="h-px bg-sage-100 my-2"></div>
                         <div className="flex justify-between items-center font-bold text-lg">
                            <span>Total Income</span>
                            <span className="text-green-600">{formatCurrency(totalIncome)}</span>
                         </div>
                      </div>
                   </div>

                   {/* Expense Section */}
                   <div className="bg-white p-4 rounded-xl border border-sage-100 shadow-sm">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-sage-700 mb-4">
                        <TrendingDown size={16} className="text-red-500" /> Expense Breakdown
                      </h3>
                      <div className="space-y-3 text-sm">
                         <div className="flex justify-between items-center">
                            <span className="text-gray-600">Staff Wages</span>
                            <span className="font-medium text-red-500">-{formatCurrency(totalWagesPaid)}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-gray-600">Driver Tips</span>
                            <span className="font-medium text-red-500">-{formatCurrency(totalDriverTips)}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-gray-600">Other Expenses</span>
                            <span className="font-medium text-red-500">-{formatCurrency(totalOtherExpenses)}</span>
                         </div>
                         <div className="h-px bg-sage-100 my-2"></div>
                         <div className="flex justify-between items-center font-bold text-lg">
                            <span>Total Expenses</span>
                            <span className="text-red-600">-{formatCurrency(totalExpenses)}</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Travel List */}
                <div className="pt-4 border-t border-sage-100">
                   <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-bold text-sage-700">Travel Log Breakdown</h3>
                      <span className="text-xs text-sage-400">Click row for computation</span>
                   </div>
                   <div className="space-y-2">
                      {travels.map((travel, idx) => {
                         const metrics = getTravelMetrics(travel);
                         return (
                            <div 
                               key={travel.id} 
                               onClick={() => setSelectedTravelId(travel.id)}
                               className="bg-white p-3 rounded-lg border border-sage-100 hover:shadow-md hover:border-sage-300 transition-all cursor-pointer flex justify-between items-center group"
                            >
                               <div className="flex items-center gap-3">
                                   <span className="text-xs font-mono text-sage-300 w-6">#{idx + 1}</span>
                                   <div>
                                       <p className="text-sm font-bold text-sage-800">{travel.name}</p>
                                       <p className="text-[10px] text-sage-400">
                                          {travel.ticket ? `Ticket: ${travel.ticket} • ` : ''}
                                          {travel.tons} tons
                                       </p>
                                   </div>
                               </div>
                               <div className="flex items-center gap-3">
                                   <span className={`text-sm font-bold ${metrics.netIncome >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                      {formatCurrency(metrics.netIncome)}
                                   </span>
                                   <ChevronRight size={16} className="text-sage-300 group-hover:text-sage-600 transition-colors" />
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </div>
             </div>
            )
          )}

        </div>
      </div>
    </div>
  );
};

export default TravelSummaryModal;