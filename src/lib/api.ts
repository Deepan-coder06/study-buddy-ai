import { supabase } from "@/integrations/supabase/client";

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

export async function sendChatMessage(
  messages: ChatMessage[],
  userName?: string,
  sleepHours?: number,
  attachment?: Attachment | null
): Promise<string> {
  const { data, error } = await supabase.functions.invoke("chat", {
    body: { messages, userName, sleepHours, attachment },
  });

  if (error) {
    console.error("Chat API error:", error);
    throw new Error(error.message || "Failed to send message");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data?.response || "I couldn't process that request.";
}

export async function generateInsight(
  sleepHours: number,
  energyLevel: number
): Promise<string> {
  const { data, error } = await supabase.functions.invoke("generate-insight", {
    body: { sleepHours, energyLevel },
  });

  if (error) {
    console.error("Insight API error:", error);
    throw new Error(error.message || "Failed to generate insight");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data?.insight || "Stay focused and take regular breaks!";
}

export async function generateStudyPlan(topic: string): Promise<Task[]> {
  const { data, error } = await supabase.functions.invoke("generate-study-plan", {
    body: { topic },
  });

  if (error) {
    console.error("Study plan API error:", error);
    throw new Error(error.message || "Failed to generate study plan");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data?.tasks || [];
}
