
import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AnalyzeSkillsOutput } from '@/ai/flows/skill-matching';
import { CheckCircle2, XCircle, AlertTriangle, Info, Download, Briefcase } from "lucide-react";

interface ResultViewProps {
  result: AnalyzeSkillsOutput;
  onTryAgain: () => void;
  jobDescription: string;
}

export function ResultView({ result, onTryAgain, jobDescription }: ResultViewProps) {
  const resultCardRef = useRef<HTMLDivElement>(null);

  // The AI should return a score between 0 and 100.
  // If it returns a decimal (e.g., 0.92), multiply by 100 to get the percentage.
  const displayScore = result.matchScore > 1 ? result.matchScore : Math.round(result.matchScore * 100);

  const getStatusStyle = () => {
    if (displayScore >= 75) {
      return {
        bgColor: 'bg-green-500/10',
        textColor: 'text-green-400',
        icon: <CheckCircle2 className="h-5 w-5" />,
        statusText: 'Approved',
        badgeClass: 'text-green-300 border-green-500/30'
      };
    } else if (displayScore >= 50) {
      return {
        bgColor: 'bg-yellow-500/10',
        textColor: 'text-yellow-400',
        icon: <AlertTriangle className="h-5 w-5" />,
        statusText: 'Needs Improvement',
        badgeClass: 'text-yellow-300 border-yellow-500/30'
      };
    } else {
      return {
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-400',
        icon: <XCircle className="h-5 w-5" />,
        statusText: 'Not a Match',
        badgeClass: 'text-red-300 border-red-500/30'
      };
    }
  };

  const { bgColor, textColor, icon, statusText } = getStatusStyle();

  const handleDownload = () => {
    const cardElement = resultCardRef.current;
    if (!cardElement) return;
  
    // Temporarily adjust style for capture
    const originalStyle = {
      padding: cardElement.style.padding,
      width: cardElement.style.width,
    };
    cardElement.style.padding = '24px'; // Match card padding
    cardElement.style.width = `${cardElement.offsetWidth}px`; // Fix width
  
    html2canvas(cardElement, {
      scale: 2, // Increase resolution for better quality
      backgroundColor: '#0a0a0a', // Dark background for the canvas
      useCORS: true,
      logging: false,
    }).then((canvas) => {
      // Restore original style after capture
      cardElement.style.padding = originalStyle.padding;
      cardElement.style.width = originalStyle.width;
  
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });
  
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      const margin = 10;
  
      pdf.addImage(imgData, 'PNG', margin, position + margin, pdfWidth - (margin * 2), imgHeight);
      heightLeft -= pdfHeight;
  
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position + margin, pdfWidth - (margin*2), imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save('resume-analysis-report.pdf');
    });
  };

  return (
    <>
      <Card 
        ref={resultCardRef} 
        className="w-full max-w-3xl mx-auto border-primary/20 shadow-primary/5 shadow-lg"
        style={{ backgroundColor: '#0a0a0a' }} // Force background for html2canvas
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline text-2xl">Analysis Complete</CardTitle>
              <CardDescription>Here's how your resume stacks up against the job description.</CardDescription>
            </div>
            <div className={`flex items-center gap-2 p-2 rounded-md font-semibold ${bgColor} ${textColor}`}>
              {icon}
              <span>{statusText}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-6 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground text-sm font-medium">MATCH SCORE</p>
            <p className={`font-bold text-6xl font-headline ${textColor}`}>{displayScore}%</p>
            {result.scoreRationale && (
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{result.scoreRationale}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-400"><CheckCircle2 size={18} /> Matching Skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.matchingSkills.length > 0 ? result.matchingSkills.map(skill => (
                  <Badge key={skill} variant="outline" className="text-green-300 border-green-500/30">{skill}</Badge>
                )) : <p className="text-sm text-muted-foreground">No matching skills found.</p>}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-400"><XCircle size={18} /> Missing Skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.length > 0 ? result.missingSkills.map(skill => (
                  <Badge key={skill} variant="outline" className="text-red-300 border-red-500/30">{skill}</Badge>
                )) : <p className="text-sm text-muted-foreground">No missing skills. Great job!</p>}
              </div>
            </div>
          </div>

          {result.impliedSkills && result.impliedSkills.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-cyan-400"><Info size={18} /> Implied Skills Analysis</h3>
              <div className="space-y-3 rounded-md border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-muted-foreground">
                <p className="leading-relaxed">{result.impliedSkills}</p>
              </div>
            </div>
          )}

          {jobDescription && (
            <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary"><Briefcase size={18} /> Job Description Analyzed</h3>
                <div className="space-y-3 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground max-h-48 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-body">{jobDescription}</pre>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="w-full max-w-3xl mx-auto mt-6">
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-start p-0">
          <Button onClick={onTryAgain} variant="outline" className="w-full sm:w-auto">Analyze Another</Button>
          <Button onClick={handleDownload} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </CardFooter>
      </div>
    </>
  );
}
