import { NextResponse } from 'next/server';
import { careerAgent } from '@/ai/flows/agent-flow';

export async function POST(request: Request) {
  try {
    const { history, prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ message: 'Prompt is required' }, { status: 400 });
    }

    const response = await careerAgent({ history, prompt });

    return NextResponse.json({ response });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { message: e.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
