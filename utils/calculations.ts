import { Travel, Group, Employee, Debt, Land, Plate, Destination, Driver } from '../types';

/**
 * Utility helpers for summary calculations
 */

export const getEmployeeNames = (employeeIds: string[], employees: Employee[]) =>
  employeeIds
    .map((id) => employees.find((e) => e.id === id)?.name)
    .filter(Boolean)
    .sort((a, b) => a!.localeCompare(b!, 'en', { sensitivity: 'base' }))
    .join(', ');

export const getGroupTravels = (groupId: string, travels: Travel[]) =>
  travels.filter((t) => t.groupId === groupId);

export const getEmployeePresentCount = (travel: Travel) =>
  (travel.attendance || []).filter((a) => a.present).length;

export const calculateEmployeeWage = (travel: Travel, employeeId: string, groups: Group[]) => {
  const group = groups.find((g) => g.id === travel.groupId);
  if (!group) return 0;
  const attendance = (travel.attendance || []).find((a) => a.employeeId === employeeId);
  if (!attendance || !attendance.present) return 0;
  const presentCount = getEmployeePresentCount(travel);
  if (presentCount === 0) return 0;
  return (group.wage * (travel.tons || 0)) / presentCount;
};

export const getEmployeeTravels = (employeeId: string, groupId: string | null, travels: Travel[]) =>
  travels.filter((travel) => {
    if (groupId && travel.groupId !== groupId) return false;
    const attendance = (travel.attendance || []).find((a) => a.employeeId === employeeId);
    return attendance?.present;
  });

export const getEmployeeTotalWage = (employeeId: string, groupId: string | null, travels: Travel[], groups: Group[]) =>
  getEmployeeTravels(employeeId, groupId, travels).reduce(
    (total, t) => total + calculateEmployeeWage(t, employeeId, groups),
    0
  );

export const getEmployeeDebts = (employeeId: string, debts: Debt[], includePaid = false) => {
  return debts.filter(
    (d) => d.employeeId === employeeId && (includePaid || !d.paid)
  );
};

export const getEmployeeTotalDebts = (employeeId: string, debts: Debt[]) => {
  return debts
    .filter((d) => d.employeeId === employeeId && !d.paid)
    .reduce((sum, d) => sum + (d.amount || 0), 0);
};

export const calculateTravelIncome = (travel: Travel, groups: Group[]) => {
  const group = groups.find(g => g.id === travel.groupId);
  if (!group) return 0;
  return group.wage * travel.tons;
};

export const calculateTravelExpenses = (travel: Travel, groups: Group[]) => {
  return travel.attendance.reduce((sum, att) => {
    if (!att.present) return sum;
    return sum + calculateEmployeeWage(travel, att.employeeId, groups);
  }, 0) + (travel.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0);
};

export const calculateTravelNet = (travel: Travel, groups: Group[]) => {
  return calculateTravelIncome(travel, groups) - calculateTravelExpenses(travel, groups);
};

export const getLandName = (landId: string, lands: Land[]) => {
  return lands.find(l => l.id === landId)?.name || landId;
};

export const getPlateName = (plateId: string, plates: Plate[]) => {
  return plates.find(p => p.id === plateId)?.name || plateId;
};

export const getDestinationName = (destId: string, destinations: Destination[]) => {
  return destinations.find(d => d.id === destId)?.name || destId;
};

export const getDriverName = (driverId: string, employees: Employee[]) => {
  return employees.find(e => e.id === driverId)?.name || driverId;
};

export function getDriverNetWage(driverId: string, travels: Travel[], drivers: Driver[]) {
  const driver = drivers.find((d) => d.employeeId === driverId);
  if (!driver) return 0;

  const wageValue = driver.wage || 0;

  // Get all travels handled by this driver
  const driverTravels = travels.filter((t) => t.driver === driverId);

  const baseWage = wageValue * driverTravels.length;

  const totalTip = driverTravels.reduce(
    (sum, t) => sum + (t.driverTip || 0),
    0
  );

  return baseWage - totalTip;
}
