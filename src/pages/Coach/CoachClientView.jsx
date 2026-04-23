import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ClientDashboard from "@/pages/ClientDashboard/ClientDashboard.jsx";
import Workouts from "@/pages/Workouts/Workouts.jsx";
import Nutrition from "@/pages/Nutrition/nutrition.jsx";

const TABS = {
  DASHBOARD: "dashboard",
  WORKOUTS: "workouts",
  NUTRITION: "nutrition",
};

export default function CoachClientView() {
  const { clientId } = useParams();
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);

  const validClientId = useMemo(() => clientId || "", [clientId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client View</h1>
          <p className="text-muted-foreground mt-1">
            Read-only view for client id: {validClientId}
          </p>
        </div>
        <Link
          to="/clientManagement"
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Back to My Clients
        </Link>
      </div>

      <div className="border-border bg-card inline-flex rounded-xl border p-1">
        <button
          type="button"
          onClick={() => setActiveTab(TABS.DASHBOARD)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === TABS.DASHBOARD
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Dashboard
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(TABS.WORKOUTS)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === TABS.WORKOUTS
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Workouts
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(TABS.NUTRITION)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === TABS.NUTRITION
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Nutrition
        </button>
      </div>

      {activeTab === TABS.DASHBOARD && (
        <ClientDashboard viewedUserId={validClientId} readOnly />
      )}
      {activeTab === TABS.WORKOUTS && (
        <Workouts viewedUserId={validClientId} readOnly />
      )}
      {activeTab === TABS.NUTRITION && (
        <Nutrition viewedUserId={validClientId} readOnly />
      )}
    </div>
  );
}
