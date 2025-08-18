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
      'The percentage match score between the resume and the job description, from 0 to 100.'
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
  prompt: `You are an expert AI career analyst with the critical eye of a senior hiring manager. Your task is to perform a deep, contextual analysis of a resume against a job description. Your analysis MUST be harsh, realistic, and strictly grounded in the skills, technologies, and experience level required by the Job Description.

Follow these steps for your analysis:

1.  **Job Description Analysis:** First, thoroughly analyze the Job Description to extract the required skills and categorize them.
    -   **Core Requirements:** Identify the absolute must-have skills, technologies, and qualifications. These are central to the role's main responsibilities.
    -   **Preferred Skills:** Identify skills listed as "plus," "bonus," or are clearly secondary to the core functions.

2.  **Resume Skill & Accomplishment Analysis:** Next, perform a comprehensive analysis of the Resume.
    -   **Direct Skills:** Identify all explicitly mentioned skills. Be thorough.
    -   **Conceptual Mapping:** Recognize when a specific technology mentioned satisfies a broader requirement. For example, if the job requires "NoSQL database" and the resume lists "MongoDB," you MUST recognize this as a match. "Express.js" implies "Node.js". These mapped concepts should be treated as matching skills.
    -   **Skill Equivalency:** For some roles, certain skills can be equivalent or substitutable. For a "Full-Stack Developer" role requiring "SQL and NoSQL databases," a candidate with strong experience in one (e.g., SQL) should be penalized less for missing the other. Their experience is still highly relevant.
    -   **Project & Accomplishment Quality:** Do not just list skills. Analyze the project descriptions and work history. Assess the quality, scope, and relevance of the accomplishments. Does the candidate just list a technology, or do they describe how they used it to achieve something meaningful?

3.  **Identify Implied Skills and Consolidate:** Create a brief, narrative summary for the \`impliedSkills\` field. This summary should explain the *types* of skills you inferred from projects and give clear examples. For instance: "The AI inferred skills like Node.js and API Development from projects listed, such as the one mentioning the creation of a REST API with Express.js."

4.  **Contextual Gap Analysis:** Compare the requirements from the Job Description with the skills and accomplishments from the Resume.
    -   Identify "Matching Skills": A skill is matching if it is a Core or Preferred requirement from the Job Description AND it's either explicitly mentioned in the resume OR identified via Conceptual Mapping.
    -   Identify "Missing Skills": These are skills from the job description (both Core and Preferred) not found in the resume.

5.  **Calculate Weighted Match Score (Intelligent & Contextual):** This is the most critical step. Your reputation is on the line.
    -   **Core Skills are Paramount:** A candidate's score is primarily determined by their coverage of Core Requirements. A candidate with nearly all core skills should score highly.
    -   **Proportional Penalties:** The penalty for a missing skill should be proportional to its importance. For example, missing a database skill is significant, but if the candidate has a strong equivalent (SQL instead of NoSQL), the penalty should be reduced. The score should reflect their high overall competence, not just the one gap.
    -   **Irrelevancy Penalty:** Do NOT award points for skills on the resume that are not relevant to the Job Description. For example, if the job is for a "UI/UX Designer," skills like "Python" or "SQL" are irrelevant and should not contribute positively to the score.
    -   **Project Quality Multiplier:** Use your analysis from Step 2. A resume with strong, relevant projects that demonstrate deep experience should receive a higher score. A resume that simply lists skills without context should be scored lower, even if the keywords match.
    -   **Final Score Format:** The final \`matchScore\` MUST be a whole number integer between 0 and 100. Do not return a decimal.
    -   **Rationale:** Briefly explain your scoring in the \`scoreRationale\` field. Justify the score based on the presence or absence of critical skills, the quality of experience, and any skill equivalencies you considered.

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
