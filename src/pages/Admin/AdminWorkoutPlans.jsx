import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import useGetFromAPI from "@/hooks/useGetFromAPI";
import usePostToAPI from "@/hooks/usePostToAPI";
import usePatchToAPI from "@/hooks/usePatchToAPI";
import useDeleteFromAPI from "@/hooks/useDeleteFromAPI";
import usePutToAPI from "@/hooks/usePutToAPI";
import WorkoutPlansTab from "@/pages/Workouts/tabs/WorkoutPlansTab";
import { API_BASE_URL } from "../../../config.js";
import { getAuthHeader } from "@/lib/authHeader";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const CATEGORY_KEYS = {
  DURATION: "duration",
  CARDIO: "cardio",
  REPS_ONLY: "repsOnly",
  OTHER: "other",
};

const normalizeCategoryName = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const resolveCategoryKey = (exercise, categoryNameById) => {
  const categoryName = normalizeCategoryName(
    exercise?.category || categoryNameById?.[exercise?.category_id]
  );

  if (categoryName === "duration") return CATEGORY_KEYS.DURATION;
  if (categoryName === "cardio") return CATEGORY_KEYS.CARDIO;
  if (categoryName === "reps only") return CATEGORY_KEYS.REPS_ONLY;
  return CATEGORY_KEYS.OTHER;
};

const emptyExerciseRow = {
  workout_plan_exercise_id: null,
  exercise_id: "",
  sets: "",
  reps: "",
  duration_sec: "",
  distance_m: "",
  pace_sec_per_km: "",
};

const MAX_LIMITS = {
  DURATION_MIN: 1440,
  DURATION_SEC: 86400,
  SETS: 100,
  REPS: 1000,
  WEIGHT: 2000,
  DISTANCE: 1000,
  PACE: 3600,
};

const parseOptionalNumberStrict = (
  value,
  { integer = false, min = 0, max } = {}
) => {
  if (value === null || value === undefined || value === "") {
    return { provided: false, valid: true, parsed: undefined };
  }
  const raw = String(value).trim();
  const pattern = integer ? /^\d+$/ : /^\d+(\.\d+)?$/;
  if (!pattern.test(raw)) {
    return { provided: true, valid: false, parsed: undefined };
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return { provided: true, valid: false, parsed: undefined };
  }
  if (parsed < min) {
    return { provided: true, valid: false, parsed: undefined };
  }
  if (max !== undefined && parsed > max) {
    return { provided: true, valid: false, parsed: undefined };
  }
  return { provided: true, valid: true, parsed };
};

const parseNumberOrUndefined = (value) => {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
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

/** Admin-only CRUD for global workout templates (`created_by` null); no scheduling/assign UX. */
export default function AdminWorkoutPlans() {
  const [plansRefreshKey, setPlansRefreshKey] = useState(0);
  const [expandedPlanId, setExpandedPlanId] = useState(null);

  /** Stubs satisfy WorkoutPlansTab props when scheduling UI is hidden. */
  const [assigningPlanId, setAssigningPlanId] = useState(null);
  const [scheduleDraftsByPlan, setScheduleDraftsByPlan] = useState({});

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [planTitle, setPlanTitle] = useState("");
  const [planWorkoutTypeId, setPlanWorkoutTypeId] = useState("");
  const [planDurationMin, setPlanDurationMin] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planExercises, setPlanExercises] = useState([{ ...emptyExerciseRow }]);
  const [deletedPlanExerciseIds, setDeletedPlanExerciseIds] = useState([]);
  const [formError, setFormError] = useState("");

  const { postFunction } = usePostToAPI();
  const { patchFunction } = usePatchToAPI();
  const { putFunction } = usePutToAPI();
  const { deleteFunction } = useDeleteFromAPI();

  const { data: workoutTypes, loading: workoutTypesLoading } = useGetFromAPI(
    "/workout-types",
    null
  );
  const { data: exercisesCatalog, loading: exercisesCatalogLoading } =
    useGetFromAPI("/exercises", null);
  const { data: bodyParts, loading: bodyPartsLoading } = useGetFromAPI(
    "/body-parts",
    null
  );
  const { data: exerciseCategories, loading: exerciseCategoriesLoading } =
    useGetFromAPI("/exercise-categories", null);

  /** Admin-only catalog: `GET /workout-plans/global` (shared templates, `created_by` null). */
  const { data: plansData, loading: plansLoading } = useGetFromAPI(
    "/workout-plans/global",
    plansRefreshKey
  );

  const [planDetailsById, setPlanDetailsById] = useState({});
  const [planDetailsLoading, setPlanDetailsLoading] = useState(false);

  useLayoutEffect(() => {
    if (Array.isArray(plansData) && plansData.length > 0) {
      setPlanDetailsLoading(true);
    }
  }, [plansData]);

  useEffect(() => {
    const loadPlanDetails = async () => {
      setPlanDetailsLoading(true);
      if (!Array.isArray(plansData) || plansData.length === 0) {
        setPlanDetailsById({});
        setPlanDetailsLoading(false);
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
      setPlanDetailsLoading(false);
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

  const categoryKeyByExerciseId = useMemo(() => {
    if (!Array.isArray(exercisesCatalog)) return {};
    return exercisesCatalog.reduce((acc, exercise) => {
      acc[exercise.exercise_id] = resolveCategoryKey(exercise, categoryNameById);
      return acc;
    }, {});
  }, [exercisesCatalog, categoryNameById]);

  const plans = useMemo(() => {
    if (!Array.isArray(plansData)) return [];
    const rows = [];

    plansData.forEach((plan) => {
      const detail = planDetailsById[plan.workout_plan_id];
      const detailExercises =
        detail && Array.isArray(detail.exercises) ? detail.exercises : [];
      const baseAssignments =
        detail && Array.isArray(detail.assignments) ? detail.assignments : [];

      rows.push({
        workout_plan_id: plan.workout_plan_id,
        title: detail?.title ?? plan.title ?? "",
        description: detail?.description ?? "",
        duration_min:
          detail?.duration_min === 0 || detail?.duration_min != null
            ? detail.duration_min
            : plan.duration_min ?? 0,
        workout_type_id: detail
          ? detail.workout_type_id ?? null
          : plan.workout_type_id ?? null,
        created_by: plan.created_by ?? detail?.created_by ?? null,
        is_created_by_user: false,
        is_assigned_to_user: false,
        is_locked_assigned_plan: false,
        exercises: detailExercises,
        assignments: baseAssignments,
      });
    });

    return rows.sort((a, b) =>
      String(a.title || "").localeCompare(String(b.title || ""))
    );
  }, [plansData, planDetailsById]);

  const isWorkoutPlansTabLoading =
    plansLoading ||
    planDetailsLoading ||
    workoutTypesLoading ||
    exercisesCatalogLoading ||
    bodyPartsLoading ||
    exerciseCategoriesLoading;

  const noop = () => {};
  const noopAsync = async () => {};

  const resetPlanFormFields = () => {
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
    resetPlanFormFields();
    setIsFormOpen(true);
  };

  const validateMetricRow = (row, exerciseMeta) => {
    const categoryKey = resolveCategoryKey(exerciseMeta, categoryNameById);

    const validateField = (
      fieldValue,
      fieldName,
      { integer = false, max } = {}
    ) => {
      const result = parseOptionalNumberStrict(fieldValue, {
        integer,
        min: 0,
        max,
      });
      if (!result.valid) {
        return `${fieldName} must be a valid ${integer ? "integer" : "number"}${
          max !== undefined ? ` between 0 and ${max}` : ""
        }.`;
      }
      return null;
    };

    if (categoryKey === CATEGORY_KEYS.DURATION) {
      return validateField(row.duration_sec, "Duration (sec)", {
        integer: true,
        max: MAX_LIMITS.DURATION_SEC,
      });
    }
    if (categoryKey === CATEGORY_KEYS.CARDIO) {
      return (
        validateField(row.distance_m, "Distance", {
          integer: false,
          max: MAX_LIMITS.DISTANCE,
        }) ||
        validateField(row.pace_sec_per_km, "Pace", {
          integer: false,
          max: MAX_LIMITS.PACE,
        })
      );
    }
    if (categoryKey === CATEGORY_KEYS.REPS_ONLY) {
      return validateField(row.reps, "Reps", {
        integer: true,
        max: MAX_LIMITS.REPS,
      });
    }

    return (
      validateField(row.sets, "Sets", {
        integer: true,
        max: MAX_LIMITS.SETS,
      }) ||
      validateField(row.reps, "Reps", {
        integer: true,
        max: MAX_LIMITS.REPS,
      })
    );
  };

  const buildMetricPayload = (row, exerciseMeta) => {
    const categoryKey = resolveCategoryKey(exerciseMeta, categoryNameById);
    const payload = {};

    if (categoryKey === CATEGORY_KEYS.DURATION) {
      payload.duration_sec = parseNumberOrUndefined(row.duration_sec);
    } else if (categoryKey === CATEGORY_KEYS.CARDIO) {
      payload.distance_m = parseNumberOrUndefined(row.distance_m);
      payload.pace_sec_per_km = parseNumberOrUndefined(row.pace_sec_per_km);
    } else if (categoryKey === CATEGORY_KEYS.REPS_ONLY) {
      payload.reps = parseNumberOrUndefined(row.reps);
    } else {
      payload.sets = parseNumberOrUndefined(row.sets);
      payload.reps = parseNumberOrUndefined(row.reps);
    }

    return Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );
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
      plan.duration_min === 0 || plan.duration_min
        ? String(plan.duration_min)
        : ""
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
            duration_sec:
              exercise.duration_sec === 0 || exercise.duration_sec
                ? String(exercise.duration_sec)
                : "",
            distance_m:
              exercise.distance_m === 0 || exercise.distance_m
                ? String(exercise.distance_m)
                : "",
            pace_sec_per_km:
              exercise.pace_sec_per_km === 0 || exercise.pace_sec_per_km
                ? String(exercise.pace_sec_per_km)
                : "",
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

    const durationValidation = parseOptionalNumberStrict(planDurationMin, {
      integer: true,
      min: 0,
      max: MAX_LIMITS.DURATION_MIN,
    });
    if (!durationValidation.valid) {
      setFormError(
        `Plan duration must be a valid integer between 0 and ${MAX_LIMITS.DURATION_MIN}.`
      );
      return;
    }

    const cleanedRows = planExercises.filter((row) => row.exercise_id);
    for (let index = 0; index < cleanedRows.length; index += 1) {
      const row = cleanedRows[index];
      const exerciseMeta = exerciseById[row.exercise_id];
      const validationError = validateMetricRow(row, exerciseMeta);
      if (validationError) {
        setFormError(`Exercise row ${index + 1}: ${validationError}`);
        return;
      }
    }

    const basePayload = {
      title: trimmedTitle,
      workout_type_id: planWorkoutTypeId ? Number(planWorkoutTypeId) : null,
      description: planDescription.trim() || null,
      duration_min: planDurationMin ? Number(planDurationMin) : null,
    };

    try {
      if (!editingPlanId) {
        const created = await postFunction("/workout-plans/global", basePayload);
        const newPlanId = created?.workout_plan_id;
        if (newPlanId && cleanedRows.length > 0) {
          await postFunction(`/workout-plans/${newPlanId}/exercises`, {
            exercises: cleanedRows.map((row, index) => ({
              exercise_id: Number(row.exercise_id),
              position: index,
              ...buildMetricPayload(row, exerciseById[row.exercise_id]),
            })),
          });
        }
      } else {
        await patchFunction(`/workout-plans/${editingPlanId}`, basePayload);

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
              ...buildMetricPayload(row, exerciseById[row.exercise_id]),
            })
          )
        );

        if (newRows.length > 0) {
          await postFunction(`/workout-plans/${editingPlanId}/exercises`, {
            exercises: newRows.map((row, index) => ({
              exercise_id: Number(row.exercise_id),
              position: existingRows.length + index,
              ...buildMetricPayload(row, exerciseById[row.exercise_id]),
            })),
          });
        }
      }

      setIsFormOpen(false);
      resetPlanFormFields();
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
        resetPlanFormFields();
      }
      setPlansRefreshKey((prev) => prev + 1);
    } catch (error) {
      setFormError(error?.message || "Failed to delete workout plan.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <WorkoutPlansTab
        pageTitle="Global workout templates"
        emptyListMessage="No global workout templates yet. Create one to get started."
        isLoading={isWorkoutPlansTabLoading}
        isCoachAssignScreen={false}
        coachClients={[]}
        coachClientsLoading={false}
        selectedClientId=""
        setSelectedClientId={noop}
        openCreateForm={openCreateForm}
        isFormOpen={isFormOpen}
        planTitle={planTitle}
        setPlanTitle={setPlanTitle}
        planWorkoutTypeId={planWorkoutTypeId}
        setPlanWorkoutTypeId={setPlanWorkoutTypeId}
        workoutTypes={workoutTypes}
        planDurationMin={planDurationMin}
        setPlanDurationMin={setPlanDurationMin}
        planDescription={planDescription}
        setPlanDescription={setPlanDescription}
        planExercises={planExercises}
        exerciseById={exerciseById}
        exercisesCatalog={exercisesCatalog}
        updateExerciseRow={updateExerciseRow}
        removeExerciseRow={removeExerciseRow}
        categoryKeyByExerciseId={categoryKeyByExerciseId}
        bodyPartNameById={bodyPartNameById}
        categoryNameById={categoryNameById}
        addExerciseRow={addExerciseRow}
        formError={formError}
        setIsFormOpen={setIsFormOpen}
        resetForm={() => {
          resetPlanFormFields();
          setIsFormOpen(false);
        }}
        savePlan={savePlan}
        editingPlanId={editingPlanId}
        plans={plans}
        workoutTypeById={workoutTypeById}
        openEditForm={openEditForm}
        removePlan={removePlan}
        setScheduleDraftsByPlan={setScheduleDraftsByPlan}
        setAssigningPlanId={setAssigningPlanId}
        assigningPlanId={assigningPlanId}
        expandedPlanId={expandedPlanId}
        setExpandedPlanId={setExpandedPlanId}
        removePlanAssignment={noopAsync}
        scheduleDraftsByPlan={scheduleDraftsByPlan}
        DAYS_OF_WEEK={DAYS_OF_WEEK}
        updateScheduleDraft={noop}
        updateScheduleDraftEntry={noop}
        addScheduleDraftEntry={noop}
        removeScheduleDraftEntry={noop}
        assignScheduleToPlan={noopAsync}
        allowAssignments={false}
        globalTemplateManagementMode={true}
      />
    </div>
  );
}
