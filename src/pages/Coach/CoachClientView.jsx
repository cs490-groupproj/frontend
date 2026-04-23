import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useGetFromAPI from "@/hooks/useGetFromAPI";
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

  const { data: profileData, loading: profileLoading } = useGetFromAPI(
    validClientId ? `/users/${validClientId}/profile` : null
  );

  const clientDisplayName = useMemo(() => {
    if (!profileData?.first_name && !profileData?.last_name) return null;
    return [profileData.first_name, profileData.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
  }, [profileData]);

  return (
    <div className="flex w-full max-w-none flex-col">
      <header
        className="bg-background sticky top-0 z-20 shrink-0 border-b border-border pb-4
          [scrollbar-gutter:stable]"
      >
        <div className="flex flex-col gap-4">
          <div className="flex min-h-[4.5rem] items-center justify-between gap-4">
            <div className="min-h-[3.5rem] min-w-0 flex-1">
              <h1 className="text-3xl font-bold leading-none">Client View</h1>
              {profileLoading && (
                <p className="text-muted-foreground mt-1 text-sm">Loading client…</p>
              )}
              {!profileLoading && clientDisplayName && (
                <p className="text-muted-foreground mt-1 truncate text-lg">
                  {clientDisplayName}
                </p>
              )}
              {!profileLoading && !clientDisplayName && validClientId && (
                <p className="text-muted-foreground mt-1 text-sm break-all">
                  loading...
                </p>
              )}
            </div>
            <Link
              to="/clientManagement"
              className="shrink-0 rounded-lg border px-4 py-2 text-sm font-medium
                leading-none hover:bg-muted"
            >
              Back to My Clients
            </Link>
          </div>

          <div
            className="border-border bg-card grid w-full grid-cols-3 gap-1 rounded-xl
              border p-1"
          >
            <button
              type="button"
              onClick={() => setActiveTab(TABS.DASHBOARD)}
              className={`min-h-[2.75rem] rounded-lg px-3 py-2.5 text-center text-sm
                font-medium transition-colors sm:px-4 ${
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
              className={`min-h-[2.75rem] rounded-lg px-3 py-2.5 text-center text-sm
                font-medium transition-colors sm:px-4 ${
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
              className={`min-h-[2.75rem] rounded-lg px-3 py-2.5 text-center text-sm
                font-medium transition-colors sm:px-4 ${
                  activeTab === TABS.NUTRITION
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Nutrition
            </button>
          </div>
        </div>
      </header>

      <div className="mt-6 min-h-0 flex-1">
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
    </div>
  );
}
