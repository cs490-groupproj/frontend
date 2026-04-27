import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button.jsx";
import useGetFromAPI from "@/hooks/useGetFromAPI";
import usePostToAPI from "@/hooks/usePostToAPI";

/* -------------------------------
   MOCK MAPPER (if needed later)
   ------------------------------- */
const mapRequestFromBackend = (r) => ({
  id: r.request_id,
  initials:
    (r.client.client_first_name?.[0] || "") +
    (r.client.client_last_name?.[0] || ""),
  name: `${r.client.client_first_name} ${r.client.client_last_name}`,
  message: "Incoming coaching request",
  time: "Just now",
});

export default function ClientManagement() {
  const [tab, setTab] = useState("requests");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /* -------------------------------
     FETCH COACH REQUESTS
     ------------------------------- */
  const { data, loading } = useGetFromAPI(
    `/coaches/requests?limit=20&offset=0`,
    refreshTrigger
  );

  const requests = data?.requests ? data.requests.map(mapRequestFromBackend) : [];
  const { postFunction } = usePostToAPI();

  /* -------------------------------
     ACCEPT REQUEST (USES BILLING)
     ------------------------------- */
  const acceptRequest = async (requestId) => {
    try {
      await postFunction(`/coaches/requests/${requestId}/accept`, {});
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Error accepting request:", err);
    }
};

  /* -------------------------------
     DECLINE REQUEST (frontend only placeholder)
     ------------------------------- */
  const declineRequest = async (requestId) => {
    try {
      await postFunction(`/coaches/requests/${requestId}/reject`, {});
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
};

  if (loading) {
    return (
      <div className="p-6 text-muted-foreground">
        Loading client requests...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Client Management</h1>
        <p className="text-muted-foreground">
          Manage your active clients and incoming requests
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-3">
        <Button
          variant={tab === "requests" ? "default" : "outline"}
          onClick={() => setTab("requests")}
        >
          Incoming Requests ({requests.length})
        </Button>

        <Button
          variant={tab === "active" ? "default" : "outline"}
          onClick={() => setTab("active")}
        >
          Active Clients
        </Button>
      </div>

      {/* -------------------------------
          INCOMING REQUESTS
          ------------------------------- */}
      {tab === "requests" && (
        <div className="space-y-4">

          {requests.length === 0 ? (
            <div className="text-muted-foreground border rounded-xl p-6">
              No incoming requests
            </div>
          ) : (
            requests.map((r) => (
              <div
                key={r.id}
                className="border rounded-xl p-5 bg-card shadow-sm flex justify-between items-center"
              >
                {/* LEFT */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
                    {r.initials}
                  </div>

                  <div>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {r.message}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {r.time}
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2">
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => acceptRequest(r.id)}
                  >
                    Accept
                  </Button>

                  <Button variant="outline">
                    View Profile
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => declineRequest(r.id)}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* -------------------------------
          ACTIVE CLIENTS (placeholder)
          ------------------------------- */}
      {tab === "active" && (
        <div className="border rounded-xl p-6 text-muted-foreground">
          Active clients will appear here
        </div>
      )}
    </div>
  );
}