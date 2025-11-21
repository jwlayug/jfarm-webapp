import React from 'react';
import {
  LayoutDashboard, Users, Layers, Car, CreditCard, Map,
  Disc, Navigation, Receipt, Landmark, FileText, Settings,
  Calculator, X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentPage: string;
  onNavigate: (page: string) => void;
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

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, currentPage, onNavigate }) => {
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Employees', icon: Users },
    { label: 'Groups', icon: Layers },
    { label: 'Drivers', icon: Car },
    { label: 'Debts', icon: CreditCard },
    { label: 'Lands', icon: Map },
    { label: 'Plates', icon: Disc },
    { label: 'Destinations', icon: Navigation },
    { label: 'Expenses', icon: Receipt },
    { label: 'Loans', icon: Landmark },
    { label: 'Summaries', icon: FileText },
    { label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-sage-600 text-white transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 flex flex-col shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between px-6 py-5 h-20 border-b border-sage-500">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
            <div className="w-8 h-8 bg-sage-100 rounded-lg flex items-center justify-center shadow-inner">
              <span className="text-sage-700">S</span>
            </div>
            <span>SAGE<span className="text-sage-300">UI</span></span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-sage-200 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="py-4 flex-1 overflow-y-auto no-scrollbar flex flex-col">
          <div className="flex-1 space-y-1">
            {navItems.map(item => (
              <SidebarItem 
                key={item.label} 
                {...item} 
                active={currentPage === item.label}
                onClick={() => {
                  onNavigate(item.label);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>
          
          <div className="mx-6 my-4 border-t border-sage-500"></div>
          
          <SidebarItem 
            icon={Calculator} 
            label="Calculator" 
            active={currentPage === 'Calculator'}
            onClick={() => {
              onNavigate('Calculator');
              setIsOpen(false);
            }}
          />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;