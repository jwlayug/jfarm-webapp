import React, { useState, useEffect } from 'react';
import { X, Calendar, RefreshCw, Loader2 } from 'lucide-react';
import { Loan } from '../../types';

interface LoanRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  onRenew: (id: string, newDueDate: string, paymentAmount: number) => Promise<void>;
}

const LoanRenewalModal: React.FC<LoanRenewalModalProps> = ({ isOpen, onClose, loan, onRenew }) => {
  const [newDueDate, setNewDueDate] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && loan) {
      // Default to 1 year from today
      const today = new Date();
      const nextYear = new Date(today.setFullYear(today.getFullYear() + 1));
      setNewDueDate(nextYear.toISOString().split('T')[0]);
      setPaymentAmount('');
    }
  }, [isOpen, loan]);

  if (!isOpen || !loan) return null;

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onRenew(loan.id, newDueDate, Number(paymentAmount) || 0);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-sage-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sage-800">
            <RefreshCw size={20} className="text-sage-500" />
            <h2 className="text-lg font-bold">Renew Loan</h2>
          </div>
          <button onClick={onClose} className="text-sage-400 hover:text-sage-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleRenewSubmit} className="p-6">
          <div className="mb-6 bg-amber-50 border border-amber-100 p-4 rounded-lg text-sm text-amber-800">
             <p className="font-bold mb-1">Reset Notice</p>
             <p>Renewing this loan will reset the balance back to the original total of <span className="font-bold">₱{loan.totalAmount.toLocaleString()}</span>.</p>
          </div>

          {/* Info Box */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2 text-sm border border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-500">Current Balance:</span>
              <span className="font-medium text-gray-600">₱{loan.remainingBalance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Reset Amount:</span>
              <span className="font-bold text-sage-700">₱{loan.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-500">Current Due Date:</span>
              <span className="font-medium text-gray-800">{loan.dueDate}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-sage-700 mb-1">New Due Date</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400" />
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-sage-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Defaults to 1 year from today</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-sage-700 mb-1">Renewal Payment (Optional)</label>
              <input
                type="number"
                min="0"
                placeholder="Enter amount to deduct from reset balance"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-3 py-2.5 border border-sage-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">Deducted from the new ₱{loan.totalAmount.toLocaleString()} balance</p>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-sage-600 hover:bg-sage-700 text-white rounded-lg font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Renewal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanRenewalModal;