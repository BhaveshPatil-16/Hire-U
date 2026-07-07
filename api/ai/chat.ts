import { GoogleGenAI } from "@google/genai";
import { INITIAL_JOBS } from "@hireu/shared";

type ChatMessage = {
  sender: "user" | "bot";
  content: string;
};

function offlineChat(message: string): string {
  const m = message.toLowerCase();

  if (m.includes("job") || m.includes("openings") || m.includes("work")) {
    return `We currently have ${INITIAL_JOBS.length} premium roles open on HIREU, including:\n\n` +
      INITIAL_JOBS.map(j => `- **${j.title}** at *${j.companyName}* (${j.salary}, ${j.location})`).join("\n") +
      `\n\nYou can use our **AI Match** panel on the portal to paste your resume or list your skills, and I will instantly check your fit for these roles!`;
  }

  if (m.includes("resume") || m.includes("portfolio")) {
    return `To optimize your resume for HIREU openings:\n\n1. Ensure your core languages and tools are clearly visible at the top.\n2. Quantify achievements, such as load-time reductions, revenue impact, or hiring outcomes.\n3. Use the **AI Match / Resume Review** panel to get focused feedback on gaps and action items.`;
  }

  if (m.includes("interview") || m.includes("prep") || m.includes("practice")) {
    return `Preparing is key. Tell me your target role and I can run a mock interview loop.\n\nPro tip: use the **STAR** method: Situation, Task, Action, Result. Then explain the trade-offs behind your decisions.`;
  }

  if (m.includes("email") || m.includes("outreach") || m.includes("cover letter")) {
    return `Here is a concise outreach structure:\n\n**Subject:** Interested in contributing to your team\n\nHi [Name],\n\nI am impressed by the work your team is doing at [Company]. My background in [skill/role] aligns with your current hiring needs, especially around [specific area]. I would love to explore whether my experience could support your roadmap.\n\nBest,\n[Your Name]`;
  }

  return `Hi there! I am your **HIREU AI Career Co-pilot**. I can help you search active positions, refine resume bullet points, draft outreach emails, or practice interviews.\n\nTry asking me:\n- "What jobs are open right now?"\n- "How do I improve my resume for a Senior NLP Researcher role?"\n- "Draft a short cold outreach email for Velo Design"`;
}

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }

  return new GoogleGenAI({ apiKey });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;
  const messages = body?.messages;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  const lastUserMessage = messages[messages.length - 1]?.content || "";
  const ai = getAiClient();

  if (!ai) {
    return res.status(200).json({ text: offlineChat(lastUserMessage), offline: true });
  }

  try {
    const systemPrompt = `You are 'HireU Co-pilot', a premium, highly professional AI Career Coach and Job Assistant on the HIREU portal.
Your personality is highly encouraging, extremely knowledgeable, polished, and direct.
You know about these open jobs on HIREU: ${JSON.stringify(INITIAL_JOBS.map(j => ({
      title: j.title,
      company: j.companyName,
      location: j.location,
      salary: j.salary
    })), null, 2)}.
Help candidates match with jobs, give advice on interview strategies, draft high-conversion cover letters, or perfect their career narrative.
Keep answers beautifully structured with markdown. Keep it punchy, conversational, and elite.`;

    const contents = (messages as ChatMessage[]).map(msg => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7
      }
    });

    return res.status(200).json({
      text: response.text || "I apologize, I could not generate a response. Please try again.",
      offline: false
    });
  } catch (err: any) {
    return res.status(200).json({
      text: offlineChat(lastUserMessage) + "\n\n*(Note: Running in offline backup mode due to an API service exception.)*",
      offline: true,
      error: err?.message || "Unknown AI service error"
    });
  }
}
