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
  scoreRationale: z
    .string()
    .describe(
      'A brief explanation for the given score, considering core vs. preferred skills.'
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
    .string()
    .describe(
      'A brief, narrative explanation of the kinds of skills that were inferred from the resume, with clear examples. For example: "The AI inferred skills like Node.js and API Development because the resume mentioned building a REST API with Express.js."'
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
1.  **Job Description Analysis:** First, thoroughly analyze the Job Description to extract the required skills and categorize them.
    -   **Core Requirements:** Identify the absolute must-have skills, technologies, and qualifications. These are often explicitly mentioned as "required", "must have", or are central to the role's main responsibilities.
    -   **Preferred Skills:** Identify skills that are listed as "plus", "bonus", "nice to have", or are clearly secondary to the core functions.

2.  **Resume Skill Extraction:** Next, analyze the Resume to identify the candidate's skills, technologies, and accomplishments. Be intelligent about versions: recognize variations like "HTML5" or "CSS3" as equivalent to "HTML" and "CSS".

3.  **Identify Implied Skills and Consolidate:** Look for implied skills based on project descriptions and work history. Then, create a brief, narrative summary for the \`impliedSkills\` field. This summary should explain the *types* of skills you inferred and give one or two clear examples. For instance: "The AI inferred skills like Node.js and API Development from projects listed, such as the one mentioning the creation of a REST API with Express.js." Do NOT simply list every inferred skill.

4.  **Contextual Gap Analysis:** Compare the requirements from the Job Description with the skills extracted from the Resume.
    -   Identify "Matching Skills": A skill is matching if it's explicitly mentioned OR if you identified it as an implied skill, AND it is relevant to the Job Description (either a Core Requirement or a Preferred Skill). All relevant implied skills must also be in the matching skills list. The final list of matching skills must be an array of unique strings.
    -   Identify "Missing Skills": These are skills from the job description (both Core and Preferred) not found in the resume.

5.  **Calculate Weighted Match Score (HARSH):** This is the most critical step. Calculate the \`matchScore\` using a weighted system that is harsh and realistic. Do not use a simple ratio.
    -   **Core Skills Weight:** Assign a very high weight to Core Requirements. A candidate's score should be heavily impacted by how many of these they possess. **Missing even one or two core skills should significantly lower the score and make it very difficult to achieve a high score.**
    -   **Preferred Skills Weight:** Assign a much lower weight to Preferred Skills. These should only act as small "boosters" to the score if the core requirements are substantially met.
    -   **Scoring Logic:** A candidate with all core skills should score high (e.g., 75-85%). The score then increases towards 100% based on how many preferred skills they have. **A candidate missing several core skills should receive a low score (e.g., under 50%), regardless of how many preferred skills they have.**
    -   **Rationale:** Briefly explain your scoring in the \`scoreRationale\` field. For example: "The candidate has most of the core requirements like [Skill A, Skill B], but is missing the critical [Skill C], which significantly lowered the score. They have several preferred skills which provided only a small boost."

6.  **Determine Status:** Assign a \`status\` based on the calculated \`matchScore\`.
    -   75% or higher: "Approved"
    -   50% to 74%: "Needs Improvement"
    -   Below 50%: "Not a Match"

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
