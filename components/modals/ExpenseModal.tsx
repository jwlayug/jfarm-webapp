import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { OtherExpense } from '../../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<OtherExpense, 'id'>) => Promise<void>;
  initialData?: OtherExpense | null;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description);
        setAmount(initialData.amount);
        setDate(initialData.date);
      } else {
        setName('');
        setDescription('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;

    setIsLoading(true);
    try {
      await onSave({
        name,
        description,
        amount: Number(amount),
        date
      });
      onClose();
    } catch (error) {
      console.error("Failed to save expense", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-sage-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">
            {initialData ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button onClick={onClose} className="text-sage-200 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1">Expense Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Truck Repair"
              className="w-full px-3 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition-all text-sage-800 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details..."
              className="w-full px-3 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition-all text-sage-800 bg-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Amount (₱)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition-all text-sage-800 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 transition-all text-sage-800 bg-white"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sage-600 hover:bg-sage-50 rounded-lg font-medium transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-sage-600 text-white rounded-lg font-medium hover:bg-sage-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {initialData ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;