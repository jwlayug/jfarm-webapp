import React from 'react';
import { FileText, Download } from 'lucide-react';
import * as Mock from '../services/mockData';
import * as Calc from '../utils/calculations';

const Summaries: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Summaries</h1>
          <p className="text-sage-500 text-sm">Overview of employee wages, debts, and net pay.</p>
        </div>
        <button className="border border-sage-300 text-sage-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-sage-50 transition-colors bg-white shadow-sm">
          <Download size={18} /> Export Report
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-sage-600 text-white text-xs uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Total Wages (Calc)</th>
                <th className="px-6 py-4 text-red-200">Outstanding Debt</th>
                <th className="px-6 py-4 text-right">Net Pay Estimate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {Mock.employees.map((emp) => {
                // Calculate realtime values based on travels and debts
                const totalWage = Calc.getEmployeeTotalWage(emp.id, null, Mock.travels, Mock.groups);
                
                // If driver, calculate driver specific earnings
                const driverNet = Calc.getDriverNetWage(emp.id, Mock.travels, Mock.drivers);
                
                const totalEarnings = Math.max(totalWage, driverNet); // Simple logic: take whichever is relevant
                
                const totalDebt = Calc.getEmployeeTotalDebts(emp.id, Mock.debts);
                const netPay = totalEarnings - totalDebt;

                return (
                  <tr key={emp.id} className="hover:bg-sage-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-sage-800">{emp.name}</div>
                      <div className="text-xs text-sage-400">{emp.type}</div>
                    </td>
                    <td className="px-6 py-4 text-sage-700">
                      ${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-red-500 font-medium">
                      ${totalDebt.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold px-3 py-1 rounded-lg ${netPay >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        ${netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-sage-50 text-xs text-sage-500 text-center">
           Calculations based on currently recorded travels and debts.
        </div>
      </div>
    </div>
  );
};

export default Summaries;