import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const InterviewRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<Array<{ role: string; content: string }>>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    checkAuth();
    startInterview();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const startInterview = async () => {
    setIsProcessing(true);
    try {
      const { data: interview } = await supabase
        .from("interviews")
        .select("*")
        .eq("id", id)
        .single();

      if (!interview) throw new Error("Interview not found");

      // Get first question from AI
      const { data, error } = await supabase.functions.invoke("interview-ai", {
        body: {
          action: "start",
          interviewId: id,
          role: interview.role,
          experienceLevel: interview.experience_level,
        },
      });

      if (error) throw error;

      setCurrentQuestion(data.question);
      setTranscript([{ role: "interviewer", content: data.question }]);
      
      // Speak the question
      speakText(data.question);
    } catch (error: any) {
      toast.error("Failed to start interview");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      toast.error("Failed to access microphone");
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert audio to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(",")[1];

        // Send to AI for processing
        const { data, error } = await supabase.functions.invoke("interview-ai", {
          body: {
            action: "answer",
            interviewId: id,
            audio: base64Audio,
            currentTranscript: transcript,
          },
        });

        if (error) throw error;

        // Update transcript
        const newTranscript = [
          ...transcript,
          { role: "candidate", content: data.userAnswer },
          { role: "interviewer", content: data.nextQuestion || "Thank you for your answers!" },
        ];

        setTranscript(newTranscript);

        if (data.nextQuestion) {
          setCurrentQuestion(data.nextQuestion);
          speakText(data.nextQuestion);
        } else {
          // Interview complete
          await completeInterview(newTranscript);
        }
      };
    } catch (error: any) {
      toast.error("Failed to process answer");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const completeInterview = async (finalTranscript: Array<{ role: string; content: string }>) => {
    try {
      // Generate feedback
      const { data, error } = await supabase.functions.invoke("interview-ai", {
        body: {
          action: "complete",
          interviewId: id,
          transcript: finalTranscript,
        },
      });

      if (error) throw error;

      // Update interview with feedback
      await supabase
        .from("interviews")
        .update({
          status: "completed",
          transcript: finalTranscript,
          overall_rating: data.rating,
          strengths: data.strengths,
          improvements: data.improvements,
          suggestions: data.suggestions,
          completed_at: new Date().toISOString(),
        })
        .eq("id", id);

      toast.success("Interview completed!");
      navigate(`/interview/${id}/feedback`);
    } catch (error: any) {
      toast.error("Failed to complete interview");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Card className="p-8 border-border shadow-card bg-card mb-6">
          <div className="flex items-center justify-between mb-6">
            <Badge variant="secondary" className="text-sm">
              Question {Math.floor(transcript.filter(t => t.role === "interviewer").length)}
            </Badge>
            {isProcessing && (
              <Badge variant="outline" className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing...
              </Badge>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{currentQuestion}</h2>
          </div>

          <div className="flex justify-center">
            {!isRecording ? (
              <Button
                size="lg"
                onClick={startRecording}
                disabled={isProcessing}
                className="rounded-full w-20 h-20 shadow-glow"
              >
                <Mic className="w-8 h-8" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={stopRecording}
                variant="destructive"
                className="rounded-full w-20 h-20 animate-pulse"
              >
                <MicOff className="w-8 h-8" />
              </Button>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {isRecording ? "Recording... Click to stop" : "Click to start answering"}
          </p>
        </Card>

        <Card className="p-6 border-border shadow-card bg-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Conversation History
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {transcript.map((item, index) => (
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
      </div>
    </div>
  );
};

export default InterviewRoom;