import React, { useEffect, useState } from 'react';
import { Navigation, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Destination } from '../types';
import * as DestinationService from '../services/destinationService';
import DestinationModal from '../components/modals/DestinationModal';
import DeleteConfirmationModal from '../components/modals/DeleteConfirmationModal';

const Destinations: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<Destination | null>(null);

  // Pagination & Search State
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await DestinationService.deleteDestination(itemToDelete);
      setDestinations(prev => prev.filter(d => d.id !== itemToDelete));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      alert("Failed to delete destination");
    } finally {
      setIsDeleting(false);
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

  // Filtering
  const filteredDestinations = destinations.filter(dest => 
    dest.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredDestinations.length / entriesPerPage);
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredDestinations.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
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
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.length > 0 ? currentItems.map((dest) => (
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
                    
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={() => handleEdit(dest)} className="text-sage-400 hover:text-sage-600 p-1 bg-white rounded shadow-sm"><Edit2 size={14} /></button>
                        <button onClick={() => handleDeleteClick(dest.id)} className="text-red-300 hover:text-red-500 p-1 bg-white rounded shadow-sm"><Trash2 size={14} /></button>
                    </div>
                    </div>
                )) : (
                    <div className="col-span-full p-8 text-center text-sage-400 border border-dashed border-sage-200 rounded-xl">
                    No destinations found.
                    </div>
                )}
                </div>
            </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-sage-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-sage-500">
            <div>
                Showing {filteredDestinations.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredDestinations.length)} of {filteredDestinations.length} entries
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

      <DestinationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingDest}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Destination"
        message="Are you sure you want to delete this destination? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Destinations;