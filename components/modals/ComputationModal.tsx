import React from 'react';
import { X, Calculator, Users, Scale, DollarSign, TrendingUp } from 'lucide-react';
import { Travel, Group, Employee } from '../../types';

interface ComputationModalProps {
  isOpen: boolean;
  onClose: () => void;
  travel: Travel | null;
  group: Group | null;
  employees: Employee[];
}

const ComputationModal: React.FC<ComputationModalProps> = ({
  isOpen,
  onClose,
  travel,
  group,
  employees
}) => {
  if (!isOpen || !travel || !group) return null;

  // 1. Calculate Metrics
  const tons = travel.tons || 0;
  const groupWage = group.wage || 0;
  const totalPot = tons * groupWage;

  // Income Calculation
  const sugarIncome = (travel.sugarcane_price || 0) * (travel.bags || 0);
  const molassesIncome = (travel.molasses_price || 0) * (travel.molasses || 0);
  const totalTravelIncome = sugarIncome + molassesIncome;

  // 2. Filter Present Employees (Only Staff)
  // We rely on the attendance record snapshot stored in the travel object
  const presentAttendance = (travel.attendance || []).filter(a => a.present);
  
  // Filter to only include 'Staff'
  const staffAttendance = presentAttendance.filter(a => {
    const emp = employees.find(e => e.id === a.employeeId);
    return emp?.type === 'Staff';
  });

  const staffCount = staffAttendance.length;

  // 3. Calculate Wage Per Person
  // If no staff are present, avoid division by zero
  const wagePerPerson = staffCount > 0 ? totalPot / staffCount : 0;

  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-sage-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
             <Calculator size={20} />
             <h2 className="font-bold text-lg">Wage Computation</h2>
          </div>
          <button onClick={onClose} className="text-sage-200 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
           
           {/* Travel Income Section */}
           <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-6">
              <h3 className="text-green-800 font-bold flex items-center gap-2 mb-2 text-sm uppercase">
                 <TrendingUp size={16} /> Travel Income
              </h3>
              <div className="flex justify-between items-end">
                 <div className="text-sm text-gray-600 space-y-1">
                    <div>Sugarcane: ₱{(travel.sugarcane_price || 0).toLocaleString()} × {travel.bags || 0} bags</div>
                    <div>Molasses: ₱{(travel.molasses_price || 0).toLocaleString()} × {travel.molasses || 0}</div>
                 </div>
                 <div className="text-2xl font-bold text-green-700">
                    ₱{totalTravelIncome.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                 </div>
              </div>
           </div>

           {/* Formula Visualization for Wages */}
           <div className="bg-sage-50 p-4 rounded-xl border border-sage-100 mb-6">
              <div className="flex justify-between items-center text-sm text-sage-500 mb-2 font-mono">
                 <span>( Tons × Rate )</span>
                 <span>÷ Staff Count</span>
                 <span>= Wage</span>
              </div>
              <div className="flex justify-between items-center font-bold text-sage-800 text-lg">
                 <div className="flex flex-col items-center">
                    <span className="text-xs text-sage-400 font-sans font-normal uppercase">Tons</span>
                    {tons.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                 </div>
                 <span className="text-sage-400">×</span>
                 <div className="flex flex-col items-center">
                    <span className="text-xs text-sage-400 font-sans font-normal uppercase">Rate</span>
                    ₱{groupWage}
                 </div>
                 <span className="text-sage-400">÷</span>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-sage-400 font-sans font-normal uppercase">Staff</span>
                    {staffCount}
                 </div>
                 <span className="text-sage-400">=</span>
                 <div className="text-green-600 text-xl">
                    ₱{wagePerPerson.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                 </div>
              </div>
           </div>

           {/* Detailed Breakdown */}
           <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white border border-sage-100 rounded-lg shadow-sm">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Scale size={18}/></div>
                    <span className="text-sm text-gray-600">Total Weight</span>
                 </div>
                 <span className="font-bold text-gray-800">{tons} tons</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white border border-sage-100 rounded-lg shadow-sm">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><span className="font-bold">₱</span></div>
                    <span className="text-sm text-gray-600">Total Gross Wage Pot</span>
                 </div>
                 <span className="font-bold text-gray-800">₱{totalPot.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white border border-sage-100 rounded-lg shadow-sm">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={18}/></div>
                    <span className="text-sm text-gray-600">Staff Count</span>
                 </div>
                 <span className="font-bold text-gray-800">{staffCount} Present</span>
              </div>
           </div>

           {/* Staff List */}
           <div className="mt-6">
              <h3 className="text-xs font-bold text-sage-400 uppercase tracking-wider mb-3">Staff Pay Breakdown</h3>
              <div className="max-h-48 overflow-y-auto border border-sage-100 rounded-lg divide-y divide-sage-50">
                 {staffAttendance.length > 0 ? staffAttendance.map((att) => (
                    <div key={att.employeeId} className="flex justify-between items-center p-3 hover:bg-sage-50">
                       <span className="text-sm font-medium text-sage-700">{getEmployeeName(att.employeeId)}</span>
                       <span className="text-sm font-bold text-green-600">+₱{wagePerPerson.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                 )) : (
                    <div className="p-4 text-center text-sm text-gray-400">No staff marked present for this trip.</div>
                 )}
              </div>
              {presentAttendance.length > staffCount && (
                  <p className="text-[10px] text-sage-400 mt-2 italic text-center">
                      * {presentAttendance.length - staffCount} other employee(s) (e.g. Drivers) were present but excluded from this shared wage computation.
                  </p>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ComputationModal;
