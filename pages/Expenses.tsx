import React from 'react';
import { Receipt, Plus, Calendar } from 'lucide-react';

// Creating some mock general expenses locally since they weren't in the main mock file
const generalExpenses = [
  { id: '1', name: 'Truck Repair', description: 'Replaced tires for Plate ABC-123', amount: 450, date: '2023-10-15' },
  { id: '2', name: 'Office Supplies', description: 'Paper and ink', amount: 50, date: '2023-10-18' },
];

const Expenses: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Other Expenses</h1>
          <p className="text-sage-500 text-sm">Track general operational expenses.</p>
        </div>
        <button className="bg-sage-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-sage-700 transition-colors shadow-sm">
          <Plus size={18} /> Add Expense
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-sage-50 text-sage-700 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Expense Name</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage-100">
            {generalExpenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-sage-50 transition-colors">
                <td className="px-6 py-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-sage-100 rounded-lg text-sage-600"><Receipt size={16}/></div>
                      <span className="font-medium text-sage-800">{exp.name}</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-sage-600 text-sm">{exp.description}</td>
                <td className="px-6 py-4 text-sage-500 text-sm">
                   <div className="flex items-center gap-1">
                      <Calendar size={14} /> {exp.date}
                   </div>
                </td>
                <td className="px-6 py-4 text-right font-bold text-sage-800">${exp.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Expenses;