
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  
  // Mock data for display purposes
  const mockAnalyses = [
    {
      id: "1",
      resumeFileName: "Software_Engineer_Resume.pdf",
      jobDescription: "Full-Stack Developer",
      matchScore: 92,
      createdAt: new Date("2023-10-26T10:00:00Z"),
    },
    {
      id: "2",
      resumeFileName: "My_Resume_V2.pdf",
      jobDescription: "Frontend Developer",
      matchScore: 78,
      createdAt: new Date("2023-10-25T15:30:00Z"),
    },
    {
      id: "3",
      resumeFileName: "Data_Science_Portfolio.pdf",
      jobDescription: "Data Scientist",
      matchScore: 65,
      createdAt: new Date("2023-10-25T11:45:00Z"),
    },
  ];
  
  export default function HistoryPage() {
    return (
      <main className="min-h-screen container mx-auto p-4 pt-24 sm:pt-28 md:pt-32">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Analysis History</CardTitle>
            <CardDescription>
              Here are the past resume analyses you have performed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resume File</TableHead>
                  <TableHead>Job Description</TableHead>
                  <TableHead className="text-right">Match Score</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAnalyses.map((analysis) => (
                  <TableRow key={analysis.id}>
                    <TableCell className="font-medium">{analysis.resumeFileName}</TableCell>
                    <TableCell>{analysis.jobDescription}</TableCell>
                    <TableCell className="text-right font-bold">{analysis.matchScore}%</TableCell>
                    <TableCell>{analysis.createdAt.toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    );
  }
