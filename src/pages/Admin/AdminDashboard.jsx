import React, { useState } from "react";
import { Button } from "../../components/ui/button.jsx";
import useGetFromAPI from "../../hooks/useGetFromAPI";

export default function AdminDashboard() {
 
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const offset = (currentPage - 1) * usersPerPage;


  const { data: statsData, loading: statsLoading } = useGetFromAPI(
    "/admin/users/active"
  );

  
  const { data: userData, loading: usersLoading } = useGetFromAPI(
    `/admin/users/all?limit=${usersPerPage}&offset=${offset}`,
    currentPage
  );


  const activeStats = statsData || { dau: 0, wau: 0, mau: 0 };
  const userList = userData?.users || [];
  const totalUsers = userData?.total_count || 0;


  const indexOfFirstUser = offset;
  const indexOfLastUser = indexOfFirstUser + userList.length;

  return (
    <div className="w-full space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Managing {totalUsers} registered users.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { label: "Daily", value: activeStats.dau },
          { label: "Weekly", value: activeStats.wau },
          { label: "Monthly", value: activeStats.mau },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border-border bg-card rounded-xl border p-8 shadow-sm"
          >
            <h3
              className="text-secondary-foreground text-xs font-semibold
                tracking-widest uppercase"
            >
              {stat.label} Active Users
            </h3>
            <p
              className="text-foreground mt-4 text-4xl font-bold tracking-tight"
            >
              {statsLoading ? "..." : stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>


      <div
        className="border-border bg-card w-full overflow-hidden rounded-xl
          border shadow-sm"
      >
        <div className="border-border bg-muted/5 border-b px-8 py-6">
          <h2 className="text-foreground text-xl font-semibold">
            User Directory
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr
                className="border-border text-muted-foreground bg-muted/5
                  border-b text-xs tracking-widest uppercase"
              >
                <th className="px-8 py-5 font-semibold">First Name</th>
                <th className="px-8 py-5 font-semibold">Last Name</th>
                <th className="px-8 py-5 font-semibold">Email Address</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {usersLoading ? (
                <tr>
                  <td
                    colSpan="3"
                    className="text-muted-foreground px-8 py-20 text-center"
                  >
                    <div className="animate-pulse">Fetching users...</div>
                  </td>
                </tr>
              ) : userList.length > 0 ? (
                userList.map((user) => (
                  <tr
                    key={user.user_id}
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
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="text-muted-foreground px-8 py-10 text-center"
                  >
                    No users found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

       
        <div
          className="bg-muted/5 border-border flex items-center justify-between
            border-t px-8 py-5"
        >
          <p className="text-muted-foreground text-sm">
            Showing{" "}
            <span className="text-foreground font-medium">
              {totalUsers > 0 ? indexOfFirstUser + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="text-foreground font-medium">
              {indexOfLastUser}
            </span>{" "}
            of <span className="text-foreground font-medium">{totalUsers}</span>{" "}
            users
          </p>

          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-xs">
              Page {currentPage} of {Math.ceil(totalUsers / usersPerPage)}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1 || usersLoading}
                onClick={() => {
                  setCurrentPage((p) => p - 1);
                  window.scrollTo({ top: 0, behavior: "smooth" }); // Optional: Scroll up on change
                }}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={indexOfLastUser >= totalUsers || usersLoading}
                onClick={() => {
                  setCurrentPage((p) => p + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
