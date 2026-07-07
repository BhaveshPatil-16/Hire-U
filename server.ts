import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { INITIAL_JOBS, INITIAL_COMPANIES, Job } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ==========================================
// EMAIL INTEGRATION & DEVELOPER MAIL SANDBOX
// ==========================================
interface SentEmail {
  id: string;
  to: string;
  from: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  timestamp: string;
  status: "sent" | "failed" | "sandbox";
  error?: string;
}

const sentEmails: SentEmail[] = [];

async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || "HIREU Intelligent Platform <noreply@hireu-talent.com>";

  const emailId = `mail-${Math.random().toString(36).substring(2, 11)}`;
  const timestamp = new Date().toISOString();

  const isSmtpConfigured = !!host && !!user && !!pass;

  if (isSmtpConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });

      await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text,
      });

      const record: SentEmail = {
        id: emailId,
        to,
        from,
        subject,
        bodyHtml: html,
        bodyText: text,
        timestamp,
        status: "sent"
      };
      sentEmails.unshift(record);
      console.log(`[Email] Real email successfully sent via SMTP to ${to}`);
      return { success: true, status: "sent" as const, id: emailId };
    } catch (err: any) {
      console.error("[Email] Failed to send real email via SMTP:", err);
      const record: SentEmail = {
        id: emailId,
        to,
        from,
        subject,
        bodyHtml: html,
        bodyText: text,
        timestamp,
        status: "failed",
        error: err.message
      };
      sentEmails.unshift(record);
      return { success: false, status: "failed" as const, error: err.message, id: emailId };
    }
  } else {
    // Save to sandbox inbox
    const record: SentEmail = {
      id: emailId,
      to,
      from,
      subject,
      bodyHtml: html,
      bodyText: text,
      timestamp,
      status: "sandbox"
    };
    sentEmails.unshift(record);
    console.log(`[Email] SMTP not configured. Saved to HIREU Sandbox Inbox for ${to}`);
    return { success: true, status: "sandbox" as const, id: emailId };
  }
}

// Lazy-loaded Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not configured. Falling back to rule-based offline intelligence.");
    return null;
  }
  
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ==========================================
// API ENDPOINTS
// ==========================================

// 1. Check API Status and capabilities
app.get("/api/status", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
  res.json({
    status: "ok",
    aiEnabled: hasKey,
    modelUsed: "gemini-3.5-flash",
    fallbackActive: !hasKey
  });
});

// Helper for offline matching
function offlineMatch(skillsText: string): any[] {
  const cleanedText = skillsText.toLowerCase();
  return INITIAL_JOBS.map(job => {
    let matches = 0;
    const keywords = [
      job.title.toLowerCase(),
      job.category.toLowerCase(),
      ...job.requirements.map(r => r.toLowerCase()),
      job.description.toLowerCase()
    ];
    
    // Simple word matching
    const searchWords = cleanedText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ").split(/\s+/).filter(w => w.length > 2);
    for (const word of searchWords) {
      if (keywords.some(kw => kw.includes(word))) {
        matches += 1;
      }
    }
    
    // Dynamic scoring between 40% and 95%
    const score = Math.min(95, Math.max(40, Math.round(40 + (matches / (searchWords.length + 1)) * 55)));
    
    // Offline commentary
    let explanation = `Your profile aligns nicely with the ${job.title} role at ${job.companyName}. `;
    if (score > 75) {
      explanation += `We found strong semantic overlap in core domains like ${job.category}. We highly recommend applying immediately.`;
    } else if (score > 55) {
      explanation += `Good structural fit. To boost your suitability, consider highlighting skills like: ${job.requirements[0].substring(0, 30)}...`;
    } else {
      explanation += `Modest overlap. Good opportunity to stretch your skillset or customize your resume highlight deck.`;
    }

    return {
      jobId: job.id,
      score,
      explanation,
      gaps: [
        `Highlight more project work related to ${job.category}.`,
        `Flesh out practical scenarios where you applied ${job.requirements[1] ? job.requirements[1].substring(0, 25) : 'industry frameworks'}.`
      ],
      strengths: [
        `Active skills alignment for ${job.title}.`,
        `Fits the ${job.type} workspace preference.`
      ]
    };
  }).sort((a, b) => b.score - a.score);
}

// 2. AI MATCHING API
app.post("/api/ai/match", async (req, res) => {
  const { skills, resumeText } = req.body;
  const inputContext = (skills || "") + " " + (resumeText || "");
  
  if (!inputContext.trim()) {
    return res.status(400).json({ error: "No input skills or resume content provided." });
  }

  const ai = getAiClient();
  if (!ai) {
    // Return offline mock matching calculations
    const matches = offlineMatch(inputContext);
    return res.json({
      matches,
      offline: true,
      notice: "Using offline semantic matching engine (API key not configured)."
    });
  }

  try {
    const jobsSchemaList = INITIAL_JOBS.map(j => ({
      id: j.id,
      title: j.title,
      company: j.companyName,
      category: j.category,
      requirements: j.requirements
    }));

    const prompt = `You are the master AI Talent Matching Engine for HIREU.
    Given the candidate's profile context:
    "${inputContext}"

    We have the following list of active jobs:
    ${JSON.stringify(jobsSchemaList, null, 2)}

    Analyze the candidate's alignment against each job.
    Calculate a match score (0-100) based on requirements, domain, seniority, and skill overlap.
    Provide actionable feedback containing:
    1. A premium, concise, personalized explanation of why they are or aren't a match.
    2. Specific gaps they should bridge or highlight on their resume to win this role.
    3. Distinct strengths their profile showcases relative to this job.

    Return the analysis strictly as a JSON array corresponding to each job, ordered by highest match score first.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              jobId: { type: Type.STRING, description: "The ID of the analyzed job" },
              score: { type: Type.INTEGER, description: "The match score from 0 to 100" },
              explanation: { type: Type.STRING, description: "A detailed 2-3 sentence personalized feedback" },
              gaps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of 2-3 specific gaps or skills missing"
              },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of 2-3 matching strengths"
              }
            },
            required: ["jobId", "score", "explanation", "gaps", "strengths"]
          }
        },
        systemInstruction: "You are a professional corporate talent matching engine. Your analysis is precise, honest, supportive, and lacks generic filler."
      }
    });

    const result = JSON.parse(response.text || "[]");
    res.json({ matches: result, offline: false });
  } catch (err: any) {
    console.error("Gemini AI matching error:", err);
    // Fallback to offline on error
    const matches = offlineMatch(inputContext);
    res.json({
      matches,
      offline: true,
      error: err.message,
      notice: "An error occurred during AI generation. Falling back to local offline semantic matching."
    });
  }
});

// Helper for offline resume analysis
function offlineAnalyzeResume(text: string): any {
  return {
    candidateName: "Applicant",
    detectedSkills: ["React", "TypeScript", "Node.js", "Tailwind CSS", "REST APIs", "Git", "Framer Motion"],
    suggestedRoles: ["Full-stack Engineer", "Frontend Developer", "Digital Product UI Developer"],
    experienceSummary: "Showcases standard building practices. Demonstrates comfortable fluency with component-driven web frameworks.",
    gaps: [
      "No direct mention of systems architecture or distributed cloud orchestrations.",
      "Could benefit from articulating quantifiable impact (e.g. percentages, load-time reductions)."
    ],
    improvements: [
      "Add a 'Key Technical Accomplishments' section with metrics.",
      "Include active repositories or active demo URLs for your projects.",
      "Tailor your profile summary to match specific domain roles like Artificial Intelligence or FinTech."
    ]
  };
}

// 3. AI RESUME ANALYZER API
app.post("/api/ai/analyze-resume", async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText || resumeText.trim() === "") {
    return res.status(400).json({ error: "Please provide a valid resume text to analyze." });
  }

  const ai = getAiClient();
  if (!ai) {
    const analysis = offlineAnalyzeResume(resumeText);
    return res.json({
      analysis,
      offline: true,
      notice: "Using offline resume analyzer (API key not configured)."
    });
  }

  try {
    const prompt = `You are a high-tier executive recruiter and professional resume consultant.
    Analyze the following resume/portfolio raw text:
    "${resumeText}"

    Perform a deep-dive parse and output:
    1. Candidate name (if detectable, else 'Applicant').
    2. A list of key technical and soft skills successfully detected.
    3. The top 3 suggested career roles they should target.
    4. A concise summary of their professional experience and seniority level.
    5. Notable gaps in their resume or qualifications.
    6. Practical, actionable improvements they can make to their layout or resume text.

    Return the result strictly as a clean JSON object following the specified schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidateName: { type: Type.STRING },
            detectedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
            experienceSummary: { type: Type.STRING },
            gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["candidateName", "detectedSkills", "suggestedRoles", "experienceSummary", "gaps", "improvements"]
        }
      }
    });

    const analysis = JSON.parse(response.text || "{}");
    res.json({ analysis, offline: false });
  } catch (err: any) {
    console.error("Gemini AI resume analysis error:", err);
    res.json({
      analysis: offlineAnalyzeResume(resumeText),
      offline: true,
      error: err.message
    });
  }
});

// Helper for offline chat
function offlineChat(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("job") || m.includes("openings") || m.includes("work")) {
    return `We currently have ${INITIAL_JOBS.length} premium roles open on HIREU, including:\n\n` +
      INITIAL_JOBS.map(j => `• **${j.title}** at *${j.companyName}* (${j.salary}, ${j.location})`).join("\n") +
      `\n\nYou can use our **AI Match** panel on the portal to paste your resume or list your skills, and I will instantly check your fit for these roles!`;
  }
  if (m.includes("resume") || m.includes("portfolio")) {
    return `To optimize your resume for HIREU openings:\n\n1. Ensure your core languages & tools are clearly visible at the top.\n2. Quantify achievements (e.g., "Optimized database index structures, reducing query delays by 42%").\n3. Use our **AI Match / Resume Review** panel to get granular feedback on gaps and action items.`;
  }
  if (m.includes("interview") || m.includes("prep") || m.includes("practice")) {
    return `Preparing is key! Let's do a mock prep. What is your target role?\n\n*Pro-tip*: When answering engineering questions, always structure answers with the **STAR** method (Situation, Task, Action, Result) and explain your trade-offs.`;
  }
  return `Hi there! I am your **HIREU AI Career Co-pilot**. I can help you search our active positions, refine your resume bullet points, draft high-converting cover letters, or practice mock interview loops. \n\nTry asking me:\n- *"What jobs are open right now?"*\n- *"How do I improve my resume for a Senior NLP Researcher role?"*\n- *"Draft a short cold outreach email for Velo Design"*`;
}

// 4. CHAT CO-PILOT API
app.post("/api/ai/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  const ai = getAiClient();
  const lastUserMessage = messages[messages.length - 1]?.content || "";

  if (!ai) {
    const text = offlineChat(lastUserMessage);
    return res.json({ text, offline: true });
  }

  try {
    // Format messages for standard chat
    const systemPrompt = `You are 'HireU Co-pilot', a premium, highly professional AI Career Coach and Job Assistant on the HIREU portal.
    Your personality is highly encouraging, extremely knowledgeable, polished, and direct.
    You know about these open jobs on HIREU: ${JSON.stringify(INITIAL_JOBS.map(j => ({title: j.title, company: j.companyName, location: j.location, salary: j.salary})), null, 2)}.
    Help candidates match with jobs, give advice on interview strategies, draft high-conversion cover letters, or perfect their career narrative.
    Keep answers beautifully structured with markdown (bolding, spacing, clean lists). Keep it punchy, conversational, and elite.`;

    const contents = messages.map(msg => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7
      }
    });

    res.json({ text: response.text || "I apologize, I could not generate a response. Please try again.", offline: false });
  } catch (err: any) {
    console.error("Gemini Chat error:", err);
    res.json({
      text: offlineChat(lastUserMessage) + "\n\n*(Note: Running in offline backup mode due to an API service exception.)*",
      offline: true,
      error: err.message
    });
  }
});

// Helper for offline Job Post Generation
function offlineGenerateJobPost(title: string, company: string): string {
  return `### Job Title: Senior ${title || "Engineer"}
**Company:** ${company || "Incubator Tech"}
**Location:** Remote (Global) / Hybrid
**Salary:** Competitive Market Rate + Equity

#### **About the Role**
We are seeking an exceptional, self-driven **Senior ${title || "Engineer"}** to join our growing innovation engineering squad. In this position, you will own key functional domains, scale reliable services, and collaborate closely with product planners to ship highly polished digital features.

#### **Key Responsibilities**
* Architect, test, and deploy resilient front-to-back systems with high uptime.
* Lead peer design reviews, fostering a culture of technical excellence and collaborative learning.
* Translate abstract product specs into clean, responsive, and reusable code modules.
* Optimize systems for scale, latency, and overall compute efficiency.

#### **Requirements**
* 5+ years of practical industry experience in related roles.
* Deep mastery of modern development ecosystems (e.g. TypeScript, React, Docker, Node.js).
* Demonstrated experience handling production web scale, microservice routers, or complex state models.
* A portfolio or project catalog showing strong user-centered designs and flawless layouts.

#### **Benefits**
* Full-coverage health, vision, and wellness subscriptions.
* Continuous learning grant and annual home-office equipment stipend (₹1,50,000).
* Uncapped PTO policy and flexible, output-oriented work hours.
* Global collaborative summits and deep-work retreats.`;
}

// 5. EMPLOYER - GENERATE JOB POST API
app.post("/api/ai/generate-job-post", async (req, res) => {
  const { title, companyName, industry, keyRequirements } = req.body;
  if (!title || !companyName) {
    return res.status(400).json({ error: "Job title and company name are required." });
  }

  const ai = getAiClient();
  if (!ai) {
    const post = offlineGenerateJobPost(title, companyName);
    return res.json({ post, offline: true });
  }

  try {
    const prompt = `You are a premium recruitment writer at HIREU.
    Create a highly professional, attractive, and polished Job Description in beautiful Markdown format.
    
    Company: ${companyName}
    Industry: ${industry || "Technology"}
    Job Title: ${title}
    Key Skills/Requirements to Highlight: ${keyRequirements || "Collaborative mindset, scalability, attention to detail"}

    Use a elegant layout with clear sections:
    - About the Role
    - Key Responsibilities
    - Requirements (make them professional, concise, and structured)
    - Benefits & Perks (make them sound premium and competitive)

    Ensure the tone matches a modern, high-growth, high-talent organization. Deliver ONLY the markdown content.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.8
      }
    });

    res.json({ post: response.text || offlineGenerateJobPost(title, companyName), offline: false });
  } catch (err: any) {
    console.error("Gemini Job post generation error:", err);
    res.json({
      post: offlineGenerateJobPost(title, companyName),
      offline: true,
      error: err.message
    });
  }
});


// ==========================================
// EMAIL ENDPOINTS
// ==========================================

// 1. Get sent emails
app.get("/api/emails", (req, res) => {
  res.json({ emails: sentEmails });
});

// 2. Apply for a Job and trigger confirmation emails
app.post("/api/apply", async (req, res) => {
  const { jobId, candidateName, candidateEmail, resumeText, coverLetter } = req.body;

  if (!jobId || !candidateName || !candidateEmail) {
    return res.status(400).json({ error: "Missing required application parameters." });
  }

  const job = INITIAL_JOBS.find(j => j.id === jobId);
  if (!job) {
    return res.status(404).json({ error: "Job opening not found." });
  }

  // Define email body (HTML & text)
  const candidateSubject = `Application Received: ${job.title} at ${job.companyName}`;
  const candidateHtml = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f1f5f9; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      <div style="text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
        <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; background: linear-gradient(135deg, #4f46e5, #ec4899); color: #ffffff; font-weight: bold; font-size: 22px; text-align: center;">H</div>
        <h2 style="color: #0f172a; margin-top: 12px; font-size: 20px; font-weight: 800; letter-spacing: -0.025em;">HIREU Intelligent Gateway</h2>
      </div>
      
      <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">Hi <strong>${candidateName}</strong>,</p>
      
      <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">We have successfully received your application for the <strong>${job.title}</strong> role at <strong>${job.companyName}</strong>.</p>
      
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin: 24px 0;">
        <h3 style="color: #475569; margin-top: 0; margin-bottom: 12px; font-size: 12px; text-transform: uppercase; font-family: monospace; letter-spacing: 0.05em; font-weight: 700;">Application Details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b; width: 120px;">Position:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${job.title}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Company:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${job.companyName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Location:</td>
            <td style="padding: 6px 0; color: #334155;">${job.location}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Status:</td>
            <td style="padding: 6px 0;">
              <span style="background-color: #ecfdf5; color: #047857; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; border: 1px solid #a7f3d0; text-transform: uppercase; font-family: monospace;">Semantic Matched</span>
            </td>
          </tr>
        </table>
      </div>

      <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Our AI Semantic Alignment Matching engine has processed your background. The hiring squad at <strong>${job.companyName}</strong> has been notified and holds copy of your credentials fit metrics.</p>
      
      <p style="color: #64748b; font-size: 13px; line-height: 1.6; border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 28px;">
        <em>Need assistance? Reach out to our career Co-pilot directly inside your HIREU console.</em>
      </p>
    </div>
  `;

  const candidateText = `Hi ${candidateName},\n\nWe have successfully received your application for the position of ${job.title} at ${job.companyName} (${job.location}).\n\nYour profile has been matching-audited and the recruitment committee has been notified.\n\nThank you for choosing HIREU!\n\nBest regards,\nHIREU Intelligent Team`;

  // 1. Send applicant confirmation email
  const candidateResult = await sendEmail({
    to: candidateEmail,
    subject: candidateSubject,
    html: candidateHtml,
    text: candidateText
  });

  // 2. Send a notification email to the employer about the candidate
  const employerSubject = `[HIREU Recruiter Alert] New application for ${job.title} from ${candidateName}`;
  const employerHtml = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f1f5f9; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      <div style="text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
        <h2 style="color: #4f46e5; margin: 0; font-size: 18px; font-weight: 800; text-transform: uppercase; font-family: monospace; letter-spacing: 0.05em;">New HIREU Applicant</h2>
      </div>
      
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">Dear <strong>${job.companyName} Hiring Committee</strong>,</p>
      
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">A candidate has applied for your active listing: <strong>${job.title}</strong>.</p>
      
      <div style="background-color: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 16px; padding: 20px; margin: 24px 0;">
        <h3 style="color: #be185d; margin-top: 0; margin-bottom: 12px; font-size: 12px; text-transform: uppercase; font-family: monospace; letter-spacing: 0.05em;">Applicant Profile</h3>
        <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Name:</strong> ${candidateName}</p>
        <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Email:</strong> ${candidateEmail}</p>
        <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>Source:</strong> AI Semantic Match Stream</p>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-top: 20px;">
        <h3 style="color: #1e293b; margin-top: 0; margin-bottom: 8px; font-size: 11px; text-transform: uppercase; font-family: monospace; color: #64748b;">Submitted Resume/Notes Highlight</h3>
        <pre style="white-space: pre-wrap; font-size: 12px; color: #334155; font-family: monospace; line-height: 1.6; margin: 0;">${resumeText || "No additional text attached."}</pre>
      </div>

      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-top: 24px;">You can review this application alignment in detail inside your <strong>HIREU Employer Space</strong>.</p>
    </div>
  `;
  const employerText = `Dear ${job.companyName} Hiring Team,\n\nAn elite candidate, ${candidateName} (${candidateEmail}), has applied for your active opening: ${job.title}.\n\nReview this candidate directly in your Employer Dashboard on HIREU.\n\nBest regards,\nHIREU Talent Gateway`;

  // Send recruiter notification email
  await sendEmail({
    to: `recruiting@${job.companyName.toLowerCase().replace(/\s+/g, '')}.com`,
    subject: employerSubject,
    html: employerHtml,
    text: employerText
  });

  res.json({
    success: true,
    candidateEmailSent: candidateResult.success,
    status: candidateResult.status,
    id: candidateResult.id
  });
});

// 3. Send Auth Welcome email when a user registers
app.post("/api/auth/welcome", async (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  const welcomeSubject = `Welcome to HIREU - Your Intelligent Talent Gateway is Active!`;
  const welcomeHtml = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f1f5f9; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      <div style="text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
        <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; background: linear-gradient(135deg, #4f46e5, #ec4899); color: #ffffff; font-weight: bold; font-size: 22px; text-align: center;">H</div>
        <h2 style="color: #0f172a; margin-top: 12px; font-size: 20px; font-weight: 800; letter-spacing: -0.025em;">Welcome to HIREU!</h2>
      </div>
      
      <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">Hi <strong>${name || email.split('@')[0]}</strong>,</p>
      
      <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Congratulations! Your active session on HIREU is now securely authenticated and initialized. You have successfully unlocked access to our premium AI-powered intelligent matching engines and recruiting tools.</p>
      
      <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 16px; padding: 20px; margin: 24px 0;">
        <h3 style="color: #6d28d9; margin-top: 0; margin-bottom: 12px; font-size: 13px; font-weight: 700; text-transform: uppercase; font-family: monospace; letter-spacing: 0.05em;">What's next for you?</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #4c1d95; line-height: 1.6;">
          <li style="margin-bottom: 8px;"><strong>AI Resume Audit:</strong> Ingest your PDF/Word resume in the Candidate Hub for instant layout, gaps, and improvements audit.</li>
          <li style="margin-bottom: 8px;"><strong>Premium Match scoring:</strong> View real-time matching metrics against open roles at elite tech organizations.</li>
          <li><strong>AI Career Co-pilot:</strong> Engage with our interactive chat assistant to draft covers or practice mock tech interviews.</li>
        </ul>
      </div>

      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">If you have unconfigured SMTP settings, this mail was safely routed to the in-app Developer Sandbox Inbox. To receive real-world external emails to your local mailbox, declare your host SMTP server in your environmental settings.</p>
      
      <p style="color: #64748b; font-size: 13px; line-height: 1.6; border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 28px; text-align: center;">
        © HIREU Inc • Cloud-Native Intelligent Workspace
      </p>
    </div>
  `;
  const welcomeText = `Hi there,\n\nWelcome to HIREU!\n\nYour intelligent talent gateway session is now active. Explore AI Resume audits, matching scores, and chat with your career co-pilot.\n\nBest regards,\nHIREU Team`;

  const mailResult = await sendEmail({
    to: email,
    subject: welcomeSubject,
    html: welcomeHtml,
    text: welcomeText
  });

  res.json({ success: true, status: mailResult.status });
});


// ==========================================
// VITE OR STATIC SERVING MIDDLEWARE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve SPA index.html for all other routes in production
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HIREU Server] Server successfully running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
