import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import usePostToAPI from "@/hooks/usePostToAPI";

const SPECIALIZATIONS = [
  { value: "EXERCISE", label: "Exercise" },
  { value: "NUTRITION", label: "Nutrition" },
  { value: "BOTH", label: "Both" },
];

const CoachSurvey = ({ onSubmitted }) => {
  const navigate = useNavigate();

  const [specialization, setSpecialization] = useState(SPECIALIZATIONS[0].value);
  const [qualifications, setQualifications] = useState("");
  const [costPerHour, setCostPerHour] = useState("");

  const inputClass =
    "border-input bg-background text-foreground ring-ring/50 " +
    "placeholder:text-muted-foreground focus-visible:border-ring h-9 " +
    "w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3";
  const { postFunction, loading } = usePostToAPI();
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const payload = {
      specialization,
      qualifications: qualifications.trim(),
      coach_cost: costPerHour === "" ? null : Number(costPerHour),
    };

    const endpoint = "/users/onboarding/submit_coach_survey";
    try {
      await postFunction(endpoint, payload);
      onSubmitted?.();
      navigate("/coachDashboard", { replace: true });
    } catch (err) {
      setSubmitError(err?.message || "Could not save your coach survey.");
    }
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
          {submitError && (
            <p className="text-destructive text-sm" role="alert">
              {submitError}
            </p>
          )}
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
                  className="flex cursor-pointer items-center gap-3 text-sm"
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
                inputClass + " min-h-[96px] resize-y py-2 leading-relaxed"
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

          <Button type="submit" className="mt-2 w-full" size="lg" disabled={loading}>
            {loading ? "Saving…" : "Save and continue"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CoachSurvey;
