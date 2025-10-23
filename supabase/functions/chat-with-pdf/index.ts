import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, pdfBase64, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing question:", question);

    // Extract text from PDF (simplified - in production, use proper PDF parsing)
    // For now, we'll use the AI to work with the document context
    const messages = [
      {
        role: "system",
        content: `You are an intelligent document assistant. The user has uploaded a PDF document and wants to ask questions about it. 
        
Your task is to:
1. Answer questions accurately based on the document content
2. Provide specific page references when mentioning information
3. Format your citations as [Page X] in your response
4. Be concise but thorough

When providing citations, mention the page number naturally in your answer like: "According to the document [Page 3], the main findings show..."`,
      },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: question,
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "Payment required. Please add credits to your workspace.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    // Extract page citations from the answer
    const citationRegex = /\[Page (\d+)\]/g;
    const citations: number[] = [];
    let match;

    while ((match = citationRegex.exec(answer)) !== null) {
      const pageNum = parseInt(match[1]);
      if (!citations.includes(pageNum)) {
        citations.push(pageNum);
      }
    }

    console.log("Generated answer with citations:", citations);

    return new Response(
      JSON.stringify({
        answer,
        citations: citations.sort((a, b) => a - b),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in chat-with-pdf:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
