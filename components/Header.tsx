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
         <div className="hidden md:flex items-center bg-sage-50 rounded-full px-4 py-2 border border-sage-100 focus-within:border-sage-400 transition-colors w-64">
            <Search size={18} className="text-sage-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-sm ml-2 text-sage-800 placeholder-sage-400 w-full" 
            />
         </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <button className="text-sage-400 hover:text-sage-600 transition-colors hidden sm:block"><Search size={20} className="md:hidden"/></button>
        <div className="flex items-center gap-1 text-sage-600 font-medium text-sm hidden sm:flex">
          <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-5 h-auto rounded-sm mr-1" />
          EN
        </div>
        <button className="relative text-sage-400 hover:text-sage-600 transition-colors">
           <ShoppingCart size={20} />
           <span className="absolute -top-1 -right-1 bg-sage-400 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">5</span>
        </button>
        <button className="relative text-sage-400 hover:text-sage-600 transition-colors">
           <Bell size={20} />
           <span className="absolute -top-1 -right-1 bg-blue-400 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">5</span>
        </button>
        <button className="text-sage-400 hover:text-sage-600 transition-colors hidden sm:block">
           <Grid size={20} />
        </button>
         <button className="text-sage-400 hover:text-sage-600 transition-colors hidden sm:block">
           <Download size={20} />
        </button>
        
        <div className="flex items-center gap-3 pl-3 border-l border-sage-100">
           <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-sage-800">Json Taylor</div>
              <div className="text-xs text-sage-400">Web Designer</div>
           </div>
           <img src="https://picsum.photos/40/40?random=99" alt="Profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
           <Settings size={18} className="text-sage-400 cursor-pointer hover:rotate-90 transition-transform duration-500" />
        </div>
      </div>
    </header>
  );
};

export default Header;