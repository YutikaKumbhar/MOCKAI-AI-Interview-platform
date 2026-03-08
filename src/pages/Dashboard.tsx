import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, LogOut, Plus, Calendar, Award, TrendingUp, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

interface Interview {
  id: string;
  role: string;
  experience_level: string;
  status: string;
  overall_rating: number | null;
  created_at: string;
  completed_at: string | null;
  strengths: string[] | null;
  improvements: string[] | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchInterviews();
    fetchUser();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchInterviews = async () => {
    try {
      const { data, error } = await supabase
        .from("interviews")
        .select("id, role, experience_level, status, overall_rating, created_at, completed_at, strengths, improvements")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInterviews(data || []);
    } catch (error: any) {
      toast.error("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  const formatNamePart = (s: string) => s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : "";

  const fetchUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const meta = (user.user_metadata as any) || {};
        let first = meta.first_name || meta.given_name || "";
        let last = meta.last_name || meta.family_name || "";

        if (!first && !last) {
          if (meta.full_name) {
            const parts = (meta.full_name as string).trim().split(/\s+/);
            first = parts[0] || "";
            last = parts.length > 1 ? parts[parts.length - 1] : "";
          } else if (user.email) {
            const local = user.email.split("@")[0];
            const parts = local.split(/[_\.\-]+/);
            first = parts[0] || "";
            last = parts[1] || "";
          }
        }

        const display = [first, last].filter(Boolean).map(formatNamePart).join(" ");
        setUsername(display || null);
      }
    } catch (error) {
      // ignore errors silently
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const completedInterviews = interviews.filter((i) => i.status === "completed");
  const avgRating = completedInterviews.length > 0
    ? (completedInterviews.reduce((sum, i) => sum + (i.overall_rating || 0), 0) / completedInterviews.length).toFixed(1)
    : "N/A";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">MockAI</h1>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">welcome, <span className="font-semibold">{username || 'User'}</span></h2>
          <h2 className="text-3xl font-bold mb-2">Your Dashboard</h2>
          <p className="text-muted-foreground">Track your progress and start new interviews</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Interviews</p>
                <p className="text-2xl font-bold">{interviews.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedInterviews.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{avgRating}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="interviews" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="interviews" className="gap-2">
                <Mic className="w-4 h-4" />
                Interviews
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
            <Button onClick={() => navigate("/setup")} className="shadow-elegant">
              <Plus className="w-4 h-4 mr-2" />
              New Interview
            </Button>
          </div>

          <TabsContent value="interviews">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading interviews...</p>
              </div>
            ) : interviews.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <Mic className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No interviews yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start your first mock interview to practice and improve
                </p>
                <Button onClick={() => navigate("/setup")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Start First Interview
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {interviews.map((interview) => (
                  <Card
                    key={interview.id}
                    className="p-6 hover:shadow-lg transition-all cursor-pointer border-border bg-card"
                    onClick={() => navigate(`/interview/${interview.id}/feedback`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">{interview.role}</h4>
                          <Badge variant={interview.status === "completed" ? "default" : "secondary"}>
                            {interview.status}
                          </Badge>
                          {interview.overall_rating && (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                              {interview.overall_rating}/10
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {interview.experience_level} level
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {new Date(interview.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard interviews={interviews} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;