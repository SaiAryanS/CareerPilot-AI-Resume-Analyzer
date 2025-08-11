
"use client";

import { useState } from 'react';
import { analyzeSkills, type AnalyzeSkillsOutput } from '@/ai/flows/skill-matching';
import { AnalysisView } from '@/components/career-pilot/analysis-view';
import { ResultView } from '@/components/career-pilot/result-view';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import * as pdfjs from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;


type Stage = 'analysis' | 'result';

const jobDescriptions = {
    DataAnalyst: `Data Analyst Job Description: We are seeking a detail-oriented Data Analyst to join our team. The Data Analyst will be responsible for interpreting data, analyzing results using statistical techniques, and providing ongoing reports. The ideal candidate will have strong analytical skills, experience with data models, and the ability to turn data into actionable insights.`,
    CyberSecurityAnalyst: `Cyber Security Analyst Job Description: We are looking for a vigilant Cyber Security Analyst to protect our computer networks and systems. You will be responsible for monitoring, detecting, investigating, analyzing, and responding to security events. A strong understanding of network security, threat intelligence, and incident response is required.`,
    WebDeveloper: `Web Developer Job Description: We are hiring a passionate Web Developer to design and build user-friendly websites and web applications. Responsibilities include front-end development using HTML, CSS, JavaScript, and modern frameworks like React, as well as back-end integration. A keen eye for design and a commitment to creating a seamless user experience are essential.`,
    BackendDeveloper: `Backend Developer Job Description: We are seeking an experienced Backend Developer to build and maintain the server-side logic of our applications. You will be responsible for developing and managing databases, APIs, and server infrastructure. Proficiency in languages like Python, Java, or Node.js and experience with cloud platforms is required.`,
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

  const { toast } = useToast();

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

    try {
        const resumeText = await extractTextFromPdf(resumeFile);
        const jobDescription = jobDescriptions[jobDescriptionKey as keyof typeof jobDescriptions];

        const result = await analyzeSkills({
            jobDescription: jobDescription,
            resume: resumeText,
        });

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

  const resetAnalysis = () => {
    setStage('analysis');
    setAnalysisResult(null);
    setJobDescriptionKey('');
    setResumeFile(null);
  }

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
          onTryAgain={resetAnalysis}
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
