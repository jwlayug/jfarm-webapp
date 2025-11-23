import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentPage = 'Dashboard', 
  onNavigate = () => {} 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-sage-50 overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 overflow-y-auto bg-sage-50 p-4 lg:p-8 no-scrollbar">
          {children}
          <div className="h-8"></div>
        </div>
      </main>
    </div>
  );
};

export default Layout;