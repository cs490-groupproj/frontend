import React, { useCallback, useEffect, useState } from "react";
import DailySurvey from "./components/DailySurvey";
import useGetFromAPI from "@/hooks/useGetFromAPI";
import Stats from "./components/Stats";

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("thisWeek");
  const resolvedUserId = localStorage.getItem("userId");

  const { data: profileData, loading: profileLoading } = useGetFromAPI(
      resolvedUserId ? `/users/${resolvedUserId}/profile` : null,

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
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("thisWeek")}
          className={`px-4 py-2 text-sm font-medium focus:outline-none ${
            activeTab === "thisWeek"
              ? "border-b-2 border-border-600 text-text"
              : "text-gray-500 hover:text-gray-700"
          }`}>
          This Week
          </button>
          <button 
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 text-sm font-medium focus:outline-none ${
            activeTab === "stats"
              ? "border-b-2 border-border-600 text-text"
              : "text-gray-500 hover:text-gray-700"
          }`}>
          Statistics
          </button>
          <button
          onClick={() => setActiveTab("dailySurvey")}
          className={`px-4 py-2 text-sm font-medium focus:outline-none ${
            activeTab === "dailySurvey"
              ? "border-b-2 border-border-600 text-text"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Daily Survey
        </button>
      </div>

      {activeTab === "dailySurvey" ? (
        <DailySurvey />
      ) : null}

      {activeTab === "stats" ? (
        <Stats />
      ) : null}
    </div>
  );
}
