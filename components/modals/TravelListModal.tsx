import React, { useState, useEffect } from 'react';
import { X, Loader2, Edit2, Trash2, Truck, BarChart3, FileText } from 'lucide-react';
import { Travel, Group, Land, Plate, Destination, Employee } from '../../types';
import * as TravelService from '../../services/travelService';
import TravelSummaryModal from './TravelSummaryModal';

interface TravelListModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  onEditTravel: (travel: Travel) => void;
  lands: Land[];
  plates: Plate[];
  destinations: Destination[];
  employees: Employee[];
}

const TravelListModal: React.FC<TravelListModalProps> = ({ 
  isOpen, 
  onClose, 
  group, 
  onEditTravel,
  lands, 
  plates, 
  destinations,
  employees
}) => {
  const [travels, setTravels] = useState<Travel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const fetchTravels = async () => {
    if (!group) return;
    setIsLoading(true);
    try {
      const data = await TravelService.getTravelsByGroup(group.id);
      setTravels(data);
    } catch (error) {
      console.error("Failed to fetch travels", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && group) {
      fetchTravels();
    }
  }, [isOpen, group]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this travel record?')) {
      try {
        await TravelService.deleteTravel(id);
        setTravels(prev => prev.filter(t => t.id !== id));
      } catch (error) {
        alert("Failed to delete travel");
      }
    }
  };

  if (!isOpen || !group) return null;

  const getLandName = (id: string) => lands.find(l => l.id === id)?.name || id;
  const getPlateName = (id: string) => plates.find(p => p.id === id)?.name || id;
  const getDestName = (id: string) => destinations.find(d => d.id === id)?.name || id;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-sage-600 px-6 py-4 flex justify-between items-center shrink-0">
             <div>
                <h2 className="text-white font-bold text-lg">Travel History</h2>
                <p className="text-sage-200 text-xs">Group: {group.name}</p>
             </div>
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsSummaryOpen(true)}
                  className="bg-sage-500 hover:bg-sage-400 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm border border-sage-400"
                >
                  <BarChart3 size={16} /> Summary
                </button>
                <div className="h-6 w-px bg-sage-500 mx-1"></div>
                <button onClick={onClose} className="text-sage-200 hover:text-white transition-colors">
                  <X size={20} />
                </button>
             </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-sage-50">
              {isLoading ? (
                 <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-sage-400" size={32} />
                 </div>
              ) : (
                  <div className="space-y-4">
                      {travels.length > 0 ? travels.map(travel => (
                          <div key={travel.id} className="bg-white p-4 rounded-lg shadow-sm border border-sage-100 hover:shadow-md transition-shadow flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                              <div className="flex items-start gap-4 flex-1">
                                  <div className="bg-sage-100 p-3 rounded-lg text-sage-600">
                                      <Truck size={20} />
                                  </div>
                                  <div>
                                      <div className="flex items-center gap-2">
                                          <h3 className="font-bold text-sage-800">{travel.name}</h3>
                                          {travel.ticket && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-mono">{travel.ticket}</span>}
                                      </div>
                                      <div className="text-sm text-gray-500 mt-1 space-y-1">
                                          <div className="flex flex-wrap items-center gap-4">
                                              <div className="flex items-center gap-1">
                                                <span className="text-xs uppercase font-bold text-sage-400">Route:</span>
                                                <span>{getLandName(travel.land)} ➝ {getDestName(travel.destination)}</span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <span className="text-xs uppercase font-bold text-sage-400">Plate:</span>
                                                <span className="font-mono">{getPlateName(travel.plateNumber)}</span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <span className="text-xs uppercase font-bold text-sage-400">Load:</span>
                                                <span className="font-bold text-sage-700">{travel.tons} tons</span>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 w-full xl:w-auto justify-end border-t xl:border-t-0 pt-3 xl:pt-0 border-sage-100">
                                  <button 
                                      onClick={() => {
                                          onEditTravel(travel);
                                      }}
                                      className="flex items-center gap-1 px-3 py-2 bg-white border border-sage-200 text-sage-600 rounded-lg hover:bg-sage-50 text-sm font-medium"
                                  >
                                      <Edit2 size={14} /> Edit
                                  </button>
                                  <button 
                                      onClick={() => handleDelete(travel.id)}
                                      className="flex items-center gap-1 px-3 py-2 bg-white border border-red-200 text-red-500 rounded-lg hover:bg-red-50 text-sm font-medium"
                                  >
                                      <Trash2 size={14} /> Delete
                                  </button>
                              </div>
                          </div>
                      )) : (
                          <div className="text-center py-12 text-sage-400">
                             <FileText size={48} className="mx-auto mb-3 opacity-50" />
                             <p>No travel records found for this group.</p>
                          </div>
                      )}
                  </div>
              )}
          </div>
        </div>
      </div>

      {/* Global Summary Modal */}
      <TravelSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        travels={travels}
        group={group}
        employees={employees}
      />
    </>
  );
};

export default TravelListModal;