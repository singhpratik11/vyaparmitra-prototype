import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CreditworthinessCard from './components/CreditworthinessCard';
import ActionCards from './components/ActionCards';
import BusinessFlowVisual from './components/BusinessFlowVisual';
import BusinessSnapshot from './components/BusinessSnapshot';
import RecentActivityTable from './components/RecentActivityTable';
import InvoicePage from './components/InvoicePage';
import GRNPage from './components/GRNPage';
import ComingSoonModal from './components/ComingSoonModal';
import { X } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleNavigate = (viewId) => {
    setCurrentView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriggerComingSoon = () => {
    setIsComingSoonOpen(true);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setIsComingSoonOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F6F9FB] text-[#172033] flex flex-col antialiased">
      {/* Top Banner indicating prototype mode */}
      <aside aria-label="Prototype environment notice" className="bg-[#123B78] text-white text-[11px] font-medium py-1.5 px-4 text-center select-none flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#10B8A5] inline-block animate-pulse"></span>
        <span>
          <strong>VyapaarMitra Executive Prototype:</strong> Frontend demonstration mode. No live banking, GST, or database integrations.
        </span>
      </aside>

      <div className="flex-1 flex w-full relative">
        {/* Desktop Sidebar (hidden on mobile, fixed width on md+) */}
        <div className="hidden md:block w-64 flex-shrink-0 h-screen sticky top-0 z-30">
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
          />
        </div>

        {/* Mobile Sidebar Overlay Drawer */}
        {isMobileNavOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden bg-slate-900/50 backdrop-blur-xs flex"
            onClick={() => setIsMobileNavOpen(false)}
          >
            <div
              className="w-72 max-w-[85vw] bg-white h-full shadow-2xl relative flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg text-[#526174] hover:bg-slate-100"
                aria-label="Close Navigation"
              >
                <X className="w-5 h-5" />
              </button>
              <Sidebar
                currentView={currentView}
                onNavigate={handleNavigate}
                onCloseMobile={() => setIsMobileNavOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            onOpenMobileNav={() => setIsMobileNavOpen(true)}
          />

          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6 md:space-y-8">
            {currentView === 'dashboard' && (
              <>
                {/* 1. CREDITWORTHINESS CARD (Most Important Visual Element) */}
                <section aria-label="Creditworthiness Overview">
                  <CreditworthinessCard />
                </section>

                {/* 2. THREE PRIMARY ACTION CARDS */}
                <section aria-label="Core Actions">
                  <ActionCards
                    onNavigate={handleNavigate}
                    onTriggerComingSoon={handleTriggerComingSoon}
                  />
                </section>

                {/* 3. BUSINESS RECORD VISUAL (Connected Flow) */}
                <section aria-label="Platform Architecture Logic">
                  <BusinessFlowVisual />
                </section>

                {/* 4. BUSINESS SNAPSHOT (Mock Data) */}
                <section aria-label="Business Metrics Snapshot">
                  <BusinessSnapshot />
                </section>

                {/* 5. RECENT BUSINESS ACTIVITY TABLE */}
                <section aria-label="Recent Transactions Activity">
                  <RecentActivityTable
                    onTriggerComingSoon={handleTriggerComingSoon}
                  />
                </section>
              </>
            )}

            {currentView === 'create-invoice' && (
              <InvoicePage
                onBackToDashboard={handleBackToDashboard}
                onTriggerComingSoon={handleTriggerComingSoon}
              />
            )}

            {currentView === 'create-grn' && (
              <GRNPage
                onBackToDashboard={handleBackToDashboard}
                onTriggerComingSoon={handleTriggerComingSoon}
              />
            )}
          </main>

          {/* Footer note */}
          <footer className="py-6 px-6 text-center text-xs text-[#526174] border-t border-slate-200/60 bg-white/50">
            <p>© 2026 VyapaarMitra Technologies. Prototype version for Product Management presentation.</p>
            <p className="mt-1 text-[11px] text-[#526174]/80">
              Tagline: <span className="font-semibold text-[#123B78]">BUSINESS TOGETHER FOR A BRIGHTER TOMORROW</span>
            </p>
          </footer>
        </div>
      </div>

      {/* Global Coming Soon Modal */}
      <ComingSoonModal
        isOpen={isComingSoonOpen}
        onClose={() => setIsComingSoonOpen(false)}
        onBackToDashboard={handleBackToDashboard}
      />
    </div>
  );
}
