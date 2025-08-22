
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
  FrontendDeveloper: `Frontend Developer
Job Description: We are looking for a skilled Frontend Developer to join our team. You will be responsible for building the client-side of our web applications and translating UI/UX design wireframes into high-quality, reusable code. You will work closely with our design and backend teams to ensure seamless API integration.

Key Skills Required:

Languages: HTML, CSS, JavaScript
Frameworks: React
Tools: Git, npm
Concepts: RESTful APIs, Responsive Design`,
  BackendDeveloper: `Backend Developer
Job Description: We are seeking an experienced Backend Developer to build and maintain the server-side logic of our applications. Your primary focus will be the development of server-side logic, definition and maintenance of the central database, and ensuring high performance and responsiveness.

Key Skills Required:

Languages: Node.js
Frameworks: Express.js
Databases: SQL, MongoDB
API Design: RESTful APIs
Tools: Git, Docker`,
  FullStackDeveloper: `Full-Stack Developer
Job Description: Our company is hiring a versatile Full-Stack Developer capable of working on both frontend and backend components of our web applications. You will be responsible for developing end-to-end features, from the database to the UI.

Key Skills Required:

Frontend: HTML, CSS, JavaScript, React
Backend: Node.js (Express)
Databases: SQL and NoSQL databases
APIs: RESTful API Design
Version Control: Git`,
  DataScientist: `Data Scientist
Job Description: We are looking for a Data Scientist to analyze large amounts of raw information to find patterns and build predictive models. You will be responsible for the entire data science lifecycle, from data collection and cleaning to model deployment.

Key Skills Required:

Languages: Python
Libraries: Pandas, NumPy, Scikit-learn
Data Visualization: Matplotlib
Databases: SQL
Concepts: Machine Learning, Statistical Modeling`,
  DevOpsEngineer: `DevOps Engineer
Job Description: We are seeking a DevOps Engineer to manage and automate our software development lifecycle. You will be responsible for building and maintaining our CI/CD pipelines, managing our cloud infrastructure, and ensuring the reliability and scalability of our systems.

Key Skills Required:

Cloud Platforms: AWS or GCP
CI/CD Tools: Jenkins, GitHub Actions
Containerization: Docker, Kubernetes
Scripting: Bash, Python`,
  UIUXDesigner: `UI/UX Designer
Job Description: We are hiring a creative UI/UX Designer to craft intuitive and visually appealing interfaces for our users. You will conduct user research, create user flows, wireframes, and prototypes, and ultimately design the final user interface.

Key Skills Required:

Design Tools: Figma, Sketch
Core Skills: Wireframing, Prototyping, User Research
Concepts: User-Centered Design, Interaction Design
Collaboration: Agile environment experience`,
  ProductManager: `Product Manager (Tech)
Job Description: We are looking for a strategic Product Manager to own the product lifecycle from conception to launch. You will be responsible for defining the product vision, creating and managing the product roadmap, and prioritizing features.

Key Skills Required:

Methodologies: Agile, Scrum
Tools: Jira
Skills: Roadmapping, Market Research, User Story Creation
Communication: Strong written and verbal skills`,
  MobileDeveloper: `Mobile Developer (iOS/Android)
Job Description: We are seeking a Mobile Developer to design, build, and maintain our applications for iOS and Android platforms. You will be responsible for the full development lifecycle, from initial design to final deployment.

Key Skills Required:

Platforms: Swift (for iOS), Kotlin (for Android)
Cross-Platform: React Native or Flutter
Tools: Xcode, Android Studio, Git
APIs: RESTful API consumption`,
  QAEngineer: `Quality Assurance (QA) Engineer
Job Description: We need a detail-oriented QA Engineer to ensure the quality of our software releases. You will be responsible for creating and executing test plans, identifying and documenting bugs, and developing automated test scripts.

Key Skills Required:

Testing: Manual Testing, Automated Testing
Automation Tools: Selenium, Cypress
API Testing: Postman
Bug Tracking: Jira
Languages: Basic SQL and Python`,
  CybersecurityAnalyst: `Cybersecurity Analyst
Job Description: We are hiring a Cybersecurity Analyst to protect our company's computer systems and networks. You will monitor for security breaches, conduct vulnerability assessments, and respond to security incidents.

Key Skills Required:

Tools: SIEM, Nessus, Wireshark
Concepts: Network Security, Vulnerability Assessment, Incident Response
Standards: NIST or ISO 27001 frameworks
Scripting: Python or Bash`,
  DatabaseAdministrator: `Database Administrator (DBA)
Job Description: We are looking for a Database Administrator to be responsible for the performance, integrity, and security of our databases. You will handle database design, maintenance, backup, and recovery.

Key Skills Required:

Databases: PostgreSQL, MySQL, MS SQL Server
Languages: Strong SQL
Skills: Performance Tuning, Backup and Recovery
Scripting: Bash or PowerShell`,
  MLEngineer: `Machine Learning Engineer
Job Description: We are seeking a Machine Learning Engineer to deploy and maintain our machine learning models in production environments. You will focus on the operational side, ensuring models are scalable, efficient, and reliable.

Key Skills Required:

Languages: Python
ML Frameworks: TensorFlow, PyTorch, Scikit-learn
MLOps Tools: Docker, Kubernetes
Cloud Platforms: AWS SageMaker or Google AI Platform`,
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
        
        // Securely save the analysis to the database via our API route
        await fetch('/api/save-analysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                resumeFileName: resumeFile.name,
                jobDescription: jobDescriptionKey,
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
    setJobDescriptionKey('');
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
          jobDescription={jobDescriptions[jobDescriptionKey as keyof typeof jobDescriptions]}
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
