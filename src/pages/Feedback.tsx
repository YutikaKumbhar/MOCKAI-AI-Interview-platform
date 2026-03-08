import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Award, TrendingUp, Target, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface Interview {
  id: string;
  role: string;
  experience_level: string;
  overall_rating: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  transcript: Array<{ role: string; content: string }>;
}

const Feedback = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterview();
  }, [id]);

  const fetchInterview = async () => {
    try {
      const { data, error } = await supabase
        .from("interviews")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setInterview(data as unknown as Interview);
    } catch (error: any) {
      toast.error("Failed to load feedback");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading feedback...</p>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Interview not found</p>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </Card>
      </div>
    );
  }

  const ratingColor = interview.overall_rating >= 8 ? "text-success" : interview.overall_rating >= 6 ? "text-accent" : "text-destructive";
  const ratingLabel = interview.overall_rating >= 8 ? "Excellent" : interview.overall_rating >= 6 ? "Good" : "Needs Improvement";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="p-8 border-border shadow-card bg-card mb-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-4 shadow-glow">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Interview Complete!</h1>
            <p className="text-muted-foreground">
              {interview.role} - {interview.experience_level} level
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Rating</span>
              <span className={`text-2xl font-bold ${ratingColor}`}>
                {interview.overall_rating}/10
              </span>
            </div>
            <Progress value={interview.overall_rating * 10} className="h-3 mb-2" />
            <p className="text-sm text-center text-muted-foreground">{ratingLabel}</p>
          </div>

          <div className="grid gap-6">
            {interview.strengths && interview.strengths.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-success">
                  <Award className="w-5 h-5" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {interview.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-success mt-1">•</span>
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {interview.improvements && interview.improvements.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-accent">
                  <Target className="w-5 h-5" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {interview.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-accent mt-1">•</span>
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {interview.suggestions && interview.suggestions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                  <Lightbulb className="w-5 h-5" />
                  Suggestions
                </h3>
                <ul className="space-y-2">
                  {interview.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-sm">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>

        {interview.transcript && interview.transcript.length > 0 && (
          <Card className="p-6 border-border shadow-card bg-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Full Transcript
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {interview.transcript.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    item.role === "interviewer"
                      ? "bg-primary/5 border border-primary/10"
                      : "bg-secondary/5 border border-secondary/10"
                  }`}
                >
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase">
                    {item.role === "interviewer" ? "Interviewer" : "You"}
                  </p>
                  <p className="text-sm">{item.content}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="mt-6 text-center">
          <Button onClick={() => navigate("/setup")} size="lg" className="shadow-elegant">
            Start Another Interview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Feedback;