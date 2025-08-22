
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
const mockUsers = [
  {
    id: "1",
    username: "john_doe",
    email: "john.doe@example.com",
    analysisCount: 12,
    createdAt: new Date("2023-10-01T10:00:00Z"),
  },
  {
    id: "2",
    username: "jane_smith",
    email: "jane.smith@example.com",
    analysisCount: 5,
    createdAt: new Date("2023-09-15T14:20:00Z"),
  },
  {
    id: "3",
    username: "test_user",
    email: "test.user@example.com",
    analysisCount: 23,
    createdAt: new Date("2023-10-10T11:00:00Z"),
  },
];

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen container mx-auto p-4 pt-24 sm:pt-28 md:pt-32">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Admin Dashboard</CardTitle>
          <CardDescription>
            Welcome, Admin. Here is a summary of user activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-4">Registered Users</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Analyses Ran</TableHead>
                <TableHead>Registration Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-right font-bold">{user.analysisCount}</TableCell>
                  <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
