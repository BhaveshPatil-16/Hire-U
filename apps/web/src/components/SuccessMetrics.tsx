import React from 'react';
import { motion } from 'motion/react';
import { SuccessMetric } from '@hireu/shared';
import { TrendingUp, Award, Clock, Sparkles } from 'lucide-react';

interface SuccessMetricsProps {
  metrics: SuccessMetric[];
}

export default function SuccessMetrics({ metrics }: SuccessMetricsProps) {
  const getIcon = (id: string) => {
    switch (id) {
      case 'metric-1':
        return <Sparkles className="w-5 h-5 text-indigo-600" />;
      case 'metric-2':
        return <Clock className="w-5 h-5 text-rose-600" />;
      case 'metric-3':
        return <Award className="w-5 h-5 text-teal-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-slate-600" />;
    }
  };

  const getBgColor = (id: string) => {
    switch (id) {
      case 'metric-1':
        return 'bg-indigo-50 border-indigo-100/60';
      case 'metric-2':
        return 'bg-rose-50 border-rose-100/60';
      case 'metric-3':
        return 'bg-teal-50 border-teal-100/60';
      default:
        return 'bg-slate-50 border-slate-100';
    }
  };

  return (
    <section id="metrics" className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <h2 className="font-display font-bold text-3xl text-slate-900 tracking-tight">
            How we qualify fit
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            HIREU operates beyond mechanical keyword lookups. We track high-integrity signals across active placements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {metrics.map((metric, idx) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`p-6 rounded-2xl border bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 ${getBgColor(metric.id)}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-white shadow-sm shrink-0">
                  {getIcon(metric.id)}
                </div>
                <span className="text-xs font-mono font-medium px-2 py-1 rounded-full bg-white/90 text-slate-600 border border-slate-100 shadow-sm">
                  {metric.change}
                </span>
              </div>

              <div className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                {metric.value}
              </div>

              <div className="font-semibold text-slate-800 text-sm sm:text-base mt-2">
                {metric.label}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {metric.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
