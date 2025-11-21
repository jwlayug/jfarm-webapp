import React from 'react';
import { Plus, Users, Calendar } from 'lucide-react';
import * as Mock from '../services/mockData';
import { getEmployeeNames } from '../utils/calculations';

const Groups: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Groups</h1>
          <p className="text-sage-500 text-sm">Manage work groups and assigned employees.</p>
        </div>
        <button className="bg-sage-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-sage-700 transition-colors shadow-sm">
          <Plus size={18} /> Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Mock.groups.map((group) => (
          <div key={group.id} className="bg-white rounded-xl shadow-sm border border-sage-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-sage-100 rounded-lg text-sage-700">
                <Users size={24} />
              </div>
              <div className="text-right">
                 <span className="text-xs text-sage-400 block">Wage Rate</span>
                 <span className="text-lg font-bold text-sage-800">${group.wage}</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-sage-800 mb-2">{group.name}</h3>
            <div className="flex items-center gap-2 text-sm text-sage-500 mb-4">
               <Calendar size={14} />
               <span>Created: {group.created_at}</span>
            </div>
            
            <div className="border-t border-sage-100 pt-4">
              <p className="text-xs font-semibold text-sage-400 uppercase tracking-wider mb-2">Members</p>
              <p className="text-sm text-sage-700 leading-relaxed">
                {getEmployeeNames(group.employees, Mock.employees) || "No members assigned"}
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-sage-100 flex justify-end gap-2">
               <button className="text-sm text-sage-500 hover:text-sage-700 font-medium">Edit</button>
               <button className="text-sm text-red-400 hover:text-red-600 font-medium">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Groups;