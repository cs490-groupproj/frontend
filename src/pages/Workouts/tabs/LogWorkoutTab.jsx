import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";

const LogWorkoutTab = ({
  hasWorkoutScheduledToday,
  todayWeekday,
  todaysScheduledWorkouts,
  setSelectedPlanToLoad,
  loadPlanIntoLog,
  selectedPlanToLoad,
  plans,
  logRows,
  updateLogRow,
  removeLogRow,
  addLogRow,
  logDuration,
  setLogDuration,
  mood,
  setMood,
  sessionNotes,
  setSessionNotes,
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

              <div className="grid grid-cols-12 gap-3 text-muted-foreground text-xs">
                <span className="col-span-5">Exercise</span>
                <span className="col-span-2">Sets</span>
                <span className="col-span-2">Reps</span>
                <span className="col-span-2">lbs</span>
                <span className="col-span-1" />
              </div>

              {logRows.map((row, index) => (
                <div key={`${index}-${row.exercise}`} className="grid grid-cols-12 gap-3">
                  <Input
                    className="col-span-5"
                    value={row.exercise}
                    onChange={(event) => updateLogRow(index, "exercise", event.target.value)}
                  />
                  <Input
                    className="col-span-2"
                    value={row.sets}
                    onChange={(event) => updateLogRow(index, "sets", event.target.value)}
                  />
                  <Input
                    className="col-span-2"
                    value={row.reps}
                    onChange={(event) => updateLogRow(index, "reps", event.target.value)}
                  />
                  <Input
                    className="col-span-2"
                    value={row.lbs}
                    onChange={(event) => updateLogRow(index, "lbs", event.target.value)}
                  />
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-destructive col-span-1 inline-flex items-center justify-center"
                    onClick={() => removeLogRow(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <Button variant="link" className="px-0" onClick={addLogRow}>
                + Add exercise
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card>
              <CardContent className="space-y-2 p-5">
                <p className="text-muted-foreground text-sm font-medium">Duration (minutes)</p>
                <Input
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
          <Button className="min-w-72">Save Workout Log</Button>
        </div>
      </div>
    </div>
  );
};

export default LogWorkoutTab;
