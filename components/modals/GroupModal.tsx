import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Check, Search, User } from 'lucide-react';
import { Group, Employee } from '../../types';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: Omit<Group, 'id'>) => Promise<void>;
  initialData?: Group | null;
  availableEmployees: Employee[];
}

const GroupModal: React.FC<GroupModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  availableEmployees 
}) => {
  const [name, setName] = useState('');
  const [wage, setWage] = useState<number>(0);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');

  // Reset or populate form when modal opens/closes or data changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setWage(initialData.wage);
        setSelectedEmployeeIds(initialData.employees || []);
      } else {
        setName('');
        setWage(0);
        setSelectedEmployeeIds([]);
      }
      setMemberSearch('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const toggleEmployee = (id: string) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(id) ? prev.filter(eId => eId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const groupData: Omit<Group, 'id'> = {
        name,
        wage,
        employees: selectedEmployeeIds,
        created_at: initialData?.created_at || new Date().toISOString().split('T')[0] // Keep existing date or set today
      };
      await onSave(groupData);
      onClose();
    } catch (error) {
      console.error("Failed to save group", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = availableEmployees.filter(emp => 
    emp.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-sage-600 px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-white font-bold text-lg">
            {initialData ? 'Edit Group' : 'Create New Group'}
          </h2>
          <button onClick={onClose} className="text-sage-200 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="p-6 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alpha Team"
                  className="w-full px-3 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition-all text-sage-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">Wage Rate ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={wage}
                  onChange={(e) => setWage(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition-all text-sage-800 bg-white"
                />
              </div>
            </div>

            {/* Member Selection */}
            <div className="border-t border-sage-100 pt-4">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-sage-700">Assign Members ({selectedEmployeeIds.length})</label>
                <div className="relative w-48">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-sage-400" size={14} />
                  <input 
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search employees..."
                    className="w-full pl-8 pr-3 py-1 text-xs border border-sage-200 rounded-md focus:outline-none focus:border-sage-400 text-sage-800 bg-white"
                  />
                </div>
              </div>
              
              <div className="border border-sage-200 rounded-lg overflow-hidden h-64 bg-sage-50 overflow-y-auto">
                {filteredEmployees.length > 0 ? (
                  <div className="divide-y divide-sage-100">
                    {filteredEmployees.map(emp => {
                      const isSelected = selectedEmployeeIds.includes(emp.id);
                      return (
                        <div 
                          key={emp.id} 
                          onClick={() => toggleEmployee(emp.id)}
                          className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors hover:bg-sage-100
                            ${isSelected ? 'bg-sage-100' : 'bg-white'}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                              ${isSelected ? 'bg-sage-500 text-white' : 'bg-sage-200 text-sage-600'}
                            `}>
                              {emp.name.charAt(0)}
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${isSelected ? 'text-sage-800' : 'text-gray-600'}`}>{emp.name}</p>
                              <p className="text-xs text-sage-400">{emp.type}</p>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                            ${isSelected ? 'bg-sage-500 border-sage-500 text-white' : 'border-sage-300 bg-white'}
                          `}>
                            {isSelected && <Check size={12} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-sage-400 text-sm">
                    No employees found matching "{memberSearch}"
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-sage-100 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sage-600 hover:bg-sage-100 rounded-lg font-medium transition-colors"
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
              {initialData ? 'Save Changes' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupModal;