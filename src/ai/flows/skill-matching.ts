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
  matchingSkills: z.array(z.string()).describe('A list of skills that are explicitly mentioned in both the resume and the job description, or were implied from the resume.'),
  missingSkills: z.array(z.string()).describe('A list of skills that are in the job description but missing from the resume.'),
  impliedSkills: z.array(z.object({
    skill: z.string().describe('The skill that was implied.'),
    context: z.string().describe('The sentence or phrase from the resume that implies the skill.'),
  })).describe('A list of skills that were not explicitly mentioned but were inferred from the context of the resume.'),
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
  prompt: `You are an expert AI career analyst. Your task is to perform a deep, contextual analysis of a resume against a job description. Do not rely on simple keyword matching. Instead, focus on semantic meaning, experience, and accomplishments.

Follow these steps for your analysis:
1.  **Identify Core Requirements:** First, thoroughly analyze the Job Description to extract the key skills, technologies, and experience levels required for the role.
2.  **Resume Skill Extraction:** Next, analyze the Resume to identify the candidate's skills, technologies, and accomplishments.
3.  **Identify Implied Skills:** This is a crucial step. Look for implied skills based on project descriptions and work history. For example, if a candidate lists "built a REST API with Express.js," they possess "Node.js" and "API Development" skills. For each implied skill you find, populate the \`impliedSkills\` array with the skill and the specific text from the resume that provided the context.
4.  **Contextual Gap Analysis:** Compare the requirements from the Job Description with the skills extracted from the Resume.
    - Identify "Matching Skills": A skill is matching if it's explicitly mentioned OR if you identified it as an implied skill in the previous step. All implied skills should also be in the matching skills list.
    - Identify "Missing Skills": These are skills from the job description not found in the resume.
5.  **Calculate Match Score:** Based on the comparison (including implied skills), calculate a \`matchScore\`. This score should reflect not just the presence of skills but also the depth of experience and relevance of accomplishments mentioned in the resume. The score must be a number between 0 and 100.
6.  **Determine Status:** Assign a \`status\` based on the calculated \`matchScore\`.
    - 75% or higher: "Approved"
    - 50% to 74%: "Needs Improvement"
    - Below 50%: "Not a Match"

Job Description:
{{{jobDescription}}}

Resume:
{{{resume}}}
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
