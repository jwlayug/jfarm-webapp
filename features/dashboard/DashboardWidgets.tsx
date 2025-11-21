import React, { useState } from 'react';
import { ArrowUp, ArrowDown, MoreVertical, ExternalLink, Filter, Download, FileText, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, Brush
} from 'recharts';
import { Travel, Debt, Employee, Land } from '../../types';

// --- Interfaces ---
interface StatCardProps {
    label: string;
    value: string;
    trend?: number;
    trendUp?: boolean;
    data?: number[];
    color: string;
    icon: any;
}

interface RevenueChartProps {
    data: { name: string; income: number; expense: number; profit: number }[];
}

interface PieChartProps {
    data: { name: string; value: number; color: string }[];
    totalValue: number;
    title: string;
}

interface RecentTravelsListProps {
    travels: Travel[];
    getLandName: (id: string) => string;
    getDestName: (id: string) => string;
}

interface RecentTravelsTableProps {
    travels: Travel[];
    getLandName: (id: string) => string;
    getPlateName: (id: string) => string;
    getDriverName: (id: string) => string;
}

interface DebtStatusProps {
    paidCount: number;
    unpaidCount: number;
    totalUnpaid: number;
}

export const WelcomeSection: React.FC = () => (
  <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
     <div>
        <h1 className="text-2xl font-bold text-sage-800">Dashboard Overview</h1>
        <p className="text-sage-500 text-sm mt-1">Track your farm operations, logistics, and finances.</p>
     </div>
     <div className="flex gap-3">
        <button className="flex items-center gap-2 bg-sage-400 hover:bg-sage-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
           <Filter size={16} /> Filter Year
        </button>
     </div>
  </div>
);

export const TargetCard: React.FC<{ totalTons: number }> = ({ totalTons }) => (
  <div className="bg-gradient-to-br from-sage-400 to-sage-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
    <div className="relative z-10">
       <h3 className="font-semibold text-lg mb-2">Total Tonnage</h3>
       <p className="text-sage-100 text-sm mb-6 leading-relaxed">Total weight transported across all registered travels so far.</p>
       <div className="text-4xl font-bold">{totalTons.toLocaleString()} tons</div>
    </div>
  </div>
);

export const RecentTravelsList: React.FC<RecentTravelsListProps> = ({ travels, getLandName, getDestName }) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(travels.length / itemsPerPage);
  
  const currentData = travels.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handlePrev = () => setPage(p => Math.max(1, p - 1));
  const handleNext = () => setPage(p => Math.min(totalPages, p + 1));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-5 flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-4">
         <h3 className="font-bold text-sage-700 border-l-4 border-sage-400 pl-3">Recent Travels</h3>
         {travels.length > itemsPerPage && (
            <div className="flex gap-1">
                <button 
                  onClick={handlePrev} 
                  disabled={page === 1} 
                  className="p-1 hover:bg-sage-100 rounded disabled:opacity-30 text-sage-600 transition-colors"
                >
                  <ChevronLeft size={16}/>
                </button>
                <button 
                  onClick={handleNext} 
                  disabled={page === totalPages} 
                  className="p-1 hover:bg-sage-100 rounded disabled:opacity-30 text-sage-600 transition-colors"
                >
                  <ChevronRight size={16}/>
                </button>
            </div>
         )}
      </div>
      <div className="flex flex-col gap-4 flex-1">
         {currentData.map(travel => (
            <div key={travel.id} className="flex items-center gap-3 pb-3 border-b border-sage-50 last:border-0 last:pb-0">
               <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center text-sage-600 font-bold text-xs">
                  {travel.ticket ? 'T' : 'L'}
               </div>
               <div className="flex-1">
                  <div className="text-sm font-semibold text-sage-800">{travel.name}</div>
                  <div className="text-xs text-gray-400">{getLandName(travel.land)} ➝ {getDestName(travel.destination)}</div>
               </div>
               <div className="font-bold text-sage-600 text-sm">{travel.tons}t</div>
            </div>
         ))}
         {travels.length === 0 && <p className="text-sm text-gray-400 italic">No travels recorded yet.</p>}
      </div>
      {totalPages > 1 && (
        <div className="mt-2 text-xs text-center text-gray-400">
           Page {page} of {totalPages}
        </div>
      )}
    </div>
  );
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, trend, trendUp, data, color, icon: Icon }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-sage-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-full bg-opacity-20`} style={{ backgroundColor: `${color}33` }}>
        <Icon size={24} style={{ color: color }} />
      </div>
      {trend !== undefined && (
          <div className="flex flex-col items-end">
            <span className={`text-xs font-bold flex items-center gap-1 ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
            {trendUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {trend}%
            </span>
            <span className="text-xs text-gray-400">vs last month</span>
        </div>
      )}
    </div>
    <div>
      <h3 className="text-gray-500 text-sm font-medium">{label}</h3>
      <h2 className="text-2xl font-bold text-sage-800 mt-1">{value}</h2>
    </div>
    {data && (
        <div className="h-10 w-full mt-3">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.map((val, i) => ({ val, i }))}>
            <Line
                type="monotone"
                dataKey="val"
                stroke={color}
                strokeWidth={2}
                dot={false}
            />
            </LineChart>
        </ResponsiveContainer>
        </div>
    )}
  </div>
);

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => (
  <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6 flex-1 min-h-[400px]">
    <div className="flex justify-between items-start mb-6">
       <div>
          <h3 className="font-bold text-sage-700 border-l-4 border-sage-400 pl-3 text-lg">Financial Analytics</h3>
          <p className="text-xs text-gray-400 mt-1 pl-4">Income vs Expenses (Weekly)</p>
       </div>
    </div>
    <div className="h-[320px] w-full">
       <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
             <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#778873" stopOpacity={0.1}/>
                   <stop offset="95%" stopColor="#778873" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                   <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
             </defs>
             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} dy={10} interval="preserveStartEnd" />
             <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
             <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                formatter={(value: number) => [`₱${value.toLocaleString()}`, '']}
             />
             <Area type="monotone" dataKey="income" name="Income" stroke="#778873" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
             <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorExpense)" />
             <Brush 
                dataKey="name" 
                height={25} 
                stroke="#778873" 
                fill="#F1F3E0"
                tickFormatter={() => ''} 
             />
          </AreaChart>
       </ResponsiveContainer>
    </div>
    <div className="flex justify-center gap-6 mt-4">
       <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-full bg-[#778873]"></span> Income
       </div>
       <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-full bg-red-500"></span> Expenses
       </div>
    </div>
  </div>
);

export const LandDistributionChart: React.FC<PieChartProps> = ({ data, totalValue, title }) => (
  <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-5">
    <div className="flex justify-between items-center mb-2">
       <h3 className="font-bold text-sage-700 border-l-4 border-sage-400 pl-3">{title}</h3>
       <MoreVertical size={16} className="text-gray-400 cursor-pointer"/>
    </div>
    <div className="h-56 relative">
       <ResponsiveContainer width="100%" height="100%">
          <PieChart>
             <Pie
                data={data}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
             >
                {data.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
             </Pie>
             <Tooltip formatter={(val: number) => val.toLocaleString()} />
          </PieChart>
       </ResponsiveContainer>
       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-gray-400 text-xs">Total</span>
          <span className="text-2xl font-bold text-sage-800">{totalValue}</span>
       </div>
    </div>
    <div className="flex flex-wrap justify-center gap-4 text-center mt-2">
       {data.map(source => (
          <div key={source.name} className="flex flex-col items-center">
             <div className="flex items-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full" style={{backgroundColor: source.color}}></span>
                <span className="text-[10px] text-gray-400 uppercase truncate max-w-[80px]">{source.name}</span>
             </div>
             <span className="text-xs font-bold text-sage-700">{source.value}</span>
          </div>
       ))}
    </div>
  </div>
);

export const DebtStatusCard: React.FC<DebtStatusProps> = ({ paidCount, unpaidCount, totalUnpaid }) => (
  <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-5">
     <div className="flex justify-between items-center mb-6">
       <h3 className="font-bold text-sage-700 border-l-4 border-sage-400 pl-3">Debt Overview</h3>
    </div>
    <div className="flex items-end gap-2 mb-2">
       <h2 className="text-2xl font-bold text-sage-800">₱{totalUnpaid.toLocaleString()}</h2>
       <span className="text-xs text-red-500 font-medium mb-1">Outstanding</span>
    </div>
    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden flex mb-6">
       <div className="bg-red-400" style={{ width: `${(unpaidCount / (paidCount + unpaidCount || 1)) * 100}%` }}></div>
       <div className="bg-green-400" style={{ width: `${(paidCount / (paidCount + unpaidCount || 1)) * 100}%` }}></div>
    </div>
    <div className="space-y-3">
       <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-gray-600"><CheckCircle size={14} className="text-green-500"/> Fully Paid Loans</div>
          <span className="font-medium text-gray-400">{paidCount}</span>
       </div>
       <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-gray-600"><AlertCircle size={14} className="text-red-400"/> Outstanding Loans</div>
          <span className="font-medium text-gray-400">{unpaidCount}</span>
       </div>
    </div>
  </div>
);

export const RecentActivities: React.FC = () => (
    <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-5 flex-1">
      <div className="flex justify-between items-center mb-6">
         <h3 className="font-bold text-sage-700 border-l-4 border-sage-400 pl-3">System Activity</h3>
      </div>
      <div className="relative pl-4 border-l border-dashed border-gray-300 space-y-6">
         <div className="relative">
            <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm bg-green-400"></span>
            <div>
               <p className="text-xs text-gray-800 font-medium leading-snug">System Operational</p>
               <p className="text-[10px] text-gray-400 mt-1">Dashboard updated with latest data.</p>
            </div>
         </div>
      </div>
    </div>
  );

export const RecentTravelsTable: React.FC<RecentTravelsTableProps> = ({ travels, getLandName, getPlateName, getDriverName }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = travels.filter(row => 
    row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getLandName(row.land).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-sage-100">
       {/* Header Controls */}
       <div className="p-4 border-b border-sage-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-sage-700 border-l-4 border-sage-400 pl-3">Recent Travel Records</h3>
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-sage-600">
                  <span>Show</span>
                  <select 
                      value={entriesPerPage}
                      onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="bg-sage-50 border border-sage-200 rounded px-2 py-1 focus:outline-none focus:border-sage-400 text-sage-700 text-xs"
                  >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                  </select>
              </div>
              <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400 font-medium text-xs">Search:</span>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="pl-16 pr-4 py-1.5 border border-sage-200 rounded-lg text-sm focus:outline-none focus:border-sage-400 w-full sm:w-48" 
                  />
              </div>
          </div>
       </div>
       
       <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="bg-sage-50 border-b border-sage-200 text-xs font-bold text-sage-600 uppercase tracking-wider">
                   <th className="px-6 py-4">Date</th>
                   <th className="px-6 py-4">Travel Name</th>
                   <th className="px-6 py-4">Land / Route</th>
                   <th className="px-6 py-4">Driver</th>
                   <th className="px-6 py-4 text-right">Tons</th>
                   <th className="px-6 py-4 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-sage-100">
                {currentItems.length > 0 ? currentItems.map((row) => (
                   <tr key={row.id} className="hover:bg-sage-50 transition-colors">
                      <td className="px-6 py-4 text-gray-600 text-sm">{row.date || 'N/A'}</td>
                      <td className="px-6 py-4">
                         <div className="font-medium text-sage-800 text-sm">{row.name}</div>
                         {row.ticket && <div className="text-xs text-blue-50 bg-blue-50 inline-block px-1 rounded">{row.ticket}</div>}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                         {getLandName(row.land)}
                         <div className="text-xs text-gray-400">{getPlateName(row.plateNumber)}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{getDriverName(row.driver)}</td>
                      <td className="px-6 py-4 text-right font-mono text-sage-700">{row.tons}</td>
                      <td className="px-6 py-4 text-right">
                         <button className="p-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100"><FileText size={14}/></button>
                      </td>
                   </tr>
                )) : (
                    <tr><td colSpan={6} className="p-8 text-center text-gray-400">No records found.</td></tr>
                )}
             </tbody>
          </table>
       </div>
       
       {/* Footer Pagination */}
       <div className="p-4 border-t border-sage-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-sage-500">
          <div>Showing {filteredData.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries</div>
          <div className="flex gap-1">
             <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="px-3 py-1 border border-sage-200 rounded hover:bg-sage-50 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
             >
                Previous
             </button>
             
             {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page} 
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border rounded text-xs ${currentPage === page ? 'bg-sage-600 text-white border-sage-600' : 'border-sage-200 hover:bg-sage-50'}`}
                >
                   {page}
                </button>
             ))}

             <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 border border-sage-200 rounded hover:bg-sage-50 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
             >
                Next
             </button>
          </div>
       </div>
    </div>
  );
};