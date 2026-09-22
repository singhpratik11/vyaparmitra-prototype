import React, { useState } from 'react';
import CreditworthinessCard from './CreditworthinessCard';
import BusinessSnapshot from './BusinessSnapshot';
import RecentActivityTable from './RecentActivityTable';
import ShareProfileModal from './ShareProfileModal';
import ReadinessActions from './ReadinessActions';
import { ArrowLeft, FilePlus2, PackagePlus, Sparkles, ShieldCheck } from 'lucide-react';
import { useAppState } from '../context/AppStateContext.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { canAccess } from '../data/roles.js';

const DECISION_STYLES = {
  Approve: 'bg-[#E8F7F3] text-[#123B78] border-[#10B8A5]/30',
  'Make offer': 'bg-blue-50 text-[#1265A8] border-blue-200',
  Decline: 'bg-amber-50 text-amber-800 border-amber-200',
};

export default function DashboardPage({ onNavigate, onTriggerComingSoon }) {
  const { profileShared, lenderDecision, setProfileShared } = useAppState();
  const { role } = useSession();
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {/* Dashboard Header with Navigation & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#526174] hover:text-[#123B78]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-[#1265A8]">Financial Center</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-[#172033] tracking-tight">
            Business Dashboard
          </h1>
          <p className="text-xs md:text-sm text-[#526174] mt-0.5">
            Track your business activity, receivables, and verified financial record.
          </p>

          {profileShared && (
            <span
              className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                lenderDecision
                  ? DECISION_STYLES[lenderDecision]
                  : 'bg-slate-100 text-[#526174] border-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {lenderDecision
                  ? `Lending partner decision: ${lenderDecision}`
                  : 'Profile shared — awaiting partner decision'}
              </span>
            </span>
          )}
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {canAccess(role, 'create-invoice') && (
            <button
              type="button"
              onClick={() => onNavigate('create-invoice')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-[#123B78] hover:bg-slate-50 text-xs font-bold shadow-2xs transition-colors"
            >
              <FilePlus2 className="w-4 h-4 text-[#10B8A5]" />
              <span>+ Invoice</span>
            </button>
          )}

          {canAccess(role, 'create-grn') && (
            <button
              type="button"
              onClick={() => onNavigate('create-grn')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-[#123B78] hover:bg-slate-50 text-xs font-bold shadow-2xs transition-colors"
            >
              <PackagePlus className="w-4 h-4 text-[#1265A8]" />
              <span>+ GRN</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-[#123B78] hover:bg-slate-50 text-xs font-bold shadow-2xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-[#10B8A5]" />
            <span>Check Credit Eligibility</span>
          </button>
        </div>
      </div>

      {/* 1. Creditworthiness Card */}
      <section aria-label="Business Creditworthiness">
        <CreditworthinessCard />
      </section>

      {/* 2. Act on the readiness profile */}
      <section aria-label="Readiness Actions">
        <ReadinessActions onShare={() => setIsShareOpen(true)} />
      </section>

      {/* 3. Business Snapshot Metrics */}
      <section aria-label="Business Metrics Snapshot">
        <BusinessSnapshot />
      </section>

      {/* 4. Recent Business Activity Ledger */}
      <section aria-label="Recent Transactions Activity">
        <RecentActivityTable onTriggerComingSoon={onTriggerComingSoon} />
      </section>

      {/* Consent before anything is shared with a lending partner */}
      <ShareProfileModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onConfirm={() => {
          setProfileShared(true);
          setIsShareOpen(false);
        }}
      />
    </div>
  );
}
