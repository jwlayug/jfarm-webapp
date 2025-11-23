
import React, { useState, useMemo } from 'react';
import { Landmark, Plus, Eye, Edit2, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { Loan } from '../types';
import { useFarmData } from '../context/FarmContext';
import * as LoanService from '../services/loanService';
import LoanModal from '../components/modals/LoanModal';
import LoanDetailsModal from '../components/modals/LoanDetailsModal';
import LoanRenewalModal from '../components/modals/LoanRenewalModal';
import DeleteConfirmationModal from '../components/modals/DeleteConfirmationModal';

const Loans: React.FC = () => {
  const { loans, isLoading, activeFarmId } = useFarmData();

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  // Store ID instead of object to ensure real-time updates via context lookups
  const [viewingLoanId, setViewingLoanId] = useState<string | null>(null);

  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const [renewingLoan, setRenewingLoan] = useState<Loan | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Derived State: Find the live loan object from the context array
  // This ensures that when 'loans' context updates (e.g. after payment), this object updates immediately.
  const viewingLoan = useMemo(() => 
    loans.find(l => l.id === viewingLoanId) || null, 
  [loans, viewingLoanId]);

  // Actions
  const handleAdd = () => {
    setEditingLoan(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (e: React.MouseEvent, loan: Loan) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingLoan(loan);
    setIsAddModalOpen(true);
  };

  const handleView = (loan: Loan) => {
    setViewingLoanId(loan.id);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setLoanToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!loanToDelete) return;
    
    setIsDeleting(true);
    try {
      await LoanService.deleteLoan(loanToDelete, activeFarmId);
      setIsDeleteModalOpen(false);
      setLoanToDelete(null);
    } catch (error: any) {
      alert(`Failed to delete loan. Error: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenRenewal = (e: React.MouseEvent, loan: Loan) => {
    e.preventDefault();
    e.stopPropagation();
    setRenewingLoan(loan);
    setIsRenewalModalOpen(true);
  };

  const handleRenewSubmit = async (id: string, newDueDate: string, paymentAmount: number) => {
      await LoanService.renewLoan(id, newDueDate, paymentAmount, activeFarmId); 
  };

  const handleSaveLoan = async (loanData: Omit<Loan, 'id' | 'payments' | 'usages' | 'createdAt' | 'updatedAt'>) => {
    if (editingLoan) {
      await LoanService.updateLoan(editingLoan.id, loanData, activeFarmId);
    } else {
      await LoanService.addLoan(loanData, activeFarmId);
    }
  };

  // Summaries
  const totalLoans = loans.length;
  const activeLoans = loans.filter(l => !l.paid).length;
  const totalActiveBalance = loans.reduce((sum, l) => sum + l.remainingBalance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Loans</h1>
          <p className="text-sage-500 text-sm">Manage loans and payments</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
        >
          <Plus size={18} /> Add Loan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl text-center">
            <p className="text-xs text-slate-500 uppercase font-medium mb-1">Total Loans</p>
            <p className="text-3xl font-bold text-slate-800">{totalLoans}</p>
         </div>
         <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl text-center">
            <p className="text-xs text-amber-600 uppercase font-medium mb-1">Active Loans</p>
            <p className="text-3xl font-bold text-amber-700">{activeLoans}</p>
         </div>
         <div className="bg-red-50 border border-red-100 p-6 rounded-xl text-center">
            <p className="text-xs text-red-500 uppercase font-medium mb-1">Total Active Loan Balance</p>
            <p className="text-3xl font-bold text-red-600">₱{totalActiveBalance.toLocaleString()}</p>
         </div>
      </div>

      {/* Loan List */}
      {isLoading ? (
         <div className="flex justify-center py-12"><Loader2 className="animate-spin text-sage-400"/></div>
      ) : (
         <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {loans.map((loan) => (
               <div 
                  key={loan.id} 
                  className="bg-white rounded-xl shadow-sm border border-sage-100 hover:shadow-md transition-shadow group relative flex flex-col"
               >
                   {/* CLICKABLE CARD BODY */}
                   <div 
                      className="p-6 cursor-pointer flex-1"
                      onClick={() => handleView(loan)}
                   >
                       <div className="flex justify-between items-start mb-4">
                          <div>
                             <h3 className="text-lg font-bold text-sage-800 flex items-center gap-2">
                                 {loan.description}
                                 <span className={`text-[10px] px-2 py-0.5 rounded-full border ${loan.paid ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                     {loan.paid ? 'Paid' : 'Active'}
                                 </span>
                             </h3>
                             <p className="text-xs text-sage-400 mt-1">Due: {loan.dueDate}</p>
                          </div>
                       </div>

                       <div className="space-y-2 text-sm">
                           <div className="flex justify-between">
                               <span className="text-gray-500">Total:</span>
                               <span className="font-bold text-gray-900">₱{loan.totalAmount.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between">
                               <span className="text-gray-500">Paid (Current):</span>
                               <span className="font-medium text-green-600">₱{loan.totalPaidCurrent.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between">
                               <span className="text-gray-500">Paid (Lifetime):</span>
                               <span className="font-medium text-blue-600">₱{loan.totalPaidLifetime.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between pt-2 border-t border-dashed border-gray-200">
                               <span className="font-medium text-gray-600">Remaining:</span>
                               <span className="font-bold text-red-600">₱{loan.remainingBalance.toLocaleString()}</span>
                           </div>
                       </div>
                   </div>

                   {/* ACTION FOOTER */}
                   <div className="px-6 pb-6 pt-0 flex gap-2 items-center">
                       <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleView(loan); }}
                          className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                        >
                           <Eye size={14} /> View
                       </button>
                       
                       <div className="flex gap-1 relative z-20">
                           <button 
                              type="button"
                              onClick={(e) => handleEdit(e, loan)} 
                              className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer border border-transparent hover:border-gray-200" 
                              title="Edit"
                           >
                               <Edit2 size={16} />
                           </button>
                           <button 
                              type="button"
                              onClick={(e) => handleOpenRenewal(e, loan)} 
                              className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer border border-transparent hover:border-gray-200" 
                              title="Renew"
                           >
                               <RefreshCw size={16} />
                           </button>
                           <button 
                              type="button"
                              onClick={(e) => handleDeleteClick(e, loan.id)} 
                              className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer border border-transparent hover:border-red-200" 
                              title="Delete"
                           >
                               <Trash2 size={16} />
                           </button>
                       </div>
                   </div>
               </div>
            ))}
            {loans.length === 0 && (
                <div className="col-span-full text-center py-12 text-sage-400 border-2 border-dashed border-sage-100 rounded-xl">
                    <Landmark size={48} className="mx-auto mb-2 opacity-50"/>
                    <p>No loans found. Add a new loan to get started.</p>
                </div>
            )}
         </div>
      )}

      {/* Modals */}
      <LoanModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveLoan}
        initialData={editingLoan}
      />

      {/* Use key to force re-render if data updates, preventing stale state */}
      <LoanDetailsModal 
         key={viewingLoan?.updatedAt || viewingLoanId}
         isOpen={isDetailsModalOpen}
         onClose={() => setIsDetailsModalOpen(false)}
         loan={viewingLoan}
         onUpdate={() => {}} // Context handles the update
      />

      <LoanRenewalModal
        isOpen={isRenewalModalOpen}
        onClose={() => setIsRenewalModalOpen(false)}
        loan={renewingLoan}
        onRenew={handleRenewSubmit}
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Loan"
        message="Are you sure you want to delete this loan? This will also delete all related payment and usage records. This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Loans;
