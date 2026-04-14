import { Card, CardContent } from "@/components/ui/card";

const WorkoutHistoryTab = ({
  workoutsData,
  toggleHistoryWorkout,
  expandedHistoryWorkoutId,
  historyWorkoutLoadingById,
  historyWorkoutDetailsById,
  logMetaByWorkoutId,
  categoryKeyByExerciseId,
}) => {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Workout History</h1>
      </div>
      <Card className="mx-auto w-full max-w-4xl">
        <CardContent className="space-y-4 p-5">
          {(workoutsData || []).map((workout) => (
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
                    <span className="font-medium">Mood:</span>{" "}
                    {logMetaByWorkoutId?.[workout.workout_id]?.mood ?? "-"} •{" "}
                    <span className="font-medium">Duration:</span>{" "}
                    {logMetaByWorkoutId?.[workout.workout_id]?.duration_min ?? "-"} min
                    {logMetaByWorkoutId?.[workout.workout_id]?.notes ? (
                      <p className="text-muted-foreground mt-1 text-sm">
                        Notes: {logMetaByWorkoutId[workout.workout_id].notes}
                      </p>
                    ) : null}
                  </div>
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
                          className="bg-muted/40 rounded-md px-3 py-2 text-base"
                        >
                          {(() => {
                            const categoryName = String(exercise.category || "")
                              .toLowerCase()
                              .replace(/[_-]+/g, " ")
                              .replace(/\s+/g, " ")
                              .trim();
                            const categoryKeyFromName =
                              categoryName === "duration"
                                ? "duration"
                                : categoryName === "cardio"
                                ? "cardio"
                                : categoryName === "reps only"
                                ? "repsOnly"
                                : null;
                            const categoryKey =
                              categoryKeyFromName ||
                              categoryKeyByExerciseId?.[Number(exercise.exercise_id)] ||
                              "other";

                            let metrics = `sets: ${exercise.sets ?? "-"} • reps: ${exercise.reps ?? "-"} • lbs: ${
                              exercise.weight ?? "-"
                            }`;
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
                              <>
                                <span className="font-medium">
                                  {exercise.name ||
                                    `Exercise #${exercise.exercise_id || index + 1}`}
                                </span>
                                <span className="text-muted-foreground"> • {metrics}</span>
                              </>
                            );
                          })()}
                          <div className="text-muted-foreground mt-1 text-sm">
                            {exercise.exercise_duration_mins
                              ? `Duration: ${exercise.exercise_duration_mins} min • `
                              : ""}
                            {exercise.exercise_mood ? `Mood: ${exercise.exercise_mood}` : ""}
                            {exercise.exercise_notes ? ` • Notes: ${exercise.exercise_notes}` : ""}
                          </div>
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
