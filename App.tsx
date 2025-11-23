import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Loader2 } from 'lucide-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
    <BrowserRouter>
      <FarmProvider>
        <div className="flex h-screen bg-sage-50 overflow-hidden">
          <Sidebar 
            isOpen={sidebarOpen} 
            setIsOpen={setSidebarOpen} 
          />
          <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
            <Header setSidebarOpen={setSidebarOpen} />
            <div className="flex-1 overflow-y-auto bg-sage-50 p-4 lg:p-8 no-scrollbar">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/drivers" element={<Drivers />} />
                <Route path="/debts" element={<Debts />} />
                <Route path="/lands" element={<Lands />} />
                <Route path="/plates" element={<Plates />} />
                <Route path="/destinations" element={<Destinations />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/loans" element={<Loans />} />
                <Route path="/summaries" element={<Summaries />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/calculator" element={<Calculator />} />
                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <div className="h-8"></div>
            </div>
            {/* Inject the AI Assistant here so it overlays content */}
            <Assistant />
          </main>
        </div>
      </FarmProvider>
    </BrowserRouter>
  );
}