'use server';
/**
 * @fileOverview Implements AI skill matching between a resume and a job description.
 *
 * - analyzeSkills - A function that analyzes skills in a resume against a job description.
 */

import { ai } from '@/ai/genkit';
import {
  AnalyzeSkillsInputSchema,
  AnalyzeSkillsOutputSchema,
  type AnalyzeSkillsInput,
  type AnalyzeSkillsOutput,
} from '@/ai/schemas';

export async function analyzeSkills(
  input: AnalyzeSkillsInput
): Promise<AnalyzeSkillsOutput> {
  return analyzeSkillsFlow(input);
}

const analyzeSkillsPrompt = ai.definePrompt({
  name: 'analyzeSkillsPrompt',
  input: { schema: AnalyzeSkillsInputSchema },
  output: { schema: AnalyzeSkillsOutputSchema },
  prompt: `You are an expert AI career analyst with the critical eye of a senior hiring manager. Perform a harsh, realistic analysis of the Resume against the Job Description. Focus only on the skills, technologies, and experience explicitly required for the role.

Follow these steps:

1. **Job Description Analysis**
   - Extract required skills and group them as:
     - Core Requirements (must-have for the role)
     - Preferred Skills (secondary / nice-to-have)

2. **Resume Analysis**
   - Identify all direct skills from the resume.
   - **Apply Conceptual Mapping & Skill Equivalency:** This is critical. Map related technologies to the required skills.
     - (e.g., MongoDB in resume -> maps to NoSQL requirement).
     - (e.g., Express.js in resume -> maps to Node.js requirement).
     - **(e.g., Jenkins + Docker + AWS/Azure in resume -> strongly implies CI/CD Pipeline experience).**
     - **(e.g., Experience with Django in resume -> should be considered equivalent or very similar to FastAPI if the project context is building APIs).**
   - Evaluate Project & Accomplishment Quality: distinguish between meaningful usage vs. keyword listing.

3. **Implied Skills**
   - Write a concise narrative (\`impliedSkills\`) describing inferred skills with concrete examples from the resume.

4. **Gap Analysis**
   - Matching Skills: list skills that overlap between the JD (Core/Preferred) and the Resume (direct, mapped, or implied).
   - Missing Skills: list skills required in the JD but are genuinely absent from the Resume, even after conceptual mapping.

5. **Weighted Match Score**
   - Core skills weigh most.
   - Penalize missing skills proportionally to importance; reduce penalty for close equivalents (like Django for FastAPI).
   - Ignore irrelevant skills not tied to the JD.
   - Apply a Project Quality Multiplier (strong relevant projects = higher score).
   - Return integer \`matchScore\` (0–100).

6. **Status**
   - 75–100 → Approved
   - 50–74 → Needs Improvement
   - 0–49 → Not a Match

Return output strictly in the defined schema.

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
    const { output } = await analyzeSkillsPrompt(input);
    return output!;
  }
);
