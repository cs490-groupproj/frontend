import { Card, CardContent } from "@/components/ui/card";

const WorkoutHistoryTab = ({
  workoutsData,
  toggleHistoryWorkout,
  expandedHistoryWorkoutId,
  historyWorkoutLoadingById,
  historyWorkoutDetailsById,
}) => {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Workout History</h1>
      </div>
      <Card>
        <CardContent className="space-y-3 p-4">
          {(workoutsData || []).map((workout) => (
            <div key={workout.workout_id} className="space-y-3 rounded-md border p-3">
              <button
                type="button"
                className="flex w-full flex-wrap items-center gap-3 text-left"
                onClick={() => toggleHistoryWorkout(workout.workout_id)}
              >
                <div className="min-w-[220px] flex-1">
                  <p className="font-semibold">{workout.title}</p>
                  <p className="text-muted-foreground text-sm">
                    {workout.schedule_weekday || "Unscheduled"} •{" "}
                    {workout.schedule_time || "Time TBD"}
                  </p>
                </div>
                <span className="text-muted-foreground text-sm">#{workout.workout_id}</span>
                <span className="text-muted-foreground text-xs">
                  {expandedHistoryWorkoutId === workout.workout_id
                    ? "Hide exercises"
                    : "Show exercises"}
                </span>
              </button>

              {expandedHistoryWorkoutId === workout.workout_id && (
                <div className="space-y-2 border-t pt-3">
                  {historyWorkoutLoadingById[workout.workout_id] && (
                    <p className="text-muted-foreground text-sm">Loading exercises...</p>
                  )}
                  {!historyWorkoutLoadingById[workout.workout_id] &&
                    (historyWorkoutDetailsById[workout.workout_id]?.exercises || []).length ===
                      0 && (
                      <p className="text-muted-foreground text-sm">
                        No exercises recorded for this workout.
                      </p>
                    )}
                  {!historyWorkoutLoadingById[workout.workout_id] &&
                    (historyWorkoutDetailsById[workout.workout_id]?.exercises || []).map(
                      (exercise, index) => (
                        <div
                          key={`${workout.workout_id}-${exercise.workout_exercise_id || index}`}
                          className="bg-muted/40 rounded-md px-3 py-2 text-sm"
                        >
                          <span className="font-medium">
                            {exercise.name || `Exercise #${exercise.exercise_id || index + 1}`}
                          </span>
                          <span className="text-muted-foreground">
                            {" "}
                            • sets: {exercise.sets ?? "-"} • reps: {exercise.reps ?? "-"} • lbs:{" "}
                            {exercise.weight ?? "-"}
                          </span>
                        </div>
                      )
                    )}
                </div>
              )}
            </div>
          ))}
          {(!workoutsData || workoutsData.length === 0) && (
            <p className="text-muted-foreground text-sm">No workouts logged yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutHistoryTab;
