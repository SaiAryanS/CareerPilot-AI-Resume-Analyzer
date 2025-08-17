
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
