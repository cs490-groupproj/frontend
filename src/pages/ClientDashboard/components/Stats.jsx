import React, { useMemo } from "react";
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

const Stats = () => {
  const [range, setRange] = React.useState(7);

  const userId = localStorage.getItem("userId");
  const uri = userId ? `/clients/${userId}/daily_survey/history?days=${range}` : null;
  const { data, loading, error } = useGetFromAPI(uri, undefined, false);

  const chartData = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    return buildLastNDaysChartData(rows, range);
  }, [data, range]);

  if (loading && userId) {
    return <p className="text-muted-foreground text-sm p-4">Loading statistics…</p>;
  }

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
    </div>
  );
};

export default Stats;