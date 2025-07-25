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
    DataAnalyst: `Data Analyst Job Description: We are seeking a detail-oriented Data Analyst to join our team. The Data Analyst will be responsible for interpreting data, analyzing results using statistical techniques, and providing ongoing reports. The ideal candidate will have strong analytical skills, experience with data models, and the ability to turn data into actionable insights.`,
    CyberSecurityAnalyst: `Cyber Security Analyst Job Description: We are looking for a vigilant Cyber Security Analyst to protect our computer networks and systems. You will be responsible for monitoring, detecting, investigating, analyzing, and responding to security events. A strong understanding of network security, threat intelligence, and incident response is required.`,
    WebDeveloper: `Web Developer Job Description: We are hiring a passionate Web Developer to design and build user-friendly websites and web applications. Responsibilities include front-end development using HTML, CSS, JavaScript, and modern frameworks like React, as well as back-end integration. A keen eye for design and a commitment to creating a seamless user experience are essential.`,
    BackendDeveloper: `Backend Developer Job Description: We are seeking an experienced Backend Developer to build and maintain the server-side logic of our applications. You will be responsible for developing and managing databases, APIs, and server infrastructure. Proficiency in languages like Python, Java, or Node.js and experience with cloud platforms is required.`,
    ML: `Machine Learning Engineer Job Description: We are seeking a talented Machine Learning (ML) Engineer to join our innovative team. The ML Engineer will be responsible for designing, developing, and deploying machine learning models to solve complex business problems. The ideal candidate will have a solid foundation in computer science, mathematics, and statistics, along with hands-on experience in building and optimizing ML models.`,
    AI: `AI Engineer Job Description: We are looking for a skilled and creative AI Engineer to join our forward-thinking team. The AI Engineer will be responsible for developing and implementing artificial intelligence solutions that drive business innovation. The ideal candidate will have a strong background in AI/ML, deep learning, natural language processing (NLP), and computer vision, as well as experience in building and deploying AI-powered applications.`,
    CSE: `Computer Science Engineer Job Description: We are hiring a motivated and skilled Computer Science Engineer to join our dynamic engineering team. The Computer Science Engineer will be responsible for designing, developing, and maintaining software applications and systems. The ideal candidate will have a strong understanding of computer science fundamentals, data structures, algorithms, and software development best practices.`
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
              {Object.entries(jobDescriptions).map(([key]) => (
                <SelectItem key={key} value={key}>{key}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {jobDescription && (
            <div className="p-4 mt-2 text-sm text-muted-foreground bg-muted/30 rounded-md border border-border/50 max-h-40 overflow-y-auto">
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
