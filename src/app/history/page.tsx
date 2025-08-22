
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
import clientPromise from "@/lib/mongodb";

async function getAnalyses() {
    try {
        const client = await clientPromise;
        const db = client.db();
        const analyses = await db
            .collection("analyses")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
        // Convert MongoDB's ObjectId to a string for React serialization
        return JSON.parse(JSON.stringify(analyses));
    } catch (error) {
        console.error("Failed to fetch analyses:", error);
        return [];
    }
}
  
export default async function HistoryPage() {
    const analyses = await getAnalyses();

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
            <div className="border rounded-md">
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
                    {analyses.length > 0 ? (
                        analyses.map((analysis: any) => (
                            <TableRow key={analysis._id}>
                                <TableCell className="font-medium">{analysis.resumeFileName}</TableCell>
                                <TableCell>{analysis.jobDescription}</TableCell>
                                <TableCell className="text-right font-bold">{analysis.matchScore}%</TableCell>
                                <TableCell>{new Date(analysis.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                No analysis history found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    );
}
