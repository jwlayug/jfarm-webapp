import React, { useEffect, useState } from 'react';
import { Plus, MoreHorizontal, User, Trash2, Edit2, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { Employee } from '../types';
import * as EmployeeService from '../services/employeeService';
import EmployeeModal from '../components/modals/EmployeeModal';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await EmployeeService.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Failed to load employees", error);
      alert("Could not connect to the database. Please check your configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleAdd = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      try {
        await EmployeeService.deleteEmployee(id);
        setEmployees(prev => prev.filter(e => e.id !== id));
      } catch (error) {
        console.error("Delete failed", error);
        alert("Failed to delete employee");
      }
    }
    setActiveMenuId(null);
  };

  const handleSave = async (employeeData: Omit<Employee, 'id'>) => {
    if (editingEmployee) {
      // Update
      await EmployeeService.updateEmployee(editingEmployee.id, employeeData);
      // Optimistic Update
      setEmployees(prev => prev.map(emp => 
        emp.id === editingEmployee.id ? { ...emp, ...employeeData } : emp
      ));
    } else {
      // Create
      const newEmp = await EmployeeService.addEmployee(employeeData);
      setEmployees(prev => [...prev, newEmp]);
    }
  };

  // Filter Logic
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" onClick={() => setActiveMenuId(null)}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Employees</h1>
          <p className="text-sage-500 text-sm">Manage your drivers and staff.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-sage-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-sage-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Add Employee
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-visible">
        {/* Controls Header */}
        <div className="p-4 border-b border-sage-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-sage-600">
                <span>Show</span>
                <select 
                    value={entriesPerPage}
                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-16 pr-4 py-1.5 border border-sage-200 rounded-lg text-sm focus:outline-none focus:border-sage-400 w-full sm:w-64"
                />
            </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-sage-500">
            <Loader2 size={32} className="animate-spin mb-2 text-sage-400" />
            <p>Loading employees...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-sage-50 border-b border-sage-200 text-xs font-bold text-sage-600 uppercase tracking-wider">
                    <th className="px-6 py-4 cursor-pointer hover:text-sage-800 group">
                        <div className="flex items-center justify-between">
                            Name
                            <div className="flex flex-col opacity-50 group-hover:opacity-100"><ChevronUp size={8} /><ChevronDown size={8} className="-mt-1"/></div>
                        </div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-sage-800 group">
                        <div className="flex items-center justify-between">
                            Type
                            <div className="flex flex-col opacity-50 group-hover:opacity-100"><ChevronUp size={8} /><ChevronDown size={8} className="-mt-1"/></div>
                        </div>
                    </th>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-sage-100">
                {filteredEmployees.length > 0 ? filteredEmployees.slice(0, entriesPerPage).map((emp) => (
                    <tr key={emp.id} className="hover:bg-sage-50 transition-colors group relative">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-sage-200 rounded-full flex items-center justify-center text-sage-700">
                            <User size={16} />
                        </div>
                        <span className="font-medium text-sage-800 text-sm">{emp.name}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium
                        ${emp.type === 'Driver' ? 'bg-blue-50 text-blue-600' : 
                            emp.type === 'Staff' ? 'bg-purple-50 text-purple-600' : 
                            'bg-amber-50 text-amber-600'}`}>
                        {emp.type}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sage-500 text-xs font-mono">{emp.id}</td>
                    <td className="px-6 py-4 text-right relative">
                        <div className="relative inline-block">
                        <button 
                            onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === emp.id ? null : emp.id);
                            }}
                            className="text-sage-400 hover:text-sage-600 p-1 rounded-md hover:bg-sage-100 transition-colors"
                        >
                            <MoreHorizontal size={20} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === emp.id && (
                            <div className="absolute right-8 top-0 mt-0 w-48 bg-white rounded-lg shadow-lg border border-sage-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleEdit(emp); }}
                                className="w-full text-left px-4 py-3 text-sm text-sage-700 hover:bg-sage-50 flex items-center gap-2"
                            >
                                <Edit2 size={14} /> Edit Details
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(emp.id); }}
                                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-sage-50"
                            >
                                <Trash2 size={14} /> Delete Employee
                            </button>
                            </div>
                        )}
                        </div>
                    </td>
                    </tr>
                )) : (
                    <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sage-400">
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
                Showing 1 to {Math.min(filteredEmployees.length, entriesPerPage)} of {filteredEmployees.length} entries
            </div>
            <div className="flex gap-1">
                <button className="px-3 py-1 border border-sage-200 rounded hover:bg-sage-50 text-xs disabled:opacity-50">Previous</button>
                <button className="px-3 py-1 bg-sage-600 text-white border border-sage-600 rounded text-xs">1</button>
                <button className="px-3 py-1 border border-sage-200 rounded hover:bg-sage-50 text-xs">2</button>
                <button className="px-3 py-1 border border-sage-200 rounded hover:bg-sage-50 text-xs">Next</button>
            </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <EmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave}
        initialData={editingEmployee}
      />
    </div>
  );
};

export default Employees;