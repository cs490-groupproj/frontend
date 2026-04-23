import React, { useState } from "react";
// Ensure this path matches the one in your BrowseCoaches.jsx
import { Button } from "../../components/ui/button.jsx";

export default function AdminDashboard() {
  // Data object as requested
  const statsData = {
    daily: 42,
    weekly: 215,
    monthly: 1024,
  };

  // Mock user data
  const mockUsers = [
    { id: 1, first_name: "John", last_name: "Doe", email: "john@example.com" },
    {
      id: 2,
      first_name: "Jane",
      last_name: "Smith",
      email: "jane@example.com",
    },
    { id: 3, first_name: "Sam", last_name: "Altman", email: "sam@openai.com" },
    {
      id: 4,
      first_name: "Linus",
      last_name: "Torvalds",
      email: "linus@linux.org",
    },
    {
      id: 5,
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@computing.io",
    },
  ];

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 3;
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = mockUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="w-full space-y-8">
      {/* Header section matches BrowseCoaches */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of platform growth and registered users.
        </p>
      </div>

      {/* Stats Section - flex-1 and gap-6 for proper spacing */}
      <div className="flex w-full flex-row gap-6">
        {Object.entries(statsData).map(([key, value]) => (
          <div
            key={key}
            className="border-border bg-card flex-1 rounded-xl border p-8
              shadow-sm transition hover:-translate-y-0.5"
          >
            <h3
              className="text-secondary-foreground text-xs font-semibold
                tracking-widest uppercase"
            >
              {key} Users
            </h3>
            <p
              className="text-foreground mt-4 text-4xl font-bold tracking-tight"
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Users Table Section - Styled like your coach articles */}
      <div
        className="border-border bg-card w-full overflow-hidden rounded-xl
          border shadow-sm"
      >
        <div className="border-border bg-muted/5 border-b px-8 py-6">
          <h2 className="text-foreground text-xl font-semibold">
            Registered Users
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr
                className="border-border text-muted-foreground border-b text-xs
                  tracking-widest uppercase"
              >
                <th className="px-8 py-5 font-semibold">First Name</th>
                <th className="px-8 py-5 font-semibold">Last Name</th>
                <th className="px-8 py-5 font-semibold">Email</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {currentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-muted/5 transition-colors"
                >
                  <td className="text-foreground px-8 py-5 text-sm">
                    {user.first_name}
                  </td>
                  <td className="text-foreground px-8 py-5 text-sm">
                    {user.last_name}
                  </td>
                  <td className="text-muted-foreground px-8 py-5 text-sm">
                    {user.email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination UI - Corrected mockUsers.length reference */}
        <div
          className="bg-muted/5 border-border flex items-center justify-between
            border-t px-8 py-5"
        >
          <span className="text-muted-foreground text-sm">
            Showing {indexOfFirstUser + 1} to{" "}
            {Math.min(indexOfLastUser, mockUsers.length)} of {mockUsers.length}
          </span>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={indexOfLastUser >= mockUsers.length}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
