import React from "react";
import { getMetricColumns, getMetricType } from "../lib/exerciseCategoryMetrics.js";

function SetRow({ setItem, columns, onChange, onDeleteSet }) {
  const setNumber = setItem.set_number || setItem.id || setItem.workout_exercise_id;
  const setId = setItem.id ?? setItem.workout_exercise_id;

  return (
    <div
      className="grid gap-3 items-center py-2 px-3 border-b border-slate-700 text-sm"
      style={{
        gridTemplateColumns: `minmax(0,1fr) repeat(${columns.length}, minmax(72px, 1fr)) auto`,
      }}
    >
      <div className="font-medium text-slate-100">Set {setNumber}</div>
      {columns.map((column) => {
        const value = setItem[column.key] ?? "";
        return (
          <input
            key={column.key}
            type="number"
            value={value}
            onChange={(e) => onChange(setItem.id, column.key, e.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-950/80 px-2 py-1 text-right text-slate-100 outline-none transition focus:border-[#f61b59] focus:ring-2 focus:ring-[#f61b59]/20"
          />
        );
      })}
      <button
        type="button"
        onClick={() => onDeleteSet(setId)}
        className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-200 transition hover:border-[#f61b59] hover:text-white"
      >
        Delete
      </button>
    </div>
  );
}

export default function SessionExerciseCard({ exercise, onSetUpdate, onAddSet, onDeleteExercise, onDeleteSet }) {
  const metricType = getMetricType(exercise);
  const columns = getMetricColumns(metricType);
  const cardTitle = exercise.name || `Exercise ${exercise.exercise_id}`;
  const categoryLabel = exercise.category || "—";

  return (
    <div className="rounded-3xl border border-[#f61b59]/80 bg-slate-950/80 shadow-xl shadow-black/20 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[#f61b59]/30 bg-slate-900/90 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">{cardTitle}</h3>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{categoryLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onAddSet(exercise)}
              className="rounded-full bg-[#f61b59] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-[#f61b59]/90"
            >
              + Add Set
            </button>
            <button
              type="button"
              onClick={() => onDeleteExercise(exercise)}
              className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-[#f61b59] hover:text-white"
            >
              Delete Exercise
            </button>
          </div>
        </div>
      </div>

      <div
        className="grid gap-3 bg-slate-950/90 px-3 py-3 text-xs uppercase tracking-[0.15em] text-slate-400 sm:px-6 sm:py-4"
        style={{
          gridTemplateColumns: `minmax(0,1fr) repeat(${columns.length}, minmax(72px, 1fr)) auto`,
        }}
      >
        <div className="font-semibold">Set</div>
        {columns.map((column) => (
          <div key={column.key} className="text-right font-semibold">
            {column.label}
          </div>
        ))}
        <div className="text-right font-semibold">Actions</div>
      </div>

      <div>
        {exercise.sets.map((setItem) => (
          <SetRow key={setItem.id} setItem={setItem} columns={columns} onChange={onSetUpdate} onDeleteSet={onDeleteSet} />
        ))}
      </div>
    </div>
  );
}
