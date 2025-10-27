
import { NextResponse } from 'next/server';
import { careerAgent } from '@/ai/flows/agent-flow';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';

const agentRequestSchema = z.object({
  history: z.array(z.any()),
  jobId: z.string(),
  resumeText: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = agentRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { history, jobId, resumeText } = validation.data;

    // Fetch the job description from the database
    const client = await clientPromise;
    const db = client.db();
    const { ObjectId } = await import('mongodb');
    const job = await db.collection('job_descriptions').findOne({ _id: new ObjectId(jobId) });

    if (!job) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 });
    }

    // Construct the prompt for the agent
    const prompt = `Please analyze my resume against the following job description.\n\n**Job Description:**\n${job.description}\n\n**Resume:**\n${resumeText}`;

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
