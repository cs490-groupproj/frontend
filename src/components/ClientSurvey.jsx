import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";

const GOALS = [
  { id: 0, label: "Lose weight" },
  { id: 1, label: "Build muscle" },
  { id: 2, label: "Increase strength" },
  { id: 3, label: "Improve endurance" },
  { id: 4, label: "General fitness / stay active" },
  { id: 5, label: "Sports performance" },
];

const ClientSurvey = ({ onClose, onSubmitted }) => {
  const location = useLocation();
  const navState = location.state || {};

  const feetOptions = [3, 4, 5, 6, 7, 8, 9];
  const inchOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weightLbs, setWeightLbs] = useState("");

  const [selectedGoalIds, setSelectedGoalIds] = useState([]);
  const [otherEnabled, setOtherEnabled] = useState(false);
  const [otherText, setOtherText] = useState("");

  const [weightGoalLbs, setWeightGoalLbs] = useState("");
  const [dailyExerciseMinutes, setDailyExerciseMinutes] = useState("");
  const [dailyExerciseHours, setDailyExerciseHours] = useState(""); 

  const toggleGoal = (id) => {
    setSelectedGoalIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const heightInInches =
      heightFeet === "" || heightInches === ""
        ? null
        : Number(heightFeet) * 12 + Number(heightInches);

    const payload = {
      heightFeet: heightFeet === "" ? null : Number(heightFeet),
      heightInches: heightInches === "" ? null : Number(heightInches),
      weightLbs: weightLbs === "" ? null : Number(weightLbs),
      goalIds: selectedGoalIds,
      otherGoalText:
        otherEnabled && otherText.trim() ? otherText.trim() : null,
      weightGoalLbs: weightGoalLbs === "" ? null : Number(weightGoalLbs),
      dailyExerciseMinutes:
        dailyExerciseMinutes === "" ? null : Number(dailyExerciseMinutes),
    };

    console.log("client survey payload", payload);

    // TODO: replace with  backend endpoint.
    const endpoint = "/api/client/survey";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("survey failed:", res.status, text);
      }
    } catch (err) {
      console.error("survey request error:", err);
    }

    onSubmitted?.();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">
              Client survey
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Help us personalize your plan.
            </p>
          </div>
          {typeof onClose === "function" && (
            <Button type="button" variant="ghost" onClick={onClose}>
              Close
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Height</label>
          <div className="flex gap-3">
            <div className="flex-1">
              <select
                id="survey-height-feet"
                name="heightFeet"
                value={heightFeet}
                onChange={(e) => setHeightFeet(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground text-foreground outline-none ring-ring/50 focus-visible:border-ring focus-visible:ring-3"
                required
              >
                <option value="" disabled>
                  ft
                </option>
                {feetOptions.map((ft) => (
                  <option key={ft} value={ft}>
                    {ft} ft
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <select
                id="survey-height-inches"
                name="heightInches"
                value={heightInches}
                onChange={(e) => setHeightInches(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground text-foreground outline-none ring-ring/50 focus-visible:border-ring focus-visible:ring-3"
                required
              >
                <option value="" disabled>
                  in
                </option>
                {inchOptions.map((inch) => (
                  <option key={inch} value={inch}>
                    {inch} in
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="survey-weight-lbs" className="text-sm font-medium text-foreground">
            Weight (lbs)
          </label>
          <input
            id="survey-weight-lbs"
            name="weightLbs"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={weightLbs}
            onChange={(e) => setWeightLbs(e.target.value)}
            placeholder="150"
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none ring-ring/50 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Goals</label>
          <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-background p-3">
            {GOALS.map((g) => (
              <label key={g.id} className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={selectedGoalIds.includes(g.id)}
                  onChange={() => toggleGoal(g.id)}
                />
                <span>{g.label}</span>
              </label>
            ))}

            <div className="pt-2">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={otherEnabled}
                  onChange={(e) => setOtherEnabled(e.target.checked)}
                />
                <span>Other:</span>
              </label>
              <input
                type="text"
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                disabled={!otherEnabled}
                placeholder="Type your goal"
                className="mt-2 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none ring-ring/50 placeholder:text-muted-foreground disabled:opacity-50 focus-visible:border-ring focus-visible:ring-3"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="survey-weight-goal" className="text-sm font-medium text-foreground">
            Weight goal (lbs)
          </label>
          <input
            id="survey-weight-goal"
            name="weightGoalLbs"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={weightGoalLbs}
            onChange={(e) => setWeightGoalLbs(e.target.value)}
            placeholder="130"
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none ring-ring/50 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
       
          <label
            htmlFor="survey-daily-exercise-min"
            className="text-sm font-medium text-foreground"
          >
            Daily exercise goal (minutes)
          </label>
          <div className="flex gap-3">
          <div className="flex flex-1 items-center">
            <input
                id="survey-daily-exercise-hr"
                name="dailyExerciseHours"
                type="number"
                inputMode="numeric"
                value={dailyExerciseHours}
                onChange={(e) => setDailyExerciseHours(e.target.value)}
                placeholder="0"
                className="h-9 w-full rounded-lg border border-input bhg-background px-3 text-sm text-foreground outline-none ring-ring/50 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3"
                required
            />
            <span className="text-sm text-foreground">
                hr(s)
            </span>
            </div>
            <div className="flex flex-1 items-center">
            <input
                
                id="survey-daily-exercise-min"
                name="dailyExerciseMinutes"
                type="number"
                inputMode="numeric"
                min={0}
                step={5}
                value={dailyExerciseMinutes}
                onChange={(e) => setDailyExerciseMinutes(e.target.value)}
                placeholder="30"
                className="h-9 w-full rounded-lg border border-input bhg-background px-3 text-sm text-foreground outline-none ring-ring/50 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3"
                required
            />
            <span className="text-sm text-foreground">
                min(s)
            </span>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg">
          Save survey
        </Button>
        </form>
      </div>
    </div>
  );
};

export default ClientSurvey;

