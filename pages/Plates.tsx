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

  // Pagination & Search State
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filtering
  const filteredPlates = plates.filter(plate => 
    plate.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredPlates.length / entriesPerPage);
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredPlates.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
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

      <div className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-hidden">
        {/* Controls Header */}
        <div className="p-4 border-b border-sage-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-sage-600">
                <span>Show</span>
                <select 
                    value={entriesPerPage}
                    onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="bg-sage-50 border border-sage-200 rounded px-2 py-1 focus:outline-none focus:border-sage-400 text-sage-700 text-xs"
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                </select>
                <span>entries</span>
            </div>
            <div className="relative w-full sm:w-auto">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400 font-medium text-xs">Search:</span>
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="pl-16 pr-4 py-1.5 border border-sage-200 rounded-lg text-sm focus:outline-none focus:border-sage-400 w-full sm:w-64"
                />
            </div>
        </div>

        {isLoading ? (
            <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-sage-400" size={32} />
            </div>
        ) : (
            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {currentItems.length > 0 ? currentItems.map((plate) => (
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
            </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-sage-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-sage-500">
            <div>
                Showing {filteredPlates.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredPlates.length)} of {filteredPlates.length} entries
            </div>
            <div className="flex gap-1">
                <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-sage-200 rounded hover:bg-sage-50 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button 
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 border rounded text-xs ${currentPage === page ? 'bg-sage-600 text-white border-sage-600' : 'border-sage-200 hover:bg-sage-50'}`}
                    >
                        {page}
                    </button>
                ))}

                <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 border border-sage-200 rounded hover:bg-sage-50 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
      </div>

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