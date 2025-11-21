import { Deal, StatData, RevenueData, TableRow, Employee, Group, Travel, Driver, Land, Plate, Destination, Debt, Loan } from '../types';
import { Users, DollarSign, Briefcase, Percent } from 'lucide-react';

// --- Existing UI Mock Data ---

export const topDeals: Deal[] = [
  { id: '1', name: 'Michael Jordan', email: 'michael.j@example.com', amount: 2893, avatar: 'https://picsum.photos/32/32?random=1' },
  { id: '2', name: 'Emigo Kiaren', email: 'emigo.k@gmail.com', amount: 4289, avatar: 'https://picsum.photos/32/32?random=2' },
  { id: '3', name: 'Randy Origoan', email: 'randy.o@gmail.com', amount: 6347, avatar: 'https://picsum.photos/32/32?random=3' },
  { id: '4', name: 'George Pieterson', email: 'george.p@gmail.com', amount: 3894, avatar: 'https://picsum.photos/32/32?random=4' },
  { id: '5', name: 'Kiara Advain', email: 'kiara.a@gmail.com', amount: 2679, avatar: 'https://picsum.photos/32/32?random=5' },
];

export const statsData: StatData[] = [
  { label: 'Total Customers', value: '1,02,890', trend: 40, trendUp: true, data: [30, 40, 35, 50, 49, 60, 70, 91, 125], color: '#778873', icon: Users },
  { label: 'Total Revenue', value: '$56,562', trend: 25, trendUp: true, data: [10, 25, 15, 30, 12, 40, 20, 50], color: '#A1BC98', icon: DollarSign },
  { label: 'Conversion Ratio', value: '12.08%', trend: 12, trendUp: false, data: [50, 40, 30, 35, 20, 10], color: '#D2DCB6', icon: Percent },
  { label: 'Total Deals', value: '2,543', trend: 19, trendUp: true, data: [20, 30, 25, 40, 30, 50, 60], color: '#778873', icon: Briefcase },
];

export const revenueData: RevenueData[] = [
  { name: 'Jan', sales: 4000, revenue: 2400, profit: 2400 },
  { name: 'Feb', sales: 3000, revenue: 1398, profit: 2210 },
  { name: 'Mar', sales: 2000, revenue: 9800, profit: 2290 },
  { name: 'Apr', sales: 2780, revenue: 3908, profit: 2000 },
  { name: 'May', sales: 1890, revenue: 4800, profit: 2181 },
  { name: 'Jun', sales: 2390, revenue: 3800, profit: 2500 },
  { name: 'Jul', sales: 3490, revenue: 4300, profit: 2100 },
  { name: 'Aug', sales: 4000, revenue: 2400, profit: 2400 },
  { name: 'Sep', sales: 3000, revenue: 1398, profit: 2210 },
  { name: 'Oct', sales: 2000, revenue: 9800, profit: 2290 },
  { name: 'Nov', sales: 2780, revenue: 3908, profit: 2000 },
  { name: 'Dec', sales: 1890, revenue: 4800, profit: 2181 },
];

export const sourceData = [
  { name: 'Mobile', value: 1624, color: '#778873' },
  { name: 'Desktop', value: 1267, color: '#A1BC98' },
  { name: 'Laptop', value: 1153, color: '#D2DCB6' },
  { name: 'Tablet', value: 679, color: '#E5ECD0' }, 
];

export const profitData = [
  { day: 'S', profit: 40 },
  { day: 'M', profit: 30 },
  { day: 'T', profit: 55 },
  { day: 'W', profit: 85 },
  { day: 'T', profit: 55 },
  { day: 'F', profit: 50 },
  { day: 'S', profit: 65 },
];

export const dealsTableData: TableRow[] = [
  { id: 1, salesRep: { name: 'Mayor Kelly', img: 'https://picsum.photos/32/32?random=10' }, category: 'Manufacture', mail: 'mayorkelly@gmail.com', location: 'Germany', date: 'Sep 15 - Oct 12, 2023', status: 'Paid' },
  { id: 2, salesRep: { name: 'Andrew Garfield', img: 'https://picsum.photos/32/32?random=11' }, category: 'Development', mail: 'andrewgarfield@gmail.com', location: 'Canada', date: 'Apr 10 - Dec 12, 2023', status: 'Pending' },
  { id: 3, salesRep: { name: 'Simon Cowell', img: 'https://picsum.photos/32/32?random=12' }, category: 'Service', mail: 'simoncowell@gmail.com', location: 'UK', date: 'Jun 15 - Aug 12, 2023', status: 'Due' },
  { id: 4, salesRep: { name: 'Mirinda Hers', img: 'https://picsum.photos/32/32?random=13' }, category: 'Marketing', mail: 'mirindahers@gmail.com', location: 'USA', date: 'Jan 15 - Mar 12, 2023', status: 'Paid' },
];

// --- New Domain Mock Data ---

export const employees: Employee[] = [
  { id: 'emp-1', name: 'John Doe', type: 'Driver' },
  { id: 'emp-2', name: 'Jane Smith', type: 'Helper' },
  { id: 'emp-3', name: 'Bob Johnson', type: 'Helper' },
  { id: 'emp-4', name: 'Alice Brown', type: 'Staff' },
  { id: 'emp-5', name: 'Charlie Wilson', type: 'Driver' },
];

export const groups: Group[] = [
  { id: 'grp-1', name: 'Alpha Team', wage: 450, employees: ['emp-2', 'emp-3'], created_at: '2023-01-15' },
  { id: 'grp-2', name: 'Beta Team', wage: 500, employees: ['emp-2'], created_at: '2023-02-20' },
];

export const drivers: Driver[] = [
  { id: 'drv-1', employeeId: 'emp-1', wage: 1200 },
  { id: 'drv-2', employeeId: 'emp-5', wage: 1300 },
];

export const lands: Land[] = [
  { id: 'lnd-1', name: 'North Field' },
  { id: 'lnd-2', name: 'River Side' },
  { id: 'lnd-3', name: 'Mountain View' },
];

export const plates: Plate[] = [
  { id: 'plt-1', name: 'ABC-123' },
  { id: 'plt-2', name: 'XYZ-789' },
];

export const destinations: Destination[] = [
  { id: 'dst-1', name: 'Central Mill', color: '#A1BC98' },
  { id: 'dst-2', name: 'Export Hub', color: '#778873' },
];

export const travels: Travel[] = [
  {
    id: 'trv-1',
    name: 'Morning Haul',
    land: 'lnd-1',
    driver: 'emp-1',
    driverTip: 50,
    plateNumber: 'plt-1',
    destination: 'dst-1',
    ticket: 'T-1001',
    tons: 25.5,
    bags: 0,
    groupId: 'grp-1',
    attendance: [
      { employeeId: 'emp-2', present: true },
      { employeeId: 'emp-3', present: true },
    ],
    expenses: [
      { id: 'exp-1', name: 'Fuel', amount: 3500 },
      { id: 'exp-2', name: 'Toll', amount: 150 },
    ]
  },
  {
    id: 'trv-2',
    name: 'Afternoon Delivery',
    land: 'lnd-2',
    driver: 'emp-5',
    driverTip: 0,
    plateNumber: 'plt-2',
    destination: 'dst-2',
    ticket: 'T-1002',
    tons: 18.2,
    bags: 0,
    groupId: 'grp-2',
    attendance: [
      { employeeId: 'emp-2', present: true },
    ],
    expenses: [
      { id: 'exp-3', name: 'Fuel', amount: 2800 },
    ]
  }
];

export const debts: Debt[] = [
  { id: 'dbt-1', employeeId: 'emp-2', amount: 500, description: 'Cash Advance', paid: false, date: '2023-10-01' },
  { id: 'dbt-2', employeeId: 'emp-3', amount: 200, description: 'Uniform', paid: true, date: '2023-09-15' },
];

export const loans: Loan[] = [
  {
    id: 'ln-1',
    description: 'Personal Loan',
    loanDate: '2023-08-01',
    dueDate: '2023-12-01',
    totalAmount: 5000,
    remainingBalance: 2000,
    totalPaidCurrent: 3000,
    totalPaidLifetime: 3000,
    paid: false,
    createdAt: '2023-08-01',
    updatedAt: '2023-10-01',
    payments: [
      { id: 'pmt-1', loanId: 'ln-1', amount: 1000, paymentDate: '2023-09-01', createdAt: '2023-09-01', updatedAt: '2023-09-01' },
      { id: 'pmt-2', loanId: 'ln-1', amount: 2000, paymentDate: '2023-10-01', createdAt: '2023-10-01', updatedAt: '2023-10-01' }
    ]
  }
];
