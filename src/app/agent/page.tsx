'use client';

import { useState, useRef, useEffect } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Paperclip, User, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import type { Job } from '@/components/career-pilot/career-pilot-client';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
        role: 'model',
        content: "Hello! I'm your AI Career Agent. To get started, please tell me which job you're interested in and upload your resume. I'll analyze it for you."
    }
  ]);
  const [input, setInput] = useState('');
  const [jobList, setJobList] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs');
        if (!response.ok) throw new Error('Failed to fetch jobs');
        const data = await response.json();
        setJobList(data);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load jobs.' });
      }
    };
    fetchJobs();
  }, [toast]);

  const extractTextFromPdf = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => ('str' in item ? item.str : '')).join(' ');
    }
    return text;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !resumeFile) return;

    setIsLoading(true);

    const userMessageContent = `
      ${input}
      ${resumeFile ? `\n\n**Resume File:** ${resumeFile.name}` : ''}
    `;

    const newUserMessage: Message = { role: 'user', content: userMessageContent.trim() };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);

    let prompt = input;

    try {
        // If a resume is attached, extract its text and find the selected job
        if (resumeFile) {
            const resumeText = await extractTextFromPdf(resumeFile);
            const job = jobList.find(j => input.toLowerCase().includes(j.title.toLowerCase()));

            if (job) {
                // Format the prompt for the tool call
                prompt = `
                    Here is the job description and my resume. Please analyze it.

                    **Job Description:**
                    ${job.description}

                    **Resume:**
                    ${resumeText}
                `;
            } else {
                throw new Error("Could not identify the selected job from your message. Please mention the job title clearly.");
            }
        }
        
        const historyForApi = newMessages.slice(0, -1).map(msg => ({
            role: msg.role,
            content: [{text: msg.content}]
        }))

        const response = await fetch('/api/agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                history: historyForApi,
                prompt: prompt,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'The agent failed to respond.');
        }

        const data = await response.json();
        setMessages(prev => [...prev, { role: 'model', content: data.response }]);
    } catch (error: any) {
        setMessages(prev => [...prev, { role: 'model', content: `Error: ${error.message}` }]);
    } finally {
        setIsLoading(false);
        setInput('');
        setResumeFile(null);
    }
  };

  return (
    <main className="min-h-screen container mx-auto p-4 pt-24 sm:pt-28 md:pt-32 flex justify-center">
      <Card className="w-full max-w-3xl h-[80vh] flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Bot /> AI Career Agent
          </CardTitle>
          <CardDescription>
            Chat with our AI agent to analyze your resume against a job description.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'model' && <Bot className="w-6 h-6 text-primary flex-shrink-0" />}
                    <div className={`rounded-lg px-4 py-3 max-w-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                    </div>
                    {message.role === 'user' && <User className="w-6 h-6 text-muted-foreground flex-shrink-0" />}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex items-center gap-4">
              <Input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your message, e.g., 'Analyze my resume for the Web Developer role...'"
                disabled={isLoading}
                className="flex-1"
              />
               <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                    <Paperclip />
                </Button>
                <Input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={e => setResumeFile(e.target.files?.[0] || null)}
                    accept=".pdf"
                />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Send'}
              </Button>
            </form>
            {resumeFile && <p className="text-xs text-muted-foreground mt-2">Attached: {resumeFile.name}</p>}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
