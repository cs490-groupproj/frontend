import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog } from "radix-ui";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useGetFromAPI from "@/hooks/useGetFromAPI";
import usePatchToAPI from "@/hooks/usePatchToAPI";
import DeleteAccount from "./components/DeleteAccount";
import { useNavigate } from "react-router-dom";

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

function formatHeightDisplay(feet, inches) {
  if (feet === "" || inches === "") return "—";
  return `${feet} ft ${inches} in`;
}

function formatExerciseDisplay(hours, minutes) {
  const h = hours === "" ? 0 : Number(hours);
  const m = minutes === "" ? 0 : Number(minutes);
  if (!h && !m) return "—";
  const parts = [];
  if (h) parts.push(`${h} hr${h !== 1 ? "s" : ""}`);
  if (m) parts.push(`${m} min`);
  return parts.join(" ");
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt
        className="text-muted-foreground w-full shrink-0 text-sm
          sm:max-w-[10rem]"
      >
        {label}
      </dt>
      <dd className="text-foreground text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

const dialogOverlayClass =
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50";
const dialogContentClass =
  "bg-card border-border fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg max-h-[min(90vh,720px)] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-xl border p-6 shadow-lg";

export default function EditClientProfile() {
  const navigate = useNavigate();

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { loading: meLoading, error: meError } = useGetFromAPI(
    "/users/me",
    refreshTrigger
  );
  const resolvedUserId = localStorage.getItem("userId");

  const { data: profileData, loading: profileLoading } = useGetFromAPI(
    resolvedUserId ? `/users/${resolvedUserId}/profile` : null,
    refreshTrigger
  );
  const { patchFunction, loading: saving } = usePatchToAPI();
  const hasCoachSurvey = Boolean(profileData?.coach_survey);

  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [goalsDialogOpen, setGoalsDialogOpen] = useState(false);

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

  const hydrateFromProfileData = useCallback((p) => {
    if (!p) return;

    const clientGoals = p.client_goals || {};
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

    setFirstName(p.first_name || "");
    setLastName(p.last_name || "");
    setEmail(p.email || "");
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
    } else {
      setHeightFeet("");
      setHeightInches("");
    }
  }, []);

  useEffect(() => {
    hydrateFromProfileData(profileData);
  }, [profileData, hydrateFromProfileData]);

  useEffect(() => {
    if (accountDialogOpen) hydrateFromProfileData(profileData);
  }, [accountDialogOpen, profileData, hydrateFromProfileData]);

  useEffect(() => {
    if (goalsDialogOpen) hydrateFromProfileData(profileData);
  }, [goalsDialogOpen, profileData, hydrateFromProfileData]);

  const goalsBinary = useMemo(
    () => binaryFromGoals(selectedGoalIds),
    [selectedGoalIds]
  );

  const displayName = useMemo(() => {
    const n = [firstName, lastName].filter(Boolean).join(" ");
    return n || "Your profile";
  }, [firstName, lastName]);

  const initials = useMemo(() => {
    const a = (firstName?.[0] || "").toUpperCase();
    const b = (lastName?.[0] || "").toUpperCase();
    return a + b || "?";
  }, [firstName, lastName]);

  const selectedGoalLabels = useMemo(
    () =>
      selectedGoalIds
        .map((id) => GOALS.find((g) => g.id === id)?.label)
        .filter(Boolean),
    [selectedGoalIds]
  );

  const toggleGoal = (id) => {
    setSelectedGoalIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    if (!resolvedUserId) {
      setSubmitError("User id not found. Please log in again.");
      return;
    }

    setSubmitError("");
    setSubmitMessage("");

    try {
      await patchFunction(`/users/${resolvedUserId}/edit_account`, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      });

      setSubmitMessage("Account updated.");
      setRefreshTrigger((prev) => prev + 1);
      setAccountDialogOpen(false);
    } catch (err) {
      setSubmitError(err?.message || "Failed to update account.");
    }
  };

  const handleSaveGoals = async (e) => {
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

      setSubmitMessage("Goals updated.");
      setRefreshTrigger((prev) => prev + 1);
      setGoalsDialogOpen(false);
    } catch (err) {
      setSubmitError(err?.message || "Failed to update goals.");
    }
  };

  const inputClass =
    "border-input bg-background text-foreground ring-ring/50 " +
    "focus-visible:border-ring h-9 w-full rounded-lg border px-3 " +
    "text-sm outline-none focus-visible:ring-3";

  if (meLoading || profileLoading) {
    return (
      <div className="w-full max-w-3xl">
        <h1 className="text-foreground text-2xl font-semibold">Profile</h1>
        <p className="text-muted-foreground mt-4">Loading profile...</p>
      </div>
    );
  }

  if (!resolvedUserId || meError) {
    return (
      <div className="w-full max-w-3xl">
        <h1 className="text-foreground text-2xl font-semibold">Profile</h1>
        <p className="text-destructive mt-4">
          Unable to load your profile. Please log in again.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-foreground text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your account and fitness goals.
        </p>
      </div>

      <section className="border-border bg-card rounded-xl border p-6">
        <div className="flex items-start justify-between">
          <div
            className="flex flex-col items-center gap-4 sm:flex-row
              sm:items-center"
          >
            <Avatar className="size-24 text-2xl">
              <AvatarImage
                src="https://www.gravatar.com/avatar?d=mp&f=y&s=128"
                alt=""
              />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div
              className="flex flex-col items-center text-center sm:items-start
                sm:text-left"
            >
              <h2 className="text-foreground text-2xl font-semibold">
                {displayName}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {email || "No email on file"}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-8">
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => setAccountDialogOpen(true)}
            >
              Edit profile
            </Button>
            {!hasCoachSurvey && (
              <Button
                type="button"
                variant="default"
                onClick={() =>
                  navigate("/coachSurvey", {
                    state: { next: "/profile" },
                  })
                }
              >
                Apply to be a Coach
              </Button>
            )}
            <DeleteAccount />
          </div>
        </div>
      </section>

      <section className="border-border bg-card space-y-4 rounded-xl border p-6">
        <div
          className="flex flex-col gap-3 sm:flex-row sm:items-start
            sm:justify-between"
        >
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              Fitness goals
            </h2>
            <p className="text-muted-foreground text-sm">
              Height, weight, and goal preferences.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            onClick={() => setGoalsDialogOpen(true)}
          >
            Edit goals
          </Button>
        </div>

        <dl className="border-border space-y-3 border-t pt-4">
          <DetailRow
            label="Height"
            value={formatHeightDisplay(heightFeet, heightInches)}
          />
          <DetailRow
            label="Weight goal"
            value={weightGoalLbs === "" ? "—" : `${weightGoalLbs} lbs`}
          />
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
            <dt
              className="text-muted-foreground w-full shrink-0 text-sm
                sm:max-w-[10rem]"
            >
              Primary goals
            </dt>
            <dd className="text-foreground text-sm font-medium">
              {selectedGoalLabels.length > 0
                ? selectedGoalLabels.join(", ")
                : "—"}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
            <dt
              className="text-muted-foreground w-full shrink-0 text-sm
                sm:max-w-[10rem]"
            >
              Personal goals
            </dt>
            <dd
              className="text-foreground text-sm font-medium
                whitespace-pre-wrap"
            >
              {personalGoals.trim() || "—"}
            </dd>
          </div>
          <DetailRow
            label="Daily exercise goal"
            value={formatExerciseDisplay(
              dailyExerciseHours,
              dailyExerciseMinutes
            )}
          />
        </dl>
      </section>
      {submitError && (
        <p className="text-destructive text-sm" role="alert">
          {submitError}
        </p>
      )}
      {submitMessage && (
        <p className="text-sm text-green-600">{submitMessage}</p>
      )}

      <Dialog.Root open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={dialogOverlayClass} />
          <Dialog.Content className={dialogContentClass}>
            <div className="flex items-start justify-between gap-4">
              <Dialog.Title className="text-foreground text-lg font-semibold">
                Edit profile
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  aria-label="Close"
                ></Button>
              </Dialog.Close>
            </div>
            <Dialog.Description className="text-muted-foreground text-sm">
              Update your name and email.
            </Dialog.Description>

            <form className="space-y-4" onSubmit={handleSaveAccount}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-foreground text-sm font-medium">
                    First name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className={inputClass}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-foreground text-sm font-medium">
                    Last name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className={inputClass}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-foreground text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={inputClass}
                  required
                />
              </div>
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAccountDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={goalsDialogOpen} onOpenChange={setGoalsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={dialogOverlayClass} />
          <Dialog.Content className={dialogContentClass}>
            <div className="flex items-start justify-between gap-4">
              <Dialog.Title className="text-foreground text-lg font-semibold">
                Edit goals
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  aria-label="Close"
                ></Button>
              </Dialog.Close>
            </div>
            <Dialog.Description className="text-muted-foreground text-sm">
              Update height, weight goal, and fitness targets.
            </Dialog.Description>

            <form className="space-y-4" onSubmit={handleSaveGoals}>
              <div className="flex flex-col gap-2">
                <label className="text-foreground text-sm font-medium">
                  Height
                </label>
                <div className="flex gap-3">
                  <select
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    className={inputClass}
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
                    className={inputClass}
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
                  Weight goal (lbs)
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={weightGoalLbs}
                  onChange={(e) => setWeightGoalLbs(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-foreground text-sm font-medium">
                  Goals
                </label>
                <div
                  className="border-border bg-background grid grid-cols-1 gap-3
                    rounded-lg border p-3"
                >
                  {GOALS.map((goal) => (
                    <label
                      key={goal.id}
                      className="flex items-center gap-3 text-sm"
                    >
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
                    className={`${inputClass} mt-2`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-foreground text-sm font-medium">
                  Daily exercise goal
                </label>
                <div className="flex gap-3">
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={dailyExerciseHours}
                      onChange={(e) => setDailyExerciseHours(e.target.value)}
                      className={inputClass}
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
                      className={inputClass}
                    />
                    <span className="text-foreground text-sm">min(s)</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setGoalsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
