
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
import { Message } from 'genkit';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

export default function AgentPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
        role: 'model',
        content: "Hello! I'm your AI Career Agent. To get started, please select a job and upload your resume. I'll analyze it for you."
    }
  ]);
  const [jobId, setJobId] = useState('');
  const [jobList, setJobList] = useState<Job[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isJobsLoading, setIsJobsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
        }
    }
  }, [messages]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsJobsLoading(true);
        const response = await fetch('/api/jobs');
        if (!response.ok) throw new Error('Failed to fetch jobs');
        const data = await response.json();
        setJobList(data);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load jobs.' });
      } finally {
        setIsJobsLoading(false);
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
    if (!jobId || !resumeFile) return;

    setIsLoading(true);
    
    const selectedJob = jobList.find(j => j._id === jobId);
    const userMessageContent = `Analyzing resume "${resumeFile.name}" for the role: ${selectedJob?.title}.`;
    
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessageContent }];
    setMessages(newMessages);
    
    try {
        const resumeText = await extractTextFromPdf(resumeFile);
        
        const historyForApi: Message[] = newMessages
            .slice(0, -1) // Exclude the user's message we just added
            .map(msg => ({
                role: msg.role,
                content: [{ text: msg.content }]
            }));

        const response = await fetch('/api/agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                history: historyForApi,
                jobId: jobId,
                resumeText: resumeText,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'The agent failed to respond.');
        }

        const data = await response.json();
        setMessages(prev => [...prev, { role: 'model', content: data.response }]);
    } catch (error: any) {
        setMessages(prev => [...prev, { role: 'model', content: `Sorry, an error occurred: ${error.message}` }]);
    } finally {
        setIsLoading(false);
        // Clear inputs for next analysis
        setResumeFile(null);
        if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <main className="min-h-screen container mx-auto p-4 pt-24 sm:pt-28 md:pt-32 flex justify-center">
      <Card className="w-full max-w-3xl flex flex-col" style={{height: 'calc(100vh - 12rem)'}}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Bot /> AI Career Agent
          </CardTitle>
          <CardDescription>
            Chat with our AI agent to analyze your resume against a job description.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
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
              {isLoading && (
                  <div className="flex items-start gap-4">
                      <Bot className="w-6 h-6 text-primary flex-shrink-0" />
                      <div className="rounded-lg px-4 py-3 max-w-lg bg-muted flex items-center">
                          <Loader2 className="w-5 h-5 animate-spin"/>
                      </div>
                  </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t bg-background">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-1/2 flex items-center gap-2">
                <Select onValueChange={setJobId} value={jobId} disabled={isLoading}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={isJobsLoading ? "Loading..." : "Select a job"} />
                  </SelectTrigger>
                  <SelectContent>
                    {jobList.map(job => (
                      <SelectItem key={job._id} value={job._id}>{job.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-1/2 flex items-center gap-2">
                <Button type="button" variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                    <Paperclip className="mr-2" />
                    <span className='truncate'>{resumeFile ? resumeFile.name : "Upload Resume"}</span>
                </Button>
                <Input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={e => setResumeFile(e.target.files?.[0] || null)}
                    accept=".pdf"
                />
              </div>

              <Button type="submit" disabled={isLoading || !jobId || !resumeFile}>
                Send
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
