import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Copy, ClipboardCheck, ArrowRight, UserCheck, ShieldCheck, HelpCircle, FileText, FileSpreadsheet, Loader2, RefreshCw, UploadCloud, Trash2, CheckCircle2, CloudLightning } from 'lucide-react';
import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { Job } from '../types';

// Helper to clean and capitalize candidate names from file name
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

interface JoinPortalProps {
  onSuccessMessage: (msg: string) => void;
  currentUser: any;
  userProfile: any;
  candidateApps: any[];
  employerApps: any[];
  jobs: Job[];
}

export default function JoinPortal({ 
  onSuccessMessage, 
  currentUser, 
  userProfile, 
  candidateApps, 
  employerApps, 
  jobs 
}: JoinPortalProps) {
  const [role, setRole] = useState<'candidate' | 'employer'>('candidate');
  
  // Candidate form states
  const [candName, setCandName] = useState('');
  const [candSkills, setCandSkills] = useState('');
  const [candResume, setCandResume] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);

  // Drag & drop file upload states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parsingStatus, setParsingStatus] = useState('');

  // Drag & drop events
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
    const fileInput = document.getElementById('resume-file-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    setCandName('');
    setCandSkills('');
    setCandResume('');
  };

  const handleFileInbound = (file: File) => {
    if (!file) return;

    // Visual loading state
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
              setCandResume(text);

              // Extract Name & Skills where possible
              const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
              if (lines.length > 0) {
                // Try to strip out extra things to get a clean name
                setCandName(lines[0].replace(/^(Name:?|Applicant:?)\s*/i, "").substring(0, 30));
              }

              const skillsKeywords = ['react', 'typescript', 'tailwind', 'python', 'pytorch', 'node', 'docker', 'aws', 'sql', 'next.js', 'angular', 'vue'];
              const detected = skillsKeywords.filter(k => text.toLowerCase().includes(k));
              if (detected.length > 0) {
                setCandSkills(detected.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', '));
              } else {
                setCandSkills('Extracted from text document');
              }
            };
            reader.readAsText(file);
          } else {
            // PDF or Word
            const parsed = parseFileName(file.name);
            setCandName(parsed.name);
            setCandSkills(parsed.skills);
            setCandResume(generateResumeText(parsed.name, parsed.role, parsed.skills));
          }

          setIsParsingFile(false);
          setParsingStatus('');
          onSuccessMessage(`Successfully ingested resume file "${file.name}"! Information has been auto-filled.`);
        }, 700);
      }, 700);
    }, 700);
  };

  // Employer form states
  const [empTitle, setEmpTitle] = useState('');
  const [empCompany, setEmpCompany] = useState('');
  const [empIndustry, setEmpIndustry] = useState('');
  const [empReqs, setEmpReqs] = useState('');
  const [empSalary, setEmpSalary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Firestore Sync & Publish states
  const [isSyncingProfile, setIsSyncingProfile] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleSyncProfile = async () => {
    if (!currentUser) {
      onSuccessMessage("Please sign in to sync your profile.");
      return;
    }
    setIsSyncingProfile(true);
    try {
      const profileRef = doc(db, 'users', currentUser.uid, 'public', 'profile');
      const profileData = {
        name: scanResult?.candidateName || candName || currentUser.displayName || currentUser.email?.split('@')[0] || "Professional Talent",
        role: scanResult?.suggestedRoles?.[0] || "Software Engineer",
        skills: scanResult?.detectedSkills || candSkills.split(',').map(s => s.trim()).filter(Boolean) || ["TypeScript", "React"],
        status: "Open to Work",
        createdAt: userProfile?.createdAt || new Date().toISOString()
      };
      
      // Instantly save to localStorage and notify App
      localStorage.setItem(`hire_u_profile_${currentUser.uid}`, JSON.stringify(profileData));
      window.dispatchEvent(new Event('local-update'));

      try {
        await setDoc(profileRef, profileData);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/public/profile`);
      }
      onSuccessMessage("Profile successfully synchronized with HIREU Talent Network!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}/public/profile`);
    } finally {
      setIsSyncingProfile(false);
    }
  };

  const handlePublishJob = async () => {
    if (!currentUser) {
      onSuccessMessage("Please sign in to publish job postings.");
      return;
    }
    setIsPublishing(true);
    const jobDocRef = doc(collection(db, 'jobs'));
    try {
      const jobData = {
        id: jobDocRef.id,
        title: empTitle,
        companyId: empCompany.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'co-1',
        companyName: empCompany,
        employerId: currentUser?.uid,
        salary: empSalary || "₹18,00,000 - ₹30,00,000",
        active: true,
        location: "Remote",
        type: "Remote",
        category: "Engineering",
        description: generatedPost,
        requirements: empReqs.split(',').map(r => r.trim()).filter(Boolean),
        benefits: ["Remote work environment", "Medical & dental coverage", "Continuous learning allowance"],
        postedDate: "Just now",
        logoColor: "bg-indigo-100 text-indigo-600 border border-indigo-200"
      };

      // Instantly save to localStorage and notify App
      const JOBS_KEY = `hire_u_jobs_${currentUser.uid}`;
      let localJobs: any[] = [];
      try {
        localJobs = JSON.parse(localStorage.getItem(JOBS_KEY) || '[]');
      } catch (e) {}
      localJobs.push(jobData);
      localStorage.setItem(JOBS_KEY, JSON.stringify(localJobs));
      window.dispatchEvent(new Event('local-update'));

      try {
        await setDoc(jobDocRef, jobData);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `jobs/${jobDocRef.id}`);
      }
      onSuccessMessage(`Successfully published listing: "${empTitle}" to the Job Board!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `jobs/${jobDocRef.id}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // Sample Resume Fill
  const fillSampleResume = () => {
    setCandName('John Doe');
    setCandSkills('React, TypeScript, Tailwind CSS, Node.js, Next.js, PostgreSQL');
    setCandResume(
      `John Doe\nSenior Frontend Engineer\n\nExperience:\n- Senior Developer at NovaTech (2022 - 2026): Architected complex UI design systems using React and TypeScript. Improved page load speed by 35% using lazy-loading and web workers.\n- Software Engineer at CoreTech (2020 - 2022): Developed user dashboards and responsive admin panels.\n\nSkills: JavaScript, TypeScript, React, Tailwind CSS, Node.js, Express, PostgreSQL, Git, Agile methodology.`
    );
  };

  // Sample Employer Fill
  const fillSampleEmployer = () => {
    setEmpTitle('Staff Frontend Developer');
    setEmpCompany('Aethera Labs');
    setEmpIndustry('Artificial Intelligence');
    setEmpReqs('Framer Motion, Tailwind CSS, Performance optimization, design systems alignment');
  };

  const handleScanResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candResume.trim()) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      const response = await fetch('/api/ai/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: candResume })
      });
      const data = await response.json();
      setScanResult(data.analysis);
      onSuccessMessage('Resume analyzed successfully with HIREU Intelligence!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleGenerateJobPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empTitle.trim() || !empCompany.trim()) return;

    setIsGenerating(true);
    setGeneratedPost('');

    try {
      const response = await fetch('/api/ai/generate-job-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: empTitle,
          companyName: empCompany,
          industry: empIndustry,
          keyRequirements: empReqs
        })
      });
      const data = await response.json();
      setGeneratedPost(data.post);
      onSuccessMessage('Premium Markdown Job Description generated!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="join" className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 mb-3">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI workspace</span>
          </div>
          <h2 className="font-display font-bold text-3xl text-slate-900 tracking-tight">
            HIREU Talent Gateway
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Select your intent pathway. Review candidate profiles using automated AI resume audits, or leverage LLMs to build high-converting job posts.
          </p>

          {/* Toggle Pathway Button */}
          <div className="mt-8 inline-flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
            <button
              onClick={() => setRole('candidate')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                role === 'candidate'
                  ? 'bg-white text-indigo-600 shadow-md shadow-indigo-50 border border-slate-100'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <FileText className="w-4 h-4" />
              Candidate Hub
            </button>
            <button
              onClick={() => setRole('employer')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                role === 'employer'
                  ? 'bg-white text-indigo-600 shadow-md shadow-indigo-50 border border-slate-100'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Employer Space
            </button>
          </div>
        </div>

        {/* Pathway Renderers */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <AnimatePresence mode="wait">
            {role === 'candidate' ? (
              // CANDIDATE PATHWAY PANEL
              <motion.div
                key="candidate-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* Form Input Panel */}
                <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-indigo-600" />
                      Resume Audit & Scanner
                    </h3>
                    <button
                      onClick={fillSampleResume}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer bg-indigo-50/50 hover:bg-indigo-50 px-2.5 py-1 rounded-lg"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Fill Sample
                    </button>
                  </div>

                  <form onSubmit={handleScanResume} className="space-y-4">
                    {/* Drag & Drop File Upload Zone */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Upload Resume Document (PDF, DOCX, TXT)
                      </label>
                      
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={triggerFileInputClick}
                        className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden group ${
                          isDragging 
                            ? 'border-indigo-500 bg-indigo-50/40 scale-[1.01]' 
                            : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="file"
                          id="resume-file-input"
                          accept=".pdf,.docx,.txt,.md,.json"
                          className="hidden"
                          onChange={handleFileInputChange}
                        />

                        {isParsingFile ? (
                          <div className="space-y-3 py-2 w-full max-w-[280px]">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                            <p className="text-xs font-semibold text-indigo-600 animate-pulse">
                              {parsingStatus}
                            </p>
                            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300"
                                style={{
                                  width: parsingStatus.includes('Ingesting') ? '25%' :
                                         parsingStatus.includes('layout') ? '60%' :
                                         parsingStatus.includes('reconstructing') ? '90%' : '100%'
                                }}
                              />
                            </div>
                          </div>
                        ) : uploadedFile ? (
                          <div className="flex items-center gap-3 w-full bg-white border border-indigo-50 p-3 rounded-xl shadow-sm justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="text-left min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
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
                          <div className="space-y-2 py-2">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mx-auto text-indigo-600 group-hover:scale-110 transition-transform">
                              <UploadCloud className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-700">
                                Drag & drop your resume file here
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                Supports PDF, DOCX, TXT, or MD (Max 5MB)
                              </p>
                            </div>
                            <span className="inline-block text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                              Or browse files
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Candidate Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={candName}
                        onChange={(e) => setCandName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Interests or Key Skills (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="React, AWS, Machine Learning"
                        value={candSkills}
                        onChange={(e) => setCandSkills(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Review / Edit Resume Content
                      </label>
                      <textarea
                        rows={7}
                        required
                        placeholder="Paste your resume summary, engineering positions, certifications, and academic degrees here..."
                        value={candResume}
                        onChange={(e) => setCandResume(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-sans leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isScanning || !candResume.trim()}
                      className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isScanning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>AI Scanning Resume Content...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Run Premium Audit Scanner</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Audit Results Panel */}
                <div className="lg:col-span-7 space-y-6">
                  {scanResult ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white border border-indigo-100/80 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-pink-400 to-amber-300" />
                      
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                        <div>
                          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-500">HIREU Intelligence Report</p>
                          <h4 className="font-display font-bold text-xl text-slate-900 mt-1">
                            {scanResult.candidateName || 'Candidate Profile'} Audit
                          </h4>
                        </div>
                        <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Checked
                        </span>
                      </div>

                      {/* Bento Results Grid */}
                      <div className="space-y-5">
                        {/* Summary Block */}
                        <div>
                          <h5 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Seniority & Overview Fit</h5>
                          <p className="text-slate-700 text-sm leading-relaxed bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                            {scanResult.experienceSummary}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Skills Detected */}
                          <div>
                            <h5 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Detected Hard Skills</h5>
                            <div className="flex flex-wrap gap-1.5">
                              {scanResult.detectedSkills?.map((skill: string) => (
                                <span key={skill} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-mono border border-indigo-100/50">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Suggested Career Roles */}
                          <div>
                            <h5 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Suggested Pathway Roles</h5>
                            <div className="space-y-1.5">
                              {scanResult.suggestedRoles?.map((roleName: string) => (
                                <div key={roleName} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                  <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                                  <span>{roleName}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Resume Gaps */}
                        <div>
                          <h5 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 text-rose-500">Identified Gaps</h5>
                          <ul className="space-y-2">
                            {scanResult.gaps?.map((gap: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                                <span>{gap}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Resume Action Improvements */}
                        <div>
                          <h5 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 text-indigo-600">Actionable Copy Improvements</h5>
                          <ul className="space-y-2">
                            {scanResult.improvements?.map((imp: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                                <span>{imp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Synchronize Profile Action */}
                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                          <button
                            onClick={handleSyncProfile}
                            disabled={isSyncingProfile}
                            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-100"
                          >
                            {isSyncingProfile ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Syncing with Firestore...</span>
                              </>
                            ) : (
                              <>
                                <CloudLightning className="w-4 h-4 text-amber-300" />
                                <span>Save & Sync Profile to HIREU Network</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-10 bg-white/40 border border-dashed border-slate-200 rounded-3xl text-center min-h-[400px]">
                      <FileText className="w-12 h-12 text-slate-300 mb-4 animate-pulse" />
                      <h4 className="font-display font-semibold text-slate-800 text-lg">Awaiting profile input</h4>
                      <p className="text-slate-500 text-xs sm:text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">
                        Input your technical backgrounds or paste your actual resume raw bullets in the scanner panel, and click audit to receive deep-dive career mapping.
                      </p>
                    </div>
                  )}
                </div>

                {/* Candidate Applications List */}
                {currentUser && candidateApps && candidateApps.length > 0 && (
                  <div className="col-span-12 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <h4 className="font-display font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-indigo-600" />
                      My Submitted Applications ({candidateApps.length})
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Position & Company</th>
                            <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Applied Date</th>
                            <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50/50">
                          {candidateApps.map((app) => {
                            const job = jobs.find(j => j.id === app.jobId);
                            return (
                              <tr key={app.id} className="hover:bg-slate-50/50 transition-all duration-150">
                                <td className="py-4">
                                  <div className="font-semibold text-slate-800 text-sm">{job?.title || "Senior AI Scientist"}</div>
                                  <div className="text-xs text-slate-400 mt-0.5">{job?.companyName || "HIREU Partner"}</div>
                                </td>
                                <td className="py-4 text-xs text-slate-500">
                                  {app.createdAt?.seconds ? new Date(app.createdAt.seconds * 1000).toLocaleDateString() : "Just now"}
                                </td>
                                <td className="py-4">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    app.status === 'shortlisted' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                    app.status === 'reviewing' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                    app.status === 'declined' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                                    'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                  }`}>
                                    {app.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              // EMPLOYER PATHWAY PANEL
              <motion.div
                key="employer-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* Form Inputs */}
                <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      AI Job Post Builder
                    </h3>
                    <button
                      onClick={fillSampleEmployer}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer bg-indigo-50/50 hover:bg-indigo-50 px-2.5 py-1 rounded-lg"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Fill Sample
                    </button>
                  </div>

                  <form onSubmit={handleGenerateJobPost} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Target Job Title
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Senior Frontend Architect"
                        value={empTitle}
                        onChange={(e) => setEmpTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Aethera Labs"
                        value={empCompany}
                        onChange={(e) => setEmpCompany(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Industry / Focus Sector
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Artificial Intelligence, Digital Products"
                        value={empIndustry}
                        onChange={(e) => setEmpIndustry(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Target Salary Range
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ₹18,00,000 - ₹30,00,000"
                        value={empSalary}
                        onChange={(e) => setEmpSalary(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Core Technical Skills to Highlight
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Deep PyTorch experience, compiler knowledge, net-zero computing alignment..."
                        value={empReqs}
                        onChange={(e) => setEmpReqs(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isGenerating || !empTitle.trim() || !empCompany.trim()}
                      className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>AI Structuring Post Content...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate Markdown Description</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Generator Outputs */}
                <div className="lg:col-span-7 space-y-6">
                  {generatedPost ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white border border-indigo-100/80 rounded-3xl p-6 sm:p-8 shadow-md relative"
                    >
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                        <div>
                          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-500">HIREU Copywriter Engine</p>
                          <h4 className="font-display font-bold text-lg text-slate-900 mt-1">
                            Generated Job Post Template
                          </h4>
                        </div>
                        
                        <button
                          onClick={copyToClipboard}
                          className="px-3.5 py-2 rounded-xl text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          {copied ? (
                            <>
                              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Copied Listing!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Markdown</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Display Markdown Post */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 max-h-[420px] overflow-y-auto">
                        <pre className="text-slate-800 text-xs font-sans whitespace-pre-wrap leading-relaxed">
                          {generatedPost}
                        </pre>
                      </div>

                      {/* Publish Job Button */}
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={handlePublishJob}
                          disabled={isPublishing}
                          className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-100"
                        >
                          {isPublishing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Publishing...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                              <span>Publish Job Listing to Live Board</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-10 bg-white/40 border border-dashed border-slate-200 rounded-3xl text-center min-h-[400px]">
                      <FileSpreadsheet className="w-12 h-12 text-slate-300 mb-4 animate-pulse" />
                      <h4 className="font-display font-semibold text-slate-800 text-lg">Awaiting position specifications</h4>
                      <p className="text-slate-500 text-xs sm:text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">
                        Input targeted title, company, and key skills in the builder panel, and click generate. Our language model will craft an elegant, competitive recruitment template.
                      </p>
                    </div>
                  )}
                </div>

                {/* Employer Dashboard Sections (Zero-Trust filters enforced via security rules) */}
                {currentUser && (
                  <div className="col-span-12 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* My Posted Jobs */}
                    <div className="lg:col-span-6 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                      <h4 className="font-display font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        My Active Postings ({jobs.filter(j => (j as any).employerId === currentUser.uid).length})
                      </h4>
                      {jobs.filter(j => (j as any).employerId === currentUser.uid).length === 0 ? (
                        <p className="text-slate-400 text-xs leading-relaxed">No active listings posted yet. Use the builder above to publish your first job.</p>
                      ) : (
                        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                          {jobs.filter(j => (j as any).employerId === currentUser.uid).map((job) => (
                            <div key={job.id} className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                              <div>
                                <h5 className="font-semibold text-slate-800 text-sm">{job.title}</h5>
                                <p className="text-xs text-slate-400 mt-1">{job.salary || "₹18,00,000 - ₹30,00,000"} • {job.location}</p>
                              </div>
                              <button
                                onClick={async () => {
                                  if (confirm(`Are you sure you want to delete "${job.title}"?`)) {
                                    // Update localStorage immediately
                                    const JOBS_KEY = `hire_u_jobs_${currentUser.uid}`;
                                    let localJobs: any[] = [];
                                    try {
                                      localJobs = JSON.parse(localStorage.getItem(JOBS_KEY) || '[]');
                                    } catch (e) {}
                                    localJobs = localJobs.filter(j => j.id !== job.id);
                                    localStorage.setItem(JOBS_KEY, JSON.stringify(localJobs));
                                    window.dispatchEvent(new Event('local-update'));

                                    // Try updating Firestore silently
                                    try {
                                      await deleteDoc(doc(db, 'jobs', job.id));
                                    } catch (err) {
                                      handleFirestoreError(err, OperationType.DELETE, `jobs/${job.id}`);
                                    }
                                    onSuccessMessage(`Deleted job listing: "${job.title}"`);
                                  }
                                }}
                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                title="Delete Job"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Applicant Responses */}
                    <div className="lg:col-span-6 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                      <h4 className="font-display font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-indigo-600" />
                        Applicant Responses ({employerApps.length})
                      </h4>
                      {employerApps.length === 0 ? (
                        <p className="text-slate-400 text-xs leading-relaxed">No applications received for your listings yet.</p>
                      ) : (
                        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                          {employerApps.map((app) => {
                            const job = jobs.find(j => j.id === app.jobId);
                            return (
                              <div key={app.id} className="p-4 border border-slate-100 rounded-2xl space-y-3 hover:bg-slate-50/50 transition-colors">
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <h5 className="font-semibold text-slate-800 text-sm">Anonymous Candidate</h5>
                                    <p className="text-xs text-indigo-600 mt-0.5 font-semibold">Applied to: {job?.title || "Unknown Job"}</p>
                                  </div>
                                  
                                  <select
                                    value={app.status}
                                    onChange={async (e) => {
                                      const newStatus = e.target.value;
                                      
                                      // Update localStorage immediately
                                      const APPLICATIONS_KEY = `hire_u_applications_${currentUser.uid}`;
                                      let localApps: any[] = [];
                                      try {
                                        localApps = JSON.parse(localStorage.getItem(APPLICATIONS_KEY) || '[]');
                                      } catch (ex) {}
                                      localApps = localApps.map(a => a.id === app.id ? { ...a, status: newStatus } : a);
                                      localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(localApps));
                                      window.dispatchEvent(new Event('local-update'));

                                      // Try updating Firestore silently
                                      try {
                                        await updateDoc(doc(db, 'applications', app.id), {
                                          status: newStatus,
                                          updatedAt: serverTimestamp()
                                        });
                                      } catch (err) {
                                        handleFirestoreError(err, OperationType.UPDATE, `applications/${app.id}`);
                                      }
                                      onSuccessMessage(`Updated applicant status to "${newStatus}"`);
                                    }}
                                    className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-100 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-sm"
                                  >
                                    <option value="submitted">Submitted</option>
                                    <option value="reviewing">Reviewing</option>
                                    <option value="shortlisted">Shortlisted</option>
                                    <option value="declined">Declined</option>
                                  </select>
                                </div>
                                
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/60">
                                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">Resume Excerpt</p>
                                  <p className="text-xs text-slate-600 line-clamp-3 italic leading-relaxed">
                                    {app.resumeText}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
}
