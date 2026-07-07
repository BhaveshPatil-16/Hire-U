import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Job, Company, INITIAL_COMPANIES } from '@hireu/shared';

const CompanyLogo = ({ companyId, companyName, logoColor, className = "w-11 h-11" }: { companyId: string; companyName: string; logoColor: string; className?: string }) => {
  const [imgError, setImgError] = useState(false);
  const company = INITIAL_COMPANIES.find(c => c.id === companyId);
  const logoUrl = company?.logoUrl;

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
import { MapPin, Briefcase, IndianRupee, Clock, Filter, AlertCircle, CheckCircle2, ChevronRight, X, ArrowUpRight } from 'lucide-react';

interface JobListingProps {
  jobs: Job[];
  searchQuery: string;
  searchLocation: string;
  selectedCategory: string;
  onApply: (job: Job) => void;
  selectedJob: Job | null;
  setSelectedJob: (job: Job | null) => void;
}

export default function JobListing({
  jobs,
  searchQuery,
  searchLocation,
  selectedCategory,
  onApply,
  selectedJob,
  setSelectedJob
}: JobListingProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeType, setActiveType] = useState<string>('All');

  // Categories list
  const categories = ['All', 'Engineering', 'Design', 'Product', 'Data Science', 'Marketing'];

  // Work arrangements
  const types = ['All', 'Full-time', 'Part-time', 'Contract', 'Remote'];

  // Core Filtering Pipeline
  const filteredJobs = jobs.filter((job) => {
    // 1. Navbar Search parameters
    const matchesNavbarQuery = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requirements.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesNavbarLocation = searchLocation === '' || 
      job.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
      (searchLocation.toLowerCase() === 'remote' && job.type === 'Remote');

    // 2. In-page filter Category
    const categoryToUse = selectedCategory !== 'All' ? selectedCategory : activeCategory;
    const matchesCategory = categoryToUse === 'All' || job.category === categoryToUse;

    // 3. In-page filter Job Type
    const matchesType = activeType === 'All' || job.type === activeType;

    return matchesNavbarQuery && matchesNavbarLocation && matchesCategory && matchesType;
  });

  return (
    <section id="jobs" className="py-12 sm:py-16 bg-white/40 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 mb-3">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Certified Listings</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Active Job Postings
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-xl">
              Filter by engineering disciplines, operational designs, or workspace parameters. Click any post to review requirements.
            </p>
          </div>

          {/* Quick counter */}
          <div className="text-xs sm:text-sm font-mono font-medium text-slate-400 bg-white border border-slate-100 px-3.5 py-2 rounded-2xl shadow-sm">
            Showing <span className="text-indigo-600 font-bold">{filteredJobs.length}</span> verified positions
          </div>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                    : 'bg-white/60 text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Work Type Tabs */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Workspace:
            </span>
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeType === t
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200/80'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job, idx) => (
                <motion.div
                  layout
                  key={job.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between relative ${
                    job.featured ? 'border-indigo-100 bg-gradient-to-tr from-white to-indigo-50/10' : 'border-slate-100'
                  }`}
                >
                  {job.featured && (
                    <span className="absolute top-4 right-4 bg-indigo-50 text-indigo-600 text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border border-indigo-100">
                      Featured Fit
                    </span>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <CompanyLogo 
                        companyId={job.companyId}
                        companyName={job.companyName}
                        logoColor={job.logoColor}
                        className="w-11 h-11 rounded-xl text-xs"
                      />
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{job.companyName}</span>
                        <h3 className="font-display font-bold text-base text-slate-950 leading-tight group-hover:text-indigo-600 transition-colors mt-0.5">
                          {job.title}
                        </h3>
                      </div>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-100">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-100">
                        <IndianRupee className="w-3 h-3 text-slate-400" />
                        {job.salary}
                      </span>
                    </div>

                    {/* Summary Description */}
                    <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-6">
                      {job.description}
                    </p>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">{job.postedDate}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-slate-200/80"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => onApply(job)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm hover:shadow-indigo-100 flex items-center gap-1.5"
                      >
                        <span>Apply now</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-white/50 rounded-3xl border border-dashed border-slate-200">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="font-display font-semibold text-slate-800 text-base">No matching listings found</h3>
                <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                  Try adjusting your search queries, clearing category filters, or searching different workspaces.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory('All');
                    setActiveType('All');
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Clear Listings Filters
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Detailed Description Side Drawer/Modal */}
        <AnimatePresence>
          {selectedJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-end">
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedJob(null)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />

              {/* Side Panel Drawer */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="relative w-full max-w-lg h-full bg-white shadow-2xl p-6 sm:p-8 overflow-y-auto flex flex-col justify-between"
              >
                <div>
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Header info */}
                  <div className="flex items-center gap-4 pb-6 border-b border-slate-100 mt-4">
                    <CompanyLogo 
                      companyId={selectedJob.companyId}
                      companyName={selectedJob.companyName}
                      logoColor={selectedJob.logoColor}
                      className="w-12 h-12 rounded-2xl text-base"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{selectedJob.companyName}</span>
                      <h3 className="font-display font-bold text-xl text-slate-900 leading-tight">
                        {selectedJob.title}
                      </h3>
                    </div>
                  </div>

                  {/* Badges metadata */}
                  <div className="grid grid-cols-2 gap-3 py-6 border-b border-slate-100">
                    <div className="flex items-center gap-2.5 text-xs text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-mono text-[9px] text-slate-400 uppercase tracking-wider">Location</p>
                        <p className="font-semibold text-slate-800">{selectedJob.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-600">
                      <IndianRupee className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-mono text-[9px] text-slate-400 uppercase tracking-wider">Annual Compensation</p>
                        <p className="font-semibold text-slate-800">{selectedJob.salary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-600 mt-2">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-mono text-[9px] text-slate-400 uppercase tracking-wider">Category</p>
                        <p className="font-semibold text-slate-800">{selectedJob.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-600 mt-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-mono text-[9px] text-slate-400 uppercase tracking-wider">Work Arrangement</p>
                        <p className="font-semibold text-slate-800">{selectedJob.type}</p>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-6 py-6">
                    <div>
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Position Description
                      </h4>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {selectedJob.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Ideal Candidate Requirements
                      </h4>
                      <ul className="space-y-2">
                        {selectedJob.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Compensation & Perks
                      </h4>
                      <ul className="space-y-2">
                        {selectedJob.benefits.map((b, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                            <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Drawer Footer CTA */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold font-mono">Posted {selectedJob.postedDate}</span>
                  <button
                    onClick={() => {
                      onApply(selectedJob);
                      setSelectedJob(null);
                    }}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-semibold transition-all cursor-pointer shadow-md shadow-indigo-100/30 flex items-center gap-1.5"
                  >
                    <span>Apply for this position</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
