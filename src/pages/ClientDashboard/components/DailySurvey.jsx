import React, { useState } from 'react';
import { Check } from 'lucide-react';

export default function DailySurvey() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const moods = [
    { id: 'great', emoji: '😊', label: 'Great' },
    { id: 'okay', emoji: '😐', label: 'Okay' },
    { id: 'bad', emoji: '☹️', label: 'Bad' },
  ];

  const handleMoodSelect = (moodId) => {
    setSelectedMood(moodId);
  };

  const handleSaveMood = () => {
    if (selectedMood) {
      setIsSaved(true);
    }
  };

  const handleChangeResponse = () => {
    setSelectedMood(null);
    setIsSaved(false);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6 font-sans shadow-sm">
      <h2 className="mb-8 text-center text-xl font-semibold text-foreground">
        How are you feeling today?
      </h2>

      {!isSaved ? (
        <div className="space-y-6">
          {/* Mood Buttons */}
          <div className="flex justify-center gap-6">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                className={`flex h-24 w-24 flex-col items-center justify-center rounded-lg transition-all duration-200 ${
                  selectedMood === mood.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/50'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <span className="text-4xl">{mood.emoji}</span>
                <span className="mt-2 text-sm font-medium">{mood.label}</span>
              </button>
            ))}
          </div>

          {/* Save Button */}
          {selectedMood && (
            <div className="flex justify-center">
              <button
                onClick={handleSaveMood}
                className="rounded-lg bg-primary px-8 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Save Response
              </button>
            </div>
          )}
        </div>
      ) : (
        // Success State
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-green-700">
            <Check size={20} />
            <span className="font-medium">Your mood has been saved!</span>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleChangeResponse}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Change Response
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
