// Direct Gemini API calls (API key exposed in frontend - for personal/local use only)

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

interface Attachment {
  name: string;
  type: string;
  data: string;
  category: "image" | "pdf" | "text" | "other";
}

interface Task {
  title: string;
  priority: "High" | "Medium" | "Low";
}

const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error("VITE_GEMINI_API_KEY is not configured in .env file");
  }
  return key;
};

export async function sendChatMessage(
  messages: ChatMessage[],
  userName?: string,
  sleepHours?: number,
  attachment?: Attachment | null
): Promise<string> {
  const GEMINI_API_KEY = getApiKey();

  const systemPrompt = `You are StudentLifeOS, an advanced AI assistant for university students.
You help with:
- Study planning and productivity tips
- Sleep and health optimization
- Stress management and mental wellness
- Academic advice and motivation

Current User: ${userName || "Student"}
${sleepHours ? `Last night's sleep: ${sleepHours} hours` : ""}

Be supportive, encouraging, and practical. Keep responses concise but helpful.

FILE EXPORT FEATURE:
If user asks to "save", "download", or "export" content, start response with [DOWNLOAD:Filename]. 
Follow with the actual content to be saved.`;

  // Convert chat history to Gemini format
  const contents = messages.map((msg) => ({
    role: msg.role === "model" ? "model" : "user",
    parts: [{ text: msg.text }] as any[],
  }));

  // Handle attachments
  if (attachment) {
    const lastUserMessage = contents[contents.length - 1];
    if (lastUserMessage && lastUserMessage.role === "user") {
      if (attachment.category === "image" && attachment.data.includes(",")) {
        const base64Data = attachment.data.split(",")[1];
        lastUserMessage.parts.push({
          inlineData: { mimeType: attachment.type, data: base64Data },
        });
      } else if (attachment.category === "pdf" && attachment.data.includes(",")) {
        const base64Data = attachment.data.split(",")[1];
        lastUserMessage.parts.push({
          inlineData: { mimeType: "application/pdf", data: base64Data },
        });
      } else if (attachment.category === "text") {
        lastUserMessage.parts[0].text += `\n\n[Attached File Content (${attachment.name})]:\n${attachment.data}`;
      } else {
        lastUserMessage.parts[0].text += `\n\n[System Note: User attached file "${attachment.name}". Cannot read this file type directly.]`;
      }
    }
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", response.status, errorText);
    throw new Error("AI service error");
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 
    "I'm having trouble responding right now. Please try again.";
}

export async function generateInsight(
  sleepHours: number,
  energyLevel: number
): Promise<string> {
  const GEMINI_API_KEY = getApiKey();

  const prompt = `As a wellness advisor for a university student:
- Sleep last night: ${sleepHours} hours
- Current energy level: ${energyLevel}/10

Provide a brief, personalized wellness tip (2-3 sentences max). Be encouraging and practical.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 256,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate insight");
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 
    "Stay focused and take regular breaks!";
}

export async function generateStudyPlan(topic: string): Promise<Task[]> {
  const GEMINI_API_KEY = getApiKey();

  const prompt = `Create a study plan for: "${topic}"

Return ONLY a JSON array with 3-5 tasks. Each task must have:
- "title": string (concise task description)
- "priority": "High" | "Medium" | "Low"

Example format:
[{"title": "Review chapter 1", "priority": "High"}, {"title": "Practice problems", "priority": "Medium"}]

Return ONLY the JSON array, no other text.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate study plan");
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
  
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch {
    console.error("Failed to parse study plan response:", text);
    return [];
  }
}
