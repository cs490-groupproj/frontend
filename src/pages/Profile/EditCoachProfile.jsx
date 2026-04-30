import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog } from "radix-ui";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useGetFromAPI from "@/hooks/useGetFromAPI";
import usePatchToAPI from "@/hooks/usePatchToAPI";
import DeleteAccount from "./components/DeleteAccount";

const SPECIALIZATIONS = [
  { value: "EXERCISE", label: "Exercise" },
  { value: "NUTRITION", label: "Nutrition" },
  { value: "BOTH", label: "Both" },
];

function specializationLabel(value) {
  return SPECIALIZATIONS.find((o) => o.value === value)?.label || value || "—";
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

export default function EditCoachProfile() {
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

  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [coachSurveyDialogOpen, setCoachSurveyDialogOpen] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [coachSurveyId, setCoachSurveyId] = useState(null);
  const [specialization, setSpecialization] = useState(
    SPECIALIZATIONS[0].value
  );
  const [qualifications, setQualifications] = useState("");
  const [coachCost, setCoachCost] = useState("");

  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const hydrateFromProfileData = useCallback((p) => {
    if (!p) return;

    setFirstName(p.first_name || "");
    setLastName(p.last_name || "");
    setEmail(p.email || "");

    const cs = p.coach_survey;
    if (cs) {
      setCoachSurveyId(cs.coach_survey_id ?? null);
      setSpecialization(
        cs.specialization &&
          SPECIALIZATIONS.some((o) => o.value === cs.specialization)
          ? cs.specialization
          : SPECIALIZATIONS[0].value
      );
      setQualifications(cs.qualifications || "");
    } else {
      setCoachSurveyId(null);
      setSpecialization(SPECIALIZATIONS[0].value);
      setQualifications("");
    }

    const cost = p.coach_cost;
    setCoachCost(
      cost === null || cost === undefined || cost === "" ? "" : String(cost)
    );
  }, []);

  useEffect(() => {
    hydrateFromProfileData(profileData);
  }, [profileData, hydrateFromProfileData]);

  useEffect(() => {
    if (accountDialogOpen) hydrateFromProfileData(profileData);
  }, [accountDialogOpen, profileData, hydrateFromProfileData]);

  useEffect(() => {
    if (coachSurveyDialogOpen) hydrateFromProfileData(profileData);
  }, [coachSurveyDialogOpen, profileData, hydrateFromProfileData]);

  const displayName = useMemo(() => {
    const n = [firstName, lastName].filter(Boolean).join(" ");
    return n || "Your profile";
  }, [firstName, lastName]);

  const initials = useMemo(() => {
    const a = (firstName?.[0] || "").toUpperCase();
    const b = (lastName?.[0] || "").toUpperCase();
    return a + b || "?";
  }, [firstName, lastName]);

  const hasCoachSurvey = Boolean(profileData?.coach_survey);

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

  const handleSaveCoachSurvey = async (e) => {
    e.preventDefault();
    if (!resolvedUserId) {
      setSubmitError("User id not found. Please log in again.");
      return;
    }
    if (!coachSurveyId) {
      setSubmitError(
        "No coach survey on file. Complete the coach survey first."
      );
      return;
    }

    setSubmitError("");
    setSubmitMessage("");

    const payload = {
      coach_survey_id: coachSurveyId,
      specialization,
      qualifications: qualifications.trim() || null,
      coach_cost: Number.isFinite(Number(coachCost))
        ? Math.max(0, Math.round(Number(coachCost)))
        : null,
    };

    try {
      await patchFunction("/users/onboarding/coach_survey", payload);

      setSubmitMessage("Coach profile updated.");
      setRefreshTrigger((prev) => prev + 1);
      setCoachSurveyDialogOpen(false);
    } catch (err) {
      setSubmitError(err?.message || "Failed to update coach profile.");
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
          Your account and coach listing details.
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
              Coach survey
            </h2>
            <p className="text-muted-foreground text-sm">
              Specialization, qualifications, and hourly rate.
            </p>
          </div>
          {hasCoachSurvey ? (
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => setCoachSurveyDialogOpen(true)}
            >
              Edit coach details
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              className="shrink-0"
              asChild
            >
              <Link to="/coachSurvey">Complete coach survey</Link>
            </Button>
          )}
        </div>

        <dl className="border-border space-y-3 border-t pt-4">
          <DetailRow
            label="Specialization"
            value={specializationLabel(
              profileData?.coach_survey?.specialization
            )}
          />
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
            <dt
              className="text-muted-foreground w-full shrink-0 text-sm
                sm:max-w-[10rem]"
            >
              Qualifications
            </dt>
            <dd
              className="text-foreground text-sm font-medium
                whitespace-pre-wrap"
            >
              {profileData?.coach_survey?.qualifications?.trim() || "—"}
            </dd>
          </div>
          <DetailRow
            label="Cost per hour"
            value={
              profileData?.coach_cost === null ||
              profileData?.coach_cost === undefined
                ? "—"
                : `$${profileData.coach_cost}`
            }
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
                />
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

      <Dialog.Root
        open={coachSurveyDialogOpen}
        onOpenChange={setCoachSurveyDialogOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className={dialogOverlayClass} />
          <Dialog.Content className={dialogContentClass}>
            <div className="flex items-start justify-between gap-4">
              <Dialog.Title className="text-foreground text-lg font-semibold">
                Edit coach survey
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  aria-label="Close"
                />
              </Dialog.Close>
            </div>
            <form className="space-y-4" onSubmit={handleSaveCoachSurvey}>
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
                  htmlFor="edit-coach-qualifications"
                  className="text-foreground text-sm font-medium"
                >
                  Qualifications
                </label>
                <textarea
                  id="edit-coach-qualifications"
                  name="qualifications"
                  rows={4}
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder="Certifications, experience, focus areas…"
                  className={
                    inputClass + " min-h-[96px] resize-y py-2 leading-relaxed"
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="edit-coach-rate"
                  className="text-foreground text-sm font-medium"
                >
                  Cost per hour ($)
                </label>
                <input
                  id="edit-coach-rate"
                  name="coachCost"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={coachCost}
                  onChange={(e) => setCoachCost(e.target.value)}
                  placeholder="35"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCoachSurveyDialogOpen(false)}
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
