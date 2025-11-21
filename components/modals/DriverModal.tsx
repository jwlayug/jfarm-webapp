import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Driver, Employee } from '../../types';

interface DriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (driver: Omit<Driver, 'id'>) => Promise<void>;
  initialData?: Driver | null;
  employees: Employee[];
}

const DriverModal: React.FC<DriverModalProps> = ({ isOpen, onClose, onSave, initialData, employees }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [wage, setWage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmployeeId(initialData?.employeeId || '');
      setWage(initialData?.wage || 0);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;

    setIsLoading(true);
    try {
      await onSave({ employeeId, wage });
      onClose();
    } catch (error) {
      console.error("Failed to save driver", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter only employees of type 'Driver' (optional, based on your business logic, but helps UI)
  // Or keep all if type isn't strictly enforced
  const driverEmployees = employees.filter(e => e.type === 'Driver');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-sage-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">
            {initialData ? 'Edit Driver Details' : 'Add New Driver'}
          </h2>
          <button onClick={onClose} className="text-sage-200 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1">Select Employee</label>
            <select
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={!!initialData} // Prevent changing employee on edit to avoid conflicts
              className="w-full px-3 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition-all text-sage-800 bg-white disabled:bg-sage-50 disabled:text-sage-400"
            >
              <option value="">-- Select an Employee --</option>
              {driverEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} (ID: {emp.id})</option>
              ))}
            </select>
            <p className="text-xs text-sage-400 mt-1">Only employees marked as 'Driver' are listed.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1">Base Wage (Per Trip)</label>
            <input
              type="number"
              min="0"
              required
              value={wage}
              onChange={(e) => setWage(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition-all text-sage-800 bg-white"
            />
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
              {initialData ? 'Save Changes' : 'Add Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverModal;