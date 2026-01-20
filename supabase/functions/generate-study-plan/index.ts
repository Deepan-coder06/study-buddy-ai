import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  topic: string;
}

interface Task {
  title: string;
  priority: "High" | "Medium" | "Low";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { topic }: RequestBody = await req.json();
    
    if (!topic || !topic.trim()) {
      return new Response(
        JSON.stringify({ error: "Topic is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Study plan request for topic:", topic);

    const prompt = `I am a university student. I need to study "${topic}". 
Break this down into 3 to 5 specific, actionable study tasks. 
Return ONLY a raw JSON array (no markdown formatting, no backticks). 
Format: [{"title": "Task Name", "priority": "High|Medium|Low"}]`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("Raw Gemini response:", text);

    // Clean up response (remove markdown if present)
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const tasks: Task[] = JSON.parse(text);
      
      if (!Array.isArray(tasks)) {
        throw new Error("Response is not an array");
      }

      // Validate and normalize tasks
      const validatedTasks = tasks.map((t) => ({
        title: t.title || "Study Task",
        priority: (["High", "Medium", "Low"].includes(t.priority) ? t.priority : "Medium") as Task["priority"],
      }));

      console.log("Study plan generated:", validatedTasks.length, "tasks");

      return new Response(
        JSON.stringify({ tasks: validatedTasks }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      
      // Fallback tasks
      const fallbackTasks: Task[] = [
        { title: `Review basics of ${topic}`, priority: "High" },
        { title: `Practice ${topic} exercises`, priority: "Medium" },
        { title: `Create summary notes for ${topic}`, priority: "Low" },
      ];

      return new Response(
        JSON.stringify({ tasks: fallbackTasks }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Generate study plan error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
