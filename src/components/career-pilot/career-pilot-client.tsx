
"use client";

import { useState, useEffect } from 'react';
import { analyzeSkills, type AnalyzeSkillsOutput } from '@/ai/flows/skill-matching';
import { AnalysisView } from '@/components/career-pilot/analysis-view';
import { ResultView } from '@/components/career-pilot/result-view';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import * as pdfjs from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

type Stage = 'analysis' | 'result';

export type Job = {
  _id: string;
  title: string;
  description: string;
};

export default function CareerPilotClient() {
  const [stage, setStage] = useState<Stage>('analysis');
  const [jobId, setJobId] = useState('');
  const [jobList, setJobList] = useState<Job[]>([]);
  const [isJobsLoading, setIsJobsLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSkillsOutput | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsJobsLoading(true);
        const response = await fetch('/api/jobs');
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        const data = await response.json();
        setJobList(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load job descriptions. Please refresh the page.",
        });
      } finally {
        setIsJobsLoading(false);
      }
    };
    fetchJobs();
  }, [toast]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResumeFile(e.target.files[0]);
    }
  };

  const extractTextFromPdf = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => 'str' in item ? item.str : '').join(' ');
    }
    return text;
  }

  const getSelectedJob = () => jobList.find(job => job._id === jobId);

  const handleAnalyze = async () => {
    const selectedJob = getSelectedJob();
    if (!selectedJob || !resumeFile) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a job description and upload a resume file.",
      });
      return;
    }
    setIsLoading(true);

    try {
        const resumeText = await extractTextFromPdf(resumeFile);

        const result = await analyzeSkills({
            jobDescription: selectedJob.description,
            resume: resumeText,
        });

        setAnalysisResult(result);
        setStage('result');
        
        // Securely save the analysis to the database via our API route
        await fetch('/api/save-analysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                resumeFileName: resumeFile.name,
                jobDescription: selectedJob.title, // Save title for readability
                matchScore: result.matchScore,
            }),
        });

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

  const resetAnalysis = () => {
    setStage('analysis');
    setAnalysisResult(null);
    setJobId('');
    setResumeFile(null);
  }

  const renderContent = () => {
    if (isLoading && stage === 'analysis') {
      return (
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-10 flex flex-col items-center justify-center space-y-4 h-[450px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="font-headline text-xl text-primary">Analyzing Your Profile...</p>
            <p className="text-muted-foreground text-center">The AI is comparing your resume to the job description to find the perfect match.</p>
          </CardContent>
        </Card>
      );
    }

    const selectedJob = getSelectedJob();

    switch (stage) {
      case 'analysis':
        return <AnalysisView
          jobId={jobId}
          onJobChange={setJobId}
          selectedJobDescription={selectedJob?.description || ''}
          jobList={jobList}
          resumeFile={resumeFile}
          onResumeFileChange={handleFileChange}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          isJobsLoading={isJobsLoading}
        />;
      case 'result':
        return analysisResult && selectedJob && <ResultView
          result={analysisResult}
          onTryAgain={resetAnalysis}
          jobDescription={selectedJob.description}
        />;
      default:
        return null;
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-4xl sm:text-5xl font-bold text-center mb-2 font-headline text-primary">
        Resume Analysis
      </h1>
      <p className="text-center text-lg text-muted-foreground mb-10">
        Your AI-Powered Resume Analyis
      </p>
      {renderContent()}
    </div>
  );
}
