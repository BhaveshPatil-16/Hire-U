import React from 'react';
import { motion } from 'motion/react';
import { Briefcase, UserPlus, Milestone, Compass, LogOut, Inbox, Mail } from 'lucide-react';
import Logo from './Logo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAiCoach: () => void;
  openMailSandbox: () => void;
  currentUser: any;
  onLogout: () => void;
}

export default function Navbar({ activeTab, setActiveTab, openAiCoach, openMailSandbox, currentUser, onLogout }: NavbarProps) {
  const navItems = [
    { id: 'home', label: 'Explore', icon: Compass },
    { id: 'jobs', label: 'Find Jobs', icon: Briefcase },
    { id: 'companies', label: 'Companies', icon: Milestone },
    { id: 'gmail', label: 'Gmail Connect', icon: Mail },
    { id: 'join', label: 'Join Portal', icon: UserPlus },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer shrink-0" onClick={() => setActiveTab('home')}>
            <Logo size={36} textSize="xl" />
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'text-indigo-600 bg-indigo-50/50' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-indigo-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mail Sandbox Trigger */}
            <button
              onClick={openMailSandbox}
              className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200 flex items-center gap-1.5 border border-amber-200/60 bg-amber-50/40 hover:bg-amber-50 cursor-pointer whitespace-nowrap"
              title="Open Developer Mail Sandbox"
            >
              <div className="relative">
                <Inbox className="w-4 h-4 text-amber-600" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              </div>
              <span className="hidden sm:inline text-slate-800 font-bold text-xs">Mail Sandbox</span>
            </button>

            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200/60 ml-1 shrink-0">
                <div className="hidden lg:flex flex-col text-right mr-1 max-w-[140px]">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Signed In</span>
                  <span className="text-xs font-semibold text-slate-600 truncate" title={currentUser.email}>
                    {currentUser.email}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="px-3 py-2 text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 rounded-xl transition-all duration-200 flex items-center gap-1.5 border border-rose-100/40 cursor-pointer whitespace-nowrap"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>


        </div>
      </div>

      {/* Mobile nav indicator bar */}
      <div className="md:hidden border-t border-slate-100/80 bg-white/80 flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-1 rounded-lg text-[10px] font-medium transition-all duration-200 ${
                isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
