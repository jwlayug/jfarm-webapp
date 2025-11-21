import React from 'react';
import { Landmark, Plus, Clock, CheckCircle } from 'lucide-react';
import * as Mock from '../services/mockData';

const Loans: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Loans</h1>
          <p className="text-sage-500 text-sm">Manage active loans and repayment history.</p>
        </div>
        <button className="bg-sage-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-sage-700 transition-colors shadow-sm">
          <Plus size={18} /> New Loan
        </button>
      </div>

      <div className="space-y-6">
        {Mock.loans.map((loan) => (
          <div key={loan.id} className="bg-white rounded-xl shadow-sm border border-sage-100 p-6">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-sage-600 text-white rounded-xl shadow-md">
                      <Landmark size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-sage-800">{loan.description}</h3>
                      <p className="text-sm text-sage-500">Due: {loan.dueDate}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-right">
                      <p className="text-xs text-sage-400 uppercase">Balance</p>
                      <p className="text-xl font-bold text-red-500">${loan.remainingBalance}</p>
                   </div>
                   <div className="w-px h-8 bg-gray-200 hidden md:block"></div>
                   <div className="text-right">
                      <p className="text-xs text-sage-400 uppercase">Total Paid</p>
                      <p className="text-xl font-bold text-green-600">${loan.totalPaidCurrent}</p>
                   </div>
                </div>
             </div>

             {/* Progress Bar */}
             <div className="mb-6">
                <div className="flex justify-between text-xs mb-2 font-medium text-sage-600">
                   <span>Progress</span>
                   <span>{Math.round((loan.totalPaidCurrent / loan.totalAmount) * 100)}% Paid</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                   <div 
                      className="h-full bg-gradient-to-r from-sage-400 to-sage-600" 
                      style={{ width: `${(loan.totalPaidCurrent / loan.totalAmount) * 100}%` }}
                   ></div>
                </div>
             </div>

             {/* Payments History Preview */}
             <div>
                <h4 className="text-sm font-bold text-sage-700 mb-3">Recent Payments</h4>
                <div className="space-y-2">
                   {loan.payments?.map(payment => (
                      <div key={payment.id} className="flex justify-between items-center p-3 bg-sage-50 rounded-lg text-sm">
                         <div className="flex items-center gap-2 text-sage-700">
                            <CheckCircle size={14} className="text-green-500" />
                            Payment on {payment.paymentDate}
                         </div>
                         <span className="font-bold text-sage-800">${payment.amount}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loans;