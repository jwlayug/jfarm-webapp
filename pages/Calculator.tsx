import React, { useState } from 'react';
import { Calculator as CalcIcon, Plus, Trash2, RefreshCw } from 'lucide-react';

const Calculator: React.FC = () => {
  const [sugarcaneEntries, setSugarcaneEntries] = useState<{id: number, bags: number, price: number}[]>([
    { id: 1, bags: 0, price: 0 }
  ]);
  
  const [molassesEntries, setMolassesEntries] = useState<{id: number, kilos: number, price: number}[]>([
    { id: 1, kilos: 0, price: 0 }
  ]);

  const addSugarcane = () => {
    setSugarcaneEntries([...sugarcaneEntries, { id: Date.now(), bags: 0, price: 0 }]);
  };

  const addMolasses = () => {
    setMolassesEntries([...molassesEntries, { id: Date.now(), kilos: 0, price: 0 }]);
  };

  const updateSugarcane = (id: number, field: 'bags' | 'price', value: number) => {
    setSugarcaneEntries(sugarcaneEntries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const updateMolasses = (id: number, field: 'kilos' | 'price', value: number) => {
    setMolassesEntries(molassesEntries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeSugarcane = (id: number) => {
     if(sugarcaneEntries.length > 1)
      setSugarcaneEntries(sugarcaneEntries.filter(e => e.id !== id));
  };

  const removeMolasses = (id: number) => {
    if(molassesEntries.length > 1)
      setMolassesEntries(molassesEntries.filter(e => e.id !== id));
  };

  const totalSugarcane = sugarcaneEntries.reduce((sum, e) => sum + (e.bags * e.price), 0);
  const totalMolasses = molassesEntries.reduce((sum, e) => sum + (e.kilos * e.price), 0);
  const grandTotal = totalSugarcane + totalMolasses;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-sage-600 rounded-xl text-white shadow-lg">
           <CalcIcon size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Calculator</h1>
          <p className="text-sage-500 text-sm">Compute Sugarcane & Molasses totals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Sugarcane Section */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-sage-100">
            <div className="flex justify-between items-center mb-4 border-b border-sage-100 pb-4">
               <h3 className="font-bold text-lg text-sage-800">Sugarcane</h3>
               <button onClick={addSugarcane} className="text-sage-600 hover:bg-sage-50 p-2 rounded-full transition-colors"><Plus size={20}/></button>
            </div>
            <div className="space-y-3">
               {sugarcaneEntries.map((entry, idx) => (
                  <div key={entry.id} className="flex items-center gap-2">
                     <span className="text-xs text-sage-400 w-6 text-center">{idx + 1}</span>
                     <div className="flex-1 relative">
                        <input 
                           type="number" 
                           placeholder="Bags"
                           className="w-full bg-sage-50 border-none rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-sage-400"
                           value={entry.bags || ''}
                           onChange={(e) => updateSugarcane(entry.id, 'bags', parseFloat(e.target.value) || 0)}
                        />
                        <span className="absolute right-2 top-2 text-xs text-sage-400">bags</span>
                     </div>
                     <div className="text-sage-400">x</div>
                     <div className="flex-1 relative">
                         <input 
                           type="number" 
                           placeholder="Price"
                           className="w-full bg-sage-50 border-none rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-sage-400"
                           value={entry.price || ''}
                           onChange={(e) => updateSugarcane(entry.id, 'price', parseFloat(e.target.value) || 0)}
                        />
                        <span className="absolute right-2 top-2 text-xs text-sage-400">₱</span>
                     </div>
                     <button onClick={() => removeSugarcane(entry.id)} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button>
                  </div>
               ))}
            </div>
            <div className="mt-6 pt-4 border-t border-sage-100 flex justify-between items-center">
               <span className="text-sage-500 font-medium">Subtotal</span>
               <span className="text-xl font-bold text-sage-800">₱{totalSugarcane.toLocaleString()}</span>
            </div>
         </div>

         {/* Molasses Section */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-sage-100">
            <div className="flex justify-between items-center mb-4 border-b border-sage-100 pb-4">
               <h3 className="font-bold text-lg text-sage-800">Molasses</h3>
               <button onClick={addMolasses} className="text-sage-600 hover:bg-sage-50 p-2 rounded-full transition-colors"><Plus size={20}/></button>
            </div>
            <div className="space-y-3">
               {molassesEntries.map((entry, idx) => (
                  <div key={entry.id} className="flex items-center gap-2">
                     <span className="text-xs text-sage-400 w-6 text-center">{idx + 1}</span>
                     <div className="flex-1 relative">
                        <input 
                           type="number" 
                           placeholder="Kilos"
                           className="w-full bg-sage-50 border-none rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-sage-400"
                           value={entry.kilos || ''}
                           onChange={(e) => updateMolasses(entry.id, 'kilos', parseFloat(e.target.value) || 0)}
                        />
                         <span className="absolute right-2 top-2 text-xs text-sage-400">kg</span>
                     </div>
                     <div className="text-sage-400">x</div>
                     <div className="flex-1 relative">
                         <input 
                           type="number" 
                           placeholder="Price"
                           className="w-full bg-sage-50 border-none rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-sage-400"
                           value={entry.price || ''}
                           onChange={(e) => updateMolasses(entry.id, 'price', parseFloat(e.target.value) || 0)}
                        />
                        <span className="absolute right-2 top-2 text-xs text-sage-400">₱</span>
                     </div>
                     <button onClick={() => removeMolasses(entry.id)} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button>
                  </div>
               ))}
            </div>
            <div className="mt-6 pt-4 border-t border-sage-100 flex justify-between items-center">
               <span className="text-sage-500 font-medium">Subtotal</span>
               <span className="text-xl font-bold text-sage-800">₱{totalMolasses.toLocaleString()}</span>
            </div>
         </div>
      </div>

      {/* Grand Total */}
      <div className="bg-sage-700 text-white p-8 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
         <div>
            <h2 className="text-3xl font-bold">Total Amount</h2>
            <p className="text-sage-300">Sum of all sugarcane and molasses entries</p>
         </div>
         <div className="text-5xl font-bold tracking-tight">
            ₱{grandTotal.toLocaleString()}
         </div>
      </div>
    </div>
  );
};

export default Calculator;