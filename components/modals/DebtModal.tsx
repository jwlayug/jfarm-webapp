import React, { useState, useMemo } from 'react';
import { X, Plus, Trash2, CheckCircle, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { Employee, Debt } from '../../types';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  debts: Debt[];
  onAdd: (debt: Omit<Debt, 'id'>) => Promise<void>;
  onTogglePaid: (debt: Debt) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const DebtModal: React.FC<DebtModalProps> = ({
  isOpen,
  onClose,
  employee,
  debts,
  onAdd,
  onTogglePaid,
  onDelete
}) => {
  // Form State
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sort debts: Unpaid first, then by date desc
  // CRITICAL: Hooks must be called before any early return
  const sortedDebts = useMemo(() => {
    return [...debts].sort((a, b) => {
      if (a.paid === b.paid) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return a.paid ? 1 : -1;
    });
  }, [debts]);

  const totalDebt = useMemo(() => {
    return debts
      .filter(d => !d.paid)
      .reduce((sum, d) => sum + d.amount, 0);
  }, [debts]);

  if (!isOpen || !employee) return null;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        employeeId: employee.id,
        amount: Number(amount),
        description,
        date,
        paid: false
      });
      // Reset form
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error("Failed to add debt", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-sage-600 px-6 py-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">Manage Debts</h2>
            <p className="text-sage-200 text-xs">{employee.name}</p>
          </div>
          <button onClick={onClose} className="text-sage-200 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Total Summary */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center shrink-0">
           <div className="flex items-center gap-2 text-red-700 font-medium">
              <AlertCircle size={20} /> Total Outstanding Debt
           </div>
           <div className="text-2xl font-bold text-red-600">₱{totalDebt.toLocaleString()}</div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-sage-50/30">
           
           {/* Add Debt Form */}
           <div className="bg-white p-4 rounded-xl border border-sage-200 shadow-sm mb-6">
              <h3 className="text-sm font-bold text-sage-700 mb-3 flex items-center gap-2">
                 <Plus size={16} className="text-sage-500"/> Add New Debt
              </h3>
              <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                 <div className="md:col-span-4">
                    <label className="block text-xs text-sage-500 mb-1">Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Cash Advance"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400"
                    />
                 </div>
                 <div className="md:col-span-3">
                    <label className="block text-xs text-sage-500 mb-1">Amount (₱)</label>
                    <input 
                      type="number" 
                      min="0"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 text-sm border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400"
                    />
                 </div>
                 <div className="md:col-span-3">
                    <label className="block text-xs text-sage-500 mb-1">Date</label>
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400"
                    />
                 </div>
                 <div className="md:col-span-2">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-sage-600 hover:bg-sage-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex justify-center"
                    >
                       {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Add'}
                    </button>
                 </div>
              </form>
           </div>

           {/* Debt List */}
           <div className="space-y-3">
              {sortedDebts.length > 0 ? sortedDebts.map(debt => (
                 <div 
                    key={debt.id} 
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all
                       ${debt.paid ? 'bg-sage-50 border-sage-100 opacity-75' : 'bg-white border-sage-200 shadow-sm'}
                    `}
                 >
                    <div className="flex items-start gap-3">
                       <div className={`mt-1 p-2 rounded-full ${debt.paid ? 'bg-sage-200 text-sage-600' : 'bg-red-100 text-red-500'}`}>
                          {debt.paid ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                       </div>
                       <div>
                          <div className="font-bold text-sage-800 text-lg">₱{debt.amount.toLocaleString()}</div>
                          <div className="text-sm font-medium text-sage-600">{debt.description}</div>
                          <div className="text-xs text-sage-400 flex items-center gap-1 mt-1">
                             <Calendar size={12} /> {debt.date}
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                       {!debt.paid ? (
                          <button 
                             onClick={() => onTogglePaid(debt)}
                             className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                          >
                             <CheckCircle size={14} /> Mark Paid
                          </button>
                       ) : (
                          <span className="bg-sage-100 text-sage-500 px-3 py-1.5 rounded-lg text-xs font-medium border border-sage-200">
                             Paid
                          </span>
                       )}
                       
                       <button 
                          onClick={() => onDelete(debt.id)}
                          className="text-red-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Delete Debt"
                       >
                          <Trash2 size={16} />
                       </button>
                    </div>
                 </div>
              )) : (
                 <div className="text-center py-8 text-sage-400">
                    <p>No debt records found.</p>
                 </div>
              )}
           </div>

        </div>
      </div>
    </div>
  );
};

export default DebtModal;