import { db } from '@/firebase';
import { doc, setDoc, getDoc } from "firebase/firestore";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

interface Attachment {
  name: string;
  type: string;
  data: string;
  category: 'image' | 'pdf' | 'text' | 'other';
}

export interface Task {
  title: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface UserData {
  name: string;
  email: string;
  sleepHours: number;
  tasks: (Task & { id: number; completed: boolean })[];
  chatHistory?: { role: string; text: string }[];
}

async function callGeminiAPI(payload: object): Promise<any> {
  if (!GEMINI_API_KEY) {
    throw new Error("API key is missing.");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Gemini API Error:", data);
    const errorMsg = data.error?.message || "An AI error occurred.";
    throw new Error(errorMsg);
  }
  
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Received an invalid response from the AI.");
  }

  return data;
}

export const saveUserData = async (userId: string, data: Partial<UserData>) => {
  try {
    await setDoc(doc(db, "users", userId), data, { merge: true });
  } catch (error) {
    throw new Error("Could not save data.");
  }
};

export const loadUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    return docSnap.exists() ? (docSnap.data() as UserData) : null;
  } catch (error) {
    throw new Error("Could not load data.");
  }
};

export async function sendChatMessage(
  history: { role: string; text: string }[], 
  userName: string, 
  sleepHours: number, 
  attachment?: Attachment | null
): Promise<string> {

  const contents = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  // Add attachment data if it exists
  if (attachment) {
    const lastUserMessage = contents.find(m => m.role === 'user');
    if(lastUserMessage) {
        (lastUserMessage.parts as any).push({ inline_data: { mime_type: attachment.type, data: attachment.data } });
    }
  }

  const systemInstruction = {
    role: "system", // This role is only used internally for instruction
    parts: [{
      text: `You are Leo, a friendly AI tutor for ${userName}. They slept ${sleepHours} hours. Keep answers concise and encouraging.`
    }]
  };

  const payload = {
    // The API expects a `system_instruction` object, not a message with a 'system' role.
    system_instruction: {
        role: 'system',
        parts: systemInstruction.parts
    },
    contents: contents, // The actual chat history
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 4096,
    }
  };

  try {
    const data = await callGeminiAPI(payload);
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    throw new Error(`Chat failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function generateInsight(sleepHours: number, energyLevel: number): Promise<string> {
  const prompt = `As a wellness advisor for a student who slept ${sleepHours} hours and has an energy level of ${energyLevel}/100, provide a brief, actionable tip (2-3 sentences) for their well-being or academic performance. Be encouraging.`;

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.8, maxOutputTokens: 256 },
  };

  try {
    const data = await callGeminiAPI(payload);
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    throw new Error(`Insight generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function generateStudyPlanAlternate(topic: string, sleepHours: number): Promise<Task[]> {
  const prompt = `A student who slept ${sleepHours} hours wants a study plan for \"${topic}\". Create a JSON array of 3-5 tasks. Each object must have \"title\" (string) and \"priority\" (\"High\", \"Medium\", \"Low\"). Your response must be ONLY the raw JSON array.`;

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1536,
      response_mime_type: "application/json",
    },
  };

  try {
    const data = await callGeminiAPI(payload);
    const parsedTasks = JSON.parse(data.candidates[0].content.parts[0].text);
    if (Array.isArray(parsedTasks) && parsedTasks.every(t => t.title && t.priority)) {
        return parsedTasks as Task[];
    }
    throw new Error("AI returned a plan with an invalid structure.");
  } catch (error) {
    throw new Error(`Plan generation failed: ${(error as Error).message}`);
  }
}
