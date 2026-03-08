import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { TrendingUp, TrendingDown, Target, Award, Clock, Zap } from "lucide-react";

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

interface AnalyticsDashboardProps {
  interviews: Interview[];
}

export const AnalyticsDashboard = ({ interviews }: AnalyticsDashboardProps) => {
  const completedInterviews = useMemo(
    () => interviews.filter((i) => i.status === "completed" && i.overall_rating),
    [interviews]
  );

  // Calculate performance over time
  const performanceData = useMemo(() => {
    return completedInterviews
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((interview, index) => ({
        name: `Interview ${index + 1}`,
        date: new Date(interview.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        rating: interview.overall_rating || 0,
        role: interview.role,
      }));
  }, [completedInterviews]);

  // Calculate role distribution
  const roleDistribution = useMemo(() => {
    const roles: Record<string, number> = {};
    completedInterviews.forEach((i) => {
      roles[i.role] = (roles[i.role] || 0) + 1;
    });
    return Object.entries(roles).map(([name, value]) => ({ name, value }));
  }, [completedInterviews]);

  // Calculate experience level distribution
  const experienceDistribution = useMemo(() => {
    const levels: Record<string, number> = {};
    completedInterviews.forEach((i) => {
      const level = i.experience_level.charAt(0).toUpperCase() + i.experience_level.slice(1);
      levels[level] = (levels[level] || 0) + 1;
    });
    return Object.entries(levels).map(([name, value]) => ({ name, value }));
  }, [completedInterviews]);

  // Calculate common strengths and improvements
  const strengthsAnalysis = useMemo(() => {
    const strengths: Record<string, number> = {};
    completedInterviews.forEach((i) => {
      i.strengths?.forEach((s) => {
        strengths[s] = (strengths[s] || 0) + 1;
      });
    });
    return Object.entries(strengths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [completedInterviews]);

  const improvementsAnalysis = useMemo(() => {
    const improvements: Record<string, number> = {};
    completedInterviews.forEach((i) => {
      i.improvements?.forEach((imp) => {
        improvements[imp] = (improvements[imp] || 0) + 1;
      });
    });
    return Object.entries(improvements)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [completedInterviews]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (completedInterviews.length === 0) {
      return { avgRating: 0, improvement: 0, bestRating: 0, totalTime: 0 };
    }

    const ratings = completedInterviews.map((i) => i.overall_rating || 0);
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    const bestRating = Math.max(...ratings);
    
    // Calculate improvement trend
    let improvement = 0;
    if (ratings.length >= 2) {
      const firstHalf = ratings.slice(0, Math.floor(ratings.length / 2));
      const secondHalf = ratings.slice(Math.floor(ratings.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      improvement = ((secondAvg - firstAvg) / firstAvg) * 100;
    }

    return { avgRating, improvement, bestRating, totalTime: completedInterviews.length * 15 };
  }, [completedInterviews]);

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--success))"];

  if (completedInterviews.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Analytics Available Yet</h3>
        <p className="text-muted-foreground">
          Complete some interviews to see your performance analytics
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-card to-card/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
              <p className="text-xl font-bold">{stats.avgRating.toFixed(1)}/10</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-card to-card/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              stats.improvement >= 0 ? "bg-success/10" : "bg-destructive/10"
            }`}>
              {stats.improvement >= 0 ? (
                <TrendingUp className="w-5 h-5 text-success" />
              ) : (
                <TrendingDown className="w-5 h-5 text-destructive" />
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Improvement</p>
              <p className={`text-xl font-bold ${
                stats.improvement >= 0 ? "text-success" : "text-destructive"
              }`}>
                {stats.improvement >= 0 ? "+" : ""}{stats.improvement.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-card to-card/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Best Score</p>
              <p className="text-xl font-bold">{stats.bestRating}/10</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-card to-card/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Practice Time</p>
              <p className="text-xl font-bold">{stats.totalTime} min</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Over Time */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Performance Over Time
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis 
                domain={[0, 10]} 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="rating"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#ratingGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Interviews by Role</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {roleDistribution.map((item, index) => (
              <Badge key={item.name} variant="outline" className="text-xs">
                <span
                  className="w-2 h-2 rounded-full mr-1 inline-block"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                {item.name} ({item.value})
              </Badge>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Experience Level Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={experienceDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4 text-success">Top Strengths</h3>
          <div className="space-y-3">
            {strengthsAnalysis.length > 0 ? (
              strengthsAnalysis.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{item.name}</span>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    {item.count}x
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No strengths data yet</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4 text-accent">Areas to Improve</h3>
          <div className="space-y-3">
            {improvementsAnalysis.length > 0 ? (
              improvementsAnalysis.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{item.name}</span>
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                    {item.count}x
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No improvement data yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
