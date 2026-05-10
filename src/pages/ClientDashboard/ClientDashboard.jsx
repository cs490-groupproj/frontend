import React, { useCallback, useEffect, useState } from "react";
import useGetFromAPI from "@/hooks/useGetFromAPI";
import WeeklySchedule from "./components/WeeklySchedule";
import Stats from "./components/Stats";
import DailySurvey from "./components/DailySurvey";
import ProgressPics from "./components/progressPics";
import { Loader2 } from "lucide-react";

export default function ClientDashboard({
  viewedUserId = null,
  readOnly = false,
}) {
  const [activeTab, setActiveTab] = useState("weeklySchedule");
  const resolvedUserId = viewedUserId || localStorage.getItem("userId");

  const { data: profileData, loading: profileLoading } = useGetFromAPI(
    resolvedUserId ? `/users/${resolvedUserId}/profile` : null
  );

  const [firstName, setFirstName] = useState("");

  const nameFromProfile = useCallback((p) => {
    if (!p) return "Client";
    setFirstName(p.first_name);
  }, []);

  useEffect(() => {
    nameFromProfile(profileData);
  }, [profileData, nameFromProfile]);
  const isDataReady = !profileLoading && profileData;

  if (!isDataReady) {
    return (
      <div className="flex w-full flex-col items-center justify-center py-12">
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

  return (
    <div className="w-full max-w-none space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-foreground text-3xl font-bold">
          Welcome back, {firstName || "Client"}
        </h1>
      </div>
      <div className="border-border bg-card inline-flex rounded-xl border p-1">
        <button
          type="button"
          onClick={() => setActiveTab("weeklySchedule")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "weeklySchedule"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          This Week
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("stats")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "stats"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Statistics
        </button>
        {!readOnly && (
          <button
            type="button"
            onClick={() => setActiveTab("dailySurvey")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "dailySurvey"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Daily Survey
          </button>
        )}
        {!readOnly && (
          <button
            type="button"
            onClick={() => setActiveTab("progressPics")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "progressPics"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Progress Pics
          </button>
        )}
      </div>

      {!readOnly && activeTab === "dailySurvey" && <DailySurvey />}
      {activeTab === "stats" && <Stats viewedUserId={resolvedUserId} />}
      {activeTab === "weeklySchedule" && (
        <WeeklySchedule viewedUserId={resolvedUserId} />
      )}
      {activeTab === "progressPics" && <ProgressPics />}
    </div>
  );
}
