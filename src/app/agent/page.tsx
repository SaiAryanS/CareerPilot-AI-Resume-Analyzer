'use client';

import { useState, useRef, useEffect } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Paperclip, User, Bot, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { Message } from 'genkit';


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

export default function AgentPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
        role: 'model',
        content: "Hello! I'm your AI Career Agent. How can I help you today? You can ask me to analyze a resume against a job description."
    }
  ]);
  const [input, setInput] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    
    let userMessageContent = input;
    let combinedPrompt = input;

    if (resumeFile) {
        userMessageContent += `\n\n[Attached Resume: ${resumeFile.name}]`;
        try {
            const resumeText = await extractTextFromPdf(resumeFile);
            combinedPrompt += `\n\nHere is the resume text:\n${resumeText}`;
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not read the resume PDF file.' });
            setIsLoading(false);
            return;
        }
    }

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessageContent }];
    setMessages(newMessages);
    setInput('');
    setResumeFile(null);
    if(fileInputRef.current) fileInputRef.current.value = '';

    
    try {
        const historyForApi: Message[] = newMessages
            .slice(0, -1) // Exclude the latest user message from history
            .map(msg => ({
                role: msg.role,
                content: [{ text: msg.content }]
            }));

        const response = await fetch('/api/agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                history: historyForApi,
                prompt: combinedPrompt, // Send the full combined prompt
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
                         <div className="prose prose-sm dark:prose-invert max-w-none" style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
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
            <form onSubmit={handleSubmit} className="flex items-center gap-4">
                <Input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask me to analyze your resume..."
                    className="flex-1"
                    disabled={isLoading}
                />
                
                <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading} title="Attach Resume">
                    <Paperclip className={resumeFile ? 'text-primary' : ''} />
                </Button>
                <Input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={e => setResumeFile(e.target.files?.[0] || null)}
                    accept=".pdf"
                />

              <Button type="submit" disabled={isLoading || (!input.trim() && !resumeFile)}>
                <Send/>
              </Button>
            </form>
            {resumeFile && <p className="text-xs text-muted-foreground mt-2">Attached: {resumeFile.name}</p>}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
