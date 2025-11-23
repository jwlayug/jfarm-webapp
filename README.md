# JFarm - Sugarcane Farm Management System

## 🌾 Overview
JFarm is a comprehensive, React-based Progressive Web Application (PWA) designed to digitize the operations of sugarcane farming. It manages the entire lifecycle of logistics from land source to mill destination, tracks workforce attendance and wages, handles financial debts/loans, and provides real-time analytics.

## 🛠 Tech Stack
*   **Frontend:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **Database & Auth:** Firebase (Firestore, Auth)
*   **AI:** Google Gemini / Firebase Vertex AI (for natural language data analysis)
*   **Visualization:** Recharts
*   **Utilities:** date-fns, html2canvas (for receipt generation), Lucide React (icons)

## 🚀 Key Features

### 1. Multi-Farm Architecture
*   **Context Switching:** Users can create multiple farm entities and switch between them instantly.
*   **Data Isolation:** All employees, travels, expenses, and debts are scoped to the specific active farm.

### 2. Core Operations
*   **Travel/Logistics Tracking:**
    *   Record trips with details: Date, Ticket #, Land Source, Plate #, Destination, Driver, Tons, Bags.
    *   **Auto-calculation:** Computes Gross Income (Sugarcane + Molasses) vs Expenses (Wages, Tips, Tolls).
    *   **Attendance:** Link specific workers to specific trips for automated wage calculation.
*   **Calculator:**
    *   Standalone tool for computing sugarcane/molasses receipts.
    *   Generates downloadable PNG receipts with authorized signatures.
    *   Maintains a local history of calculations.

### 3. Financial Management
*   **Debts & Advances:** Track employee cash advances and mark them as paid/unpaid.
*   **Loan Management:**
    *   Complex loan tracking with payment history and usage logs.
    *   **Renewal Logic:** Ability to renew loans, resetting balances while tracking historical payments.
*   **Expenses:** Track general farm operational costs unrelated to specific trips.

### 4. Workforce Management
*   **Employees:** Manage Staff and Drivers.
*   **Groups:** Create work gangs/groups with specific wage rates per ton.
*   **Driver Rates:** Configure specific base wages per trip for drivers.

### 5. Analytics & Reporting
*   **Dashboard:**
    *   Real-time cards for Revenue, Tonnage, Active Debt.
    *   Visual charts: Daily Production (Area), Revenue vs Expenses, Employee Performance.
*   **Summaries:**
    *   **Employee Report:** Days worked, total wages earned, absenteeism tracking.
    *   **Group/Land Report:** Profitability analysis per route or land source.
    *   **Printable Reports:** Clean, formatted data ready for printing or PDF export.

### 6. AI Assistant
*   **JFarm AI:** An embedded chatbot context-aware of the current farm's database. Users can ask natural language questions like *"Who is the highest earning driver?"* or *"What is my net profit for last week?"*.

---

## 📱 Android App Generation Prompt

**Copy and paste the following prompt into an AI coding assistant (like Cursor, Windsurf, or ChatGPT) to generate the React Native version of this app.**

```markdown
# ROLE
Act as a Senior Mobile Architect specializing in React Native, Expo, and Firebase.

# CONTEXT
I have a fully functional React Web Dashboard ("JFarm") for sugarcane farm management. I need to port this application to a mobile Android application using **React Native (Expo)**.

# DATA STRUCTURE (TypeScript Interfaces)
Use these exact interfaces for the mobile app to ensure compatibility with the existing Firestore database:

- **Farm:** { id, name, createdAt }
- **Employee:** { id, name, type: 'Driver'|'Staff'|'Helper' }
- **Group:** { id, name, wage, employees: string[], created_at }
- **Travel:** { id, name, date, land, driver, driverTip, plateNumber, destination, ticket, tons, bags, sugarcane_price, molasses, molasses_price, groupId, attendance: {employeeId, present}[], expenses: {name, amount}[] }
- **Debt:** { id, employeeId, amount, description, paid, date }
- **Loan:** { id, description, totalAmount, remainingBalance, payments: LoanPayment[], usages: LoanUsage[], ... }

# ARCHITECTURE REQUIREMENTS

1.  **Framework:** Use **Expo** (Managed Workflow) with TypeScript.
2.  **Routing:** Use **Expo Router** (File-based routing).
3.  **Styling:** Use **NativeWind** (Tailwind CSS for React Native) to reuse my existing design tokens (Sage Green color palette).
4.  **Database:** Use the Firebase JS SDK (compatible with Expo). Reuse the exact same Firestore collection paths (`farms/{farmId}/...`).
5.  **State Management:** Use React Context API (port the existing `FarmContext.tsx`).

# KEY FEATURES TO PORT & MOBILE ADAPTATIONS

1.  **Navigation:**
    - Replace the Sidebar with a **Bottom Tab Navigator** for primary screens (Dashboard, Travels, Employees, Menu).
    - Use a **Drawer** or a **Settings Screen** for Farm Switching and less frequent actions (Lands, Plates, Settings).

2.  **Dashboard (Home Screen):**
    - Convert the "Stat Cards" into a horizontal ScrollView.
    - Replace Recharts with **`react-native-gifted-charts`** or **`victory-native`** for the Revenue and Tonnage charts.
    - Show "Recent Travels" as a Vertical FlatList with swipeable actions (Edit/Delete).

3.  **Forms & Modals:**
    - Convert existing Modals (TravelModal, EmployeeModal) into **Stack Screen Modals** (`presentation: 'modal'`).
    - Use `KeyboardAvoidingView` for all forms.
    - Use `DateTimePicker` for date inputs instead of HTML date pickers.

4.  **Lists & Tables:**
    - **DO NOT use HTML Tables.** Convert all tabular data (Employees list, Travel logs) into **Card Views** rendered via `FlatList`.
    - Implement Pull-to-Refresh functionality.

5.  **Calculators & Receipts:**
    - Port the "Calculator" feature.
    - Instead of `html2canvas`, use **`expo-print`** and **`expo-sharing`** to generate PDF receipts and share them via WhatsApp/Email.

6.  **AI Assistant:**
    - Implement the Chat Interface as a Floating Action Button (FAB) that opens a bottom sheet or a new chat screen.
    - Reuse the logic from `GeminiService.ts` but ensure environment variables are handled via `app.json` / `eas.json`.

# UI/UX THEME
- **Primary Color:** Sage Green (`#778873`)
- **Background:** Light Cream (`#F1F3E0`)
- **Font:** System Sans (Inter equivalent)

# SPECIFIC INSTRUCTION
Start by setting up the `FarmContext` and the Expo Router structure. Then, build the **Dashboard** screen first, ensuring the Firestore connection works. Please provide the code for `app/_layout.tsx`, `context/FarmContext.tsx`, and `app/(tabs)/index.tsx`.
```
