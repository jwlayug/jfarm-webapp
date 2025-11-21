import React, { useEffect, useState } from 'react';
import { Car, Plus, Edit2, Trash2, Loader2, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import { Driver, Employee, Travel } from '../types';
import * as DriverService from '../services/driverService';
import * as EmployeeService from '../services/employeeService';
import * as TravelService from '../services/travelService';
import { getDriverName } from '../utils/calculations';
import DriverModal from '../components/modals/DriverModal';
import DriverHistoryModal from '../components/modals/DriverHistoryModal';

const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [travels, setTravels] = useState<Travel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  
  // Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // History Modal
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [viewingDriver, setViewingDriver] = useState<Driver | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [driversData, employeesData, travelsData] = await Promise.all([
        DriverService.getDrivers(),
        EmployeeService.getEmployees(),
        TravelService.getAllTravels()
      ]);
      setDrivers(driversData);
      setEmployees(employeesData);
      setTravels(travelsData);
    } catch (error) {
      console.error("Failed to load drivers data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingDriver(null);
    setIsModalOpen(true);
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setIsModalOpen(true);
  };

  const handleViewHistory = (driver: Driver) => {
    setViewingDriver(driver);
    setIsHistoryOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await DriverService.deleteDriver(id);
        setDrivers(prev => prev.filter(d => d.id !== id));
      } catch (error) {
        console.error("Failed to delete driver", error);
        alert("Failed to delete driver");
      }
    }
  };

  const handleSave = async (data: Omit<Driver, 'id'>) => {
    if (editingDriver) {
      await DriverService.updateDriver(editingDriver.id, data);
      setDrivers(prev => prev.map(d => d.id === editingDriver.id ? { ...d, ...data } : d));
    } else {
      const newDriver = await DriverService.addDriver(data);
      setDrivers(prev => [...prev, newDriver]);
    }
  };

  const filteredDrivers = drivers.filter(driver => {
      const name = getDriverName(driver.employeeId, employees);
      return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Drivers</h1>
          <p className="text-sage-500 text-sm">Manage driver specific details and wages.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-sage-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-sage-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Add Driver
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-hidden">
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
                            Driver Name
                            <div className="flex flex-col opacity-50 group-hover:opacity-100"><ChevronUp size={8} /><ChevronDown size={8} className="-mt-1"/></div>
                        </div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-sage-800 group">
                         <div className="flex items-center justify-between">
                            Base Wage
                            <div className="flex flex-col opacity-50 group-hover:opacity-100"><ChevronUp size={8} /><ChevronDown size={8} className="-mt-1"/></div>
                        </div>
                    </th>
                    <th className="px-6 py-4">Employee ID</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-sage-100">
                    {filteredDrivers.length > 0 ? filteredDrivers.slice(0, entriesPerPage).map((driver) => (
                    <tr key={driver.id} className="hover:bg-sage-50 transition-colors group">
                        <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-sage-200 rounded-full flex items-center justify-center text-sage-700">
                            <Car size={16} />
                            </div>
                            <span className="font-medium text-sage-800 text-sm">
                            {getDriverName(driver.employeeId, employees)}
                            </span>
                        </div>
                        </td>
                        <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sage-700 font-semibold text-sm">
                            ₱{driver.wage?.toLocaleString() ?? 0}
                        </div>
                        </td>
                        <td className="px-6 py-4 text-sage-500 text-xs font-mono">{driver.employeeId}</td>
                        <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleViewHistory(driver)}
                                className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="View History & Computation"
                            >
                                <Eye size={16} />
                            </button>
                            <button 
                                onClick={() => handleEdit(driver)}
                                className="p-1.5 text-sage-400 hover:text-sage-600 hover:bg-sage-100 rounded transition-colors"
                                title="Edit Driver"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button 
                                onClick={() => handleDelete(driver.id)}
                                className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Delete Driver"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        </td>
                    </tr>
                    )) : (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-sage-400">
                        No drivers found. Link an employee to start.
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
                Showing 1 to {Math.min(filteredDrivers.length, entriesPerPage)} of {filteredDrivers.length} entries
            </div>
            <div className="flex gap-1">
                <button className="px-3 py-1 border border-sage-200 rounded hover:bg-sage-50 text-xs disabled:opacity-50">Previous</button>
                <button className="px-3 py-1 bg-sage-600 text-white border border-sage-600 rounded text-xs">1</button>
                <button className="px-3 py-1 border border-sage-200 rounded hover:bg-sage-50 text-xs">2</button>
                <button className="px-3 py-1 border border-sage-200 rounded hover:bg-sage-50 text-xs">Next</button>
            </div>
        </div>

      </div>

      <DriverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingDriver}
        employees={employees}
      />

      <DriverHistoryModal 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        driver={viewingDriver}
        employee={viewingDriver ? employees.find(e => e.id === viewingDriver.employeeId) || null : null}
        travels={travels}
      />
    </div>
  );
};

export default Drivers;