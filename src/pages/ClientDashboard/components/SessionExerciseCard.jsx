import React from "react";

const strengthColumns = [
  { key: "weight", label: "Weight" },
  { key: "reps", label: "Reps" },
  { key: "rpe", label: "RPE" },
];

const cardioColumns = [
  { key: "duration_sec", label: "Duration" },
  { key: "distance_m", label: "Distance" },
  { key: "pace_sec_per_km", label: "Pace" },
];

function SetRow({ setItem, category, onChange }) {
  const columns = category === "cardio" ? cardioColumns : strengthColumns;
  const setNumber = setItem.set_number || setItem.id || setItem.workout_exercise_id;

  return (
    <div className="grid grid-cols-[1fr_repeat(3,minmax(80px,1fr))] gap-3 items-center py-2 px-3 border-b border-slate-700 text-sm">
      <div className="font-medium text-slate-100">Set {setNumber}</div>
      {columns.map((column) => {
        const value = setItem[column.key] ?? "";
        return (
          <input
            key={column.key}
            type="number"
            value={value}
            onChange={(e) => onChange(setItem.id, column.key, e.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-950/80 px-2 py-1 text-right text-slate-100 outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/20"
          />
        );
      })}
    </div>
  );
}

export default function SessionExerciseCard({ exercise, onSetUpdate, onAddSet, onDeleteExercise }) {
  const columns = exercise.category === "cardio" ? cardioColumns : strengthColumns;
  const cardTitle = exercise.name || `Exercise ${exercise.exercise_id}`;

  return (
    <div className="rounded-3xl border border-fuchsia-500/80 bg-slate-950/80 shadow-xl shadow-black/20 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-fuchsia-500/30 bg-slate-900/90 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">{cardTitle}</h3>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{exercise.category || "strength"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onAddSet(exercise)}
              className="rounded-full bg-fuchsia-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-fuchsia-400"
            >
              + Add Set
            </button>
            <button
              type="button"
              onClick={() => onDeleteExercise(exercise)}
              className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-fuchsia-500 hover:text-white"
            >
              Delete Exercise
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_repeat(3,minmax(80px,1fr))] gap-3 bg-slate-950/90 px-3 py-3 text-xs uppercase tracking-[0.15em] text-slate-400 sm:px-6 sm:py-4">
        <div className="font-semibold">Set</div>
        {columns.map((column) => (
          <div key={column.key} className="text-right font-semibold">
            {column.label}
          </div>
        ))}
      </div>

      <div>
        {exercise.sets.map((setItem) => (
          <SetRow key={setItem.id} setItem={setItem} category={exercise.category} onChange={onSetUpdate} />
        ))}
      </div>
    </div>
  );
}
