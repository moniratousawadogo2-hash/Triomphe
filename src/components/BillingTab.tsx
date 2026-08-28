import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { RestaurantTable, RestaurantOrder } from '../types';
import { 
  Receipt, 
  CreditCard, 
  Clock, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Search,
  Filter,
  DollarSign
} from 'lucide-react';
import { BillingModal } from './BillingModal';
import { formatCurrency } from '../utils/currency';

export const BillingTab: React.FC = () => {
  const { tables, orders, getActiveOrderByTableId, setTableStatus } = useRestaurant();

  const [selectedTableForBilling, setSelectedTableForBilling] = useState<{
    table: RestaurantTable;
    order: RestaurantOrder;
  } | null>(null);

  // Active orders with tables
  const activeTablesWithOrders = tables
    .map((table) => {
      const order = getActiveOrderByTableId(table.id);
      return { table, order };
    })
    .filter((item): item is { table: RestaurantTable; order: RestaurantOrder } => item.order !== undefined);

  // Paid orders history
  const paidOrders = orders
    .filter((o) => o.status === 'paid')
    .sort((a, b) => new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime());

  const totalOutstanding = activeTablesWithOrders.reduce((sum, item) => sum + item.order.totalAmount, 0);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            Caisse, Additions & Encaissements
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Gestion des encaissements par table, division d'addition et journal des tickets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs">
            <span className="text-amber-800 block text-[10px] uppercase font-bold">En cours en salle</span>
            <span className="text-stone-900 font-extrabold font-mono text-sm">{formatCurrency(totalOutstanding)}</span>
          </div>
        </div>
      </div>

      {/* Active Checks Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-stone-900">
          Tables Actives en Salle ({activeTablesWithOrders.length})
        </h2>

        {activeTablesWithOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-stone-500 text-xs">
            Aucune addition en attente. Toutes les tables sont actuellement libres ou réglées.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTablesWithOrders.map(({ table, order }) => {
              const isAdditionRequested = table.status === 'addition';

              return (
                <div
                  key={table.id}
                  className={`bg-white rounded-2xl p-4 border-2 transition-all shadow-xs flex flex-col justify-between ${
                    isAdditionRequested
                      ? 'border-rose-400 bg-rose-50/30'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-9 h-9 rounded-xl bg-stone-900 text-white font-bold flex items-center justify-center text-sm">
                          {table.number}
                        </span>
                        <div>
                          <h3 className="font-bold text-stone-900 text-sm">{table.name}</h3>
                          <span className="text-[11px] text-stone-500">{table.zone}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isAdditionRequested
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isAdditionRequested ? 'Addition demandée' : 'En cours'}
                      </span>
                    </div>

                    {/* Order items count & total */}
                    <div className="mt-3.5 space-y-1 bg-stone-50 rounded-xl p-3 border border-stone-200/70 text-xs">
                      <div className="flex justify-between text-stone-600">
                        <span>Lignes commandées :</span>
                        <strong className="font-mono">{order.items.length} articles</strong>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Serveur :</span>
                        <span>{order.serverName}</span>
                      </div>
                      <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-1 border-t border-stone-200">
                        <span>Total TTC :</span>
                        <span className="font-mono text-emerald-700 font-black">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center gap-2">
                    <button
                      onClick={() => setTableStatus(table.id, isAdditionRequested ? 'occupee' : 'addition')}
                      className="px-2.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold"
                      title="Changer statut"
                    >
                      {isAdditionRequested ? 'Annuler rappel' : 'Rappel addition'}
                    </button>
                    <button
                      onClick={() => setSelectedTableForBilling({ table, order })}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Encaisser ({formatCurrency(order.totalAmount)})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Paid Orders History Table */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          Derniers Règlements Encaissés ({paidOrders.length})
        </h2>

        {paidOrders.length === 0 ? (
          <p className="text-xs text-stone-400 py-4 text-center">Aucun règlement archivé pour le moment.</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {paidOrders.map((ord) => (
              <div key={ord.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-900">#{ord.orderNumber}</span>
                    <span className="font-bold text-stone-800">{ord.tableName}</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      {ord.paymentMethod?.toUpperCase() || 'CB'}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400">
                    Serveur: {ord.serverName} • {ord.items.length} articles •{' '}
                    {new Date(ord.completedAt || ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="text-right font-mono">
                  <span className="font-extrabold text-stone-900 text-sm">{formatCurrency(ord.totalAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BILLING MODAL */}
      {selectedTableForBilling && (
        <BillingModal
          order={selectedTableForBilling.order}
          table={selectedTableForBilling.table}
          onClose={() => setSelectedTableForBilling(null)}
        />
      )}
    </div>
  );
};
