import React, { useEffect, useState } from 'react';
import { Plus, MoreHorizontal, Search, User, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Employee } from '../types';
import * as EmployeeService from '../services/employeeService';
import EmployeeModal from '../components/modals/EmployeeModal';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
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
      // Fallback to mock data for demonstration if Firebase fails/isn't set up
      // setEmployees(Mock.employees); 
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
        alert("Failed to delete employee");
      }
    }
    setActiveMenuId(null);
  };

  const handleSave = async (employeeData: Omit<Employee, 'id'>) => {
    if (editingEmployee) {
      // Update
      await EmployeeService.updateEmployee(editingEmployee.id, employeeData);
      // Optimistic Update or Refetch
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
          <p className="text-sage-500 text-sm">Manage your drivers, helpers, and staff.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-sage-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-sage-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Add Employee
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-visible min-h-[400px]">
        <div className="p-4 border-b border-sage-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employees..." 
              className="w-full pl-10 pr-4 py-2 border border-sage-200 rounded-lg focus:outline-none focus:border-sage-500 text-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-sage-500">
            <Loader2 size={32} className="animate-spin mb-2" />
            <p>Loading employees...</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-sage-50 text-sage-700 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {filteredEmployees.length > 0 ? filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-sage-50 transition-colors group relative">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-sage-200 rounded-full flex items-center justify-center text-sage-700">
                        <User size={16} />
                      </div>
                      <span className="font-medium text-sage-800">{emp.name}</span>
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
                  <td className="px-6 py-4 text-sage-500 text-sm font-mono">{emp.id}</td>
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
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-sage-100 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
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
                    No employees found. Click "Add Employee" to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
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