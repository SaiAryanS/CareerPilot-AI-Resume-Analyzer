import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from 'lucide-react';

interface AnalysisViewProps {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  resumeFile: File | null;
  onResumeFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export function AnalysisView({ jobDescription, onJobDescriptionChange, resumeFile, onResumeFileChange, onAnalyze, isLoading }: AnalysisViewProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto border-primary/20 shadow-primary/5 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Resume Analysis</CardTitle>
        <CardDescription>Paste the job description and upload your resume to get a skill match analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="job-description" className="font-medium">Job Description</Label>
          <Textarea
            id="job-description"
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            className="min-h-[200px] bg-background/50 border-border focus:border-primary focus:ring-primary"
            rows={10}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="resume-upload" className="font-medium">Your Resume</Label>
          <div className="flex items-center space-x-4">
            <Label htmlFor="resume-upload" className="flex-1">
              <div className="flex items-center justify-center w-full h-12 px-4 py-2 text-sm rounded-md border border-dashed border-primary/50 cursor-pointer hover:bg-accent/10 hover:border-primary/80 transition-colors">
                <Upload className="mr-2 h-4 w-4" />
                <span>{resumeFile ? 'Change Resume' : 'Upload Resume (.txt)'}</span>
              </div>
            </Label>
            <Input id="resume-upload" type="file" className="hidden" onChange={onResumeFileChange} accept=".txt" />
            {resumeFile && <p className="text-sm text-muted-foreground truncate max-w-xs">{resumeFile.name}</p>}
          </div>
          <p className="text-xs text-muted-foreground">Please use a plain text (.txt) file for analysis.</p>
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
