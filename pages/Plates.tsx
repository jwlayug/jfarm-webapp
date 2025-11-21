import React from 'react';
import { Disc, Plus, Trash2, Edit2 } from 'lucide-react';
import * as Mock from '../services/mockData';

const Plates: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Plates</h1>
          <p className="text-sage-500 text-sm">Manage truck plate numbers.</p>
        </div>
        <button className="bg-sage-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-sage-700 transition-colors shadow-sm">
          <Plus size={18} /> Add Plate
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Mock.plates.map((plate) => (
          <div key={plate.id} className="bg-white p-6 rounded-xl shadow-sm border border-sage-100 flex items-center justify-between group relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-sage-400"></div>
             <div className="flex items-center gap-3">
                <Disc className="text-sage-300" size={24} />
                <span className="text-xl font-mono font-bold text-sage-700">{plate.name}</span>
             </div>
             <div className="flex gap-2">
                 <button className="text-sage-300 hover:text-sage-600"><Edit2 size={16} /></button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plates;