import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { RestaurantOrder, OrderItem, CourseType } from '../types';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Check, 
  Volume2, 
  Filter, 
  BellRing,
  Utensils
} from 'lucide-react';
import { playKitchenBellSound } from '../utils/audio';

export const KitchenKDS: React.FC = () => {
  const {
    orders,
    updateOrderItemStatus,
    markOrderAllItemsReady,
    soundEnabled,
  } = useRestaurant();

  const [filterCourse, setFilterCourse] = useState<CourseType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'active' | 'ready' | 'all'>('active');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Tick clock every 10 seconds for wait time counters
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Filter orders that have items for kitchen (sent_to_kitchen, ready, or in_progress with non-served items)
  const kitchenOrders = orders
    .filter((ord) => ord.status !== 'paid' && ord.status !== 'cancelled' && ord.items.length > 0)
    .filter((ord) => {
      if (filterStatus === 'active') return ord.status === 'sent_to_kitchen' || ord.status === 'in_progress';
      if (filterStatus === 'ready') return ord.status === 'ready';
      return true;
    })
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Helper for elapsed time in minutes
  const getElapsedMinutes = (dateString?: string) => {
    if (!dateString) return 0;
    const diffMs = currentTime - new Date(dateString).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  const coursesList: { id: CourseType | 'all'; label: string }[] = [
    { id: 'all', label: 'Tous les Bons' },
    { id: 'entree', label: 'Entrées' },
    { id: 'plat', label: 'Plats Chauds' },
    { id: 'dessert', label: 'Desserts' },
    { id: 'boisson', label: 'Bar & Boissons' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* KDS Header */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-extrabold shadow-md">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Écran Cuisine KDS en Direct
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {kitchenOrders.length} bons en cours
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Passe cuisine & envoi des suites en temps réel.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <div className="flex bg-stone-800 p-1 rounded-xl border border-stone-700 text-xs">
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterStatus === 'active'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              À Préparer ({orders.filter((o) => o.status === 'sent_to_kitchen').length})
            </button>
            <button
              onClick={() => setFilterStatus('ready')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterStatus === 'ready'
                  ? 'bg-emerald-500 text-stone-950 shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Prêts au Passe ({orders.filter((o) => o.status === 'ready').length})
            </button>
          </div>

          {/* Course filter */}
          <div className="flex gap-1 overflow-x-auto">
            {coursesList.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilterCourse(c.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterCourse === c.id
                    ? 'bg-stone-700 text-white border border-stone-600'
                    : 'bg-stone-800/80 text-stone-400 hover:text-stone-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Tickets Flow */}
      {kitchenOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 shadow-xs space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-stone-900">
            Tous les bons cuisine sont expédiés !
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Le passe est libre. Les nouvelles commandes passées par les serveurs apparaîtront instantanément ici.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {kitchenOrders.map((order) => {
            const elapsed = getElapsedMinutes(order.sentToKitchenAt || order.createdAt);
            
            // Urgency color scheme
            let timerBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
            let cardBorder = 'border-stone-300';
            if (elapsed >= 20) {
              timerBadgeColor = 'bg-rose-600 text-white border-rose-700 animate-pulse';
              cardBorder = 'border-rose-400 ring-1 ring-rose-300';
            } else if (elapsed >= 10) {
              timerBadgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
              cardBorder = 'border-amber-400';
            }

            const visibleItems = order.items.filter(
              (it) => filterCourse === 'all' || it.course === filterCourse
            );

            if (visibleItems.length === 0) return null;

            const allItemsReady = order.items.every((it) => it.status === 'ready' || it.status === 'served');

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border-2 shadow-sm flex flex-col justify-between overflow-hidden ${cardBorder}`}
              >
                {/* Ticket Top Header */}
                <div className="p-3.5 bg-stone-900 text-white flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-amber-400 text-base">
                        #{order.orderNumber}
                      </span>
                      <h3 className="font-bold text-sm text-white">{order.tableName}</h3>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      {order.zone} • {order.guestCount} pers. • {order.serverName}
                    </p>
                  </div>

                  {/* Elapsed wait timer */}
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${timerBadgeColor}`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{elapsed} min</span>
                  </div>
                </div>

                {/* Ticket Items Breakdown */}
                <div className="p-3.5 divide-y divide-stone-100 flex-1 space-y-2">
                  {visibleItems.map((item) => {
                    const isReady = item.status === 'ready' || item.status === 'served';
                    const isPreparing = item.status === 'preparing';

                    return (
                      <div
                        key={item.id}
                        onClick={() =>
                          updateOrderItemStatus(
                            order.id,
                            item.id,
                            isReady ? 'preparing' : 'ready'
                          )
                        }
                        className={`pt-2 first:pt-0 flex items-start justify-between gap-2.5 cursor-pointer group select-none ${
                          isReady ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Checkbox button */}
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all mt-0.5 ${
                              isReady
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-stone-300 group-hover:border-amber-500 bg-stone-50'
                            }`}
                          >
                            {isReady && <Check className="w-3.5 h-3.5" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-extrabold text-stone-900 text-sm">
                                {item.quantity}x
                              </span>
                              <span
                                className={`text-xs sm:text-sm font-bold ${
                                  isReady ? 'line-through text-stone-400' : 'text-stone-900'
                                }`}
                              >
                                {item.menuItemName}
                              </span>
                            </div>

                            {/* Cooking Instructions Highlight */}
                            {item.specialInstructions && (
                              <div className="mt-0.5 inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-extrabold text-[10px] uppercase tracking-wide border border-amber-300">
                                ⚠️ {item.specialInstructions}
                              </div>
                            )}

                            <span className="block text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                              {item.course}
                            </span>
                          </div>
                        </div>

                        {/* Status label */}
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                            isReady
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPreparing
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {isReady ? 'Prêt' : 'En cuisson'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Ticket Bottom Actions */}
                <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-stone-500">
                    {order.items.filter((i) => i.status === 'ready').length} / {order.items.length} prêts
                  </span>

                  {!allItemsReady ? (
                    <button
                      onClick={() => markOrderAllItemsReady(order.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      <span>Tout Prêt au Passe</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Bon complet au passe
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
