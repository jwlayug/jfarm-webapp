import React from 'react';
import { Car, DollarSign } from 'lucide-react';
import * as Mock from '../services/mockData';
import { getDriverName } from '../utils/calculations';

const Drivers: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Drivers</h1>
          <p className="text-sage-500 text-sm">Manage driver specific details and wages.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-sage-50 text-sage-700 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Driver Name</th>
              <th className="px-6 py-4">Base Wage (Per Trip)</th>
              <th className="px-6 py-4">Linked Employee ID</th>
              <th className="px-6 py-4">Driver ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage-100">
            {Mock.drivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-sage-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-sage-200 rounded-full flex items-center justify-center text-sage-700">
                      <Car size={16} />
                    </div>
                    <span className="font-medium text-sage-800">
                      {getDriverName(driver.employeeId, Mock.employees)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sage-700 font-semibold">
                    <DollarSign size={14} />
                    {driver.wage?.toLocaleString() ?? 0}
                  </div>
                </td>
                <td className="px-6 py-4 text-sage-500 text-sm">{driver.employeeId}</td>
                <td className="px-6 py-4 text-sage-400 text-xs font-mono">{driver.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Drivers;