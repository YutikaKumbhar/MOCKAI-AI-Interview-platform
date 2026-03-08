import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert resume analyzer. Extract key information from the resume and return it as JSON with the following structure:
{
  "skills": ["skill1", "skill2", ...], // Array of technical and soft skills (max 15)
  "summary": "Brief 2-3 sentence summary of the candidate's experience and expertise",
  "experience_years": number, // Estimated years of experience
  "key_projects": ["project1", "project2", ...], // Notable projects or achievements (max 5)
  "education": "Highest degree and field"
}

Be concise and focus on the most relevant information for interview preparation.`
          },
          {
            role: "user",
            content: `Analyze this resume and extract key information:\n\n${resumeText}`
          }
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI Gateway error:", await response.text());
      throw new Error("Failed to analyze resume");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON from response
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        skills: [],
        summary: "Unable to parse resume content",
        experience_years: 0,
        key_projects: [],
        education: ""
      };
    } catch {
      parsed = {
        skills: [],
        summary: "Unable to parse resume content",
        experience_years: 0,
        key_projects: [],
        education: ""
      };
    }

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
