
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Minimize2 } from 'lucide-react';
import { useFarmData } from '../context/FarmContext';
import { AnalyticsEngine } from '../utils/AnalyticsEngine';

// --- SERVICE IMPORT ---
// 1. For ONLINE PREVIEW (Standard Google API Key):
import { geminiService } from '../lib/GeminiService';

// 2. For LOCAL USE (Firebase Vertex AI - No API Key required):
// Uncomment the line below and comment out the import above to use Firebase AI Logic locally.
// import { geminiService } from '../lib/GeminiServiceVertex';
// ----------------------

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const Assistant: React.FC = () => {
  // Added 'drivers' and 'groups' to the destructured context
  const { employees, travels, groups, debts, drivers } = useFarmData();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'assistant', text: 'Hello! I have access to your real-time farm data. Ask me about revenue, employee performance, or travel logs.' }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // --- DATA PREPARATION ---
  // We format the data to be token-efficient before sending to Gemini
  const prepareContext = () => {
    const stats = AnalyticsEngine.getGlobalStats(travels, groups, employees, debts);
    
    // Enhanced Employee Context with Wages
    const empContext = employees.map(e => {
        let wageInfo = '';
        
        if (e.type === 'Driver') {
            // Find driver specific record to get base wage
            const driverRec = drivers.find(d => d.employeeId === e.id);
            wageInfo = driverRec ? `Role: Driver, Base Wage: ₱${driverRec.wage} per trip` : 'Role: Driver (No wage set)';
        } else {
            // Find groups this employee belongs to
            const employeeGroups = groups.filter(g => g.employees && g.employees.includes(e.id));
            if (employeeGroups.length > 0) {
                // List all groups and their rates
                const rates = employeeGroups.map(g => `${g.name} (Rate: ₱${g.wage}/ton)`).join(', ');
                wageInfo = `Role: Staff, Groups: [${rates}]`;
            } else {
                wageInfo = 'Role: Staff (No active group)';
            }
        }
        return `- ${e.name} (${wageInfo})`;
    }).join('\n');
    
    // Expanded to 100 travels for better analysis scope
    const recentTravels = travels
      .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
      .slice(0, 100)
      .map(t => {
        const driverName = employees.find(e => e.id === t.driver)?.name || 'Unknown';
        
        // Calculate basic financials for the prompt context
        const sugarIncome = (t.sugarcane_price || 0) * (t.bags || 0);
        const molassesIncome = (t.molasses_price || 0) * (t.molasses || 0);
        const totalIncome = sugarIncome + molassesIncome;
        
        // Expense Calc for context
        const otherExpenses = t.expenses?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
        
        return `Date: ${t.date}, Ticket: ${t.ticket || 'N/A'}, Name: ${t.name}, Driver: ${driverName}, Tons: ${t.tons}, Total Income: ₱${totalIncome}, Driver Tip: ₱${t.driverTip || 0}, Other Exp: ₱${otherExpenses}`;
      }).join('\n');

    // Debt summary
    const debtContext = debts
        .filter(d => !d.paid)
        .map(d => {
            const empName = employees.find(e => e.id === d.employeeId)?.name || 'Unknown';
            return `${empName} owes ₱${d.amount} (${d.description})`;
        }).join('; ');

    return `
      Current Farm Snapshot:
      - Total Revenue (All Time): ₱${stats.totalRevenue.toLocaleString()}
      - Total Tonnage (All Time): ${stats.totalTons.toLocaleString()} tons
      - Outstanding Debts Total: ₱${stats.unpaidDebts.toLocaleString()}
      
      Employees & Wage Rates:
      ${empContext}
      
      Active Unpaid Debts:
      [${debtContext}]
      
      Recent Travel Logs (Last 100 trips):
      ${recentTravels}
    `;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsThinking(true);

    try {
      // 1. Snapshot current data
      const contextData = prepareContext();
      
      // 2. Send to Gemini
      const responseText = await geminiService.askAssistant(userMsg.text, contextData);
      
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: responseText };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: "Sorry, I encountered an error processing that request." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-sage-200 overflow-hidden flex flex-col pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-200">
          {/* Header */}
          <div className="bg-sage-600 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2 text-white">
              <Sparkles size={18} />
              <h3 className="font-bold">JFarm AI</h3>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setMessages([])} className="text-sage-200 hover:text-white text-xs">Clear</button>
                <button onClick={() => setIsOpen(false)} className="text-sage-200 hover:text-white">
                <Minimize2 size={18} />
                </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 bg-sage-50 space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-sage-600 text-white rounded-br-none' 
                      : 'bg-white text-sage-800 border border-sage-100 rounded-bl-none'}
                  `}
                >
                  {/* Simple rendering of newlines; for full Markdown support, a library like react-markdown would be needed */}
                  <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-white text-sage-800 border border-sage-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-sage-500" />
                  <span className="text-xs text-sage-500">Analyzing farm data...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-sage-100 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about revenue, employees..."
              className="flex-1 bg-sage-50 border-transparent focus:bg-white border focus:border-sage-300 rounded-xl px-3 py-2 text-sm outline-none transition-all text-sage-800"
            />
            <button 
              type="submit"
              disabled={!query.trim() || isThinking}
              className="bg-sage-600 text-white p-2 rounded-xl hover:bg-sage-700 disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105
          ${isOpen ? 'bg-sage-500 text-sage-100 rotate-90' : 'bg-gradient-to-br from-sage-600 to-sage-800 text-white'}
        `}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};

export default Assistant;
