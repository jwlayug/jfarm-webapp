
import React, { useState } from 'react';
import { Map, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Land } from '../types';
import { useFarmData } from '../context/FarmContext';
import LandModal from '../components/modals/LandModal';
import DeleteConfirmationModal from '../components/modals/DeleteConfirmationModal';

const Lands: React.FC = () => {
  const { lands, isLoading, services } = useFarmData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLand, setEditingLand] = useState<Land | null>(null);

  // Pagination & Search State
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAdd = () => {
    setEditingLand(null);
    setIsModalOpen(true);
  };

  const handleEdit = (land: Land) => {
    setEditingLand(land);
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
      await services.lands.delete(itemToDelete);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      alert("Failed to delete land");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (data: Omit<Land, 'id'>) => {
    if (editingLand) {
      await services.lands.update(editingLand.id, data);
    } else {
      await services.lands.add(data);
    }
  };

  // Filtering
  const filteredLands = lands.filter(land => 
    land.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    land.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredLands.length / entriesPerPage);
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredLands.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
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
            <>
                <ul className="divide-y divide-sage-100">
                {currentItems.length > 0 ? currentItems.map((land) => (
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
                    <div className="flex gap-2">
                        <button 
                        onClick={() => handleEdit(land)}
                        className="p-2 text-sage-400 hover:text-sage-600 hover:bg-sage-200 rounded-lg"
                        >
                        <Edit2 size={16} />
                        </button>
                        <button 
                        onClick={() => handleDeleteClick(land.id)}
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

                {/* Pagination Footer */}
                <div className="p-4 border-t border-sage-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-sage-500">
                    <div>
                        Showing {filteredLands.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredLands.length)} of {filteredLands.length} entries
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
            </>
        )}
      </div>

      <LandModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingLand}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Land"
        message="Are you sure you want to delete this land? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Lands;
