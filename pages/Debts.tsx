import React from 'react';
import { Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as Mock from '../services/mockData';
import { getEmployeeNames } from '../utils/calculations';

const Debts: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Debts</h1>
          <p className="text-sage-500 text-sm">Track employee debts and repayment status.</p>
        </div>
        <button className="bg-sage-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-sage-700 transition-colors shadow-sm">
          <Plus size={18} /> Add Debt
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outstanding Debts Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-sage-100">
             <h3 className="text-lg font-bold text-sage-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div> Outstanding
             </h3>
             <div className="space-y-4">
                {Mock.debts.filter(d => !d.paid).map(debt => (
                   <div key={debt.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex gap-3 items-center">
                         <div className="p-2 bg-white rounded-full text-red-500"><AlertCircle size={20}/></div>
                         <div>
                            <p className="font-semibold text-gray-800">{getEmployeeNames([debt.employeeId], Mock.employees)}</p>
                            <p className="text-xs text-red-400">{debt.description} • {debt.date}</p>
                         </div>
                      </div>
                      <span className="font-bold text-red-600 text-lg">${debt.amount}</span>
                   </div>
                ))}
                {Mock.debts.filter(d => !d.paid).length === 0 && <p className="text-gray-400 text-center py-4">No outstanding debts.</p>}
             </div>
        </div>

        {/* Paid Debts Card */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-sage-100">
             <h3 className="text-lg font-bold text-sage-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div> Paid History
             </h3>
             <div className="space-y-4">
                {Mock.debts.filter(d => d.paid).map(debt => (
                   <div key={debt.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex gap-3 items-center">
                         <div className="p-2 bg-white rounded-full text-green-500"><CheckCircle2 size={20}/></div>
                         <div>
                            <p className="font-semibold text-gray-800">{getEmployeeNames([debt.employeeId], Mock.employees)}</p>
                            <p className="text-xs text-green-600">{debt.description} • {debt.date}</p>
                         </div>
                      </div>
                      <span className="font-bold text-green-700 text-lg line-through decoration-2 decoration-green-700/50">${debt.amount}</span>
                   </div>
                ))}
             </div>
        </div>
      </div>
    </div>
  );
};

export default Debts;