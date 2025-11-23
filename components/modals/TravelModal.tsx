import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Map, Disc, Navigation, Plus, Trash2, User, Calendar } from 'lucide-react';
import { Travel, Employee, Land, Plate, Destination, Group } from '../../types';

interface TravelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (travel: Omit<Travel, 'id'>) => Promise<void>;
  initialData?: Travel | null;
  group: Group | null;
  employees: Employee[];
  lands: Land[];
  plates: Plate[];
  destinations: Destination[];
}

const TravelModal: React.FC<TravelModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  group,
  employees,
  lands,
  plates,
  destinations
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Form Fields
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [ticket, setTicket] = useState('');
  const [landId, setLandId] = useState('');
  const [plateId, setPlateId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [driverTip, setDriverTip] = useState<number>(0);
  const [tons, setTons] = useState<number>(0);
  const [bags, setBags] = useState<number>(0);
  const [sugarcanePrice, setSugarcanePrice] = useState<number>(0);
  const [molasses, setMolasses] = useState<number>(0);
  const [molassesPrice, setMolassesPrice] = useState<number>(0);

  // Attendance: Map employeeId -> boolean
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  // Expenses
  const [expenses, setExpenses] = useState<{name: string, amount: number}[]>([]);

  useEffect(() => {
    if (isOpen && group) {
      if (initialData) {
        setDate(initialData.date || new Date().toISOString().split('T')[0]);
        setTicket(initialData.ticket || '');
        setLandId(initialData.land);
        setPlateId(initialData.plateNumber);
        setDestinationId(initialData.destination);
        setDriverId(initialData.driver);
        setDriverTip(initialData.driverTip || 0);
        setTons(initialData.tons || 0);
        setBags(initialData.bags || 0);
        setSugarcanePrice(initialData.sugarcane_price || 0);
        setMolasses(initialData.molasses || 0);
        setMolassesPrice(initialData.molasses_price || 0);
        
        // Map array to object
        const attMap: Record<string, boolean> = {};
        initialData.attendance.forEach(a => {
          attMap[a.employeeId] = a.present;
        });
        // Ensure all current group members are in the map (default false if new member)
        group.employees.forEach(empId => {
            if (attMap[empId] === undefined) attMap[empId] = false;
        });
        setAttendance(attMap);

        setExpenses(initialData.expenses?.map(e => ({ name: e.name, amount: e.amount })) || []);
      } else {
        // New Travel
        setDate(new Date().toISOString().split('T')[0]);
        setTicket('');
        setLandId('');
        setPlateId('');
        setDestinationId('');
        setDriverId('');
        setDriverTip(0);
        setTons(0);
        setBags(0);
        setSugarcanePrice(0);
        setMolasses(0);
        setMolassesPrice(0);
        
        // Default all group members to Present (true)
        const attMap: Record<string, boolean> = {};
        group.employees.forEach(empId => {
          attMap[empId] = true;
        });
        setAttendance(attMap);
        
        setExpenses([]);
      }
    }
  }, [isOpen, initialData, group]);

  if (!isOpen || !group) return null;

  const handleAttendanceChange = (empId: string) => {
    setAttendance(prev => ({ ...prev, [empId]: !prev[empId] }));
  };

  const addExpense = () => {
    setExpenses([...expenses, { name: '', amount: 0 }]);
  };

  const updateExpense = (index: number, field: 'name' | 'amount', value: any) => {
    const newExpenses = [...expenses];
    newExpenses[index] = { ...newExpenses[index], [field]: value };
    setExpenses(newExpenses);
  };

  const removeExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

   const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!landId || !plateId || !destinationId || !driverId) {
      alert("Please fill in all required fields (Land, Plate, Destination, Driver).");
      return;
    }

    setIsLoading(true);
    try {
      // Reconstruct Attendance Array
      const attendanceArray = Object.entries(attendance).map(([id, present]) => ({
        employeeId: id,
        present: present as boolean
      }));

      // Create name automatically based on Ticket or Land
      const generatedName = ticket ? `${formatDate(date)} - ${ticket}` : `Trip to ${lands.find(l => l.id === landId)?.name}`;

      const travelData: Omit<Travel, 'id'> = {
        name: generatedName,
        date,
        land: landId,
        driver: driverId,
        driverTip,
        plateNumber: plateId,
        destination: destinationId,
        ticket,
        tons,
        bags,
        sugarcane_price: sugarcanePrice,
        molasses,
        molasses_price: molassesPrice,
        groupId: group.id,
        attendance: attendanceArray,
        expenses: expenses
      };

      await onSave(travelData);
      onClose();
    } catch (error) {
      console.error("Failed to save travel", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get full employee objects for the group members
  const groupMemberObjects = employees.filter(e => group.employees.includes(e.id));
  const driverOptions = employees.filter(e => e.type === 'Driver');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-sage-600 px-6 py-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">
              {initialData ? 'Edit Travel' : 'Add New Travel'}
            </h2>
            <p className="text-sage-200 text-xs">Group: {group.name}</p>
          </div>
          <button onClick={onClose} className="text-sage-200 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* 1. Logistics Section */}
            <section>
              <h3 className="text-sage-800 font-bold border-b border-sage-200 pb-2 mb-4 flex items-center gap-2">
                <Map size={18} /> Logistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div>
                  <label className="block text-xs font-medium text-sage-600 mb-1">Travel Date *</label>
                  <div className="relative">
                     <input 
                        type="date" value={date} onChange={e => setDate(e.target.value)} required
                        className="w-full px-3 py-2 border border-sage-200 rounded-lg text-sm bg-white text-sage-800 focus:ring-2 focus:ring-sage-400 focus:outline-none"
                     />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-sage-600 mb-1">Land Source *</label>
                  <select 
                    value={landId} onChange={e => setLandId(e.target.value)} required
                    className="w-full px-3 py-2 border border-sage-200 rounded-lg text-sm bg-white text-sage-800 focus:ring-2 focus:ring-sage-400 focus:outline-none"
                  >
                    <option value="">Select Land</option>
                    {lands.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-sage-600 mb-1">Truck Plate *</label>
                  <select 
                    value={plateId} onChange={e => setPlateId(e.target.value)} required
                    className="w-full px-3 py-2 border border-sage-200 rounded-lg text-sm bg-white text-sage-800 focus:ring-2 focus:ring-sage-400 focus:outline-none"
                  >
                    <option value="">Select Plate</option>
                    {plates.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-sage-600 mb-1">Destination *</label>
                  <select 
                    value={destinationId} onChange={e => setDestinationId(e.target.value)} required
                    className="w-full px-3 py-2 border border-sage-200 rounded-lg text-sm bg-white text-sage-800 focus:ring-2 focus:ring-sage-400 focus:outline-none"
                  >
                    <option value="">Select Destination</option>
                    {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* 2. Details & Metrics */}
            <section>
              <h3 className="text-sage-800 font-bold border-b border-sage-200 pb-2 mb-4 flex items-center gap-2">
                <Disc size={18} /> Details & Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div>
                  <label className="block text-xs font-medium text-sage-600 mb-1">Ticket #</label>
                  <input 
                    type="text" value={ticket} onChange={e => setTicket(e.target.value)}
                    placeholder="e.g. T-105"
                    className="w-full px-3 py-2 border border-sage-200 rounded-lg text-sm bg-white text-sage-800 focus:ring-2 focus:ring-sage-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-sage-600 mb-1">Driver *</label>
                  <select 
                    value={driverId} onChange={e => setDriverId(e.target.value)} required
                    className="w-full px-3 py-2 border border-sage-200 rounded-lg text-sm bg-white text-sage-800 focus:ring-2 focus:ring-sage-400 focus:outline-none"
                  >
                    <option value="">Select Driver</option>
                    {driverOptions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-sage-600 mb-1">Driver Tip (₱)</label>
                  <input 
                    type="number" value={driverTip} onChange={e => setDriverTip(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-sage-200 rounded-lg text-sm bg-white text-sage-800 focus:ring-2 focus:ring-sage-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-sage-600 mb-1">Tons (Weight)</label>
                  <input 
                    type="number" step="0.01" value={tons} onChange={e => setTons(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-sage-200 rounded-lg text-sm bg-white text-sage-800 focus:ring-2 focus:ring-sage-400 focus:outline-none"
                  />
                </div>

                {/* Additional Fields */}
                <div>
                  <label className="block text-xs font-medium text-sage-600 mb-1">Bags</label>
                  <input 
                    type="number" step="1" value={bags} onChange={e => setBags(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-sage-200 rounded-lg text-sm bg-white text-sage-800 focus:ring-2 focus:ring-sage-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-sage-600 mb-1">Sugarcane Price (₱)</label>
                  <input 
                    type="number" step="0.01" value={sugarcanePrice} onChange={e => setSugarcanePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-sage-200 rounded-lg text-sm bg-white text-sage-800 focus:ring-2 focus:ring-sage-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-sage-600 mb-1">Molasses (kg/tons)</label>
                  <input 
                    type="number" step="0.01" value={molasses} onChange={e => setMolasses(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-sage-200 rounded-lg text-sm bg-white text-sage-800 focus:ring-2 focus:ring-sage-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-sage-600 mb-1">Molasses Price (₱)</label>
                  <input 
                    type="number" step="0.01" value={molassesPrice} onChange={e => setMolassesPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-sage-200 rounded-lg text-sm bg-white text-sage-800 focus:ring-2 focus:ring-sage-400 focus:outline-none"
                  />
                </div>
              </div>
            </section>

            {/* 3. Group Attendance */}
            <section>
              <h3 className="text-sage-800 font-bold border-b border-sage-200 pb-2 mb-4 flex items-center gap-2">
                <User size={18} /> Group Attendance
              </h3>
              <div className="bg-sage-50 p-4 rounded-lg border border-sage-100">
                {groupMemberObjects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {groupMemberObjects.map(emp => (
                      <label key={emp.id} className="flex items-center gap-3 p-3 bg-white rounded border border-sage-200 cursor-pointer hover:border-sage-400 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={!!attendance[emp.id]} 
                          onChange={() => handleAttendanceChange(emp.id)}
                          className="w-4 h-4 text-sage-600 rounded focus:ring-sage-500"
                        />
                        <span className={`text-sm font-medium ${attendance[emp.id] ? 'text-sage-800' : 'text-gray-400'}`}>
                          {emp.name}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-sage-400 italic">No members in this group.</p>
                )}
              </div>
            </section>

            {/* 4. Additional Expenses */}
            <section>
              <h3 className="text-sage-800 font-bold border-b border-sage-200 pb-2 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2"><Navigation size={18} /> Trip Expenses</div>
                <button type="button" onClick={addExpense} className="text-xs bg-sage-100 text-sage-700 px-2 py-1 rounded hover:bg-sage-200 flex items-center gap-1">
                   <Plus size={12} /> Add Expense
                </button>
              </h3>
              <div className="space-y-2">
                {expenses.map((exp, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input 
                      type="text" placeholder="Expense Name (e.g. Food, Toll)"
                      value={exp.name} onChange={e => updateExpense(idx, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-sage-200 rounded-lg text-sm bg-white text-sage-800"
                    />
                    <input 
                      type="number" placeholder="Amount"
                      value={exp.amount} onChange={e => updateExpense(idx, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-24 px-3 py-2 border border-sage-200 rounded-lg text-sm bg-white text-sage-800"
                    />
                    <button type="button" onClick={() => removeExpense(idx)} className="text-red-400 hover:text-red-600 p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {expenses.length === 0 && <p className="text-sm text-sage-400 italic">No extra expenses added.</p>}
              </div>
            </section>

          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-sage-100 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sage-600 hover:bg-sage-100 rounded-lg font-medium transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-sage-600 text-white rounded-lg font-medium hover:bg-sage-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {initialData ? 'Save Changes' : 'Create Travel Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TravelModal;