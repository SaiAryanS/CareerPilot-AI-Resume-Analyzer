
"use client";

import { useState } from 'react';
import type { AnalyzeSkillsOutput } from '@/ai/flows/skill-matching';
import { AnalysisView } from '@/components/career-pilot/analysis-view';
import { ResultView } from '@/components/career-pilot/result-view';
import { InterviewView } from '@/components/career-pilot/interview-view';
import { analyzeSkills } from '@/ai/flows/skill-matching';
import { mockVoiceTranscription } from '@/ai/flows/mock-voice-transcription';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

type Stage = 'analysis' | 'result' | 'interview';

const interviewQuestions = [
  "Can you tell me about yourself and your background?",
  "What are your biggest weaknesses and how do you work to improve them?",
  "What are your biggest strengths and how would they benefit our team?",
  "Where do you see yourself professionally in the next five years?",
  "Why are you interested in this specific role and our company?",
];

const jobDescriptions = {
  HR: `Human Resources Manager Job Description: We are looking for an experienced and dedicated Human Resources (HR) Manager to join our team. The HR Manager will be responsible for overseeing all aspects of the HR department, including recruitment, employee relations, performance management, and compliance with employment laws. The ideal candidate will have a strong background in HR principles and practices, excellent communication skills, and the ability to work effectively with employees at all levels of the organization.`,
  ML: `Machine Learning Engineer Job Description: We are seeking a talented Machine Learning (ML) Engineer to join our innovative team. The ML Engineer will be responsible for designing, developing, and deploying machine learning models to solve complex business problems. The ideal candidate will have a solid foundation in computer science, mathematics, and statistics, along with hands-on experience in building and optimizing ML models.`,
  AI: `AI Engineer Job Description: We are looking for a skilled and creative AI Engineer to join our forward-thinking team. The AI Engineer will be responsible for developing and implementing artificial intelligence solutions that drive business innovation. The ideal candidate will have a strong background in AI/ML, deep learning, natural language processing (NLP), and computer vision, as well as experience in building and deploying AI-powered applications.`,
  CSE: `Computer Science Engineer Job Description: We are hiring a motivated and skilled Computer Science Engineer to join our dynamic engineering team. The Computer Science Engineer will be responsible for designing, developing, and maintaining software applications and systems. The ideal candidate will have a strong understanding of computer science fundamentals, data structures, algorithms, and software development best practices.`
};

export default function CareerPilotClient() {
  const [stage, setStage] = useState<Stage>('analysis');
  const [jobDescriptionKey, setJobDescriptionKey] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSkillsOutput | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescriptionKey || !resumeFile) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a job description and upload a resume file.",
      });
      return;
    }
    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const fileBuffer = e.target?.result as ArrayBuffer;
        if (!fileBuffer) {
          throw new Error("Could not read resume file.");
        }
        
        const pdfjs = await import('pdfjs-dist');
        const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs');
        pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

        const doc = await pdfjs.getDocument({data: fileBuffer}).promise;
        let fullText = '';
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map(item => (item as any).str).join(' ');
        }
        const resumeText = fullText;
        
        const jobDescription = jobDescriptions[jobDescriptionKey as keyof typeof jobDescriptions];
        const result = await analyzeSkills({ jobDescription, resume: resumeText });
        setAnalysisResult(result);
        setStage('result');
      } catch (error) {
        console.error("Analysis failed:", error);
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: "An error occurred during the analysis. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "File Read Error",
        description: "Failed to read the resume file.",
      });
    }

    reader.readAsArrayBuffer(resumeFile);
  };

  const handleStartInterview = () => {
    setStage('interview');
  };

  const handleRecordAnswer = async () => {
    if (!userAnswer) {
      toast({
        variant: "destructive",
        title: "No Answer Provided",
        description: "Please type your answer before recording.",
      });
      return;
    }
    setIsRecording(true);
    try {
      const result = await mockVoiceTranscription({ spokenAnswer: userAnswer });
      setTranscription(result.transcription);
    } catch (error) {
      console.error("Transcription failed:", error);
      toast({
        variant: "destructive",
        title: "Transcription Failed",
        description: "Could not generate the mock transcription.",
      });
    } finally {
      setIsRecording(false);
    }
  };

  const resetAnalysis = () => {
    setStage('analysis');
    setAnalysisResult(null);
    setJobDescriptionKey('');
    setResumeFile(null);
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < interviewQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setTranscription('');
    } else {
      // Potentially loop back to the beginning or show a summary screen
      resetAnalysis();
      toast({
        title: "Interview Complete!",
        description: "You've finished all the questions.",
      });
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setUserAnswer('');
      setTranscription('');
    }
  };

  const renderContent = () => {
    if (isLoading && stage === 'analysis') {
      return (
        <Card className="w-full max-w-2xl">
          <CardContent className="p-10 flex flex-col items-center justify-center space-y-4 h-[450px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="font-headline text-xl text-primary">Analyzing Your Profile...</p>
            <p className="text-muted-foreground text-center">The AI is comparing your resume to the job description to find the perfect match.</p>
          </CardContent>
        </Card>
      );
    }

    switch (stage) {
      case 'analysis':
        return <AnalysisView
          jobDescription={jobDescriptionKey}
          onJobDescriptionChange={setJobDescriptionKey}
          resumeFile={resumeFile}
          onResumeFileChange={handleFileChange}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
        />;
      case 'result':
        return analysisResult && <ResultView
          result={analysisResult}
          onStartInterview={handleStartInterview}
          onTryAgain={resetAnalysis}
        />;
      case 'interview':
        return <InterviewView
          question={interviewQuestions[currentQuestionIndex]}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={interviewQuestions.length}
          answer={userAnswer}
          onAnswerChange={setUserAnswer}
          onRecord={handleRecordAnswer}
          isRecording={isRecording}
          transcription={transcription}
          onNext={handleNextQuestion}
          onPrev={handlePrevQuestion}
        />;
      default:
        return null;
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-4xl sm:text-5xl font-bold text-center mb-2 font-headline bg-gradient-to-r from-primary via-cyan-300 to-blue-400 text-transparent bg-clip-text">
        CareerPilot AI
      </h1>
      <p className="text-center text-lg text-muted-foreground mb-10">
        Your AI-Powered Career Copilot
      </p>
      {renderContent()}
    </div>
  );
}
