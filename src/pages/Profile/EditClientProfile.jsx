import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import useGetFromAPI from "@/hooks/useGetFromAPI";
import usePatchToAPI from "@/hooks/usePatchToAPI";

const GOALS = [
  { id: 0, label: "Lose weight" },
  { id: 1, label: "Build muscle" },
  { id: 2, label: "Increase strength" },
  { id: 3, label: "Improve endurance" },
  { id: 4, label: "General fitness / stay active" },
  { id: 5, label: "Sports performance" },
];

const feetOptions = [3, 4, 5, 6, 7, 8, 9];
const inchOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const HEIGHT_STORAGE_KEY = "client_height_inches";
const LEGACY_HEIGHT_STORAGE_KEY = "heightInInches";

function goalsFromBinary(binary = "") {
  return binary
    .split("")
    .map((char, idx) => (char === "1" ? idx : null))
    .filter((idx) => idx !== null);
}

function binaryFromGoals(selectedGoalIds) {
  return Array.from({ length: GOALS.length }, (_, idx) =>
    selectedGoalIds.includes(idx) ? "1" : "0"
  ).join("");
}

export default function EditClientProfile() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const {
    data: meData,
    loading: meLoading,
    error: meError,
  } = useGetFromAPI("/users/me", refreshTrigger);
  const resolvedUserId = localStorage.getItem("userId");

  useEffect(() => {
    if (meData?.user_id) {
      localStorage.getItem("userId");
    }
  }, [meData]);

  const { data: profileData, loading: profileLoading } = useGetFromAPI(
    resolvedUserId ? `/users/${resolvedUserId}/profile` : null,
    refreshTrigger
  );
  const { patchFunction, loading: saving } = usePatchToAPI();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weightGoalLbs, setWeightGoalLbs] = useState("");
  const [selectedGoalIds, setSelectedGoalIds] = useState([]);
  const [personalGoals, setPersonalGoals] = useState("");
  const [dailyExerciseHours, setDailyExerciseHours] = useState("");
  const [dailyExerciseMinutes, setDailyExerciseMinutes] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!profileData) return;

    const clientGoals = profileData.client_goals || {};
    const totalExerciseMins = clientGoals.exercise_minutes_goal || 0;
    const storedHeightInInchesRaw =
      localStorage.getItem(HEIGHT_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_HEIGHT_STORAGE_KEY);
    const storedHeightInches = Number(storedHeightInInchesRaw);
    const backendHeightInches = Number(clientGoals.heightInInches);
    const resolvedHeightInches =
      !Number.isNaN(storedHeightInches) && storedHeightInches > 0
        ? storedHeightInches
        : !Number.isNaN(backendHeightInches) && backendHeightInches > 0
          ? backendHeightInches
          : null;

    setFirstName(profileData.first_name || "");
    setLastName(profileData.last_name || "");
    setEmail(profileData.email || "");
    setWeightGoalLbs(
      clientGoals.weight_goal === null || clientGoals.weight_goal === undefined
        ? ""
        : String(clientGoals.weight_goal)
    );
    setSelectedGoalIds(goalsFromBinary(clientGoals.primary_goals_binary || ""));
    setPersonalGoals(clientGoals.personal_goals || "");
    setDailyExerciseHours(
      totalExerciseMins ? String(Math.floor(totalExerciseMins / 60)) : ""
    );
    setDailyExerciseMinutes(
      totalExerciseMins ? String(totalExerciseMins % 60) : ""
    );

    if (resolvedHeightInches !== null) {
      setHeightFeet(String(Math.floor(resolvedHeightInches / 12)));
      setHeightInches(String(resolvedHeightInches % 12));
    }
  }, [profileData]);

  const goalsBinary = useMemo(
    () => binaryFromGoals(selectedGoalIds),
    [selectedGoalIds]
  );

  const toggleGoal = (id) => {
    setSelectedGoalIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolvedUserId) {
      setSubmitError("User id not found. Please log in again.");
      return;
    }

    setSubmitError("");
    setSubmitMessage("");

    const totalExerciseMinutes =
      (dailyExerciseHours === "" ? 0 : Number(dailyExerciseHours) * 60) +
      (dailyExerciseMinutes === "" ? 0 : Number(dailyExerciseMinutes));
    const calculatedHeightInches =
      heightFeet === "" || heightInches === ""
        ? null
        : Number(heightFeet) * 12 + Number(heightInches);

    try {
      await patchFunction(`/users/${resolvedUserId}/edit_account`, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      });

      await patchFunction(`/clients/${resolvedUserId}/edit_goals`, {
        primary_goals_binary: goalsBinary,
        weight: weightGoalLbs === "" ? null : Number(weightGoalLbs),
        exercise_minutes:
          totalExerciseMinutes > 0 ? totalExerciseMinutes : null,
        personal_goals: personalGoals.trim() ? personalGoals.trim() : null,
      });

      if (calculatedHeightInches !== null) {
        localStorage.setItem(
          HEIGHT_STORAGE_KEY,
          String(Math.max(0, calculatedHeightInches))
        );
      }

      setSubmitMessage("Profile updated.");
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setSubmitError(err?.message || "Failed to update profile.");
    }
  };

  if (meLoading || profileLoading) {
    return (
      <div className="w-full max-w-3xl">
        <h1 className="text-foreground text-2xl font-semibold">Edit Profile</h1>
        <p className="text-muted-foreground mt-4">Loading profile...</p>
      </div>
    );
  }

  if (!resolvedUserId || meError) {
    return (
      <div className="w-full max-w-3xl">
        <h1 className="text-foreground text-2xl font-semibold">Edit Profile</h1>
        <p className="text-destructive mt-4">
          Unable to load your profile. Please log in again.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-foreground text-3xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Update your account and fitness goals.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <section className="border-border bg-card space-y-4 rounded-xl border p-6">
          <div>
            <h2 className="text-foreground text-lg font-semibold">Account</h2>
            <p className="text-muted-foreground text-sm">
              Personal account information.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-foreground text-sm font-medium">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                className="border-input bg-background text-foreground ring-ring/50
                  focus-visible:border-ring h-9 w-full rounded-lg border px-3
                  text-sm outline-none focus-visible:ring-3"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-foreground text-sm font-medium">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="border-input bg-background text-foreground ring-ring/50
                  focus-visible:border-ring h-9 w-full rounded-lg border px-3
                  text-sm outline-none focus-visible:ring-3"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-foreground text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="border-input bg-background text-foreground ring-ring/50
                focus-visible:border-ring h-9 w-full rounded-lg border px-3
                text-sm outline-none focus-visible:ring-3"
              required
            />
          </div>
        </section>

        <section className="border-border bg-card space-y-4 rounded-xl border p-6">
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              Fitness Goals
            </h2>
            <p className="text-muted-foreground text-sm">
              Height, weight, and goal preferences.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-foreground text-sm font-medium">Height</label>
            <div className="flex gap-3">
              <select
                value={heightFeet}
                onChange={(e) => setHeightFeet(e.target.value)}
                className="border-input bg-background text-foreground
                  ring-ring/50 focus-visible:border-ring h-9 w-full rounded-lg
                  border px-3 text-sm outline-none focus-visible:ring-3"
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
              <select
                value={heightInches}
                onChange={(e) => setHeightInches(e.target.value)}
                className="border-input bg-background text-foreground
                  ring-ring/50 focus-visible:border-ring h-9 w-full rounded-lg
                  border px-3 text-sm outline-none focus-visible:ring-3"
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

          <div className="flex flex-col gap-2">
            <label className="text-foreground text-sm font-medium">
              Weight Goal (lbs)
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={weightGoalLbs}
              onChange={(e) => setWeightGoalLbs(e.target.value)}
              className="border-input bg-background text-foreground ring-ring/50
                focus-visible:border-ring h-9 w-full rounded-lg border px-3
                text-sm outline-none focus-visible:ring-3"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-foreground text-sm font-medium">Goals</label>
            <div
              className="border-border bg-background grid grid-cols-1 gap-3
                rounded-lg border p-3"
            >
              {GOALS.map((goal) => (
                <label key={goal.id} className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedGoalIds.includes(goal.id)}
                    onChange={() => toggleGoal(goal.id)}
                  />
                  <span>{goal.label}</span>
                </label>
              ))}

              <input
                type="text"
                value={personalGoals}
                onChange={(e) => setPersonalGoals(e.target.value)}
                placeholder="Other personal goals"
                className="border-input bg-background text-foreground
                  ring-ring/50 focus-visible:border-ring mt-2 h-9 w-full rounded-lg
                  border px-3 text-sm outline-none focus-visible:ring-3"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-foreground text-sm font-medium">
              Daily Exercise Goal
            </label>
            <div className="flex gap-3">
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={dailyExerciseHours}
                  onChange={(e) => setDailyExerciseHours(e.target.value)}
                  className="border-input bg-background text-foreground
                    ring-ring/50 focus-visible:border-ring h-9 w-full rounded-lg
                    border px-3 text-sm outline-none focus-visible:ring-3"
                />
                <span className="text-foreground text-sm">hr(s)</span>
              </div>
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={dailyExerciseMinutes}
                  onChange={(e) => setDailyExerciseMinutes(e.target.value)}
                  className="border-input bg-background text-foreground
                    ring-ring/50 focus-visible:border-ring h-9 w-full rounded-lg
                    border px-3 text-sm outline-none focus-visible:ring-3"
                />
                <span className="text-foreground text-sm">min(s)</span>
              </div>
            </div>
          </div>
        </section>

        {submitError && (
          <p className="text-destructive text-sm" role="alert">
            {submitError}
          </p>
        )}
        {submitMessage && <p className="text-sm text-green-600">{submitMessage}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={saving}>
          {saving || profileLoading ? "Saving..." : "Save profile"}
        </Button>
      </form>
    </div>
  );
}
