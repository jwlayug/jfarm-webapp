# JFarm - Sugarcane Farm Management System

![JFarm Dashboard](https://via.placeholder.com/1200x600?text=JFarm+Dashboard+Preview)

## 🌾 Overview

**JFarm** is a specialized, high-performance web application designed to digitize and streamline the complex operations of sugarcane farming. Built with modern web technologies, it serves as a central command center for managing logistics, workforce finances, crop production, and operational costs.

It features a **Multi-Farm Architecture**, allowing users to manage distinct agricultural entities (tenants/farms) within a single interface, with complete data isolation.

## 🛠 Tech Stack

*   **Core:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS (Sage Green Theme)
*   **State Management:** React Context API
*   **Database & Auth:** Firebase (Firestore & Authentication)
*   **Desktop Wrapper:** Electron
*   **AI Intelligence:** Google Gemini API (Flash 2.5) / Firebase Vertex AI
*   **Visualization:** Recharts
*   **Reporting:** html2canvas (Image generation), date-fns

## 🚀 Key Features

### 📊 Dashboard & Analytics
*   **Real-time Overview:** Live tracking of Total Tonnage, Revenue, and Active Debts.
*   **Visual Analytics:**
    *   Daily Tonnage Production (Area Chart).
    *   Revenue vs. Expense trends.
    *   Employee Earnings Performance (Sorted Alphabetically).
*   **AI Assistant:** Context-aware chatbot that answers questions like *"Who is the most productive driver?"* or *"Summarize last week's expenses"*.

### 🚛 Logistics & Operations
*   **Travel Tracking:** Detailed logging of every truck trip including Ticket #, Land Source, Destination, Plate #, and Weight.
*   **Automated Financials:** Auto-calculates Gross Income (Sugarcane + Molasses) and Net Income per trip after deducting wages, driver tips, and tolls.
*   **Workforce Attendance:** Links specific employee groups to trips for automated, pro-rated wage distribution.

### 💰 Financial Management
*   **Smart Wages:** Complex logic handling **Staff** (shared pot based on tons) vs. **Drivers** (base wage per trip + tips).
*   **Debt Tracker:** Manage cash advances with "Mark as Paid" functionality and history.
*   **Loan System:** Robust loan management with tracking for:
    *   Partial payments.
    *   Usage logs (deductions).
    *   **Loan Renewal:** Ability to rollover loans with balance resets.
*   **Calculator Tool:** A standalone utility for computing miller receipts with downloadable, signature-ready PNG exports.

### 👥 Workforce & Assets
*   **Employee Management:** Categorize workers (Driver, Staff, Helper).
*   **Group System:** Manage labor gangs with specific wage rates per ton.
*   **Asset Registry:** Database for Lands, Truck Plates, and Mill Destinations (with color coding).

### ⚙️ Data Management
*   **Backup & Restore:** Export full farm data to JSON or Backup directly to Google Drive.
*   **Dark Mode:** UI support for low-light environments.

## 💻 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   Firebase Project (Firestore & Auth enabled)
*   Google Cloud Project (for Gemini API)

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/jfarm.git
cd jfarm
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... other firebase config
API_KEY=your_google_gemini_api_key
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## 🖥️ Desktop Application (Electron)

JFarm includes an Electron wrapper to run as a native desktop application.

```bash
# Run in Electron Development Mode
npm run electron:dev

# Build Desktop App
npm run electron:build
```

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

## 📄 License

Private / Proprietary software for JFarm Operations.
