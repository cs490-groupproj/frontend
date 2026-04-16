import React, { useMemo, useState } from "react";
import useGetFromAPI from "@/hooks/useGetFromAPI";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function dateKeyFromRow(dateSubmitted) {
  if (!dateSubmitted) return null;
  return String(dateSubmitted).slice(0, 10);
}

function buildLastNDaysChartData(apiRows, n = 7) {
  const byDate = new Map();
  for (const r of apiRows || []) {
    const k = dateKeyFromRow(r.date_submitted);
    if (k) byDate.set(k, r);
  }
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const row = byDate.get(key);
    out.push({
      dayShort: d.toLocaleDateString(undefined, { weekday: "short" }), 
      dayDate: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), 
      mood: row?.mood ?? null,
      energy: row?.energy ?? null,
      sleep: row?.sleep ?? null,
    });
  }
  return out;
}

function dateKeyFromCompletion(completionDate) {
  if (!completionDate) return null;
  return String(completionDate).slice(0, 10);
}

function buildWorkoutMetricChartData(apiRows, n, valueKey) {
  const summedByDate = new Map();
  for (const row of apiRows || []) {
    const key = dateKeyFromCompletion(row.completion_date);
    if (!key) continue;
    const rawValue = Number(row?.[valueKey]);
    const safeValue = Number.isFinite(rawValue) ? rawValue : 0;
    summedByDate.set(key, (summedByDate.get(key) || 0) + safeValue);
  }

  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({
      dayShort: d.toLocaleDateString(undefined, { weekday: "short" }),
      dayDate: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      [valueKey]: summedByDate.get(key) ?? 0,
    });
  }
  return out;
}

function buildCaloriesChartData(apiRows, n) {
  const summedByDate = new Map();
  for (const row of apiRows || []) {
    const key = dateKeyFromRow(row.date_submitted);
    if (!key) continue;
    const rawValue = Number(row?.daily_total_calories);
    const safeValue = Number.isFinite(rawValue) ? rawValue : 0;
    summedByDate.set(key, (summedByDate.get(key) || 0) + safeValue);
  }

  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({
      dayShort: d.toLocaleDateString(undefined, { weekday: "short" }),
      dayDate: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      daily_total_calories: Math.round(summedByDate.get(key) ?? 0),
    });
  }
  return out;
}

function WorkoutMetricChart({
  title,
  data,
  valueKey,
  range,
  colorVar,
  yAxisFormatter,
  tooltipFormatter,
}) {
  const safeTickFormatter = (value) =>
    typeof yAxisFormatter === "function" ? yAxisFormatter(value) : value;
  const safeTooltipFormatter =
    typeof tooltipFormatter === "function"
      ? tooltipFormatter
      : (value) => [value, title];

  return (
    <section className="border-border bg-card text-card-foreground rounded-xl border p-4">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <div className="h-72 w-full min-h-[288px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 10, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey={range === 90 ? "dayDate" : "dayShort"}
              interval={range === 90 ? 8 : 0}
              tick={{ fill: "var(--muted-foreground)" }}
            />
            <YAxis
              width={70}
              tick={{ fill: "var(--muted-foreground)" }}
              allowDecimals={false}
              tickFormatter={(value) => safeTickFormatter(Math.round(value))}
            />
            <Tooltip
              formatter={safeTooltipFormatter}
              contentStyle={{
                backgroundColor: "var(--popover)",
                border: "1px solid var(--border)",
                color: "var(--popover-foreground)",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={valueKey}
              stroke={colorVar}
              strokeWidth={3}
              connectNulls
              name={title}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

const Stats = () => {
  const [range, setRange] = useState(7);
  const [calRange, setCalRange] = useState(7);
  const [workoutRange, setWorkoutRange] = useState(30);

  const userId = localStorage.getItem("userId");
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const uri = userId ? `/clients/${userId}/daily_survey/history?days=${range}` : null;
  const { data, loading, error } = useGetFromAPI(uri, undefined, false);
  const caloriesUri = userId
    ? `/nutrition/history?user_id=${userId}&timezone=${encodeURIComponent(timezone)}&days=${range}`
    : null;
  const {
    data: caloriesData,
    loading: caloriesLoading,
    error: caloriesError,
  } = useGetFromAPI(caloriesUri, range);
  const setsUri = userId
    ? `/workouts/history/sets-logged?user_id=${userId}&days=${workoutRange}`
    : null;
  const workoutTimeUri = userId
    ? `/workouts/history/total-workout-time?user_id=${userId}&days=${workoutRange}`
    : null;
  const workoutVolumeUri = userId
    ? `/workouts/history/total-volume?user_id=${userId}&days=${workoutRange}`
    : null;
  const { data: setsData, loading: setsLoading, error: setsError } = useGetFromAPI(
    setsUri,
    workoutRange
  );
  const { data: workoutTimeData, loading: workoutTimeLoading, error: workoutTimeError } =
    useGetFromAPI(workoutTimeUri, workoutRange);
  const { data: workoutVolumeData, loading: workoutVolumeLoading, error: workoutVolumeError } =
    useGetFromAPI(workoutVolumeUri, workoutRange);

  const chartData = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    return buildLastNDaysChartData(rows, range);
  }, [data, range]);
  const setsChartData = useMemo(() => {
    const rows = Array.isArray(setsData) ? setsData : [];
    return buildWorkoutMetricChartData(rows, workoutRange, "sets_logged");
  }, [setsData, workoutRange]);
  const workoutTimeChartData = useMemo(() => {
    const rows = Array.isArray(workoutTimeData) ? workoutTimeData : [];
    return buildWorkoutMetricChartData(rows, workoutRange, "total_workout_time");
  }, [workoutTimeData, workoutRange]);
  const workoutVolumeChartData = useMemo(() => {
    const rows = Array.isArray(workoutVolumeData) ? workoutVolumeData : [];
    return buildWorkoutMetricChartData(rows, workoutRange, "total_volume");
  }, [workoutVolumeData, workoutRange]);
  const caloriesChartData = useMemo(() => {
    const rows = Array.isArray(caloriesData) ? caloriesData : [];
    return buildCaloriesChartData(rows, calRange);
  }, [caloriesData, calRange]);
  const workoutLoading = setsLoading || workoutTimeLoading || workoutVolumeLoading;
  const workoutError = setsError || workoutTimeError || workoutVolumeError;



  return (
    <div className="w-full space-y-4 p-6">
      <section className="border-border bg-card text-card-foreground rounded-xl border p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Mood, energy & sleep (last {range} days)</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRange(7)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                range === 7 
                ? "bg-muted text-foreground" 
                : "text-muted-foreground"
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setRange(30)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                range === 30 
                ? "bg-muted text-foreground" 
                : "text-muted-foreground"
              }`}
            >
              30D
            </button>
          </div>
        </div>
        
        {error ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}
        
        <div className="h-80 w-full min-h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey={range === 30 ? "dayDate" : "dayShort"} interval={range === 30 ? 4 : 0} tick={{ fill: "var(--muted-foreground)" }} />
              <YAxis domain={[0, 10]} tick={{ fill: "var(--muted-foreground)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  color: "var(--popover-foreground)",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="mood" stroke="var(--chart-1)" strokeWidth={3} connectNulls />
              <Line type="monotone" dataKey="energy" stroke="var(--chart-2)" strokeWidth={3} connectNulls />
              <Line type="monotone" dataKey="sleep" stroke="var(--chart-3)" strokeWidth={3} connectNulls />
            </LineChart>
          </ResponsiveContainer>

        </div>
      </section>
      <section className="border-border bg-card text-card-foreground rounded-xl border p-4">
          <div className="mb-4 flex items-center justify-between">
        <h2 className="mb-4 text-xl font-semibold">Calories intake (last {calRange} days)</h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCalRange(7)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                calRange === 7 
                ? "bg-muted text-foreground" 
                : "text-muted-foreground"
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setCalRange(30)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                calRange === 30 
                ? "bg-muted text-foreground" 
                : "text-muted-foreground"
              }`}
            >
              30D
            </button>
          </div>
          </div>
            {caloriesError ? (
          <p className="text-destructive text-sm" role="alert">
            {caloriesError}
          </p>
        ) : null}
        <div className="h-80 w-full min-h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={caloriesChartData}
              margin={{ top: 8, right: 12, left: 10, bottom: 0 }}
            >
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey={calRange === 30 ? "dayDate" : "dayShort"}
                interval={calRange === 30 ? 4 : 0}
                tick={{ fill: "var(--muted-foreground)" }}
              />
              <YAxis
                width={70}
                tick={{ fill: "var(--muted-foreground)" }}
                allowDecimals={false}
                tickFormatter={(value) => `${Math.round(value)}`}
              />
              <Tooltip
                formatter={(value) => [`${Math.round(value)} kcal`, "Calories intake"]}
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  color: "var(--popover-foreground)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="daily_total_calories"
                stroke="var(--chart-4)"
                strokeWidth={3}
                name="Calories intake"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="border-border bg-card text-card-foreground rounded-xl border p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Workout trends (last {workoutRange} days)
          </h2>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWorkoutRange(7)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                workoutRange === 7 ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setWorkoutRange(30)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                workoutRange === 30 ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              30D
            </button>
            <button
              onClick={() => setWorkoutRange(90)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                workoutRange === 90 ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              90D
            </button>
          </div>
        </div>
        {workoutLoading ? (
          <p className="text-muted-foreground text-sm">Loading workout trends...</p>
        ) : null}
        {workoutError ? (
          <p className="text-destructive text-sm" role="alert">
            {workoutError}
          </p>
        ) : null}
      </section>

      <WorkoutMetricChart
        title="Sets logged"
        data={setsChartData}
        valueKey="sets_logged"
        range={workoutRange}
        colorVar="var(--chart-1)"
      />
      <WorkoutMetricChart
        title="Total workout time"
        data={workoutTimeChartData}
        valueKey="total_workout_time"
        range={workoutRange}
        colorVar="var(--chart-2)"
        yAxisFormatter={(value) => `${value} min`}
        tooltipFormatter={(value) => [`${value} min`, "Total workout time"]}
      />
      <WorkoutMetricChart
        title="Total volume"
        data={workoutVolumeChartData}
        valueKey="total_volume"
        range={workoutRange}
        colorVar="var(--chart-3)"
        yAxisFormatter={(value) => `${value} lbs`}
        tooltipFormatter={(value) => [`${Number(value).toLocaleString()} lbs`, "Total volume"]}
      />
    </div>
  );
};

export default Stats;