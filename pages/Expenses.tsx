import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Calendar, ChevronUp, ChevronDown, Loader2, Edit2, Trash2 } from 'lucide-react';
import { OtherExpense } from '../types';
import * as ExpenseService from '../services/expenseService';
import ExpenseModal from '../components/modals/ExpenseModal';
import DeleteConfirmationModal from '../components/modals/DeleteConfirmationModal';

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<OtherExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<OtherExpense | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await ExpenseService.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error("Failed to load expenses", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Actions
  const handleAdd = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleEdit = (expense: OtherExpense) => {
    setEditingExpense(expense);
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
      await ExpenseService.deleteExpense(itemToDelete);
      setExpenses(prev => prev.filter(e => e.id !== itemToDelete));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      alert("Failed to delete expense");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (data: Omit<OtherExpense, 'id'>) => {
    if (editingExpense) {
      await ExpenseService.updateExpense(editingExpense.id, data);
      setExpenses(prev => prev.map(e => e.id === editingExpense.id ? { ...e, ...data } : e));
    } else {
      const newExpense = await ExpenseService.addExpense(data);
      setExpenses(prev => [newExpense, ...prev]);
    }
  };

  // Filter Logic
  const filteredExpenses = expenses.filter(exp => 
      exp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      exp.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredExpenses.length / entriesPerPage);
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredExpenses.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Other Expenses</h1>
          <p className="text-sage-500 text-sm">Track general operational expenses.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-sage-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-sage-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Add Expense
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
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
              <thead className="bg-sage-50 border-b border-sage-200 text-xs font-bold text-sage-600 uppercase tracking-wider">
                  <tr>
                  <th className="px-6 py-4 cursor-pointer hover:text-sage-800 group">
                      <div className="flex items-center justify-between">
                          Expense Name
                          <div className="flex flex-col opacity-50 group-hover:opacity-100"><ChevronUp size={8} /><ChevronDown size={8} className="-mt-1"/></div>
                      </div>
                  </th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 cursor-pointer hover:text-sage-800 group">
                      <div className="flex items-center justify-between">
                          Date
                          <div className="flex flex-col opacity-50 group-hover:opacity-100"><ChevronUp size={8} /><ChevronDown size={8} className="-mt-1"/></div>
                      </div>
                  </th>
                  <th className="px-6 py-4 text-right cursor-pointer hover:text-sage-800 group">
                      <div className="flex items-center justify-end gap-2">
                          Amount
                          <div className="flex flex-col opacity-50 group-hover:opacity-100"><ChevronUp size={8} /><ChevronDown size={8} className="-mt-1"/></div>
                      </div>
                  </th>
                  <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                  {currentItems.length > 0 ? currentItems.map((exp) => (
                  <tr key={exp.id} className="hover:bg-sage-50 transition-colors group">
                      <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-sage-100 rounded-lg text-sage-600"><Receipt size={16}/></div>
                          <span className="font-medium text-sage-800 text-sm">{exp.name}</span>
                      </div>
                      </td>
                      <td className="px-6 py-4 text-sage-600 text-sm">{exp.description}</td>
                      <td className="px-6 py-4 text-sage-500 text-sm">
                      <div className="flex items-center gap-1">
                          <Calendar size={14} /> {exp.date}
                      </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-sage-800">₱{exp.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => handleEdit(exp)}
                                className="p-1.5 text-sage-400 hover:text-sage-600 hover:bg-sage-100 rounded transition-colors"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button 
                                onClick={() => handleDeleteClick(exp.id)}
                                className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                      </td>
                  </tr>
                  )) : (
                    <tr>
                        <td colSpan={5} className="p-8 text-center text-sage-400">
                            No expenses found.
                        </td>
                    </tr>
                  )}
              </tbody>
              </table>
          </div>
        )}

         {/* Pagination Footer */}
        <div className="p-4 border-t border-sage-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-sage-500">
            <div>
                Showing {filteredExpenses.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredExpenses.length)} of {filteredExpenses.length} entries
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

      <ExpenseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingExpense}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Expenses;