import React from "react";
import useGetFromAPI from "../../hooks/useGetFromAPI";

export default function CoachDashboard() {

  const { data, loading } = useGetFromAPI("/coaches/clients");

  const coachName = data?.coach_name || "Coach";
  const clients = data?.clients || [];

 
  const totalClients = clients.length;

  return (
    <div className="w-full space-y-8 p-6">
     
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Welcome back, {loading ? "..." : coachName}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Here is a look at the clients currently enrolled in your training
          program.
        </p>
      </div>


      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="border-border bg-card rounded-xl border p-8 shadow-sm">
          <h3
            className="text-secondary-foreground text-xs font-semibold
              tracking-widest uppercase"
          >
            Total Clients
          </h3>
          <p className="text-foreground mt-4 text-4xl font-bold tracking-tight">
            {loading ? "..." : totalClients.toLocaleString()}
          </p>
        </div>
      </div>

      <div
        className="border-border bg-card w-full overflow-hidden rounded-xl
          border shadow-sm"
      >
        <div className="border-border bg-muted/5 border-b px-8 py-6">
          <h2 className="text-foreground text-xl font-semibold">
            Client Directory
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
                <th className="px-8 py-5 text-right font-semibold">
                  Last Name
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan="2"
                    className="text-muted-foreground px-8 py-20 text-center"
                  >
                    <div className="animate-pulse">Fetching your roster...</div>
                  </td>
                </tr>
              ) : clients.length > 0 ? (
                clients.map((client, index) => (
                  <tr
                    key={index}
                    className="hover:bg-muted/5 transition-colors"
                  >
                    <td className="text-foreground px-8 py-5 text-sm">
                      {client.first_name}
                    </td>
                    <td className="text-foreground px-8 py-5 text-right text-sm">
                      {client.last_name}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="2"
                    className="text-muted-foreground px-8 py-10 text-center
                      italic"
                  >
                    No clients found in your roster.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
