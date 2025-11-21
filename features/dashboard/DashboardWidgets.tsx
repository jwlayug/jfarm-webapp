import React from 'react';
import { ArrowUp, ArrowDown, MoreVertical, ExternalLink, Filter, Download, FileText } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line
} from 'recharts';
import * as Mock from '../../services/mockData';

export const WelcomeSection: React.FC = () => (
  <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
     <div>
        <h1 className="text-2xl font-bold text-sage-800">Welcome back, Json Taylor!</h1>
        <p className="text-sage-500 text-sm mt-1">Track your sales activity, leads and deals here.</p>
     </div>
     <div className="flex gap-3">
        <button className="flex items-center gap-2 bg-sage-400 hover:bg-sage-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
           <Filter size={16} /> Filters
        </button>
        <button className="flex items-center gap-2 bg-white hover:bg-gray-50 text-sage-600 border border-sage-200 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
           <Download size={16} /> Export
        </button>
     </div>
  </div>
);

export const TargetCard: React.FC = () => (
  <div className="bg-gradient-to-br from-sage-400 to-sage-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
    <div className="relative z-10">
       <h3 className="font-semibold text-lg mb-2">Your target is incomplete</h3>
       <p className="text-sage-100 text-sm mb-6 leading-relaxed">You have completed <span className="text-yellow-300 font-bold">48%</span> of the given target, you can also check your status.</p>
       <button className="text-sm underline font-medium hover:text-sage-100">Click here</button>
    </div>
    <div className="absolute right-4 bottom-8">
       <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center font-bold text-sm">48%</div>
    </div>
  </div>
);

export const TopDeals: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-5 flex-1">
    <div className="flex justify-between items-center mb-4">
       <h3 className="font-bold text-sage-700 border-l-4 border-sage-400 pl-3">Top Deals</h3>
       <MoreVertical size={16} className="text-gray-400 cursor-pointer"/>
    </div>
    <div className="flex flex-col gap-4">
       {Mock.topDeals.map(deal => (
          <div key={deal.id} className="flex items-center gap-3">
             <img src={deal.avatar} alt={deal.name} className="w-10 h-10 rounded-full object-cover" />
             <div className="flex-1">
                <div className="text-sm font-semibold text-sage-800">{deal.name}</div>
                <div className="text-xs text-gray-400">{deal.email}</div>
             </div>
             <div className="font-bold text-sage-600 text-sm">${deal.amount}</div>
          </div>
       ))}
    </div>
  </div>
);

export const ProfitChart: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-5">
    <div className="flex justify-between items-center mb-4">
       <h3 className="font-bold text-sage-700 border-l-4 border-sage-400 pl-3">Profit Earned</h3>
       <button className="text-xs text-gray-400 hover:text-sage-500 flex items-center">View All <ExternalLink size={10} className="ml-1"/></button>
    </div>
    <div className="h-40">
       <ResponsiveContainer width="100%" height="100%">
          <BarChart data={Mock.profitData}>
             <Bar dataKey="profit" fill="#A1BC98" radius={[4, 4, 0, 0]} barSize={8} />
             <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} />
          </BarChart>
       </ResponsiveContainer>
    </div>
  </div>
);

export const StatCard: React.FC<{ data: typeof Mock.statsData[0] }> = ({ data }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-sage-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-full bg-opacity-20`} style={{ backgroundColor: `${data.color}33` }}>
        <data.icon size={24} style={{ color: data.color }} />
      </div>
      <div className="flex flex-col items-end">
        <span className={`text-xs font-bold flex items-center gap-1 ${data.trendUp ? 'text-green-500' : 'text-red-500'}`}>
          {data.trendUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {data.trend}%
        </span>
        <span className="text-xs text-gray-400">this month</span>
      </div>
    </div>
    <div>
      <h3 className="text-gray-500 text-sm font-medium">{data.label}</h3>
      <h2 className="text-2xl font-bold text-sage-800 mt-1">{data.value}</h2>
    </div>
    <div className="h-10 w-full mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data.data.map((val, i) => ({ val, i }))}>
          <Line
            type="monotone"
            dataKey="val"
            stroke={data.color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const RevenueChart: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6 flex-1 min-h-[400px]">
    <div className="flex justify-between items-start mb-6">
       <div>
          <h3 className="font-bold text-sage-700 border-l-4 border-sage-400 pl-3 text-lg">Revenue Analytics</h3>
          <p className="text-xs text-gray-400 mt-1 pl-4">Revenue Analytics with sales & profit (USD)</p>
       </div>
       <div className="flex items-center gap-2">
           <button className="text-xs font-medium text-sage-600 bg-sage-50 px-2 py-1 rounded">View All</button>
       </div>
    </div>
    <div className="h-[320px] w-full">
       <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={Mock.revenueData}>
             <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#778873" stopOpacity={0.1}/>
                   <stop offset="95%" stopColor="#778873" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#A1BC98" stopOpacity={0.1}/>
                   <stop offset="95%" stopColor="#A1BC98" stopOpacity={0}/>
                </linearGradient>
             </defs>
             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
             <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
             <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                labelStyle={{ color: '#374151', fontWeight: 'bold' }}
             />
             <Area type="monotone" dataKey="revenue" stroke="#778873" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
             <Area type="monotone" dataKey="sales" stroke="#A1BC98" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorSales)" />
          </AreaChart>
       </ResponsiveContainer>
    </div>
    <div className="flex justify-center gap-6 mt-4">
       <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-full bg-[#A1BC98]"></span> Sales
       </div>
       <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-full bg-[#778873]"></span> Revenue
       </div>
    </div>
  </div>
);

export const LeadsSource: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-5">
    <div className="flex justify-between items-center mb-2">
       <h3 className="font-bold text-sage-700 border-l-4 border-sage-400 pl-3">Leads By Source</h3>
       <MoreVertical size={16} className="text-gray-400 cursor-pointer"/>
    </div>
    <div className="h-56 relative">
       <ResponsiveContainer width="100%" height="100%">
          <PieChart>
             <Pie
                data={Mock.sourceData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
             >
                {Mock.sourceData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
             </Pie>
          </PieChart>
       </ResponsiveContainer>
       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-gray-400 text-xs">Total</span>
          <span className="text-2xl font-bold text-sage-800">4,145</span>
       </div>
    </div>
    <div className="flex justify-between text-center mt-2">
       {Mock.sourceData.map(source => (
          <div key={source.name} className="flex flex-col items-center">
             <div className="flex items-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full" style={{backgroundColor: source.color}}></span>
                <span className="text-[10px] text-gray-400 uppercase">{source.name}</span>
             </div>
             <span className="text-xs font-bold text-sage-700">{source.value}</span>
          </div>
       ))}
    </div>
  </div>
);

export const DealsStatus: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-5">
     <div className="flex justify-between items-center mb-6">
       <h3 className="font-bold text-sage-700 border-l-4 border-sage-400 pl-3">Deals Status</h3>
       <button className="text-xs text-gray-400 hover:text-sage-500">View All</button>
    </div>
    <div className="flex items-end gap-2 mb-2">
       <h2 className="text-2xl font-bold text-sage-800">4,289</h2>
       <span className="bg-green-100 text-green-600 text-xs px-1.5 py-0.5 rounded font-medium mb-1">1.02 <ArrowUp size={10} className="inline"/></span>
       <span className="text-xs text-gray-400 mb-1">compared to last week</span>
    </div>
    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden flex mb-6">
       <div className="bg-sage-400 w-[45%]"></div>
       <div className="bg-sage-200 w-[25%]"></div>
       <div className="bg-sage-600 w-[30%]"></div>
    </div>
    <div className="space-y-3">
       <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-gray-600"><span className="w-2 h-2 rounded-full bg-sage-400"></span> Successful Deals</div>
          <span className="font-medium text-gray-400">987 deals</span>
       </div>
       <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-gray-600"><span className="w-2 h-2 rounded-full bg-sage-200"></span> Pending Deals</div>
          <span className="font-medium text-gray-400">1,073 deals</span>
       </div>
       <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-gray-600"><span className="w-2 h-2 rounded-full bg-sage-600"></span> Rejected Deals</div>
          <span className="font-medium text-gray-400">1,674 deals</span>
       </div>
    </div>
  </div>
);

export const RecentActivity: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-5 flex-1">
    <div className="flex justify-between items-center mb-6">
       <h3 className="font-bold text-sage-700 border-l-4 border-sage-400 pl-3">Recent Activity</h3>
       <button className="text-xs text-gray-400 hover:text-sage-500">View All</button>
    </div>
    <div className="relative pl-4 border-l border-dashed border-gray-300 space-y-6">
       {[1, 2, 3, 4].map((item, idx) => (
          <div key={idx} className="relative">
             <span className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm
                ${idx === 0 ? 'bg-sage-600' : idx === 1 ? 'bg-sage-400' : idx === 2 ? 'bg-green-400' : 'bg-red-400'}
             `}></span>
             <div className="flex justify-between items-start">
                <div>
                   <p className="text-xs text-gray-800 font-medium leading-snug">
                      {idx === 0 && "Update of calendar events & Added new events in next week."}
                      {idx === 1 && "New theme for Spruko Website completed"}
                      {idx === 2 && "Created a New Task today"}
                      {idx === 3 && "New member @andreas gurrero added today"}
                   </p>
                   {idx === 1 && <p className="text-[10px] text-gray-400 mt-1">Lorem ipsum dolor sit amet.</p>}
                </div>
                <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                   {idx === 0 ? "4:45PM" : idx === 1 ? "3 hrs" : idx === 2 ? "22 hrs" : "Today"}
                </span>
             </div>
          </div>
       ))}
    </div>
  </div>
);

export const DealsTable: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6">
     <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="font-bold text-sage-700 border-l-4 border-sage-400 pl-3 text-lg self-start md:self-center">Deals Statistics</h3>
        <div className="flex gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
              <input type="text" placeholder="Search Here" className="w-full pl-3 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sage-400" />
           </div>
           <button className="flex items-center gap-2 bg-sage-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm whitespace-nowrap">
              Sort By <ArrowDown size={14} />
           </button>
        </div>
     </div>
     <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
           <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                 <th className="p-4 font-semibold"><input type="checkbox" className="rounded text-sage-500 focus:ring-0"/></th>
                 <th className="p-4 font-semibold">Sales Rep</th>
                 <th className="p-4 font-semibold">Category</th>
                 <th className="p-4 font-semibold">Mail</th>
                 <th className="p-4 font-semibold">Location</th>
                 <th className="p-4 font-semibold">Date</th>
                 <th className="p-4 font-semibold">Action</th>
              </tr>
           </thead>
           <tbody className="text-sm">
              {Mock.dealsTableData.map((row) => (
                 <tr key={row.id} className="hover:bg-sage-50 transition-colors border-b border-gray-50 last:border-none">
                    <td className="p-4"><input type="checkbox" className="rounded text-sage-500 focus:ring-0"/></td>
                    <td className="p-4">
                       <div className="flex items-center gap-3">
                          <img src={row.salesRep.img} alt="" className="w-8 h-8 rounded-full object-cover" />
                          <span className="font-medium text-sage-800">{row.salesRep.name}</span>
                       </div>
                    </td>
                    <td className="p-4 text-gray-600">{row.category}</td>
                    <td className="p-4 text-gray-600">{row.mail}</td>
                    <td className="p-4">
                       <span className={`px-2 py-1 rounded text-xs font-medium
                          ${row.location === 'Germany' ? 'bg-blue-50 text-blue-600' : 
                            row.location === 'USA' ? 'bg-orange-50 text-orange-600' : 
                            row.location === 'Canada' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'}
                       `}>{row.location}</span>
                    </td>
                    <td className="p-4 text-gray-600">{row.date}</td>
                    <td className="p-4">
                       <div className="flex gap-2">
                          <button className="p-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100"><Download size={14}/></button>
                          <button className="p-1.5 rounded-md bg-purple-50 text-purple-600 hover:bg-purple-100"><FileText size={14}/></button>
                       </div>
                    </td>
                 </tr>
              ))}
           </tbody>
        </table>
     </div>
     {/* Pagination Mock */}
     <div className="flex justify-between items-center mt-4 text-xs text-gray-400">
        <div>Showing 4 of 20 entries</div>
        <div className="flex gap-2">
           <button className="px-2 py-1 border rounded hover:bg-gray-50">Prev</button>
           <button className="px-2 py-1 bg-sage-500 text-white rounded">1</button>
           <button className="px-2 py-1 border rounded hover:bg-gray-50">2</button>
           <button className="px-2 py-1 border rounded hover:bg-gray-50">Next</button>
        </div>
     </div>
  </div>
);