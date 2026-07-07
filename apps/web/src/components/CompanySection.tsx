import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Company, Job } from '@hireu/shared';

const CompanyLogo = ({ logoUrl, companyName, logoColor, className = "w-11 h-11" }: { logoUrl?: string; companyName: string; logoColor: string; className?: string }) => {
  const [imgError, setImgError] = useState(false);

  if (logoUrl && !imgError) {
    return (
      <div className={`${className} bg-white border border-slate-100 flex items-center justify-center p-1.5 shadow-sm overflow-hidden shrink-0`}>
        <img 
          src={logoUrl} 
          alt={`${companyName} logo`} 
          className="w-full h-full object-contain animate-fade-in"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  const initials = companyName.split(' ').map(n => n[0]).join('');
  return (
    <div className={`${className} flex items-center justify-center font-display font-bold shrink-0 ${logoColor}`}>
      {initials}
    </div>
  );
};
import { Milestone, Users, Calendar, MapPin, Building, ChevronRight, CheckCircle2, Award, ArrowRight } from 'lucide-react';

interface CompanySectionProps {
  companies: Company[];
  jobs: Job[];
  onSelectJob: (job: Job) => void;
}

export default function CompanySection({ companies, jobs, onSelectJob }: CompanySectionProps) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const getJobCount = (coId: string) => jobs.filter(j => j.companyId === coId).length;

  return (
    <section id="companies" className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100 mb-3">
            <Building className="w-3.5 h-3.5" />
            <span>Co-operating Design & Tech Guilds</span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Partner Companies
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Explore company values, product missions, and certified workspace milestones from our partner employers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Companies Sidebar list */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase mb-3">
              Select Company to View About Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {companies.map((co) => {
                const isActive = selectedCompany?.id === co.id;
                const count = getJobCount(co.id);
                return (
                  <button
                    key={co.id}
                    onClick={() => setSelectedCompany(co)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 relative group cursor-pointer ${
                      isActive 
                        ? 'bg-white border-indigo-200 shadow-md shadow-indigo-100/20' 
                        : 'bg-white/60 hover:bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CompanyLogo 
                        logoUrl={co.logoUrl}
                        companyName={co.name}
                        logoColor={co.logoColor}
                        className="w-11 h-11 rounded-xl text-xs"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-950 text-sm sm:text-base truncate group-hover:text-indigo-600 transition-colors">
                          {co.name}
                        </h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {co.industry}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isActive ? 'rotate-90 text-indigo-500' : 'group-hover:translate-x-0.5'}`} />
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100/60 flex items-center justify-between text-xs text-slate-500">
                      <span>{co.headquarters}</span>
                      <span className="font-semibold text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded-md border border-indigo-100/30">
                        {count} {count === 1 ? 'Job' : 'Jobs'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Company Detail Display */}
          <div className="lg:col-span-8 bg-white/80 border border-slate-100/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <AnimatePresence mode="wait">
              {selectedCompany ? (
                <motion.div
                  key={selectedCompany.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 sm:space-y-8"
                >
                  {/* Company Header */}
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:items-center justify-between pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <CompanyLogo 
                        logoUrl={selectedCompany.logoUrl}
                        companyName={selectedCompany.name}
                        logoColor={selectedCompany.logoColor}
                        className="w-14 h-14 rounded-2xl text-lg"
                      />
                      <div>
                        <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 leading-tight">
                          {selectedCompany.name}
                        </h3>
                        <p className="text-sm text-indigo-600 font-medium mt-1">
                          {selectedCompany.industry}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-slate-50 text-slate-600 border border-slate-100">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Est. {selectedCompany.founded}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-slate-50 text-slate-600 border border-slate-100">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {selectedCompany.size}
                      </span>
                    </div>
                  </div>

                  {/* About Section */}
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                      About & Mission Statement
                    </h4>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      {selectedCompany.description}
                    </p>
                  </div>

                  {/* Core Values */}
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Core Corporate Values
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      {selectedCompany.values.map((v, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50/50 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Milestones Timeline */}
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-4">
                      Company Milestones & History
                    </h4>
                    <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100">
                      {selectedCompany.milestones.map((ms, index) => (
                        <div key={index} className="flex items-start gap-4 relative pl-8 group">
                          {/* Circle marker */}
                          <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-indigo-500 group-hover:scale-110 transition-transform flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          </div>

                          <div>
                            <span className="inline-block text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                              {ms.year}
                            </span>
                            <h5 className="font-semibold text-slate-900 text-sm sm:text-base mt-1.5">
                              {ms.title}
                            </h5>
                            <p className="text-slate-500 text-xs sm:text-sm mt-0.5 leading-relaxed">
                              {ms.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active listings at this company */}
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-4">
                      Open Positions at {selectedCompany.name}
                    </h4>
                    <div className="space-y-2.5">
                      {jobs.filter(j => j.companyId === selectedCompany.id).map((job) => (
                        <div 
                          key={job.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-all cursor-pointer group"
                          onClick={() => onSelectJob(job)}
                        >
                          <div>
                            <h5 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {job.title}
                            </h5>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                              <span>{job.type}</span>
                              <span>•</span>
                              <span>{job.location}</span>
                            </div>
                          </div>
                          <button className="p-1.5 rounded-lg bg-white border border-slate-200/80 hover:border-indigo-300 text-indigo-600 text-xs transition-colors shadow-sm shrink-0 flex items-center gap-1 font-semibold">
                            <span>Apply</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </motion.div>
              ) : (
                <div className="py-16 text-center">
                  <Milestone className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-bounce" />
                  <h3 className="font-display font-semibold text-slate-800 text-lg">No company selected</h3>
                  <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto leading-relaxed">
                    Select any partner company from the catalog sidebar list to read about their founding teams, milestones, and active positions.
                  </p>
                  
                  {/* Pre-select first helper */}
                  <button
                    onClick={() => setSelectedCompany(companies[0])}
                    className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-indigo-100"
                  >
                    Show First Company Profile
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
}
