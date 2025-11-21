import React, { useState } from 'react';
import { Receipt, Plus, Calendar, ChevronUp, ChevronDown } from 'lucide-react';

// Creating some mock general expenses locally since they weren't in the main mock file
const generalExpenses = [
  { id: '1', name: 'Truck Repair', description: 'Replaced tires for Plate ABC-123', amount: 450, date: '2023-10-15' },
  { id: '2', name: 'Office Supplies', description: 'Paper and ink', amount: 50, date: '2023-10-18' },
  { id: '3', name: 'Fuel Advance', description: 'Emergency fuel', amount: 1200, date: '2023-10-20' },
  { id: '4', name: 'Meal Allowance', description: 'Team lunch', amount: 300, date: '2023-10-21' },
];

const Expenses: React.FC = () => {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExpenses = generalExpenses.filter(exp => 
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
        <button className="bg-sage-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-sage-700 transition-colors shadow-sm">
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
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400 font-medium text-xs">Search:</span>
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="pl-16 pr-4 py-1.5 border border-sage-200 rounded-lg text-sm focus:outline-none focus:border-sage-400 w-full sm:w-64"
                />
            </div>
        </div>

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
                </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
                {currentItems.map((exp) => (
                <tr key={exp.id} className="hover:bg-sage-50 transition-colors">
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
                    <td className="px-6 py-4 text-right font-bold text-sage-800">₱{exp.amount}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

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
    </div>
  );
};

export default Expenses;