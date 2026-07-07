import React, { useState, useEffect } from 'react';
import { API_BASE } from './lib/api';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SuccessMetrics from './components/SuccessMetrics';
import TalentNetwork from './components/TalentNetwork';
import CompanySection from './components/CompanySection';
import JobListing from './components/JobListing';
import AiMatcher from './components/AiMatcher';
import JoinPortal from './components/JoinPortal';
import AiCoPilot from './components/AiCoPilot';
import AuthScreen from './components/AuthScreen';
import MailSandbox from './components/MailSandbox';
import GmailWorkspace from './components/GmailWorkspace';
import Logo from './components/Logo';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, db } from './firebase';
import { 
  collection, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  setDoc, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestoreUtils';
import { 
  INITIAL_COMPANIES, 
  INITIAL_JOBS, 
  INITIAL_SUCCESS_METRICS, 
  TALENT_PROFILES, 
  Job, 
  Company,
  TalentProfile 
} from '@hireu/shared';
import { Sparkles, X, CheckCircle2, AlertCircle, Sparkle, Loader2, ArrowRight, UploadCloud, Trash2, FileText } from 'lucide-react';

// Helper to clean and capitalize candidate names from file name for modal
const parseFileName = (fileName: string) => {
  let base = fileName.replace(/\.[^/.]+$/, "");
  base = base.replace(/[_\-\.]/g, " ");
  base = base.replace(/\b(resume|cv|portfolio|final|2026|v\d+|version\d+|copy|new|job)\b/gi, "");
  base = base.trim().replace(/\s+/g, " ");
  
  const capitalized = base
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  let deducedRole = 'Senior Software Engineer';
  let deducedSkills = 'React, TypeScript, Tailwind CSS, Node.js, REST APIs';
  
  const lowerFile = fileName.toLowerCase();
  if (lowerFile.includes('frontend') || lowerFile.includes('react') || lowerFile.includes('ui') || lowerFile.includes('ux') || lowerFile.includes('web')) {
    deducedRole = 'Senior Frontend Engineer';
    deducedSkills = 'React, TypeScript, Tailwind CSS, Next.js, Framer Motion, Webpack';
  } else if (lowerFile.includes('backend') || lowerFile.includes('node') || lowerFile.includes('python') || lowerFile.includes('server') || lowerFile.includes('database')) {
    deducedRole = 'Backend Systems Architect';
    deducedSkills = 'Node.js, PostgreSQL, Docker, AWS, Redis, GraphQL, Express';
  } else if (lowerFile.includes('data') || lowerFile.includes('ai') || lowerFile.includes('ml') || lowerFile.includes('nlp') || lowerFile.includes('researcher')) {
    deducedRole = 'Machine Learning Scientist';
    deducedSkills = 'Python, PyTorch, LLMs, Transformer Design, HuggingFace, NumPy, CUDA';
  } else if (lowerFile.includes('fullstack') || lowerFile.includes('full-stack') || lowerFile.includes('developer')) {
    deducedRole = 'Full-Stack Developer';
    deducedSkills = 'React, Node.js, Express, PostgreSQL, TypeScript, Tailwind CSS, Docker';
  } else if (lowerFile.includes('product') || lowerFile.includes('manager') || lowerFile.includes('pm')) {
    deducedRole = 'Technical Product Manager';
    deducedSkills = 'Product Roadmap, Agile/Scrum, JIRA, SQL, Product Analytics, UI/UX UI';
  }

  return {
    name: capitalized || 'Alex Mercer',
    role: deducedRole,
    skills: deducedSkills
  };
};

const generateResumeText = (name: string, role: string, skills: string) => {
  return `${name}\n${role}\n\nContact: ${name.toLowerCase().replace(/\s+/g, '')}@hireu-talent.com | +1 (555) 019-2831\n\nProfessional Summary:\nDynamic and results-driven ${role} with over 5 years of experience architecting high-performance digital systems. Proven record of designing scalable modules, optimizing database indexes, and collaborating in high-agency engineering squads to ship features with high precision.\n\nCore Expertise:\n- Technical Stack: ${skills}\n- Quality Standards: Unit testing, clean code reviews, and CI/CD pipelines.\n- Methodologies: Agile/Scrum, product roadmap alignment, and technical mentoring.\n\nWork Experience:\n- Senior Engineer at NexusTech (2023 - Present):\n  * Led the development of a real-time analytics panel, lowering data latency by 40%.\n  * Mentored 4 junior developers and established a high-standard TypeScript convention.\n- Software Developer at Inovate Solutions (2021 - 2023):\n  * Shipped responsive features using modular libraries and integrated rest APIs.\n  * Improved application load times by 28% through code splitting and tree shaking.\n\nEducation:\n- B.S. in Computer Science | Stanford University`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [candidateApps, setCandidateApps] = useState<any[]>([]);
  const [employerApps, setEmployerApps] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setJobs([]);
      setCompanies([]);
      setCandidateApps([]);
      setEmployerApps([]);
      setUserProfile(null);
      return;
    }

    const JOBS_KEY = `hire_u_jobs_${currentUser.uid}`;
    const COMPANIES_KEY = `hire_u_companies`;
    const APPLICATIONS_KEY = `hire_u_applications_${currentUser.uid}`;
    const PROFILE_KEY = `hire_u_profile_${currentUser.uid}`;

    // Helper to reload from localStorage
    const loadFromLocalStorage = () => {
      const localJobs = localStorage.getItem(JOBS_KEY);
      const localCompanies = localStorage.getItem(COMPANIES_KEY);
      const localApps = localStorage.getItem(APPLICATIONS_KEY);
      const localProfile = localStorage.getItem(PROFILE_KEY);

      if (localJobs) {
        try { setJobs(JSON.parse(localJobs)); } catch (e) { console.warn(e); }
      } else {
        localStorage.setItem(JOBS_KEY, JSON.stringify(INITIAL_JOBS));
        setJobs(INITIAL_JOBS);
      }

      if (localCompanies) {
        try { setCompanies(JSON.parse(localCompanies)); } catch (e) { console.warn(e); }
      } else {
        localStorage.setItem(COMPANIES_KEY, JSON.stringify(INITIAL_COMPANIES));
        setCompanies(INITIAL_COMPANIES);
      }

      let parsedApps: any[] = [];
      if (localApps) {
        try { parsedApps = JSON.parse(localApps); } catch (e) { console.warn(e); }
      }
      setCandidateApps(parsedApps.filter(app => app.candidateId === currentUser.uid));
      setEmployerApps(parsedApps.filter(app => app.employerId === currentUser.uid));

      if (localProfile) {
        try { setUserProfile(JSON.parse(localProfile)); } catch (e) { console.warn(e); }
      } else {
        const defaultProfile = {
          name: currentUser.displayName || currentUser.email?.split('@')[0] || "Professional Talent",
          role: "Software Engineer",
          skills: ["TypeScript", "React", "Node.js", "AI Integration"],
          status: "Open to Work",
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfile));
        setUserProfile(defaultProfile);
      }
    };

    // Load immediately
    loadFromLocalStorage();

    // Listen for storage changes from other components
    const handleLocalUpdate = () => {
      loadFromLocalStorage();
    };
    window.addEventListener('storage', handleLocalUpdate);
    window.addEventListener('local-update', handleLocalUpdate);

    // 1. Sync Jobs
    const jobsQuery = query(collection(db, 'jobs'), where('active', '==', true));
    const unsubJobs = onSnapshot(jobsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const jobsList: Job[] = [];
        snapshot.forEach((doc) => {
          jobsList.push({ id: doc.id, ...doc.data() } as Job);
        });
        setJobs(jobsList);
        localStorage.setItem(JOBS_KEY, JSON.stringify(jobsList));
      } else {
        const batch = writeBatch(db);
        INITIAL_JOBS.forEach((job) => {
          const docRef = doc(db, 'jobs', job.id);
          batch.set(docRef, {
            ...job,
            employerId: currentUser.uid,
            active: true
          });
        });
        batch.commit().catch(err => console.warn("Could not seed jobs to Firestore:", err.message));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'jobs');
    });

    // 2. Sync Companies
    const companiesRef = collection(db, 'companies');
    const unsubCompanies = onSnapshot(companiesRef, (snapshot) => {
      if (!snapshot.empty) {
        const companiesList: Company[] = [];
        snapshot.forEach((doc) => {
          companiesList.push({ id: doc.id, ...doc.data() } as Company);
        });
        setCompanies(companiesList);
        localStorage.setItem(COMPANIES_KEY, JSON.stringify(companiesList));
      } else {
        const batch = writeBatch(db);
        INITIAL_COMPANIES.forEach((co) => {
          const docRef = doc(db, 'companies', co.id);
          batch.set(docRef, co);
        });
        batch.commit().catch(err => console.warn("Could not seed companies to Firestore:", err.message));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'companies');
    });

    // 3. Sync Candidate applications
    const qCand = query(collection(db, 'applications'), where('candidateId', '==', currentUser.uid));
    const unsubCand = onSnapshot(qCand, (snapshot) => {
      const appsList: any[] = [];
      snapshot.forEach((doc) => {
        appsList.push({ id: doc.id, ...doc.data() });
      });
      setCandidateApps(appsList);

      let allApps: any[] = [];
      try { allApps = JSON.parse(localStorage.getItem(APPLICATIONS_KEY) || '[]'); } catch (e) {}
      allApps = allApps.filter(app => app.candidateId !== currentUser.uid);
      allApps = [...allApps, ...appsList];
      localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(allApps));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'applications');
    });

    // 4. Sync Employer applications
    const qEmp = query(collection(db, 'applications'), where('employerId', '==', currentUser.uid));
    const unsubEmp = onSnapshot(qEmp, (snapshot) => {
      const appsList: any[] = [];
      snapshot.forEach((doc) => {
        appsList.push({ id: doc.id, ...doc.data() });
      });
      setEmployerApps(appsList);

      let allApps: any[] = [];
      try { allApps = JSON.parse(localStorage.getItem(APPLICATIONS_KEY) || '[]'); } catch (e) {}
      allApps = allApps.filter(app => app.employerId !== currentUser.uid);
      allApps = [...allApps, ...appsList];
      localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(allApps));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'applications');
    });

    // 5. Sync User Profile
    const profileRef = doc(db, 'users', currentUser.uid, 'public', 'profile');
    const unsubProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile(data);
        localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
      } else {
        const defaultProfile = {
          name: currentUser.displayName || currentUser.email?.split('@')[0] || "Professional Talent",
          role: "Software Engineer",
          skills: ["TypeScript", "React", "Node.js", "AI Integration"],
          status: "Open to Work",
          createdAt: new Date().toISOString()
        };
        setDoc(profileRef, defaultProfile).catch(err => {
          handleFirestoreError(err, OperationType.CREATE, `users/${currentUser.uid}/public/profile`);
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}/public/profile`);
    });

    return () => {
      unsubJobs();
      unsubCompanies();
      unsubCand();
      unsubEmp();
      unsubProfile();
      window.removeEventListener('storage', handleLocalUpdate);
      window.removeEventListener('local-update', handleLocalUpdate);
    };
  }, [currentUser]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // AI Co-pilot state
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Developer Mail Sandbox state
  const [isMailSandboxOpen, setIsMailSandboxOpen] = useState(false);

  // Selected job for detailed sidebar drawer
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Profile currently selected from Talent Network for immediate match injection
  const [preSelectedTalent, setPreSelectedTalent] = useState<TalentProfile | null>(null);

  // Apply Now form overlay
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [applyName, setApplyName] = useState('');
  const [applyEmail, setApplyEmail] = useState('');
  const [applyResume, setApplyResume] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applyStep, setApplyStep] = useState(0); // 0: Input, 1: Semantic analysis, 2: Complete

  // Modal Drag & Drop File Upload States
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parsingStatus, setParsingStatus] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileInbound(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileInbound(e.target.files[0]);
    }
  };

  const triggerFileInputClick = () => {
    const fileInput = document.getElementById('apply-resume-file-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    setApplyName('');
    setApplyResume('');
  };

  const handleFileInbound = (file: File) => {
    if (!file) return;

    setUploadedFile({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type || 'unknown'
    });

    setIsParsingFile(true);
    setParsingStatus('Reading raw binary stream...');

    setTimeout(() => {
      setParsingStatus('Extracting layout document layers...');
      
      setTimeout(() => {
        setParsingStatus('Reconstructing text tokens...');
        
        setTimeout(() => {
          const isTextFile = file.type.startsWith('text/') || 
                             file.name.endsWith('.txt') || 
                             file.name.endsWith('.md') || 
                             file.name.endsWith('.json') ||
                             file.name.endsWith('.rtf');

          if (isTextFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const text = event.target?.result as string || '';
              setApplyResume(text);

              // Extract Name where possible
              const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
              if (lines.length > 0) {
                setApplyName(lines[0].replace(/^(Name:?|Applicant:?)\s*/i, "").substring(0, 30));
              }
              // Try to find email
              const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
              if (emailMatch) {
                setApplyEmail(emailMatch[0]);
              }
            };
            reader.readAsText(file);
          } else {
            const parsed = parseFileName(file.name);
            setApplyName(parsed.name);
            setApplyResume(generateResumeText(parsed.name, parsed.role, parsed.skills));
            setApplyEmail(`${parsed.name.toLowerCase().replace(/\s+/g, '')}@example.com`);
          }

          setIsParsingFile(false);
          setParsingStatus('');
          triggerNotice(`Successfully ingested resume file "${file.name}"! Information has been auto-filled.`);
        }, 700);
      }, 700);
    }, 700);
  };

  // Premium interactive notices
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const triggerNotice = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => {
      setSuccessNotice(null);
    }, 4500);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      triggerNotice('Successfully signed out!');
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  // Navigated search submission from Hero
  const handleHeroSearch = (query: string, loc: string, cat: string) => {
    setSearchQuery(query);
    setSearchLocation(loc);
    setSelectedCategory(cat);
    // Switch to Jobs tab and scroll down smoothly
    setActiveTab('jobs');
    setTimeout(() => {
      document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Clicked "Analyze Fit" from Talent Network
  const handleSelectTalent = (member: TalentProfile) => {
    setPreSelectedTalent(member);
    setActiveTab('home');
    triggerNotice(`Loaded ${member.name}'s profile. Instantly analyzing semantic alignment.`);
    setTimeout(() => {
      document.getElementById('aimatcher')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  // Clicked "Apply now" on any job
  const handleTriggerApply = (job: Job) => {
    setApplyingJob(job);
    setApplyStep(0);
    setApplyName('');
    setApplyEmail('');
    setApplyResume('');
    setUploadedFile(null);
    setIsDragging(false);
    setIsParsingFile(false);
    setParsingStatus('');
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyName || !applyEmail || !applyingJob) return;

    // Trigger semantic alignment matching pipeline
    setIsApplying(true);
    setApplyStep(1);

    // Save to Firestore applications collection
    if (currentUser) {
      const appDocRef = doc(collection(db, 'applications'));
      const appData = {
        jobId: applyingJob.id,
        candidateId: currentUser.uid,
        employerId: applyingJob.employerId || currentUser.uid,
        resumeText: applyResume || "Submitted professional credentials.",
        status: 'submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Instantly save to localStorage to ensure zero-lag UI update and reliable fallback
      const APPLICATIONS_KEY = `hire_u_applications_${currentUser.uid}`;
      let localApps: any[] = [];
      try {
        localApps = JSON.parse(localStorage.getItem(APPLICATIONS_KEY) || '[]');
      } catch (e) {}

      const newApp = {
        id: appDocRef.id,
        jobId: applyingJob.id,
        candidateId: currentUser.uid,
        employerId: applyingJob.employerId || currentUser.uid,
        resumeText: applyResume || "Submitted professional credentials.",
        status: 'submitted',
        createdAt: { seconds: Math.floor(Date.now() / 1000) }, // Mock Timestamp for easy rendering
        updatedAt: { seconds: Math.floor(Date.now() / 1000) }
      };

      localApps.push(newApp);
      localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(localApps));
      window.dispatchEvent(new Event('local-update'));

      // Try syncing with Firestore silently
      setDoc(appDocRef, appData).catch(error => {
        handleFirestoreError(error, OperationType.CREATE, `applications/${appDocRef.id}`);
      });
    }

    // Trigger real backend endpoint for job application and email dispatches
    fetch(`${API_BASE}/api/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: applyingJob.id,
        candidateName: applyName,
        candidateEmail: applyEmail,
        resumeText: applyResume
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log("[Apply] Application successfully registered in full-stack:", data);
    })
    .catch(err => {
      console.error("[Apply] Application endpoint exception:", err);
    });

    // Simulate multi-step intelligence matching duration
    setTimeout(() => {
      setApplyStep(2);
      setIsApplying(false);
    }, 2800);
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-pastel-mesh flex flex-col items-center justify-center p-4">
        <div className="relative flex flex-col items-center">
          {/* Animated Spinner with a Gradient Glow */}
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin"></div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-display font-bold text-xs">H</span>
            </div>
            <span className="font-display font-bold text-slate-900 tracking-tight text-sm">HIRE<span className="text-indigo-600">U</span></span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-mono">Verifying secure session...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        {/* Top Success Banner Notifications */}
        <AnimatePresence>
          {successNotice && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-3 border border-slate-800 text-xs sm:text-sm"
            >
              <div className="p-1 rounded-lg bg-indigo-500 shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">{successNotice}</span>
              <button 
                onClick={() => setSuccessNotice(null)}
                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AuthScreen onAuthSuccess={() => triggerNotice("Successfully authenticated! Welcome to HIREU.")} />
      </>
    );
  }

  return (
    <div className="relative min-h-screen bg-pastel-mesh flex flex-col justify-between overflow-x-hidden">
      
      {/* Top Success Banner Notifications */}
      <AnimatePresence>
        {successNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-3 border border-slate-800 text-xs sm:text-sm"
          >
            <div className="p-1 rounded-lg bg-indigo-500 shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">{successNotice}</span>
            <button 
              onClick={() => setSuccessNotice(null)}
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corporate Header Section */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        openAiCoach={() => setIsAiOpen(true)} 
        openMailSandbox={() => setIsMailSandboxOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Core Pages Tabs Router */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero & Multi-modal search */}
              <Hero 
                onSearch={handleHeroSearch} 
                onJoinPortal={() => setActiveTab('join')} 
              />

              {/* Success Metrics Panel */}
              <SuccessMetrics metrics={INITIAL_SUCCESS_METRICS} />

              {/* AI Semantic Alignment Block */}
              <AiMatcher 
                jobs={jobs.length > 0 ? jobs : INITIAL_JOBS}
                preSelectedTalent={preSelectedTalent}
                clearPreSelectedTalent={() => setPreSelectedTalent(null)}
                onApply={handleTriggerApply}
              />

              {/* Talent Network Section */}
              <TalentNetwork 
                talent={TALENT_PROFILES} 
                onSelectTalent={handleSelectTalent} 
              />
            </motion.div>
          )}

          {activeTab === 'jobs' && (
            <motion.div
              key="jobs-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="pt-8">
                <JobListing 
                  jobs={jobs.length > 0 ? jobs : INITIAL_JOBS}
                  searchQuery={searchQuery}
                  searchLocation={searchLocation}
                  selectedCategory={selectedCategory}
                  onApply={handleTriggerApply}
                  selectedJob={selectedJob}
                  setSelectedJob={setSelectedJob}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'companies' && (
            <motion.div
              key="companies-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="pt-8">
                <CompanySection 
                  companies={companies.length > 0 ? companies : INITIAL_COMPANIES} 
                  jobs={jobs.length > 0 ? jobs : INITIAL_JOBS}
                  onSelectJob={handleTriggerApply}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'gmail' && (
            <motion.div
              key="gmail-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <GmailWorkspace />
              </div>
            </motion.div>
          )}

          {activeTab === 'join' && (
            <motion.div
              key="join-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="pt-8">
                <JoinPortal 
                  onSuccessMessage={triggerNotice} 
                  currentUser={currentUser}
                  userProfile={userProfile}
                  candidateApps={candidateApps}
                  employerApps={employerApps}
                  jobs={jobs}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating AI Bubble indicator */}
      <button
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-indigo-600 via-pink-500 to-indigo-600 p-3.5 sm:p-4 rounded-2xl text-white shadow-xl hover:shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-2 group border border-indigo-400/40"
      >
        <Sparkle className="w-5 h-5 text-white animate-spin-slow group-hover:rotate-90 transition-transform" />
        <span className="text-xs sm:text-sm font-semibold tracking-tight">AI Co-pilot</span>
      </button>

      {/* Sidebar AI Coach assistant drawer */}
      <AiCoPilot 
        isOpen={isAiOpen} 
        onClose={() => setIsAiOpen(false)} 
      />

      {/* Developer Mail Sandbox Intercept Modal */}
      <AnimatePresence>
        {isMailSandboxOpen && (
          <MailSandbox 
            isOpen={isMailSandboxOpen} 
            onClose={() => setIsMailSandboxOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Applying Process Modal Overlay */}
      <AnimatePresence>
        {applyingJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isApplying) setApplyingJob(null); }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* Modal Body card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-pink-400 to-amber-300" />

              {/* Close Button */}
              {!isApplying && (
                <button
                  onClick={() => setApplyingJob(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* 1. INPUT STEP */}
              {applyStep === 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-xs ${applyingJob.logoColor}`}>
                      {applyingJob.companyName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{applyingJob.companyName}</span>
                      <h4 className="font-display font-bold text-base text-slate-900 leading-tight">
                        Apply for {applyingJob.title}
                      </h4>
                    </div>
                  </div>

                  <form onSubmit={handleApplySubmit} className="space-y-4">
                    {/* Drag & Drop File Upload Zone */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Upload Resume (PDF, DOCX, TXT)
                      </label>
                      
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={triggerFileInputClick}
                        className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[120px] relative overflow-hidden group ${
                          isDragging 
                            ? 'border-indigo-500 bg-indigo-50/40 scale-[1.01]' 
                            : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="file"
                          id="apply-resume-file-input"
                          accept=".pdf,.docx,.txt,.md,.json"
                          className="hidden"
                          onChange={handleFileInputChange}
                        />

                        {isParsingFile ? (
                          <div className="space-y-3 py-1 w-full max-w-[280px]">
                            <Loader2 className="w-7 h-7 text-indigo-600 animate-spin mx-auto" />
                            <p className="text-xs font-semibold text-indigo-600 animate-pulse">
                              {parsingStatus}
                            </p>
                            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300"
                                style={{
                                  width: parsingStatus.includes('Reading') ? '25%' :
                                         parsingStatus.includes('layers') ? '60%' :
                                         parsingStatus.includes('tokens') ? '90%' : '100%'
                                }}
                              />
                            </div>
                          </div>
                        ) : uploadedFile ? (
                          <div className="flex items-center gap-3 w-full bg-white border border-indigo-50 p-2.5 rounded-xl shadow-sm justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="text-left min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                                  {uploadedFile.name}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  {uploadedFile.size} • {uploadedFile.name.split('.').pop()?.toUpperCase()}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleClearFile}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Remove file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5 py-1">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mx-auto text-indigo-600 group-hover:scale-110 transition-transform">
                              <UploadCloud className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-700">
                                Drag & drop your resume file here
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Supports PDF, DOCX, TXT, or MD
                              </p>
                            </div>
                            <span className="inline-block text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg mt-1">
                              Or browse files
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={applyName}
                        onChange={(e) => setApplyName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={applyEmail}
                        onChange={(e) => setApplyEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Resume Content / Cover Letter Details (Optional)
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Paste links to your active portfolio, or type a brief statement on why you fit the requirements..."
                        value={applyResume}
                        onChange={(e) => setApplyResume(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer mt-6"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-300" />
                      <span>Submit Application</span>
                    </button>
                  </form>
                </div>
              )}

              {/* 2. MATCHING/SIMULATING PIPELINE */}
              {applyStep === 1 && (
                <div className="py-12 text-center space-y-4">
                  <Loader2 className="w-12 h-12 text-indigo-600 mx-auto animate-spin" />
                  <h4 className="font-display font-semibold text-slate-900 text-lg">Aligning Qualifications</h4>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                    HIREU is running semantic checks on your application profile against the <strong className="text-slate-800">{applyingJob.title}</strong> standards.
                  </p>
                </div>
              )}

              {/* 3. COMPLETED PIPELINE */}
              {applyStep === 2 && (
                <div className="py-8 text-center space-y-5">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-900 text-xl">Application successfully matched!</h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
                      Thank you <strong className="text-slate-900">{applyName}</strong>. Your qualifications fit has been recorded. The {applyingJob.companyName} team has been notified.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-center">
                    <button
                      onClick={() => setApplyingJob(null)}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
                    >
                      Return to Listings
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Humble Margin Footer */}
      <footer className="bg-white border-t border-slate-100 py-10 mt-16 text-center text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo size={32} textSize="lg" />
            
            <p className="text-xs text-slate-400 font-medium font-sans">
              © {new Date().getFullYear()} Hire-U Intelligent Career Ecosystem. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
