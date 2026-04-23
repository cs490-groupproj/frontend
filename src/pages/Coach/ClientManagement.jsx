import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../../config";

export default function ClientManagement() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setError("");

        const response = await fetch(`${API_BASE_URL}/coaches/clients`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load clients.");
        }

        setClients(Array.isArray(data.clients) ? data.clients : []);
      } catch (err) {
        setError(err.message || "Could not load your clients right now.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Clients</h1>
        <p className="text-muted-foreground mt-1">
          See the clients currently assigned to you.
        </p>
      </div>

      {isLoading && (
        <div className="text-muted-foreground">Loading your clients...</div>
      )}

      {!isLoading && error && (
        <div className="rounded-xl border border-rose-300 bg-rose-100 p-4 text-rose-900">
          {error}
        </div>
      )}

      {!isLoading && !error && clients.length === 0 && (
        <div className="text-muted-foreground rounded-xl border p-6 text-center">
          You do not have any clients yet.
        </div>
      )}

      {!isLoading && !error && clients.length > 0 && (
        <section className="flex max-w-4xl flex-col gap-3">
          {clients.map((client) => (
            <article
              key={client.client_id}
              className="border-border bg-card flex flex-row items-center justify-between
                gap-4 rounded-xl border px-6 py-4 shadow-sm sm:px-8 sm:py-5"
            >
              <h2 className="text-lg font-semibold sm:text-xl">
                {client.first_name} {client.last_name}
              </h2>
              <Link
                to={`/clientManagement/${client.client_id}/view`}
                className="shrink-0 rounded-lg border px-4 py-2.5 text-sm font-medium
                  hover:bg-muted"
              >
                View Client
              </Link>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
