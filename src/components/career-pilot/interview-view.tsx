import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Loader2, ArrowLeft, ArrowRight } from "lucide-react";

interface InterviewViewProps {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  answer: string;
  onAnswerChange: (value: string) => void;
  onRecord: () => void;
  isRecording: boolean;
  transcription: string;
  onNext: () => void;
  onPrev: () => void;
}

export function InterviewView({ question, questionNumber, totalQuestions, answer, onAnswerChange, onRecord, isRecording, transcription, onNext, onPrev }: InterviewViewProps) {
  const isLastQuestion = questionNumber >= totalQuestions;

  return (
    <Card className="w-full max-w-3xl mx-auto border-primary/20 shadow-primary/5 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="font-headline text-2xl">Interview Simulation</CardTitle>
          <p className="text-sm text-muted-foreground font-medium">Question {questionNumber}/{totalQuestions}</p>
        </div>
        <CardDescription className="text-xl pt-4 border-t border-border mt-4">{question}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Textarea
            placeholder="Type your answer here... the 'Record' button will use this text to simulate transcription."
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            className="min-h-[120px] bg-background/50"
            rows={5}
          />
          <Button onClick={onRecord} disabled={isRecording || !answer} className="mt-2">
            {isRecording ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
            Record Answer
          </Button>
        </div>

        {transcription && (
          <div className="space-y-2 animate-in fade-in-50 duration-500">
            <h3 className="font-semibold text-muted-foreground">Mock Transcription:</h3>
            <div className="p-4 rounded-md bg-muted/50 border border-border font-code text-sm text-primary/80 whitespace-pre-wrap">
              {transcription}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={onPrev} variant="outline" disabled={questionNumber <= 1}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button onClick={onNext} variant="outline">
          {isLastQuestion ? 'Finish' : 'Next'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
