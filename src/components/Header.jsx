import React from 'react';
import { 
  Menu, 
  Calendar, 
  Sparkles, 
  PanelLeftClose, 
  PanelLeftOpen,
  Users 
} from 'lucide-react';
import Logo from './Logo';
import { activeCustomer } from '../data/database.js';

export default function Header({ 
  onOpenMobileNav, 
  isSidebarCollapsed, 
  onToggleSidebar,
  currentView,
  actorId,
  actors = [],
  onActorChange 
}) {
  const currentDateStr = "19 Sep 2026";

  const getSubtext = () => {
    switch (currentView) {
      case 'home':
        return 'Your simplified business hub.';
      case 'dashboard':
        return 'Detailed financial ledger & metrics.';
      case 'create-invoice':
        return 'Sales & compliant billing entry.';
      case 'create-grn':
        return 'Inward goods receipt reconciliation.';
      default:
        return 'Your business at a glance.';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/80 px-4 md:px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 sticky top-0 z-20">
      {/* Left side: Sidebar toggles, Mobile trigger & Greeting */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 rounded-lg text-[#526174] hover:bg-slate-100 focus:outline-hidden"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle in Header */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex p-2 rounded-xl text-[#526174] hover:bg-slate-100 hover:text-[#123B78] transition-colors focus:outline-hidden"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Mobile-only logo */}
        <div className="md:hidden">
          <Logo size="small" />
        </div>

        <div>
          <h1 className="text-lg md:text-xl font-bold text-[#172033] tracking-tight">
            Good morning, <span className="text-[#123B78]">{activeCustomer.name}</span>
          </h1>
          <p className="text-xs text-[#526174] font-medium">
            {getSubtext()}
          </p>
        </div>
      </div>

      {/* Right side: Date & Prototype Status */}
      <div className="flex items-center gap-2.5 self-start md:self-auto">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#F6F9FB] rounded-lg border border-slate-200/70 text-xs font-medium text-[#526174]">
          <Calendar className="w-3.5 h-3.5 text-[#1265A8]" />
          <span>{currentDateStr}</span>
        </div>

        {/* Simulated sign-in — segregation of duties only, no real auth */}
        {onActorChange && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#F6F9FB] rounded-lg border border-slate-200/70 text-xs font-medium text-[#526174]">
            <Users className="w-3.5 h-3.5 text-[#1265A8]" />
            <select
              value={actorId}
              onChange={(e) => onActorChange(e.target.value)}
              aria-label="Simulated role"
              title="Simulated sign-in — no real authentication"
              className="bg-transparent text-xs font-medium text-[#526174] focus:outline-hidden"
            >
              {actors.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Prototype Indicator Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F7F3] border border-[#10B8A5]/30 rounded-lg text-xs font-semibold text-[#123B78]">
          <Sparkles className="w-3.5 h-3.5 text-[#10B8A5]" />
          <span>Frontend Prototype</span>
        </div>
      </div>
    </header>
  );
}
