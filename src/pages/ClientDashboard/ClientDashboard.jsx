import React, { useCallback, useEffect, useState } from "react";
import useGetFromAPI from "@/hooks/useGetFromAPI";
import WeeklySchedule from "./components/WeeklySchedule";
import Stats from "./components/Stats";
import DailySurvey from "./components/DailySurvey";
import ProgressPics from "./components/progressPics";

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("weeklySchedule");
  const resolvedUserId = localStorage.getItem("userId");

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

  return (
    <div className="w-full max-w-none space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-foreground text-3xl font-bold">
          Welcome back, {firstName || "Client"}
        </h1>
      </div>
      <div className="flex w-fit border-b border-gray-200">
        <button
          onClick={() => setActiveTab("weeklySchedule")}
          className={`px-4 py-2 text-sm font-medium focus:outline-none ${
            activeTab === "weeklySchedule"
              ? "border-border-600 text-text border-b-2"
              : "text-gray-500 hover:text-gray-700"
            }`}
        >
          This Week
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 text-sm font-medium focus:outline-none ${
            activeTab === "stats"
              ? "border-border-600 text-text border-b-2"
              : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Statistics
        </button>
        <button
          onClick={() => setActiveTab("dailySurvey")}
          className={`px-4 py-2 text-sm font-medium focus:outline-none ${
            activeTab === "dailySurvey"
              ? "border-border-600 text-text border-b-2"
              : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Daily Survey
        </button>
        <button
          onClick={() => setActiveTab("progressPics")}
          className={`px-4 py-2 text-sm font-medium focus:outline-none ${
            activeTab === "progressPics"
              ? "border-border-600 text-text border-b-2"
              : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Progress Pics
        </button>
      </div>

      {activeTab === "dailySurvey" && <DailySurvey />}
      {activeTab === "stats" && <Stats />}
      {activeTab === "weeklySchedule" && <WeeklySchedule />}
      {activeTab === "progressPics" && <ProgressPics />}
    </div>
  );
}
