'use server';

/**
 * @fileOverview Simulates transcribing spoken answers during the interview simulation.
 *
 * - mockVoiceTranscription - A function that handles the mock voice transcription process.
 * - MockVoiceTranscriptionInput - The input type for the mockVoiceTranscription function.
 * - MockVoiceTranscriptionOutput - The return type for the mockVoiceTranscription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MockVoiceTranscriptionInputSchema = z.object({
  spokenAnswer: z.string().describe('The spoken answer given by the user.'),
});
export type MockVoiceTranscriptionInput = z.infer<typeof MockVoiceTranscriptionInputSchema>;

const MockVoiceTranscriptionOutputSchema = z.object({
  transcription: z.string().describe('The mock transcription of the spoken answer.'),
});
export type MockVoiceTranscriptionOutput = z.infer<typeof MockVoiceTranscriptionOutputSchema>;

export async function mockVoiceTranscription(input: MockVoiceTranscriptionInput): Promise<MockVoiceTranscriptionOutput> {
  return mockVoiceTranscriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mockVoiceTranscriptionPrompt',
  input: {schema: MockVoiceTranscriptionInputSchema},
  output: {schema: MockVoiceTranscriptionOutputSchema},
  prompt: `You are a helpful assistant that transcribes spoken answers.

  Spoken Answer: {{{spokenAnswer}}}

  Please provide a mock transcription of the spoken answer.  It does not need to be accurate.  It just needs to sound like the user is speaking.
  `, // Changed this line
});

const mockVoiceTranscriptionFlow = ai.defineFlow(
  {
    name: 'mockVoiceTranscriptionFlow',
    inputSchema: MockVoiceTranscriptionInputSchema,
    outputSchema: MockVoiceTranscriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
