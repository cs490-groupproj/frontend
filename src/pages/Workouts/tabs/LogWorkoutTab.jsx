import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";

const MetricField = ({ label, className = "", children }) => (
  <div className={className}>
    <p className="text-muted-foreground mb-1 text-[11px] font-medium">{label}</p>
    {children}
  </div>
);

const LogWorkoutTab = ({
  hasWorkoutScheduledToday,
  todayWeekday,
  todaysScheduledWorkouts,
  setSelectedPlanToLoad,
  loadPlanIntoLog,
  selectedPlanToLoad,
  plans,
  exercisesCatalog,
  logRows,
  updateLogRow,
  removeLogRow,
  addLogRow,
  categoryKeyByExerciseId,
  logDuration,
  setLogDuration,
  mood,
  setMood,
  sessionNotes,
  setSessionNotes,
  saveWorkoutLog,
  logSaveError,
  logSaveSuccess,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Log Workout</h1>
      </div>

      {!hasWorkoutScheduledToday && (
        <Card>
          <CardContent className="p-4 text-sm font-medium">
            No workout is scheduled for today. Assign one from Workout Plans first.
          </CardContent>
        </Card>
      )}

      {hasWorkoutScheduledToday && (
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-sm font-medium">
              You have workouts scheduled today ({todayWeekday}) - log one now.
            </p>
            <div className="flex flex-wrap gap-2">
              {todaysScheduledWorkouts.map((entry) => {
                const scheduleTime = entry.schedule_time || "Time TBD";
                const canLoadPlan = Boolean(entry.workout_plan_id);

                if (!canLoadPlan) {
                  return (
                    <span
                      key={entry.workout_id}
                      className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs"
                    >
                      {entry.title} • {scheduleTime}
                    </span>
                  );
                }

                return (
                  <button
                    key={entry.workout_id}
                    type="button"
                    className="bg-muted text-muted-foreground hover:text-foreground rounded-full px-3 py-1 text-xs transition-colors"
                    onClick={() => {
                      const planId = String(entry.workout_plan_id);
                      setSelectedPlanToLoad(planId);
                      loadPlanIntoLog(planId);
                    }}
                  >
                    {entry.title} • {scheduleTime}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className={`${!hasWorkoutScheduledToday ? "pointer-events-none opacity-50" : ""}`}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Exercises</p>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Load from plan:</span>
                  <select
                    className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                    value={selectedPlanToLoad}
                    onChange={(event) => {
                      setSelectedPlanToLoad(event.target.value);
                      loadPlanIntoLog(event.target.value);
                    }}
                  >
                    <option value="">None</option>
                    {plans.map((plan) => (
                      <option key={plan.workout_plan_id} value={plan.workout_plan_id}>
                        {plan.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {logRows.map((row, index) => (
                <div key={`${index}-${row.exercise}`} className="grid grid-cols-12 gap-3">
                  <MetricField label="Exercise" className="col-span-4">
                    <select
                      className="border-input bg-background text-foreground h-10 w-full rounded-md border px-3 text-sm"
                      value={row.exercise_id || ""}
                      onChange={(event) => {
                        const nextExerciseId = event.target.value;
                        const selectedExercise = (exercisesCatalog || []).find(
                          (exercise) =>
                            String(exercise.exercise_id) === String(nextExerciseId)
                        );
                        updateLogRow(index, "exercise_id", nextExerciseId);
                        updateLogRow(index, "exercise", selectedExercise?.name || "");
                      }}
                    >
                      <option value="">Select exercise</option>
                      {(exercisesCatalog || []).map((exercise) => (
                        <option key={exercise.exercise_id} value={exercise.exercise_id}>
                          {exercise.name}
                        </option>
                      ))}
                    </select>
                  </MetricField>
                  <div className="col-span-7 grid grid-cols-7 gap-2">
                    {(() => {
                      const categoryKey = categoryKeyByExerciseId?.[Number(row.exercise_id)] || "other";
                      if (categoryKey === "duration") {
                        return (
                          <MetricField label="Duration (sec)" className="col-span-7">
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              max="86400"
                              placeholder="e.g. 1800"
                              value={row.duration_sec}
                              onChange={(event) =>
                                updateLogRow(index, "duration_sec", event.target.value)
                              }
                            />
                          </MetricField>
                        );
                      }
                      if (categoryKey === "cardio") {
                        return (
                          <>
                            <MetricField label="Distance (miles)" className="col-span-4">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="1000"
                                placeholder="e.g. 5000"
                                value={row.distance_m}
                                onChange={(event) =>
                                  updateLogRow(index, "distance_m", event.target.value)
                                }
                              />
                            </MetricField>
                            <MetricField label="Pace (sec/mile)" className="col-span-3">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="3600"
                                placeholder="e.g. 300"
                                value={row.pace_sec_per_km}
                                onChange={(event) =>
                                  updateLogRow(index, "pace_sec_per_km", event.target.value)
                                }
                              />
                            </MetricField>
                          </>
                        );
                      }
                      if (categoryKey === "repsOnly") {
                        return (
                          <MetricField label="Reps" className="col-span-7">
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              max="1000"
                              placeholder="e.g. 20"
                              value={row.reps}
                              onChange={(event) => updateLogRow(index, "reps", event.target.value)}
                            />
                          </MetricField>
                        );
                      }
                      return (
                        <>
                          <MetricField label="Sets" className="col-span-2">
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              max="100"
                              placeholder="e.g. 4"
                              value={row.sets}
                              onChange={(event) => updateLogRow(index, "sets", event.target.value)}
                            />
                          </MetricField>
                          <MetricField label="Reps" className="col-span-2">
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              max="1000"
                              placeholder="e.g. 10"
                              value={row.reps}
                              onChange={(event) => updateLogRow(index, "reps", event.target.value)}
                            />
                          </MetricField>
                          <MetricField label="Weight (lbs)" className="col-span-3">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="2000"
                              placeholder="e.g. 135"
                              value={row.lbs}
                              onChange={(event) => updateLogRow(index, "lbs", event.target.value)}
                            />
                          </MetricField>
                        </>
                      );
                    })()}
                  </div>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-destructive col-span-1 inline-flex items-center justify-center"
                    onClick={() => removeLogRow(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button variant="outline" onClick={addLogRow}>
                Add Exercise Row
              </Button>

            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card>
              <CardContent className="space-y-2 p-5">
                <p className="text-muted-foreground text-sm font-medium">Duration (minutes)</p>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="1440"
                  value={logDuration}
                  onChange={(event) => setLogDuration(event.target.value)}
                  placeholder="e.g. 45"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 p-5">
                <p className="text-muted-foreground text-sm font-medium">How did you feel?</p>
                <div className="grid grid-cols-5 gap-3 text-center text-xs">
                  {[
                    { key: "tired", emoji: "😴", label: "Tired" },
                    { key: "ok", emoji: "😐", label: "OK" },
                    { key: "good", emoji: "😊", label: "Good" },
                    { key: "great", emoji: "💪", label: "Great" },
                    { key: "beast", emoji: "🔥", label: "Beast" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={`rounded-md border p-2 ${
                        mood === item.key ? "border-primary bg-primary/10" : ""
                      }`}
                      onClick={() => setMood(item.key)}
                    >
                      <div className="text-base">{item.emoji}</div>
                      <div>{item.label}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-2 p-5">
                <p className="text-muted-foreground text-sm font-medium">Session Notes</p>
                <Textarea
                  value={sessionNotes}
                  onChange={(event) => setSessionNotes(event.target.value)}
                  placeholder="How did it go? Any PRs, struggles, or adjustments?"
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <div className="space-y-2 text-right">
            {logSaveError ? (
              <p className="text-destructive text-sm">{logSaveError}</p>
            ) : null}
            {logSaveSuccess ? (
              <p className="text-emerald-600 text-sm">{logSaveSuccess}</p>
            ) : null}
            <Button className="min-w-72" onClick={saveWorkoutLog}>
              Save Workout Log
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogWorkoutTab;
