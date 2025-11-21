import React from 'react';
import { Map, Plus, Trash2, Edit2 } from 'lucide-react';
import * as Mock from '../services/mockData';

const Lands: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Lands</h1>
          <p className="text-sage-500 text-sm">Register source lands for travels.</p>
        </div>
        <button className="bg-sage-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-sage-700 transition-colors shadow-sm">
          <Plus size={18} /> Add Land
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-hidden">
        <ul className="divide-y divide-sage-100">
          {Mock.lands.map((land) => (
            <li key={land.id} className="p-4 flex items-center justify-between hover:bg-sage-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-sage-100 flex items-center justify-center text-sage-600">
                  <Map size={20} />
                </div>
                <div>
                   <h3 className="font-medium text-sage-800">{land.name}</h3>
                   <p className="text-xs text-sage-400 font-mono">{land.id}</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-sage-400 hover:text-sage-600 hover:bg-sage-200 rounded-lg"><Edit2 size={16} /></button>
                <button className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Lands;