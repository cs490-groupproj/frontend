import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/utils.js";

function TemplateCard({ template, isPremade, onSelect }) {
  return (
    <button
      onClick={() => onSelect(template)}
      className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 p-6 text-left transition hover:border-[#f61b59] hover:bg-slate-900"
    >
      <h3 className="text-lg font-bold text-white">{template.title}</h3>
      <p className="mt-2 text-sm text-slate-400">Workout template</p>
      {isPremade && (
        <span className="mt-3 inline-block rounded-full bg-[#f61b59]/20 px-3 py-1 text-xs font-semibold text-[#f61b59]">
          App Template
        </span>
      )}
    </button>
  );
}

function CreateTemplateCard({ onCreate }) {
  return (
    <button
      onClick={onCreate}
      className="flex min-h-[150px] w-full items-center justify-center rounded-2xl border border-dashed border-[#f61b59]/80 bg-slate-900/50 p-6 text-center transition hover:bg-[#f61b59]/10"
    >
      <div className="flex flex-col items-center gap-2">
        <span className="text-4xl font-bold text-[#f61b59]">+</span>
        <span className="text-sm font-semibold text-slate-200">Create Template</span>
      </div>
    </button>
  );
}

function TemplateActionModal({ template, onViewTemplate, onStartWorkout, onCancel, isSaving }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-[#f61b59]/70 bg-slate-950 p-8 shadow-2xl shadow-black/40">
        <h2 className="text-2xl font-bold text-white">{template.title}</h2>
        <p className="mt-2 text-sm text-slate-400">
          This template includes {template.exercises ? template.exercises.length : 0} exercises
        </p>

        <div className="mt-6 space-y-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          {template.exercises ? template.exercises.map((ex) => (
            <div key={`${ex.workout_plan_exercise_id || ex.exercise_id}-${ex.position}`} className="flex items-center justify-between rounded border border-slate-700 bg-slate-950/80 px-4 py-3">
              <div>
                <p className="font-semibold text-white">{ex.name}</p>
                <p className="text-xs uppercase text-slate-500">Position {ex.position}</p>
              </div>
            </div>
          )) : (
            <p className="text-slate-400">No exercises in this template.</p>
          )}
        </div>

        <p className="mt-4 text-sm text-slate-400">
          You can add, remove, or adjust exercises after starting the workout.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-slate-700 bg-slate-900 px-4 py-3 font-semibold text-slate-100 transition hover:border-[#f61b59] hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onViewTemplate}
            className="flex-1 rounded-full border border-slate-700 bg-slate-900 px-4 py-3 font-semibold text-slate-100 transition hover:border-[#f61b59] hover:text-white"
          >
            View Template
          </button>
          <button
            type="button"
            onClick={onStartWorkout}
            disabled={isSaving}
            className="flex-1 rounded-full bg-[#f61b59] px-4 py-3 font-semibold text-slate-950 transition hover:bg-[#f61b59]/90 disabled:cursor-not-allowed disabled:bg-[#f61b59]/60"
          >
            {isSaving ? "Starting..." : "Start Workout"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TemplateEditorModal({
  open,
  template,
  exercisesCatalog,
  isSaving,
  error,
  onChangeExerciseField,
  onAddExercise,
  onRemoveExercise,
  onSave,
  onCancel,
}) {
  const [selectedExerciseId, setSelectedExerciseId] = React.useState("");

  React.useEffect(() => {
    if (open) setSelectedExerciseId("");
  }, [open]);

  if (!open || !template) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-4xl rounded-3xl border border-[#f61b59]/70 bg-slate-950 p-6 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">Edit Template: {template.title}</h2>
            <p className="mt-1 text-sm text-slate-400">Review, modify, and save this template before starting a workout.</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-[#f61b59]"
          >
            Close
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="min-w-[240px] flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#f61b59]"
          >
            <option value="">Select exercise to add</option>
            {exercisesCatalog.map((exercise) => (
              <option key={exercise.exercise_id} value={exercise.exercise_id}>{exercise.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              const picked = exercisesCatalog.find((x) => String(x.exercise_id) === String(selectedExerciseId));
              if (picked) onAddExercise(picked);
            }}
            className="rounded-full bg-[#f61b59] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-[#f61b59]/90"
          >
            Add Exercise
          </button>
        </div>

        <div className="mt-5 max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {(template.exercises || []).length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-400">No exercises in this template yet.</div>
          ) : (
            (template.exercises || []).map((exercise, index) => (
              <div key={exercise.workout_plan_exercise_id || `${exercise.exercise_id}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{exercise.name || `Exercise ${exercise.exercise_id}`}</p>
                  <button
                    type="button"
                    onClick={() => onRemoveExercise(index)}
                    className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-200 transition hover:border-[#f61b59] hover:text-white"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <input value={exercise.position ?? ""} onChange={(e) => onChangeExerciseField(index, "position", e.target.value)} type="number" placeholder="Position" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#f61b59]" />
                  <input value={exercise.sets ?? ""} onChange={(e) => onChangeExerciseField(index, "sets", e.target.value)} type="number" placeholder="Sets" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#f61b59]" />
                  <input value={exercise.reps ?? ""} onChange={(e) => onChangeExerciseField(index, "reps", e.target.value)} type="number" placeholder="Reps" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#f61b59]" />
                  <input value={exercise.weight ?? ""} onChange={(e) => onChangeExerciseField(index, "weight", e.target.value)} type="number" placeholder="Weight" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#f61b59]" />
                  <input value={exercise.rpe ?? ""} onChange={(e) => onChangeExerciseField(index, "rpe", e.target.value)} type="number" placeholder="RPE" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#f61b59]" />
                  <input value={exercise.duration_sec ?? ""} onChange={(e) => onChangeExerciseField(index, "duration_sec", e.target.value)} type="number" placeholder="Duration (sec)" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#f61b59]" />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-slate-700 bg-slate-900 px-4 py-3 font-semibold text-slate-100 transition hover:border-[#f61b59] hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 rounded-full bg-[#f61b59] px-4 py-3 font-semibold text-slate-950 transition hover:bg-[#f61b59]/90 disabled:cursor-not-allowed disabled:bg-[#f61b59]/60"
          >
            {isSaving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateTemplateModal({ open, title, onChangeTitle, onConfirm, onCancel, isSaving, error }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-xl rounded-3xl border border-[#f61b59]/70 bg-slate-950 p-8 shadow-2xl shadow-black/40">
        <h2 className="text-2xl font-bold text-white">Create Workout Template</h2>
        <p className="mt-2 text-sm text-slate-400">
          Name your template. You can add and edit exercises after starting from it.
        </p>

        <div className="mt-5">
          <input
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            placeholder="e.g. Upper Body Strength"
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#f61b59]"
          />
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 rounded-full border border-slate-700 bg-slate-900 px-4 py-3 font-semibold text-slate-100 transition hover:border-[#f61b59] hover:text-white disabled:cursor-not-allowed disabled:text-slate-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSaving}
            className="flex-1 rounded-full bg-[#f61b59] px-4 py-3 font-semibold text-slate-950 transition hover:bg-[#f61b59]/90 disabled:cursor-not-allowed disabled:bg-[#f61b59]/60"
          >
            {isSaving ? "Creating..." : "Create Template"}
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkoutTitleModal({ open, title, onChangeTitle, onConfirm, onCancel, isSaving, error }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-xl rounded-3xl border border-[#f61b59]/70 bg-slate-950 p-8 shadow-2xl shadow-black/40">
        <h2 className="text-2xl font-bold text-white">Name Your Workout</h2>
        <p className="mt-2 text-sm text-slate-400">
          Choose a title before creating your workout session.
        </p>

        <div className="mt-5">
          <input
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            placeholder="e.g. Push Day, Legs, Full Body"
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#f61b59]"
          />
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 rounded-full border border-slate-700 bg-slate-900 px-4 py-3 font-semibold text-slate-100 transition hover:border-[#f61b59] hover:text-white disabled:cursor-not-allowed disabled:text-slate-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSaving}
            className="flex-1 rounded-full bg-[#f61b59] px-4 py-3 font-semibold text-slate-950 transition hover:bg-[#f61b59]/90 disabled:cursor-not-allowed disabled:bg-[#f61b59]/60"
          >
            {isSaving ? "Creating..." : "Create Workout"}
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkoutHistoryCard({ workout, onSelect }) {
  const exerciseRows = Array.isArray(workout.workout_exercises)
    ? workout.workout_exercises
    : Array.isArray(workout.exercises)
      ? workout.exercises
      : [];

  const groupedExercises = exerciseRows.reduce((acc, row) => {
    const id = row.exercise_id ?? row.exercise?.exercise_id ?? row.exercise?.id;
    const position = row.position ?? 0;
    const key = `${id ?? "unknown"}-${position}`;
    if (!acc[key]) {
      acc[key] = {
        exercise_id: id,
        name: row.name || row.exercise_name || row.exercise?.name || "Unknown Exercise",
        position,
        sets: [],
      };
    }
    acc[key].sets.push(row);
    return acc;
  }, {});

  const displayExercises = Object.values(groupedExercises).sort((a, b) => a.position - b.position);

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">{workout.title || "Untitled Workout"}</h3>
          <p className="mt-2 text-sm text-slate-400">Workout ID: {workout.workout_id}</p>
        </div>
        <button
          onClick={() => onSelect(workout)}
          className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-[#f61b59] hover:text-white"
        >
          Open
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {displayExercises.length === 0 ? (
          <p className="text-sm text-slate-400">No exercise details available for this workout.</p>
        ) : (
          displayExercises.map((exercise) => (
            <div key={`${exercise.exercise_id ?? "unknown"}-${exercise.position}`} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-white">{exercise.name}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">Position {exercise.position || "-"}</p>
              </div>
              <div className="mt-3 space-y-2">
                {exercise.sets.map((setItem) => (
                  <div
                    key={setItem.workout_exercise_id ?? setItem.id ?? `${exercise.exercise_id}-${exercise.position}`}
                    className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-300"
                  >
                    <span className="mr-3">Weight: {setItem.weight ?? "-"}</span>
                    <span className="mr-3">Reps: {setItem.reps ?? "-"}</span>
                    <span className="mr-3">RPE: {setItem.rpe ?? "-"}</span>
                    <span className="mr-3">Duration: {setItem.duration_sec ?? "-"}</span>
                    <span>Distance: {setItem.distance_m ?? "-"}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function WorkoutLanding() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [newWorkoutTitle, setNewWorkoutTitle] = useState("");
  const [titleModalError, setTitleModalError] = useState("");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState("");
  const [templateModalError, setTemplateModalError] = useState("");
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);
  const [templateEditorError, setTemplateEditorError] = useState("");
  const [isTemplateEditorSaving, setIsTemplateEditorSaving] = useState(false);
  const [editableTemplate, setEditableTemplate] = useState(null);
  const [originalTemplateExercises, setOriginalTemplateExercises] = useState([]);
  const [exerciseCatalog, setExerciseCatalog] = useState([]);

  const fetchPlans = React.useCallback(async () => {
    try {
      const response = await apiFetch("/workout-plans");
      if (response.ok) {
        const data = await response.json();
        setWorkoutPlans(data);
      } else {
        console.error("Failed to fetch workout plans");
      }
    } catch (error) {
      console.error("Error fetching workout plans:", error);
    } finally {
      setPlansLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  React.useEffect(() => {
    const fetchExerciseCatalog = async () => {
      try {
        const response = await apiFetch("/exercises");
        if (!response.ok) return;
        const data = await response.json();
        setExerciseCatalog(Array.isArray(data) ? data : []);
      } catch {
        setExerciseCatalog([]);
      }
    };
    fetchExerciseCatalog();
  }, []);

  React.useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setHistoryLoading(false);
      setHistoryError("Missing user id. Please sign in again.");
      return;
    }

    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError("");
      try {
        const response = await apiFetch(`/workouts?user_id=${encodeURIComponent(userId)}`);
        if (!response.ok) {
          setHistoryError("Failed to fetch workout history.");
          setWorkoutHistory([]);
          return;
        }

        const list = await response.json();
        if (!Array.isArray(list) || list.length === 0) {
          setWorkoutHistory([]);
          return;
        }

        const detailResults = await Promise.all(
          list.map(async (item) => {
            const detailResponse = await apiFetch(`/workouts/${item.workout_id}`);
            if (!detailResponse.ok) {
              return item;
            }
            const detail = await detailResponse.json();
            return {
              ...item,
              ...detail,
              workout_id: item.workout_id,
              title: detail.title || item.title,
            };
          })
        );

        setWorkoutHistory(detailResults);
      } catch (error) {
        console.error("Error fetching workout history:", error);
        setHistoryError("Failed to fetch workout history.");
        setWorkoutHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const templates = workoutPlans;

  const handleStartEmpty = () => {
    setNewWorkoutTitle("");
    setTitleModalError("");
    setIsTitleModalOpen(true);
  };

  const handleConfirmStartEmpty = async () => {
    const trimmedTitle = newWorkoutTitle.trim();
    if (!trimmedTitle) {
      setTitleModalError("Workout title is required.");
      return;
    }

    setIsSaving(true);
    setTitleModalError("");
    try {
      const response = await apiFetch("workouts", {
        method: "POST",
        body: JSON.stringify({ title: trimmedTitle, user_id: localStorage.getItem("userId") }),
      });
      if (response.ok) {
        const data = await response.json();
        setIsTitleModalOpen(false);
        setNewWorkoutTitle("");
        navigate(`/workout-session/${data.workout_id}`);
      } else {
        const errorText = await response.text();
        setTitleModalError("Failed to create workout: HTTP error: Status " + response.status + " - " + errorText);
      }
    } catch (error) {
      setTitleModalError("Failed to create workout: " + (error.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartTemplate = async () => {
    if (!selectedTemplate) return;
    setIsSaving(true);
    try {
      const response = await apiFetch(`workouts/from-plan/${selectedTemplate.workout_plan_id}`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        navigate(`/workout-session/${data.workout_id}`);
      } else {
        const errorText = await response.text();
        alert("Failed to create workout from template: HTTP error: Status " + response.status + " - " + errorText);
      }
    } catch (error) {
      alert("Failed to create workout from template: " + (error.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const normalizeNumericField = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const handleSelectTemplate = async (template) => {
    setIsSaving(true);
    try {
      const response = await apiFetch(`/workout-plans/${template.workout_plan_id}`);
      if (!response.ok) {
        throw new Error("Failed to load template details.");
      }
      const fullTemplate = await response.json();
      setSelectedTemplate(fullTemplate);
    } catch {
      setSelectedTemplate(template);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenTemplateEditor = () => {
    if (!selectedTemplate) return;
    const exercises = Array.isArray(selectedTemplate.exercises) ? selectedTemplate.exercises : [];
    setEditableTemplate({
      ...selectedTemplate,
      exercises: exercises.map((item) => ({ ...item })),
    });
    setOriginalTemplateExercises(exercises.map((item) => ({ ...item })));
    setTemplateEditorError("");
    setSelectedTemplate(null);
    setIsTemplateEditorOpen(true);
  };

  const handleTemplateExerciseFieldChange = (index, field, value) => {
    setEditableTemplate((current) => {
      if (!current) return current;
      const next = [...(current.exercises || [])];
      next[index] = { ...next[index], [field]: value };
      return { ...current, exercises: next };
    });
  };

  const handleTemplateAddExercise = (exercise) => {
    setEditableTemplate((current) => {
      if (!current) return current;
      const existing = current.exercises || [];
      const nextPosition = existing.length > 0 ? Math.max(...existing.map((x) => Number(x.position || 0))) + 1 : 1;
      return {
        ...current,
        exercises: [
          ...existing,
          {
            exercise_id: exercise.exercise_id,
            name: exercise.name,
            position: nextPosition,
            sets: null,
            reps: null,
            weight: null,
            rpe: null,
            duration_sec: null,
          },
        ],
      };
    });
  };

  const handleTemplateRemoveExercise = (index) => {
    setEditableTemplate((current) => {
      if (!current) return current;
      return {
        ...current,
        exercises: (current.exercises || []).filter((_, i) => i !== index),
      };
    });
  };

  const handleSaveTemplateEdits = async () => {
    if (!editableTemplate || !editableTemplate.workout_plan_id) return;
    setIsTemplateEditorSaving(true);
    setTemplateEditorError("");

    const currentExercises = editableTemplate.exercises || [];
    const originalById = new Map(
      originalTemplateExercises
        .filter((item) => item.workout_plan_exercise_id)
        .map((item) => [item.workout_plan_exercise_id, item])
    );
    const currentIds = new Set(
      currentExercises
        .map((item) => item.workout_plan_exercise_id)
        .filter(Boolean)
    );

    try {
      await Promise.all(
        originalTemplateExercises
          .filter((item) => item.workout_plan_exercise_id && !currentIds.has(item.workout_plan_exercise_id))
          .map((item) =>
            apiFetch(`/workout-plan-exercises/${item.workout_plan_exercise_id}`, {
              method: "DELETE",
            })
          )
      );

      for (const exercise of currentExercises) {
        const payload = {
          exercise_id: exercise.exercise_id,
          position: normalizeNumericField(exercise.position) ?? 0,
          sets: normalizeNumericField(exercise.sets),
          reps: normalizeNumericField(exercise.reps),
          weight: normalizeNumericField(exercise.weight),
          rpe: normalizeNumericField(exercise.rpe),
          duration_sec: normalizeNumericField(exercise.duration_sec),
        };

        if (exercise.workout_plan_exercise_id) {
          const previous = originalById.get(exercise.workout_plan_exercise_id) || {};
          const hasChanged = ["exercise_id", "position", "sets", "reps", "weight", "rpe", "duration_sec"].some(
            (key) => String(previous[key] ?? "") !== String(payload[key] ?? "")
          );
          if (hasChanged) {
            const updateResponse = await apiFetch(`/workout-plan-exercises/${exercise.workout_plan_exercise_id}`, {
              method: "PUT",
              body: JSON.stringify(payload),
            });
            if (!updateResponse.ok) {
              throw new Error("Failed to update template exercise.");
            }
          }
        } else {
          const createResponse = await apiFetch(`/workout-plans/${editableTemplate.workout_plan_id}/exercises`, {
            method: "POST",
            body: JSON.stringify(payload),
          });
          if (!createResponse.ok) {
            throw new Error("Failed to add template exercise.");
          }
        }
      }

      const refreshResponse = await apiFetch(`/workout-plans/${editableTemplate.workout_plan_id}`);
      if (!refreshResponse.ok) {
        throw new Error("Template saved, but failed to refresh latest details.");
      }
      const refreshed = await refreshResponse.json();
      setSelectedTemplate(refreshed);
      setEditableTemplate(refreshed);
      setOriginalTemplateExercises((refreshed.exercises || []).map((item) => ({ ...item })));
      setIsTemplateEditorOpen(false);
      await fetchPlans();
    } catch (error) {
      setTemplateEditorError(error.message || "Failed to save template.");
    } finally {
      setIsTemplateEditorSaving(false);
    }
  };

  const handleOpenCreateTemplate = () => {
    setNewTemplateTitle("");
    setTemplateModalError("");
    setIsTemplateModalOpen(true);
  };

  const handleCreateTemplate = async () => {
    const trimmedTitle = newTemplateTitle.trim();
    if (!trimmedTitle) {
      setTemplateModalError("Template title is required.");
      return;
    }

    setIsCreatingTemplate(true);
    setTemplateModalError("");
    try {
      const response = await apiFetch("/workout-plans", {
        method: "POST",
        body: JSON.stringify({ title: trimmedTitle }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create template: ${response.status} - ${errorText}`);
      }

      const created = await response.json();
      const createdPlanId = created.workout_plan_id;

      let createdPlan = {
        workout_plan_id: createdPlanId,
        title: trimmedTitle,
        exercises: [],
      };

      const planResponse = await apiFetch(`/workout-plans/${createdPlanId}`);
      if (planResponse.ok) {
        createdPlan = await planResponse.json();
      }

      await fetchPlans();
      setIsTemplateModalOpen(false);
      setNewTemplateTitle("");
      setSelectedTemplate(createdPlan);
    } catch (error) {
      setTemplateModalError(error.message || "Failed to create template.");
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-white">Start Your Workout</h1>
          <p className="text-lg text-slate-400">
            Choose how you would like to begin today
          </p>
        </div>

        {/* Start Empty */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Start an Empty Workout</h2>
          <p className="text-slate-400">
            Begin with a blank slate and add exercises as you go
          </p>
          <button
            onClick={handleStartEmpty}
            disabled={isSaving}
            className="rounded-3xl border border-[#f61b59]/80 bg-[#f61b59]/10 px-8 py-6 text-lg font-semibold text-[#f61b59] transition hover:bg-[#f61b59]/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Creating..." : "Start Empty Workout"}
          </button>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Workout Templates</h2>
          <p className="text-slate-400">
            Select a workout plan to start with a prebuilt routine.
          </p>
          {plansLoading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-400">Loading templates…</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <CreateTemplateCard onCreate={handleOpenCreateTemplate} />
              {templates.map((template) => (
                <TemplateCard
                  key={template.workout_plan_id}
                  template={template}
                  isPremade={!template.created_by}
                  onSelect={handleSelectTemplate}
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">User History</h2>
          <p className="text-slate-400">
            Review your past workouts and all recorded exercise details.
          </p>
          {historyLoading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-400">Loading workout history…</div>
          ) : historyError ? (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-100">{historyError}</div>
          ) : workoutHistory.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-400">No workout history yet.</div>
          ) : (
            <div className="grid gap-4">
              {workoutHistory.map((workout) => (
                <WorkoutHistoryCard
                  key={workout.workout_id}
                  workout={workout}
                  onSelect={(selectedWorkout) => navigate(`/workout-session/${selectedWorkout.workout_id}`)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedTemplate && (
        <TemplateActionModal
          template={selectedTemplate}
          onViewTemplate={handleOpenTemplateEditor}
          onStartWorkout={handleStartTemplate}
          onCancel={() => setSelectedTemplate(null)}
          isSaving={isSaving}
        />
      )}

      <WorkoutTitleModal
        open={isTitleModalOpen}
        title={newWorkoutTitle}
        onChangeTitle={setNewWorkoutTitle}
        onConfirm={handleConfirmStartEmpty}
        onCancel={() => {
          if (isSaving) return;
          setIsTitleModalOpen(false);
          setTitleModalError("");
        }}
        isSaving={isSaving}
        error={titleModalError}
      />

      <CreateTemplateModal
        open={isTemplateModalOpen}
        title={newTemplateTitle}
        onChangeTitle={setNewTemplateTitle}
        onConfirm={handleCreateTemplate}
        onCancel={() => {
          if (isCreatingTemplate) return;
          setIsTemplateModalOpen(false);
          setTemplateModalError("");
        }}
        isSaving={isCreatingTemplate}
        error={templateModalError}
      />

      <TemplateEditorModal
        open={isTemplateEditorOpen}
        template={editableTemplate}
        exercisesCatalog={exerciseCatalog}
        isSaving={isTemplateEditorSaving}
        error={templateEditorError}
        onChangeExerciseField={handleTemplateExerciseFieldChange}
        onAddExercise={handleTemplateAddExercise}
        onRemoveExercise={handleTemplateRemoveExercise}
        onSave={handleSaveTemplateEdits}
        onCancel={() => {
          if (isTemplateEditorSaving) return;
          setIsTemplateEditorOpen(false);
          setTemplateEditorError("");
        }}
      />
    </div>
  );
}
