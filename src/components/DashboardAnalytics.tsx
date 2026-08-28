import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Receipt, 
  CreditCard, 
  Banknote, 
  Ticket, 
  Printer, 
  Award, 
  Package, 
  Calendar, 
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export const DashboardAnalytics: React.FC = () => {
  const { orders, menuItems, ingredients, stockMovements } = useRestaurant();

  const [isZReportOpen, setIsZReportOpen] = useState(false);

  // Paid orders
  const paidOrders = orders.filter((o) => o.status === 'paid');
  const activeOrders = orders.filter((o) => o.status !== 'paid' && o.status !== 'cancelled');

  const totalPaidRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalActiveRevenue = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalPotentialRevenue = totalPaidRevenue + totalActiveRevenue;

  const totalGuests = orders.reduce((sum, o) => sum + (o.guestCount || 0), 0);
  const averageTicketTable = paidOrders.length > 0 ? totalPaidRevenue / paidOrders.length : 0;
  const averageTicketGuest = totalGuests > 0 ? totalPaidRevenue / totalGuests : 0;

  // Breakdown by payment method
  const cbRevenue = paidOrders.filter((o) => o.paymentMethod === 'cb' || !o.paymentMethod).reduce((sum, o) => sum + o.totalAmount, 0);
  const cashRevenue = paidOrders.filter((o) => o.paymentMethod === 'especes').reduce((sum, o) => sum + o.totalAmount, 0);
  const ticketRestoRevenue = paidOrders.filter((o) => o.paymentMethod === 'ticket_resto').reduce((sum, o) => sum + o.totalAmount, 0);

  // Top selling dishes count
  const dishSalesMap = new Map<string, { name: string; quantity: number; revenue: number; category: string }>();

  orders.forEach((ord) => {
    ord.items.forEach((it) => {
      const current = dishSalesMap.get(it.menuItemId) || {
        name: it.menuItemName,
        quantity: 0,
        revenue: 0,
        category: it.course,
      };
      current.quantity += it.quantity;
      current.revenue += it.quantity * it.price;
      dishSalesMap.set(it.menuItemId, current);
    });
  });

  const topDishes = Array.from(dishSalesMap.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 6);

  // Total stock cost value consumed today
  const totalStockDeductionsCost = Math.abs(
    stockMovements
      .filter((m) => m.type === 'order_deduction')
      .reduce((sum, m) => sum + (m.costImpact || 0), 0)
  );

  const globalFoodCostRate = totalPotentialRevenue > 0
    ? Number(((totalStockDeductionsCost / (totalPotentialRevenue * 0.9)) * 100).toFixed(1))
    : 27.2;

  const handlePrintZ = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            Tableau de Bord & Performance Financière
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Rapport des ventes du service, panier moyen, ratio matières et clôture de caisse.
          </p>
        </div>

        <button
          onClick={() => setIsZReportOpen(true)}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
        >
          <FileCheck className="w-4 h-4" />
          <span>Générer Clôture de Caisse (Z de Caisse)</span>
        </button>
      </div>

      {/* 4 Primary Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[10px] uppercase font-bold">Chiffre d'Affaires Encaissé</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-stone-900 font-mono">
            {formatCurrency(totalPaidRevenue)}
          </div>
          <span className="text-[11px] text-stone-500">
            + {formatCurrency(totalActiveRevenue)} en tables actives
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[10px] uppercase font-bold">Panier Moyen / Table</span>
            <Receipt className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-stone-900 font-mono">
            {formatCurrency(averageTicketTable)}
          </div>
          <span className="text-[11px] text-stone-500">
            {averageTicketGuest > 0 ? `${formatCurrency(averageTicketGuest)} / couvert` : 'En attente'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[10px] uppercase font-bold">Couverts Enregistrés</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-stone-900 font-mono">
            {totalGuests} pers.
          </div>
          <span className="text-[11px] text-stone-500">
            Sur {orders.length} commandes au total
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[10px] uppercase font-bold">Ratio Food Cost Global</span>
            <Package className="w-4 h-4 text-purple-500" />
          </div>
          <div className={`text-2xl font-black font-mono ${
            globalFoodCostRate <= 30 ? 'text-emerald-700' : 'text-rose-600'
          }`}>
            {globalFoodCostRate}%
          </div>
          <span className="text-[11px] text-stone-500">
            Coût matières: {formatCurrency(totalStockDeductionsCost)}
          </span>
        </div>
      </div>

      {/* Breakdown Row: Top Dishes & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Top 6 Best Sellers */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Top Ventes du Service (Plats & Cocktails)
          </h3>

          <div className="divide-y divide-stone-100">
            {topDishes.map((dish, index) => (
              <div key={index} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center font-bold text-[11px] text-stone-700">
                    #{index + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-stone-900">{dish.name}</h4>
                    <span className="text-[10px] text-stone-400 capitalize">{dish.category}</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="font-extrabold text-stone-900 block">{dish.quantity} vendus</span>
                  <span className="text-[11px] text-amber-700 font-bold">{formatCurrency(dish.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            Ventilation des Règlements
          </h3>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-stone-800">Cartes Bancaires (CB)</span>
              </div>
              <span className="font-mono font-extrabold text-stone-900">{formatCurrency(cbRevenue)}</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-stone-800">Espèces</span>
              </div>
              <span className="font-mono font-extrabold text-stone-900">{formatCurrency(cashRevenue)}</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Ticket className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-stone-800">Titres Restaurant</span>
              </div>
              <span className="font-mono font-extrabold text-stone-900">{formatCurrency(ticketRestoRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Z DE CAISSE MODAL */}
      {isZReportOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 border border-stone-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-stone-900">Rapport Clôture de Caisse (Z de Caisse)</h2>
                <p className="text-xs text-stone-500">Service du {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
              <button onClick={() => setIsZReportOpen(false)} className="text-stone-400 hover:text-stone-600">
                ✕
              </button>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 font-mono text-xs space-y-2">
              <div className="flex justify-between font-bold text-stone-900 border-b border-stone-300 pb-1">
                <span>TOTAL CHIFFRE D'AFFAIRES TTC</span>
                <span>{formatCurrency(totalPaidRevenue)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Total HT</span>
                <span>{formatCurrency(totalPaidRevenue * 0.9)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>TVA 10% (Alimentation/Softs)</span>
                <span>{formatCurrency(totalPaidRevenue * 0.08)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>TVA 20% (Alcools & Vins)</span>
                <span>{formatCurrency(totalPaidRevenue * 0.02)}</span>
              </div>
              <div className="pt-2 border-t border-stone-300 space-y-1">
                <div className="flex justify-between">
                  <span>Encaissé CB :</span>
                  <span>{formatCurrency(cbRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Encaissé Espèces :</span>
                  <span>{formatCurrency(cashRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Encaissé Titres Resto :</span>
                  <span>{formatCurrency(ticketRestoRevenue)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handlePrintZ}
                className="px-3 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer Z de Caisse</span>
              </button>
              <button
                onClick={() => setIsZReportOpen(false)}
                className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
