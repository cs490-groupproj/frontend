import React from "react";
import { Loader2 } from "lucide-react"; // Matching the nutrition page icons
import useGetFromAPI from "../../hooks/useGetFromAPI";

/**
 * Normalizes backend request data into a consistent format for the UI.
 */
const mapRequestFromBackend = (r) => {
  if (!r) return null;
  const first_name = r.client?.client_first_name || "";
  const last_name = r.client?.client_last_name || "";

  return {
    id: r.request_id ?? r.coach_request_id,
    initials: (first_name[0] || "") + (last_name[0] || ""),
    name: `${first_name} ${last_name}`,
    message: "Incoming coaching request",
  };
};

export default function CoachDashboard() {
  // Fetching data from your Flask backend
  const { data: clientData, loading: clientsLoading } =
    useGetFromAPI("/coaches/clients");
  const { data: requestsData, loading: requestsLoading } = useGetFromAPI(
    "/coaches/requests?limit=10&offset=0"
  );

  // --- THE STRICT DATA GUARD ---
  // Stays on loading screen until API is done AND data exists in state
  const isDataReady =
    !clientsLoading && !requestsLoading && clientData && requestsData;

  // Process data once ready
  const coachName = clientData?.coach_name || "Coach";
  const clients = clientData?.clients || [];
  const requests = requestsData?.requests
    ? requestsData.requests.map(mapRequestFromBackend).filter(Boolean)
    : [];

  // --- LOADING VIEW (Matching Nutrition Page Style) ---
  if (!isDataReady) {
    return (
      <div
        className="bg-background flex h-screen w-full flex-col items-center
          justify-center text-white"
      >
        {/* Matching the Loader2 styling from your nutrition page */}
        <Loader2 className="text-primary h-12 w-12 animate-spin" />
        <p
          className="text-muted-foreground mt-4 text-xs font-bold
            tracking-widest uppercase"
        >
          Syncing Dashboard
        </p>
      </div>
    );
  }

  // --- DASHBOARD CONTENT (Instant Snap) ---
  return (
    <div className="bg-background min-h-screen w-full space-y-8 p-6 text-white">
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome back, {coachName}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Here is an overview of your training program and new inquiries.
        </p>
      </div>

      {/* TOP METRIC CARDS */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Pending Requests Metric */}
        <div className="lg:col-span-5">
          <div
            className="border-border bg-card relative h-full rounded-xl border
              p-8 shadow-sm"
          >
            <h3
              className="text-secondary-foreground text-xs font-semibold
                tracking-widest uppercase"
            >
              Pending Requests
            </h3>
            <div className="mt-4">
              <p className="text-foreground text-4xl font-bold tracking-tight">
                {requests.length}
              </p>
            </div>
          </div>
        </div>

        {/* Active Roster Metric */}
        <div className="lg:col-span-7">
          <div
            className="border-border bg-card relative h-full rounded-xl border
              p-8 shadow-sm"
          >
            <h3
              className="text-secondary-foreground text-xs font-semibold
                tracking-widest uppercase"
            >
              Active Roster
            </h3>
            <div className="mt-4">
              <p className="text-foreground text-4xl font-bold tracking-tight">
                {clients.length.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER CONTENT GRID */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* ACTION REQUIRED (Requests) */}
        <div className="space-y-4 lg:col-span-5">
          <h2 className="text-xl font-semibold">Action Required</h2>
          <div className="space-y-3">
            {requests.length > 0 ? (
              requests.map((r) => (
                <div
                  key={r.id}
                  className="bg-card border-border flex cursor-pointer
                    items-center gap-4 rounded-xl border p-4 shadow-sm
                    transition-colors hover:border-white/20"
                >
                  <div
                    className="bg-muted text-foreground flex h-10 w-10 shrink-0
                      items-center justify-center rounded-full font-bold"
                  >
                    {r.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{r.name}</div>
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

        {/* CURRENT ROSTER (Table) */}
        <div className="space-y-4 lg:col-span-7">
          <h2 className="text-xl font-semibold">Current Roster</h2>
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
                  {clients.length > 0 ? (
                    clients.map((client, index) => (
                      <tr
                        key={index}
                        className="hover:bg-muted/5 cursor-pointer
                          transition-colors"
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
