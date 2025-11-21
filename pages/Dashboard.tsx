import React from 'react';
import * as Mock from '../services/mockData';
import {
  WelcomeSection,
  TargetCard,
  TopDeals,
  ProfitChart,
  StatCard,
  RevenueChart,
  LeadsSource,
  DealsStatus,
  RecentActivity,
  DealsTable
} from '../features/dashboard/DashboardWidgets';

const Dashboard: React.FC = () => {
  return (
    <>
      <WelcomeSection />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT COLUMN (3 spans) */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          <TargetCard />
          <TopDeals />
          <ProfitChart />
        </div>

        {/* MIDDLE COLUMN (6 spans) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Mock.statsData.map((stat, idx) => <StatCard key={idx} data={stat} />)}
          </div>
          <RevenueChart />
        </div>

        {/* RIGHT COLUMN (3 spans) */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          <LeadsSource />
          <DealsStatus />
          <RecentActivity />
        </div>

        {/* BOTTOM ROW (Full Width) - Deals Statistics Table */}
        <div className="xl:col-span-12">
          <DealsTable />
        </div>
      </div>
    </>
  );
};

export default Dashboard;