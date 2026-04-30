import React, { useState, useMemo } from "react"; // Added useMemo for cleaner filtering
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button.jsx";
import useGetFromAPI from "@/hooks/useGetFromAPI";
import usePostToAPI from "@/hooks/usePostToAPI";

const mapRequestFromBackend = (r) => ({
 id: r.request_id ?? r.coach_request_id,
 initials:
 (r.client.client_first_name?.[0] || "") +
 (r.client.client_last_name?.[0] || ""),
 name: `${r.client.client_first_name} ${r.client.client_last_name}`,
 message: "Incoming coaching request",
});

export default function ClientManagement() {
 const [tab, setTab] = useState("requests");
 const [refreshTrigger, setRefreshTrigger] = useState(0);
 const [notification, setNotification] = useState(null);

 // NEW: State to track IDs we just removed so they vanish instantly
 const [removedClientIds, setRemovedClientIds] = useState([]);

 // API Hooks
 const { data: requestsData, loading: requestsLoading } = useGetFromAPI(
 "/coaches/requests?limit=20&offset=0",
 refreshTrigger
 );
 const { data: clientsData, loading: clientsLoading } = useGetFromAPI(
 "/coaches/clients",
 refreshTrigger
 );
 const { postFunction } = usePostToAPI();

 // Data Mapping
 const requests = requestsData?.requests
 ? requestsData.requests.map(mapRequestFromBackend)
 : [];

 // UPDATED: Filter out clients that were just removed locally
 const activeClients = useMemo(() => {
 const rawClients = clientsData?.clients ?? [];
 return rawClients.filter((c) => !removedClientIds.includes(c.client_id));
 }, [clientsData, removedClientIds]);

 // UI Helpers
 const showNotification = (text, type = "info") => {
 setNotification({ text, type });
 window.setTimeout(() => setNotification(null), 3500);
 };

 // Logic Functions
 const acceptRequest = async (requestId) => {
 try {
 await postFunction(`/coaches/requests/${requestId}/accept`, {});
 setRefreshTrigger((prev) => prev + 1);
 showNotification("Client request accepted.", "success");
 } catch (err) {
 console.error("Error accepting request:", err);
 showNotification("Failed to accept request.", "danger");
 }
 };

 const declineRequest = async (requestId) => {
 try {
 await postFunction(`/coaches/requests/${requestId}/reject`, {});
 setRefreshTrigger((prev) => prev + 1);
 showNotification("Client request declined.", "info");
 } catch (err) {
 console.error("Error rejecting request:", err);
 showNotification("Failed to decline request.", "danger");
 }
 };

 const removeClient = async (clientId) => {
 const confirmRemove = window.confirm(
 "Are you sure you want to remove this client? This action cannot be undone."
 );
 if (!confirmRemove) return;

 try {
 await postFunction("/coaches/remove_client", { client_id: clientId });

 // FIX: Instantly hide the client from the UI
 setRemovedClientIds((prev) => [...prev, clientId]);

 // Trigger background refresh
 setRefreshTrigger((prev) => prev + 1);
 showNotification("Client removed successfully.", "success");
 } catch (err) {
 console.error("Error removing client:", err);
 showNotification(
 "Failed to remove client. Try refreshing the page.",
 "danger"
 );
 }
 };

 return (
 <div className="space-y-6">
 {notification && (
 <div
 className={`rounded-lg border px-4 py-2 text-sm transition-all ${
 notification.type === "success"
 ? "border-border bg-muted text-foreground"
 : notification.type === "danger"
 ? "border-destructive/30 bg-destructive/10 text-destructive"
 : "border-border bg-muted text-foreground"
 }`}
 >
 {notification.text}
 </div>
 )}

 <div>
 <h1 className="text-3xl font-bold text-foreground">My Clients</h1>
 <p className="text-muted-foreground mt-1">
 Manage incoming requests and active clients.
 </p>
 </div>

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
 Active Clients ({activeClients.length})
 </Button>
 </div>

 {tab === "requests" && (
 <div className="space-y-4">
 {requestsLoading ? (
 <div className="text-muted-foreground rounded-xl border p-6">
 Loading incoming requests...
 </div>
 ) : requests.length === 0 ? (
 <div className="text-muted-foreground rounded-xl border p-6">
 No incoming requests
 </div>
 ) : (
 requests.map((r) => (
 <div
 key={r.id}
 className="bg-card flex items-center justify-between rounded-xl
 border p-5 shadow-sm"
 >
 <div className="flex items-start gap-4">
 <div
 className="bg-muted text-foreground flex h-10 w-10 items-center
 justify-center rounded-full font-semibold"
 >
 {r.initials}
 </div>
 <div>
 <div className="font-semibold">{r.name}</div>
 <div className="text-muted-foreground text-sm">
 {r.message}
 </div>
 </div>
 </div>

 <div className="flex gap-2">
 <Button onClick={() => acceptRequest(r.id)}>
 Accept
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

 {tab === "active" && (
 <div className="space-y-4">
 {clientsLoading && activeClients.length === 0 ? (
 <div className="text-muted-foreground rounded-xl border p-6">
 Loading active clients...
 </div>
 ) : activeClients.length === 0 ? (
 <div className="text-muted-foreground rounded-xl border p-6">
 You do not have any active clients yet.
 </div>
 ) : (
 activeClients.map((client) => (
 <article
 key={client.client_id}
 className="border-border bg-card flex items-center
 justify-between gap-4 rounded-xl border px-6 py-4 shadow-sm"
 >
 <h2 className="text-foreground text-lg font-semibold">
 {client.first_name} {client.last_name}
 </h2>

 <div className="flex gap-2">
 <Link
 to={`/clientManagement/${client.client_id}/view`}
 className="hover:bg-muted shrink-0 rounded-lg border px-4 py-2.5
 text-sm font-medium transition-colors"
 >
 View Client
 </Link>
 <Button
 variant="destructive"
 onClick={() => removeClient(client.client_id)}
 >
 Remove Client
 </Button>
 </div>
 </article>
 ))
 )}

 </div>
 )}
 </div>
 );
}
