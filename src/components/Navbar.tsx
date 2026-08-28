import React from 'react';
import { useRestaurant, ActiveTab } from '../context/RestaurantContext';
import { 
  Smartphone, 
  ChefHat, 
  Boxes, 
  UtensilsCrossed, 
  Receipt, 
  BarChart3, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  AlertTriangle,
  LayoutGrid,
  Sparkles,
  Users,
  CreditCard
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentRole,
    setCurrentRole,
    mobileViewMode,
    setMobileViewMode,
    soundEnabled,
    setSoundEnabled,
    ingredients,
    orders,
    tables,
    resetDemoData,
  } = useRestaurant();

  // Low stock counter
  const lowStockCount = ingredients.filter((i) => i.currentStock <= i.minThreshold).length;

  // Active active orders & seated guests
  const occupiedTables = tables.filter((t) => t.status === 'occupee' || t.status === 'addition');
  const activeOrders = orders.filter((o) => o.status !== 'paid' && o.status !== 'cancelled');
  const currentServiceRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; badgeColor?: string }[] = [
    { id: 'prise_commande', label: 'Prise de Commande', icon: Smartphone },
    { id: 'plan_salle', label: 'Plan de Salle', icon: LayoutGrid, badge: occupiedTables.length, badgeColor: 'bg-stone-800 text-white' },
    { id: 'cuisine_kds', label: 'Écran Cuisine (KDS)', icon: ChefHat, badge: activeOrders.length, badgeColor: 'bg-amber-600 text-white' },
    { id: 'stocks', label: 'Stocks en Direct', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-rose-500 text-white animate-pulse' },
    { id: 'recettes', label: 'Fiches Recettes', icon: UtensilsCrossed },
    { id: 'caisse', label: 'Caisse & Additions', icon: Receipt },
    { id: 'analyses', label: 'Tableau de Bord', icon: BarChart3 },
  ];

  return (
    <header id="resto-navbar" className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-40 shadow-sm">
      {/* Top micro bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand & Live status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-stone-950 font-bold shadow-md shadow-amber-500/20">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-tight text-base text-white">TriompheResto</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                    Service Actif
                  </span>
                </div>
                <span className="text-[11px] text-stone-400 hidden sm:block">TriompheResto • Restaurant & Bar</span>
              </div>
            </div>
          </div>

          {/* Center quick stats */}
          <div className="hidden lg:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-800/80 border border-stone-700/60 text-stone-300">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span>CA Encaissé:</span>
              <strong className="text-emerald-400 font-mono">{formatCurrency(currentServiceRevenue)}</strong>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-800/80 border border-stone-700/60 text-stone-300">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Tables Occupées:</span>
              <strong className="text-white font-mono">{occupiedTables.length}/{tables.length}</strong>
            </div>

            {lowStockCount > 0 && (
              <button
                onClick={() => setActiveTab('stocks')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                <span>Alertes Stock:</span>
                <strong className="text-rose-300 font-mono">{lowStockCount} rupture{lowStockCount > 1 ? 's' : ''}</strong>
              </button>
            )}
          </div>

          {/* Right actions: Role switcher, mobile toggle, audio, reset */}
          <div className="flex items-center gap-2">
            {/* Mobile View Toggle */}
            <button
              id="btn-toggle-mobile-mode"
              onClick={() => setMobileViewMode(!mobileViewMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mobileViewMode
                  ? 'bg-amber-500 text-stone-950 shadow-md font-semibold'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'
              }`}
              title="Activer le format smartphone de poche pour serveur"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vue Terminal Mobile</span>
            </button>

            {/* Role selector */}
            <div className="relative flex items-center bg-stone-800 rounded-lg p-0.5 border border-stone-700 text-xs">
              <select
                id="role-select"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as any)}
                aria-label="Sélectionner le rôle utilisateur"
                className="bg-transparent text-stone-200 text-xs py-1 px-2 focus:outline-none cursor-pointer"
              >
                <option value="serveur" className="bg-stone-900 text-white">Serveur / Salle</option>
                <option value="cuisine" className="bg-stone-900 text-white">Chef Cuisine</option>
                <option value="gerant" className="bg-stone-900 text-white">Gérant / Manager</option>
                <option value="barman" className="bg-stone-900 text-white">Barman</option>
              </select>
            </div>

            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              title={soundEnabled ? 'Son activé (cloche cuisine & bips)' : 'Son coupé'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
            </button>

            {/* Reset data */}
            <button
              onClick={() => {
                if (confirm('Voulez-vous réinitialiser les tables, commandes et stocks du restaurant ?')) {
                  resetDemoData();
                }
              }}
              className="p-1.5 text-stone-400 hover:text-rose-400 rounded-lg hover:bg-stone-800 transition-colors"
              title="Réinitialiser données démo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation tabs row */}
      <div className="bg-stone-950/70 border-t border-stone-800/80 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow font-semibold'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-stone-950 text-amber-400' : item.badgeColor || 'bg-stone-700 text-stone-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
