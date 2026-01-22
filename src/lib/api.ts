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
  const prompt = `
    You are an expert academic advisor. A student wants to study the following topic: "${topic}".
    
    Your task is to break this topic down into a concise and actionable study plan.
    
    Generate a JSON array of 3 to 5 tasks. Each task in the array must be an object with two properties:
    1. "title": A string that clearly and concisely describes the task.
    2. "priority": A string that is either "High", "Medium", or "Low", based on the task's importance for understanding the topic.
    
    Example response for the topic "Learn React Hooks":
    [
      { "title": "Understand the purpose of Hooks", "priority": "High" },
      { "title": "Master the useState hook with examples", "priority": "High" },
      { "title": "Learn the useEffect hook for side effects", "priority": "Medium" },
      { "title": "Explore other hooks like useContext and useReducer", "priority": "Low" }
    ]
    
    Return *only* the raw JSON array, with no other text, explanations, or markdown formatting.
    `;

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024,
      response_mime_type: "application/json",
    },
  };

  try {
    const data = await callGeminiAPI(payload);
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      return [];
    }

    const parsedTasks = JSON.parse(text);
    
    // Basic validation
    if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
      return parsedTasks as Task[];
    }

    return [];
  } catch (error) {
    console.error("generateStudyPlan error:", error);
    return [];
  }
}

// ======================= STUDY PLAN (ALTERNATE) =======================
export async function generateStudyPlanAlternate(topic: string): Promise<Task[]> {
  // A more robust prompt.
  const prompt = `
    You are an expert academic advisor. Your goal is to create a JSON study plan.
    A student wants to study: "${topic}".

    Create a JSON array of 3-5 study tasks.
    Each task object must have "title" (string) and "priority" ("High", "Medium", or "Low").

    IMPORTANT: Respond with ONLY the JSON array. Do not include any other text, markdown, or explanations.

    Example:
    [
      {"title": "Task 1", "priority": "High"},
      {"title": "Task 2", "priority": "Medium"}
    ]
  `;

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2, // Lower temperature for more predictable output
      maxOutputTokens: 1024,
    },
  };

  try {
    const data = await callGeminiAPI(payload);
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("Gemini response was empty for alternate plan.");
      return [];
    }

    // Find the JSON array within the response text.
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch && jsonMatch[0]) {
      try {
        const parsedTasks = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
          const isValid = parsedTasks.every(t => t.title && t.priority);
          if (isValid) {
            return parsedTasks as Task[];
          }
        }
      } catch (e) {
        console.error("Failed to parse JSON from alternate response:", e);
        return [];
      }
    }

    console.error("No valid JSON array found in the alternate AI response.");
    return [];
  } catch (error) {
    console.error("generateStudyPlanAlternate error:", error);
    return [];
  }
}
