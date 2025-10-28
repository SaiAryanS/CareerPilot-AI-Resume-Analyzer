'use server';
/**
 * @fileOverview Implements an AI agent that can analyze resumes and generate interview questions conversationally.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  AnalyzeSkillsInputSchema,
  AnalyzeSkillsOutputSchema,
  CareerAgentInputSchema,
  GenerateQuestionsInputSchema,
  GenerateQuestionsOutputSchema,
  type CareerAgentInput,
} from '@/ai/schemas';
import { analyzeSkills } from './skill-matching';
import { generateInterviewQuestions } from './interview-flow';

// Define the tool for resume analysis
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

// Define the tool for generating interview questions
export const generateInterviewQuestionsTool = ai.defineTool(
    {
        name: 'generateInterviewQuestions',
        description: 'Generates 5 interview questions based on a job description. Use this when the user agrees to practice for an interview.',
        inputSchema: GenerateQuestionsInputSchema,
        outputSchema: GenerateQuestionsOutputSchema,
    },
    async (input) => generateInterviewQuestions(input.jobDescription)
);


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
      tools: [analyzeResumeTool, generateInterviewQuestionsTool],
      system: `You are a friendly and helpful AI Career Agent. Your goal is to assist the user in analyzing their resume and preparing for interviews.

- **Initial State:** When the conversation starts, or if you are missing information, your job is to ask for it. You need both a job description and the text of a resume before you can use the 'analyzeResume' tool.
- **Information Gathering:** You must gather the 'jobDescription' and the 'resume' text from the user's prompts and conversation history. The resume text will be clearly provided to you, often preceded by 'Here is the resume text:'. Do not act until you have both.
- **Resume Analysis:** Once you have both the job description and the resume text, and only then, you MUST use the 'analyzeResume' tool.
- **Presenting Analysis:** When you get results from 'analyzeResume', you must format them clearly in markdown.
- **Interview Offer:** After presenting the resume analysis, IF the 'matchScore' is 70% or higher, you MUST ask the user if they want to practice for an interview for this role.
- **Generating Questions:** If the user agrees, you MUST then use the 'generateInterviewQuestions' tool, passing the same 'jobDescription' you used for the resume analysis. Present the questions as a numbered list.
- **Constraints:** Do not make up analysis or interview results. Only provide results that come from the tools. Do not ask the user to paste text if you have already been provided with it.
      `,
    });
    
    let toolResponse = llmResponse;
    // Handle tool requests in a loop if the model makes multiple tool calls.
    while (toolResponse.toolRequest) {
      const toolOutput = await toolResponse.toolRequest.next();

      // If the tool was `analyzeResume`, format the output and add an interview prompt.
      if (toolOutput.tool.name === 'analyzeResume') {
        const analysisOutput = toolOutput.output as z.infer<typeof AnalyzeSkillsOutputSchema>;
        let formattedResponse = `
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
        `;
        
        // If the score is high enough, ask about a mock interview
        if (analysisOutput.matchScore >= 70) {
            formattedResponse += `\n\nYour resume is a strong match for this role! Would you like to practice with some AI-generated interview questions?`;
        } else {
            formattedResponse += `\n\nI'm ready for your next request. You can ask me to analyze another resume.`
        }
        return formattedResponse;
      }

      // If the tool was `generateInterviewQuestions`, format the output.
      if (toolOutput.tool.name === 'generateInterviewQuestions') {
        const interviewOutput = toolOutput.output as z.infer<typeof GenerateQuestionsOutputSchema>;
        return `
Excellent! Here are 5 interview questions based on the job description to help you prepare:

${interviewOutput.questions.map((q, i) => `${i + 1}. ${q}`).join('\n\n')}

Good luck with your practice! Let me know if you need anything else.
        `;
      }
    }
    
    // If no tool is called, return the model's text response.
    return toolResponse.text;
  }
);


export async function careerAgent(input: CareerAgentInput) {
    return await careerAgentFlow(input);
}
