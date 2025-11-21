import React, { useEffect, useState } from 'react';
import { Disc, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Plate } from '../types';
import * as PlateService from '../services/plateService';
import PlateModal from '../components/modals/PlateModal';

const Plates: React.FC = () => {
  const [plates, setPlates] = useState<Plate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlate, setEditingPlate] = useState<Plate | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await PlateService.getPlates();
      setPlates(data);
    } catch (error) {
      console.error("Failed to load plates", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingPlate(null);
    setIsModalOpen(true);
  };

  const handleEdit = (plate: Plate) => {
    setEditingPlate(plate);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure? This cannot be undone.')) {
      try {
        await PlateService.deletePlate(id);
        setPlates(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        alert("Failed to delete plate");
      }
    }
  };

  const handleSave = async (data: Omit<Plate, 'id'>) => {
    if (editingPlate) {
      await PlateService.updatePlate(editingPlate.id, data);
      setPlates(prev => prev.map(p => p.id === editingPlate.id ? { ...p, ...data } : p));
    } else {
      const newPlate = await PlateService.addPlate(data);
      setPlates(prev => [...prev, newPlate]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Plates</h1>
          <p className="text-sage-500 text-sm">Manage truck plate numbers.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-sage-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-sage-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Add Plate
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-sage-400" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {plates.length > 0 ? plates.map((plate) => (
            <div key={plate.id} className="bg-white p-6 rounded-xl shadow-sm border border-sage-100 flex items-center justify-between group relative overflow-hidden hover:shadow-md transition-shadow">
               <div className="absolute top-0 left-0 w-1 h-full bg-sage-400"></div>
               <div className="flex items-center gap-3">
                  <Disc className="text-sage-300" size={24} />
                  <span className="text-xl font-mono font-bold text-sage-700">{plate.name}</span>
               </div>
               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => handleEdit(plate)} className="text-sage-300 hover:text-sage-600"><Edit2 size={16} /></button>
                   <button onClick={() => handleDelete(plate.id)} className="text-red-300 hover:text-red-500"><Trash2 size={16} /></button>
               </div>
            </div>
          )) : (
            <div className="col-span-full p-8 text-center text-sage-400 border border-dashed border-sage-200 rounded-xl">
              No plates found. Add one to get started.
            </div>
          )}
        </div>
      )}

      <PlateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingPlate}
      />
    </div>
  );
};

export default Plates;