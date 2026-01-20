import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

interface RequestBody {
  messages: ChatMessage[];
  userName?: string;
  sleepHours?: number;
  attachment?: {
    name: string;
    type: string;
    data: string;
    category: "image" | "pdf" | "text" | "other";
  } | null;
}

serve(async (req) => {
  // Handle CORS preflight
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

    const { messages, userName, sleepHours, attachment }: RequestBody = await req.json();
    
    console.log("Chat request received:", { 
      messageCount: messages.length, 
      userName, 
      hasAttachment: !!attachment 
    });

    // Build Gemini API request
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
      parts: [{ text: msg.text }],
    }));

    // Handle attachments
    if (attachment) {
      const lastUserMessage = contents[contents.length - 1];
      if (lastUserMessage && lastUserMessage.role === "user") {
        if (attachment.category === "image" && attachment.data.includes(",")) {
          const base64Data = attachment.data.split(",")[1];
          lastUserMessage.parts.push({
            inlineData: { mimeType: attachment.type, data: base64Data },
          } as any);
        } else if (attachment.category === "pdf" && attachment.data.includes(",")) {
          const base64Data = attachment.data.split(",")[1];
          lastUserMessage.parts.push({
            inlineData: { mimeType: "application/pdf", data: base64Data },
          } as any);
        } else if (attachment.category === "text") {
          lastUserMessage.parts[0].text += `\n\n[Attached File Content (${attachment.name})]:\n${attachment.data}`;
        } else {
          lastUserMessage.parts[0].text += `\n\n[System Note: User attached file "${attachment.name}". Cannot read this file type directly.]`;
        }
      }
    }

    console.log("Calling Gemini API...");

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
      return new Response(
        JSON.stringify({ error: "AI service error", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      "I'm having trouble responding right now. Please try again.";

    console.log("Gemini response received successfully");

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
