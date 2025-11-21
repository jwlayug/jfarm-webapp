import React from 'react';
import { Navigation, Plus } from 'lucide-react';
import * as Mock from '../services/mockData';

const Destinations: React.FC = () => {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Destinations</h1>
          <p className="text-sage-500 text-sm">Manage delivery destinations and color coding.</p>
        </div>
        <button className="bg-sage-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-sage-700 transition-colors shadow-sm">
          <Plus size={18} /> Add Destination
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Mock.destinations.map((dest) => (
          <div key={dest.id} className="bg-white p-5 rounded-xl shadow-sm border border-sage-100 flex items-center gap-4">
             <div 
               className="w-16 h-16 rounded-lg flex items-center justify-center text-white shadow-sm"
               style={{ backgroundColor: dest.color }}
             >
               <Navigation size={28} />
             </div>
             <div className="flex-1">
                <h3 className="text-lg font-bold text-sage-800">{dest.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-xs text-gray-400 uppercase">Color Code:</span>
                   <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{dest.color}</span>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Destinations;