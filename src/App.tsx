/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { Navbar } from './components/Navbar';
import { MobilePOS } from './components/MobilePOS';
import { TablePlan } from './components/TablePlan';
import { KitchenKDS } from './components/KitchenKDS';
import { StockManager } from './components/StockManager';
import { MenuRecipes } from './components/MenuRecipes';
import { BillingTab } from './components/BillingTab';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { ToastContainer } from './components/ToastContainer';

const MainContent: React.FC = () => {
  const { activeTab } = useRestaurant();

  return (
    <main className="min-h-[calc(100vh-110px)] pb-12">
      {activeTab === 'prise_commande' && <MobilePOS />}
      {activeTab === 'plan_salle' && <TablePlan />}
      {activeTab === 'cuisine_kds' && <KitchenKDS />}
      {activeTab === 'stocks' && <StockManager />}
      {activeTab === 'recettes' && <MenuRecipes />}
      {activeTab === 'caisse' && <BillingTab />}
      {activeTab === 'analyses' && <DashboardAnalytics />}
    </main>
  );
};

export default function App() {
  return (
    <RestaurantProvider>
      <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col selection:bg-amber-500 selection:text-white font-sans">
        <Navbar />
        <MainContent />
        <ToastContainer />
      </div>
    </RestaurantProvider>
  );
}
