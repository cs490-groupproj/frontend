import React from "react";
import useGetFromAPI from "../../hooks/useGetFromAPI";

const mapRequestFromBackend = (r) => ({
  id: r.request_id ?? r.coach_request_id,
  initials:
    (r.client.client_first_name?.[0] || "") +
    (r.client.client_last_name?.[0] || ""),
  name: `${r.client.client_first_name} ${r.client.client_last_name}`,
  message: "Incoming coaching request",
});

export default function CoachDashboard() {
  const { data: clientData, loading: clientsLoading } =
    useGetFromAPI("/coaches/clients");
  const { data: requestsData, loading: requestsLoading } = useGetFromAPI(
    "/coaches/requests?limit=10&offset=0"
  );

  const coachName = clientData?.coach_name || "Coach";
  const clients = clientData?.clients || [];
  const requests = requestsData?.requests
    ? requestsData.requests.map(mapRequestFromBackend)
    : [];

  return (
    <div className="w-full space-y-8 p-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Welcome back, {clientsLoading ? "..." : coachName}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Here is an overview of your training program and new inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div
            className="border-border bg-card h-full rounded-xl border p-8
              shadow-sm"
          >
            <h3
              className="text-secondary-foreground text-xs font-semibold
                tracking-widest uppercase"
            >
              Pending Requests
            </h3>
            <p
              className="text-foreground mt-4 text-4xl font-bold tracking-tight"
            >
              {requestsLoading ? "..." : requests.length}
            </p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div
            className="border-border bg-card h-full rounded-xl border p-8
              shadow-sm"
          >
            <h3
              className="text-secondary-foreground text-xs font-semibold
                tracking-widest uppercase"
            >
              Active Roster
            </h3>
            <p
              className="text-foreground mt-4 text-4xl font-bold tracking-tight"
            >
              {clientsLoading ? "..." : clients.length.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <h2 className="text-xl font-semibold text-white">Action Required</h2>
          <div className="space-y-3">
            {requestsLoading ? (
              <div
                className="border-border bg-card/50 animate-pulse rounded-xl
                  border border-dashed p-6"
              >
                Loading requests...
              </div>
            ) : requests.length > 0 ? (
              requests.map((r) => (
                <div
                  key={r.id}
                  className="bg-card border-border flex items-center gap-4
                    rounded-xl border p-4 shadow-sm"
                >
                  <div
                    className="bg-muted text-foreground flex h-10 w-10 shrink-0
                      items-center justify-center rounded-full font-bold"
                  >
                    {r.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-white">
                      {r.name}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {r.message}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                className="text-muted-foreground border-border bg-card/50
                  rounded-xl border border-dashed p-6 text-center italic"
              >
                All caught up! No new requests.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 lg:col-span-7">
          <h2 className="text-xl font-semibold text-white">Current Roster</h2>
          <div
            className="border-border bg-card overflow-hidden rounded-xl border
              shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr
                    className="border-border text-muted-foreground bg-muted/5
                      border-b text-xs tracking-widest uppercase"
                  >
                    <th className="px-6 py-4 text-sm font-semibold">
                      Client Name
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {clientsLoading ? (
                    <tr>
                      <td
                        className="text-muted-foreground animate-pulse px-6
                          py-10 text-center"
                      >
                        Syncing roster...
                      </td>
                    </tr>
                  ) : clients.length > 0 ? (
                    clients.map((client, index) => (
                      <tr
                        key={index}
                        className="hover:bg-muted/5 transition-colors"
                      >
                        <td
                          className="text-foreground px-6 py-4 text-sm
                            font-medium"
                        >
                          {client.first_name} {client.last_name}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="text-muted-foreground px-6 py-10 text-center
                          text-sm italic"
                      >
                        No active clients found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
