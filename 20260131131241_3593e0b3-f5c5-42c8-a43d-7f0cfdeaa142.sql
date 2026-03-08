import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const INTERVIEW_QUESTIONS = {
  entry: {
    "software engineer": [
      "Tell me about yourself and your background in software development.",
      "What programming languages are you most comfortable with and why?",
      "Can you explain the difference between let, const, and var in JavaScript?",
      "Describe a challenging bug you encountered and how you solved it.",
      "What is your experience with version control systems like Git?",
    ],
    "product manager": [
      "Tell me about yourself and why you're interested in product management.",
      "How would you prioritize features for a new product?",
      "Describe a time when you had to make a difficult decision.",
      "What methods do you use to gather user feedback?",
      "How do you define success for a product?",
    ],
  },
  mid: {
    "software engineer": [
      "Walk me through your approach to designing a scalable system.",
      "How do you ensure code quality in your projects?",
      "Describe your experience with microservices architecture.",
      "Tell me about a time you had to optimize application performance.",
      "How do you stay updated with new technologies and best practices?",
    ],
    "product manager": [
      "How do you balance stakeholder needs with user needs?",
      "Describe your experience with data-driven decision making.",
      "Tell me about a product launch you've managed.",
      "How do you handle conflicting priorities from different teams?",
      "What metrics do you track to measure product success?",
    ],
  },
  senior: {
    "software engineer": [
      "How do you approach system design for applications at scale?",
      "Describe your experience mentoring junior developers.",
      "Tell me about a technical decision you made that had significant business impact.",
      "How do you evaluate and introduce new technologies to your team?",
      "Describe a time when you had to make trade-offs between technical debt and feature delivery.",
    ],
    "product manager": [
      "How do you develop and communicate product strategy?",
      "Describe your experience leading cross-functional teams.",
      "Tell me about a product that failed and what you learned.",
      "How do you balance innovation with maintaining existing products?",
      "Describe your approach to building and managing a product roadmap.",
    ],
  },
};

async function generatePersonalizedQuestions(
  role: string,
  experienceLevel: string,
  resumeText: string,
  apiKey: string
): Promise<string[]> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are an expert technical interviewer. Generate 5-7 interview questions for a ${experienceLevel} level ${role} position. 
The questions should be personalized based on the candidate's resume, focusing on their specific skills, projects, and experiences.
Make questions challenging but fair, and include both technical and behavioral questions.
Return ONLY a JSON array of strings, each string being one question.`
        },
        {
          role: "user",
          content: `Resume content:\n${resumeText}\n\nGenerate personalized interview questions for this candidate applying for a ${experienceLevel} ${role} position.`
        }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate personalized questions");
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, interviewId, role, experienceLevel, resumeText, audio, currentTranscript, transcript } = await req.json();
    
    type ExperienceLevel = "entry" | "mid" | "senior";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (action === "start") {
      let questions: string[];
      
      // If resume is provided, generate personalized questions
      if (resumeText && resumeText.trim().length > 100) {
        try {
          questions = await generatePersonalizedQuestions(role, experienceLevel, resumeText, LOVABLE_API_KEY);
          if (questions.length === 0) {
            throw new Error("No questions generated");
          }
        } catch (e) {
          console.log("Falling back to default questions:", e);
          // Fallback to default questions
          const normalizedRole = role.toLowerCase();
          const level = experienceLevel as ExperienceLevel;
          const roleQuestions = INTERVIEW_QUESTIONS[level];
          questions = (roleQuestions as any)[normalizedRole] || roleQuestions["software engineer"];
        }
      } else {
        // Use default questions
        const normalizedRole = role.toLowerCase();
        const level = experienceLevel as ExperienceLevel;
        const roleQuestions = INTERVIEW_QUESTIONS[level];
        questions = (roleQuestions as any)[normalizedRole] || roleQuestions["software engineer"];
      }

      return new Response(
        JSON.stringify({ 
          question: questions[0],
          totalQuestions: questions.length,
          allQuestions: questions,
          isPersonalized: resumeText && resumeText.trim().length > 100
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "answer") {
      // Transcribe audio using a simple approach (in production, use proper speech-to-text)
      const userAnswer = "User provided a verbal answer"; // Placeholder - actual implementation would transcribe

      // Determine next question
      const questionCount = currentTranscript.filter((t: any) => t.role === "interviewer").length;
      const normalizedRole = role || "software engineer";
      const level = (experienceLevel || "entry") as ExperienceLevel;
      
      const roleQuestions = INTERVIEW_QUESTIONS[level];
      const questions = (roleQuestions as any)[normalizedRole.toLowerCase()] || roleQuestions["software engineer"];
      
      const nextQuestion = questionCount < questions.length ? questions[questionCount] : null;

      return new Response(
        JSON.stringify({ 
          userAnswer,
          nextQuestion 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "complete") {
      // Generate feedback using Gemini
      const messages = [
        {
          role: "system",
          content: `You are an expert interview coach. Analyze the following interview transcript and provide:
1. An overall rating from 1-10
2. 3-5 key strengths demonstrated
3. 3-5 areas for improvement
4. 3-5 specific actionable suggestions

Format your response as JSON with keys: rating, strengths, improvements, suggestions (all arrays except rating)`
        },
        {
          role: "user",
          content: `Interview transcript:\n${JSON.stringify(transcript, null, 2)}\n\nProvide detailed feedback.`
        }
      ];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
        }),
      });

      if (!response.ok) {
        console.error("AI Gateway error:", await response.text());
        throw new Error("Failed to generate feedback");
      }

      const data = await response.json();
      const feedbackText = data.choices[0].message.content;

      // Parse JSON from response
      let feedback;
      try {
        // Try to extract JSON from the response
        const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
        feedback = jsonMatch ? JSON.parse(jsonMatch[0]) : {
          rating: 7,
          strengths: ["Demonstrated good understanding of the role", "Communicated clearly"],
          improvements: ["Could provide more specific examples", "Consider structuring answers better"],
          suggestions: ["Practice STAR method for behavioral questions", "Research the company more thoroughly"]
        };
      } catch (e) {
        // Fallback feedback if parsing fails
        feedback = {
          rating: 7,
          strengths: ["Demonstrated good communication skills", "Showed enthusiasm for the role"],
          improvements: ["Could provide more specific examples", "Consider diving deeper into technical details"],
          suggestions: ["Practice structuring your answers", "Research common interview questions for your role"]
        };
      }

      return new Response(
        JSON.stringify(feedback),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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