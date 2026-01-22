const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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

// Core Gemini API Caller
async function callGeminiAPI(payload: object): Promise<any> {
  if (!GEMINI_API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY missing.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Gemini API Error:", data);
    throw new Error(data.error?.message || "Gemini API failed");
  }

  return data;
}

// ======================= CHAT =======================
export async function sendChatMessage(
messages: ChatMessage[], userName: string, sleepHours: number, attachment: Attachment): Promise<string> {

  const payload = {
    contents: [
      {
        role: "user",
        parts: messages.map(m => ({ text: m.text + "\n\nPlease answer completely and do not stop mid-sentence." }))
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    }
  };

  try {
    const data = await callGeminiAPI(payload);
    return data.candidates?.[0]?.content?.parts?.[0]?.text 
      || "No response from AI.";
  } catch (error) {
    return `Connection Error: ${(error as Error).message}`;
  }
}

// ======================= DAILY INSIGHT =======================
export async function generateInsight(
  sleepHours: number,
  energyLevel: number
): Promise<string> {

  const prompt = `As a wellness advisor, give a brief, practical tip (2-3 sentences) for a student who slept ${sleepHours} hours and has an energy level of ${energyLevel}/10.`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 256,
    },
  };

  try {
    const data = await callGeminiAPI(payload);
    return data.candidates?.[0]?.content?.parts?.[0]?.text 
      || "Stay focused and take regular breaks!";
  } catch (error) {
    console.error("generateInsight error:", error);
    return `Insight Error: ${(error as Error).message}`;
  }
}

// ======================= STUDY PLAN =======================
export async function generateStudyPlan(topic: string): Promise<Task[]> {

  const prompt = `Create a JSON array of 3-5 study tasks for the topic: "${topic}". 
Each task must have:
- "title" (string)
- "priority" ("High", "Medium", or "Low")

Return ONLY the JSON array.`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
    },
  };

  try {
    const data = await callGeminiAPI(payload);
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return [];
  } catch (error) {
    console.error("generateStudyPlan error:", error);
    return [];
  }
}
