import React, { useEffect, useState } from 'react';
import { Plus, Users, Calendar, Loader2, Edit2, Trash2, Truck, History, ChevronUp, ChevronDown } from 'lucide-react';
import { Group, Employee, Land, Plate, Destination, Travel } from '../types';
import * as GroupService from '../services/groupService';
import * as EmployeeService from '../services/employeeService';
import * as LandService from '../services/landService';
import * as PlateService from '../services/plateService';
import * as DestinationService from '../services/destinationService';
import * as TravelService from '../services/travelService';
import GroupModal from '../components/modals/GroupModal';
import TravelModal from '../components/modals/TravelModal';
import TravelListModal from '../components/modals/TravelListModal';

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [lands, setLands] = useState<Land[]>([]);
  const [plates, setPlates] = useState<Plate[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Table State
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Group Modal State
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  // Travel Modal State
  const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);
  const [activeGroupForTravel, setActiveGroupForTravel] = useState<Group | null>(null);
  const [editingTravel, setEditingTravel] = useState<Travel | null>(null);

  // Travel List Modal State
  const [isTravelListOpen, setIsTravelListOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all required data in parallel
      const [groupsData, employeesData, landsData, platesData, destData] = await Promise.all([
        GroupService.getGroups(),
        EmployeeService.getEmployees(),
        LandService.getLands(),
        PlateService.getPlates(),
        DestinationService.getDestinations()
      ]);
      setGroups(groupsData);
      setEmployees(employeesData);
      setLands(landsData);
      setPlates(platesData);
      setDestinations(destData);
    } catch (error) {
      console.error("Failed to load data", error);
      alert("Could not connect to the database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Group Handlers ---
  const handleAddGroup = () => {
    setEditingGroup(null);
    setIsGroupModalOpen(true);
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setIsGroupModalOpen(true);
  };

  const handleDeleteGroup = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await GroupService.deleteGroup(id);
        setGroups(prev => prev.filter(g => g.id !== id));
      } catch (error) {
        console.error("Delete failed", error);
        alert("Failed to delete group");
      }
    }
  };

  const handleSaveGroup = async (groupData: Omit<Group, 'id'>) => {
    if (editingGroup) {
      await GroupService.updateGroup(editingGroup.id, groupData);
      setGroups(prev => prev.map(g => 
        g.id === editingGroup.id ? { ...g, ...groupData } : g
      ));
    } else {
      const newGroup = await GroupService.addGroup(groupData);
      setGroups(prev => [...prev, newGroup]);
    }
  };

  // --- Travel Handlers ---
  const handleAddTravel = (group: Group) => {
    setActiveGroupForTravel(group);
    setEditingTravel(null);
    setIsTravelModalOpen(true);
  };

  const handleViewHistory = (group: Group) => {
    setActiveGroupForTravel(group);
    setIsTravelListOpen(true);
  };

  const handleEditTravelFromList = (travel: Travel) => {
    // Close list modal, open edit modal
    setIsTravelListOpen(false);
    setEditingTravel(travel);
    setIsTravelModalOpen(true);
  };

  const handleSaveTravel = async (travelData: Omit<Travel, 'id'>) => {
    if (editingTravel) {
      await TravelService.updateTravel(editingTravel.id, travelData);
      // Note: We don't strictly need to update local state for travels here 
      // because the list modal fetches fresh data when opened.
    } else {
      await TravelService.addTravel(travelData);
    }
  };

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Groups</h1>
          <p className="text-sage-500 text-sm">Manage work groups and assigned employees.</p>
        </div>
        <button 
          onClick={handleAddGroup}
          className="bg-sage-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-sage-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Create Group
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
          <div className="flex flex-col items-center justify-center h-64 text-sage-500">
            <Loader2 size={32} className="animate-spin mb-2 text-sage-400" />
            <p>Loading groups...</p>
          </div>
        ) : (
           <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-sage-50 border-b border-sage-200 text-xs font-bold text-sage-600 uppercase tracking-wider">
                    <th className="px-6 py-4 cursor-pointer hover:text-sage-800 group">
                        <div className="flex items-center justify-between">
                            Group Name
                            <div className="flex flex-col opacity-50 group-hover:opacity-100"><ChevronUp size={8} /><ChevronDown size={8} className="-mt-1"/></div>
                        </div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-sage-800 group">
                        <div className="flex items-center justify-between">
                            Wage Rate
                            <div className="flex flex-col opacity-50 group-hover:opacity-100"><ChevronUp size={8} /><ChevronDown size={8} className="-mt-1"/></div>
                        </div>
                    </th>
                    <th className="px-6 py-4">Members</th>
                    <th className="px-6 py-4 text-center">Quick Actions</th>
                    <th className="px-6 py-4 text-right">Manage</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-sage-100">
                {filteredGroups.length > 0 ? filteredGroups.slice(0, entriesPerPage).map((group) => (
                    <tr key={group.id} className="hover:bg-sage-50 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="font-bold text-sage-800">{group.name}</div>
                        <div className="text-xs text-sage-400 flex items-center gap-1 mt-0.5">
                            <Calendar size={12} /> {group.created_at}
                        </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sage-700 font-semibold">
                        ₱{group.wage.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sage-600">
                            <Users size={16} className="text-sage-400" />
                            <span className="font-medium text-sm">{group.employees?.length || 0} Members</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                         <div className="flex items-center justify-center gap-2">
                             <button 
                                onClick={() => handleAddTravel(group)}
                                className="flex items-center gap-1.5 bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors shadow-sm"
                                title="Add Travel Record"
                            >
                                <Plus size={14} /> Add Travel
                            </button>
                            <button 
                                onClick={() => handleViewHistory(group)}
                                className="flex items-center gap-1.5 bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors shadow-sm"
                                title="View History"
                            >
                                <History size={14} /> History
                            </button>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditGroup(group)} className="p-2 text-sage-400 hover:text-sage-600 hover:bg-sage-100 rounded-lg transition-colors" title="Edit Group">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteGroup(group.id)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Group">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sage-400">
                            No groups found.
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
                Showing 1 to {Math.min(filteredGroups.length, entriesPerPage)} of {filteredGroups.length} entries
            </div>
            <div className="flex gap-1">
                <button className="px-3 py-1 border border-sage-200 rounded hover:bg-sage-50 text-xs disabled:opacity-50">Previous</button>
                <button className="px-3 py-1 bg-sage-600 text-white border border-sage-600 rounded text-xs">1</button>
                <button className="px-3 py-1 border border-sage-200 rounded hover:bg-sage-50 text-xs">2</button>
                <button className="px-3 py-1 border border-sage-200 rounded hover:bg-sage-50 text-xs">Next</button>
            </div>
        </div>
      </div>

      {/* Group Add/Edit Modal */}
      <GroupModal 
        isOpen={isGroupModalOpen} 
        onClose={() => setIsGroupModalOpen(false)} 
        onSave={handleSaveGroup}
        initialData={editingGroup}
        availableEmployees={employees}
      />

      {/* Travel Add/Edit Modal */}
      <TravelModal
        isOpen={isTravelModalOpen}
        onClose={() => setIsTravelModalOpen(false)}
        onSave={handleSaveTravel}
        initialData={editingTravel}
        group={activeGroupForTravel}
        employees={employees}
        lands={lands}
        plates={plates}
        destinations={destinations}
      />

      {/* Travel History List Modal */}
      <TravelListModal
        isOpen={isTravelListOpen}
        onClose={() => setIsTravelListOpen(false)}
        group={activeGroupForTravel}
        onEditTravel={handleEditTravelFromList}
        lands={lands}
        plates={plates}
        destinations={destinations}
        employees={employees}
      />
    </div>
  );
};

export default Groups;