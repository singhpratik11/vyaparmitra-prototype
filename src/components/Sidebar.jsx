import React from 'react';
import { 
  Home, 
  LayoutDashboard, 
  FilePlus2, 
  PackagePlus, 
  Building2, 
  CheckCircle2, 
  PanelLeftClose, 
  PanelLeftOpen,
  ChevronRight,
  CalendarClock
} from 'lucide-react';
import Logo from './Logo';
import { activeCustomer } from '../data/database.js';
import { useAppState, isUnpaid, getDueBucket } from '../context/AppStateContext.jsx';

export default function Sidebar({ 
  currentView, 
  allowedViews, 
  role, 
  onNavigate, 
  onCloseMobile, 
  isCollapsed = false, 
  onToggleCollapse 
}) {
  const { records } = useAppState();

  // Only what this role actually works: warehouse clerks see payables alone.
  const overdueCount = records.filter((record) => {
    if (!isUnpaid(record) || getDueBucket(record) !== 'Overdue') return false;
    if (role === 'Warehouse Clerk') return record.type === 'Purchase';
    return true;
  }).length;

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      description: 'Welcome & Core Actions',
    },
    {
      id: 'dashboard',
      label: 'Business Dashboard',
      icon: LayoutDashboard,
      description: 'Financial Metrics & Ledger',
    },
    {
      id: 'worklist',
      label: 'Payment Worklist',
      icon: CalendarClock,
      description: 'Unpaid Records by Due Date',
      badge: overdueCount ? `${overdueCount} overdue` : null,
    },
    {
      id: 'create-invoice',
      label: 'Create Invoice',
      icon: FilePlus2,
      description: 'Record Sale & Generate Bill',
    },
    {
      id: 'create-grn',
      label: 'Create GRN',
      icon: PackagePlus,
      description: 'Record Goods Received',
    },
  ];

  const visibleNavItems = allowedViews
    ? navItems.filter((item) => allowedViews.includes(item.id))
    : navItems;

  const handleNavClick = (id) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside 
      className={`bg-white border-r border-slate-200/80 flex flex-col justify-between h-full select-none transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Section: Logo & Navigation */}
      <div>
        {/* Logo Container with Collapse Toggle */}
        <div className={`border-b border-slate-100 flex items-center justify-between ${
          isCollapsed ? 'p-4 flex-col gap-3' : 'px-5 py-5'
        }`}>
          {isCollapsed ? (
            <button 
              onClick={() => handleNavClick('home')}
              title="VyaparMitra Home"
              className="focus:outline-hidden"
            >
              <Logo size="icon" />
            </button>
          ) : (
            <button 
              onClick={() => handleNavClick('home')}
              className="text-left focus:outline-hidden"
            >
              <Logo size="default" />
            </button>
          )}

          {/* Desktop Collapse / Expand Button */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg text-[#526174] hover:bg-slate-100 hover:text-[#123B78] transition-colors focus:outline-hidden"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-5 h-5" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className={`space-y-1.5 ${isCollapsed ? 'p-2' : 'p-3.5'}`} aria-label="Primary Navigation">
          {!isCollapsed && (
            <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-[#526174] uppercase tracking-wider">
              Navigation
            </div>
          )}

          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-xl font-medium text-sm transition-all duration-150 text-left ${
                    isCollapsed 
                      ? 'justify-center p-3' 
                      : 'justify-between px-3.5 py-2.5'
                  } ${
                    isActive
                      ? 'bg-[#E8F7F3] text-[#123B78] font-bold shadow-xs'
                      : 'text-[#526174] hover:bg-slate-50 hover:text-[#172033]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 transition-colors flex-shrink-0 ${
                        isActive ? 'text-[#10B8A5]' : 'text-[#526174] group-hover:text-[#123B78]'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 flex-shrink-0">
                      {item.badge}
                    </span>
                  )}

                  {!isCollapsed && isActive && !item.badge && (
                    <span className="w-1.5 h-4 rounded-full bg-[#10B8A5] flex-shrink-0" />
                  )}
                </button>

                {/* Floating Tooltip for Collapsed Mode */}
                {isCollapsed && (
                  <div className="hidden md:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#172033] text-white text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none items-center gap-1.5">
                    <span>{item.label}</span>
                    <span className="text-[10px] text-slate-300 font-normal">({item.description})</span>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Business Profile Card */}
      <div className={`border-t border-slate-100 bg-[#F6F9FB]/60 ${
        isCollapsed ? 'p-2.5 flex justify-center' : 'p-3.5'
      }`}>
        {isCollapsed ? (
          <div 
            className="relative group p-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs cursor-pointer flex items-center justify-center"
            title={`${activeCustomer.name} - GSTIN: ${activeCustomer.gstin}`}
          >
            <Building2 className="w-5 h-5 text-[#1265A8]" />
            {/* Tooltip */}
            <div className="hidden md:group-hover:block absolute left-full bottom-0 ml-3 p-3 bg-[#172033] text-white rounded-xl shadow-lg whitespace-nowrap z-50 pointer-events-none">
              <p className="text-xs font-bold">{activeCustomer.name}</p>
              <p className="text-[11px] font-mono text-slate-300">GSTIN: {activeCustomer.gstin}</p>
              <p className="text-[10px] text-[#10B8A5] mt-1 font-semibold">● MSME Registered</p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#E8F7F3] text-[#123B78] flex items-center justify-center flex-shrink-0 font-bold text-xs">
                <Building2 className="w-4 h-4 text-[#1265A8]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#172033] truncate">
                    {activeCustomer.name}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B8A5] flex-shrink-0" />
                </div>
                <p className="text-[11px] font-mono text-[#526174] truncate mt-0.5">
                  GSTIN: {activeCustomer.gstin}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-[#526174]">
                    MSME Registered
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
