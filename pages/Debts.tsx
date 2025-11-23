import React, { useEffect, useState } from 'react';
import { Plus, Search, Loader2, Wallet, CheckCircle2, AlertCircle, User, ChevronUp, ChevronDown } from 'lucide-react';
import { Employee, Debt } from '../types';
import * as EmployeeService from '../services/employeeService';
import * as DebtService from '../services/debtService';
import DebtModal from '../components/modals/DebtModal';
import DeleteConfirmationModal from '../components/modals/DeleteConfirmationModal';

const Debts: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [empData, debtsData] = await Promise.all([
        EmployeeService.getEmployees(),
        DebtService.getDebts()
      ]);
      setEmployees(empData);
      setDebts(debtsData);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManageDebt = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleAddDebt = async (debtData: Omit<Debt, 'id'>) => {
    try {
      const newDebt = await DebtService.addDebt(debtData);
      setDebts(prev => [...prev, newDebt]);
    } catch (error) {
      alert("Failed to add debt");
    }
  };

  const handleTogglePaid = async (debt: Debt) => {
    try {
      const updatedStatus = !debt.paid;
      await DebtService.updateDebt(debt.id, { paid: updatedStatus });
      setDebts(prev => prev.map(d => d.id === debt.id ? { ...d, paid: updatedStatus } : d));
    } catch (error) {
      alert("Failed to update debt status");
    }
  };

  const handleDeleteDebtClick = async (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await DebtService.deleteDebt(itemToDelete);
      setDebts(prev => prev.filter(d => d.id !== itemToDelete));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      alert("Failed to delete debt");
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to calculate total unpaid debt for an employee
  const getEmployeeDebt = (empId: string) => {
    return debts
      .filter(d => d.employeeId === empId && !d.paid)
      .reduce((sum, d) => sum + d.amount, 0);
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredEmployees.length / entriesPerPage);
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
    }
  };

  // Filtered debts for the currently selected employee in the modal
  const selectedEmployeeDebts = selectedEmployee 
    ? debts.filter(d => d.employeeId === selectedEmployee.id)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Debts Management</h1>
          <p className="text-sage-500 text-sm">Track and manage employee debts and cash advances.</p>
        </div>
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
                            Employee
                            <div className="flex flex-col opacity-50 group-hover:opacity-100"><ChevronUp size={8} /><ChevronDown size={8} className="-mt-1"/></div>
                        </div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-sage-800 group">
                        <div className="flex items-center justify-between">
                            Type
                            <div className="flex flex-col opacity-50 group-hover:opacity-100"><ChevronUp size={8} /><ChevronDown size={8} className="-mt-1"/></div>
                        </div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-sage-800 group">
                        <div className="flex items-center justify-between">
                            Total Outstanding Debt
                            <div className="flex flex-col opacity-50 group-hover:opacity-100"><ChevronUp size={8} /><ChevronDown size={8} className="-mt-1"/></div>
                        </div>
                    </th>
                    <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-sage-100">
                    {currentItems.length > 0 ? currentItems.map((emp) => {
                    const totalDebt = getEmployeeDebt(emp.id);
                    return (
                        <tr key={emp.id} className="hover:bg-sage-50 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-sage-200 rounded-full flex items-center justify-center text-sage-700">
                                <User size={16} />
                            </div>
                            <span className="font-medium text-sage-800 text-sm">{emp.name}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border
                            ${emp.type === 'Driver' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                emp.type === 'Staff' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                'bg-amber-50 text-amber-700 border-amber-100'}`}>
                            {emp.type}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            {totalDebt > 0 ? (
                                <span className="text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full flex items-center gap-1 w-fit text-xs">
                                <AlertCircle size={14} /> ₱{totalDebt.toLocaleString()}
                                </span>
                            ) : (
                                <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full flex items-center gap-1 w-fit text-xs">
                                <CheckCircle2 size={14} /> No Debt
                                </span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button 
                                onClick={() => handleManageDebt(emp)}
                                className="bg-white border border-sage-200 text-sage-600 hover:bg-sage-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm active:scale-95 flex items-center gap-2 ml-auto"
                            >
                                <Wallet size={14} /> Manage Debt
                            </button>
                        </td>
                        </tr>
                    );
                    }) : (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-sage-400">
                        No employees found.
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
                Showing {filteredEmployees.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length} entries
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

      <DebtModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={selectedEmployee}
        debts={selectedEmployeeDebts}
        onAdd={handleAddDebt}
        onTogglePaid={handleTogglePaid}
        onDelete={handleDeleteDebtClick}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Debt Record"
        message="Are you sure you want to delete this debt record? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Debts;