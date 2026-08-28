import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { MenuItem, MenuCategory, OrderItem, RestaurantTable, RESTAURANT_SERVERS } from '../types';
import { 
  Search, 
  Send, 
  Plus, 
  Minus, 
  Trash2, 
  AlertCircle, 
  Clock, 
  Utensils, 
  Receipt, 
  User, 
  ChevronRight, 
  Check, 
  MessageSquare,
  Sparkles,
  Info,
  X
} from 'lucide-react';
import { BillingModal } from './BillingModal';
import { formatCurrency } from '../utils/currency';

export const MobilePOS: React.FC = () => {
  const {
    menuItems,
    tables,
    orders,
    selectedTableId,
    setSelectedTableId,
    getActiveOrderByTableId,
    occupyTable,
    addItemToOrder,
    removeItemFromOrder,
    updateOrderItemQty,
    sendOrderToKitchen,
    calculateDishMaxPortions,
    calculateDishCost,
    mobileViewMode,
    setActiveTab,
  } = useRestaurant();

  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCourse, setActiveCourse] = useState<OrderItem['course']>('plat');
  const [customNote, setCustomNote] = useState('');
  const [currentServer, setCurrentServer] = useState<string>(RESTAURANT_SERVERS[0]);
  
  // Customization modal state
  const [selectedDishForNote, setSelectedDishForNote] = useState<MenuItem | null>(null);
  const [modalCourse, setModalCourse] = useState<OrderItem['course']>('plat');
  const [modalNote, setModalNote] = useState('');

  // Billing modal
  const [isBillingOpen, setIsBillingOpen] = useState(false);

  // Current active table & order
  const currentTable = tables.find((t) => t.id === selectedTableId) || tables[0];
  const activeOrder = currentTable ? getActiveOrderByTableId(currentTable.id) : undefined;

  // Categories list
  const categories: { id: MenuCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'Tous les Plats' },
    { id: 'burgers', label: 'Burgers Gourmet' },
    { id: 'entrees', label: 'Entrées' },
    { id: 'plats', label: 'Plats Chauds' },
    { id: 'desserts', label: 'Desserts' },
    { id: 'boissons', label: 'Cocktails & Softs' },
    { id: 'vins', label: 'Vins & Caves' },
  ];

  // Filtered menu items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle open table if not occupied
  const handleOpenTable = (guestCount = 2) => {
    if (!currentTable) return;
    occupyTable(currentTable.id, guestCount, currentServer);
  };

  // Quick add dish
  const handleDirectAdd = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentTable) return;

    let orderId = activeOrder?.id;
    if (!orderId) {
      orderId = occupyTable(currentTable.id, currentTable.capacity, currentServer);
    }

    // Determine default course
    let course: OrderItem['course'] = 'plat';
    if (item.category === 'entrees') course = 'entree';
    else if (item.category === 'desserts') course = 'dessert';
    else if (item.category === 'boissons' || item.category === 'vins') course = 'boisson';

    addItemToOrder(orderId, item, course);
  };

  const handleOpenDishModal = (item: MenuItem) => {
    setSelectedDishForNote(item);
    let course: OrderItem['course'] = 'plat';
    if (item.category === 'entrees') course = 'entree';
    else if (item.category === 'desserts') course = 'dessert';
    else if (item.category === 'boissons' || item.category === 'vins') course = 'boisson';
    setModalCourse(course);
    setModalNote('');
  };

  const handleConfirmModalAdd = () => {
    if (!selectedDishForNote || !currentTable) return;

    let orderId = activeOrder?.id;
    if (!orderId) {
      orderId = occupyTable(currentTable.id, currentTable.capacity, currentServer);
    }

    addItemToOrder(orderId, selectedDishForNote, modalCourse, modalNote);
    setSelectedDishForNote(null);
  };

  const pendingItemsCount = activeOrder?.items.filter((it) => it.status === 'pending').length || 0;

  return (
    <div className={`p-3 sm:p-5 max-w-7xl mx-auto ${mobileViewMode ? 'flex justify-center' : ''}`}>
      {/* Mobile Smartphone Shell Container if in simulator mode */}
      <div
        className={
          mobileViewMode
            ? 'w-full max-w-[420px] bg-stone-900 rounded-[36px] p-3 shadow-2xl border-4 border-stone-800 ring-1 ring-stone-700/50'
            : 'w-full'
        }
      >
        {mobileViewMode && (
          <div className="flex items-center justify-between px-4 py-1.5 text-stone-400 text-[11px] mb-2 border-b border-stone-800">
            <span>Terminal Mobile Serveur</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>4G / Synchro Stock</span>
            </div>
          </div>
        )}

        <div className={`grid ${mobileViewMode ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-12 gap-5'}`}>
          {/* LEFT / TOP: Menu Catalog & Categories */}
          <div className={mobileViewMode ? 'w-full' : 'lg:col-span-7 xl:col-span-8 space-y-4'}>
            {/* Table selector & Quick Header */}
            <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-700 font-bold flex items-center justify-center border border-amber-500/20 text-lg">
                  {currentTable.number}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-stone-900">{currentTable.name}</h2>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        currentTable.status === 'occupee'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : currentTable.status === 'addition'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {currentTable.status === 'occupee'
                        ? 'En cours'
                        : currentTable.status === 'addition'
                        ? 'Addition'
                        : 'Libre'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    {currentTable.zone} • {currentTable.capacity} couverts max
                    {activeOrder ? ` • Serveur: ${activeOrder.serverName}` : ''}
                  </p>
                </div>
              </div>

              {/* Table & Server Switcher Dropdown */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Active Waiter Selector */}
                <div className="flex items-center gap-1.5 bg-amber-50/70 border border-amber-200/80 rounded-lg px-2 py-1">
                  <User className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span className="text-[10px] uppercase font-bold text-amber-700 hidden sm:inline">Serveur:</span>
                  <select
                    value={currentServer}
                    onChange={(e) => setCurrentServer(e.target.value)}
                    className="text-xs bg-transparent text-stone-900 font-bold focus:outline-none cursor-pointer"
                    title="Serveur connecté sur ce terminal"
                  >
                    <option value="Man">1er — Man</option>
                    <option value="Women">2ème — Women</option>
                    <option value="Boy">3ème — Boy</option>
                    <option value="Girl">4ème — Girl</option>
                  </select>
                </div>

                <select
                  value={currentTable.id}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="text-xs bg-stone-100 border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                >
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.zone}) - {t.status.toUpperCase()}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setActiveTab('plan_salle')}
                  className="px-2 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium border border-stone-200 flex items-center gap-1 transition-colors"
                  title="Voir le plan de salle graphique"
                >
                  Plan
                </button>
              </div>
            </div>

            {/* Search & Category Pills */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher un plat, ingrédient, boisson..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Categories Scrollable Bar */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid with Real-Time Stock Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3">
              {filteredItems.map((item) => {
                const { maxPortions, limitingIngredient } = calculateDishMaxPortions(item);
                const isOutOfStock = maxPortions <= 0 || item.isManuallyDisabled;
                const isLowStock = maxPortions > 0 && maxPortions <= 4;

                return (
                  <div
                    key={item.id}
                    onClick={() => !isOutOfStock && handleOpenDishModal(item)}
                    className={`group relative bg-white rounded-xl p-3 border transition-all cursor-pointer flex flex-col justify-between select-none ${
                      isOutOfStock
                        ? 'opacity-60 bg-stone-100/80 border-stone-200 cursor-not-allowed'
                        : isLowStock
                        ? 'border-amber-300 hover:border-amber-500 hover:shadow-md'
                        : 'border-stone-200 hover:border-stone-400 hover:shadow-md'
                    }`}
                  >
                    {/* Top: Name, Badge, Price */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-amber-700 leading-tight">
                          {item.name}
                        </h3>
                        <span className="text-xs sm:text-sm font-extrabold text-stone-900 font-mono shrink-0">
                          {formatCurrency(item.price)}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-500 line-clamp-2 mb-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Bottom: Stock Badge & Quick Add */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
                      {/* REAL-TIME INVENTORY BADGE */}
                      <div className="flex items-center gap-1">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            Rupture stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                            ⚠️ Reste: {maxPortions}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Dispo: {maxPortions > 50 ? '50+' : maxPortions}
                          </span>
                        )}
                        {limitingIngredient && isLowStock && (
                          <span className="text-[9px] text-amber-700 hidden sm:inline" title={limitingIngredient.name}>
                            ({limitingIngredient.name.split(' ')[0]})
                          </span>
                        )}
                      </div>

                      {/* Quick + button */}
                      {!isOutOfStock && (
                        <button
                          onClick={(e) => handleDirectAdd(item, e)}
                          className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-amber-600 text-white flex items-center justify-center transition-colors shadow-xs"
                          title="Ajouter direct à la commande"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Active Order Cart & Kitchen Dispatcher */}
          <div className={mobileViewMode ? 'w-full' : 'lg:col-span-5 xl:col-span-4'}>
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col h-full min-h-[500px]">
              {/* Cart Header */}
              <div className="p-3.5 sm:p-4 border-b border-stone-200 bg-stone-50/70 rounded-t-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                      Commande #{activeOrder?.orderNumber || '---'}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-200 text-stone-800">
                      {currentTable.name}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    {activeOrder ? `${activeOrder.items.length} lignes d'articles` : 'Table non encore ouverte'}
                  </p>
                </div>

                {activeOrder && (
                  <button
                    onClick={() => setIsBillingOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Addition</span>
                  </button>
                )}
              </div>

              {/* Items List in Cart */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-2 max-h-[380px] scrollbar-thin">
                {!activeOrder || activeOrder.items.length === 0 ? (
                  <div className="py-12 text-center text-stone-400 space-y-2">
                    <Utensils className="w-8 h-8 mx-auto text-stone-300 stroke-1" />
                    <p className="text-xs font-medium">Aucun article sélectionné</p>
                    <p className="text-[11px] text-stone-400">
                      Touchez un plat à gauche pour commencer la prise de commande.
                    </p>
                    {!activeOrder && (
                      <button
                        onClick={() => handleOpenTable(currentTable.capacity)}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs shadow-xs"
                      >
                        Ouvrir la table ({currentTable.capacity} couverts)
                      </button>
                    )}
                  </div>
                ) : (
                  activeOrder.items.map((item) => {
                    const isPending = item.status === 'pending';
                    const isPreparing = item.status === 'preparing';
                    const isReady = item.status === 'ready';
                    const isServed = item.status === 'served';

                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isPending
                            ? 'bg-amber-50/50 border-amber-200'
                            : isReady
                            ? 'bg-emerald-50/60 border-emerald-300'
                            : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.2 rounded bg-stone-200 text-stone-700">
                                {item.course}
                              </span>
                              <h4 className="text-xs font-bold text-stone-900 truncate">
                                {item.menuItemName}
                              </h4>
                            </div>

                            {item.specialInstructions && (
                              <p className="text-[11px] text-amber-700 font-medium italic mt-0.5 flex items-center gap-1">
                                <MessageSquare className="w-2.5 h-2.5 shrink-0" />
                                {item.specialInstructions}
                              </p>
                            )}

                            {/* Status badge */}
                            <div className="mt-1 flex items-center gap-2 text-[10px]">
                              <span
                                className={`font-semibold ${
                                  isPending
                                    ? 'text-amber-600'
                                    : isPreparing
                                    ? 'text-blue-600 animate-pulse'
                                    : isReady
                                    ? 'text-emerald-700 font-bold'
                                    : 'text-stone-500'
                                }`}
                              >
                                {isPending
                                  ? '• En attente d\'envoi'
                                  : isPreparing
                                  ? '• En cuisine...'
                                  : isReady
                                  ? '✓ Prêt au passe !'
                                  : '✓ Servi à table'}
                              </span>
                            </div>
                          </div>

                          {/* Price & Quantity Controls */}
                          <div className="text-right shrink-0">
                            <span className="text-xs font-extrabold text-stone-900 font-mono">
                              {formatCurrency(item.price * item.quantity)}
                            </span>

                            {isPending ? (
                              <div className="flex items-center gap-1 mt-1 bg-white border border-stone-300 rounded-lg p-0.5">
                                <button
                                  onClick={() => updateOrderItemQty(activeOrder.id, item.id, -1)}
                                  className="w-5 h-5 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span className="text-xs font-bold text-stone-800 px-1 font-mono">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateOrderItemQty(activeOrder.id, item.id, 1)}
                                  className="w-5 h-5 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="text-[11px] text-stone-600 font-semibold mt-1">
                                Qté: {item.quantity}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Cart Footer / Totals & Action */}
              {activeOrder && (
                <div className="p-3.5 sm:p-4 border-t border-stone-200 bg-stone-50/90 rounded-b-2xl space-y-3 mt-auto">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-stone-500">
                      <span>Total HT</span>
                      <span>{formatCurrency(activeOrder.totalAmount * 0.9)}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>TVA estimée (10%/20%)</span>
                      <span>{formatCurrency(activeOrder.totalAmount * 0.1)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-1 border-t border-stone-200">
                      <span>Total TTC</span>
                      <span className="font-mono text-base text-amber-700">
                        {formatCurrency(activeOrder.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Send to kitchen button (Triggers real-time stock deduction!) */}
                  <button
                    id="btn-send-to-kitchen"
                    onClick={() => sendOrderToKitchen(activeOrder.id)}
                    disabled={activeOrder.items.length === 0}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                      pendingItemsCount > 0
                        ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-amber-500/20 active:scale-[0.98]'
                        : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {pendingItemsCount > 0
                        ? `Envoyer en Cuisine (${pendingItemsCount} nouv.) & Déduire Stock`
                        : 'Renvoyer Bon en Cuisine'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DISH CUSTOMIZATION MODAL (Cooking instructions, course choice) */}
      {selectedDishForNote && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-stone-200 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {selectedDishForNote.category}
                </span>
                <h3 className="text-base font-bold text-stone-900 mt-1">
                  {selectedDishForNote.name}
                </h3>
                <p className="text-xs text-stone-500 font-mono font-bold">
                  {formatCurrency(selectedDishForNote.price)} TTC
                </p>
              </div>
              <button
                onClick={() => setSelectedDishForNote(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Service Course Selector */}
            <div>
              <label className="text-xs font-bold text-stone-700 mb-1.5 block">
                Moment du service :
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['apero', 'entree', 'plat', 'dessert'] as OrderItem['course'][]).map((crs) => (
                  <button
                    key={crs}
                    onClick={() => setModalCourse(crs)}
                    className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      modalCourse === crs
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {crs}
                  </button>
                ))}
              </div>
            </div>

            {/* Cooking / Allergens / Notes shortcuts */}
            <div>
              <label className="text-xs font-bold text-stone-700 mb-1.5 block">
                Instructions spéciales cuisine & suppléments :
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  'Bleu',
                  'Saignant',
                  'À point',
                  'Bien cuit',
                  'Double Cheddar',
                  'Extra Bacon',
                  'Sans oignon',
                  'Sauce à part',
                  'Frites bien dorées',
                  'Sans gluten',
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setModalNote((prev) => (prev ? `${prev}, ${tag}` : tag))
                    }
                    className="text-[11px] px-2 py-1 rounded bg-stone-100 hover:bg-amber-100 hover:text-amber-800 text-stone-700 border border-stone-200 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                placeholder="Ex: Cuisson bien saignante, client allergique aux arachides..."
                value={modalNote}
                onChange={(e) => setModalNote(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setSelectedDishForNote(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmModalAdd}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold shadow-md shadow-amber-500/20"
              >
                Ajouter à la commande
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BILLING / CHECKOUT MODAL */}
      {isBillingOpen && activeOrder && (
        <BillingModal
          order={activeOrder}
          table={currentTable}
          onClose={() => setIsBillingOpen(false)}
        />
      )}
    </div>
  );
};
