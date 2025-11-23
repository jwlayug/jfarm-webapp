
import React, { useMemo, useState, useEffect } from 'react';
import { X, Calendar, TrendingDown, Wallet, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Driver, Employee, Travel } from '../../types';

interface DriverHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver | null;
  employee: Employee | null;
  travels: Travel[];
}

const DriverHistoryModal: React.FC<DriverHistoryModalProps> = ({
  isOpen,
  onClose,
  driver,
  employee,
  travels
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter travels for this driver
  const driverTravels = useMemo(() => {
    if (!driver) return [];
    // Sort by date descending (latest first)
    return travels
        .filter(t => t.driver === driver.employeeId)
        .sort((a, b) => {
             const dateA = new Date(a.date || 0).getTime();
             const dateB = new Date(b.date || 0).getTime();
             return dateB - dateA;
        });
  }, [driver, travels]);

  // Reset pagination when modal opens
  useEffect(() => {
      if (isOpen) setCurrentPage(1);
  }, [isOpen, driver]);

  if (!isOpen || !driver) return null;

  const baseWage = driver.wage || 0;

  // Calculate Aggregates (Global)
  const totalTrips = driverTravels.length;
  const totalBaseWage = totalTrips * baseWage;
  const totalTips = driverTravels.reduce((sum, t) => sum + (t.driverTip || 0), 0);
  const totalNetPay = totalBaseWage - totalTips;

  // Pagination Logic
  const totalPages = Math.ceil(totalTrips / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTravels = driverTravels.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (val: number) => '₱' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-sage-600 px-6 py-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
               <Truck size={20} className="text-sage-200"/> Driver History
            </h2>
            <p className="text-sage-200 text-xs">
               {employee?.name || 'Unknown Driver'} • Base Rate: {formatCurrency(baseWage)}
            </p>
          </div>
          <button onClick={onClose} className="text-sage-200 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 p-6 bg-sage-50 border-b border-sage-100 shrink-0">
           <div className="bg-white p-4 rounded-xl border border-sage-100 shadow-sm">
              <p className="text-xs font-bold text-sage-400 uppercase">Total Trips</p>
              <p className="text-2xl font-bold text-sage-700">{totalTrips}</p>
           </div>
           <div className="bg-white p-4 rounded-xl border border-sage-100 shadow-sm">
              <p className="text-xs font-bold text-red-400 uppercase">Total Deductions (Tips)</p>
              <p className="text-2xl font-bold text-red-500">-{formatCurrency(totalTips)}</p>
           </div>
           <div className="bg-white p-4 rounded-xl border border-sage-100 shadow-sm">
              <p className="text-xs font-bold text-green-600 uppercase">Total Net Earnings</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalNetPay)}</p>
           </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <h3 className="text-sm font-bold text-sage-800 mb-4 flex justify-between items-end">
              <span>Travel Breakdown</span>
              <span className="text-xs font-normal text-sage-400">Page {currentPage} of {totalPages || 1}</span>
          </h3>
          
          {currentTravels.length > 0 ? (
            <div className="space-y-3">
               {currentTravels.map((travel, idx) => {
                  const tip = travel.driverTip || 0;
                  const netWage = baseWage - tip;
                  // Calculate display index relative to total count (latest = highest number)
                  const displayIndex = totalTrips - (startIndex + idx);

                  return (
                     <div key={travel.id} className="border border-sage-100 rounded-xl p-4 hover:shadow-md transition-shadow group">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                           {/* Left: Travel Info */}
                           <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-sage-100 rounded-full flex items-center justify-center text-sage-600 font-bold text-xs mt-1">
                                 {displayIndex}
                              </div>
                              <div>
                                 <div className="font-bold text-sage-800 text-lg">{travel.name}</div>
                                 <div className="flex gap-2 text-xs text-sage-500">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={10} />
                                        {travel.date || 'No Date'}
                                    </div>
                                    {travel.ticket && <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{travel.ticket}</span>}
                                    <span>{travel.tons} tons</span>
                                 </div>
                              </div>
                           </div>

                           {/* Right: Computation */}
                           <div className="flex items-center gap-2 sm:gap-6 w-full sm:w-auto bg-sage-50/50 p-3 rounded-lg border border-sage-50">
                              <div className="text-right">
                                 <p className="text-[10px] text-sage-400 uppercase font-bold">Base</p>
                                 <p className="font-medium text-sage-600">{formatCurrency(baseWage)}</p>
                              </div>
                              
                              <div className="text-sage-300 flex flex-col items-center">
                                 <TrendingDown size={14} />
                              </div>

                              <div className="text-right">
                                 <p className="text-[10px] text-red-300 uppercase font-bold">Less Tip</p>
                                 <p className="font-medium text-red-500">-{formatCurrency(tip)}</p>
                              </div>

                              <div className="h-8 w-px bg-sage-200 mx-1"></div>

                              <div className="text-right min-w-[80px]">
                                 <p className="text-[10px] text-green-500 uppercase font-bold">Net Wage</p>
                                 <p className="font-bold text-green-700 text-lg">{formatCurrency(netWage)}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-48 text-sage-400 border-2 border-dashed border-sage-100 rounded-xl">
                <Truck size={32} className="mb-2 opacity-50" />
                <p>No travels recorded for this driver yet.</p>
             </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
            <div className="p-4 border-t border-sage-100 flex items-center justify-between bg-sage-50 shrink-0">
                <div className="text-xs text-sage-500">
                    Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalTrips)} of {totalTrips}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-sage-200 rounded hover:bg-white text-xs disabled:opacity-50 disabled:hover:bg-transparent transition-colors flex items-center gap-1"
                    >
                        <ChevronLeft size={14} /> Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-sage-200 rounded hover:bg-white text-xs disabled:opacity-50 disabled:hover:bg-transparent transition-colors flex items-center gap-1"
                    >
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default DriverHistoryModal;
