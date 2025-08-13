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
  jobDescription: z.string().describe('The job description for the role.'),
  resume: z.string().describe('The text content of the resume.'),
});
export type AnalyzeSkillsInput = z.infer<typeof AnalyzeSkillsInputSchema>;

const AnalyzeSkillsOutputSchema = z.object({
  matchScore: z
    .number()
    .describe(
      'The percentage match score between the resume and the job description.'
    ),
  matchingSkills: z
    .array(z.string())
    .describe(
      'A list of unique skills that are explicitly mentioned in both the resume and the job description, or were implied from the resume.'
    ),
  missingSkills: z
    .array(z.string())
    .describe(
      'A list of skills that are in the job description but missing from the resume.'
    ),
  impliedSkills: z
    .array(
      z.object({
        skill: z.string().describe('The skill that was implied.'),
        context: z
          .string()
          .describe(
            'The sentence or phrase from the resume that implies the skill.'
          ),
      })
    )
    .describe(
      'A list of skills that were not explicitly mentioned but were inferred from the context of the resume. Each skill should only be listed once with the most relevant context.'
    ),
  status: z
    .string()
    .describe(
      'Approval status based on the match score. Can be "Approved", "Needs Improvement", or "Not a Match".'
    ),
});
export type AnalyzeSkillsOutput = z.infer<typeof AnalyzeSkillsOutputSchema>;

export async function analyzeSkills(
  input: AnalyzeSkillsInput
): Promise<AnalyzeSkillsOutput> {
  return analyzeSkillsFlow(input);
}

const analyzeSkillsPrompt = ai.definePrompt({
  name: 'analyzeSkillsPrompt',
  input: {schema: AnalyzeSkillsInputSchema},
  output: {schema: AnalyzeSkillsOutputSchema},
  prompt: `You are an expert AI career analyst. Your task is to perform a deep, contextual analysis of a resume against a job description. Do not rely on simple keyword matching. Instead, focus on semantic meaning, experience, and accomplishments. Your analysis MUST be strictly grounded in the skills and technologies mentioned in the Job Description.

Follow these steps for your analysis:
1.  **Identify Core Requirements:** First, thoroughly analyze the Job Description to extract the key skills, technologies, and experience levels required for the role. This is your source of truth.
2.  **Resume Skill Extraction:** Next, analyze the Resume to identify the candidate's skills, technologies, and accomplishments. Be intelligent about versions: recognize variations like "HTML5" or "CSS3" as equivalent to "HTML" and "CSS".
3.  **Identify Implied Skills:** Look for implied skills based on project descriptions and work history. For example, if a candidate lists "built a REST API with Express.js," they possess "Node.js" and "API Development" skills. For each unique implied skill you find, populate the \`impliedSkills\` array. IMPORTANT: Only list each implied skill ONCE, choosing the single most relevant phrase from the resume as its context.
4.  **Contextual Gap Analysis:** Compare the requirements from the Job Description with the skills extracted from the Resume.
    - Identify "Matching Skills": A skill is matching if it's explicitly mentioned OR if you identified it as an implied skill, BUT it must also be relevant to the Job Description. Do NOT list a skill as matching if it is not required by the job. All implied skills that are relevant must also be in the matching skills list. The final list of matching skills must be an array of unique strings.
    - Identify "Missing Skills": These are skills from the job description not found in the resume.
5.  **Calculate Match Score:** Calculate the \`matchScore\` based on the ratio of matching skills to the total number of skills required by the job description. The final score should primarily reflect skill coverage. For example, if there are 10 required skills and the candidate has 6 of them (either explicitly or implied), the score should be around 60%. The score must be a number between 0 and 100.
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
