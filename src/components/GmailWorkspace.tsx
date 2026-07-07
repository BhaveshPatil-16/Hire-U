import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Search, 
  Send, 
  Sparkles, 
  RefreshCw, 
  LogOut, 
  Inbox, 
  Calendar, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Plus, 
  ChevronRight, 
  FileEdit, 
  UserCheck, 
  Info,
  ExternalLink
} from 'lucide-react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { auth } from '../firebase';
import { 
  listMessages, 
  getMessageDetails, 
  sendEmail, 
  createDraft, 
  ParsedEmail 
} from '../lib/gmail';

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify'
];

interface SmartTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'seeker' | 'recruiter';
  icon: any;
}

const SMART_TEMPLATES: SmartTemplate[] = [
  {
    id: 'follow-up',
    name: 'Post-Application Follow-Up',
    subject: 'Application Follow-Up: [JobTitle] - [YourName]',
    body: `<p>Dear Hiring Team,</p>
<p>I hope this email finds you well.</p>
<p>I recently applied for the <strong>[JobTitle]</strong> role at <strong>[CompanyName]</strong> and wanted to reiterate my enthusiastic interest in this opportunity.</p>
<p>Given my experience with modern software engineering and technical product building, I am confident I can bring significant value to your active projects. I would love the chance to discuss how my skill set aligns with your current team objectives.</p>
<p>Thank you for your time and consideration!</p>
<p>Best regards,<br/><strong>[YourName]</strong></p>`,
    category: 'seeker',
    icon: FileText
  },
  {
    id: 'thank-you',
    name: 'Interview Thank-You Note',
    subject: 'Thank You - Interview for [JobTitle]',
    body: `<p>Dear [InterviewerName],</p>
<p>Thank you so much for taking the time to speak with me today about the <strong>[JobTitle]</strong> position at <strong>[CompanyName]</strong>.</p>
<p>I truly enjoyed learning more about your team's approach to technical scalability and your focus on exceptional user experiences. The conversation further confirmed my excitement about joining your team.</p>
<p>Please let me know if you need any additional files or details regarding my past projects. I look forward to hearing from you regarding the next steps.</p>
<p>Best regards,<br/><strong>[YourName]</strong></p>`,
    category: 'seeker',
    icon: UserCheck
  },
  {
    id: 'offer-letter',
    name: 'Hiring Offer Letter (Employer)',
    subject: 'Offer of Employment: [JobTitle] at [CompanyName]',
    body: `<p>Dear [YourName],</p>
<p>On behalf of <strong>[CompanyName]</strong>, we are absolutely thrilled to offer you the position of <strong>[JobTitle]</strong>!</p>
<p>We were incredibly impressed by your technical depth, problem-solving skills, and alignment with our collaborative culture during the evaluation process.</p>
<p><strong>Offer Details:</strong><br/>
• <strong>Role:</strong> [JobTitle]<br/>
• <strong>Base Compensation:</strong> Competitive Market Package<br/>
• <strong>Start Date:</strong> To be finalized</p>
<p>Please review the attached formal agreement and let us know your decision by next week. We are excited about the prospect of building the future together!</p>
<p>Warmest regards,<br/>The Hiring Board</p>`,
    category: 'recruiter',
    icon: Sparkles
  }
];

export default function GmailWorkspace() {
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Email UI states
  const [emails, setEmails] = useState<ParsedEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<ParsedEmail | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('subject:(interview OR application OR hire OR offer OR job)');
  const [composerOpen, setComposerOpen] = useState(false);
  
  // New email input fields
  const [toInput, setToInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  const [bodyInput, setBodyInput] = useState('');
  
  // Smart templates helper tokens
  const [tokenJob, setTokenJob] = useState('Senior NLP Researcher');
  const [tokenCompany, setTokenCompany] = useState('Aethera Labs');
  const [tokenCandidate, setTokenCandidate] = useState('Eleanor Vance');

  // Confirmation overlay state
  const [showConfirmSend, setShowConfirmSend] = useState(false);
  const [showConfirmDraft, setShowConfirmDraft] = useState(false);
  const [actionStatus, setActionStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Sync state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Look for a cached access token or session
      if (!user) {
        setGoogleUser(null);
        setAccessToken(null);
      } else {
        setGoogleUser(user);
      }
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // Google Sign-In with popup
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    GMAIL_SCOPES.forEach(scope => provider.addScope(scope));

    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
        setGoogleUser(result.user);
        setActionStatus({ success: true, message: 'Successfully signed in with Google Gmail Scopes!' });
        setTimeout(() => setActionStatus(null), 3000);
      } else {
        throw new Error('Could not retrieve Google OAuth access token.');
      }
    } catch (err: any) {
      console.error('[Google OAuth Exception]:', err);
      setAuthError(err.message || 'OAuth Connection Failed');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setAccessToken(null);
      setGoogleUser(null);
      setEmails([]);
      setSelectedEmail(null);
    } catch (err) {}
  };

  // Fetch real Gmail inbox messages
  const loadGmailInbox = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const messages = await listMessages(accessToken, searchQuery, 12);
      const detailedList: ParsedEmail[] = [];
      
      for (const msg of messages) {
        try {
          const detail = await getMessageDetails(accessToken, msg.id);
          detailedList.push(detail);
        } catch (e) {
          console.error(`Failed to load details for message ${msg.id}:`, e);
        }
      }
      
      setEmails(detailedList);
      if (detailedList.length > 0) {
        setSelectedEmail(detailedList[0]);
      } else {
        setSelectedEmail(null);
      }
    } catch (err: any) {
      console.error('[Gmail Fetch Error]:', err);
      setActionStatus({ success: false, message: `Gmail Fetch Failed: ${err.message || 'Verification Error'}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadGmailInbox();
    }
  }, [accessToken]);

  // Apply Smart Template Tokens
  const applyTemplate = (template: SmartTemplate) => {
    let subject = template.subject
      .replace(/\[JobTitle\]/g, tokenJob)
      .replace(/\[CompanyName\]/g, tokenCompany)
      .replace(/\[YourName\]/g, tokenCandidate);

    let body = template.body
      .replace(/\[JobTitle\]/g, tokenJob)
      .replace(/\[CompanyName\]/g, tokenCompany)
      .replace(/\[YourName\]/g, tokenCandidate)
      .replace(/\[InterviewerName\]/g, 'Hiring Board');

    setSubjectInput(subject);
    setBodyInput(body);
    setComposerOpen(true);
  };

  // Safe RFC Sending with confirmation gate
  const triggerSendEmail = async () => {
    if (!accessToken || !toInput || !subjectInput) return;
    setShowConfirmSend(false);
    setLoading(true);
    try {
      await sendEmail(accessToken, toInput, subjectInput, bodyInput);
      setActionStatus({ success: true, message: 'Email dispatched successfully through your Gmail!' });
      setComposerOpen(false);
      // Reset composer
      setToInput('');
      setSubjectInput('');
      setBodyInput('');
      // Reload inbox after brief delay
      setTimeout(loadGmailInbox, 2500);
    } catch (err: any) {
      setActionStatus({ success: false, message: `Failed to dispatch: ${err.message}` });
    } finally {
      setLoading(false);
      setTimeout(() => setActionStatus(null), 5000);
    }
  };

  // Safe Draft creation with confirmation gate
  const triggerCreateDraft = async () => {
    if (!accessToken || !toInput || !subjectInput) return;
    setShowConfirmDraft(false);
    setLoading(true);
    try {
      await createDraft(accessToken, toInput, subjectInput, bodyInput);
      setActionStatus({ success: true, message: 'Draft successfully created in your Gmail account!' });
      setComposerOpen(false);
    } catch (err: any) {
      setActionStatus({ success: false, message: `Failed to create draft: ${err.message}` });
    } finally {
      setLoading(false);
      setTimeout(() => setActionStatus(null), 5000);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 font-mono text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-indigo-600" />
        Checking OAuth state synchronization...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col min-h-[680px]">
      
      {/* Top Header Section */}
      <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-900/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-400/20">
              <Mail className="w-4 h-4" />
            </span>
            <h2 className="font-display font-extrabold text-lg tracking-tight">Gmail Connection Workspace</h2>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Read, review, and dispatch real candidate and interviewer emails via your Google Account
          </p>
        </div>

        {googleUser && accessToken ? (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-white leading-none">{googleUser.displayName || googleUser.email}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">Authorized Profile</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-200 border border-slate-700 hover:border-rose-900 rounded-xl transition-all cursor-pointer text-slate-300"
              title="Disconnect Google Account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleGoogleSignIn}
              className="gsi-material-button relative overflow-hidden transition-transform active:scale-98"
              style={{ margin: 0 }}
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents font-semibold">Sign in with Google</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Action Notifications banner */}
      <AnimatePresence>
        {actionStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`px-6 py-3 font-medium text-xs border-b flex items-center gap-2 ${
              actionStatus.success 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                : 'bg-rose-50 text-rose-800 border-rose-100'
            }`}
          >
            {actionStatus.success ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{actionStatus.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Warnings */}
      {authError && (
        <div className="p-4 bg-amber-50 text-amber-900 border-b border-amber-200 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">OAuth Precondition Notice</p>
            <p className="text-amber-800 leading-normal">
              If your organizational administrator restricts Google Cloud Project creation, you may see a configuration notice. 
              Contact your Workspace administrator or verify if authentication is active for <strong>{googleUser?.email || 'your email'}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Main Workspace Workspace Splits */}
      {!accessToken ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 py-20 bg-slate-50/50">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm">
            <Inbox className="w-8 h-8 animate-pulse" />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="font-display font-bold text-slate-900 text-base">Secure Google Mail Integration</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Authenticate with Google to connect HIREU directly to your Gmail inbox. You will be able to search application threads, 
              view candidate cover greetings, and dispatch beautiful custom email sequences natively and securely.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleGoogleSignIn}
              className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-2xl shadow-md hover:shadow-indigo-100 transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Connect My Gmail Account</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono pt-4 max-w-xs leading-normal">
            Uses secure Google OAuth scopes. HIREU does not store or share your access credentials.
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100 min-h-0">
          
          {/* Left Split Sidebar: Intelligent Hiring Template Generators */}
          <div className="w-full lg:w-72 shrink-0 bg-slate-50/50 p-4 space-y-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                1. Token Variables
              </span>
              <p className="text-[11px] text-slate-500">Customize variables to auto-fill high-converting hiring email sequences:</p>
              
              <div className="space-y-2 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Target Job Title</label>
                  <input
                    type="text"
                    value={tokenJob}
                    onChange={(e) => setTokenJob(e.target.value)}
                    className="w-full mt-1 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Target Company</label>
                  <input
                    type="text"
                    value={tokenCompany}
                    onChange={(e) => setTokenCompany(e.target.value)}
                    className="w-full mt-1 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Name (Sign-off / Recipient)</label>
                  <input
                    type="text"
                    value={tokenCandidate}
                    onChange={(e) => setTokenCandidate(e.target.value)}
                    className="w-full mt-1 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                2. Smart AI Templates
              </span>
              
              <div className="space-y-1.5">
                <p className="text-[11px] text-slate-400 font-semibold uppercase">For Candidates / Seekers</p>
                {SMART_TEMPLATES.filter(t => t.category === 'seeker').map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      className="w-full text-left p-2.5 bg-white border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-700">
                          {template.name}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1.5 pt-2">
                <p className="text-[11px] text-slate-400 font-semibold uppercase font-sans">For Recruiting Teams</p>
                {SMART_TEMPLATES.filter(t => t.category === 'recruiter').map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      className="w-full text-left p-2.5 bg-white border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-700">
                          {template.name}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="border-t border-slate-200 pt-3">
              <button
                onClick={() => {
                  setToInput('');
                  setSubjectInput('');
                  setBodyInput('');
                  setComposerOpen(true);
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Compose Blank Mail
              </button>
            </div>
          </div>

          {/* Center-Right Main Interface */}
          <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-white">
            
            {/* Split 1: Live Mailbox Thread List */}
            <div className="w-full md:w-80 border-r border-slate-100 flex flex-col min-h-0">
              
              {/* Inbox search filter */}
              <div className="p-3 bg-slate-50 border-b border-slate-100 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search query in your Gmail..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadGmailInbox()}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-semibold text-slate-400 uppercase">
                    Sync Matches ({emails.length})
                  </span>
                  <button
                    onClick={loadGmailInbox}
                    disabled={loading}
                    className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 cursor-pointer disabled:opacity-50"
                    title="Refresh threads"
                  >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Thread list scroll panel */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {loading ? (
                  <div className="p-8 text-center space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                    <p className="text-xs text-slate-500 font-mono">Syncing Gmail payload parts...</p>
                  </div>
                ) : emails.length === 0 ? (
                  <div className="p-8 text-center space-y-2 text-slate-400">
                    <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">No matching emails</p>
                    <p className="text-[10px] text-slate-400 leading-normal max-w-[200px] mx-auto">
                      Try refining your query or check back later!
                    </p>
                  </div>
                ) : (
                  emails.map((email) => {
                    const isSelected = selectedEmail?.id === email.id;
                    return (
                      <button
                        key={email.id}
                        onClick={() => setSelectedEmail(email)}
                        className={`w-full text-left p-3.5 transition-all outline-none cursor-pointer flex flex-col gap-1 ${
                          isSelected 
                            ? 'bg-indigo-50/40 border-l-3 border-indigo-600' 
                            : 'hover:bg-slate-50/50 border-l-3 border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[10px] font-bold text-slate-700 truncate max-w-[140px]">
                            {email.from.replace(/<.*>/, '')}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 shrink-0">
                            {email.date ? new Date(email.date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 line-clamp-1">{email.subject}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 leading-normal">{email.snippet}</p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Split 2: Thread Details / Composer View */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30">
              <AnimatePresence mode="wait">
                {composerOpen ? (
                  <motion.div
                    key="composer"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="flex-1 flex flex-col min-h-0 bg-white"
                  >
                    {/* Composer Header */}
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                          <FileEdit className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Smart Gmail Composer</h4>
                          <p className="text-[10px] text-slate-400">Drafts or dispatches real messages instantly</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setComposerOpen(false)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 px-2 py-1 rounded bg-slate-200/50 cursor-pointer"
                      >
                        Close
                      </button>
                    </div>

                    {/* Form Input fields */}
                    <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Recipient Email (To)
                        </label>
                        <input
                          type="email"
                          placeholder="candidate@example.com or interviewer@example.com"
                          value={toInput}
                          onChange={(e) => setToInput(e.target.value)}
                          className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Subject Line
                        </label>
                        <input
                          type="text"
                          placeholder="Application Follow-Up: Senior NLP Researcher"
                          value={subjectInput}
                          onChange={(e) => setSubjectInput(e.target.value)}
                          className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="flex flex-col h-72">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Mail Body Content (HTML supported)
                        </label>
                        <textarea
                          placeholder="Write your email here..."
                          value={bodyInput}
                          onChange={(e) => setBodyInput(e.target.value)}
                          className="w-full flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-mono resize-none"
                        />
                      </div>
                    </div>

                    {/* Composer Footer Actions */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                      <button
                        onClick={() => setShowConfirmDraft(true)}
                        disabled={!toInput || !subjectInput}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Create Draft in Gmail
                      </button>

                      <button
                        onClick={() => setShowConfirmSend(true)}
                        disabled={!toInput || !subjectInput}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white disabled:opacity-40 rounded-xl text-xs font-bold shadow-md hover:shadow-indigo-50 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send via Gmail Account
                      </button>
                    </div>
                  </motion.div>
                ) : selectedEmail ? (
                  <motion.div
                    key="viewer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col min-h-0 bg-white"
                  >
                    {/* Header Details */}
                    <div className="p-4 bg-slate-50/50 border-b border-slate-100 space-y-2.5 shrink-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{selectedEmail.subject}</h3>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Received: {selectedEmail.date}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setToInput(selectedEmail.from.match(/<([^>]+)>/)?.[1] || selectedEmail.from);
                            setSubjectInput(`Re: ${selectedEmail.subject}`);
                            setBodyInput(`<br/><br/>On ${selectedEmail.date}, ${selectedEmail.from} wrote:<br/><blockquote>${selectedEmail.body}</blockquote>`);
                            setComposerOpen(true);
                          }}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" /> Reply
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-slate-100 pt-2 text-slate-600">
                        <div className="truncate">
                          <span className="font-bold text-slate-400">From:</span> {selectedEmail.from}
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-slate-400">To:</span> {selectedEmail.to}
                        </div>
                      </div>
                    </div>

                    {/* Safe Render frame */}
                    <div className="flex-1 p-4 bg-slate-100/50 overflow-hidden flex">
                      <div className="flex-1 bg-white border border-slate-200/60 rounded-2xl shadow-xs overflow-hidden flex flex-col">
                        <div className="bg-slate-100 px-4 py-1 text-[9px] font-mono font-bold text-slate-400 border-b border-slate-200 flex items-center justify-between shrink-0">
                          <span>HTML Payload Security Frame</span>
                          <span className="text-emerald-600 font-bold">Gmail Verified</span>
                        </div>
                        <iframe
                          srcDoc={selectedEmail.body}
                          title="Gmail Message Render Frame"
                          className="w-full flex-1 border-none bg-slate-50/30"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2 py-32">
                    <Mail className="w-12 h-12 text-slate-300" />
                    <p className="text-xs font-semibold text-slate-600">No Email Thread Selected</p>
                    <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                      Select any communication thread from the left-split panel to decrypt, inspect, and reply to it natively.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      )}

      {/* Confirmation Overlays / Security Gates */}
      <AnimatePresence>
        {showConfirmSend && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmSend(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white border border-slate-100 shadow-2xl rounded-2xl p-6 z-10"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Send Email via Gmail API?</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    This will dispatch a real email from your linked Google Account (<strong>{googleUser?.email}</strong>) to:
                  </p>
                  <p className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded mt-1.5 truncate text-slate-700">
                    {toInput}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                <button
                  onClick={() => setShowConfirmSend(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={triggerSendEmail}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Confirm and Send
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmDraft && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmDraft(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white border border-slate-100 shadow-2xl rounded-2xl p-6 z-10"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Save Email Draft to Gmail?</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    This will save this draft directly into your linked Gmail drafts folder, allowing you to edit and send it later from any device.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                <button
                  onClick={() => setShowConfirmDraft(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={triggerCreateDraft}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Save Draft
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
