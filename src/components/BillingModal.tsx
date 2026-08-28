import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { RestaurantOrder, RestaurantTable } from '../types';
import { 
  Receipt, 
  CreditCard, 
  Banknote, 
  Ticket, 
  Split, 
  Printer, 
  CheckCircle, 
  X, 
  Percent, 
  Plus, 
  Minus,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency } from '../utils/currency';

interface BillingModalProps {
  order: RestaurantOrder;
  table: RestaurantTable;
  onClose: () => void;
}

export const BillingModal: React.FC<BillingModalProps> = ({ order, table, onClose }) => {
  const { checkoutAndPayOrder } = useRestaurant();

  const [paymentMethod, setPaymentMethod] = useState<'cb' | 'especes' | 'ticket_resto' | 'cheque' | 'divise'>('cb');
  const [splitCount, setSplitCount] = useState<number>(order.guestCount || 2);
  const [cashReceived, setCashReceived] = useState<number>(order.totalAmount);
  const [tipPercent, setTipPercent] = useState<number>(0);
  const [isReceiptView, setIsReceiptView] = useState<boolean>(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState<boolean>(false);

  const subtotal = order.totalAmount;
  const tipAmount = (subtotal * tipPercent) / 100;
  const grandTotal = subtotal + tipAmount;
  const splitAmount = grandTotal / Math.max(1, splitCount);
  const cashChange = Math.max(0, cashReceived - grandTotal);

  // TVA calculation breakdown
  const tva10 = Number((subtotal * 0.0909).toFixed(2)); // ~10% TTC equivalent
  const totalHT = Number((subtotal - tva10).toFixed(2));

  const handleConfirmPayment = () => {
    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // Ignore
    }

    checkoutAndPayOrder(order.id, paymentMethod);
    setIsPaidSuccess(true);

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 border border-stone-200 shadow-2xl space-y-4 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                Encaissement & Addition • {table.name}
              </h2>
              <p className="text-xs text-stone-500">
                Commande #{order.orderNumber} • Serveur: {order.serverName} • {order.guestCount} couverts
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isPaidSuccess ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-stone-900">Addition Encaissée avec Succès !</h3>
            <p className="text-xs text-stone-500">
              Montant de {formatCurrency(grandTotal)} validé. La table {table.name} est maintenant libérée.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* View Switch: Fast POS Checkout vs Stylized Thermal Receipt */}
            <div className="flex items-center justify-center gap-2 bg-stone-100 p-1 rounded-xl text-xs font-semibold max-w-xs mx-auto">
              <button
                onClick={() => setIsReceiptView(false)}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  !isReceiptView ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                }`}
              >
                Encaissement
              </button>
              <button
                onClick={() => setIsReceiptView(true)}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  isReceiptView ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                }`}
              >
                Aperçu Ticket Caisse
              </button>
            </div>

            {!isReceiptView ? (
              /* STANDARD POS CHECKOUT */
              <div className="space-y-4">
                {/* Grand Total & Split Summary */}
                <div className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-md">
                  <div>
                    <span className="text-stone-400 text-xs uppercase tracking-wider block font-semibold">
                      Total à Encaisser
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>

                  {splitCount > 1 && (
                    <div className="text-right bg-stone-800/80 px-3.5 py-2 rounded-xl border border-stone-700">
                      <span className="text-[10px] text-stone-400 block font-semibold">
                        Par personne ({splitCount} parts)
                      </span>
                      <span className="text-base font-extrabold text-emerald-400 font-mono">
                        {formatCurrency(splitAmount)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Split Bill Controls */}
                <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Split className="w-4 h-4 text-stone-500" />
                    <span className="font-bold text-stone-800">Partager l'addition :</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-stone-300 flex items-center justify-center text-stone-700 font-bold hover:bg-stone-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold text-sm px-2 text-stone-900">
                      {splitCount} pers.
                    </span>
                    <button
                      onClick={() => setSplitCount(splitCount + 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-stone-300 flex items-center justify-center text-stone-700 font-bold hover:bg-stone-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Pourboire / Tips */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-stone-700">Pourboire service :</span>
                  <div className="flex gap-1.5">
                    {[0, 5, 10, 15].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setTipPercent(pct)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          tipPercent === pct
                            ? 'bg-amber-600 text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {pct === 0 ? '0%' : `+${pct}% (${formatCurrency((subtotal * pct) / 100)})`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-2">
                    Mode de Règlement :
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'cb', label: 'Carte Bancaire', icon: CreditCard },
                      { id: 'especes', label: 'Espèces', icon: Banknote },
                      { id: 'ticket_resto', label: 'Titre Resto', icon: Ticket },
                      { id: 'divise', label: 'Mixte / Divisé', icon: Split },
                    ].map((m) => {
                      const Icon = m.icon;
                      const isSelected = paymentMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cash Change Calculator if Cash selected */}
                {paymentMethod === 'especes' && (
                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-700">Espèces reçues du client :</span>
                      <input
                        type="number"
                        step="100"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                        className="w-28 text-right p-1.5 bg-white border border-stone-300 rounded-lg font-mono font-bold text-sm"
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm font-bold border-t border-stone-200 pt-2">
                      <span className="text-stone-600">Monnaie à rendre :</span>
                      <span className="font-mono text-base text-emerald-700 font-black">
                        {formatCurrency(cashChange)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* THERMAL RECEIPT PREVIEW */
              <div className="bg-stone-100 p-4 rounded-2xl flex justify-center">
                <div className="bg-white p-5 rounded-md shadow-md border border-stone-300 w-full max-w-sm text-stone-900 font-mono text-[11px] space-y-3">
                  <div className="text-center space-y-0.5 border-b border-stone-300 pb-2">
                    <h3 className="font-bold text-sm uppercase tracking-wider">TRIOMPHERESTO</h3>
                    <p className="text-[10px] text-stone-500">14 Rue de la Gastronomie, 75001 Paris</p>
                    <p className="text-[10px] text-stone-500">SIRET: 851 742 486 00012 • TVA: FR45851742486</p>
                    <p className="text-[10px] font-bold text-stone-700 mt-1">TICKET D'ADDITION #{order.orderNumber}</p>
                    <p className="text-[10px] text-stone-500">
                      {new Date().toLocaleDateString('fr-FR')} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {table.name}
                    </p>
                  </div>

                  <div className="divide-y divide-dashed divide-stone-200 space-y-1.5">
                    {order.items.map((it) => (
                      <div key={it.id} className="pt-1.5 first:pt-0 flex justify-between">
                        <span>
                          {it.quantity}x {it.menuItemName}
                        </span>
                        <span className="font-bold">{formatCurrency(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-dashed border-stone-300 pt-2 space-y-1 text-xs">
                    <div className="flex justify-between text-stone-500">
                      <span>Total HT</span>
                      <span>{formatCurrency(totalHT)}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>TVA (10%)</span>
                      <span>{formatCurrency(tva10)}</span>
                    </div>
                    {tipAmount > 0 && (
                      <div className="flex justify-between text-stone-500">
                        <span>Pourboire</span>
                        <span>{formatCurrency(tipAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-sm text-stone-950 pt-1 border-t border-stone-400">
                      <span>TOTAL TTC</span>
                      <span>{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>

                  <div className="text-center pt-3 border-t border-dashed border-stone-300 text-[10px] text-stone-500 space-y-1">
                    <p>Règlement : {paymentMethod.toUpperCase()}</p>
                    <p className="font-semibold">Merci de votre visite et à très bientôt !</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        {!isPaidSuccess && (
          <div className="border-t border-stone-200 pt-3 flex items-center justify-between gap-3">
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100"
              >
                Annuler
              </button>
              <button
                id="btn-confirm-checkout"
                onClick={handleConfirmPayment}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Valider Encaissement ({formatCurrency(grandTotal)})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
