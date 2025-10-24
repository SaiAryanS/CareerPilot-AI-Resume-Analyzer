'use server';
/**
 * @fileOverview Implements an AI agent that can analyze resumes conversationally.
 *
 * - careerAgent - The main conversational agent flow.
 * - analyzeResumeTool - A tool that wraps the skill-matching flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  analyzeSkills,
  AnalyzeSkillsInputSchema,
  AnalyzeSkillsOutputSchema,
} from './skill-matching';

// Define the tool for the agent to use
export const analyzeResumeTool = ai.defineTool(
  {
    name: 'analyzeResume',
    description:
      'Analyzes a resume against a job description to provide a match score and skill gap analysis. This should be the primary tool used when a user wants to evaluate their resume for a job.',
    input: { schema: AnalyzeSkillsInputSchema },
    output: { schema: AnalyzeSkillsOutputSchema },
  },
  async (input) => analyzeSkills(input)
);

// Define the schema for the agent's conversational input
export const CareerAgentInputSchema = z.object({
  history: z.array(z.any()),
  prompt: z.string(),
});
export type CareerAgentInput = z.infer<typeof CareerAgentInputSchema>;

// This is the main agent flow
export const careerAgentFlow = ai.defineFlow(
  {
    name: 'careerAgentFlow',
    inputSchema: CareerAgentInputSchema,
    outputSchema: z.string(),
  },
  async ({ history, prompt }) => {

    const llmResponse = await ai.generate({
      prompt: prompt,
      history: history,
      tools: [analyzeResumeTool],
      system: `You are a friendly and helpful AI Career Agent. Your goal is to assist the user in analyzing their resume against a job description.

      - When the user provides a job description and a resume, you MUST use the \`analyzeResume\` tool to perform the analysis.
      - Do not make up analysis results. Only provide results that come from the tool.
      - Be conversational and guide the user through the process.
      - When presenting the results from the tool, format them in a clear, readable markdown format.
      - Do not discuss interviews or other topics. Your only capability is resume analysis.
      `,
    });

    // Check if the model decided to use a tool
    if (llmResponse.toolRequest) {
      const toolResponse = await llmResponse.toolRequest.next();

      // If the tool was the resume analyzer, format the output nicely
      if (toolResponse.tool.name === 'analyzeResume') {
        const analysisOutput = toolResponse.output as z.infer<typeof AnalyzeSkillsOutputSchema>;
        
        // Format the structured data into a user-friendly string
        return `
### Analysis Complete!

Here's how your resume stacks up:

**Match Score:** **${analysisOutput.matchScore}%**
*${analysisOutput.scoreRationale}*

---

#### ✅ Matching Skills
${analysisOutput.matchingSkills.length > 0 ? analysisOutput.matchingSkills.map(s => `- ${s}`).join('\n') : "None found."}

---

#### ❌ Missing Skills
${analysisOutput.missingSkills.length > 0 ? analysisOutput.missingSkills.map(s => `- ${s}`).join('\n') : "None. Great job!"}

---

#### ✨ Implied Skills
*${analysisOutput.impliedSkills}*
        `;
      }
    }

    // If no tool was used, or for any other tool, return the text response
    return llmResponse.text;
  }
);


export async function careerAgent(input: CareerAgentInput) {
    return await careerAgentFlow(input);
}
