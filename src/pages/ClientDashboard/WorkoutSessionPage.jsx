import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "@/lib/utils.js";
import SessionExerciseCard from "./components/SessionExerciseCard.jsx";

// TEMPORARY MOCK DATA - Remove when API is ready
const MOCK_WORKOUT_DATA = {
  id: 1,
  title: "Chest & Triceps",
  workout_exercises: [
    {
      id: 1,
      exercise_id: 1,
      exercise_name: "Bench Press",
      category: "strength",
      position: 1,
      weight: 185,
      reps: 8,
      rpe: 8,
    },
    {
      id: 2,
      exercise_id: 1,
      exercise_name: "Bench Press",
      category: "strength",
      position: 1,
      weight: 185,
      reps: 6,
      rpe: 9,
    },
    {
      id: 3,
      exercise_id: 2,
      exercise_name: "Incline Dumbbell Press",
      category: "strength",
      position: 2,
      weight: 65,
      reps: 10,
      rpe: 7,
    },
    {
      id: 4,
      exercise_id: 3,
      exercise_name: "Tricep Rope Pushdown",
      category: "strength",
      position: 3,
      weight: 80,
      reps: 12,
      rpe: 6,
    },
  ],
};

const MOCK_EXERCISES = [
  { id: 1, name: "Bench Press", category: "strength" },
  { id: 2, name: "Incline Dumbbell Press", category: "strength" },
  { id: 3, name: "Tricep Rope Pushdown", category: "strength" },
  { id: 4, name: "Dumbbell Curl", category: "strength" },
  { id: 5, name: "Barbell Squat", category: "strength" },
  { id: 6, name: "Treadmill Run", category: "cardio" },
  { id: 7, name: "Rowing Machine", category: "cardio" },
];

export function groupSetsByExercise(workout_exercises = []) {
  const grouped = workout_exercises.reduce((acc, set) => {
    const setId = set.id ?? set.workout_exercise_id;
    const bucket = `${set.exercise_id}-${set.position}`;
    if (!acc[bucket]) {
      acc[bucket] = {
        exercise_id: set.exercise_id,
        name: set.name || set.exercise_name || set.exercise?.name || "Unknown Exercise",
        position: set.position || 0,
        category: set.category || set.exercise?.category || "strength",
        sets: [],
      };
    }
    acc[bucket].sets.push({ ...set, id: setId });
    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => a.position - b.position);
}

function AddExerciseModal({ open, onClose, exercises, onSelectExercise, loading }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredExercises = useMemo(() => {
    if (!exercises) return [];
    return exercises.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(item.exercise_id).includes(searchTerm)
    );
  }, [exercises, searchTerm]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-fuchsia-500/70 bg-slate-950 p-6 shadow-2xl shadow-black/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Add Exercise</h2>
            <p className="text-sm text-slate-400">Select an exercise to add to this workout.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 hover:border-fuchsia-500">
            Close
          </button>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exercises"
            className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="mt-5 grid gap-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-400">Loading exercises…</div>
          ) : filteredExercises.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-400">No exercises found.</div>
          ) : (
            filteredExercises.map((exercise) => (
              <button
                key={exercise.exercise_id}
                onClick={() => onSelectExercise(exercise)}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4 text-left transition hover:border-fuchsia-500/80 hover:bg-slate-900/95"
              >
                <div>
                  <div className="font-semibold text-white">{exercise.name}</div>
                  <p className="text-sm text-slate-500">{exercise.category || "Strength"}</p>
                </div>
                <div className="text-sm text-slate-400">Select</div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function WorkoutSessionPage() {
  const { workoutId } = useParams();
  const useMockData = workoutId === "demo"; // Use mock data when workoutId is "demo"

  const [workoutData, setWorkoutData] = useState(null);
  const [workoutLoading, setWorkoutLoading] = useState(false);
  const [workoutError, setWorkoutError] = useState(null);

  const [exercisesData, setExercisesData] = useState(null);
  const [exercisesLoading, setExercisesLoading] = useState(false);

  const [workout, setWorkout] = useState(useMockData ? MOCK_WORKOUT_DATA : null);
  const [groupedExercises, setGroupedExercises] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const dataToUse = useMockData ? MOCK_WORKOUT_DATA : workoutData;
    if (!dataToUse) return;
    setWorkout(dataToUse);
    setGroupedExercises(groupSetsByExercise(dataToUse.workout_exercises || dataToUse.exercises || []));
  }, [workoutData, useMockData]);

  useEffect(() => {
    if (useMockData || !workoutId) return;
    const controller = new AbortController();

    const fetchWorkout = async () => {
      setWorkoutLoading(true);
      setWorkoutError(null);
      try {
        const response = await apiFetch(`/workouts/${workoutId}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          setWorkoutError(errorBody.error || `Failed to load workout (${response.status})`);
          setWorkoutData(null);
          return;
        }
        const data = await response.json();
        setWorkoutData(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          setWorkoutError(error.message);
          setWorkoutData(null);
        }
      } finally {
        setWorkoutLoading(false);
      }
    };

    fetchWorkout();
    return () => controller.abort();
  }, [workoutId, useMockData]);

  useEffect(() => {
    if (useMockData || !workoutId) return;
    const controller = new AbortController();

    const fetchExercises = async () => {
      setExercisesLoading(true);
      try {
        const response = await apiFetch("/exercises", {
          signal: controller.signal,
        });
        if (!response.ok) {
          setExercisesData(null);
          return;
        }
        const data = await response.json();
        setExercisesData(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          setExercisesData(null);
        }
      } finally {
        setExercisesLoading(false);
      }
    };

    fetchExercises();
    return () => controller.abort();
  }, [workoutId, useMockData]);

  const title = workout?.title || "Workout Session";
  const finalExercisesData = useMockData ? MOCK_EXERCISES : exercisesData;
  const finalExercisesLoading = useMockData ? false : exercisesLoading;

  const updateSetField = async (setId, field, value) => {
    const normalizedValue = value === "" ? "" : Number(value);

    setGroupedExercises((current) =>
      current.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map((setItem) =>
          setItem.id === setId ? { ...setItem, [field]: normalizedValue } : setItem
        ),
      }))
    );

    const payload = { [field]: normalizedValue };
    setApiError(null);

    try {
      const response = await apiFetch(`workout-exercises/${setId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Unable to save set changes.");
      }
    } catch {
      setApiError("Unable to save set changes.");
    }
  };

  const handleAddExercise = async (exercise) => {
    if (!workoutId) return;
    setSaving(true);
    setApiError(null);

    const position = groupedExercises.length > 0 ? Math.max(...groupedExercises.map((item) => item.position)) + 1 : 1;
    const templateSet = exercise.category === "cardio"
      ? { duration_sec: 0, distance_m: 0, pace_sec_per_km: 0 }
      : { weight: 0, reps: 0, rpe: 0 };

    try {
      const response = await apiFetch(`workouts/${workoutId}/exercises`, {
        method: "POST",
        body: JSON.stringify({
          exercise_id: exercise.exercise_id,
          position,
          category: exercise.category || "strength",
          ...templateSet,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to add exercise.");
      }

      const createdSet = await response.json();
      const createdId = createdSet?.workout_exercise_id || createdSet?.workout_exercise_ids?.[0] || createdSet?.id;
      const newWorkoutExercise = {
        ...templateSet,
        id: createdId,
        workout_exercise_id: createdId,
        workout_id: Number(workoutId),
        exercise_id: exercise.exercise_id,
        name: exercise.name,
        position,
        category: exercise.category || "strength",
      };

      const grouped = groupSetsByExercise([...(workout?.workout_exercises || []), newWorkoutExercise]);
      setGroupedExercises(grouped);
      setWorkout((current) => ({
        ...current,
        workout_exercises: [...(current?.workout_exercises || []), newWorkoutExercise],
      }));
      setIsModalOpen(false);
    } catch {
      setApiError("Unable to add exercise.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSet = async (exercise) => {
    if (!workoutId) return;
    setSaving(true);
    setApiError(null);

    const baseSet = exercise.category === "cardio"
      ? { duration_sec: 0, distance_m: 0, pace_sec_per_km: 0 }
      : { weight: 0, reps: 0, rpe: 0 };

    try {
      const response = await apiFetch(`workouts/${workoutId}/exercises`, {
        method: "POST",
        body: JSON.stringify({
          exercise_id: exercise.exercise_id,
          position: exercise.position,
          category: exercise.category,
          ...baseSet,
        }),
      });
      if (!response.ok) {
        throw new Error("Unable to add set.");
      }

      const createdSet = await response.json();
      const createdId = createdSet?.workout_exercise_id || createdSet?.workout_exercise_ids?.[0] || createdSet?.id;
      const newWorkoutExercise = {
        id: createdId,
        workout_exercise_id: createdId,
        workout_id: Number(workoutId),
        exercise_id: exercise.exercise_id,
        name: exercise.name,
        position: exercise.position,
        category: exercise.category,
        ...baseSet,
      };

      setGroupedExercises((current) =>
        current.map((item) =>
          item.exercise_id === exercise.exercise_id && item.position === exercise.position
            ? { ...item, sets: [...item.sets, newWorkoutExercise] }
            : item
        )
      );
    } catch {
      setApiError("Unable to add set.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExercise = async (exercise) => {
    setSaving(true);
    setApiError(null);

    try {
      await Promise.all(
        exercise.sets.map((setItem) =>
          apiFetch(`workout-exercises/${setItem.workout_exercise_id ?? setItem.id}`, {
            method: "DELETE",
          })
        )
      );
      setGroupedExercises((current) =>
        current.filter((item) => !(item.exercise_id === exercise.exercise_id && item.position === exercise.position))
      );
    } catch {
      setApiError("Unable to delete exercise.");
    } finally {
      setSaving(false);
    }
  };

  const groupedDisplay = useMemo(
    () => [...groupedExercises].sort((a, b) => a.position - b.position),
    [groupedExercises]
  );

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-[2rem] border border-fuchsia-500/70 bg-slate-950/80 p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                Workout session
                {useMockData && <span className="ml-2 rounded-full bg-yellow-900/50 px-2 py-1 text-xs text-yellow-300">Demo Data</span>}
              </p>
              <h1 className="mt-2 text-4xl font-bold text-white">{title}</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                disabled={saving}
                className="rounded-full bg-fuchsia-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:bg-fuchsia-400/60"
              >
                Add Exercise
              </button>
              <button
                type="button"
                disabled={saving}
                className="rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-fuchsia-500 disabled:cursor-not-allowed disabled:border-slate-700/50 disabled:text-slate-500"
              >
                Finish Workout
              </button>
            </div>
          </div>
        </header>

        {!useMockData && workoutLoading ? (
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 text-center text-slate-400">Loading workout session…</div>
        ) : !useMockData && workoutError ? (
          <div className="rounded-[2rem] border border-red-500/40 bg-red-500/10 p-8 text-center text-red-200">{workoutError}</div>
        ) : (
          <div className="grid gap-6">
            {apiError && (
              <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">{apiError}</div>
            )}
            {groupedDisplay.length === 0 ? (
              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-8 text-center text-slate-400">No exercises in this workout yet. Add one to get started.</div>
            ) : (
              groupedDisplay.map((exercise) => (
                <SessionExerciseCard
                  key={`${exercise.exercise_id}-${exercise.position}`}
                  exercise={exercise}
                  onSetUpdate={updateSetField}
                  onAddSet={handleAddSet}
                  onDeleteExercise={handleDeleteExercise}
                />
              ))
            )}
          </div>
        )}
      </div>

      <AddExerciseModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        exercises={finalExercisesData || []}
        loading={finalExercisesLoading}
        onSelectExercise={handleAddExercise}
      />
    </div>
  );
}
