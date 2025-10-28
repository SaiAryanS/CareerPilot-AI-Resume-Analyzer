import { NextResponse } from 'next/server';
import { careerAgent } from '@/ai/flows/agent-flow';
import { z } from 'zod';

const agentRequestSchema = z.object({
  history: z.array(z.any()),
  prompt: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = agentRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { history, prompt } = validation.data;

    // The agent will now look up the job description itself if needed.
    const response = await careerAgent({ history, prompt });

    return NextResponse.json({ response });
  } catch (e: any) {
    console.error(e);
    // Genkit/Google AI errors often have a nested structure
    const errorMessage = e.cause?.message || e.message || 'Something went wrong';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
