import React from 'react';
import { Search, Bell, ShoppingCart, Grid, Download, Menu, Settings } from 'lucide-react';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  return (
    <header className="h-20 bg-white border-b border-sage-100 flex items-center justify-between px-4 lg:px-8 shadow-sm shrink-0 z-10">
      <div className="flex items-center gap-4">
         <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-sage-600">
            <Menu size={24} />
         </button>
         {/* Desktop Search */}

      </div>

      <div className="flex items-center gap-3 md:gap-5">
        
        
        <div className="flex items-center gap-3 pl-3 border-l border-sage-100">
           <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-sage-800">JFARM</div>
              <div className="text-xs text-sage-400">Administrator</div>
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;