import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { RestaurantTable, TableZone, TableStatus, RESTAURANT_SERVERS } from '../types';
import { 
  Users, 
  Clock, 
  Receipt, 
  Plus, 
  CheckCircle, 
  LayoutGrid, 
  Coffee, 
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { BillingModal } from './BillingModal';
import { formatCurrency } from '../utils/currency';

export const TablePlan: React.FC = () => {
  const {
    tables,
    orders,
    selectedTableId,
    setSelectedTableId,
    setActiveTab,
    occupyTable,
    releaseTable,
    getActiveOrderByTableId,
  } = useRestaurant();

  const [selectedZone, setSelectedZone] = useState<TableZone | 'all'>('all');
  const [openModalTable, setOpenModalTable] = useState<RestaurantTable | null>(null);
  const [guestCountInput, setGuestCountInput] = useState(2);
  const [serverNameInput, setServerNameInput] = useState<string>(RESTAURANT_SERVERS[0]);
  const [billingTable, setBillingTable] = useState<RestaurantTable | null>(null);

  const zones: (TableZone | 'all')[] = [
    'all',
    'Salle Principale',
    'Terrasse Extérieure',
    'Espace Bar',
    'Mezzanine VIP',
  ];

  const filteredTables = tables.filter(
    (t) => selectedZone === 'all' || t.zone === selectedZone
  );

  // Quick stats
  const totalCapacity = tables.reduce((acc, t) => acc + t.capacity, 0);
  const occupiedCount = tables.filter((t) => t.status === 'occupee' || t.status === 'addition').length;
  const currentGuests = tables.reduce((acc, t) => acc + (t.guestCount || 0), 0);
  const occupancyRate = Math.round((occupiedCount / tables.length) * 100);

  const handleTableClick = (table: RestaurantTable) => {
    setSelectedTableId(table.id);
    if (table.status === 'libre') {
      setOpenModalTable(table);
      setGuestCountInput(table.capacity);
    } else {
      setActiveTab('prise_commande');
    }
  };

  const handleConfirmOpenTable = () => {
    if (!openModalTable) return;
    occupyTable(openModalTable.id, guestCountInput, serverNameInput);
    setSelectedTableId(openModalTable.id);
    setOpenModalTable(null);
    setActiveTab('prise_commande');
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Room Overview */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-amber-600" />
            Plan de Salle & Tables en Direct
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Suivi visuel de l'occupation, des couverts en cours et des additions.
          </p>
        </div>

        {/* Live occupancy gauges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-center">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Taux d'occupation</span>
            <span className="text-sm font-extrabold text-stone-900 font-mono">{occupancyRate}%</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-center">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Couverts en salle</span>
            <span className="text-sm font-extrabold text-amber-700 font-mono">{currentGuests} / {totalCapacity}</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-center">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Tables actives</span>
            <span className="text-sm font-extrabold text-stone-900 font-mono">{occupiedCount} / {tables.length}</span>
          </div>
        </div>
      </div>

      {/* Zone filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {zones.map((z) => (
          <button
            key={z}
            onClick={() => setSelectedZone(z)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedZone === z
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {z === 'all' ? 'Toutes les Zones' : z}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const activeOrder = getActiveOrderByTableId(table.id);
          const isSelected = selectedTableId === table.id;

          let statusColor = 'border-emerald-200 bg-emerald-50/40 text-emerald-800';
          let badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
          let statusLabel = 'Libre';

          if (table.status === 'occupee') {
            statusColor = 'border-amber-300 bg-amber-50/50 text-amber-900 shadow-xs';
            badgeBg = 'bg-amber-100 text-amber-900 border-amber-300';
            statusLabel = 'Occupée';
          } else if (table.status === 'addition') {
            statusColor = 'border-rose-300 bg-rose-50/50 text-rose-900';
            badgeBg = 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse';
            statusLabel = 'Addition demandée';
          } else if (table.status === 'reservee') {
            statusColor = 'border-stone-200 bg-stone-100 text-stone-700';
            badgeBg = 'bg-stone-200 text-stone-700 border-stone-300';
            statusLabel = 'Réservée';
          }

          return (
            <div
              key={table.id}
              onClick={() => handleTableClick(table)}
              className={`rounded-2xl p-4 border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[170px] ${statusColor} ${
                isSelected ? 'ring-2 ring-amber-500 scale-[1.01]' : 'hover:shadow-md'
              }`}
            >
              {/* Card Top */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-white/80 border border-stone-200 flex items-center justify-center font-bold text-sm text-stone-900 shadow-xs">
                      {table.number}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">{table.name}</h3>
                      <span className="text-[11px] text-stone-500">{table.zone}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${badgeBg}`}>
                    {statusLabel}
                  </span>
                </div>

                {/* Table details when occupied */}
                {table.status === 'occupee' || table.status === 'addition' ? (
                  <div className="mt-3 space-y-1.5 text-xs text-stone-700 bg-white/80 rounded-xl p-2.5 border border-stone-200/80">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-stone-500">
                        <Users className="w-3.5 h-3.5 text-stone-400" /> Couverts :
                      </span>
                      <strong className="font-mono">{table.guestCount || table.capacity} pers.</strong>
                    </div>

                    {activeOrder && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-stone-500">
                          <Receipt className="w-3.5 h-3.5 text-stone-400" /> Total :
                        </span>
                        <strong className="font-mono text-amber-700 font-extrabold">
                          {formatCurrency(activeOrder.totalAmount)}
                        </strong>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-0.5">
                      <span>Serveur :</span>
                      <span>{table.serverName || 'Service'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-center py-3 bg-white/50 rounded-xl border border-stone-200/60 text-xs text-stone-500">
                    <Users className="w-4 h-4 mx-auto mb-1 text-stone-400" />
                    Capacité : {table.capacity} personnes
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between gap-1 text-xs">
                {table.status === 'libre' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenModalTable(table);
                    }}
                    className="w-full py-1.5 px-2 bg-stone-900 hover:bg-amber-600 text-white rounded-lg font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ouvrir Table
                  </button>
                ) : (
                  <div className="w-full flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTableId(table.id);
                        setActiveTab('prise_commande');
                      }}
                      className="flex-1 py-1.5 px-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors text-[11px]"
                    >
                      <span>Commander</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    {activeOrder && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBillingTable(table);
                        }}
                        className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center justify-center transition-colors text-[11px]"
                        title="Encaisser l'addition"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* OPEN TABLE MODAL */}
      {openModalTable && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-stone-200 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Ouvrir la table : {openModalTable.name}
              </h3>
              <p className="text-xs text-stone-500">
                {openModalTable.zone} • Capacité max {openModalTable.capacity} personnes
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Nombre de couverts installés :
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5, 6, 8].map((num) => (
                    <button
                      key={num}
                      onClick={() => setGuestCountInput(num)}
                      className={`w-9 h-9 rounded-lg text-xs font-bold font-mono transition-colors ${
                        guestCountInput === num
                          ? 'bg-amber-500 text-stone-950 shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Serveur responsable :
                </label>
                <select
                  value={serverNameInput}
                  onChange={(e) => setServerNameInput(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium text-stone-800"
                >
                  <option value="Man">1er Serveur — Man</option>
                  <option value="Women">2ème Serveur — Women</option>
                  <option value="Boy">3ème Serveur — Boy</option>
                  <option value="Girl">4ème Serveur — Girl</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setOpenModalTable(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmOpenTable}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold shadow-md shadow-amber-500/20"
              >
                Valider & Commander
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BILLING MODAL */}
      {billingTable && getActiveOrderByTableId(billingTable.id) && (
        <BillingModal
          order={getActiveOrderByTableId(billingTable.id)!}
          table={billingTable}
          onClose={() => setBillingTable(null)}
        />
      )}
    </div>
  );
};
