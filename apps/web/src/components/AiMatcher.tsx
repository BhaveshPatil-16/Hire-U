import React, { useState, useEffect } from 'react';
import { API_BASE } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { Job, TalentProfile } from '@hireu/shared';
import { Sparkles, ArrowRight, Loader2, Target, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AiMatcherProps {
  jobs: Job[];
  preSelectedTalent: TalentProfile | null;
  clearPreSelectedTalent: () => void;
  onApply: (job: Job) => void;
}

export default function AiMatcher({ jobs, preSelectedTalent, clearPreSelectedTalent, onApply }: AiMatcherProps) {
  const [skillsText, setSkillsText] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResults, setMatchResults] = useState<any[] | null>(null);

  // Sync pre-selected talent from parent
  useEffect(() => {
    if (preSelectedTalent) {
      const formattedSkills = `Profile Name: ${preSelectedTalent.name}\nTarget Role: ${preSelectedTalent.role}\nSkills: ${preSelectedTalent.skills.join(', ')}`;
      setSkillsText(formattedSkills);
      // Automatically trigger match
      triggerMatch(formattedSkills);
    }
  }, [preSelectedTalent]);

  const triggerMatch = async (inputText: string) => {
    if (!inputText.trim()) return;
    setIsMatching(true);
    setMatchResults(null);

    try {
      const response = await fetch(`${API_BASE}/api/ai/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: inputText })
      });
      const data = await response.json();
      setMatchResults(data.matches);
    } catch (err) {
      console.error(err);
    } finally {
      setIsMatching(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerMatch(skillsText);
  };

  const fillSampleDeveloper = () => {
    setSkillsText("Framer Motion, Tailwind CSS, highly responsive CSS design, React 19, TypeScript, WCAG AA digital standards, WebGL, UI animation");
    clearPreSelectedTalent();
  };

  const fillSampleResearcher = () => {
    setSkillsText("NLP deep learning networks, PyTorch fine-tuning, transformer design, high reasoning model distillation, CUDA compiling, Python");
    clearPreSelectedTalent();
  };

  const getJobDetails = (id: string) => jobs.find(j => j.id === id);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 65) return 'text-indigo-600 bg-indigo-50 border-indigo-100';
    return 'text-amber-600 bg-amber-50 border-amber-100';
  };

  const getScoreProgressColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 65) return 'bg-indigo-500';
    return 'bg-amber-500';
  };

  return (
    <section id="aimatcher" className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Semantic alignment</span>
          </div>
          <h2 className="font-display font-bold text-3xl text-slate-900 tracking-tight">
            AI Semantic Fit Engine
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Skip mechanical resume screening. Our transformer layers analyze structural overlaps, domain experience, and core strengths to rank matching openings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Input Credentials Panel */}
          <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h3 className="font-display font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              Technical Qualifications Input
            </h3>

            {preSelectedTalent && (
              <div className="mb-4 p-3 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-center justify-between text-xs text-amber-800">
                <span className="font-medium">Active Member Match: <strong>{preSelectedTalent.name}</strong></span>
                <button 
                  onClick={() => { clearPreSelectedTalent(); setSkillsText(''); }}
                  className="text-xs underline font-bold cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Key Skills, Frameworks, & Industry Roles
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste your skills inventory, tech stack, or professional background bullets..."
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-300 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-mono leading-relaxed"
                />
              </div>

              {/* Sample injectors */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                <span>Inject stack:</span>
                <button
                  type="button"
                  onClick={fillSampleDeveloper}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded border border-slate-200 transition-colors cursor-pointer font-medium"
                >
                  UI Developer
                </button>
                <button
                  type="button"
                  onClick={fillSampleResearcher}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded border border-slate-200 transition-colors cursor-pointer font-medium"
                >
                  NLP Scientist
                </button>
              </div>

              <button
                type="submit"
                disabled={isMatching || !skillsText.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-medium text-sm rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isMatching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Neural Topology Fit...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-300" />
                    <span>Run Semantic Alignment Match</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: Sorted Alignment Rankings */}
          <div className="lg:col-span-7 space-y-4">
            <AnimatePresence mode="wait">
              {matchResults ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
                      Neural Alignment Rankings ({matchResults.length})
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> High Precision Match
                    </span>
                  </div>

                  {matchResults.map((result: any, idx: number) => {
                    const job = getJobDetails(result.jobId);
                    if (!job) return null;
                    return (
                      <motion.div
                        key={result.jobId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-indigo-100/50 transition-all group"
                      >
                        {/* Header card info */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-xs ${job.logoColor}`}>
                              {job.companyName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{job.companyName}</span>
                              <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 leading-tight">
                                {job.title}
                              </h4>
                            </div>
                          </div>

                          {/* Score Pill */}
                          <div className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border shrink-0 ${getScoreColor(result.score)}`}>
                            {result.score}% FIT
                          </div>
                        </div>

                        {/* Match Progress Bar */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${getScoreProgressColor(result.score)}`}
                            style={{ width: `${result.score}%` }}
                          />
                        </div>

                        {/* AI Match Commentary */}
                        <p className="text-slate-600 text-xs sm:text-sm mt-4 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100/40">
                          <strong>Match Insight:</strong> {result.explanation}
                        </p>

                        {/* Strengths & Gaps */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100/60">
                          <div>
                            <h5 className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider mb-2">Primary fit strengths</h5>
                            <ul className="space-y-1 text-xs text-slate-500">
                              {result.strengths?.map((str: string, i: number) => (
                                <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  <span>{str}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h5 className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-wider mb-2">Recommended resume focal points</h5>
                            <ul className="space-y-1 text-xs text-slate-500">
                              {result.gaps?.map((gap: string, i: number) => (
                                <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                  <span>{gap}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Apply Trigger */}
                        <div className="mt-4 pt-4 border-t border-slate-100/40 flex justify-end">
                          <button
                            onClick={() => onApply(job)}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Apply with alignment</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-10 bg-white/40 border border-dashed border-slate-200 rounded-3xl text-center min-h-[350px]">
                  <Target className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
                  <h4 className="font-display font-semibold text-slate-800 text-lg">Awaiting alignment qualifications</h4>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-sm mx-auto leading-relaxed">
                    Input your core stack, framework fluencies, or select one of the verified network profiles on the homepage to map instant alignment rankings.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
