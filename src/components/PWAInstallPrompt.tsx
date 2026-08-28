import React, { useState } from 'react';
import { 
  Download, 
  WifiOff, 
  RefreshCw, 
  X, 
  Share, 
  PlusSquare, 
  Smartphone, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export const PWAInstallPrompt: React.FC = () => {
  const {
    isInstallable,
    isInstalled,
    isStandalone,
    isOffline,
    isIOS,
    showIOSPrompt,
    setShowIOSPrompt,
    promptInstall,
    updateAvailable,
    updateApp,
  } = usePWA();

  const [dismissedBanner, setDismissedBanner] = useState(false);

  return (
    <>
      {/* 1. Offline Indicator Banner */}
      {isOffline && (
        <div
          id="pwa-offline-banner"
          className="bg-amber-900/90 text-amber-100 px-4 py-2 text-xs flex items-center justify-between border-b border-amber-700/60 sticky top-0 z-50 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <WifiOff className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
            <span className="font-semibold">
              Mode Hors-Ligne (PWA) :
            </span>
            <span className="text-amber-200 hidden sm:inline">
              Connexion réseau interrompue. Les commandes, tables et stocks restent consultables et modifiables localement.
            </span>
            <span className="text-amber-200 sm:hidden">
              Données et commandes actives sauvegardées localement.
            </span>
          </div>
        </div>
      )}

      {/* 2. New Version Update Notification */}
      {updateAvailable && (
        <div
          id="pwa-update-banner"
          className="bg-emerald-900/90 text-emerald-100 px-4 py-2.5 text-xs flex items-center justify-between border-b border-emerald-700 sticky top-0 z-50 shadow-md backdrop-blur-sm"
        >
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-300 animate-spin" />
              <span>Une nouvelle version de <strong>TriompheResto</strong> est disponible.</span>
            </div>
            <button
              onClick={updateApp}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-lg transition-colors cursor-pointer"
            >
              Mettre à jour
            </button>
          </div>
        </div>
      )}

      {/* 3. Floating Quick-Install Banner (visible if installable and not in standalone mode) */}
      {(isInstallable || (isIOS && !isStandalone)) && !dismissedBanner && !isInstalled && (
        <div
          id="pwa-floating-install-banner"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-stone-900/95 text-stone-100 border border-amber-500/40 rounded-2xl shadow-2xl p-4 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shrink-0 shadow-lg shadow-amber-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-sm text-white">Installer TriompheResto</h4>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">PWA</span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">
                Installez l'application sur votre écran d'accueil pour une utilisation plein écran rapide en salle ou cuisine.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  id="btn-pwa-install-confirm"
                  onClick={promptInstall}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Installer l'application
                </button>
                <button
                  onClick={() => setDismissedBanner(true)}
                  className="px-2.5 py-1.5 text-stone-400 hover:text-white text-xs transition-colors rounded-lg cursor-pointer"
                >
                  Plus tard
                </button>
              </div>
            </div>
            <button
              onClick={() => setDismissedBanner(true)}
              className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. iOS Installation Modal Guide */}
      {showIOSPrompt && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-sm w-full p-6 text-stone-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Installer sur iOS Safari</h3>
                  <span className="text-[10px] text-amber-400 font-semibold uppercase">Ajouter à l'écran d'accueil</span>
                </div>
              </div>
              <button
                onClick={() => setShowIOSPrompt(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-300">
              <div className="flex items-start gap-3 p-3 bg-stone-800/80 rounded-xl border border-stone-700">
                <div className="p-1.5 bg-stone-700 rounded-lg text-amber-400 shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">1. Touchez le bouton Partager</p>
                  <p className="text-stone-400 text-[11px]">En bas de l'écran dans la barre d'outils de Safari.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-stone-800/80 rounded-xl border border-stone-700">
                <div className="p-1.5 bg-stone-700 rounded-lg text-amber-400 shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">2. Sélectionnez "Sur l'écran d'accueil"</p>
                  <p className="text-stone-400 text-[11px]">Faites défiler le menu puis choisissez l'icône TriompheResto.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-stone-800/80 rounded-xl border border-stone-700">
                <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">3. Profitez de l'application native</p>
                  <p className="text-stone-400 text-[11px]">Lancement plein écran sans barre d'adresse, ultra rapide.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSPrompt(false)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};
