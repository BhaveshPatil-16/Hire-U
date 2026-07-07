import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TalentProfile } from '@hireu/shared';
import { Sparkles, Users, Search, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface TalentNetworkProps {
  talent: TalentProfile[];
  onSelectTalent: (talent: TalentProfile) => void;
}

export default function TalentNetwork({ talent, onSelectTalent }: TalentNetworkProps) {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchSkill, setSearchSkill] = useState<string>('');

  const filteredTalent = talent.filter(t => {
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    const matchesSkill = searchSkill === '' || t.skills.some(s => s.toLowerCase().includes(searchSkill.toLowerCase())) || t.role.toLowerCase().includes(searchSkill.toLowerCase());
    return matchesStatus && matchesSkill;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Open to Work':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'In Discussions':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Hired':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-white/40 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 mb-3">
              <Users className="w-3.5 h-3.5" />
              <span>Verified Talent Pool</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Talent Network Highlights
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-xl">
              Preview elite builders actively engaged in our matching streams. Click any profile to run an instant semantic match analysis.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search skill */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200/80 focus-within:border-indigo-300 transition-all text-xs">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search skills (e.g. PyTorch)..." 
                value={searchSkill}
                onChange={(e) => setSearchSkill(e.target.value)}
                className="bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Status Select */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {['All', 'Open to Work', 'In Discussions'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterStatus === st 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Talent Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTalent.length > 0 ? (
              filteredTalent.map((member, idx) => (
                <motion.div
                  layout
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white/80 border border-slate-100/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl ${member.avatarColor} font-display font-bold text-sm flex items-center justify-center shadow-inner`}>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${getStatusStyle(member.status)}`}>
                        {member.status}
                      </span>
                    </div>

                    {/* Meta */}
                    <h3 className="font-display font-semibold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                      {member.role}
                    </p>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {member.skills.map(skill => (
                        <span 
                          key={skill} 
                          className="px-2 py-0.5 rounded bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-mono"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-100/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">90%+ AI Potential Match</span>
                    <button
                      onClick={() => onSelectTalent(member)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Analyze Fit</span>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-white/50 rounded-2xl border border-dashed border-slate-200">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-800">No matching specialists found</h3>
                <p className="text-xs text-slate-500 mt-1">Try resetting your skills search filters or query text.</p>
                <button 
                  onClick={() => { setSearchSkill(''); setFilterStatus('All'); }}
                  className="mt-4 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
