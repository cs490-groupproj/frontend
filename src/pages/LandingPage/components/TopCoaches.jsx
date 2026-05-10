import React, { useEffect, useState } from "react";
import CoachCard from "@/features/coach/CoachCard";
import useGetPublicAPI from "@/hooks/useGetPublicAPI";
import { Loader2 } from "lucide-react";

const TopCoaches = () => {
  const [coachData, setCoachData] = useState([]);
  const [coachesURI, setCoachesURI] = useState("/visitors/top_coaches?limit=3");
  const SPECIALIZATIONS = {
    ALL: "ALL",
    EXERCISE: "EXERCISE",
    NUTRITION: "NUTRITION",
    BOTH: "BOTH",
  };

  const mapCoachFromBackend = (coach) => {
    const rating = Number(coach.avg_rating ?? 5);
    const isUnrated = coach.avg_rating === 0;
    return {
      name: `${coach.first_name} ${coach.last_name}`,

      specializations: [
        coach.is_exercise_specialization && SPECIALIZATIONS.EXERCISE,
        coach.is_nutrition_specialization && SPECIALIZATIONS.NUTRITION,
      ].filter(Boolean),

      qualifications: coach.qualifications,

      rating: rating,
      isUnrated: isUnrated,
    };
  };
  const {
    data: coachesData,
    loading: coachesLoading,
    error: coachesError,
  } = useGetPublicAPI(coachesURI, null);

  useEffect(() => {
    if (!coachesData || !coachesData.coaches) {
      return;
    }
    setCoachData(coachesData.coaches.map(mapCoachFromBackend));
  }, [coachesData]);
  if (coachesError) {
    return (
      <div
        className="flex h-[40vh] w-full flex-col items-center justify-center
          p-6"
      >
        <p className="text-destructive text-sm font-medium">
          Failed to load top coach data.
        </p>
        <p className="text-muted-foreground mt-1 text-xs">{coachesError}</p>
      </div>
    );
  }
  if (coachesLoading || !coachesData) {
    return (
      <div
        className="flex h-[40vh] w-full flex-col items-center justify-center
          p-6"
      >
        <Loader2 className="text-primary h-12 w-12 animate-spin" />
        <p
          className="text-muted-foreground mt-4 text-xs font-bold
            tracking-widest uppercase"
        >
          Loading our Top Coaches
        </p>
      </div>
    );
  }
  return (
    <section className="flex flex-col items-center gap-8 py-16">
      <div className="flex flex-col items-center gap-4 pb-4">
        <h1 className="text-4xl font-bold">Meet our Top Coaches</h1>
        <p className="text-muted-foreground text-xl">
          Coaches that change client lives, one optimal decision at a time.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {coachData.map((coach_info) => (
          <CoachCard key={coach_info.name} coach_info={coach_info} />
        ))}
      </div>
    </section>
  );
};

export default TopCoaches;
