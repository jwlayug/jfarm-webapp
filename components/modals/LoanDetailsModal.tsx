import React, { useState } from 'react';
import { X, Calendar, Plus, RefreshCw, Edit2, Trash2, DollarSign, FileText, Loader2, AlignLeft } from 'lucide-react';
import { Loan, LoanPayment, LoanUsage } from '../../types';
import * as LoanService from '../../services/loanService';

interface LoanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  onUpdate: () => void;
}

const LoanDetailsModal: React.FC<LoanDetailsModalProps> = ({ isOpen, onClose, loan, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'payments' | 'usage'>('payments');
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isAddingUsage, setIsAddingUsage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [usageDesc, setUsageDesc] = useState('');
  const [usageAmount, setUsageAmount] = useState('');
  const [usageDate, setUsageDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen || !loan) return null;

  const formatCurrency = (val: number) => '₱' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount) return;
    setIsLoading(true);
    try {
      await LoanService.addLoanPayment(loan.id, {
        loanId: loan.id,
        amount: Number(paymentAmount),
        paymentDate
      });
      setIsAddingPayment(false);
      setPaymentAmount('');
      onUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUsage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usageDesc || !usageAmount) return;
    setIsLoading(true);
    try {
      await LoanService.addLoanUsage(loan.id, {
        loanId: loan.id,
        description: usageDesc,
        amount: Number(usageAmount),
        usageDate
      });
      setIsAddingUsage(false);
      setUsageDesc('');
      setUsageAmount('');
      onUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total usage
  const totalUsage = loan.usages?.reduce((sum, u) => sum + u.amount, 0) || 0;
  const remainingUsage = loan.totalAmount - totalUsage;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 relative">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-sage-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             <h2 className="text-xl font-bold text-sage-800">Loan Details</h2>
             <span className={`text-xs px-2 py-1 rounded-full font-medium border ${loan.paid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                 {loan.paid ? 'Paid' : 'Active'}
             </span>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => { /* Handled by parent/renewal modal logic, here just edit icon */ }} className="text-sage-400 hover:text-sage-600 transition-colors">
               <Edit2 size={18} />
             </button>
             <div className="h-4 w-px bg-sage-200 mx-1"></div>
             <button onClick={onClose} className="text-red-400 hover:text-red-600 transition-colors">
               <X size={20} />
             </button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="p-6 bg-white border-b border-sage-100">
           <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg text-sage-800">{loan.description}</h3>
                    <div className="flex gap-4 text-xs text-gray-500 mt-1">
                        <span>Loan Date: {loan.loanDate}</span>
                        <span>Due Date: {loan.dueDate}</span>
                    </div>
                </div>
           </div>

           <div className="grid grid-cols-2 gap-6">
               <div>
                   <div className="flex justify-between text-sm mb-1">
                       <span className="text-gray-500">Total Amount:</span>
                       <span className="font-bold text-gray-900">{formatCurrency(loan.totalAmount)}</span>
                   </div>
                   <div className="flex justify-between text-sm mb-1">
                       <span className="text-gray-500">Paid (Current):</span>
                       <span className="font-medium text-green-600">{formatCurrency(loan.totalPaidCurrent)}</span>
                   </div>
                   <div className="flex justify-between text-sm mb-1">
                       <span className="text-gray-500">Paid (Lifetime):</span>
                       <span className="font-medium text-blue-600">{formatCurrency(loan.totalPaidLifetime)}</span>
                   </div>
                   <div className="flex justify-between text-sm pt-2 border-t border-dashed border-gray-100 mt-1">
                       <span className="font-medium text-red-500">Remaining Balance:</span>
                       <span className="font-bold text-red-600">{formatCurrency(loan.remainingBalance)}</span>
                   </div>
               </div>

               <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                   <h4 className="text-xs font-bold text-blue-500 uppercase mb-2">Loan Usage</h4>
                   <div className="flex justify-between text-sm mb-1">
                       <span className="text-gray-500">Used:</span>
                       <span className="font-bold text-blue-700">{formatCurrency(totalUsage)}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                       <span className="text-gray-500">Available:</span>
                       <span className="font-medium text-green-600">{formatCurrency(remainingUsage)}</span>
                   </div>
               </div>
           </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-sage-100 bg-gray-50">
           <button 
              onClick={() => setActiveTab('payments')}
              className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors
                 ${activeTab === 'payments' ? 'border-sage-600 text-sage-800 bg-white' : 'border-transparent text-gray-500 hover:text-sage-600'}
              `}
           >
             Payments ({loan.payments?.length || 0})
           </button>
           <button 
              onClick={() => setActiveTab('usage')}
              className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors
                 ${activeTab === 'usage' ? 'border-sage-600 text-sage-800 bg-white' : 'border-transparent text-gray-500 hover:text-sage-600'}
              `}
           >
             Usage ({loan.usages?.length || 0})
           </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
           
           {activeTab === 'payments' && (
             <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                   <h4 className="font-bold text-sm text-sage-800">Payment History</h4>
                   <button 
                        onClick={() => setIsAddingPayment(true)}
                        className="text-xs flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                        <Plus size={14} /> Add Payment
                    </button>
                </div>
                
                <div className="space-y-2">
                   {loan.payments && loan.payments.length > 0 ? [...loan.payments].reverse().map((p, idx) => (
                       <div key={idx} className="flex justify-between items-center p-3 bg-white border border-sage-100 rounded-lg shadow-sm">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><DollarSign size={14} /></div>
                             <div>
                                <div className="font-bold text-sage-800 text-sm">Payment Received</div>
                                <div className="text-xs text-gray-400">{p.paymentDate}</div>
                             </div>
                          </div>
                          <div className="font-bold text-green-600">{formatCurrency(p.amount)}</div>
                       </div>
                   )) : (
                       <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">No payments yet</div>
                   )}
                </div>
             </div>
           )}

           {activeTab === 'usage' && (
             <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                   <h4 className="font-bold text-sm text-sage-800">Usage Logs</h4>
                   <button 
                      onClick={() => setIsAddingUsage(true)}
                      className="text-xs flex items-center gap-1 px-3 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors shadow-sm font-medium"
                   >
                      <Plus size={14} /> Add Usage
                   </button>
                </div>
                
                <div className="space-y-2">
                   {loan.usages && loan.usages.length > 0 ? [...loan.usages].reverse().map((u, idx) => (
                       <div key={idx} className="flex justify-between items-center p-3 bg-white border border-sage-100 rounded-lg shadow-sm">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><AlignLeft size={14} /></div>
                             <div>
                                <div className="font-bold text-sage-800 text-sm">{u.description}</div>
                                <div className="text-xs text-gray-400">{u.usageDate}</div>
                             </div>
                          </div>
                          <div className="font-bold text-red-500">-{formatCurrency(u.amount)}</div>
                       </div>
                   )) : (
                       <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">No usage recorded yet</div>
                   )}
                </div>
             </div>
           )}
        </div>

        {/* COMPACT OVERLAYS */}
        
        {/* Add Payment Overlay */}
        {isAddingPayment && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                <div className="bg-white rounded-xl shadow-2xl w-80 overflow-hidden animate-in zoom-in-95 duration-200 border border-sage-100">
                    <div className="flex justify-between items-center px-4 py-3 border-b border-sage-50">
                         <h3 className="font-bold text-sage-800">Add Payment</h3>
                         <button onClick={() => setIsAddingPayment(false)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
                    </div>
                    <form onSubmit={handleAddPayment} className="p-4 space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                             <div className="px-3 py-2 bg-gray-50 rounded text-sm text-gray-500 italic">
                                Loan Payment
                             </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Amount</label>
                            <input type="number" autoFocus required value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="w-full px-3 py-2 border border-sage-200 rounded text-sm outline-none focus:border-blue-500" placeholder="0.00"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Date</label>
                            <input type="date" required value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="w-full px-3 py-2 border border-sage-200 rounded text-sm outline-none focus:border-blue-500"/>
                        </div>
                        <button disabled={isLoading} type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors mt-2">
                            {isLoading ? <Loader2 className="animate-spin mx-auto" size={16}/> : 'Add'}
                        </button>
                    </form>
                </div>
            </div>
        )}

        {/* Add Usage Overlay */}
        {isAddingUsage && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                <div className="bg-white rounded-xl shadow-2xl w-80 overflow-hidden animate-in zoom-in-95 duration-200 border border-sage-100">
                    <div className="flex justify-between items-center px-4 py-3 border-b border-sage-50">
                         <h3 className="font-bold text-sage-800">Add Usage</h3>
                         <button onClick={() => setIsAddingUsage(false)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
                    </div>
                    <p className="px-4 pt-2 text-[10px] text-gray-500">Manage how this loan amount was used.</p>
                    <form onSubmit={handleAddUsage} className="p-4 space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                            <textarea 
                              rows={2}
                              required 
                              value={usageDesc} 
                              onChange={e => setUsageDesc(e.target.value)} 
                              className="w-full px-3 py-2 border border-sage-200 rounded text-sm outline-none focus:border-blue-500 resize-none"
                              placeholder=""
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Amount</label>
                            <input type="number" required value={usageAmount} onChange={e => setUsageAmount(e.target.value)} className="w-full px-3 py-2 border border-sage-200 rounded text-sm outline-none focus:border-blue-500" placeholder="0"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Usage Date</label>
                            <input type="date" required value={usageDate} onChange={e => setUsageDate(e.target.value)} className="w-full px-3 py-2 border border-sage-200 rounded text-sm outline-none focus:border-blue-500"/>
                        </div>
                        <button disabled={isLoading} type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors mt-2">
                            {isLoading ? <Loader2 className="animate-spin mx-auto" size={16}/> : 'Add'}
                        </button>
                    </form>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default LoanDetailsModal;
