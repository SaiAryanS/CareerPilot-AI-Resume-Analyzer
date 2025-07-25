// Skill Matching flow
'use server';
/**
 * @fileOverview Implements AI skill matching between a resume and a job description.
 *
 * - analyzeSkills - A function that analyzes skills in a resume against a job description.
 * - AnalyzeSkillsInput - The input type for the analyzeSkills function.
 * - AnalyzeSkillsOutput - The return type for the analyzeSkills function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSkillsInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The job description for the role.'),
  resume: z
    .string()
    .describe('The text content of the resume.'),
});
export type AnalyzeSkillsInput = z.infer<typeof AnalyzeSkillsInputSchema>;

const AnalyzeSkillsOutputSchema = z.object({
  matchScore: z.number().describe('The percentage match score between the resume and the job description.'),
  matchingSkills: z.array(z.string()).describe('A list of skills that match between the resume and the job description.'),
  missingSkills: z.array(z.string()).describe('A list of skills that are in the job description but missing from the resume.'),
  status: z.string().describe('Approval status based on the match score. Can be "Approved", "Needs Improvement", or "Not a Match".'),
});
export type AnalyzeSkillsOutput = z.infer<typeof AnalyzeSkillsOutputSchema>;

export async function analyzeSkills(input: AnalyzeSkillsInput): Promise<AnalyzeSkillsOutput> {
  return analyzeSkillsFlow(input);
}

const analyzeSkillsPrompt = ai.definePrompt({
  name: 'analyzeSkillsPrompt',
  input: {schema: AnalyzeSkillsInputSchema},
  output: {schema: AnalyzeSkillsOutputSchema},
  prompt: `You are an AI career coach. Analyze the following resume against the job description and provide a match score, a list of matching skills, and a list of missing skills.

Job Description: {{{jobDescription}}}

Resume: {{{resume}}}

Based on the match score, provide an approval status.
- If the match score is 75% or above, the status is "Approved".
- If the match score is between 50% and 74%, the status is "Needs Improvement".
- If the match score is below 50%, the status is "Not a Match".

Ensure that the matchScore is a number between 0 and 100.
`,
});

const analyzeSkillsFlow = ai.defineFlow(
  {
    name: 'analyzeSkillsFlow',
    inputSchema: AnalyzeSkillsInputSchema,
    outputSchema: AnalyzeSkillsOutputSchema,
  },
  async input => {
    const {output} = await analyzeSkillsPrompt(input);
    return output!;
  }
);
