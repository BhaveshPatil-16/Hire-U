export interface Job {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  employerId?: string;
  companyLogo?: string;
  logoColor: string; // Tailwind class for soft pastel logo background, e.g. 'bg-indigo-100 text-indigo-600'
  location: string;
  salary: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  category: 'Engineering' | 'Design' | 'Product' | 'Marketing' | 'Data Science' | 'Sales';
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
  featured?: boolean;
}

export interface Company {
  id: string;
  name: string;
  logoColor: string;
  logoUrl?: string;
  industry: string;
  founded: string;
  size: string;
  headquarters: string;
  description: string;
  milestones: { year: string; title: string; description: string }[];
  values: string[];
}

export interface SuccessMetric {
  id: string;
  value: string;
  label: string;
  change: string;
  trend: 'up' | 'neutral' | 'down';
  description: string;
}

export interface TalentProfile {
  id: string;
  name: string;
  role: string;
  skills: string[];
  avatarColor: string;
  status: 'Open to Work' | 'In Discussions' | 'Hired';
  matchScore?: number;
}

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'co-1',
    name: 'Aethera Labs',
    logoColor: 'bg-purple-100 text-purple-600 border border-purple-200',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120&fit=crop&q=80',
    industry: 'Artificial Intelligence',
    founded: '2021',
    size: '150 - 500 employees',
    headquarters: 'San Francisco, CA',
    description: 'Aethera Labs is pioneering next-generation neural architecture search tools and sovereign AI models for climate tech and medical robotics.',
    milestones: [
      { year: '2021', title: 'Founded', description: 'Started by AI researchers from DeepMind and Stanford.' },
      { year: '2023', title: 'Series A Funding', description: 'Secured $45M Series A to build neural engineering compilers.' },
      { year: '2025', title: 'Carbon-Neutral Compute', description: 'Transitioned 100% of training clusters to clean, geothermally powered grids.' }
    ],
    values: ['Sovereignty of data', 'Empiricism', 'Sustainability', 'Radical candor']
  },
  {
    id: 'co-2',
    name: 'Velo Design',
    logoColor: 'bg-rose-100 text-rose-600 border border-rose-200',
    logoUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=120&h=120&fit=crop&q=80',
    industry: 'Digital Product Studio',
    founded: '2018',
    size: '50 - 150 employees',
    headquarters: 'Brooklyn, NY (Remote-First)',
    description: 'Velo is a world-class design studio focusing on immersive interfaces, web spatial computing, and digital typography systems.',
    milestones: [
      { year: '2018', title: 'Founding Team', description: 'Established as an independent design consultancy.' },
      { year: '2021', title: 'Studio Expansion', description: 'Expanded into physical interactive gallery installations.' },
      { year: '2024', title: 'Design Guild Award', description: 'Awarded Agency of the Year for high-accessibility digital systems.' }
    ],
    values: ['Craft above all', 'Inclusivity by design', 'Intellectual humility', 'Sustainable pace']
  },
  {
    id: 'co-3',
    name: 'Bloom Health',
    logoColor: 'bg-teal-100 text-teal-600 border border-teal-200',
    logoUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=120&h=120&fit=crop&q=80',
    industry: 'Digital Therapeutics',
    founded: '2019',
    size: '200 - 450 employees',
    headquarters: 'Boston, MA',
    description: 'Bloom Health develops patient-centered cognitive and therapeutic tools that connect clinically backed software with active support networks.',
    milestones: [
      { year: '2019', title: 'FDA Fast Track', description: 'Initiated therapeutic application clinical trials under fast-track status.' },
      { year: '2022', title: '1 Million Patients', description: 'Reached a milestone of serving over 1,000,000 global patients.' },
      { year: '2025', title: 'Global Reimbursement', description: 'Approved for insurance coverage across major European health networks.' }
    ],
    values: ['Empathy as infrastructure', 'Strict clinical rigor', 'Transparency', 'Equitable access']
  },
  {
    id: 'co-4',
    name: 'Prism Tech',
    logoColor: 'bg-blue-100 text-blue-600 border border-blue-200',
    logoUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=120&h=120&fit=crop&q=80',
    industry: 'Cloud Infrastructure & Security',
    founded: '2015',
    size: '500 - 1,000 employees',
    headquarters: 'Austin, TX',
    description: 'Prism Tech builds zero-trust authentication layers, edge computation protocols, and quantum-resistant network fabrics.',
    milestones: [
      { year: '2015', title: 'Stealth Launch', description: 'Started by distributed network engineers in Austin.' },
      { year: '2019', title: 'IPO', description: 'Successfully listed on NASDAQ after robust growth.' },
      { year: '2024', title: 'Quantum-Shield Released', description: 'Released first commercially available quantum-safe API proxy.' }
    ],
    values: ['Cryptographic certitude', 'Customer obsession', 'Speed of execution', 'Fail-safe design']
  },
  {
    id: 'co-5',
    name: 'Google',
    logoColor: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    logoUrl: 'https://logo.clearbit.com/google.com',
    industry: 'Technology / Cloud & AI',
    founded: '1998',
    size: '100,000+ employees',
    headquarters: 'Mountain View, CA / Bangalore, India',
    description: 'Google is a global technology leader focusing on search, cloud computing, artificial intelligence, advertising, and operating systems.',
    milestones: [
      { year: '1998', title: 'Founded', description: 'Incorporated by Larry Page and Sergey Brin.' },
      { year: '2015', title: 'Alphabet Inc.', description: 'Reorganized as a wholly-owned subsidiary of Alphabet.' },
      { year: '2025', title: 'Gemini 3.0 Release', description: 'Deployed advanced multi-modal agent capabilities globally.' }
    ],
    values: ['Focus on the user', 'Great just isnt good enough', 'Do the right thing', 'Fast is better than slow']
  },
  {
    id: 'co-6',
    name: 'Microsoft',
    logoColor: 'bg-sky-50 text-sky-600 border border-sky-100',
    logoUrl: 'https://logo.clearbit.com/microsoft.com',
    industry: 'Software & Cloud Infrastructure',
    founded: '1975',
    size: '100,000+ employees',
    headquarters: 'Redmond, WA / Hyderabad, India',
    description: 'Microsoft enables digital transformation for the era of an intelligent cloud and an intelligent edge.',
    milestones: [
      { year: '1975', title: 'Founded', description: 'Established by Bill Gates and Paul Allen.' },
      { year: '2016', title: 'LinkedIn Acquisition', description: 'Acquired professional networking site LinkedIn for $26B.' },
      { year: '2024', title: 'Copilot Cloud Integration', description: 'Infused generative AI assistants across the entire Windows & Azure suite.' }
    ],
    values: ['Innovation', 'Diversity and inclusion', 'Corporate social responsibility', 'Trustworthy computing']
  },
  {
    id: 'co-7',
    name: 'LTIMindtree',
    logoColor: 'bg-blue-50 text-blue-700 border border-blue-100',
    logoUrl: 'https://logo.clearbit.com/ltimindtree.com',
    industry: 'IT Consulting & Digital Solutions',
    founded: '1996',
    size: '80,000+ employees',
    headquarters: 'Mumbai, India',
    description: 'LTIMindtree is a global technology consulting and digital solutions company helping businesses reimagine models and accelerate growth.',
    milestones: [
      { year: '1996', title: 'Inception', description: 'Founded as L&T Information Technology.' },
      { year: '2022', title: 'Mega-Merger', description: 'Successfully merged Larsen & Toubro Infotech (LTI) and Mindtree.' },
      { year: '2025', title: 'Sovereign Cloud Platform', description: 'Launched private AI-infrastructure networks for enterprise clients.' }
    ],
    values: ['Be Customer First', 'Integrity & Transparency', 'Continuous Learning', 'Collaboration']
  },
  {
    id: 'co-8',
    name: 'Deloitte',
    logoColor: 'bg-lime-50 text-lime-700 border border-lime-100',
    logoUrl: 'https://logo.clearbit.com/deloitte.com',
    industry: 'Professional Services & Consulting',
    founded: '1845',
    size: '400,000+ employees',
    headquarters: 'London, UK / Mumbai, India',
    description: 'Deloitte provides industry-leading audit, consulting, tax, and advisory services to many of the worlds most admired brands.',
    milestones: [
      { year: '1845', title: 'First Office', description: 'William Welch Deloitte opened his office in London.' },
      { year: '2020', title: 'Deloitte Digital Shift', description: 'Expanded into full-scale cloud transformation and custom platform engineering.' },
      { year: '2024', title: 'GenAI Studio Launch', description: 'Built unified internal generative platforms for smart auditing.' }
    ],
    values: ['Lead the way', 'Serve with integrity', 'Take care of each other', 'Foster inclusion']
  },
  {
    id: 'co-9',
    name: 'NVIDIA',
    logoColor: 'bg-green-50 text-green-700 border border-green-100',
    logoUrl: 'https://logo.clearbit.com/nvidia.com',
    industry: 'Semiconductors & AI Hardware',
    founded: '1993',
    size: '25,000+ employees',
    headquarters: 'Santa Clara, CA / Bangalore, India',
    description: 'NVIDIA is the pioneer of GPU-accelerated computing, shaping the future of AI, gaming, and deep learning architectures.',
    milestones: [
      { year: '1993', title: 'Founded', description: 'Established by Jensen Huang, Chris Malachowsky, and Curtis Priem.' },
      { year: '1999', title: 'GPU Invention', description: 'Invented the GPU, transforming computer graphics and gaming.' },
      { year: '2023', title: 'Trillion Dollar Club', description: 'Surpassed $1T valuation spurred by massive global AI computing demands.' }
    ],
    values: ['One Team', 'Intellectually Honest', 'Excellence in Execution', 'Innovation']
  },
  {
    id: 'co-10',
    name: 'Bajaj Auto',
    logoColor: 'bg-slate-50 text-slate-800 border border-slate-200',
    logoUrl: 'https://logo.clearbit.com/bajajauto.com',
    industry: 'Automotive & Manufacturing',
    founded: '1945',
    size: '10,000+ employees',
    headquarters: 'Pune, India',
    description: 'Bajaj is one of the world’s leading manufacturers of two-wheelers, three-wheelers, and innovative smart electric transport systems.',
    milestones: [
      { year: '1945', title: 'Founded', description: 'Incorporated as Bachraj Trading Corporation.' },
      { year: '2020', title: 'Chetak EV Rebirth', description: 'Launched Chetak electric scooter, initiating full-scale transition to EV technologies.' },
      { year: '2024', title: 'Gigafactory Opening', description: 'Completed a state-of-the-art smart robotic production hub in Pune.' }
    ],
    values: ['Excellence', 'Integrity', 'Grit', 'Customer Centricity']
  },
  {
    id: 'co-11',
    name: 'TCS',
    logoColor: 'bg-cyan-50 text-cyan-700 border border-cyan-100',
    logoUrl: 'https://logo.clearbit.com/tcs.com',
    industry: 'IT Services & Consulting',
    founded: '1968',
    size: '600,000+ employees',
    headquarters: 'Mumbai, India',
    description: 'Tata Consultancy Services is a global leader in IT services, consulting, and business solutions partnering with large enterprises.',
    milestones: [
      { year: '1968', title: 'Founded', description: 'Established as a division of Tata Sons.' },
      { year: '2004', title: 'IPO', description: 'Successfully listed, becoming one of India’s largest public companies.' },
      { year: '2025', title: 'Cognitive Enterprise Systems', description: 'Pioneered custom enterprise automation platforms with built-in neural diagnostics.' }
    ],
    values: ['Leading with trust', 'Excellence', 'Integrity', 'Respect for individual']
  },
  {
    id: 'co-12',
    name: 'Mahindra Group',
    logoColor: 'bg-red-50 text-red-600 border border-red-100',
    logoUrl: 'https://logo.clearbit.com/mahindra.com',
    industry: 'Conglomerate & Automotive',
    founded: '1945',
    size: '250,000+ employees',
    headquarters: 'Mumbai, India',
    description: 'Mahindra is a multinational conglomerate with leadership in utility vehicles, farm equipment, information technology, and clean energy.',
    milestones: [
      { year: '1945', title: 'Founded', description: 'Inception as Muhammad & Mahindra, steel trading.' },
      { year: '2002', title: 'Scorpio Release', description: 'Launched Scorpio SUV, redefining utility design in India.' },
      { year: '2024', title: 'Born Electric platform', description: 'Unveiled high-performance dedicated EV platform architecture.' }
    ],
    values: ['Rise', 'Professionalism', 'Good Corporate Citizenship', 'First-class Quality']
  }
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior NLP Researcher',
    companyId: 'co-1',
    companyName: 'Aethera Labs',
    logoColor: 'bg-purple-100 text-purple-600 border border-purple-200',
    location: 'San Francisco, CA (Hybrid)',
    salary: '₹45,00,000 - ₹60,00,000',
    type: 'Full-time',
    category: 'Engineering',
    description: 'We are looking for a Senior NLP Researcher to lead the development of our small-footprint, local-first language representation models. You will design, train, and validate neural topologies that balance inference efficiency with high reasoning depth.',
    requirements: [
      'PhD or equivalent industry experience in Computer Science, Machine Learning, or Computational Linguistics.',
      'Extensive track record with PyTorch and compiling custom CUDA kernels.',
      'Experience with direct fine-tuning of transformer-based architectures and model distillation techniques.',
      'Strong research background evidenced by peer-reviewed publications (NeurIPS, ICML, ACL) is highly preferred.'
    ],
    benefits: [
      'Comprehensive high-tier medical, dental, and vision insurance.',
      'Unlimited geothermal compute credits for personal open-source research.',
      'Flexible hybrid workflow (2 days on-site in our net-zero emissions SF office).',
      'Generous equity options and yearly performance-based multipliers.'
    ],
    postedDate: '2 hours ago',
    featured: true
  },
  {
    id: 'job-2',
    title: 'Interaction Designer',
    companyId: 'co-2',
    companyName: 'Velo Design',
    logoColor: 'bg-rose-100 text-rose-600 border border-rose-200',
    location: 'Remote (US/Europe)',
    salary: '₹15,00,000 - ₹25,00,000',
    type: 'Remote',
    category: 'Design',
    description: 'Join our award-winning design collective to create high-fluidity, motion-driven micro-interactions and digital design structures. You will collaborate directly with frontend engineers to build accessible, elegant web canvases.',
    requirements: [
      '3+ years of experience designing high-fidelity, interactive digital layouts.',
      'Expert proficiency in Figma, interactive typography, and motion prototyping (using tools like Framer, After Effects, or direct CSS/React-motion).',
      'Solid foundational understanding of semantic HTML/CSS and digital accessibility standards (WCAG 2.1 AA).',
      'A design portfolio showcasing extreme precision, clean layouts, and functional motion.'
    ],
    benefits: [
      'Remote-first work environment with a ₹2,50,000 yearly workspace/home-office stipend.',
      'Bi-annual global studio retreats (previous locations: Tokyo, Lisbon).',
      'Co-learning allowance for conferences, workshops, and books.',
      'Full physical and mental well-being coverage plans.'
    ],
    postedDate: '1 day ago',
    featured: true
  },
  {
    id: 'job-3',
    title: 'Lead Product Manager (Therapeutics)',
    companyId: 'co-3',
    companyName: 'Bloom Health',
    logoColor: 'bg-teal-100 text-teal-600 border border-teal-200',
    location: 'Boston, MA (Hybrid)',
    salary: '₹35,00,000 - ₹50,00,000',
    type: 'Full-time',
    category: 'Product',
    description: 'Bloom Health is seeking a Lead Product Manager to steer the life-cycle of our flagship pediatric anxiety therapeutic app. You will align clinical trials, HIPAA/GDPR constraints, and behavioral design into a highly engaging, clinically validated user flow.',
    requirements: [
      '5+ years of digital product management experience, preferably in MedTech, health systems, or highly regulated consumer apps.',
      'Familiarity with clinical trial procedures and software-as-a-medical-device (SaMD) regulatory pathways.',
      'Strong ability to synthesize quantitative clinical data with qualitative patient feedback.',
      'Excellent presentation skills to align clinical advisory boards, engineering teams, and executive leaders.'
    ],
    benefits: [
      'Fully paid health, vision, and mental wellness packages.',
      'Matching 401(k) program (up to 5% with immediate vesting).',
      'Generous parental leave and custom child-care support allowances.',
      'Stunning light-filled office space in the Boston Innovation District.'
    ],
    postedDate: '3 days ago',
    featured: false
  },
  {
    id: 'job-4',
    title: 'Site Reliability Architect',
    companyId: 'co-4',
    companyName: 'Prism Tech',
    logoColor: 'bg-blue-100 text-blue-600 border border-blue-200',
    location: 'Austin, TX (On-site)',
    salary: '₹40,00,000 - ₹55,00,000',
    type: 'Full-time',
    category: 'Engineering',
    description: 'Prism Tech is looking for an SRE Architect to design fault-tolerant, high-concurrency systems hosting our distributed edge computing nodes. You will be responsible for keeping our zero-trust secure pathways operating at 99.999% uptime under extreme workloads.',
    requirements: [
      '6+ years of systems engineering or SRE experience managing Kubernetes clusters at substantial scale.',
      'Expertise in Linux kernel tuning, high-performance proxy routing (e.g., Envoy, Nginx), and network protocols.',
      'Proficiency in programming with Go, Rust, or Python for system orchestration and automated failure mitigation.',
      'Familiarity with distributed tracing systems, Prometheus, and multi-cloud configurations.'
    ],
    benefits: [
      'On-site gourmet organic cafeteria and state-of-the-art gym access.',
      'Annual tech refresh package (high-end workstation, monitors, custom peripheral allowance).',
      'Generous relocation assistance packages to Austin, TX.',
      'Highly competitive bonus structure linked to system stability and performance milestones.'
    ],
    postedDate: '5 days ago',
    featured: false
  },
  {
    id: 'job-5',
    title: 'Data Scientist (Recommender Systems)',
    companyId: 'co-1',
    companyName: 'Aethera Labs',
    logoColor: 'bg-purple-100 text-purple-600 border border-purple-200',
    location: 'Remote (US)',
    salary: '₹25,00,000 - ₹38,00,000',
    type: 'Remote',
    category: 'Data Science',
    description: 'We are expanding our matchmaking team. You will lead the implementation of collaborative filtering and graph-based recommendation systems that match specialized talent profiles with complex project scopes.',
    requirements: [
      'Master’s or PhD in Statistics, Applied Mathematics, Data Science, or related quantitative field.',
      'Strong proficiency in Python, SQL, and graph databases (Neo4j or similar).',
      'Experience deploying recommender models at scale with sub-second latency.',
      'Familiarity with vector embeddings and approximate nearest neighbor search (e.g., Pinecone, Milvus).'
    ],
    benefits: [
      'Premium health coverage and continuous learning stipends.',
      'Home office setup support (₹2,00,000 budget).',
      'Flexible working hours and absolute autonomy.',
      'Annual equity grants and profit-sharing dividends.'
    ],
    postedDate: '1 week ago',
    featured: false
  },
  {
    id: 'job-6',
    title: 'Growth Marketing Lead',
    companyId: 'co-3',
    companyName: 'Bloom Health',
    logoColor: 'bg-teal-100 text-teal-600 border border-teal-200',
    location: 'Boston, MA (Hybrid)',
    salary: '₹18,00,000 - ₹25,00,000',
    type: 'Full-time',
    category: 'Marketing',
    description: 'Bloom Health is scaling. We are seeking a analytical Growth Marketer to lead our organic and referral engines, driving user acquisition across clinical directories and employer wellness benefits integrations.',
    requirements: [
      '4+ years of data-driven growth marketing experience in consumer tech, health, or B2B2C.',
      'Deep expertise in SEO, content marketing, newsletter systems, and growth loop architecture.',
      'Strong familiarity with privacy-safe attribution models and web analytical suites.',
      'A portfolio of successful organic loops and viral coefficients built from zero.'
    ],
    benefits: [
      'Comprehensive wellness program, including fully paid therapy and wellness coaching.',
      'Transit subsidies and pre-tax parking passes.',
      'Annual study and growth grant of ₹1,50,000.',
      'Generous standard options packages.'
    ],
    postedDate: '1 week ago',
    featured: false
  },
  {
    id: 'job-7',
    title: 'Senior Software Engineer, Cloud AI',
    companyId: 'co-5',
    companyName: 'Google',
    logoColor: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    location: 'Bangalore, Karnataka (Hybrid)',
    salary: '₹35,00,000 - ₹55,00,000',
    type: 'Full-time',
    category: 'Engineering',
    description: 'Join the Google Cloud AI team to build high-performance APIs, pipeline orchestrators, and custom model runtimes driving millions of downstream developer integrations.',
    requirements: [
      '5+ years of systems programming or cloud microservices development.',
      'Extensive experience with Go, Java, or C++, and Docker/Kubernetes container systems.',
      'Strong knowledge of scalable cloud architecture patterns and gRPC communication frameworks.',
      'Familiarity with distributed machine learning training and inference pipelines.'
    ],
    benefits: [
      'Industry-leading compensation with generous stock options (GSUs).',
      'Free gourmet meals, micro-kitchens, and on-site wellness facilities.',
      'Extensive continuous learning and technical conference support.',
      'Flexible hybrid workflow and generous global mobility programs.'
    ],
    postedDate: '1 day ago',
    featured: true
  },
  {
    id: 'job-8',
    title: 'Principal Applied Researcher',
    companyId: 'co-6',
    companyName: 'Microsoft',
    logoColor: 'bg-sky-50 text-sky-600 border border-sky-100',
    location: 'Hyderabad, Telangana (On-site)',
    salary: '₹40,00,000 - ₹65,00,000',
    type: 'Full-time',
    category: 'Data Science',
    description: 'Architect multi-modal reasoning chains, stateful agents, and neural fine-tuners directly integrating with Windows and Azure core generative ecosystems.',
    requirements: [
      'MS/PhD in Computer Science, Machine Learning, or related field with a deep-learning emphasis.',
      'In-depth knowledge of LLM pre-training, RLHF alignment, and custom attention optimization.',
      'Proficiency in PyTorch, Triton, and optimizing distributed GPU tensor maps.',
      'Contributions to open-source model frameworks or academic publications (NeurIPS/ICML).'
    ],
    benefits: [
      'High-tier equity grants, wellness programs, and child-care subsidies.',
      'Dedicated research computing clusters with direct access to H100/H200 nodes.',
      'Generous workspace transformation allowance (₹2,50,000).',
      'Annual corporate performance bonuses and matching retirement funds.'
    ],
    postedDate: '3 days ago',
    featured: true
  },
  {
    id: 'job-9',
    title: 'Cloud Enterprise Consultant',
    companyId: 'co-7',
    companyName: 'LTIMindtree',
    logoColor: 'bg-blue-50 text-blue-700 border border-blue-100',
    location: 'Mumbai, Maharashtra (Hybrid)',
    salary: '₹18,00,000 - ₹28,00,000',
    type: 'Full-time',
    category: 'Engineering',
    description: 'Guide global fortune-500 enterprise migrations onto sovereign hybrid-cloud infrastructure platforms, automating CI/CD topologies and Kubernetes orchestration.',
    requirements: [
      '3-6 years of DevOps, SRE, or Cloud Consultancy experience.',
      'Hands-on expertise with AWS, Azure, or GCP cloud engineering and Terraform automation.',
      'Strong scripting skills in Bash, Python, or Go for custom automation tools.',
      'Relevant cloud certifications (e.g., AWS Solutions Architect, CKA) are highly desired.'
    ],
    benefits: [
      'Comprehensive family medical coverage and personal insurance.',
      'Generous skill-upskilling allowances and fully funded certifications.',
      'Structured career growth and technical mentorship pathways.',
      'Annual performance-linked bonuses and recognition awards.'
    ],
    postedDate: '2 days ago',
    featured: false
  },
  {
    id: 'job-10',
    title: 'Technical Advisory Lead',
    companyId: 'co-8',
    companyName: 'Deloitte',
    logoColor: 'bg-lime-50 text-lime-700 border border-lime-100',
    location: 'Gurugram, Haryana (On-site)',
    salary: '₹22,00,000 - ₹34,00,000',
    type: 'Full-time',
    category: 'Product',
    description: 'Lead cross-functional engineering and product strategy pods to audit, re-platform, and modernise core systems for top-tier digital banking and retail entities.',
    requirements: [
      '6+ years of technical product management, solution architecture, or tech consulting.',
      'Proven experience driving large-scale digital transformations from legacy to modern stacks.',
      'Superb client management, presentation, and roadmap prioritization skills.',
      'Strong business acumen coupled with a robust understanding of modern software systems.'
    ],
    benefits: [
      'Premium global health protection and comprehensive insurance benefits.',
      'Annual corporate performance-linked bonuses and profit share options.',
      'Global studio mobility and advisory team exchange programs.',
      'Continuous leadership training at Deloitte University campuses.'
    ],
    postedDate: '4 days ago',
    featured: false
  },
  {
    id: 'job-11',
    title: 'CUDA Compiler Architect',
    companyId: 'co-9',
    companyName: 'NVIDIA',
    logoColor: 'bg-green-50 text-green-700 border border-green-100',
    location: 'Bangalore, Karnataka (On-site)',
    salary: '₹50,00,000 - ₹80,00,000',
    type: 'Full-time',
    category: 'Engineering',
    description: 'Work at the bleeding edge of semiconductor hardware and systems programming. You will design next-generation LLVM compiler optimizations targeting Hopper, Blackwell, and newer GPU architectures.',
    requirements: [
      'PhD or equivalent experience in Computer Engineering, Parallel Computing, or Compiler Design.',
      'Exceptional mastery of C++, modern LLVM internals, and code-generation algorithms.',
      'Deep understanding of GPU microarchitectures, memory hierarchies, and vector operations.',
      'Familiarity with CUDA, OpenCL, or SYCL programming paradigms.'
    ],
    benefits: [
      'Top-of-market base salary paired with lucrative NVIDIA stock awards.',
      'Unmatched hardware resources: continuous access to pre-release testing clusters.',
      'On-site high-end wellness gyms and health-coaching programs.',
      'Fully catered gourmet food courts and leisure facilities.'
    ],
    postedDate: '5 days ago',
    featured: true
  },
  {
    id: 'job-12',
    title: 'Lead Control Systems Engineer (EV)',
    companyId: 'co-10',
    companyName: 'Bajaj Auto',
    logoColor: 'bg-slate-50 text-slate-800 border border-slate-200',
    location: 'Pune, Maharashtra (On-site)',
    salary: '₹16,00,000 - ₹26,00,000',
    type: 'Full-time',
    category: 'Engineering',
    description: 'Design, simulate, and calibrate firmware algorithms for smart motor controllers, regenerative braking systems, and active battery safety grids.',
    requirements: [
      '4+ years of hands-on automotive control systems engineering or firmware experience.',
      'Proficiency with MATLAB/Simulink modeling and C-code generation for microcontrollers.',
      'Strong knowledge of PMSM motor control (FOC) and battery management safety architectures.',
      'Experience in automotive communication protocols (CAN, LIN, Ethernet).'
    ],
    benefits: [
      'Generous housing/stay allowances and transit passes in Pune.',
      'Subsidized vehicle lease options and personal vehicle purchase programs.',
      'Comprehensive occupational health, medical, and accident protection.',
      'Collaborative engineering spaces backed by deep legacy tooling expertise.'
    ],
    postedDate: '6 days ago',
    featured: false
  },
  {
    id: 'job-13',
    title: 'Full Stack Solutions Lead',
    companyId: 'co-11',
    companyName: 'TCS',
    logoColor: 'bg-cyan-50 text-cyan-700 border border-cyan-100',
    location: 'Chennai, Tamil Nadu (Hybrid)',
    salary: '₹14,00,000 - ₹22,00,000',
    type: 'Full-time',
    category: 'Engineering',
    description: 'Lead high-performing teams building modern React-Node enterprise systems for international banking clients, ensuring compliance with global security regulations.',
    requirements: [
      '5+ years of full-stack engineering with React, Node.js, and TypeScript.',
      'Strong capability in managing secure PostgreSQL, SQL Server, or Oracle databases.',
      'Proven leadership skills in managing 4-8 member engineering squads in Agile sprints.',
      'Familiarity with financial security compliances (PCI-DSS, ISO-27001) is a major plus.'
    ],
    benefits: [
      'Full family medical, dental, and life coverage plans.',
      'Access to TCS digital learning academies with unrestricted certification vouchers.',
      'Excellent post-retirement benefits and matching provident funds.',
      'Structured career rotation plans with global offshore placement options.'
    ],
    postedDate: '1 week ago',
    featured: false
  },
  {
    id: 'job-14',
    title: 'Digital Product Manager',
    companyId: 'co-12',
    companyName: 'Mahindra Group',
    logoColor: 'bg-red-50 text-red-600 border border-red-100',
    location: 'Mumbai, Maharashtra (Hybrid)',
    salary: '₹20,00,000 - ₹30,00,000',
    type: 'Full-time',
    category: 'Product',
    description: 'Drive the product lifecycle of our smart connected car app, coordinating telemetry ingest pipelines, native mobile frontends, and ADAS telemetry sync integrations.',
    requirements: [
      '4+ years of product management, preferably in IoT, connected mobility, or consumer apps.',
      'Strong analytical proficiency using telemetry tracking (Amplitude, Mixpanel, SQL).',
      'Solid experience collaborating with firmware, cloud backend, and mobile frontend teams.',
      'An obsessed mindset for clean UI layouts and frictionless driver interactions.'
    ],
    benefits: [
      'Highly subsidized vehicle purchase and corporate lease offers.',
      'Premium health, accident, and life protection policies.',
      'Annual learning grants and leadership coaching programs.',
      'Exclusive access to Mahindra holiday resorts and recreational clubs.'
    ],
    postedDate: '1 week ago',
    featured: false
  }
];

export const INITIAL_SUCCESS_METRICS: SuccessMetric[] = [
  {
    id: 'metric-1',
    value: '94.2%',
    label: 'AI Recommendation Precision',
    change: '+4.8% this quarter',
    trend: 'up',
    description: 'Verified match success rate based on candidate resume and skill alignment evaluations.'
  },
  {
    id: 'metric-2',
    value: '14 Days',
    label: 'Average Time-to-Hire',
    change: '-3 Days from last year',
    trend: 'up',
    description: 'Average time taken from initial application on HIREU to signed contract offer.'
  },
  {
    id: 'metric-3',
    value: '₹102 Cr',
    label: 'Talent Salaries Facilitated',
    change: '+₹26 Cr since January',
    trend: 'up',
    description: 'Total annual compensation secured for successful placements on our platform.'
  }
];

export const TALENT_PROFILES: TalentProfile[] = [
  {
    id: 'tal-1',
    name: 'Eleanor Vance',
    role: 'Senior Machine Learning Engineer',
    skills: ['PyTorch', 'CUDA', 'Transformer Architecture', 'NLP', 'Go'],
    avatarColor: 'bg-amber-100 text-amber-700',
    status: 'Open to Work'
  },
  {
    id: 'tal-2',
    name: 'Marcus Brody',
    role: 'Staff Product Designer',
    skills: ['Figma', 'Prototyping', 'Design Systems', 'Micro-interactions', 'WebGL'],
    avatarColor: 'bg-indigo-100 text-indigo-700',
    status: 'In Discussions'
  },
  {
    id: 'tal-3',
    name: 'Siddharth Rao',
    role: 'Principal SRE Lead',
    skills: ['Kubernetes', 'Docker', 'AWS', 'Rust', 'Prometheus', 'Terraform'],
    avatarColor: 'bg-emerald-100 text-emerald-700',
    status: 'Hired'
  },
  {
    id: 'tal-4',
    name: 'Clara Oswald',
    role: 'Lead UX Copywriter & Marketer',
    skills: ['SEO', 'UX Writing', 'Brand Strategy', 'Product Launches', 'A/B Testing'],
    avatarColor: 'bg-rose-100 text-rose-700',
    status: 'Open to Work'
  }
];
