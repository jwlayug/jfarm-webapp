import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Groups from './pages/Groups';
import Drivers from './pages/Drivers';
import Debts from './pages/Debts';
import Lands from './pages/Lands';
import Plates from './pages/Plates';
import Destinations from './pages/Destinations';
import Expenses from './pages/Expenses';
import Loans from './pages/Loans';
import Summaries from './pages/Summaries';
import Settings from './pages/Settings';
import Calculator from './pages/Calculator';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('Dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard': return <Dashboard />;
      case 'Employees': return <Employees />;
      case 'Groups': return <Groups />;
      case 'Drivers': return <Drivers />;
      case 'Debts': return <Debts />;
      case 'Lands': return <Lands />;
      case 'Plates': return <Plates />;
      case 'Destinations': return <Destinations />;
      case 'Expenses': return <Expenses />;
      case 'Loans': return <Loans />;
      case 'Summaries': return <Summaries />;
      case 'Settings': return <Settings />;
      case 'Calculator': return <Calculator />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-sage-50 overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 overflow-y-auto bg-sage-50 p-4 lg:p-8 no-scrollbar">
          {renderPage()}
          <div className="h-8"></div>
        </div>
      </main>
    </div>
  );
}