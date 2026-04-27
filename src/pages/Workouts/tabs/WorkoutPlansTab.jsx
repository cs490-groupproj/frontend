import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Minus } from "lucide-react";

const MetricField = ({ label, className = "", children }) => (
  <div className={className}>
    <p className="text-muted-foreground mb-1 text-[11px] font-medium">{label}</p>
    {children}
  </div>
);

const formatScheduleTime = (scheduleTime) => {
  if (!scheduleTime) return "Time TBD";
  const [rawHour, rawMinute] = String(scheduleTime).split(":");
  const hour = Number(rawHour);
  const minute = Number(rawMinute);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return scheduleTime;
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
};

const WorkoutPlansTab = ({
  pageTitle = "Create and Manage Workout Plans",
  isCoachAssignScreen = false,
  coachClients = [],
  coachClientsLoading = false,
  selectedClientId = "",
  setSelectedClientId,
  openCreateForm,
  isFormOpen,
  planTitle,
  setPlanTitle,
  planWorkoutTypeId,
  setPlanWorkoutTypeId,
  workoutTypes,
  planDurationMin,
  setPlanDurationMin,
  planDescription,
  setPlanDescription,
  planExercises,
  exerciseById,
  exercisesCatalog,
  updateExerciseRow,
  removeExerciseRow,
  categoryKeyByExerciseId,
  bodyPartNameById,
  categoryNameById,
  addExerciseRow,
  formError,
  setIsFormOpen,
  resetForm,
  savePlan,
  editingPlanId,
  plans,
  workoutTypeById,
  openEditForm,
  removePlan,
  setScheduleDraftsByPlan,
  setAssigningPlanId,
  assigningPlanId,
  expandedPlanId,
  setExpandedPlanId,
  removePlanAssignment,
  scheduleDraftsByPlan,
  DAYS_OF_WEEK,
  updateScheduleDraft,
  updateScheduleDraftEntry,
  addScheduleDraftEntry,
  removeScheduleDraftEntry,
  assignScheduleToPlan,
}) => {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
        </div>
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Workout
        </Button>
      </div>

      {isCoachAssignScreen && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-1 md:max-w-sm">
              <label className="text-sm font-medium">Select client</label>
              <select
                className="border-input bg-background text-foreground h-10 w-full rounded-md border px-3 text-sm"
                value={selectedClientId}
                onChange={(event) => setSelectedClientId?.(event.target.value)}
                disabled={coachClientsLoading || coachClients.length === 0}
              >
                <option value="">
                  {coachClientsLoading ? "Loading clients..." : "Select client"}
                </option>
                {coachClients.map((client) => (
                  <option key={client.client_id} value={client.client_id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {isFormOpen && (
        <Card>
          <CardContent className="space-y-4 pt-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={planTitle}
                  onChange={(event) => setPlanTitle(event.target.value)}
                  placeholder="Upper body"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Workout Type</label>
                <select
                  className="border-input bg-background text-foreground h-10 w-full rounded-md border px-3 text-sm"
                  value={planWorkoutTypeId}
                  onChange={(event) => setPlanWorkoutTypeId(event.target.value)}
                >
                  <option value="">Select type</option>
                  {(workoutTypes || []).map((type) => (
                    <option key={type.workout_type_id} value={type.workout_type_id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  value={planDurationMin}
                  onChange={(event) => setPlanDurationMin(event.target.value)}
                  placeholder="60"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={planDescription}
                  onChange={(event) => setPlanDescription(event.target.value)}
                  placeholder="Template notes..."
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Exercises</p>
              {planExercises.map((row, index) => {
                const selectedExercise = exerciseById[row.exercise_id];
                const categoryKey =
                  categoryKeyByExerciseId?.[Number(row.exercise_id)] || "other";
                return (
                  <div
                    key={`${index}-${row.workout_plan_exercise_id || "new"}`}
                    className="space-y-2 rounded-md border p-3"
                  >
                    <div className="grid grid-cols-12 gap-2">
                      <MetricField label="Exercise" className="col-span-5">
                        <select
                          className="border-input bg-background text-foreground h-10 w-full rounded-md border px-3 text-sm"
                          value={row.exercise_id}
                          onChange={(event) =>
                            updateExerciseRow(index, "exercise_id", event.target.value)
                          }
                        >
                          <option value="">Select exercise</option>
                          {(exercisesCatalog || []).map((exercise) => (
                            <option key={exercise.exercise_id} value={exercise.exercise_id}>
                              {exercise.name}
                            </option>
                          ))}
                        </select>
                      </MetricField>
                      {categoryKey === "duration" ? (
                        <MetricField label="Duration (sec)" className="col-span-2">
                          <Input
                            value={row.duration_sec}
                            placeholder="e.g. 1200"
                            onChange={(event) =>
                              updateExerciseRow(index, "duration_sec", event.target.value)
                            }
                          />
                        </MetricField>
                      ) : categoryKey === "cardio" ? (
                        <>
                          <MetricField label="Distance (miles)" className="col-span-1">
                            <Input
                              value={row.distance_m}
                              placeholder="e.g. 5000"
                              onChange={(event) =>
                                updateExerciseRow(index, "distance_m", event.target.value)
                              }
                            />
                          </MetricField>
                          <MetricField label="Pace (sec/mile)" className="col-span-1">
                            <Input
                              value={row.pace_sec_per_km}
                              placeholder="e.g. 300"
                              onChange={(event) =>
                                updateExerciseRow(index, "pace_sec_per_km", event.target.value)
                              }
                            />
                          </MetricField>
                        </>
                      ) : categoryKey === "repsOnly" ? (
                        <MetricField label="Reps" className="col-span-2">
                          <Input
                            value={row.reps}
                            placeholder="e.g. 20"
                            onChange={(event) =>
                              updateExerciseRow(index, "reps", event.target.value)
                            }
                          />
                        </MetricField>
                      ) : (
                        <>
                          <MetricField label="Sets" className="col-span-1">
                            <Input
                              value={row.sets}
                              placeholder="e.g. 4"
                              onChange={(event) =>
                                updateExerciseRow(index, "sets", event.target.value)
                              }
                            />
                          </MetricField>
                          <MetricField label="Reps" className="col-span-1">
                            <Input
                              value={row.reps}
                              placeholder="e.g. 10"
                              onChange={(event) =>
                                updateExerciseRow(index, "reps", event.target.value)
                              }
                            />
                          </MetricField>
                        </>
                      )}
                      <MetricField label="Action" className="col-span-3">
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-destructive inline-flex h-10 w-full items-center justify-center rounded-md border text-sm transition-colors"
                          onClick={() => removeExerciseRow(index)}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          Remove
                        </button>
                      </MetricField>
                    </div>
                    {selectedExercise && (
                      <p className="text-muted-foreground text-xs">
                        Body Part:{" "}
                        {selectedExercise.body_part ||
                          bodyPartNameById[selectedExercise.body_part_id] ||
                          "N/A"}{" "}
                        • Category:{" "}
                        {selectedExercise.category ||
                          categoryNameById[selectedExercise.category_id] ||
                          "N/A"}
                      </p>
                    )}
                  </div>
                );
              })}

              <Button variant="outline" onClick={addExerciseRow} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Exercise Row
              </Button>
            </div>

            {formError && <p className="text-destructive text-sm">{formError}</p>}

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={savePlan}>{editingPlanId ? "Update Plan" : "Save Plan"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {plans.map((plan) => (
          <Card key={plan.workout_plan_id}>
            <CardContent className="space-y-4 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-[220px] flex-1">
                  <h3 className="text-lg font-semibold">{plan.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {workoutTypeById[plan.workout_type_id] || "Unspecified"} •{" "}
                    {plan.duration_min || 0} min • {plan.exercises.length} exercises
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[
                      ...new Set(
                        (plan.exercises || [])
                          .map((exercise) => {
                            const catalogExercise = exerciseById[exercise.exercise_id];
                            return (
                              catalogExercise?.body_part ||
                              bodyPartNameById[catalogExercise?.body_part_id] ||
                              null
                            );
                          })
                          .filter(Boolean)
                      ),
                    ].map((bodyPart) => (
                      <span
                        key={`${plan.workout_plan_id}-${bodyPart}`}
                        className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs"
                      >
                        {bodyPart}
                      </span>
                    ))}
                    {plan.is_locked_assigned_plan && (
                      <span className="bg-destructive/15 text-destructive rounded-full px-2.5 py-1 text-xs">
                        Assigned
                      </span>
                    )}
                  </div>
                </div>
                {!plan.is_locked_assigned_plan && (
                  <Button variant="outline" onClick={() => openEditForm(plan)}>
                    Edit
                  </Button>
                )}
                {!plan.is_locked_assigned_plan && (
                  <Button variant="outline" onClick={() => removePlan(plan.workout_plan_id)}>
                    Delete
                  </Button>
                )}
                {!plan.is_locked_assigned_plan && (
                  <Button
                    variant="outline"
                    disabled={isCoachAssignScreen && !selectedClientId}
                    onClick={() => {
                      const existingDraftEntries = (plan.assignments || [])
                        .map((assignment) => {
                          const normalizedTime = String(
                            assignment?.schedule_time || "09:00"
                          )
                            .slice(0, 5)
                            .trim();
                          return {
                            day: assignment?.weekday || DAYS_OF_WEEK[0],
                            time: normalizedTime || "09:00",
                          };
                        })
                        .filter((entry) => entry.day && entry.time);

                      setScheduleDraftsByPlan((prev) => ({
                        ...prev,
                        [plan.workout_plan_id]: prev[plan.workout_plan_id] || {
                          entries:
                            existingDraftEntries.length > 0
                              ? existingDraftEntries
                              : [{ day: DAYS_OF_WEEK[0], time: "09:00" }],
                        },
                      }));
                      setAssigningPlanId((prev) =>
                        prev === plan.workout_plan_id ? null : plan.workout_plan_id
                      );
                    }}
                  >
                    {assigningPlanId === plan.workout_plan_id ? "Hide Assign" : "Assign Workout"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() =>
                    setExpandedPlanId((prev) =>
                      prev === plan.workout_plan_id ? null : plan.workout_plan_id
                    )
                  }
                >
                  {expandedPlanId === plan.workout_plan_id ? "Hide Details" : "Details"}
                </Button>
              </div>

              {(plan.assignments || []).length > 0 && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {(plan.assignments || []).map((entry, index) => (
                    <div
                      key={`${plan.workout_plan_id}-${entry.id || index}`}
                      className="bg-muted/40 border-border flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-xs"
                    >
                      <span className="font-medium">
                        {entry.weekday} {formatScheduleTime(entry.schedule_time)}
                      </span>
                      {!plan.is_locked_assigned_plan && (
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => removePlanAssignment(entry.id)}
                          disabled={!entry.id || (isCoachAssignScreen && !selectedClientId)}
                          aria-label="Delete assignment"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {assigningPlanId === plan.workout_plan_id && (
                <Card>
                  <CardContent className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2">
                    {isCoachAssignScreen ? (
                      <div className="md:col-span-2 space-y-3">
                        {(scheduleDraftsByPlan[plan.workout_plan_id]?.entries || [
                          { day: DAYS_OF_WEEK[0], time: "09:00" },
                        ]).map((entry, index) => (
                          <div
                            key={`${plan.workout_plan_id}-draft-${index}`}
                            className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]"
                          >
                            <select
                              className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                              value={entry.day || DAYS_OF_WEEK[0]}
                              onChange={(event) =>
                                updateScheduleDraftEntry(
                                  plan.workout_plan_id,
                                  index,
                                  "day",
                                  event.target.value
                                )
                              }
                            >
                              {DAYS_OF_WEEK.map((day) => (
                                <option key={day} value={day}>
                                  {day}
                                </option>
                              ))}
                            </select>
                            <Input
                              type="time"
                              value={entry.time || "09:00"}
                              onChange={(event) =>
                                updateScheduleDraftEntry(
                                  plan.workout_plan_id,
                                  index,
                                  "time",
                                  event.target.value
                                )
                              }
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => removeScheduleDraftEntry(plan.workout_plan_id, index)}
                              disabled={
                                (scheduleDraftsByPlan[plan.workout_plan_id]?.entries || []).length <=
                                1
                              }
                              className="gap-1"
                            >
                              <Minus className="h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addScheduleDraftEntry(plan.workout_plan_id)}
                          className="gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Add Day
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Weekday</label>
                          <select
                            className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                            value={
                              scheduleDraftsByPlan[plan.workout_plan_id]?.entries?.[0]?.day ||
                              DAYS_OF_WEEK[0]
                            }
                            onChange={(event) =>
                              updateScheduleDraft(
                                plan.workout_plan_id,
                                "day",
                                event.target.value
                              )
                            }
                          >
                            {DAYS_OF_WEEK.map((day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Time</label>
                          <Input
                            type="time"
                            value={
                              scheduleDraftsByPlan[plan.workout_plan_id]?.entries?.[0]?.time ||
                              "09:00"
                            }
                            onChange={(event) =>
                              updateScheduleDraft(
                                plan.workout_plan_id,
                                "time",
                                event.target.value
                              )
                            }
                          />
                        </div>
                      </>
                    )}
                    <div className="md:col-span-2 flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setAssigningPlanId(null)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => assignScheduleToPlan(plan.workout_plan_id)}
                        disabled={isCoachAssignScreen && !selectedClientId}
                      >
                        Submit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {expandedPlanId === plan.workout_plan_id && (
                <div className="space-y-2 rounded-md border p-3">
                  <div className="bg-primary/10 border-primary/20 rounded-md border px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wide">Description</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {plan.description || "No description provided."}
                    </p>
                  </div>
                  <p className="text-sm font-medium">Exercises in this plan</p>
                  {plan.exercises.length > 0 ? (
                    plan.exercises.map((exercise) => (
                      <div
                        key={exercise.workout_plan_exercise_id}
                        className="bg-muted/40 rounded-md px-3 py-2 text-sm"
                      >
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          •{" "}
                          {(() => {
                            const categoryKey =
                              categoryKeyByExerciseId?.[Number(exercise.exercise_id)] || "other";
                            if (categoryKey === "duration") {
                              return `duration: ${exercise.duration_sec ?? "-"} sec`;
                            }
                            if (categoryKey === "cardio") {
                              return `distance: ${exercise.distance_m ?? "-"} miles • pace: ${
                                exercise.pace_sec_per_km ?? "-"
                              } sec/mile`;
                            }
                            if (categoryKey === "repsOnly") {
                              return `reps: ${exercise.reps ?? "-"}`;
                            }
                            return `sets: ${exercise.sets ?? "-"} • reps: ${exercise.reps ?? "-"}`;
                          })()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No exercises added yet.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {plans.length === 0 && (
          <Card>
            <CardContent className="text-muted-foreground p-6 text-center">
              No plans yet for this user.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WorkoutPlansTab;
