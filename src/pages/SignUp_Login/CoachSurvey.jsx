import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SPECIALIZATIONS = [
  { value: "fitness", label: "Fitness" },
  { value: "nutrition", label: "Nutrition" },
  { value: "both", label: "Both" },
];

const CoachSurvey = () => {
  const navigate = useNavigate();

  const feetOptions = [3, 4, 5, 6, 7, 8, 9];
  const inchOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [specialization, setSpecialization] = useState("fitness");
  const [qualifications, setQualifications] = useState("");
  const [costPerHour, setCostPerHour] = useState("");

  const inputClass =
    "border-input bg-background text-foreground ring-ring/50 " +
    "placeholder:text-muted-foreground focus-visible:border-ring h-9 " +
    "w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3";

  const selectClass =
    "border-input bg-background placeholder:text-muted-foreground " +
    "text-foreground ring-ring/50 focus-visible:border-ring h-9 w-full " +
    "rounded-lg border px-3 text-sm outline-none focus-visible:ring-3";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      heightFeet: heightFeet === "" ? null : Number(heightFeet),
      heightInches: heightInches === "" ? null : Number(heightInches),
      heightInInches:
        heightFeet === "" || heightInches === ""
          ? null
          : Number(heightFeet) * 12 + Number(heightInches),
      weightLbs: weightLbs === "" ? null : Number(weightLbs),
      specialization,
      qualifications: qualifications.trim() || null,
      costPerHour: costPerHour === "" ? null : Number(costPerHour),
    };

    console.log("coach survey payload", payload);

    // TODO: replace with backend endpoint + Authorization header
    const endpoint = "/api/coach/survey";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("coach survey failed:", res.status, text);
      }
    } catch (err) {
      console.error("coach survey request error:", err);
    }

    navigate("/", { replace: true });
  };

  return (
    <div
      className="bg-background flex min-h-screen items-center justify-center
        px-4 py-10"
    >
      <div
        className="border-border bg-card w-full max-w-md rounded-xl border p-6
          shadow-sm"
      >
        <div>
          <h2 className="text-card-foreground text-lg font-semibold">
            Coach survey
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Tell clients about your background and rates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-foreground text-sm font-medium">
              Height
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <select
                  id="coach-survey-height-feet"
                  name="heightFeet"
                  value={heightFeet}
                  onChange={(e) => setHeightFeet(e.target.value)}
                  className={selectClass}
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
                  id="coach-survey-height-inches"
                  name="heightInches"
                  value={heightInches}
                  onChange={(e) => setHeightInches(e.target.value)}
                  className={selectClass}
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
            <label
              htmlFor="coach-survey-weight"
              className="text-foreground text-sm font-medium"
            >
              Weight (lbs)
            </label>
            <input
              id="coach-survey-weight"
              name="weightLbs"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={weightLbs}
              onChange={(e) => setWeightLbs(e.target.value)}
              placeholder="180"
              className={inputClass}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-foreground text-sm font-medium">
              Specialization
            </span>
            <div
              className="border-border bg-background flex flex-col gap-3
                rounded-lg border p-3"
            >
              {SPECIALIZATIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-3
                    text-sm"
                >
                  <input
                    type="radio"
                    name="specialization"
                    value={opt.value}
                    checked={specialization === opt.value}
                    onChange={() => setSpecialization(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="coach-survey-qualifications"
              className="text-foreground text-sm font-medium"
            >
              Qualifications
            </label>
            <textarea
              id="coach-survey-qualifications"
              name="qualifications"
              rows={4}
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              placeholder="Certifications, experience, focus areas…"
              className={
                inputClass +
                " min-h-[96px] resize-y py-2 leading-relaxed"
              }
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="coach-survey-rate"
              className="text-foreground text-sm font-medium"
            >
              Cost per hour ($)
            </label>
            <input
              id="coach-survey-rate"
              name="costPerHour"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              value={costPerHour}
              onChange={(e) => setCostPerHour(e.target.value)}
              placeholder="35.00"
              className={inputClass}
              required
            />
          </div>

          <Button type="submit" className="mt-2 w-full" size="lg">
            Save and continue
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CoachSurvey;
