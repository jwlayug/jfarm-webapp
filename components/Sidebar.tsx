import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Layers, Car, CreditCard, Map,
  Hash, Navigation, Receipt, Landmark, FileText, Settings,
  Calculator, X, Sprout, LogOut, ChevronDown, Plus, Check, Trash2
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useFarmData } from '../context/FarmContext';
import CreateFarmModal from './modals/CreateFarmModal';
import DeleteConfirmationModal from './modals/DeleteConfirmationModal';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SidebarItem: React.FC<{ 
  icon: any, 
  label: string, 
  active?: boolean, 
  onClick: () => void 
}> = ({ icon: Icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-200 mb-1 mx-2 rounded-lg
    ${active
      ? 'bg-sage-500 text-white shadow-sm'
      : 'text-sage-100 hover:bg-sage-500 hover:text-white hover:bg-opacity-50'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { farms, activeFarmId, setActiveFarmId, removeFarm } = useFarmData();
  const [isFarmMenuOpen, setIsFarmMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Navigation Hooks
  const navigate = useNavigate();
  const location = useLocation();
  
  // Delete Farm State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [farmToDelete, setFarmToDelete] = useState<{id: string, name: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeFarm = farms.find(f => f.id === activeFarmId);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Employees', icon: Users, path: '/employees' },
    { label: 'Groups', icon: Layers, path: '/groups' },
    { label: 'Drivers', icon: Car, path: '/drivers' },
    { label: 'Debts', icon: CreditCard, path: '/debts' },
    { label: 'Lands', icon: Map, path: '/lands' },
    { label: 'Plates', icon: Hash, path: '/plates' },
    { label: 'Destinations', icon: Navigation, path: '/destinations' },
    { label: 'Summaries', icon: FileText, path: '/summaries' },
    { label: 'Expenses', icon: Receipt, path: '/expenses' },
    { label: 'Loans', icon: Landmark, path: '/loans' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const handleDeleteClick = (farm: {id: string, name: string}) => {
    setFarmToDelete(farm);
    setIsDeleteModalOpen(true);
    setIsFarmMenuOpen(false); // Close menu
  };

  const handleConfirmDelete = async () => {
    if (!farmToDelete) return;
    setIsDeleting(true);
    try {
        await removeFarm(farmToDelete.id);
        setIsDeleteModalOpen(false);
        setFarmToDelete(null);
    } catch (error) {
        console.error("Failed to delete farm", error);
        alert("Failed to delete farm.");
    } finally {
        setIsDeleting(false);
    }
  };

  // Check if path matches
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile/Tablet Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sage-600 text-white transform transition-transform duration-300 ease-in-out shadow-2xl
        lg:relative lg:translate-x-0 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header / Farm Switcher */}
        <div className="px-4 py-5 h-20 border-b border-sage-500 shrink-0 flex items-center justify-between relative">
           <div 
              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 hover:bg-sage-500 p-2 rounded-lg transition-colors"
              onClick={() => setIsFarmMenuOpen(!isFarmMenuOpen)}
           >
             <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm text-sage-600 shrink-0">
               <Sprout size={22} />
             </div>
             <div className="flex flex-col leading-none min-w-0">
                <div className="flex items-center gap-1">
                    <span className="text-white text-lg font-bold truncate max-w-[120px]">
                        {activeFarm ? activeFarm.name : 'JFarm'}
                    </span>
                    <ChevronDown size={14} className={`text-sage-200 transition-transform ${isFarmMenuOpen ? 'rotate-180' : ''}`}/>
                </div>
                <span className="text-[9px] text-sage-200 font-normal tracking-wide uppercase mt-0.5 whitespace-nowrap">
                    {activeFarm ? 'Active Farm' : 'Select Farm'}
                </span>
             </div>
           </div>
           
           <button onClick={() => setIsOpen(false)} className="lg:hidden text-sage-200 hover:text-white p-1 ml-2">
             <X size={24} />
           </button>

           {/* Farm Switcher Dropdown */}
           {isFarmMenuOpen && (
               <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-xl shadow-xl border border-sage-200 z-50 overflow-hidden text-gray-800 animate-in fade-in zoom-in-95 duration-100">
                   <div className="max-h-60 overflow-y-auto p-1">
                       <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Your Farms</div>
                       {farms.map(farm => (
                           <div key={farm.id} className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-50 group">
                               <button
                                   onClick={() => { setActiveFarmId(farm.id); setIsFarmMenuOpen(false); }}
                                   className={`flex-1 text-left text-sm flex items-center justify-between
                                       ${activeFarmId === farm.id ? 'text-sage-700 font-bold' : 'text-gray-700'}
                                   `}
                               >
                                   <span>{farm.name}</span>
                                   {activeFarmId === farm.id && <Check size={14} className="text-sage-600 mr-2"/>}
                               </button>
                               <button 
                                   onClick={(e) => { e.stopPropagation(); handleDeleteClick(farm); }}
                                   className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                   title="Delete Farm"
                               >
                                   <Trash2 size={14} />
                               </button>
                           </div>
                       ))}
                       {farms.length === 0 && <div className="px-3 py-2 text-sm text-gray-400 italic">No farms created yet.</div>}
                   </div>
                   <div className="border-t border-gray-100 p-2 bg-gray-50">
                       <button 
                           onClick={() => { setIsCreateModalOpen(true); setIsFarmMenuOpen(false); }}
                           className="w-full flex items-center justify-center gap-2 bg-sage-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-sage-700 transition-colors"
                       >
                           <Plus size={16} /> Create New Farm
                       </button>
                   </div>
               </div>
           )}
        </div>

        <div className="py-4 flex-1 overflow-y-auto no-scrollbar flex flex-col">
          <div className="flex-1 space-y-1">
            {navItems.map(item => (
              <SidebarItem 
                key={item.label} 
                {...item} 
                active={isActive(item.path)}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 1024) {
                    setIsOpen(false);
                  }
                }}
              />
            ))}
          </div>
          
          <div className="mx-6 my-4 border-t border-sage-500 shrink-0"></div>
          
          <div className="shrink-0 pb-safe space-y-1">
            <SidebarItem 
              icon={Calculator} 
              label="Calculator" 
              active={isActive('/calculator')}
              onClick={() => {
                navigate('/calculator');
                if (window.innerWidth < 1024) {
                  setIsOpen(false);
                }
              }}
            />
            <SidebarItem 
              icon={LogOut} 
              label="Logout" 
              active={false}
              onClick={handleLogout}
            />
          </div>
        </div>
      </aside>

      {/* Create Farm Modal */}
      <CreateFarmModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      {/* Delete Farm Confirmation Modal */}
      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Farm"
        message={`Are you sure you want to delete "${farmToDelete?.name}"? ALL data (employees, travels, debts, etc.) within this farm will be permanently lost. This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </>
  );
};

export default Sidebar;