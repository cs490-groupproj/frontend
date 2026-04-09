import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/utils.js";

function TemplateCard({ template, isPremade, onSelect }) {
  return (
    <button
      onClick={() => onSelect(template)}
      className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 p-6 text-left transition hover:border-fuchsia-500 hover:bg-slate-900"
    >
      <h3 className="text-lg font-bold text-white">{template.title}</h3>
      <p className="mt-2 text-sm text-slate-400">Workout template</p>
      {isPremade && (
        <span className="mt-3 inline-block rounded-full bg-fuchsia-500/20 px-3 py-1 text-xs font-semibold text-fuchsia-300">
          App Template
        </span>
      )}
    </button>
  );
}

function TemplatePreview({ template, onConfirm, onCancel, isSaving }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-fuchsia-500/70 bg-slate-950 p-8 shadow-2xl shadow-black/40">
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
            className="flex-1 rounded-full border border-slate-700 bg-slate-900 px-4 py-3 font-semibold text-slate-100 transition hover:border-fuchsia-500 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSaving}
            className="flex-1 rounded-full bg-fuchsia-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:bg-fuchsia-400/60"
          >
            {isSaving ? "Starting..." : "Start Workout"}
          </button>
        </div>
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

  React.useEffect(() => {
    const fetchPlans = async () => {
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
    };
    fetchPlans();
  }, []);

  const templates = workoutPlans;

  const handleStartEmpty = async () => {
    setIsSaving(true);
    try {
      const response = await apiFetch("workouts", {
        method: "POST",
        body: JSON.stringify({ title: "New Workout" }),
      });
      if (response.ok) {
        const data = await response.json();
        navigate(`/workout-session/${data.workout_id}`);
      } else {
        const errorText = await response.text();
        alert("Failed to create workout: HTTP error: Status " + response.status + " - " + errorText);
      }
    } catch (error) {
      alert("Failed to create workout: " + (error.message || "Unknown error"));
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
            className="rounded-3xl border border-fuchsia-500/80 bg-fuchsia-500/10 px-8 py-6 text-lg font-semibold text-fuchsia-300 transition hover:bg-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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
          ) : templates.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-400">No templates available.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <TemplateCard
                  key={template.workout_plan_id}
                  template={template}
                  isPremade={!template.created_by}
                  onSelect={setSelectedTemplate}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedTemplate && (
        <TemplatePreview
          template={selectedTemplate}
          onConfirm={handleStartTemplate}
          onCancel={() => setSelectedTemplate(null)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
