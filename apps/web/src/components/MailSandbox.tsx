import { API_BASE } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, RefreshCw, Server, Send, AlertTriangle, ShieldCheck, ExternalLink, Inbox, ArrowRight } from 'lucide-react';

interface SentEmail {
  id: string;
  to: string;
  from: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  timestamp: string;
  status: 'sent' | 'failed' | 'sandbox';
  error?: string;
}

interface MailSandboxProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MailSandbox({ isOpen, onClose }: MailSandboxProps) {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<SentEmail | null>(null);
  const [loading, setLoading] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<{ configured: boolean; host?: string }>({ configured: false });

  const fetchEmails = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/emails`);
      if (response.ok) {
        const data = await response.json();
        setEmails(data.emails || []);
        
        // Auto-select first email if none selected yet
        if (data.emails && data.emails.length > 0 && !selectedEmail) {
          setSelectedEmail(data.emails[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch sandbox emails:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const checkSmtpConfig = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/status`);
      if (response.ok) {
        // We'll also fetch general status to see if SMTP env is present, 
        // or we can detect it based on sent email statuses.
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmails(false);
      checkSmtpConfig();
      // Auto refresh every 4 seconds silently in the background when sandbox is open
      const interval = setInterval(() => fetchEmails(true), 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' - ' + d.toLocaleDateString();
    } catch (e) {
      return isoStr;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Dark Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
      />

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 z-10"
      >
        {/* Colorful Gradient Header strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-600" />

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 mt-1.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Inbox className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                Developer Mail Sandbox
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Intercept Panel
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Verify applicant welcome greetings and employer job alerts in real-time
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={fetchEmails}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="Refresh inbox"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SMTP Configuration Guidance banner */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 text-white shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 text-xs sm:text-sm">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0 mt-0.5 md:mt-0">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-100 flex items-center gap-1.5 text-xs sm:text-sm">
                How to deliver emails to your real inbox?
              </p>
              <p className="text-slate-400 text-[11px] sm:text-xs leading-normal mt-0.5">
                Set up standard SMTP variables (<code className="text-pink-400 bg-slate-950 px-1 rounded">SMTP_HOST</code>, <code className="text-pink-400 bg-slate-950 px-1 rounded">SMTP_USER</code>, <code className="text-pink-400 bg-slate-950 px-1 rounded">SMTP_PASS</code>) in your environment settings.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end shrink-0 text-[11px] font-medium bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/60 text-indigo-300">
            <span>Interception Active</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
        </div>

        {/* Main Content Layout Split */}
        <div className="flex-1 flex overflow-hidden min-h-0 bg-slate-50/20">
          
          {/* Left Column: Email list */}
          <div className="w-full md:w-85 border-r border-slate-100 flex flex-col min-h-0 shrink-0 bg-white">
            <div className="p-3 bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center justify-between">
              <span>Sandbox Inbox</span>
              <span>{emails.length} intercepted</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {emails.length === 0 ? (
                <div className="p-6 text-center text-slate-400 space-y-2 mt-12">
                  <Mail className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">Your Sandbox is Empty</p>
                  <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">
                    Try registering a new account or applying for a job posting to trigger notifications!
                  </p>
                </div>
              ) : (
                emails.map((email) => {
                  const isSelected = selectedEmail?.id === email.id;
                  return (
                    <button
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`w-full text-left p-3.5 transition-all outline-none cursor-pointer flex flex-col gap-1.5 ${
                        isSelected 
                          ? 'bg-indigo-50/50 border-l-3 border-indigo-600' 
                          : 'hover:bg-slate-50/80 border-l-3 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 w-full">
                        <span className="text-[10px] font-mono font-bold text-slate-400 truncate max-w-[120px]" title={email.to}>
                          To: {email.to}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 shrink-0">
                          {email.timestamp ? new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-800 line-clamp-1">
                        {email.subject}
                      </p>

                      <div className="flex items-center justify-between gap-1 mt-1">
                        {/* Status Label */}
                        {email.status === 'sent' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 font-mono">
                            <ShieldCheck className="w-3 h-3" /> SMTP Sent
                          </span>
                        )}
                        {email.status === 'sandbox' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 font-mono">
                            Sandbox Cached
                          </span>
                        )}
                        {email.status === 'failed' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 font-mono" title={email.error}>
                            <AlertTriangle className="w-3 h-3" /> SMTP Error
                          </span>
                        )}
                        
                        <span className="text-[9px] text-slate-400 font-medium font-mono">
                          ID: {email.id}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Email preview details */}
          <div className="hidden md:flex flex-1 flex-col min-h-0 bg-slate-50/40">
            {selectedEmail ? (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Meta details panel */}
                <div className="p-4 bg-white border-b border-slate-100 shrink-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {selectedEmail.subject}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Sent on: {formatDate(selectedEmail.timestamp)}
                      </p>
                    </div>
                    {selectedEmail.status === 'failed' && (
                      <div className="px-3 py-1 bg-rose-50 border border-rose-100 rounded-lg text-[11px] text-rose-700 max-w-xs font-semibold">
                        Error: {selectedEmail.error || 'Connection Timeout'}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-50 font-mono text-slate-600">
                    <div>
                      <span className="font-bold text-slate-400">From:</span> {selectedEmail.from}
                    </div>
                    <div>
                      <span className="font-bold text-slate-400">To:</span> {selectedEmail.to}
                    </div>
                  </div>
                </div>

                {/* Body Preview in safe iframe */}
                <div className="flex-1 p-4 overflow-hidden flex flex-col">
                  <div className="flex-1 bg-white border border-slate-200/60 rounded-2xl shadow-xs overflow-hidden flex flex-col">
                    <div className="bg-slate-100 px-4 py-1.5 text-[10px] font-mono font-bold text-slate-400 border-b border-slate-200 flex items-center justify-between shrink-0">
                      <span>HTML Output Render Preview</span>
                      <span className="text-indigo-600">Secure Frame</span>
                    </div>
                    <iframe
                      srcDoc={selectedEmail.bodyHtml}
                      title="Email Preview"
                      className="w-full flex-1 border-none bg-slate-50"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
                <Mail className="w-12 h-12 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No Email Selected</p>
                <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                  Click on any email in the list to view its beautiful corporate layout, headers, and transmission data.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Mobile active email display fallback */}
        <AnimatePresence>
          {selectedEmail && (
            <div className="md:hidden absolute inset-0 z-20 bg-white flex flex-col min-h-0">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  ← Back to List
                </button>
                <span className="text-[10px] font-mono font-bold text-slate-400">Preview</span>
              </div>
              
              <div className="p-4 border-b border-slate-100 shrink-0 bg-white">
                <h4 className="font-bold text-slate-900 text-sm">{selectedEmail.subject}</h4>
                <p className="text-[10px] text-slate-500 font-mono mt-1">To: {selectedEmail.to}</p>
              </div>

              <div className="flex-1 p-2 bg-slate-100 overflow-hidden flex">
                <iframe
                  srcDoc={selectedEmail.bodyHtml}
                  title="Mobile Email Preview"
                  className="w-full h-full bg-white rounded-xl border border-slate-200"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
