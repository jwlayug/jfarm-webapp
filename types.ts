import React from 'react';

// --- UI Types (Existing) ---

export interface NavItem {
  label: string;
  icon: React.ComponentType<any>;
  active?: boolean;
}

export interface Deal {
  id: string;
  name: string;
  email: string;
  amount: number;
  avatar: string;
}

export interface StatData {
  label: string;
  value: string;
  trend: number; // percentage
  trendUp: boolean;
  data: number[]; // for sparkline
  color: string;
  icon: any;
}

export interface RevenueData {
  name: string;
  sales: number;
  revenue: number;
  profit: number;
}

export interface TableRow {
  id: number;
  salesRep: { name: string; img: string };
  category: string;
  mail: string;
  location: string;
  date: string;
  status: 'Paid' | 'Pending' | 'Due';
}

// --- Domain Types (New Database Schema) ---

export interface Employee {
  id: string;
  name: string;
  type: string; // e.g., 'Driver', 'Helper', 'Staff'
}

export interface Group {
  id: string;
  name: string;
  wage: number;
  employees: string[]; // Employee IDs
  created_at: string;
}

export interface Travel {
  id: string;
  name: string;
  date?: string; // ISO Date YYYY-MM-DD
  land: string;
  driver: string; // Employee ID
  driverTip: number;
  plateNumber: string;
  destination: string;
  ticket?: string;
  tons: number;
  bags?: number;
  sugarcane_price?: number;
  molasses?: number;
  molasses_price?: number;
  groupId: string;
  pstc?: string;
  attendance: {
    employeeId: string;
    present: boolean;
  }[];
  expenses?: {
    id?: string;
    name: string;
    amount: number;
  }[];
}

export interface Driver {
  id: string;
  employeeId: string;
  wage?: number;
}

export interface OtherExpense {
  id: string;
  name: string;
  description: string;
  amount: number;
  date: string;
}

export interface Debt {
  id: string;
  employeeId: string;
  amount: number;
  description: string;
  paid: boolean;
  date: string;
}

export interface Land {
  id: string;
  name: string;
}

export interface Plate {
  id: string;
  name: string;
}

export interface Destination {
  id: string;
  name: string;
  color: string;
}

export interface PaymentCycle {
  cycleId: string;
  payments: LoanPayment[];
  totalPaidThisCycle: number;
  cycleStart: string;
  cycleEnd?: string;
}

export interface Loan {
  id: string;
  description: string;
  loanDate: string;
  dueDate: string;
  totalAmount: number;
  remainingBalance: number;
  totalPaidCurrent: number;
  totalPaidLifetime: number;
  paid: boolean;
  payments?: LoanPayment[];
  renewals?: LoanRenewal[];
  paymentHistory?: PaymentCycle[];
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
  usages?: LoanUsage[];
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: string;
  otherExpenseId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanRenewal {
  id: string;
  loanId: string;
  previousDueDate: string;
  newDueDate: string;
  renewedAt: string;
  previousRemainingBalance?: number;
  newRemainingBalance?: number;
  termLengthMonths?: number;
}

export interface LoanUsage {
  id: string;
  loanId: string;
  description: string;
  amount: number;
  usageDate: string;
  createdAt: string;
  updatedAt: string;
  otherExpenseId?: string;
}

export interface SugarcaneEntry {
  price: number;
  bags: number;
}

export interface MolassesEntry {
  price: number;
  kilos: number;
}

export interface CalculatorComputation {
  id: string;
  receiptTitle: string;
  name: string;
  sugarcaneEntries: SugarcaneEntry[];
  molassesEntries: MolassesEntry[];
  sugarcaneTotal: number;
  molassesTotal: number;
  grandTotal: number;
  createdAt: string;
}