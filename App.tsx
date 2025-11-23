
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Loader2 } from 'lucide-react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './components/Login';
import Assistant from './components/Assistant'; // Import Assistant
import { FarmProvider } from './context/FarmContext'; 

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
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-sage-50 flex items-center justify-center text-sage-600">
        <Loader2 size={48} className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <FarmProvider>
      <div className="flex h-screen bg-sage-50 overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen} 
          currentPage={currentPage}
          onNavigate={setCurrentPage}
        />
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <Header setSidebarOpen={setSidebarOpen} />
          <div className="flex-1 overflow-y-auto bg-sage-50 p-4 lg:p-8 no-scrollbar">
            {renderPage()}
            <div className="h-8"></div>
          </div>
          {/* Inject the AI Assistant here so it overlays content */}
          <Assistant />
        </main>
      </div>
    </FarmProvider>
  );
}
