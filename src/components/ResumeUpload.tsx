import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, X, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ResumeUploadProps {
  onResumeProcessed: (resumeData: { text: string; skills: string[]; summary: string }) => void;
  existingResume?: { fileName: string; skills: string[] } | null;
}

export const ResumeUpload = ({ onResumeProcessed, existingResume }: ResumeUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(existingResume?.fileName || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await processFile(file);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const processFile = async (file: File) => {
    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF, DOC, DOCX, or TXT file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in first");
        return;
      }

      // Read file content
      const text = await readFileContent(file);
      
      // Upload to storage
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save initial record to database immediately so the upload is reflected
      const { data: insertData, error: insertError } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          file_name: file.name,
          resume_text: "",
          skills: [],
          experience_summary: ""
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update UI to show upload success while analysis runs
      setUploadedFile(file.name);
      toast.success("Resume uploaded — analyzing in background");

      // Call edge function to parse resume with AI
      let parseData: any = { skills: [], summary: "" };
      try {
        const { data: parsed, error: parseError } = await supabase.functions.invoke("parse-resume", {
          body: { resumeText: text }
        });

        if (parseError) throw parseError;
        parseData = parsed || parseData;
      } catch (parseErr) {
        console.error("Parse error:", parseErr);
        toast.error("Failed to analyze resume automatically. You can try again later.");
      }

      // If parsing returned results, update the DB record
      if (parseData) {
        const { error: updateError } = await supabase
          .from("resumes")
          .update({
            resume_text: text,
            skills: parseData.skills || [],
            experience_summary: parseData.summary || ""
          })
          .eq("id", insertData.id);

        if (updateError) {
          console.error("DB update error:", updateError);
        } else {
          onResumeProcessed({
            text,
            skills: parseData.skills || [],
            summary: parseData.summary || ""
          });
          toast.success("Resume analyzed!");
        }
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload resume");
    } finally {
      setIsUploading(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      
      if (file.type === "text/plain") {
        reader.readAsText(file);
      } else {
        // For PDF/DOC files, we'll send the raw text extraction to AI
        reader.readAsText(file);
      }
    });
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!uploadedFile ? (
        <Card
          className={`p-8 border-2 border-dashed transition-all cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center text-center">
            {isUploading ? (
              <>
                <Loader2 className="w-12 h-12 text-primary mb-4 animate-spin" />
                <p className="font-medium">Analyzing your resume...</p>
                <p className="text-sm text-muted-foreground">This may take a moment</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="font-medium mb-1">Drop your resume here</p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports PDF, DOC, DOCX, TXT (max 5MB)
                </p>
              </>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-4 bg-success/10 border-success/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-medium flex items-center gap-2">
                  {uploadedFile}
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </p>
                <p className="text-xs text-muted-foreground">Resume analyzed successfully</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {existingResume && existingResume.skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {existingResume.skills.slice(0, 5).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
            >
              {skill}
            </span>
          ))}
          {existingResume.skills.length > 5 && (
            <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
              +{existingResume.skills.length - 5} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};
