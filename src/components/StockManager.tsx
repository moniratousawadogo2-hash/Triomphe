import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Ingredient, IngredientCategory, StockMovement } from '../types';
import { 
  Boxes, 
  AlertTriangle, 
  Plus, 
  TrendingDown, 
  RotateCcw, 
  FileText, 
  Search, 
  Filter, 
  ShoppingCart, 
  Clock, 
  ArrowDownRight, 
  ArrowUpRight, 
  Check, 
  Trash2, 
  Edit3,
  X,
  PackageCheck,
  Scale
} from 'lucide-react';
import { SupplierOrderModal } from './SupplierOrderModal';
import { formatCurrency, formatUnitCost } from '../utils/currency';

export const StockManager: React.FC = () => {
  const {
    ingredients,
    stockMovements,
    restockIngredient,
    declareStockLoss,
    adjustStockDirectly,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    generateSupplierOrder,
  } = useRestaurant();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | 'all'>('all');
  const [filterAlertOnly, setFilterAlertOnly] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'movements'>('inventory');

  // Modals state
  const [restockModalIng, setRestockModalIng] = useState<Ingredient | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);

  const [wasteModalIng, setWasteModalIng] = useState<Ingredient | null>(null);
  const [wasteQty, setWasteQty] = useState<number>(1);
  const [wasteReason, setWasteReason] = useState('Date limite / Avancé');

  const [adjustModalIng, setAdjustModalIng] = useState<Ingredient | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);

  const [isAddIngredientOpen, setIsAddIngredientOpen] = useState(false);
  const [isSupplierOrderOpen, setIsSupplierOrderOpen] = useState(false);

  // New ingredient form
  const [newIngForm, setNewIngForm] = useState<Omit<Ingredient, 'id'>>({
    name: '',
    category: 'legumes',
    currentStock: 10,
    minThreshold: 5,
    optimalStock: 25,
    unit: 'kg',
    costPerUnit: 1500,
    supplier: 'Fournisseur Local',
    storageLocation: 'Chambre froide positive',
  });

  // Categories list
  const categories: { id: IngredientCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'Toutes les matières' },
    { id: 'viandes', label: 'Viandes & Volailles' },
    { id: 'poissons', label: 'Poissons & Marée' },
    { id: 'legumes', label: 'Fruits & Légumes' },
    { id: 'produits_laitiers', label: 'Produits Laitiers' },
    { id: 'epicerie', label: 'Épicerie & Truffes' },
    { id: 'boulangerie', label: 'Boulangerie' },
    { id: 'boissons', label: 'Boissons & Bar' },
  ];

  // Filtering
  const filteredIngredients = ingredients.filter((ing) => {
    const matchesCategory = selectedCategory === 'all' || ing.category === selectedCategory;
    const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAlert = !filterAlertOnly || ing.currentStock <= ing.minThreshold;
    return matchesCategory && matchesSearch && matchesAlert;
  });

  // Key KPI stats
  const totalStockValue = ingredients.reduce((sum, ing) => sum + ing.currentStock * ing.costPerUnit, 0);
  const lowStockItems = ingredients.filter((ing) => ing.currentStock <= ing.minThreshold);
  const criticalOutOfStock = ingredients.filter((ing) => ing.currentStock <= 0);

  const todayOrderDeductionsCount = stockMovements.filter((m) => m.type === 'order_deduction').length;
  const todayWastedValue = Math.abs(
    stockMovements
      .filter((m) => m.type === 'waste')
      .reduce((sum, m) => sum + (m.costImpact || 0), 0)
  );

  const handleCreateIngredientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngForm.name) return;
    createIngredient(newIngForm);
    setIsAddIngredientOpen(false);
    setNewIngForm({
      name: '',
      category: 'legumes',
      currentStock: 10,
      minThreshold: 5,
      optimalStock: 25,
      unit: 'kg',
      costPerUnit: 3.50,
      supplier: 'Fournisseur Local',
      storageLocation: 'Chambre froide positive',
    });
  };

  const handleOpenSupplierOrder = () => {
    generateSupplierOrder();
    setIsSupplierOrderOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Boxes className="w-5 h-5 text-amber-600" />
              Suivi des Stocks en Temps Réel & Matières Premières
            </h1>
            <p className="text-xs sm:text-sm text-stone-500">
              Déduction automatique par commande client, alertes de seuil et bons de réapprovisionnement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenSupplierOrder}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Générer Bon de Commande ({lowStockItems.length})</span>
            </button>

            <button
              onClick={() => setIsAddIngredientOpen(true)}
              className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouvel Ingrédient</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Valeur Totale du Stock</span>
            <div className="text-base sm:text-lg font-black text-stone-900 font-mono mt-0.5">
              {formatCurrency(totalStockValue)}
            </div>
            <span className="text-[11px] text-stone-500">{ingredients.length} références actives</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${lowStockItems.length > 0 ? 'bg-rose-50/70 border-rose-200' : 'bg-stone-50 border-stone-200'}`}>
            <span className="text-[10px] uppercase font-bold text-rose-500 block">Articles en Seuil Critique</span>
            <div className="text-base sm:text-lg font-black text-rose-700 font-mono mt-0.5">
              {lowStockItems.length} matière{lowStockItems.length > 1 ? 's' : ''}
            </div>
            <span className="text-[11px] text-rose-600 font-medium">
              {criticalOutOfStock.length > 0 ? `${criticalOutOfStock.length} en rupture sèche` : 'Réapprovisionnement suggéré'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Consommations Service</span>
            <div className="text-base sm:text-lg font-black text-emerald-700 font-mono mt-0.5">
              {todayOrderDeductionsCount} déductions
            </div>
            <span className="text-[11px] text-stone-500">Liées aux commandes en direct</span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Pertes & Gaspillage</span>
            <div className="text-base sm:text-lg font-black text-amber-800 font-mono mt-0.5">
              {formatCurrency(todayWastedValue)}
            </div>
            <span className="text-[11px] text-stone-500">Déclarations manuelles</span>
          </div>
        </div>
      </div>

      {/* View Switcher: Inventory Table vs Movement Log */}
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'inventory'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Catalogue des Stocks ({ingredients.length})
          </button>
          <button
            onClick={() => setActiveSubTab('movements')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'movements'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Journal des Mouvements en Direct ({stockMovements.length})
          </button>
        </div>

        {activeSubTab === 'inventory' && (
          <button
            onClick={() => setFilterAlertOnly(!filterAlertOnly)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
              filterAlertOnly
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Alertes seules ({lowStockItems.length})</span>
          </button>
        )}
      </div>

      {activeSubTab === 'inventory' ? (
        /* INVENTORY TABLE & FILTERS */
        <div className="space-y-4">
          {/* Search & Categories */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par nom de matière, fournisseur, référence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-stone-800 text-white'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table of Ingredients */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Ingrédient / Matière</th>
                    <th className="py-3 px-3">Catégorie</th>
                    <th className="py-3 px-4">Niveau de Stock</th>
                    <th className="py-3 px-3">Seuil Alerte</th>
                    <th className="py-3 px-3">Coût Unitaire</th>
                    <th className="py-3 px-3">Fournisseur</th>
                    <th className="py-3 px-4 text-right">Actions Rapides</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {filteredIngredients.map((ing) => {
                    const isLow = ing.currentStock <= ing.minThreshold;
                    const isOut = ing.currentStock <= 0;
                    const stockPercent = Math.min(100, Math.round((ing.currentStock / ing.optimalStock) * 100));

                    return (
                      <tr key={ing.id} className="hover:bg-stone-50/80 transition-colors">
                        {/* Name & Reference */}
                        <td className="py-3 px-4 font-bold text-stone-900">
                          <div className="flex items-center gap-2">
                            <span>{ing.name}</span>
                            {isOut ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-600 text-white">
                                RUPTURE
                              </span>
                            ) : isLow ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                BAS
                              </span>
                            ) : null}
                          </div>
                          <span className="text-[10px] text-stone-400 font-normal">
                            Réf: {ing.supplierRef || '---'} • {ing.storageLocation}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3">
                          <span className="capitalize px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-semibold">
                            {ing.category.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Stock Progress Bar & Value */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-extrabold font-mono text-stone-900">
                                {ing.currentStock} {ing.unit}
                              </span>
                              <span className="text-[10px] text-stone-400">
                                Cible: {ing.optimalStock} {ing.unit}
                              </span>
                            </div>
                            {/* Bar */}
                            <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isOut
                                    ? 'bg-rose-500'
                                    : isLow
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.max(4, stockPercent)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Min Threshold */}
                        <td className="py-3 px-3 font-mono text-stone-600 font-semibold">
                          {ing.minThreshold} {ing.unit}
                        </td>

                        {/* Cost */}
                        <td className="py-3 px-3 font-mono text-stone-900 font-semibold">
                          {formatUnitCost(ing.costPerUnit, ing.unit)}
                        </td>

                        {/* Supplier */}
                        <td className="py-3 px-3 text-stone-600 text-[11px]">
                          {ing.supplier}
                        </td>

                        {/* Action buttons */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Restock */}
                            <button
                              onClick={() => {
                                setRestockModalIng(ing);
                                setRestockQty(Number((ing.optimalStock - ing.currentStock).toFixed(1)) || 5);
                              }}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold border border-emerald-200 text-[11px] flex items-center gap-1 transition-colors"
                              title="Réapprovisionner le stock"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Livraison</span>
                            </button>

                            {/* Declare loss / waste */}
                            <button
                              onClick={() => {
                                setWasteModalIng(ing);
                                setWasteQty(1);
                              }}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-semibold border border-rose-200 text-[11px] flex items-center gap-1 transition-colors"
                              title="Déclarer une perte ou gaspillage"
                            >
                              <TrendingDown className="w-3 h-3" />
                              <span>Perte</span>
                            </button>

                            {/* Adjust */}
                            <button
                              onClick={() => {
                                setAdjustModalIng(ing);
                                setAdjustQty(ing.currentStock);
                              }}
                              className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                              title="Ajuster l'inventaire"
                            >
                              <Scale className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* REAL-TIME MOVEMENTS LOG */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Journal des Déductions & Mouvements en Temps Réel
            </h3>
            <span className="text-xs text-stone-500">
              Historique complet des consommations cuisine et réceptions
            </span>
          </div>

          <div className="divide-y divide-stone-100 max-h-[550px] overflow-y-auto">
            {stockMovements.map((mov) => {
              const isDeduction = mov.type === 'order_deduction';
              const isRestock = mov.type === 'restock';
              const isWaste = mov.type === 'waste';

              return (
                <div key={mov.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        isRestock
                          ? 'bg-emerald-100 text-emerald-800'
                          : isWaste
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {isRestock ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : isWaste ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{mov.ingredientName}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            isRestock
                              ? 'bg-emerald-100 text-emerald-800'
                              : isWaste
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {isRestock
                            ? 'Livraison'
                            : isWaste
                            ? 'Gaspillage'
                            : 'Consommation Commande'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {mov.reason} • Opérateur: {mov.user}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <span
                      className={`text-sm font-extrabold block ${
                        isRestock ? 'text-emerald-700' : 'text-stone-900'
                      }`}
                    >
                      {mov.quantityChange > 0 ? `+${mov.quantityChange}` : mov.quantityChange}{' '}
                      {mov.unit}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(mov.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RESTOCK MODAL */}
      {restockModalIng && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-stone-200 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Réceptionner marchandise : {restockModalIng.name}
              </h3>
              <p className="text-xs text-stone-500">
                Stock actuel: {restockModalIng.currentStock} {restockModalIng.unit} • Cible: {restockModalIng.optimalStock} {restockModalIng.unit}
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Quantité reçue ({restockModalIng.unit}) :
              </label>
              <input
                type="number"
                step="any"
                value={restockQty}
                onChange={(e) => setRestockQty(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setRestockModalIng(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  restockIngredient(restockModalIng.id, restockQty, `Livraison ${restockModalIng.supplier}`);
                  setRestockModalIng(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                Valider Réception (+{restockQty})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WASTE MODAL */}
      {wasteModalIng && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-stone-200 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Déclarer une perte : {wasteModalIng.name}
              </h3>
              <p className="text-xs text-stone-500">
                Coût unitaire: {formatUnitCost(wasteModalIng.costPerUnit, wasteModalIng.unit)}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Quantité perdue / jetée ({wasteModalIng.unit}) :
                </label>
                <input
                  type="number"
                  step="any"
                  value={wasteQty}
                  onChange={(e) => setWasteQty(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold font-mono focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Motif de la perte :
                </label>
                <select
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="Date limite de consommation dépassée">Date limite dépassée (DLC)</option>
                  <option value="Erreur de cuisson / Plat renvoyé">Erreur de cuisson / Plat renvoyé</option>
                  <option value="Rupture chaîne du froid">Rupture chaîne du froid</option>
                  <option value="Casse / Emballage endommagé">Casse / Emballage endommagé</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setWasteModalIng(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  declareStockLoss(wasteModalIng.id, wasteQty, wasteReason);
                  setWasteModalIng(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Confirmer Perte (-{wasteQty})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADJUST MODAL */}
      {adjustModalIng && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-stone-200 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Ajustement d'Inventaire : {adjustModalIng.name}
              </h3>
              <p className="text-xs text-stone-500">
                Stock enregistré actuel: {adjustModalIng.currentStock} {adjustModalIng.unit}
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Stock physique réellement compté ({adjustModalIng.unit}) :
              </label>
              <input
                type="number"
                step="any"
                value={adjustQty}
                onChange={(e) => setAdjustQty(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setAdjustModalIng(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  adjustStockDirectly(adjustModalIng.id, adjustQty, 'Comptage physique d\'inventaire');
                  setAdjustModalIng(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold"
              >
                Enregistrer Nouveau Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW INGREDIENT MODAL */}
      {isAddIngredientOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 border border-stone-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900">
                Ajouter une Nouvelle Matière Première
              </h3>
              <button
                onClick={() => setIsAddIngredientOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIngredientSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Nom de l'ingrédient / produit :
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Filet de Bœuf Aubrac"
                  value={newIngForm.name}
                  onChange={(e) => setNewIngForm({ ...newIngForm, name: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Catégorie :
                  </label>
                  <select
                    value={newIngForm.category}
                    onChange={(e) => setNewIngForm({ ...newIngForm, category: e.target.value as any })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="viandes">Viandes</option>
                    <option value="poissons">Poissons</option>
                    <option value="legumes">Légumes & Fruits</option>
                    <option value="produits_laitiers">Produits Laitiers</option>
                    <option value="epicerie">Épicerie</option>
                    <option value="boulangerie">Boulangerie</option>
                    <option value="boissons">Boissons & Bar</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Unité de mesure :
                  </label>
                  <select
                    value={newIngForm.unit}
                    onChange={(e) => setNewIngForm({ ...newIngForm, unit: e.target.value as any })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="cl">cl</option>
                    <option value="piece">pièce</option>
                    <option value="bouteille">bouteille</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Stock initial :
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newIngForm.currentStock}
                    onChange={(e) => setNewIngForm({ ...newIngForm, currentStock: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Seuil alerte :
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newIngForm.minThreshold}
                    onChange={(e) => setNewIngForm({ ...newIngForm, minThreshold: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Coût unitaire (F CFA) :
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newIngForm.costPerUnit}
                    onChange={(e) => setNewIngForm({ ...newIngForm, costPerUnit: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Fournisseur attitré :
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rungis Frais"
                  value={newIngForm.supplier}
                  onChange={(e) => setNewIngForm({ ...newIngForm, supplier: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddIngredientOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold shadow-md shadow-amber-500/20"
                >
                  Créer Ingrédient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPPLIER ORDER MODAL */}
      {isSupplierOrderOpen && (
        <SupplierOrderModal onClose={() => setIsSupplierOrderOpen(false)} />
      )}
    </div>
  );
};
