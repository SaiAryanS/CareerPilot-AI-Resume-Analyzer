
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  type EvaluateAnswerOutput,
} from '@/ai/flows/interview-flow';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Loader2, Mic, StopCircle } from 'lucide-react';

type InterviewResult = EvaluateAnswerOutput & { question: string };

export default function InterviewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [results, setResults] = useState<InterviewResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  const preventPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    toast({
      variant: 'destructive',
      title: 'Pasting Disabled',
      description: 'Please type your answer to ensure a fair evaluation.',
    });
  };

  const handleSpeech = () => {
    if (isRecording) {
      recognition?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Speech recognition not supported in this browser.' });
      return;
    }

    const newRecognition = new SpeechRecognition();
    newRecognition.continuous = true;
    newRecognition.interimResults = true;
    setRecognition(newRecognition);

    newRecognition.onstart = () => setIsRecording(true);
    newRecognition.onend = () => setIsRecording(false);
    newRecognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast({ variant: 'destructive', title: 'Speech recognition error', description: event.error });
      setIsRecording(false);
    };

    newRecognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setUserAnswer((prev) => prev + finalTranscript + ' ');
      }
    };
    newRecognition.start();
  };

  const handleSubmit = useCallback(async () => {
    if (!userAnswer.trim()) {
      toast({ variant: 'destructive', title: 'Please provide an answer.' });
      return;
    }

    setIsEvaluating(true);
    try {
      const jobDescription = sessionStorage.getItem('interviewJobDescription');
      if (!jobDescription) throw new Error('Job description not found.');

      const result = await evaluateInterviewAnswer({
        jobDescription,
        question: questions[currentQuestionIndex],
        userAnswer,
      });

      const newResults = [...results, { ...result, question: questions[currentQuestionIndex] }];
      setResults(newResults);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setUserAnswer('');
      } else {
        sessionStorage.setItem('interviewResults', JSON.stringify(newResults));
        router.push('/interview/results');
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Evaluation Failed', description: error.message });
    } finally {
      setIsEvaluating(false);
    }
  }, [userAnswer, questions, currentQuestionIndex, results, router, toast]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const jobDescription = sessionStorage.getItem('interviewJobDescription');
        if (!jobDescription) {
          toast({ variant: 'destructive', title: 'Error', description: 'No job description found. Redirecting...' });
          router.push('/');
          return;
        }
        const response = await generateInterviewQuestions(jobDescription);
        setQuestions(response.questions);
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Failed to generate questions', description: error.message });
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [router, toast]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl text-center">
          <CardContent className="p-10 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="font-headline text-xl text-primary">Preparing Your Interview...</p>
            <p className="text-muted-foreground">The AI is generating questions based on the job description.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 pt-20">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="mb-4" />
          <CardTitle className="font-headline text-xl">Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
          <CardDescription className="text-lg pt-2">{questions[currentQuestionIndex]}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onPaste={preventPaste}
              placeholder="Type or speak your answer here..."
              rows={8}
              className="pr-20"
              disabled={isEvaluating}
            />
            <Button
              size="icon"
              variant={isRecording ? 'destructive' : 'outline'}
              className="absolute top-3 right-3"
              onClick={handleSpeech}
              disabled={isEvaluating}
            >
              {isRecording ? <StopCircle /> : <Mic />}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isEvaluating || !userAnswer.trim()} className="w-full font-bold">
            {isEvaluating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {currentQuestionIndex < questions.length - 1 ? 'Submit & Next Question' : 'Finish Interview'}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
