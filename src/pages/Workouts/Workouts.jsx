import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import useGetFromAPI from "@/hooks/useGetFromAPI";
import usePostToAPI from "@/hooks/usePostToAPI";
import usePatchToAPI from "@/hooks/usePatchToAPI";
import useDeleteFromAPI from "@/hooks/useDeleteFromAPI";
import usePutToAPI from "@/hooks/usePutToAPI";
import { API_BASE_URL } from "../../../config.js";
import { getAuthHeader } from "@/lib/authHeader";
import { auth } from "@/firebase";

const TABS = {
  PLANS: "plans",
  BANK: "bank",
  LOG: "log",
  HISTORY: "history",
};
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const emptyExerciseRow = {
  workout_plan_exercise_id: null,
  exercise_id: "",
  sets: "",
  reps: "",
};

const emptyLogRow = {
  exercise: "",
  sets: "",
  reps: "",
  lbs: "",
};

const Workouts = () => {
  const { user } = useOutletContext();
  const userId = user?.user_id;

  const [activeTab, setActiveTab] = useState(TABS.PLANS);
  const [plansRefreshKey, setPlansRefreshKey] = useState(0);
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const [assigningPlanId, setAssigningPlanId] = useState(null);
  const [scheduleDraftsByPlan, setScheduleDraftsByPlan] = useState({});
  const [bankBodyPartFilter, setBankBodyPartFilter] = useState("All");
  const [bankCategoryFilter, setBankCategoryFilter] = useState("All");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [planTitle, setPlanTitle] = useState("");
  const [planWorkoutTypeId, setPlanWorkoutTypeId] = useState("");
  const [planDurationMin, setPlanDurationMin] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planExercises, setPlanExercises] = useState([{ ...emptyExerciseRow }]);
  const [deletedPlanExerciseIds, setDeletedPlanExerciseIds] = useState([]);
  const [formError, setFormError] = useState("");
  const [selectedPlanToLoad, setSelectedPlanToLoad] = useState("");
  const [logRows, setLogRows] = useState([
    { exercise: "Bench Press", sets: "3", reps: "10", lbs: "135" },
  ]);
  const [logDuration, setLogDuration] = useState("");
  const [mood, setMood] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");

  const { postFunction } = usePostToAPI();
  const { patchFunction } = usePatchToAPI();
  const { putFunction } = usePutToAPI();
  const { deleteFunction } = useDeleteFromAPI();

  const { data: workoutTypes } = useGetFromAPI("/workout-types", null);
  const { data: exercisesCatalog } = useGetFromAPI("/exercises", null);
  const { data: bodyParts } = useGetFromAPI("/body-parts", null);
  const { data: exerciseCategories } = useGetFromAPI("/exercise-categories", null);
  const { data: plansData } = useGetFromAPI(
    "/workout-plans?created_by=me",
    plansRefreshKey
  );
  const { data: workoutsData } = useGetFromAPI(
    userId ? `/workouts?user_id=${userId}` : null,
    userId || null
  );

  useEffect(() => {
    const logWorkoutDebugIdentity = async () => {
      const firebaseUser = auth.currentUser;
      const firebaseUid = firebaseUser?.uid || user?.firebase_uid || user?.uid || null;
      const authToken = firebaseUser ? await firebaseUser.getIdToken() : null;

      console.log("[Workouts Debug] Auth Token:", authToken);
      console.log("[Workouts Debug] Firebase UID:", firebaseUid);
      console.log("[Workouts Debug] /users/me DB user_id:", user?.user_id || null);
    };

    logWorkoutDebugIdentity().catch((error) => {
      console.log("[Workouts Debug] Failed to log identity info:", error);
    });
  }, [user]);

  const [planDetailsById, setPlanDetailsById] = useState({});

  useEffect(() => {
    const loadPlanDetails = async () => {
      if (!Array.isArray(plansData) || plansData.length === 0) {
        setPlanDetailsById({});
        return;
      }

      const details = {};
      await Promise.all(
        plansData.map(async (plan) => {
          try {
            const result = await fetchPlanDetail(plan.workout_plan_id);
            if (result) details[plan.workout_plan_id] = result;
          } catch {
            // keep page usable even if one detail fetch fails
          }
        })
      );
      setPlanDetailsById(details);
    };

    loadPlanDetails();
  }, [plansData]);

  const bodyPartNameById = useMemo(() => {
    if (!Array.isArray(bodyParts)) return {};
    return bodyParts.reduce((acc, part) => {
      acc[part.body_part_id] = part.name;
      return acc;
    }, {});
  }, [bodyParts]);

  const categoryNameById = useMemo(() => {
    if (!Array.isArray(exerciseCategories)) return {};
    return exerciseCategories.reduce((acc, category) => {
      acc[category.category_id] = category.name;
      return acc;
    }, {});
  }, [exerciseCategories]);

  const exerciseById = useMemo(() => {
    if (!Array.isArray(exercisesCatalog)) return {};
    return exercisesCatalog.reduce((acc, exercise) => {
      acc[exercise.exercise_id] = exercise;
      return acc;
    }, {});
  }, [exercisesCatalog]);

  const workoutTypeById = useMemo(() => {
    if (!Array.isArray(workoutTypes)) return {};
    return workoutTypes.reduce((acc, type) => {
      acc[type.workout_type_id] = type.name;
      return acc;
    }, {});
  }, [workoutTypes]);

  const bodyPartOptions = useMemo(() => {
    const options = (exercisesCatalog || [])
      .map(
        (exercise) =>
          exercise.body_part || bodyPartNameById[exercise.body_part_id] || null
      )
      .filter(Boolean);
    return ["All", ...new Set(options)];
  }, [exercisesCatalog, bodyPartNameById]);

  const categoryOptions = useMemo(() => {
    const options = (exercisesCatalog || [])
      .map(
        (exercise) =>
          exercise.category || categoryNameById[exercise.category_id] || null
      )
      .filter(Boolean);
    return ["All", ...new Set(options)];
  }, [exercisesCatalog, categoryNameById]);

  const filteredExerciseBank = useMemo(() => {
    return (exercisesCatalog || []).filter((exercise) => {
      const bodyPart =
        exercise.body_part || bodyPartNameById[exercise.body_part_id] || "N/A";
      const category =
        exercise.category || categoryNameById[exercise.category_id] || "N/A";
      const bodyPartMatch =
        bankBodyPartFilter === "All" || bodyPart === bankBodyPartFilter;
      const categoryMatch =
        bankCategoryFilter === "All" || category === bankCategoryFilter;
      return bodyPartMatch && categoryMatch;
    });
  }, [
    exercisesCatalog,
    bodyPartNameById,
    categoryNameById,
    bankBodyPartFilter,
    bankCategoryFilter,
  ]);

  const plans = useMemo(() => {
    if (!Array.isArray(plansData)) return [];
    return plansData.map((plan) => {
      const detail = planDetailsById[plan.workout_plan_id];
      const detailExercises = Array.isArray(detail?.exercises) ? detail.exercises : [];
      return {
        workout_plan_id: plan.workout_plan_id,
        title: detail?.title || plan.title || "",
        description: detail?.description || "",
        duration_min:
          detail?.duration_min === 0 || detail?.duration_min
            ? detail.duration_min
            : plan.duration_min || 0,
        workout_type_id: detail?.workout_type_id ?? null,
        created_by: detail?.created_by || plan.created_by || null,
        exercises: detailExercises,
        assignments: Array.isArray(detail?.assignments) ? detail.assignments : [],
      };
    });
  }, [plansData, planDetailsById]);

  const todayWeekday = useMemo(
    () => new Date().toLocaleDateString("en-US", { weekday: "long" }),
    []
  );

  const todaysScheduledWorkouts = useMemo(() => {
    return plans.flatMap((plan) =>
      (plan.assignments || [])
        .filter(
          (assignment) =>
            (assignment.weekday || "").toLowerCase() === todayWeekday.toLowerCase()
        )
        .map((assignment, index) => ({
          workout_id: `${plan.workout_plan_id}-${assignment.id || index}`,
          workout_plan_id: plan.workout_plan_id,
          title: plan.title,
          schedule_time: assignment.schedule_time || "Time TBD",
        }))
    );
  }, [plans, todayWeekday]);

  const hasWorkoutScheduledToday = todaysScheduledWorkouts.length > 0;

  const updateLogRow = (index, key, value) => {
    setLogRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row
      )
    );
  };

  const addLogRow = () => {
    setLogRows((prev) => [...prev, { ...emptyLogRow }]);
  };

  const removeLogRow = (index) => {
    setLogRows((prev) => prev.filter((_, i) => i !== index));
  };

  const loadPlanIntoLog = (planId) => {
    if (!planId) return;
    const selectedPlan = plans.find(
      (plan) => String(plan.workout_plan_id) === String(planId)
    );
    if (!selectedPlan) return;
    const mappedRows = (selectedPlan.exercises || []).map((exercise) => ({
      exercise: exercise.name || "",
      sets: exercise.sets ? String(exercise.sets) : "",
      reps: exercise.reps ? String(exercise.reps) : "",
      lbs: exercise.weight ? String(exercise.weight) : "",
    }));
    setLogRows(mappedRows.length > 0 ? mappedRows : [{ ...emptyLogRow }]);
    setLogDuration(
      selectedPlan.duration_min === 0 || selectedPlan.duration_min
        ? String(selectedPlan.duration_min)
        : ""
    );
  };

  const updateScheduleDraft = (planId, key, value) => {
    setScheduleDraftsByPlan((prev) => ({
      ...prev,
      [planId]: {
        ...(prev[planId] || { day: DAYS_OF_WEEK[0], time: "09:00" }),
        [key]: value,
      },
    }));
  };

  const assignScheduleToPlan = async (planId) => {
    const draft = scheduleDraftsByPlan[planId];
    if (!draft?.day || !draft?.time) return;
    const scheduleTime = draft.time.length === 5 ? `${draft.time}:00` : draft.time;
    try {
      await postFunction(`/workout-plans/${planId}/assignments`, {
        weekday: draft.day,
        schedule_time: scheduleTime,
      });
      setAssigningPlanId(null);
      setPlansRefreshKey((prev) => prev + 1);
    } catch (error) {
      setFormError(error?.message || "Failed to assign workout.");
    }
  };

  const removePlanAssignment = async (assignmentId) => {
    if (!assignmentId) return;
    try {
      await deleteFunction(`/workout-plan-assignments/${assignmentId}`);
      setPlansRefreshKey((prev) => prev + 1);
    } catch (error) {
      setFormError(error?.message || "Failed to delete assignment.");
    }
  };

  const resetForm = () => {
    setEditingPlanId(null);
    setPlanTitle("");
    setPlanWorkoutTypeId("");
    setPlanDurationMin("");
    setPlanDescription("");
    setPlanExercises([{ ...emptyExerciseRow }]);
    setDeletedPlanExerciseIds([]);
    setFormError("");
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (plan) => {
    setEditingPlanId(plan.workout_plan_id);
    setPlanTitle(plan.title || "");
    setPlanWorkoutTypeId(
      plan.workout_type_id === 0 || plan.workout_type_id
        ? String(plan.workout_type_id)
        : ""
    );
    setPlanDurationMin(
      plan.duration_min === 0 || plan.duration_min ? String(plan.duration_min) : ""
    );
    setPlanDescription(plan.description || "");
    setPlanExercises(
      plan.exercises?.length
        ? plan.exercises.map((exercise) => ({
            workout_plan_exercise_id: exercise.workout_plan_exercise_id || null,
            exercise_id: exercise.exercise_id ? String(exercise.exercise_id) : "",
            sets:
              exercise.sets === 0 || exercise.sets ? String(exercise.sets) : "",
            reps:
              exercise.reps === 0 || exercise.reps ? String(exercise.reps) : "",
          }))
        : [{ ...emptyExerciseRow }]
    );
    setDeletedPlanExerciseIds([]);
    setFormError("");
    setIsFormOpen(true);
  };

  const updateExerciseRow = (index, key, value) => {
    setPlanExercises((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row
      )
    );
  };

  const addExerciseRow = () => {
    setPlanExercises((prev) => [...prev, { ...emptyExerciseRow }]);
  };

  const removeExerciseRow = (index) => {
    setPlanExercises((prev) => {
      const rowToRemove = prev[index];
      if (rowToRemove?.workout_plan_exercise_id) {
        setDeletedPlanExerciseIds((ids) => [
          ...new Set([...ids, rowToRemove.workout_plan_exercise_id]),
        ]);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const savePlan = async () => {
    const trimmedTitle = planTitle.trim();
    if (!trimmedTitle) {
      setFormError("Plan title is required.");
      return;
    }

    const cleanedRows = planExercises.filter((row) => row.exercise_id);
    const payload = {
      title: trimmedTitle,
      workout_type_id: planWorkoutTypeId ? Number(planWorkoutTypeId) : null,
      description: planDescription.trim() || null,
      duration_min: planDurationMin ? Number(planDurationMin) : null,
      created_by: userId || undefined,
    };

    try {
      if (!editingPlanId) {
        const created = await postFunction("/workout-plans", payload);
        const newPlanId = created?.workout_plan_id;
        if (newPlanId && cleanedRows.length > 0) {
          await postFunction(`/workout-plans/${newPlanId}/exercises`, {
            exercises: cleanedRows.map((row, index) => ({
              exercise_id: Number(row.exercise_id),
              position: index,
              sets: row.sets ? Number(row.sets) : undefined,
              reps: row.reps ? Number(row.reps) : undefined,
            })),
          });
        }
      } else {
        await patchFunction(`/workout-plans/${editingPlanId}`, payload);

        if (deletedPlanExerciseIds.length > 0) {
          await Promise.all(
            deletedPlanExerciseIds.map((rowId) =>
              deleteFunction(`/workout-plan-exercises/${rowId}`)
            )
          );
        }

        const existingRows = cleanedRows.filter((row) => row.workout_plan_exercise_id);
        const newRows = cleanedRows.filter((row) => !row.workout_plan_exercise_id);

        await Promise.all(
          existingRows.map((row, index) =>
            putFunction(`/workout-plan-exercises/${row.workout_plan_exercise_id}`, {
              exercise_id: Number(row.exercise_id),
              position: index,
              sets: row.sets ? Number(row.sets) : undefined,
              reps: row.reps ? Number(row.reps) : undefined,
            })
          )
        );

        if (newRows.length > 0) {
          await postFunction(`/workout-plans/${editingPlanId}/exercises`, {
            exercises: newRows.map((row, index) => ({
              exercise_id: Number(row.exercise_id),
              position: existingRows.length + index,
              sets: row.sets ? Number(row.sets) : undefined,
              reps: row.reps ? Number(row.reps) : undefined,
            })),
          });
        }
      }

      setIsFormOpen(false);
      resetForm();
      setPlansRefreshKey((prev) => prev + 1);
    } catch (error) {
      setFormError(error?.message || "Failed to save workout plan.");
    }
  };

  const removePlan = async (planId) => {
    try {
      await deleteFunction(`/workout-plans/${planId}`);
      if (editingPlanId === planId) {
        setIsFormOpen(false);
        resetForm();
      }
      setPlansRefreshKey((prev) => prev + 1);
    } catch (error) {
      setFormError(error?.message || "Failed to delete workout plan.");
    }
  };

  async function fetchPlanDetail(planId) {
    const response = await fetch(`${API_BASE_URL}/workout-plans/${planId}`, {
      headers: {
        ...(await getAuthHeader()),
      },
    });
    if (!response.ok) return null;
    return response.json();
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="border-border bg-card inline-flex rounded-xl border p-1">
        <button
          type="button"
          onClick={() => setActiveTab(TABS.PLANS)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === TABS.PLANS
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Workout Plans
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(TABS.BANK)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === TABS.BANK
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Exercise Bank
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(TABS.HISTORY)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === TABS.HISTORY
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Workout History
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(TABS.LOG)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === TABS.LOG
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Log Workout
        </button>
      </div>

      {activeTab === TABS.PLANS && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold">Create and Manage Workout Plans</h1>
            </div>
            <Button onClick={openCreateForm} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Workout
            </Button>
          </div>

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
                        <option
                          key={type.workout_type_id}
                          value={type.workout_type_id}
                        >
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
                    return (
                      <div
                        key={`${index}-${row.workout_plan_exercise_id || "new"}`}
                        className="space-y-2 rounded-md border p-3"
                      >
                        <div className="grid grid-cols-12 gap-2">
                          <select
                            className="border-input bg-background col-span-5 h-10 rounded-md border px-3 text-sm"
                            value={row.exercise_id}
                            onChange={(event) =>
                              updateExerciseRow(index, "exercise_id", event.target.value)
                            }
                          >
                            <option value="">Select exercise</option>
                            {(exercisesCatalog || []).map((exercise) => (
                              <option
                                key={exercise.exercise_id}
                                value={exercise.exercise_id}
                              >
                                {exercise.name}
                              </option>
                            ))}
                          </select>
                          <Input
                            className="col-span-2"
                            value={row.sets}
                            placeholder="Sets"
                            onChange={(event) =>
                              updateExerciseRow(index, "sets", event.target.value)
                            }
                          />
                          <Input
                            className="col-span-2"
                            value={row.reps}
                            placeholder="Reps"
                            onChange={(event) =>
                              updateExerciseRow(index, "reps", event.target.value)
                            }
                          />
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-destructive col-span-3 inline-flex items-center justify-center rounded-md border text-sm transition-colors"
                            onClick={() => removeExerciseRow(index)}
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Remove
                          </button>
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
                  <Button onClick={savePlan}>
                    {editingPlanId ? "Update Plan" : "Save Plan"}
                  </Button>
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
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => openEditForm(plan)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => removePlan(plan.workout_plan_id)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setScheduleDraftsByPlan((prev) => ({
                          ...prev,
                          [plan.workout_plan_id]: prev[plan.workout_plan_id] || {
                            day: DAYS_OF_WEEK[0],
                            time: "09:00",
                          },
                        }));
                        setAssigningPlanId((prev) =>
                          prev === plan.workout_plan_id ? null : plan.workout_plan_id
                        );
                      }}
                    >
                      {assigningPlanId === plan.workout_plan_id
                        ? "Hide Assign"
                        : "Assign Workout"}
                    </Button>
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
                          <span className="font-medium">{entry.weekday}</span>
                          <span className="text-muted-foreground">{entry.schedule_time}</span>
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => removePlanAssignment(entry.id)}
                            disabled={!entry.id}
                            aria-label="Delete assignment"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {assigningPlanId === plan.workout_plan_id && (
                    <Card>
                      <CardContent className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Weekday</label>
                          <select
                            className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                            value={
                              scheduleDraftsByPlan[plan.workout_plan_id]?.day ||
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
                              scheduleDraftsByPlan[plan.workout_plan_id]?.time || "09:00"
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
                        <div className="md:col-span-2 flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setAssigningPlanId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => assignScheduleToPlan(plan.workout_plan_id)}
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
                        <p className="text-xs font-semibold uppercase tracking-wide">
                          Description
                        </p>
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
                              • sets: {exercise.sets ?? "-"} • reps: {exercise.reps ?? "-"}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No exercises added yet.
                        </p>
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
      )}

      {activeTab === TABS.BANK && (
        <div className="space-y-5">
          <div>
            <h1 className="text-3xl font-bold">Exercise Bank</h1>
          </div>
          <Card>
            <CardContent className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Muscle Group</label>
                <select
                  className="border-input bg-background text-foreground h-10 w-full rounded-md border px-3 text-sm"
                  value={bankBodyPartFilter}
                  onChange={(event) => setBankBodyPartFilter(event.target.value)}
                >
                  {bodyPartOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Category</label>
                <select
                  className="border-input bg-background text-foreground h-10 w-full rounded-md border px-3 text-sm"
                  value={bankCategoryFilter}
                  onChange={(event) => setBankCategoryFilter(event.target.value)}
                >
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredExerciseBank.map((exercise) => (
              <Card key={exercise.exercise_id}>
                <CardContent className="space-y-2 p-4">
                  <h3 className="text-lg font-semibold">{exercise.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs">
                      Body Part:{" "}
                      {exercise.body_part ||
                        bodyPartNameById[exercise.body_part_id] ||
                        "N/A"}
                    </span>
                    <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs">
                      Category:{" "}
                      {exercise.category ||
                        categoryNameById[exercise.category_id] ||
                        "N/A"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredExerciseBank.length === 0 && (
            <Card>
              <CardContent className="text-muted-foreground p-6 text-center">
                No exercises match the selected filters.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === TABS.HISTORY && (
        <div className="space-y-5">
          <div>
            <h1 className="text-3xl font-bold">Workout History</h1>
          </div>
          <Card>
            <CardContent className="space-y-3 p-4">
              {(workoutsData || []).map((workout) => (
                <div
                  key={workout.workout_id}
                  className="flex flex-wrap items-center gap-3 rounded-md border p-3"
                >
                  <div className="min-w-[220px] flex-1">
                    <p className="font-semibold">{workout.title}</p>
                    <p className="text-muted-foreground text-sm">
                      {workout.schedule_weekday || "Unscheduled"} •{" "}
                      {workout.schedule_time || "Time TBD"}
                    </p>
                  </div>
                  <span className="text-muted-foreground text-sm">
                    #{workout.workout_id}
                  </span>
                </div>
              ))}
              {(!workoutsData || workoutsData.length === 0) && (
                <p className="text-muted-foreground text-sm">
                  No workouts logged yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === TABS.LOG && (
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
                        onChange={(event) =>
                          updateLogRow(index, "exercise", event.target.value)
                        }
                      />
                      <Input
                        className="col-span-2"
                        value={row.sets}
                        onChange={(event) =>
                          updateLogRow(index, "sets", event.target.value)
                        }
                      />
                      <Input
                        className="col-span-2"
                        value={row.reps}
                        onChange={(event) =>
                          updateLogRow(index, "reps", event.target.value)
                        }
                      />
                      <Input
                        className="col-span-2"
                        value={row.lbs}
                        onChange={(event) =>
                          updateLogRow(index, "lbs", event.target.value)
                        }
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
                    <p className="text-muted-foreground text-sm font-medium">
                      Duration (minutes)
                    </p>
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
      )}
    </div>
  );
};

export default Workouts;
