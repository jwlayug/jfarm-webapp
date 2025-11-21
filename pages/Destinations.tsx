import React, { useEffect, useState } from 'react';
import { Navigation, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Destination } from '../types';
import * as DestinationService from '../services/destinationService';
import DestinationModal from '../components/modals/DestinationModal';

const Destinations: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<Destination | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await DestinationService.getDestinations();
      setDestinations(data);
    } catch (error) {
      console.error("Failed to load destinations", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingDest(null);
    setIsModalOpen(true);
  };

  const handleEdit = (dest: Destination) => {
    setEditingDest(dest);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure? This cannot be undone.')) {
      try {
        await DestinationService.deleteDestination(id);
        setDestinations(prev => prev.filter(d => d.id !== id));
      } catch (error) {
        alert("Failed to delete destination");
      }
    }
  };

  const handleSave = async (data: Omit<Destination, 'id'>) => {
    if (editingDest) {
      await DestinationService.updateDestination(editingDest.id, data);
      setDestinations(prev => prev.map(d => d.id === editingDest.id ? { ...d, ...data } : d));
    } else {
      const newDest = await DestinationService.addDestination(data);
      setDestinations(prev => [...prev, newDest]);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Destinations</h1>
          <p className="text-sage-500 text-sm">Manage delivery destinations and color coding.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-sage-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-sage-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Add Destination
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-sage-400" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.length > 0 ? destinations.map((dest) => (
            <div key={dest.id} className="bg-white p-5 rounded-xl shadow-sm border border-sage-100 flex items-center gap-4 group relative hover:shadow-md transition-shadow">
               <div 
                 className="w-16 h-16 rounded-lg flex items-center justify-center text-white shadow-sm"
                 style={{ backgroundColor: dest.color }}
               >
                 <Navigation size={28} />
               </div>
               <div className="flex-1">
                  <h3 className="text-lg font-bold text-sage-800">{dest.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs text-gray-400 uppercase">Color Code:</span>
                     <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{dest.color}</span>
                  </div>
               </div>
               
               <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(dest)} className="text-sage-400 hover:text-sage-600 p-1 bg-white rounded shadow-sm"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(dest.id)} className="text-red-300 hover:text-red-500 p-1 bg-white rounded shadow-sm"><Trash2 size={14} /></button>
               </div>
            </div>
          )) : (
            <div className="col-span-full p-8 text-center text-sage-400 border border-dashed border-sage-200 rounded-xl">
               No destinations found.
            </div>
          )}
        </div>
      )}

      <DestinationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingDest}
      />
    </div>
  );
};

export default Destinations;