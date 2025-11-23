
import { Travel, Group, Employee, Debt, Land, Driver, OtherExpense, Destination } from '../types';

/**
 * AnalyticsEngine
 * OOP Class responsible for all heavy lifting computations.
 * Keeps React components clean of business logic.
 */
export class AnalyticsEngine {
  
  static calculateTravelFinancials(travel: Travel, groups: Group[]) {
    // Income
    const sugarIncome = (travel.sugarcane_price || 0) * (travel.bags || 0);
    const molassesIncome = (travel.molasses_price || 0) * (travel.molasses || 0);
    const totalIncome = sugarIncome + molassesIncome;

    // Expenses
    const group = groups.find(g => g.id === travel.groupId);
    const wageRate = group?.wage || 0;
    const wageExpense = (travel.tons || 0) * wageRate;
    const otherExpenses = travel.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const totalExpenses = wageExpense + (travel.driverTip || 0) + otherExpenses;

    return {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      wageRate
    };
  }

  static getGlobalStats(
    travels: Travel[], 
    groups: Group[], 
    employees: Employee[], 
    debts: Debt[]
  ) {
    let totalRevenue = 0;
    let totalTons = 0;

    travels.forEach(t => {
      const { totalIncome } = this.calculateTravelFinancials(t, groups);
      totalRevenue += totalIncome;
      totalTons += (t.tons || 0);
    });

    const unpaidDebts = debts.filter(d => !d.paid).reduce((sum, d) => sum + d.amount, 0);

    return {
      totalRevenue,
      totalTons,
      totalEmployees: employees.length,
      activeGroups: groups.length,
      unpaidDebts
    };
  }

  static getDailyRevenueData(travels: Travel[], groups: Group[]) {
    const dailyMap: Record<string, { income: number, expense: number, dateVal: number }> = {};

    travels.forEach(t => {
      let dateVal = 0;
      
      // 1. Try parsing the Name as user names travels by date (e.g. "November 17, 2025")
      const nameTime = new Date(t.name).getTime();
      if (!isNaN(nameTime)) {
          dateVal = nameTime;
      } else if (t.date) {
          // 2. Fallback to explicit date field
          dateVal = new Date(t.date).getTime();
      } else {
          return; // Skip if no valid date
      }
      
      // Use YYYY-MM-DD as key to aggregate same-day travels
      const dateKey = new Date(dateVal).toISOString().split('T')[0];

      if (!dailyMap[dateKey]) {
          dailyMap[dateKey] = { income: 0, expense: 0, dateVal };
      }

      const { totalIncome, totalExpenses } = this.calculateTravelFinancials(t, groups);
      
      dailyMap[dateKey].income += totalIncome;
      dailyMap[dateKey].expense += totalExpenses;
    });

    // Convert map to array and sort by date ascending
    return Object.values(dailyMap)
      .sort((a, b) => a.dateVal - b.dateVal)
      .map(item => ({
        // Format: "Oct 12, 2023"
        name: new Date(item.dateVal).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        income: item.income,
        expense: item.expense,
        profit: item.income - item.expense
      }));
  }

  static getDailyTonnageData(travels: Travel[]) {
    const dailyMap: Record<string, { tons: number, dateVal: number }> = {};

    travels.forEach(t => {
      let dateVal = 0;
      const nameTime = new Date(t.name).getTime();
      if (!isNaN(nameTime)) {
          dateVal = nameTime;
      } else if (t.date) {
          dateVal = new Date(t.date).getTime();
      } else {
          return;
      }
      
      const dateKey = new Date(dateVal).toISOString().split('T')[0];
      if (!dailyMap[dateKey]) {
          dailyMap[dateKey] = { tons: 0, dateVal };
      }
      dailyMap[dateKey].tons += (t.tons || 0);
    });

    return Object.values(dailyMap)
      .sort((a, b) => a.dateVal - b.dateVal)
      .map(item => ({
        name: new Date(item.dateVal).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tons: item.tons
      }));
  }

  static getLandDistribution(travels: Travel[], lands: Land[]) {
    const counts: Record<string, number> = {};
    travels.forEach(t => {
      const landName = lands.find(l => l.id === t.land)?.name || 'Unknown';
      counts[landName] = (counts[landName] || 0) + 1;
    });

    const colors = ['#778873', '#A1BC98', '#D2DCB6', '#E5ECD0', '#F87171'];
    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    }));
  }

  static getDestinationDistribution(travels: Travel[], destinations: Destination[]) {
    const counts: Record<string, number> = {};
    travels.forEach(t => {
      const destName = destinations.find(d => d.id === t.destination)?.name || 'Unknown';
      counts[destName] = (counts[destName] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => {
       const dest = destinations.find(d => d.name === name);
       return {
          name,
          value,
          color: dest?.color || '#778873'
       };
    }).sort((a, b) => b.value - a.value);
  }

  static getEmployeeEarningsReport(
    employees: Employee[], 
    travels: Travel[], 
    groups: Group[], 
    debts: Debt[], 
    drivers: Driver[]
  ) {
    return employees.map(emp => {
      let daysWorked = 0;
      let totalWage = 0;

      travels.forEach(travel => {
        // Check Staff Attendance
        if (emp.type === 'Staff') {
           const attendance = travel.attendance?.find(a => a.employeeId === emp.id);
           if (attendance?.present) {
              // Recalculate shared wage pot
              const group = groups.find(g => g.id === travel.groupId);
              if (group) {
                const pot = (travel.tons || 0) * group.wage;
                const staffCount = travel.attendance.filter(a => {
                    const member = employees.find(e => e.id === a.employeeId);
                    return a.present && member?.type === 'Staff';
                }).length;
                
                if (staffCount > 0) {
                   daysWorked++;
                   totalWage += (pot / staffCount);
                }
              }
           }
        } 
        // Check Driver Trips
        else if (emp.type === 'Driver' && travel.driver === emp.id) {
           daysWorked++;
           const driverConf = drivers.find(d => d.employeeId === emp.id);
           const base = driverConf?.wage || 0;
           totalWage += (base - (travel.driverTip || 0));
        }
      });

      const unpaidDebt = debts
        .filter(d => d.employeeId === emp.id && !d.paid)
        .reduce((sum, d) => sum + d.amount, 0);

      return {
        ...emp,
        daysWorked,
        totalWage,
        unpaidDebt
      };
    }).filter(e => e.daysWorked > 0 || e.unpaidDebt > 0);
  }

  static getExpenseBreakdown(travels: Travel[], groups: Group[], otherExpenses: OtherExpense[]) {
    let wages = 0;
    let tips = 0;
    let travelOps = 0;
    let generalOps = otherExpenses.reduce((sum, e) => sum + e.amount, 0);

    travels.forEach(t => {
       const g = groups.find(grp => grp.id === t.groupId);
       wages += (t.tons || 0) * (g?.wage || 0);
       tips += (t.driverTip || 0);
       travelOps += t.expenses?.reduce((s,e) => s + e.amount, 0) || 0;
    });

    const totalOps = travelOps + generalOps;

    // Filter out zero values
    return [
      { name: 'Wages', value: wages, color: '#778873' },
      { name: 'Tips', value: tips, color: '#A1BC98' },
      { name: 'Operations', value: totalOps, color: '#D2DCB6' }
    ].filter(i => i.value > 0);
  }

  static getGroupPerformance(travels: Travel[], groups: Group[]) {
     const stats: Record<string, number> = {};
     
     // Initialize
     groups.forEach(g => stats[g.name] = 0);
     
     // Sum Tons
     travels.forEach(t => {
        const g = groups.find(grp => grp.id === t.groupId);
        if(g) {
            stats[g.name] += (t.tons || 0);
        }
     });

     return Object.entries(stats)
        .map(([name, value]) => ({ name, value }))
        .sort((a,b) => b.value - a.value)
        .slice(0, 5); // Top 5 Groups
  }
}
