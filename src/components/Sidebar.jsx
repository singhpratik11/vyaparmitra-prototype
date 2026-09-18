import React from 'react';
import { FilePlus2, PackagePlus, LayoutDashboard, Building2, CheckCircle2 } from 'lucide-react';
import Logo from './Logo';

export default function Sidebar({ currentView, onNavigate, onCloseMobile }) {
  const navItems = [
    {
      id: 'create-invoice',
      label: 'Create Invoice',
      icon: FilePlus2,
      badge: 'Action',
    },
    {
      id: 'create-grn',
      label: 'Create GRN',
      icon: PackagePlus,
      badge: 'Action',
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
  ];

  const handleNavClick = (id) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-full select-none">
      {/* Top Section: Logo & Navigation */}
      <div>
        {/* Logo Container */}
        <div className="px-6 py-6 border-b border-slate-100">
          <Logo />
        </div>

        {/* Navigation list: Exactly 3 items */}
        <nav className="p-4 space-y-1.5" aria-label="Primary Navigation">
          <div className="px-3 pt-2 pb-1.5 text-[11px] font-semibold text-[#526174] uppercase tracking-wider">
            Main Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-[#E8F7F3] text-[#123B78] font-semibold shadow-xs'
                    : 'text-[#526174] hover:bg-slate-50 hover:text-[#172033]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-[#10B8A5]' : 'text-[#526174]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {isActive && (
                  <span className="w-1.5 h-4 rounded-full bg-[#10B8A5]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Business Profile Card */}
      <div className="p-4 border-t border-slate-100 bg-[#F6F9FB]/60">
        <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#E8F7F3] text-[#123B78] flex items-center justify-center flex-shrink-0 font-bold text-xs">
              <Building2 className="w-4 h-4 text-[#1265A8]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#172033] truncate">
                  ABC Manufacturing
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B8A5] flex-shrink-0" />
              </div>
              <p className="text-[11px] font-mono text-[#526174] truncate mt-0.5">
                GSTIN: 27AABCA1234F1ZP
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-[#526174]">
                  MSME Registered
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
