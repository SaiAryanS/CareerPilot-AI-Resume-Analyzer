import CareerPilotClient from '@/components/career-pilot/career-pilot-client';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-8 md:p-12">
      <CareerPilotClient />
    </main>
  );
}
