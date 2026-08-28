import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { ShoppingCart, Check, X, Printer, PackageCheck, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface SupplierOrderModalProps {
  onClose: () => void;
}

export const SupplierOrderModal: React.FC<SupplierOrderModalProps> = ({ onClose }) => {
  const { supplierOrders, markSupplierOrderReceived, restockIngredient, ingredients } = useRestaurant();

  // Get latest draft order or generate from low stock
  const latestOrder = supplierOrders[0];

  const handlePrint = () => {
    window.print();
  };

  const handleReceiveAll = () => {
    if (!latestOrder) return;
    markSupplierOrderReceived(latestOrder.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 border border-stone-200 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                Bon de Commande & Réapprovisionnement
              </h2>
              <p className="text-xs text-stone-500">
                Calcul automatique des quantités selon les seuils d'alerte et stocks optimaux.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!latestOrder || latestOrder.items.length === 0 ? (
          <div className="py-12 text-center text-stone-500 space-y-2">
            <PackageCheck className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-sm text-stone-800">Aucun ingrédient en alerte de stock</p>
            <p className="text-xs text-stone-400">
              Tous vos niveaux de matières premières sont actuellement au-dessus des seuils minimums.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Summary info */}
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-stone-400 block font-semibold text-[10px] uppercase">Référence Bon</span>
                <span className="font-bold font-mono text-stone-900">{latestOrder.id}</span>
              </div>
              <div>
                <span className="text-stone-400 block font-semibold text-[10px] uppercase">Articles à commander</span>
                <span className="font-bold text-stone-900">{latestOrder.items.length} lignes</span>
              </div>
              <div>
                <span className="text-stone-400 block font-semibold text-[10px] uppercase">Coût Estimé</span>
                <span className="font-extrabold text-amber-700 font-mono text-sm">{formatCurrency(latestOrder.totalEstimatedCost)}</span>
              </div>
            </div>

            {/* Items table */}
            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100/70 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Ingrédient</th>
                    <th className="py-2.5 px-3 text-center">Qté à Commander</th>
                    <th className="py-2.5 px-3 text-right">Coût Estimé</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {latestOrder.items.map((it) => (
                    <tr key={it.ingredientId} className="hover:bg-stone-50">
                      <td className="py-2.5 px-3 font-semibold text-stone-900">
                        {it.ingredientName}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-700">
                        +{it.quantityToOrder} {it.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-800">
                        {formatCurrency(it.estimatedCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="border-t border-stone-200 pt-3 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer Bon Fournisseur</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100"
            >
              Fermer
            </button>
            {latestOrder && latestOrder.items.length > 0 && (
              <button
                onClick={handleReceiveAll}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-colors"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Réceptionner Tout & Créditer Stocks</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
