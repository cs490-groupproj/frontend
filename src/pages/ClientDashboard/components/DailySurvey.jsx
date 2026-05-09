import React, { useEffect, useState, useMemo } from "react";
import usePostToAPI from "@/hooks/usePostToAPI";
import usePatchToAPI from "@/hooks/usePatchToAPI";
import useGetFromAPI from "@/hooks/useGetFromAPI";
import { Loader2 } from "lucide-react";

const DAILY_SURVEY_STORAGE_KEY = "dailySurvey";

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const DailySurvey = ({ onSubmitted }) => {
  const userId = localStorage.getItem("userId");

  const initialStorage = useMemo(() => {
    const saved = localStorage.getItem(DAILY_SURVEY_STORAGE_KEY);
    const todayKey = getLocalDateKey();
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data?.dateKey === todayKey && data?.userId === userId) {
          return data;
        }
      } catch (error) {
        console.error("Failed to parse saved daily survey:", error);
      }
    }
    return null;
  }, [userId]);

  const [selectedMood, setSelectedMood] = useState(
    initialStorage?.mood ?? null
  );
  const [selectedEnergy, setSelectedEnergy] = useState(
    initialStorage?.energy ?? null
  );
  const [selectedSleep, setSelectedSleep] = useState(
    initialStorage?.sleep ?? null
  );
  const [notes, setNotes] = useState(initialStorage?.notes ?? "");
  const [isSaved, setIsSaved] = useState(initialStorage?.isSaved ?? false);
  const [submittedSurveyId, setSubmittedSurveyId] = useState(
    initialStorage?.submittedSurveyId ?? null
  );
  const [isBackendProcessed, setIsBackendProcessed] = useState(false);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const todaySurveyUri = userId
    ? `/clients/${userId}/daily_survey/history?days=1&timezone=${encodeURIComponent(timezone)}`
    : null;
  const {
    data: todaySurveyData,
    loading: todaySurveyLoading,
    error: todaySurveyError,
  } = useGetFromAPI(todaySurveyUri, userId);

  const { postFunction } = usePostToAPI();
  const { patchFunction } = usePatchToAPI();

  const surveyOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  const handleEnergySelect = (energy) => {
    setSelectedEnergy(energy);
  };

  const handleSleepSelect = (sleep) => {
    setSelectedSleep(sleep);
  };

  useEffect(() => {
    if (todaySurveyLoading) return;
    if (todaySurveyError) {
      setIsBackendProcessed(true);
      return;
    }
    if (!todaySurveyData) return;
    if (!isBackendProcessed) {
      const rows = Array.isArray(todaySurveyData) ? todaySurveyData : [];
      const latestRow = rows[rows.length - 1];

      if (latestRow) {
        const todayKey = getLocalDateKey();
        setIsSaved(true);
        setSubmittedSurveyId(latestRow.daily_survey_id ?? null);
        setSelectedMood(latestRow.mood ?? null);
        setSelectedEnergy(latestRow.energy ?? null);
        setSelectedSleep(latestRow.sleep ?? null);
        setNotes(latestRow.notes ?? "");

        localStorage.setItem(
          DAILY_SURVEY_STORAGE_KEY,
          JSON.stringify({
            userId,
            dateKey: todayKey,
            isSaved: true,
            submittedSurveyId: latestRow.daily_survey_id ?? null,
            mood: latestRow.mood ?? null,
            energy: latestRow.energy ?? null,
            sleep: latestRow.sleep ?? null,
            notes: latestRow.notes ?? "",
          })
        );
      }
      setIsBackendProcessed(true);
    }
  }, [
    todaySurveyData,
    todaySurveyLoading,
    todaySurveyError,
    userId,
    isBackendProcessed,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      mood: selectedMood,
      energy: selectedEnergy,
      sleep: selectedSleep,
      notes: notes,
      timezone: timezone,
    };

    try {
      let effectiveSurveyId = submittedSurveyId;
      const todayKey = getLocalDateKey();

      if (effectiveSurveyId != null) {
        await patchFunction(`/clients/${userId}/daily_survey/edit`, {
          survey_id: effectiveSurveyId,
          mood: selectedMood,
          energy: selectedEnergy,
          sleep: selectedSleep,
          notes: notes,
        });
      } else {
        const result = await postFunction(
          `/clients/${userId}/daily_survey/submit`,
          payload
        );
        const row = Array.isArray(result) ? result[0] : result;
        if (row?.daily_survey_id != null) {
          effectiveSurveyId = row.daily_survey_id;
          setSubmittedSurveyId(effectiveSurveyId);
        }
      }

      localStorage.setItem(
        DAILY_SURVEY_STORAGE_KEY,
        JSON.stringify({
          userId,
          dateKey: todayKey,
          isSaved: true,
          submittedSurveyId: effectiveSurveyId,
          mood: selectedMood,
          energy: selectedEnergy,
          sleep: selectedSleep,
          notes: notes,
        })
      );

      onSubmitted?.();
      setIsSaved(true);
    } catch (err) {
      console.error("survey request error:", err);
    }
  };

  const handleChangeResponse = () => {
    // Keep submittedSurveyId so next save uses PATCH
    const todayKey = getLocalDateKey();
    localStorage.setItem(
      DAILY_SURVEY_STORAGE_KEY,
      JSON.stringify({
        userId,
        dateKey: todayKey,
        isSaved: false,
        submittedSurveyId: submittedSurveyId,
        mood: null,
        energy: null,
        sleep: null,
        notes: "",
      })
    );
    setSelectedMood(null);
    setSelectedEnergy(null);
    setSelectedSleep(null);
    setNotes("");
    setIsSaved(false);
  };

  if (isSaved) {
    return (
      <div className="space-y-4 p-4 font-sans shadow-sm">
        <section
          className="border-border bg-card space-y-4 rounded-xl border p-6
            text-center"
        >
          <h2 className="text-foreground text-xl font-semibold">
            Survey Submitted!
          </h2>
          <p className="text-muted-foreground text-base">
            Thanks for checking in. Your coach can now see your progress data.
          </p>
          <button
            type="button"
            onClick={handleChangeResponse}
            className="border-border bg-background text-foreground
              hover:bg-muted rounded-lg border px-8 py-2 font-medium
              transition-colors"
          >
            Change answers
          </button>
        </section>
      </div>
    );
  }

  if (todaySurveyError) {
    return (
      <div
        className="flex h-[40vh] w-full flex-col items-center justify-center
          p-6"
      >
        <p className="text-destructive text-sm font-medium">
          Failed to load survey data.
        </p>
        <p className="text-muted-foreground mt-1 text-xs">{todaySurveyError}</p>
      </div>
    );
  }

  if (!isBackendProcessed) {
    return (
      <div
        className="flex h-[60vh] w-full flex-col items-center justify-center
          p-6"
      >
        <Loader2 className="text-primary h-12 w-12 animate-spin" />
        <p
          className="text-muted-foreground mt-4 text-xs font-bold
            tracking-widest uppercase"
        >
          Loading Survey
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4 p-4 font-sans shadow-sm">
      <section className="border-border bg-card rounded-xl border p-4">
        <label className="text-foreground mb-4 block font-semibold">
          😊 How is your mood today?
        </label>

        <div className="space-y-6">
          {/* Mood Buttons */}
          <div className="flex justify-center gap-4">
            {surveyOptions.map((mood) => (
              <button
                key={mood}
                onClick={() => handleMoodSelect(mood)}
                className={`flex h-16 w-16 flex-col items-center justify-center
                rounded-lg transition-all duration-200 ${
                  selectedMood === mood
                    ? `bg-primary text-primary-foreground shadow-primary/50
                      shadow-lg`
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <span className="mt-1 text-xl font-medium">{mood}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="border-border bg-card rounded-xl border p-4">
        <label className="text-foreground mb-4 block font-semibold">
          ⚡ How is your energy today?
        </label>

        <div className="space-y-6">
          <div className="flex justify-center gap-4">
            {surveyOptions.map((energy) => (
              <button
                key={energy}
                onClick={() => handleEnergySelect(energy)}
                className={`flex h-16 w-16 flex-col items-center justify-center
                rounded-lg transition-all duration-200 ${
                  selectedEnergy === energy
                    ? `bg-primary text-primary-foreground shadow-primary/50
                      shadow-lg`
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <span className="mt-1 text-xl font-medium">{energy}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="border-border bg-card rounded-xl border p-4">
        <label className="text-foreground mb-4 block font-semibold">
          😴 How well did you sleep today?
        </label>

        <div className="space-y-6">
          {/* Mood Buttons */}
          <div className="flex justify-center gap-4">
            {surveyOptions.map((sleep) => (
              <button
                key={sleep}
                onClick={() => handleSleepSelect(sleep)}
                className={`flex h-16 w-16 flex-col items-center justify-center
                rounded-lg transition-all duration-200 ${
                  selectedSleep === sleep
                    ? `bg-primary text-primary-foreground shadow-primary/50
                      shadow-lg`
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <span className="mt-1 text-xl font-medium">{sleep}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="border-border bg-card rounded-xl border p-4">
        <div className="space-y-4">
          <label className="text-foreground mb-4 block font-semibold">
            {" "}
            📝 Any notes for your Coach?{" "}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional: share anything relevant about your day, how the workout felt, any pain or soreness..."
            className="border-border bg-background text-foreground
              focus:ring-primary max-h-40 min-h-[80px] w-full resize-none
              overflow-y-auto rounded-md border px-4 py-3 text-base focus:ring-2
              focus:ring-offset-1 focus:outline-none"
          />
        </div>
      </section>

      {/* Save Button */}
      {selectedMood && selectedEnergy && selectedSleep && (
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            className="bg-primary text-primary-foreground hover:bg-primary/90
              rounded-lg px-8 py-2 font-medium transition-colors"
          >
            Save Response
          </button>
        </div>
      )}
    </div>
  );
};

export default DailySurvey;
