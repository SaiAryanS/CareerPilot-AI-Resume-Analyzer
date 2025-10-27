
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
  AnalyzeSkillsInputSchema,
  AnalyzeSkillsOutputSchema,
  CareerAgentInputSchema,
  type CareerAgentInput,
} from '@/ai/schemas';
import { analyzeSkills } from './skill-matching';

// Define the tool for the agent to use
export const analyzeResumeTool = ai.defineTool(
  {
    name: 'analyzeResume',
    description:
      'Analyzes a resume against a job description to provide a match score and skill gap analysis. This should be the primary tool used when a user wants to evaluate their resume for a job.',
    inputSchema: AnalyzeSkillsInputSchema,
    outputSchema: AnalyzeSkillsOutputSchema,
  },
  async (input) => analyzeSkills(input)
);

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
      system: `You are a friendly and helpful AI Career Agent. Your only goal is to assist the user in analyzing their resume against a job description.

- **Initial State:** When the conversation starts, or if you are missing information, your job is to ask for it. You need both a job description and a resume before you can act.
- **Information Extraction:** The user will provide a job description and a resume in their prompt. You must extract the text for both.
- **Tool Trigger:** You MUST NOT use the 'analyzeResume' tool until you have confirmed that you have extracted both the 'jobDescription' and the 'resume' text from the user's prompt. If either is missing, ask the user for it.
- **Execution:** Once you have both pieces of information, and only then, you MUST use the 'analyzeResume' tool to perform the analysis by passing the extracted job description and resume as arguments.
- **Output:** When presenting the results from the tool, format them in a clear, readable markdown format.
- **Constraints:** Do not make up analysis results. Only provide results that come from the tool. Do not discuss interviews or other topics. Your only capability is resume analysis.
      `,
    });

    // Check if the model wants to call a tool
    if (llmResponse.toolRequest) {
      // For this agent, we assume it's always the analyzeResumeTool
      const toolResponse = await llmResponse.toolRequest.next();

      if (toolResponse.tool.name === 'analyzeResume') {
        const analysisOutput = toolResponse.output as z.infer<typeof AnalyzeSkillsOutputSchema>;
        
        return `
### Analysis Complete!

Here's how your resume stacks up against the job description:

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

I am ready for your next request. You can ask me to analyze another resume.
        `;
      }
    }
    
    // If no tool is called, return the model's text response.
    return llmResponse.text;
  }
);


export async function careerAgent(input: CareerAgentInput) {
    return await careerAgentFlow(input);
}
