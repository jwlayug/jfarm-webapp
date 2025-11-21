import React, { useEffect, useState } from 'react';
import { Map, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Land } from '../types';
import * as LandService from '../services/landService';
import LandModal from '../components/modals/LandModal';

const Lands: React.FC = () => {
  const [lands, setLands] = useState<Land[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLand, setEditingLand] = useState<Land | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await LandService.getLands();
      setLands(data);
    } catch (error) {
      console.error("Failed to load lands", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingLand(null);
    setIsModalOpen(true);
  };

  const handleEdit = (land: Land) => {
    setEditingLand(land);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure? This cannot be undone.')) {
      try {
        await LandService.deleteLand(id);
        setLands(prev => prev.filter(l => l.id !== id));
      } catch (error) {
        alert("Failed to delete land");
      }
    }
  };

  const handleSave = async (data: Omit<Land, 'id'>) => {
    if (editingLand) {
      await LandService.updateLand(editingLand.id, data);
      setLands(prev => prev.map(l => l.id === editingLand.id ? { ...l, ...data } : l));
    } else {
      const newLand = await LandService.addLand(data);
      setLands(prev => [...prev, newLand]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Lands</h1>
          <p className="text-sage-500 text-sm">Register source lands for travels.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-sage-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-sage-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Add Land
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-sage-400" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-hidden">
          <ul className="divide-y divide-sage-100">
            {lands.length > 0 ? lands.map((land) => (
              <li key={land.id} className="p-4 flex items-center justify-between hover:bg-sage-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-sage-100 flex items-center justify-center text-sage-600">
                    <Map size={20} />
                  </div>
                  <div>
                     <h3 className="font-medium text-sage-800">{land.name}</h3>
                     <p className="text-xs text-sage-400 font-mono">{land.id}</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(land)}
                    className="p-2 text-sage-400 hover:text-sage-600 hover:bg-sage-200 rounded-lg"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(land.id)}
                    className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            )) : (
              <div className="p-8 text-center text-sage-400">
                No lands found. Add one to get started.
              </div>
            )}
          </ul>
        </div>
      )}

      <LandModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingLand}
      />
    </div>
  );
};

export default Lands;