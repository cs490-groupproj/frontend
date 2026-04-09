/**
 * Maps exercise category (name from API, e.g. /exercises `category` field) to UI metric sets.
 * Categories not listed as special cases use weight + reps + RPE.
 */

export const METRIC_TYPES = {
  WEIGHT_REPS_RPE: "weight_reps_rpe",
  CARDIO: "cardio",
  DURATION: "duration",
  REPS_ONLY: "reps_only",
};

function normalizeCategoryName(value) {
  if (value == null) return "";
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * @param {object} exercise - grouped exercise row or catalog exercise with `category` and/or `category_id`
 */
export function getMetricType(exercise) {
  const raw =
    exercise?.category ??
    exercise?.exercise?.category ??
    "";
  const name = normalizeCategoryName(raw);

  if (name === "cardio") return METRIC_TYPES.CARDIO;
  if (name === "reps only") return METRIC_TYPES.REPS_ONLY;
  if (name === "duration") return METRIC_TYPES.DURATION;

  return METRIC_TYPES.WEIGHT_REPS_RPE;
}

export function getMetricColumns(metricType) {
  switch (metricType) {
    case METRIC_TYPES.CARDIO:
      return [
        { key: "distance_m", label: "Distance (m)" },
        { key: "pace_sec_per_km", label: "Pace (s/km)" },
      ];
    case METRIC_TYPES.DURATION:
      return [{ key: "duration_sec", label: "Duration (sec)" }];
    case METRIC_TYPES.REPS_ONLY:
      return [{ key: "reps", label: "Reps" }];
    default:
      return [
        { key: "weight", label: "Weight" },
        { key: "reps", label: "Reps" },
        { key: "rpe", label: "RPE" },
      ];
  }
}

export function getDefaultFieldsForMetricType(metricType) {
  switch (metricType) {
    case METRIC_TYPES.CARDIO:
      return { distance_m: 0, pace_sec_per_km: 0 };
    case METRIC_TYPES.DURATION:
      return { duration_sec: 0 };
    case METRIC_TYPES.REPS_ONLY:
      return { reps: 0 };
    default:
      return { weight: 0, reps: 0, rpe: 0 };
  }
}

/**
 * Merge master exercise category from /exercises catalog onto workout rows when missing.
 */
export function enrichWorkoutExerciseRows(rows, catalog) {
  if (!Array.isArray(rows)) return rows;
  if (!catalog?.length) return rows;
  const byId = new Map(catalog.map((e) => [e.exercise_id, e]));
  return rows.map((row) => {
    const master = byId.get(row.exercise_id);
    const category = master?.category ?? row.category ?? row.exercise?.category;
    return { ...row, category };
  });
}
