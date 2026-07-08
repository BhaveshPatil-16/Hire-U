const JOBS = [
  { title: "Senior NLP Researcher", companyName: "Aethera Labs", salary: "$180k - $240k", location: "San Francisco, CA" },
  { title: "Principal Product Designer", companyName: "Velo Design", salary: "$160k - $210k", location: "Brooklyn, NY / Remote" },
  { title: "Cloud Security Engineer", companyName: "Prism Tech", salary: "$150k - $205k", location: "Austin, TX" },
  { title: "AI Product Manager", companyName: "Google", salary: "Competitive", location: "Mountain View, CA / Bangalore" },
  { title: "Full-stack Engineer", companyName: "Microsoft", salary: "Competitive", location: "Redmond, WA / Hyderabad" }
];

function offlineChat(message) {
  const m = String(message || "").toLowerCase();

  if (m.includes("job") || m.includes("openings") || m.includes("work")) {
    return `We currently have premium roles open on HIREU, including:\n\n` +
      JOBS.map(j => `- **${j.title}** at *${j.companyName}* (${j.salary}, ${j.location})`).join("\n") +
      `\n\nUse the **AI Match** panel to paste your resume or list your skills, and I will check your fit for these roles.`;
  }

  if (m.includes("resume") || m.includes("portfolio")) {
    return `To optimize your resume for HIREU openings:\n\n1. Put your core languages, tools, and strongest domain skills near the top.\n2. Quantify achievements with numbers: performance gains, revenue impact, hiring outcomes, or user growth.\n3. Tailor the first 3 bullets to the target role before applying.`;
  }

  if (m.includes("interview") || m.includes("prep") || m.includes("practice")) {
    return `Preparing is key. Tell me your target role and I can run a mock interview loop.\n\nUse the **STAR** method: Situation, Task, Action, Result. Then add the trade-offs behind your decisions.`;
  }

  if (m.includes("email") || m.includes("outreach") || m.includes("cover letter")) {
    return `Here is a concise outreach draft:\n\n**Subject:** Interested in contributing to your team\n\nHi [Name],\n\nI am impressed by the work your team is doing at [Company]. My background in [skill/role] aligns with your current hiring needs, especially around [specific area]. I would love to explore whether my experience could support your roadmap.\n\nBest,\n[Your Name]`;
  }

  return `Hi there! I am your **HIREU AI Career Co-pilot**. I can help you search active positions, refine resume bullet points, draft outreach emails, or practice interviews.\n\nTry asking me:\n- "What jobs are open right now?"\n- "How do I improve my resume for a Senior NLP Researcher role?"\n- "Draft a short cold outreach email for Velo Design"`;
}

async function askGemini(apiKey, messages) {
  const systemPrompt = `You are 'HireU Co-pilot', a premium, highly professional AI Career Coach and Job Assistant on the HIREU portal.
Your personality is encouraging, knowledgeable, polished, and direct.
You know about these open jobs on HIREU: ${JSON.stringify(JOBS)}.
Help candidates match with jobs, improve resumes, draft outreach, and practice interviews.
Keep answers structured with markdown, punchy, conversational, and useful.`;

  const contents = [
    { role: "user", parts: [{ text: systemPrompt }] },
    ...messages.map(msg => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: String(msg.content || "") }]
    }))
  ];

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned ${response.status}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.map(part => part.text).join("") || "";
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const messages = body.messages;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || !apiKey.trim()) {
      return res.status(200).json({ text: offlineChat(lastUserMessage), offline: true });
    }

    try {
      const text = await askGemini(apiKey, messages);
      return res.status(200).json({
        text: text || offlineChat(lastUserMessage),
        offline: !text
      });
    } catch (err) {
      return res.status(200).json({
        text: offlineChat(lastUserMessage) + "\n\n*(Note: Running in offline backup mode due to an AI service exception.)*",
        offline: true,
        error: err instanceof Error ? err.message : "Unknown AI service error"
      });
    }
  } catch (err) {
    return res.status(200).json({
      text: offlineChat(""),
      offline: true,
      error: err instanceof Error ? err.message : "Unknown request error"
    });
  }
};
