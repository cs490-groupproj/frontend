import React, { useEffect, useState } from 'react';
import usePostToAPI from "@/hooks/usePostToAPI";
import usePatchToAPI from "@/hooks/usePatchToAPI";
import useGetFromAPI from "@/hooks/useGetFromAPI";

const DAILY_SURVEY_STORAGE_KEY = "dailySurvey";

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const DailySurvey = ({ onSubmitted }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedEnergy, setSelectedEnergy] = useState(null);
  const [selectedSleep, setSelectedSleep] = useState(null);
  const [notes, setNotes] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [submittedSurveyId, setSubmittedSurveyId] = useState(null);
  const userId = localStorage.getItem("userId");
  const todaySurveyUri = userId ? `/clients/${userId}/daily_survey/history?days=1` : null;
  const { data: todaySurveyData, loading: todaySurveyLoading, error: todaySurveyError } = useGetFromAPI(
    todaySurveyUri,
    userId
  );

  const surveyOptions = [1,2,3,4,5,6,7,8,9,10];
 
 
  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  const handleEnergySelect = (energy) => {
    setSelectedEnergy(energy);
  };
  
  const handleSleepSelect = (sleep) => {
    setSelectedSleep(sleep);
  }

useEffect(() => {
  const saved = localStorage.getItem(DAILY_SURVEY_STORAGE_KEY);
  const todayKey = getLocalDateKey();

  if (saved) {
    try {
      const data = JSON.parse(saved);
      const isToday = data?.dateKey === todayKey;
      const isSameUser = data?.userId === userId;

      if (isToday && isSameUser) {
        setIsSaved(data.isSaved ?? false);
        setSubmittedSurveyId(data.submittedSurveyId ?? null);
        setSelectedMood(data.mood ?? null);
        setSelectedEnergy(data.energy ?? null);
        setSelectedSleep(data.sleep ?? null);
        setNotes(data.notes ?? "");
      } else {
        localStorage.removeItem(DAILY_SURVEY_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to parse saved daily survey:", error);
      localStorage.removeItem(DAILY_SURVEY_STORAGE_KEY);
    }
  }
}, [userId]);

useEffect(() => {
  if (todaySurveyLoading) return;
  if (todaySurveyError) return;

  const rows = Array.isArray(todaySurveyData) ? todaySurveyData : [];
  const latestRow = rows[rows.length - 1];

  if (!latestRow) {
    setIsSaved(false);
    setSubmittedSurveyId(null);
    return;
  }

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
}, [todaySurveyData, todaySurveyLoading, todaySurveyError, userId]);

  const { postFunction } = usePostToAPI();
  const { patchFunction } = usePatchToAPI();

  const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    mood: selectedMood,
    energy: selectedEnergy,
    sleep: selectedSleep,
    notes: notes,
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
      <div className="p-4 font-sans shadow-sm space-y-4">
        <section className="border-border bg-card rounded-xl border p-6 text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Survey Submitted!</h2>
          <p className="text-muted-foreground text-base">
            Thanks for checking in. Your coach can now see your progress data.
          </p>
          <button
            type="button"
            onClick={handleChangeResponse}
            className="rounded-lg border border-border bg-background px-8 py-2 font-medium text-foreground transition-colors hover:bg-muted"
          >
            Change answers
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="p-4 font-sans shadow-sm space-y-4">
      
        <section className="border-border bg-card rounded-xl border p-4">
        <label className="block mb-4  font-semibold text-foreground">
          😊 How is your mood today?
        </label>

          <div className="space-y-6">
            {/* Mood Buttons */}
            <div className="flex justify-center gap-4">
              {surveyOptions.map((mood) => (
                <button
                  key={mood}
                  onClick={() => handleMoodSelect(mood)}
                  className={`flex h-16 w-16 flex-col items-center justify-center rounded-lg transition-all duration-200 ${
                    selectedMood === mood
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/50'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                
                  <span className="mt-1 text-xl font-medium">{mood}</span>
                </button>
              ))}
            </div>

          </div>
      </section>
      
       <section className="border-border bg-card rounded-xl border p-4">
            <label className=" block mb-4 font-semibold text-foreground">
        ⚡ How is your energy today?
      </label>

        <div className="space-y-6">
          <div className="flex justify-center gap-4">
            {surveyOptions.map((energy) => (
              <button
                key={energy}
                onClick={() => handleEnergySelect(energy)}
                className={`flex h-16 w-16 flex-col items-center justify-center rounded-lg transition-all duration-200 ${
                  selectedEnergy === energy
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/50'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
               
                <span className="mt-1 text-xl font-medium">{energy}</span>
              </button>
            ))}
          </div>


        </div>
        </section>

      <section className="border-border bg-card rounded-xl border p-4">
      <label className="block mb-4  font-semibold text-foreground">
        😴 How well did you sleep today?
      </label>


        <div className="space-y-6">
          {/* Mood Buttons */}
          <div className="flex justify-center gap-4">
            {surveyOptions.map((sleep) => (
              <button
                key={sleep}
                onClick={() => handleSleepSelect(sleep)}
                className={`flex h-16 w-16 flex-col items-center justify-center rounded-lg transition-all duration-200 ${
                  selectedSleep === sleep
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/50'
                    : 'bg-muted hover:bg-muted/80'
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
            <label className  ="block mb-4 font-semibold text-foreground"> 📝 Any notes for your Coach? </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional: share anything relevant about your day, how the workout felt, any pain or soreness..."
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 min-h-[80px] max-h-40 overflow-y-auto resize-none"
          />
          </div>
      </section>

          {/* Save Button */}
          {selectedMood && selectedEnergy && selectedSleep && (
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                className="rounded-lg bg-primary px-8 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Save Response
              </button>
            </div>
          )}

    </div>


    
  );
};

export default DailySurvey;