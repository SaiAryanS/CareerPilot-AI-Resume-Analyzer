'use server';
/**
 * @fileOverview Implements AI flows for generating interview questions and evaluating answers.
 *
 * - generateInterviewQuestions - A function that creates interview questions based on a job description.
 * - evaluateInterviewAnswer - A function that evaluates a user's answer to a specific question.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateQuestionsInputSchema,
  GenerateQuestionsOutputSchema,
  EvaluateAnswerInputSchema,
  EvaluateAnswerOutputSchema,
  type GenerateQuestionsOutput,
  type EvaluateAnswerOutput,
} from '@/ai/schemas';
import { z } from 'zod';


export async function generateInterviewQuestions(
  jobDescription: string
): Promise<GenerateQuestionsOutput> {
  return generateInterviewQuestionsFlow({ jobDescription });
}

const generateQuestionsPrompt = ai.definePrompt({
  name: 'generateQuestionsPrompt',
  input: { schema: GenerateQuestionsInputSchema },
  output: { schema: GenerateQuestionsOutputSchema },
  prompt: `You are a senior hiring manager preparing for an interview. Based on the provided Job Description, generate a list of exactly 5 interview questions. The questions should cover the key skills and responsibilities mentioned. They MUST progressively increase in difficulty:
- Question 1: A basic introductory or screening question.
- Questions 2-3: Intermediate questions about specific skills or experiences.
- Questions 4-5: Advanced, scenario-based, or behavioral questions that require deep thought.

Job Description:
{{{jobDescription}}}
`,
});

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateQuestionsInputSchema,
    outputSchema: GenerateQuestionsOutputSchema,
  },
  async (input) => {
    const { output } = await generateQuestionsPrompt(input);
    return output!;
  }
);


export async function evaluateInterviewAnswer(
  input: z.infer<typeof EvaluateAnswerInputSchema>
): Promise<EvaluateAnswerOutput> {
  return evaluateInterviewAnswerFlow(input);
}

const evaluateAnswerPrompt = ai.definePrompt({
  name: 'evaluateAnswerPrompt',
  input: { schema: EvaluateAnswerInputSchema },
  output: { schema: EvaluateAnswerOutputSchema },
  prompt: `You are an expert interviewer evaluating a candidate's response. Analyze the user's answer in the context of the Job Description and the specific Question asked.

Your evaluation should be fair and constructive. Avoid being overly harsh for minor omissions, but remain realistic about the quality of the answer. A good answer is clear, relevant, and demonstrates the skills required in the job description.

Job Description:
{{{jobDescription}}}

Question Asked:
"{{{question}}}"

User's Answer:
"{{{userAnswer}}}"

Provide a score from 1 to 10 based on the quality of the answer (clarity, relevance, accuracy). Also, provide concise, constructive feedback explaining the score. Be specific about what was good and what could be improved.`,
});

const evaluateInterviewAnswerFlow = ai.defineFlow(
  {
    name: 'evaluateInterviewAnswerFlow',
    inputSchema: EvaluateAnswerInputSchema,
    outputSchema: EvaluateAnswerOutputSchema,
  },
  async (input) => {
    const { output } = await evaluateAnswerPrompt(input);
    return output!;
  }
);
