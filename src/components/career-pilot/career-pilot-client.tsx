
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
Job Description: We are looking for a skilled Frontend Developer to join our team. You will be responsible for building the client-side of our web applications, translating UI/UX design wireframes into high-quality, reusable code. You will work closely with our design and backend teams to ensure seamless API integration and deliver a visually appealing and highly responsive user experience across multiple devices.

Key Skills Required:

Languages: HTML5, CSS3, JavaScript (ES6+), TypeScript

Frameworks/Libraries: React, Vue.js, or Angular

State Management: Redux, MobX, or Zustand

Tools: Git, Webpack, Babel, npm/yarn

Concepts: RESTful APIs, Responsive Design, Web Performance Optimization`,
  BackendDeveloper: `Backend Developer
Job Description: We are seeking an experienced Backend Developer to build and maintain the server-side logic of our applications. Your primary focus will be the development of server-side logic, definition and maintenance of the central database, and ensuring high performance and responsiveness to requests from the frontend. You will also be responsible for designing and implementing robust, secure, and scalable APIs.

Key Skills Required:

Languages: Python, Node.js, Java, or Go

Frameworks: FastAPI, Django, Express.js, or Spring Boot

Databases: PostgreSQL (SQL), MongoDB (NoSQL), Redis

API Design: RESTful APIs, GraphQL

Tools: Docker, Git, Postman

Concepts: Authentication & Authorization (OAuth, JWT), Microservices`,
  FullStackDeveloper: `Full-Stack Developer
Job Description: Our company is hiring a versatile Full-Stack Developer capable of working on both frontend and backend components of our web applications. You will be responsible for developing end-to-end features, from the database to the UI. This role requires the ability to switch contexts quickly and a passion for building software from the ground up.

Key Skills Required:

Frontend: HTML, CSS, JavaScript, and a modern framework like React or Vue.js

Backend: Python (Django/FastAPI) or Node.js (Express)

Databases: Proficiency in both SQL and NoSQL databases

DevOps: Docker, basic CI/CD pipeline knowledge

APIs: Experience designing and consuming RESTful APIs

Version Control: Git`,
  DataScientist: `Data Scientist
Job Description: We are looking for a Data Scientist to analyze large amounts of raw information to find patterns and build predictive models. You will be responsible for the entire data science lifecycle, from data collection and cleaning to model deployment and monitoring. You will perform statistical analysis and create data visualizations to provide actionable insights that drive business decisions.

Key Skills Required:

Languages: Python, R

Libraries: Pandas, NumPy, Scikit-learn, TensorFlow, or PyTorch

Data Visualization: Matplotlib, Seaborn, Plotly

Databases: Strong SQL skills

Concepts: Machine Learning, Statistical Modeling, Data Mining, Predictive Analytics`,
  DevOpsEngineer: `DevOps Engineer
Job Description: We are seeking a DevOps Engineer to manage and automate our software development lifecycle. You will be responsible for building and maintaining our CI/CD pipelines, managing our cloud infrastructure, and ensuring the reliability, scalability, and security of our systems. This role requires close collaboration with development teams to streamline deployments.

Key Skills Required:

Cloud Platforms: AWS, Google Cloud Platform (GCP), or Azure

CI/CD Tools: Jenkins, GitHub Actions, GitLab CI

Infrastructure as Code (IaC): Terraform, Ansible

Containerization: Docker, Kubernetes

Scripting: Bash, Python, or PowerShell

Monitoring: Prometheus, Grafana, Datadog`,
  UIUXDesigner: `UI/UX Designer
Job Description: We are hiring a creative UI/UX Designer to craft intuitive and visually appealing interfaces for our users. You will conduct user research, create user flows, wireframes, and prototypes, and ultimately design the final user interface. You will collaborate closely with product managers and engineers to ensure a consistent and user-centric design language across all products.

Key Skills Required:

Design Tools: Figma, Sketch, Adobe XD

Core Skills: Wireframing, Prototyping, User Research, Usability Testing

Concepts: Information Architecture, User-Centered Design, Interaction Design

Collaboration: Experience working in an agile environment with developers.`,
  ProductManager: `Product Manager (Tech)
Job Description: We are looking for a strategic Product Manager to own the product lifecycle from conception to launch. You will be responsible for defining the product vision, creating and managing the product roadmap, writing detailed user stories, and prioritizing features. You will act as the voice of the customer and work with cross-functional teams to deliver impactful products.

Key Skills Required:

Methodologies: Agile, Scrum, Kanban

Tools: Jira, Trello, Aha!, ProductBoard

Skills: Roadmapping, Market Research, A/B Testing, User Story Creation

Communication: Strong written and verbal communication skills`,
  MobileDeveloper: `Mobile Developer (iOS/Android)
Job Description: We are seeking a Mobile Developer to design, build, and maintain our applications for iOS and Android platforms. You will be responsible for the full development lifecycle, from initial design to final deployment on the App Store and Google Play Store. You must have a passion for mobile technologies and creating a seamless user experience.

Key Skills Required:

Native: Swift & UIKit/SwiftUI (for iOS), Kotlin & Jetpack Compose (for Android)

Cross-Platform: React Native, Flutter, or Xamarin

Tools: Xcode, Android Studio, Git

APIs: Experience with RESTful APIs and mobile data synchronization

Concepts: Mobile UI/UX principles, Push Notifications, Offline Storage`,
  QAEngineer: `Quality Assurance (QA) Engineer
Job Description: We need a detail-oriented QA Engineer to ensure the quality of our software releases. You will be responsible for creating and executing detailed test plans, identifying and documenting bugs, and developing automated test scripts. You will work closely with the development team to ensure that all products meet our high standards of quality before they reach our users.

Key Skills Required:

Testing: Manual Testing, Automated Testing, Regression Testing

Automation Tools: Selenium, Cypress, Playwright

API Testing: Postman, SoapUI

Bug Tracking: Jira, Bugzilla

Languages: Basic knowledge of SQL and a scripting language like Python or JavaScript`,
  CybersecurityAnalyst: `Cybersecurity Analyst
Job Description: We are hiring a Cybersecurity Analyst to protect our company's computer systems and networks. You will monitor for security breaches, conduct vulnerability assessments, and respond to security incidents. You will be responsible for implementing security measures, maintaining our security protocols, and educating staff on security best practices.

Key Skills Required:

Tools: SIEM (e.g., Splunk), Nessus, Wireshark, Metasploit

Concepts: Network Security, Vulnerability Assessment, Penetration Testing, Incident Response

Standards: Knowledge of security frameworks like NIST or ISO 27001

Scripting: Python or Bash for automation`,
  DatabaseAdministrator: `Database Administrator (DBA)
Job Description: We are looking for a Database Administrator to be responsible for the performance, integrity, and security of our databases. You will handle database design, maintenance, backup, and recovery. You will also be responsible for performance tuning, query optimization, and ensuring data remains consistent across the database.

Key Skills Required:

Databases: PostgreSQL, MySQL, MS SQL Server, or Oracle

Languages: Strong expertise in SQL

Skills: Performance Tuning, Backup and Recovery strategies, Data Security

Scripting: Bash or PowerShell for automating tasks

Cloud: Experience with cloud databases like AWS RDS or Azure SQL Database`,
  MLEngineer: `Machine Learning Engineer
Job Description: We are seeking a Machine Learning Engineer to deploy and maintain our machine learning models in production environments. Unlike a data scientist who focuses on research and model creation, you will focus on the operational side, ensuring models are scalable, efficient, and reliable. You will build data pipelines and MLOps workflows to automate the training and deployment of models.

Key Skills Required:

Languages: Python

ML Frameworks: TensorFlow, PyTorch, Keras, Scikit-learn

MLOps Tools: Kubeflow, MLflow, Docker, Kubernetes

Cloud Platforms: AWS SageMaker, Google AI Platform, or Azure Machine Learning

Software Engineering: Strong understanding of data structures and algorithms`,
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
                resumeText,
                jobDescription: jobDescriptionKey,
                analysisResult: result,
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

    