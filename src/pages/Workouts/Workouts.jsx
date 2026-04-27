import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import useGetFromAPI from "@/hooks/useGetFromAPI";
import usePostToAPI from "@/hooks/usePostToAPI";
import usePatchToAPI from "@/hooks/usePatchToAPI";
import useDeleteFromAPI from "@/hooks/useDeleteFromAPI";
import usePutToAPI from "@/hooks/usePutToAPI";
import WorkoutPlansTab from "@/pages/Workouts/tabs/WorkoutPlansTab";
import ExerciseBankTab from "@/pages/Workouts/tabs/ExerciseBankTab";
import WorkoutHistoryTab from "@/pages/Workouts/tabs/WorkoutHistoryTab";
import LogWorkoutTab from "@/pages/Workouts/tabs/LogWorkoutTab";
import { API_BASE_URL } from "../../../config.js";
import { getAuthHeader } from "@/lib/authHeader";

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

const emptyLogRow = {
  exercise_id: "",
  exercise: "",
  sets: "",
  reps: "",
  lbs: "",
  duration_sec: "",
  distance_m: "",
  pace_sec_per_km: "",
};

const defaultScheduleEntry = () => ({
  day: DAYS_OF_WEEK[0],
  time: "09:00",
});

const Workouts = () => {
  const location = useLocation();
  const { user } = useOutletContext();
  const userId = user?.user_id;
  const isCoachAssignScreen = location.pathname === "/assignWorkouts";

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
  const [expandedHistoryWorkoutId, setExpandedHistoryWorkoutId] = useState(null);
  const [historyWorkoutDetailsById, setHistoryWorkoutDetailsById] = useState({});
  const [historyWorkoutLoadingById, setHistoryWorkoutLoadingById] = useState({});
  const [workoutsRefreshKey, setWorkoutsRefreshKey] = useState(0);
  const [logSaveError, setLogSaveError] = useState("");
  const [logSaveSuccess, setLogSaveSuccess] = useState("");
  const [logRows, setLogRows] = useState([{ ...emptyLogRow }]);
  const [logDuration, setLogDuration] = useState("");
  const [mood, setMood] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedClientScheduleRefreshKey, setSelectedClientScheduleRefreshKey] = useState(0);

  useEffect(() => {
    if (
      isCoachAssignScreen &&
      (activeTab === TABS.HISTORY || activeTab === TABS.LOG)
    ) {
      setActiveTab(TABS.PLANS);
    }
  }, [isCoachAssignScreen, activeTab]);

  const { postFunction } = usePostToAPI();
  const { patchFunction } = usePatchToAPI();
  const { putFunction } = usePutToAPI();
  const { deleteFunction } = useDeleteFromAPI();

  const { data: workoutTypes } = useGetFromAPI("/workout-types", null);
  const { data: exercisesCatalog } = useGetFromAPI("/exercises", null);
  const { data: bodyParts } = useGetFromAPI("/body-parts", null);
  const { data: exerciseCategories } = useGetFromAPI("/exercise-categories", null);
  const { data: coachClientsData, loading: coachClientsLoading } = useGetFromAPI(
    isCoachAssignScreen ? "/coaches/clients" : null,
    null
  );
  const plansRequestUri =
    isCoachAssignScreen || !userId
      ? "/workout-plans?created_by=me"
      : `/workout-plans/available?user_id=${userId}`;
  const { data: plansData } = useGetFromAPI(plansRequestUri, plansRefreshKey);
  const { data: selectedClientScheduleData } = useGetFromAPI(
    isCoachAssignScreen && selectedClientId
      ? `/workouts/my_schedule?user_id=${selectedClientId}`
      : null,
    selectedClientScheduleRefreshKey
  );
  const { data: workoutsData } = useGetFromAPI(
    userId ? `/workouts?user_id=${userId}` : null,
    `${userId || ""}-${workoutsRefreshKey}`
  );

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

  const categoryKeyByExerciseId = useMemo(() => {
    if (!Array.isArray(exercisesCatalog)) return {};
    return exercisesCatalog.reduce((acc, exercise) => {
      acc[exercise.exercise_id] = resolveCategoryKey(exercise, categoryNameById);
      return acc;
    }, {});
  }, [exercisesCatalog, categoryNameById]);

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

  const selectedClientAssignmentsByPlanId = useMemo(() => {
    const scheduleItems = Array.isArray(selectedClientScheduleData?.my_schedule)
      ? selectedClientScheduleData.my_schedule
      : [];
    return scheduleItems.reduce((acc, item) => {
      const planId = item.workout_plan_id;
      if (!planId) return acc;
      if (!acc[planId]) acc[planId] = [];
      acc[planId].push({
        id: item.assignment_day_id ?? item.id ?? item.assignment_id ?? null,
        workout_plan_id: item.workout_plan_id,
        weekday: item.weekday || "",
        schedule_time: item.schedule_time || "",
        source: item.source || null,
      });
      return acc;
    }, {});
  }, [selectedClientScheduleData]);

  const plans = useMemo(() => {
    if (!Array.isArray(plansData)) return [];
    return plansData.map((plan) => {
      const detail = planDetailsById[plan.workout_plan_id];
      const detailExercises = Array.isArray(detail?.exercises) ? detail.exercises : [];
      const baseAssignments = Array.isArray(detail?.assignments) ? detail.assignments : [];
      const assignmentsForView =
        isCoachAssignScreen && selectedClientId
          ? selectedClientAssignmentsByPlanId[plan.workout_plan_id] || []
          : isCoachAssignScreen
            ? []
            : baseAssignments;
      const isCreatedByUser = Boolean(plan?.is_created_by_user);
      const isAssignedToUser = Boolean(plan?.is_assigned_to_user);
      const isLockedAssignedPlan =
        !isCoachAssignScreen && isAssignedToUser && !isCreatedByUser;
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
        is_created_by_user: isCreatedByUser,
        is_assigned_to_user: isAssignedToUser,
        is_locked_assigned_plan: isLockedAssignedPlan,
        exercises: detailExercises,
        assignments: assignmentsForView,
      };
    });
  }, [
    plansData,
    planDetailsById,
    isCoachAssignScreen,
    selectedClientId,
    selectedClientAssignmentsByPlanId,
  ]);

  const coachClients = useMemo(() => {
    const rawClients = Array.isArray(coachClientsData)
      ? coachClientsData
      : coachClientsData?.clients || [];

    return rawClients
      .map((client) => {
        const clientUserId = client.client_id ?? client.client_user_id ?? client.user_id ?? client.id;
        if (!clientUserId) return null;
        const firstName = client.first_name || "";
        const lastName = client.last_name || "";
        const fallbackName = client.name || client.email || `Client ${clientUserId}`;
        const fullName = `${firstName} ${lastName}`.trim() || fallbackName;
        return {
          client_id: String(clientUserId),
          name: fullName,
        };
      })
      .filter(Boolean);
  }, [coachClientsData]);

  useEffect(() => {
    if (!isCoachAssignScreen) {
      setSelectedClientId("");
      return;
    }

    if (selectedClientId) {
      const selectedStillExists = coachClients.some(
        (client) => String(client.client_id) === String(selectedClientId)
      );
      if (!selectedStillExists) {
        setSelectedClientId("");
      }
    }
  }, [isCoachAssignScreen, selectedClientId, coachClients]);

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

  const parseNumberOrUndefined = (value) => {
    if (value === null || value === undefined || value === "") return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const buildMetricPayload = (row, exerciseMeta, { includeWeight = false } = {}) => {
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
      if (includeWeight) {
        payload.weight = parseNumberOrUndefined(row.lbs);
      }
    }

    return Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
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
      exercise_id: exercise.exercise_id ? String(exercise.exercise_id) : "",
      exercise: exercise.name || "",
      sets: exercise.sets ? String(exercise.sets) : "",
      reps: exercise.reps ? String(exercise.reps) : "",
      lbs: exercise.weight ? String(exercise.weight) : "",
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
        entries:
          prev[planId]?.entries?.length > 0
            ? prev[planId].entries.map((entry, index) =>
                index === 0 ? { ...entry, [key]: value } : entry
              )
            : [{ ...defaultScheduleEntry(), [key]: value }],
      },
    }));
  };

  const updateScheduleDraftEntry = (planId, index, key, value) => {
    setScheduleDraftsByPlan((prev) => ({
      ...prev,
      [planId]: {
        entries: (prev[planId]?.entries || [defaultScheduleEntry()]).map((entry, entryIndex) =>
          entryIndex === index ? { ...entry, [key]: value } : entry
        ),
      },
    }));
  };

  const addScheduleDraftEntry = (planId) => {
    setScheduleDraftsByPlan((prev) => ({
      ...prev,
      [planId]: {
        entries: [...(prev[planId]?.entries || [defaultScheduleEntry()]), defaultScheduleEntry()],
      },
    }));
  };

  const removeScheduleDraftEntry = (planId, index) => {
    setScheduleDraftsByPlan((prev) => {
      const nextEntries = (prev[planId]?.entries || [defaultScheduleEntry()]).filter(
        (_, entryIndex) => entryIndex !== index
      );
      return {
        ...prev,
        [planId]: {
          entries: nextEntries.length > 0 ? nextEntries : [defaultScheduleEntry()],
        },
      };
    });
  };

  const assignScheduleToPlan = async (planId) => {
    const selectedPlan = plans.find(
      (plan) => String(plan.workout_plan_id) === String(planId)
    );
    if (selectedPlan?.is_locked_assigned_plan) {
      setFormError("Assigned plans cannot be modified.");
      return;
    }

    if (isCoachAssignScreen && !selectedClientId) {
      setFormError("Select a client before assigning this workout.");
      return;
    }

    const draft = scheduleDraftsByPlan[planId];
    const draftEntries =
      draft?.entries?.length > 0
        ? draft.entries
        : draft?.day && draft?.time
          ? [{ day: draft.day, time: draft.time }]
          : [];
    const cleanedAssignments = draftEntries
      .filter((entry) => entry?.day && entry?.time)
      .map((entry) => ({
        weekday: entry.day,
        schedule_time: entry.time.length === 5 ? `${entry.time}:00` : entry.time,
      }));
    if (cleanedAssignments.length === 0) return;
    try {
      if (isCoachAssignScreen) {
        await postFunction(`/workout-plans/${planId}/assignments`, {
          client_id: String(selectedClientId),
          assignments: cleanedAssignments,
        });
      } else {
        const firstAssignment = cleanedAssignments[0];
        await postFunction(`/workout-plans/${planId}/assignments`, {
          weekday: firstAssignment.weekday,
          schedule_time: firstAssignment.schedule_time,
        });
      }
      setFormError("");
      setAssigningPlanId(null);
      setPlansRefreshKey((prev) => prev + 1);
      if (isCoachAssignScreen) {
        setSelectedClientScheduleRefreshKey((prev) => prev + 1);
      }
    } catch (error) {
      setFormError(error?.message || "Failed to assign workout.");
    }
  };

  const removePlanAssignment = async (assignmentId) => {
    if (!assignmentId) return;
    if (isCoachAssignScreen && !selectedClientId) {
      setFormError("Select a client before changing assignments.");
      return;
    }
    const hasLockedPlanWithAssignment = plans.some(
      (plan) =>
        plan.is_locked_assigned_plan &&
        (plan.assignments || []).some(
          (assignment) => String(assignment.id) === String(assignmentId)
        )
    );
    if (hasLockedPlanWithAssignment) {
      setFormError("Assigned plans cannot be modified.");
      return;
    }
    try {
      await deleteFunction(`/workout-plan-assignments/${assignmentId}`);
      setPlansRefreshKey((prev) => prev + 1);
      if (isCoachAssignScreen) {
        setSelectedClientScheduleRefreshKey((prev) => prev + 1);
      }
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
    if (plan?.is_locked_assigned_plan) {
      setFormError("Assigned plans cannot be edited.");
      return;
    }
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
              ...buildMetricPayload(row, exerciseById[row.exercise_id]),
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
      resetForm();
      setPlansRefreshKey((prev) => prev + 1);
    } catch (error) {
      setFormError(error?.message || "Failed to save workout plan.");
    }
  };

  const removePlan = async (planId) => {
    const selectedPlan = plans.find(
      (plan) => String(plan.workout_plan_id) === String(planId)
    );
    if (selectedPlan?.is_locked_assigned_plan) {
      setFormError("Assigned plans cannot be deleted.");
      return;
    }
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

  const saveWorkoutLog = async () => {
    if (!userId) {
      setLogSaveError("Unable to log workout: missing user.");
      return;
    }

    const selectedPlan = plans.find(
      (plan) => String(plan.workout_plan_id) === String(selectedPlanToLoad)
    );
    const title = selectedPlan?.title || `Workout ${new Date().toLocaleDateString("en-US")}`;

    const rowsWithExerciseIds = logRows
      .map((row) => {
        const directId = row.exercise_id ? Number(row.exercise_id) : null;
        if (directId) {
          return {
            ...row,
            resolved_exercise_id: directId,
            resolved_exercise_meta: exerciseById[directId],
          };
        }
        const byName = (exercisesCatalog || []).find(
          (exercise) => exercise.name?.toLowerCase() === row.exercise?.trim()?.toLowerCase()
        );
        return byName
          ? {
              ...row,
              resolved_exercise_id: Number(byName.exercise_id),
              resolved_exercise_meta: byName,
            }
          : { ...row, resolved_exercise_id: null, resolved_exercise_meta: null };
      })
      .filter((row) => row.resolved_exercise_id);

    if (rowsWithExerciseIds.length === 0) {
      setLogSaveError("Add at least one valid exercise before saving.");
      return;
    }

    setLogSaveError("");
    setLogSaveSuccess("");

    try {
      const moodNumberByKey = {
        tired: 1,
        ok: 2,
        good: 3,
        great: 4,
        beast: 5,
      };
      const moodNumber = moodNumberByKey[mood] || null;

      const createdWorkout = await postFunction("/workouts", {
        user_id: userId,
        title,
        workout_type_id: selectedPlan?.workout_type_id ?? null,
        workout_plan_id: selectedPlan?.workout_plan_id ?? null,
        notes: sessionNotes?.trim() || "",
        mood: moodNumber,
        duration_mins: logDuration ? Number(logDuration) : null,
        completion_date: new Date().toISOString(),
      });

      const workoutId = createdWorkout?.workout_id;
      if (!workoutId) {
        throw new Error("Workout was created without an id.");
      }

      await postFunction(`/workouts/${workoutId}/exercises`, {
        exercises: rowsWithExerciseIds.map((row, index) => ({
          exercise_id: row.resolved_exercise_id,
          position: index,
          ...buildMetricPayload(row, row.resolved_exercise_meta, { includeWeight: true }),
        })),
      });

      setWorkoutsRefreshKey((prev) => prev + 1);
      setLogSaveSuccess("Workout logged successfully.");
      setSelectedPlanToLoad("");
      setLogRows([{ ...emptyLogRow }]);
      setLogDuration("");
      setMood("");
      setSessionNotes("");
    } catch (error) {
      setLogSaveError(error?.message || "Failed to save workout log.");
    }
  };

  const toggleHistoryWorkout = async (workoutId) => {
    if (expandedHistoryWorkoutId === workoutId) {
      setExpandedHistoryWorkoutId(null);
      return;
    }

    setExpandedHistoryWorkoutId(workoutId);
    if (historyWorkoutDetailsById[workoutId] || historyWorkoutLoadingById[workoutId]) return;

    setHistoryWorkoutLoadingById((prev) => ({ ...prev, [workoutId]: true }));
    try {
      const detail = await fetchWorkoutDetail(workoutId);
      if (detail) {
        setHistoryWorkoutDetailsById((prev) => ({ ...prev, [workoutId]: detail }));
      }
    } finally {
      setHistoryWorkoutLoadingById((prev) => ({ ...prev, [workoutId]: false }));
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

  async function fetchWorkoutDetail(workoutId) {
    const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}`, {
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
          {isCoachAssignScreen ? "Assign Workouts" : "Workout Plans"}
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
        {!isCoachAssignScreen && (
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
        )}
        {!isCoachAssignScreen && (
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
        )}
      </div>

      {activeTab === TABS.PLANS && (
        <WorkoutPlansTab
          pageTitle={isCoachAssignScreen ? "Assign Workouts" : "Create and Manage Workout Plans"}
          isCoachAssignScreen={isCoachAssignScreen}
          coachClients={coachClients}
          coachClientsLoading={coachClientsLoading}
          selectedClientId={selectedClientId}
          setSelectedClientId={setSelectedClientId}
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
          resetForm={resetForm}
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
          removePlanAssignment={removePlanAssignment}
          scheduleDraftsByPlan={scheduleDraftsByPlan}
          DAYS_OF_WEEK={DAYS_OF_WEEK}
          updateScheduleDraft={updateScheduleDraft}
          updateScheduleDraftEntry={updateScheduleDraftEntry}
          addScheduleDraftEntry={addScheduleDraftEntry}
          removeScheduleDraftEntry={removeScheduleDraftEntry}
          assignScheduleToPlan={assignScheduleToPlan}
        />
      )}

      {activeTab === TABS.BANK && (
        <ExerciseBankTab
          bodyPartOptions={bodyPartOptions}
          bankBodyPartFilter={bankBodyPartFilter}
          setBankBodyPartFilter={setBankBodyPartFilter}
          categoryOptions={categoryOptions}
          bankCategoryFilter={bankCategoryFilter}
          setBankCategoryFilter={setBankCategoryFilter}
          filteredExerciseBank={filteredExerciseBank}
          bodyPartNameById={bodyPartNameById}
          categoryNameById={categoryNameById}
        />
      )}

      {!isCoachAssignScreen && activeTab === TABS.HISTORY && (
        <WorkoutHistoryTab
          workoutsData={workoutsData}
          toggleHistoryWorkout={toggleHistoryWorkout}
          expandedHistoryWorkoutId={expandedHistoryWorkoutId}
          historyWorkoutLoadingById={historyWorkoutLoadingById}
          historyWorkoutDetailsById={historyWorkoutDetailsById}
          categoryKeyByExerciseId={categoryKeyByExerciseId}
        />
      )}

      {!isCoachAssignScreen && activeTab === TABS.LOG && (
        <LogWorkoutTab
          hasWorkoutScheduledToday={hasWorkoutScheduledToday}
          todayWeekday={todayWeekday}
          todaysScheduledWorkouts={todaysScheduledWorkouts}
          setSelectedPlanToLoad={setSelectedPlanToLoad}
          loadPlanIntoLog={loadPlanIntoLog}
          selectedPlanToLoad={selectedPlanToLoad}
          plans={plans}
          logRows={logRows}
          updateLogRow={updateLogRow}
          removeLogRow={removeLogRow}
          addLogRow={addLogRow}
          categoryKeyByExerciseId={categoryKeyByExerciseId}
          logDuration={logDuration}
          setLogDuration={setLogDuration}
          mood={mood}
          setMood={setMood}
          sessionNotes={sessionNotes}
          setSessionNotes={setSessionNotes}
          saveWorkoutLog={saveWorkoutLog}
          logSaveError={logSaveError}
          logSaveSuccess={logSaveSuccess}
        />
      )}
    </div>
  );
};

export default Workouts;
