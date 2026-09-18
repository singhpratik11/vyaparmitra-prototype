import React from 'react';
import { Menu, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import Logo from './Logo';

export default function Header({ onOpenMobileNav }) {
  const currentDateStr = "18 Sep 2026";

  return (
    <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-20">
      {/* Left side: Mobile trigger, Brand Logo & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={onOpenMobileNav}
            className="md:hidden p-2 rounded-lg text-[#526174] hover:bg-slate-100 focus:outline-hidden"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Mobile-only logo */}
          <div className="md:hidden">
            <Logo size="small" />
          </div>
        </div>

        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#172033] tracking-tight">
            Good morning, <span className="text-[#123B78]">ABC Manufacturing</span>
          </h1>
          <p className="text-xs md:text-sm text-[#526174] font-medium mt-0.5">
            Your business at a glance.
          </p>
        </div>
      </div>

      {/* Right side: Prototype Status & Date */}
      <div className="flex items-center gap-3 self-start md:self-auto">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#F6F9FB] rounded-lg border border-slate-200/70 text-xs font-medium text-[#526174]">
          <Calendar className="w-3.5 h-3.5 text-[#1265A8]" />
          <span>{currentDateStr}</span>
        </div>

        {/* Prototype Indicator Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F7F3] border border-[#10B8A5]/30 rounded-lg text-xs font-semibold text-[#123B78]">
          <Sparkles className="w-3.5 h-3.5 text-[#10B8A5]" />
          <span>Frontend Prototype</span>
        </div>
      </div>
    </header>
  );
}
