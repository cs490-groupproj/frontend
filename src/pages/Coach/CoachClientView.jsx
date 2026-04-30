import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useGetFromAPI from "@/hooks/useGetFromAPI";
import { Card, CardContent } from "@/components/ui/card";
import ClientDashboard from "@/pages/ClientDashboard/ClientDashboard.jsx";
import Nutrition from "@/pages/Nutrition/nutrition.jsx";
import { getAuthHeader } from "@/lib/authHeader";
import { API_BASE_URL } from "../../../config.js";

const TABS = {
  DASHBOARD: "dashboard",
  WORKOUTS: "workouts",
  NUTRITION: "nutrition",
};

const normalizeCategoryKey = (categoryValue) => {
  const normalized = String(categoryValue || "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (normalized === "duration") return "duration";
  if (normalized === "cardio") return "cardio";
  if (normalized === "reps only") return "repsOnly";
  return "other";
};

export default function CoachClientView() {
  const { clientId } = useParams();
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [expandedHistoryWorkoutId, setExpandedHistoryWorkoutId] = useState(null);
  const [historyWorkoutDetailsById, setHistoryWorkoutDetailsById] = useState({});
  const [historyWorkoutLoadingById, setHistoryWorkoutLoadingById] = useState({});

  const validClientId = useMemo(() => clientId || "", [clientId]);

  const { data: profileData, loading: profileLoading } = useGetFromAPI(
    validClientId ? `/users/${validClientId}/profile` : null
  );
  const { data: workoutsData, loading: workoutsLoading } = useGetFromAPI(
    validClientId ? `/workouts?user_id=${validClientId}` : null
  );

  const clientDisplayName = useMemo(() => {
    if (!profileData?.first_name && !profileData?.last_name) return null;
    return [profileData.first_name, profileData.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
  }, [profileData]);

  const toggleHistoryWorkout = async (workoutId) => {
    if (expandedHistoryWorkoutId === workoutId) {
      setExpandedHistoryWorkoutId(null);
      return;
    }

    setExpandedHistoryWorkoutId(workoutId);
    if (historyWorkoutDetailsById[workoutId] || historyWorkoutLoadingById[workoutId]) return;

    setHistoryWorkoutLoadingById((prev) => ({ ...prev, [workoutId]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}`, {
        headers: {
          ...(await getAuthHeader()),
        },
      });
      if (!response.ok) return;
      const detail = await response.json();
      setHistoryWorkoutDetailsById((prev) => ({ ...prev, [workoutId]: detail }));
    } finally {
      setHistoryWorkoutLoadingById((prev) => ({ ...prev, [workoutId]: false }));
    }
  };

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
          <div className="space-y-5">
            <div>
              <h2 className="text-3xl font-bold">Workout History</h2>
            </div>
            <Card className="mx-auto w-full max-w-4xl">
              <CardContent className="space-y-4 p-5">
                {workoutsLoading && (
                  <p className="text-muted-foreground text-sm">Loading workout history...</p>
                )}

                {!workoutsLoading &&
                  (workoutsData || []).map((workout) => (
                    <div key={workout.workout_id} className="space-y-3 rounded-md border p-4">
                      <button
                        type="button"
                        className="flex w-full flex-wrap items-center gap-4 text-left"
                        onClick={() => toggleHistoryWorkout(workout.workout_id)}
                      >
                        <div className="min-w-[220px] flex-1">
                          <p className="text-xl font-semibold">{workout.title}</p>
                          <p className="text-muted-foreground text-base">
                            Completed:{" "}
                            {workout.completion_date
                              ? new Date(workout.completion_date).toLocaleString()
                              : "Not completed"}
                          </p>
                        </div>
                        <span className="rounded-md border px-3 py-2 text-sm font-medium">
                          {expandedHistoryWorkoutId === workout.workout_id
                            ? "Hide Details"
                            : "View Details"}
                        </span>
                      </button>

                      {expandedHistoryWorkoutId === workout.workout_id && (
                        <div className="space-y-3 border-t pt-4">
                          <div className="bg-muted/30 rounded-md px-3 py-2 text-base">
                            <span className="font-medium">Mood:</span> {workout.mood ?? "-"} •{" "}
                            <span className="font-medium">Duration:</span>{" "}
                            {workout.duration_mins ?? "-"} min
                            {workout.notes ? (
                              <p className="text-muted-foreground mt-1 text-sm">
                                Notes: {workout.notes}
                              </p>
                            ) : null}
                          </div>

                          {historyWorkoutLoadingById[workout.workout_id] && (
                            <p className="text-muted-foreground text-sm">
                              Loading exercises...
                            </p>
                          )}

                          {!historyWorkoutLoadingById[workout.workout_id] &&
                            (historyWorkoutDetailsById[workout.workout_id]?.exercises || [])
                              .length === 0 && (
                              <p className="text-muted-foreground text-sm">
                                No exercises recorded for this workout.
                              </p>
                            )}

                          {!historyWorkoutLoadingById[workout.workout_id] &&
                            (historyWorkoutDetailsById[workout.workout_id]?.exercises || []).map(
                              (exercise, index) => {
                                const categoryKey = normalizeCategoryKey(exercise.category);
                                let metrics = `sets: ${exercise.sets ?? "-"} • reps: ${
                                  exercise.reps ?? "-"
                                } • lbs: ${exercise.weight ?? "-"}`;

                                if (categoryKey === "duration") {
                                  metrics = `duration: ${exercise.duration_sec ?? "-"} sec`;
                                } else if (categoryKey === "cardio") {
                                  metrics = `distance: ${exercise.distance_m ?? "-"} miles • pace: ${
                                    exercise.pace_sec_per_km ?? "-"
                                  } sec/mile`;
                                } else if (categoryKey === "repsOnly") {
                                  metrics = `reps: ${exercise.reps ?? "-"}`;
                                }

                                return (
                                  <div
                                    key={`${workout.workout_id}-${exercise.workout_exercise_id || index}`}
                                    className="bg-muted/40 rounded-md px-3 py-2 text-base"
                                  >
                                    <span className="font-medium">
                                      {exercise.name ||
                                        `Exercise #${exercise.exercise_id || index + 1}`}
                                    </span>
                                    <span className="text-muted-foreground"> • {metrics}</span>
                                  </div>
                                );
                              }
                            )}
                        </div>
                      )}
                    </div>
                  ))}

                {!workoutsLoading && (!workoutsData || workoutsData.length === 0) && (
                  <p className="text-muted-foreground text-sm">No workouts logged yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === TABS.NUTRITION && (
          <Nutrition viewedUserId={validClientId} readOnly />
        )}
      </div>
    </div>
  );
}
