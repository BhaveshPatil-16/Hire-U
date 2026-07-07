import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Sparkles, TrendingUp, Users, ArrowRight } from 'lucide-react';

interface HeroProps {
  onSearch: (query: string, location: string, category: string) => void;
  onJoinPortal: () => void;
}

export default function Hero({ onSearch, onJoinPortal }: HeroProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('All');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, location, category);
  };

  const handleQuickTag = (tag: string) => {
    setQuery(tag);
    onSearch(tag, '', 'All');
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28">
      {/* Background soft pastel ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-rose-200/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-teal-100/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Subtle AI Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 border border-indigo-100/70 text-indigo-700 shadow-sm mb-6 sm:mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>Next-Gen Semantic Talent Intelligence</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-tight sm:leading-none"
          >
            The premium way to align{' '}
            <span className="block mt-2 sm:mt-3 bg-gradient-to-r from-indigo-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
              world-class engineering talent
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-sans leading-relaxed"
          >
            HIREU is an intelligent career ecosystem. Paste your credentials, let our generative models map your semantic fit, and connect directly with high-integrity product teams.
          </motion.p>

          {/* Interactive Search Bar Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 sm:mt-12 bg-white/80 backdrop-blur-lg p-3 sm:p-4 rounded-3xl shadow-xl shadow-indigo-100/30 border border-slate-100 max-w-3xl mx-auto"
          >
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch gap-2.5">
              {/* Query Field */}
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50/50 rounded-2xl border border-slate-100 focus-within:border-indigo-300 focus-within:bg-white transition-all duration-200">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Role, skill, or keyword..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Location Field */}
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50/50 rounded-2xl border border-slate-100 focus-within:border-indigo-300 focus-within:bg-white transition-all duration-200">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Location or 'Remote'..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Category Dropdown */}
              <div className="flex-1 flex items-center px-3 py-2 bg-slate-50/50 rounded-2xl border border-slate-100 focus-within:border-indigo-300 focus-within:bg-white transition-all duration-200">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-700 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-medium text-sm transition-all duration-200 shadow-sm flex items-center justify-center gap-2 hover:shadow-indigo-100 shrink-0"
              >
                <span>Find Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick search helpers */}
            <div className="mt-4 flex flex-wrap items-center gap-2 justify-center sm:justify-start sm:px-2 text-xs text-slate-500">
              <span className="font-medium text-slate-400">Popular:</span>
              <button
                onClick={() => handleQuickTag('NLP Researcher')}
                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100/80 text-purple-700 rounded-lg border border-purple-100/50 transition-all cursor-pointer"
              >
                NLP Researcher
              </button>
              <button
                onClick={() => handleQuickTag('Remote')}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100/80 text-rose-700 rounded-lg border border-rose-100/50 transition-all cursor-pointer"
              >
                Remote Design
              </button>
              <button
                onClick={() => handleQuickTag('Kubernetes')}
                className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100/80 text-teal-700 rounded-lg border border-teal-100/50 transition-all cursor-pointer"
              >
                SRE Architect
              </button>
            </div>
          </motion.div>

          {/* Social Proof Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center gap-6 sm:gap-12 justify-center text-slate-500 text-sm border-t border-slate-100 pt-8"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-center border-2 border-white">EV</div>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center border-2 border-white">MB</div>
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold flex items-center justify-center border-2 border-white">SR</div>
              </div>
              <span className="font-medium text-slate-600">Loved by 4,000+ engineers</span>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>94.2% placement matching precision</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>Connected with elite MedTech & AI firms</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
