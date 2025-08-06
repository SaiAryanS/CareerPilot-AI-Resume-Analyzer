
import {NextRequest, NextResponse} from 'next/server';
import {promises as fs} from 'fs';
import pdf from 'pdf-parse';
import {IncomingForm} from 'formidable';
import {analyzeSkills} from '@/ai/flows/skill-matching';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const jobDescription = formData.get('jobDescription') as string;
    const resumeFile = formData.get('resumeFile') as File;

    if (!jobDescription || !resumeFile) {
      return NextResponse.json(
        {error: 'Missing job description or resume file'},
        {status: 400}
      );
    }

    const fileBuffer = Buffer.from(await resumeFile.arrayBuffer());

    const pdfData = await pdf(fileBuffer);
    const resumeText = pdfData.text;

    const result = await analyzeSkills({jobDescription, resume: resumeText});

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in parse-resume route:', error);
    return NextResponse.json(
      {error: 'Failed to process resume', details: error.message},
      {status: 500}
    );
  }
}
