
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnalysisViewProps {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  resumeFile: File | null;
  onResumeFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

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

export function AnalysisView({ jobDescription, onJobDescriptionChange, resumeFile, onResumeFileChange, onAnalyze, isLoading }: AnalysisViewProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto border-primary/20 shadow-primary/5 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Resume Analysis</CardTitle>
        <CardDescription>Select a job description and upload your resume to get a skill match analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="job-description" className="font-medium">Job Description</Label>
          <Select onValueChange={onJobDescriptionChange} value={jobDescription}>
            <SelectTrigger id="job-description" className="w-full bg-background/50 border-border focus:border-primary focus:ring-primary">
              <SelectValue placeholder="Select a job description" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(jobDescriptions).map(([key, value]) => (
                <SelectItem key={key} value={key}>{value.split('\n')[0]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {jobDescription && (
            <div className="p-4 mt-2 text-sm text-muted-foreground bg-muted/30 rounded-md border border-border/50 whitespace-pre-line">
                {jobDescriptions[jobDescription as keyof typeof jobDescriptions]}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="resume-upload" className="font-medium">Your Resume</Label>
          <div className="flex items-center space-x-4">
            <Label htmlFor="resume-upload" className="flex-1">
              <div className="flex items-center justify-center w-full h-12 px-4 py-2 text-sm rounded-md border border-dashed border-primary/50 cursor-pointer hover:bg-accent/10 hover:border-primary/80 transition-colors">
                <Upload className="mr-2 h-4 w-4" />
                <span>{resumeFile ? 'Change Resume' : 'Upload Resume (.pdf)'}</span>
              </div>
            </Label>
            <Input id="resume-upload" type="file" className="hidden" onChange={onResumeFileChange} accept=".pdf" />
            {resumeFile && <p className="text-sm text-muted-foreground truncate max-w-xs">{resumeFile.name}</p>}
          </div>
          <p className="text-xs text-muted-foreground">Please use a PDF file for analysis.</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onAnalyze}
          disabled={!jobDescription || !resumeFile || isLoading}
          className="w-full font-bold"
          size="lg"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Analyze
        </Button>
      </CardFooter>
    </Card>
  );
}

    