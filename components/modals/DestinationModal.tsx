import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Destination } from '../../types';

interface DestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (destination: Omit<Destination, 'id'>) => Promise<void>;
  initialData?: Destination | null;
}

const DestinationModal: React.FC<DestinationModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#778873');
  const [isLoading, setIsLoading] = useState(false);

  const predefinedColors = [
    '#778873', '#A1BC98', '#D2DCB6', '#E5ECD0', 
    '#F87171', '#FBBF24', '#60A5FA', '#818CF8', '#A78BFA'
  ];

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setColor(initialData?.color || '#778873');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await onSave({ name, color });
      onClose();
    } catch (error) {
      console.error("Failed to save destination", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-sage-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">
            {initialData ? 'Edit Destination' : 'Add New Destination'}
          </h2>
          <button onClick={onClose} className="text-sage-200 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1">Destination Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Central Mill"
              className="w-full px-3 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition-all text-sage-800 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">Color Tag</label>
            <div className="flex flex-wrap gap-3 mb-2">
              {predefinedColors.map((c) => (
                <div 
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full cursor-pointer border-2 transition-transform hover:scale-110 ${color === c ? 'border-sage-600' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
               <input 
                  type="color" 
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-8 w-12 p-0 border-0 bg-transparent"
               />
               <span className="text-xs text-sage-400 font-mono uppercase">{color}</span>
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
              {initialData ? 'Save Changes' : 'Add Destination'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DestinationModal;