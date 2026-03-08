import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Mic, Sparkles, FileText } from "lucide-react";
import { toast } from "sonner";
import { ResumeUpload } from "@/components/ResumeUpload";

interface ResumeData {
  text: string;
  skills: string[];
  summary: string;
}

const Setup = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [useResume, setUseResume] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [existingResume, setExistingResume] = useState<{ fileName: string; skills: string[] } | null>(null);

  useEffect(() => {
    fetchExistingResume();
  }, []);

  const fetchExistingResume = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("resumes")
        .select("file_name, skills, resume_text, experience_summary")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setExistingResume({ fileName: data.file_name, skills: data.skills || [] });
        setResumeData({
          text: data.resume_text,
          skills: data.skills || [],
          summary: data.experience_summary || ""
        });
        setUseResume(true);
      }
    } catch (error) {
      console.error("Error fetching resume:", error);
    }
  };

  const handleStart = async () => {
    if (!role || !experienceLevel) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in first");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("interviews")
        .insert({
          user_id: user.id,
          role,
          experience_level: experienceLevel,
          status: "in_progress",
          resume_text: useResume && resumeData ? resumeData.text : null,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Interview starting...");
      navigate(`/interview/${data.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeProcessed = (data: ResumeData) => {
    setResumeData(data);
    setExistingResume({ fileName: "Resume uploaded", skills: data.skills });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="p-8 border-border shadow-card bg-card">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-glow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Setup Your Interview</h1>
            <p className="text-muted-foreground">
              Tell us about the position you're preparing for
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="role">Job Role</Label>
              <Input
                id="role"
                placeholder="e.g., Software Engineer, Product Manager"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the position you're interviewing for
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger id="experience">
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                  <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                  <SelectItem value="senior">Senior (6+ years)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This helps tailor questions to your level
              </p>
            </div>

            {/* Resume Personalization Section */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <Label htmlFor="use-resume" className="font-medium">
                      Personalize with Resume
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get questions based on your experience
                    </p>
                  </div>
                </div>
                <Switch
                  id="use-resume"
                  checked={useResume}
                  onCheckedChange={setUseResume}
                />
              </div>

              {useResume && (
                <ResumeUpload
                  onResumeProcessed={handleResumeProcessed}
                  existingResume={existingResume}
                />
              )}
            </div>

            <Button
              onClick={handleStart}
              disabled={loading}
              className="w-full shadow-elegant"
              size="lg"
            >
              <Mic className="w-5 h-5 mr-2" />
              {loading ? "Starting..." : "Start Interview"}
            </Button>
          </div>
        </Card>

        <div className="mt-6 p-4 rounded-xl bg-card/50 border border-border">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            What to expect
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 5-7 role-specific questions</li>
            {useResume && resumeData && (
              <li className="text-primary">• Personalized questions based on your resume</li>
            )}
            <li>• Voice-based conversation with AI</li>
            <li>• Real-time feedback and evaluation</li>
            <li>• Detailed performance report at the end</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Setup;