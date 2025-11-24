import React from 'react';
import { X, Map, User, Truck, TrendingUp, TrendingDown, DollarSign, Calendar, Navigation, FileText } from 'lucide-react';
import { Travel, Group, Employee, Land, Plate, Destination, Driver } from '../../types';

interface TravelDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  travel: Travel | null;
  group: Group | null;
  employees: Employee[];
  lands: Land[];
  plates: Plate[];
  destinations: Destination[];
  drivers: Driver[];
}

const TravelDetailsModal: React.FC<TravelDetailsModalProps> = ({
  isOpen,
  onClose,
  travel,
  group,
  employees,
  lands,
  plates,
  destinations,
  drivers
}) => {
  if (!isOpen || !travel) return null;

  // --- Helpers ---
  const formatCurrency = (val: number) => '₱' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || id;
  const getLandName = (id: string) => lands.find(l => l.id === id)?.name || id;
  const getPlateName = (id: string) => plates.find(p => p.id === id)?.name || id;
  const getDestName = (id: string) => destinations.find(d => d.id === id)?.name || id;

  // --- Financial Computations ---
  const sugarIncome = (travel.sugarcane_price || 0) * (travel.bags || 0);
  const molassesIncome = (travel.molasses_price || 0) * (travel.molasses || 0);
  const totalIncome = sugarIncome + molassesIncome;

  const groupWageRate = group?.wage || 0;
  const wageExpense = (travel.tons || 0) * groupWageRate;
  const driverTip = travel.driverTip || 0;
  
  // Driver Wage Calculation
  const driverRec = drivers.find(d => d.employeeId === travel.driver);
  const driverBaseWage = driverRec?.wage || 0;
  // Calculate wage left (Base - Tip), ensuring it doesn't go below zero if tip > base
  const driverWageLeft = Math.max(0, driverBaseWage - driverTip);

  const otherExpenses = travel.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  
  // Total Expenses = Wages + Driver Tip + Driver Wage Left + Other
  const totalExpenses = wageExpense + driverTip + driverWageLeft + otherExpenses;
  
  const netIncome = totalIncome - totalExpenses;

  // Attendance
  const presentStaff = travel.attendance?.filter(a => a.present) || [];
  const staffMembers = presentStaff
    .map(a => employees.find(e => e.id === a.employeeId))
    .filter(Boolean) as Employee[];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-sage-600 px-6 py-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <FileText size={20} className="text-sage-200" /> Travel Details
            </h2>
            <p className="text-sage-200 text-xs">
               {travel.date} • {travel.name}
            </p>
          </div>
          <button onClick={onClose} className="text-sage-200 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
           
           {/* Net Income Summary Card */}
           <div className={`p-5 rounded-xl border shadow-sm flex justify-between items-center
              ${netIncome >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}
           `}>
               <div>
                   <p className={`text-xs font-bold uppercase mb-1 ${netIncome >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      Net Profit
                   </p>
                   <p className={`text-3xl font-bold ${netIncome >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {formatCurrency(netIncome)}
                   </p>
               </div>
               <div className={`p-3 rounded-full ${netIncome >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                  <DollarSign size={24} />
               </div>
           </div>

           {/* Logistics Section */}
           <section>
              <h3 className="text-sm font-bold text-sage-700 mb-3 flex items-center gap-2 border-b border-sage-100 pb-2">
                 <Truck size={16} /> Logistics
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                 <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Source & Destination</p>
                    <div className="font-medium text-gray-800 flex items-center gap-2">
                       <Map size={14} className="text-sage-500"/> {getLandName(travel.land)}
                    </div>
                    <div className="font-medium text-gray-800 flex items-center gap-2 mt-1">
                       <Navigation size={14} className="text-sage-500"/> {getDestName(travel.destination)}
                    </div>
                 </div>
                 <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Transport</p>
                    <div className="font-medium text-gray-800">{getPlateName(travel.plateNumber)}</div>
                    <div className="font-medium text-gray-800 flex items-center gap-2 mt-1">
                       <User size={14} className="text-sage-500"/> {getEmployeeName(travel.driver)}
                    </div>
                 </div>
                 <div className="bg-gray-50 p-3 rounded-lg">
                     <p className="text-xs text-gray-400 uppercase font-bold mb-1">Weight & Ticket</p>
                     <p className="font-medium text-gray-800">{travel.tons} tons</p>
                     <p className="text-gray-500 text-xs">{travel.ticket || 'No Ticket #'}</p>
                 </div>
                 <div className="bg-gray-50 p-3 rounded-lg">
                     <p className="text-xs text-gray-400 uppercase font-bold mb-1">Group</p>
                     <p className="font-medium text-gray-800">{group?.name || 'Unknown Group'}</p>
                     <p className="text-gray-500 text-xs">{staffMembers.length} members present</p>
                 </div>
              </div>
           </section>

           {/* Financials Section */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income */}
              <section className="bg-white border border-sage-100 rounded-xl overflow-hidden">
                  <div className="bg-green-50 px-4 py-3 border-b border-green-100 flex items-center gap-2 text-green-800 font-bold text-sm">
                     <TrendingUp size={16} /> Income
                  </div>
                  <div className="p-4 space-y-3 text-sm">
                      <div className="flex justify-between">
                         <span className="text-gray-600">Sugarcane ({travel.bags} bags)</span>
                         <span className="font-medium text-green-700">{formatCurrency(sugarIncome)}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-gray-600">Molasses ({travel.molasses})</span>
                         <span className="font-medium text-green-700">{formatCurrency(molassesIncome)}</span>
                      </div>
                      <div className="border-t border-green-100 pt-2 flex justify-between font-bold text-green-900">
                         <span>Total</span>
                         <span>{formatCurrency(totalIncome)}</span>
                      </div>
                  </div>
              </section>

              {/* Expenses */}
              <section className="bg-white border border-sage-100 rounded-xl overflow-hidden">
                  <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-center gap-2 text-red-800 font-bold text-sm">
                     <TrendingDown size={16} /> Expenses
                  </div>
                  <div className="p-4 space-y-3 text-sm">
                      <div className="flex justify-between">
                         <span className="text-gray-600">Wages ({travel.tons}t × {formatCurrency(groupWageRate)})</span>
                         <span className="font-medium text-red-700">-{formatCurrency(wageExpense)}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-gray-600">Driver Tip</span>
                         <span className="font-medium text-red-700">-{formatCurrency(driverTip)}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-gray-600">Driver Wage Left</span>
                         <span className="font-medium text-red-700">-{formatCurrency(driverWageLeft)}</span>
                      </div>
                      {travel.expenses && travel.expenses.map((exp, i) => (
                          <div key={i} className="flex justify-between">
                              <span className="text-gray-600">{exp.name}</span>
                              <span className="font-medium text-red-700">-{formatCurrency(exp.amount)}</span>
                          </div>
                      ))}
                      <div className="border-t border-red-100 pt-2 flex justify-between font-bold text-red-900">
                         <span>Total</span>
                         <span>-{formatCurrency(totalExpenses)}</span>
                      </div>
                  </div>
              </section>
           </div>

           {/* Staff List */}
           <section>
              <h3 className="text-sm font-bold text-sage-700 mb-3 flex items-center gap-2">
                 <User size={16} /> Attendance ({staffMembers.length})
              </h3>
              <div className="bg-sage-50 p-4 rounded-xl border border-sage-100">
                 <div className="flex flex-wrap gap-2">
                    {staffMembers.length > 0 ? staffMembers.map(emp => (
                       <span key={emp.id} className="bg-white border border-sage-200 text-sage-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                          {emp.name}
                       </span>
                    )) : (
                        <span className="text-gray-400 text-sm italic">No staff recorded present.</span>
                    )}
                 </div>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default TravelDetailsModal;