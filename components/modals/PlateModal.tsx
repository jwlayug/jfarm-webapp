import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Plate } from '../../types';

interface PlateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plate: Omit<Plate, 'id'>) => Promise<void>;
  initialData?: Plate | null;
}

const PlateModal: React.FC<PlateModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await onSave({ name });
      onClose();
    } catch (error) {
      console.error("Failed to save plate", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-sage-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">
            {initialData ? 'Edit Plate' : 'Add New Plate'}
          </h2>
          <button onClick={onClose} className="text-sage-200 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1">Plate Number</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ABC-123"
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
              {initialData ? 'Save Changes' : 'Add Plate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlateModal;