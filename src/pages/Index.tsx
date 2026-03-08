import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Sparkles, Award, TrendingUp, CheckCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-2xl font-bold">MockAI</span>
          </div>
          <Button 
            onClick={() => navigate("/auth")}
            className="px-8"
          >
            Login
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Ace Every Interview with{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              AI-Powered Voice Practice
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Prepare for your dream role through realistic, voice-interactive sessions with an AI interviewer. Get instant feedback, improve your answers, and speak with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="text-lg px-10 py-6 h-auto"
            >
              Explore Now
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/auth")}
              className="text-lg px-10 py-6 h-auto"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="relative max-w-6xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 blur-3xl rounded-3xl" />
          <Card className="relative p-8 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/20 shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-card border-border">
                <h3 className="font-semibold mb-2">Interview Score</h3>
                <div className="flex items-center justify-center h-32">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40 * 0.75} ${2 * Math.PI * 40}`}
                        className="text-primary"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">75%</span>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-card border-border md:col-span-2">
                <h3 className="font-semibold mb-2">Live Transcript</h3>
                <div className="space-y-2 text-sm">
                  <div className="p-2 rounded bg-muted/50">
                    <span className="font-medium text-primary">AI:</span> Tell me about your experience with React
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <span className="font-medium text-secondary">You:</span> I have 3 years of experience building applications...
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span>Recording in progress...</span>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 text-center border-border shadow-card bg-card hover:shadow-elegant transition-all duration-300 animate-in fade-in slide-in-from-bottom delay-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <Mic className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Voice-Based Interviews</h3>
            <p className="text-muted-foreground">
              Practice with realistic voice conversations powered by advanced AI technology
            </p>
          </Card>

          <Card className="p-8 text-center border-border shadow-card bg-card hover:shadow-elegant transition-all duration-300 animate-in fade-in slide-in-from-bottom delay-400">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-success/10 mb-4">
              <Award className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-xl font-bold mb-3">Detailed Feedback</h3>
            <p className="text-muted-foreground">
              Receive comprehensive ratings, identify strengths, and get actionable improvement tips
            </p>
          </Card>

          <Card className="p-8 text-center border-border shadow-card bg-card hover:shadow-elegant transition-all duration-300 animate-in fade-in slide-in-from-bottom delay-500">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-3">Track Progress</h3>
            <p className="text-muted-foreground">
              Monitor your improvement over time with detailed analytics and performance history
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          
          <div className="space-y-8">
            <div className="flex gap-6 items-start animate-in slide-in-from-left duration-500">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-glow">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Set Up Your Interview</h3>
                <p className="text-muted-foreground">
                  Choose your target role and experience level to get tailored questions
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start animate-in slide-in-from-left duration-500 delay-100">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-glow">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Answer Questions</h3>
                <p className="text-muted-foreground">
                  Practice with voice-based questions and provide your answers naturally
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start animate-in slide-in-from-left duration-500 delay-200">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-glow">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Get Detailed Feedback</h3>
                <p className="text-muted-foreground">
                  Receive comprehensive analysis with ratings, strengths, and improvement areas
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="p-12 text-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-primary/20 shadow-card">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of candidates improving their interview skills with AI-powered practice
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
            className="shadow-elegant text-lg px-8"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Start Practicing Now
          </Button>
        </Card>
      </section>
    </div>
  );
};

export default Index;
