
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
import { User } from "lucide-react";
import ManageJobs from "@/components/admin/manage-jobs";

async function getUsers() {
    try {
        const client = await clientPromise;
        const db = client.db();
        const users = await db
            .collection("users")
            .find(
                {},
                // Exclude password from the result set
                { projection: { password: 0 } }
            )
            .sort({ createdAt: -1 })
            .toArray();

        // MongoDB returns an _id object. We need to convert it to a string for React.
        return JSON.parse(JSON.stringify(users));
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return [];
    }
}

async function getJobs() {
    try {
        const client = await clientPromise;
        const db = client.db();
        const jobs = await db
            .collection("job_descriptions")
            .find({})
            .sort({ title: 1 })
            .toArray();
        return JSON.parse(JSON.stringify(jobs));
    } catch (error) {
        console.error("Failed to fetch jobs:", error);
        return [];
    }
}


export default async function AdminDashboardPage() {
    // We fetch initial data on the server to avoid a loading flash on the client.
    const initialUsers = await getUsers();
    const initialJobs = await getJobs();

    return (
        <main className="min-h-screen container mx-auto p-4 pt-24 sm:pt-28 md:pt-32">
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Admin Dashboard</CardTitle>
                        <CardDescription>
                            Welcome, Admin. Here is a summary of user activity and job descriptions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <User className="mr-2 h-5 w-5" />
                            Registered Users ({initialUsers.length})
                        </h3>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone Number</TableHead>
                                        <TableHead>Registration Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {initialUsers.length > 0 ? (
                                        initialUsers.map((user) => (
                                            <TableRow key={user._id}>
                                                <TableCell className="font-medium">{user.username}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.phoneNumber}</TableCell>
                                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                No registered users found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Job Description Management Section */}
                <ManageJobs initialJobs={initialJobs} />

            </div>
        </main>
    );
}
