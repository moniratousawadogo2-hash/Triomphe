import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { MenuItem, MenuCategory, RecipeItem } from '../types';
import { 
  UtensilsCrossed, 
  DollarSign, 
  Percent, 
  AlertCircle, 
  Plus, 
  Edit, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  Check, 
  X,
  PieChart,
  Scale
} from 'lucide-react';
import { formatCurrency, formatUnitCost } from '../utils/currency';

export const MenuRecipes: React.FC = () => {
  const {
    menuItems,
    ingredients,
    calculateDishCost,
    calculateDishMaxPortions,
    toggleMenuItemStatus,
    updateMenuItem,
    createMenuItem,
  } = useRestaurant();

  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'all'>('all');
  const [activeRecipeDish, setActiveRecipeDish] = useState<MenuItem | null>(menuItems[2] || menuItems[0]); // default to Entrecôte
  const [isEditingRecipe, setIsEditingRecipe] = useState(false);

  const categories: { id: MenuCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'Tous les Plats' },
    { id: 'burgers', label: 'Burgers Gourmet' },
    { id: 'entrees', label: 'Entrées' },
    { id: 'plats', label: 'Plats Chauds' },
    { id: 'desserts', label: 'Desserts' },
    { id: 'boissons', label: 'Cocktails & Boissons' },
    { id: 'vins', label: 'Vins' },
  ];

  const filteredDishes = menuItems.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-amber-600" />
            Fiches Techniques & Ingénierie du Menu (Food Cost)
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Calcul automatique des coûts matière, marges brutes, allergènes et déduction d'ingrédients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
            <span className="text-stone-400 block text-[10px] uppercase font-bold">Food Cost Moyen Cible</span>
            <span className="text-stone-900 font-extrabold font-mono">25% - 30%</span>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === c.id
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Left Dish list, Right Recipe Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Dish Cards List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
          {filteredDishes.map((dish) => {
            const { cost, marginRatio, foodCostPercent } = calculateDishCost(dish);
            const { maxPortions } = calculateDishMaxPortions(dish);
            const isSelected = activeRecipeDish?.id === dish.id;

            return (
              <div
                key={dish.id}
                onClick={() => setActiveRecipeDish(dish)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-50/70 border-amber-400 shadow-sm ring-1 ring-amber-400/50'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                      {dish.category}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900 leading-tight">
                      {dish.name}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-black font-mono text-stone-900">
                      {formatCurrency(dish.price)}
                    </span>
                  </div>
                </div>

                {/* Metrics bar */}
                <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500">
                      Coût Matière : <strong className="font-mono text-stone-900">{formatCurrency(cost)}</strong>
                    </span>
                    <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                      foodCostPercent > 35
                        ? 'bg-rose-100 text-rose-800'
                        : foodCostPercent > 28
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {foodCostPercent}%
                    </span>
                  </div>

                  <span className="text-[10px] font-semibold text-stone-500">
                    Dispo stock : <strong className="text-stone-800 font-mono">{maxPortions}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Deep Technical Recipe Sheet */}
        <div className="lg:col-span-7">
          {activeRecipeDish ? (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-5">
              {/* Dish Header in Sheet */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                      {activeRecipeDish.category}
                    </span>
                    {activeRecipeDish.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                        ★ {activeRecipeDish.badge}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-stone-900 mt-1">
                    {activeRecipeDish.name}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {activeRecipeDish.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMenuItemStatus(activeRecipeDish.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                      activeRecipeDish.isManuallyDisabled
                        ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {activeRecipeDish.isManuallyDisabled ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Désactivé en salle</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Actif en salle</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Economic Financial Indicators */}
              {(() => {
                const { cost, marginRatio, foodCostPercent } = calculateDishCost(activeRecipeDish);
                const priceHT = activeRecipeDish.price / (1 + activeRecipeDish.tva / 100);
                const grossMargin = priceHT - cost;

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 rounded-2xl p-4 border border-stone-200/80">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Prix de Vente</span>
                      <span className="text-base font-extrabold text-stone-900 font-mono">
                        {formatCurrency(activeRecipeDish.price)} <span className="text-[10px] text-stone-400 font-normal">TTC</span>
                      </span>
                      <span className="text-[10px] text-stone-500 block">({formatCurrency(priceHT)} HT)</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Coût Matière</span>
                      <span className="text-base font-extrabold text-stone-900 font-mono">
                        {formatCurrency(cost)}
                      </span>
                      <span className="text-[10px] text-stone-500 block">Somme ingrédients</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Ratio Matière</span>
                      <span className={`text-base font-extrabold font-mono ${
                        foodCostPercent > 32 ? 'text-rose-600' : 'text-emerald-700'
                      }`}>
                        {foodCostPercent}%
                      </span>
                      <span className="text-[10px] text-stone-500 block">Objectif &lt; 30%</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Marge Brute HT</span>
                      <span className="text-base font-extrabold text-amber-700 font-mono">
                        {formatCurrency(grossMargin)}
                      </span>
                      <span className="text-[10px] text-stone-500 block">Coeff: x{marginRatio}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Recipe Ingredients Technical Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-600" />
                    Composition Technique (Fiche Ingrédients par Portion)
                  </h3>
                  <span className="text-[11px] text-stone-500">
                    Déduit automatiquement à chaque commande
                  </span>
                </div>

                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100/80 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Ingrédient</th>
                        <th className="py-2.5 px-3">Quantité / Portion</th>
                        <th className="py-2.5 px-3">Coût Unitaire</th>
                        <th className="py-2.5 px-3 text-right">Coût Ligne</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {activeRecipeDish.recipe.map((r, idx) => {
                        const ing = ingredients.find((i) => i.id === r.ingredientId);
                        const lineCost = (ing?.costPerUnit || 0) * r.quantity;

                        return (
                          <tr key={idx} className="hover:bg-stone-50">
                            <td className="py-2.5 px-3 font-semibold text-stone-900">
                              {r.ingredientName}
                              {ing && (
                                <span className="text-[10px] text-stone-400 block">
                                  Stock actuel: {ing.currentStock} {ing.unit}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-amber-800">
                              {r.quantity} {r.unit}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-stone-600">
                              {ing ? formatUnitCost(ing.costPerUnit, ing.unit) : '---'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                              {formatCurrency(lineCost)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Allergens & Prep Time */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-700">Allergènes déclarés :</span>
                  {activeRecipeDish.allergens.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {activeRecipeDish.allergens.map((all) => (
                        <span key={all} className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-semibold">
                          {all}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-stone-400">Aucun allergène majeur</span>
                  )}
                </div>

                <div className="text-stone-500">
                  Temps prépa moyen : <strong className="text-stone-800">{activeRecipeDish.prepTimeMinutes} min</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400">
              Sélectionnez un plat à gauche pour visualiser sa fiche technique.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
