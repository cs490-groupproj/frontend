import React, { useEffect, useState } from "react";
import CoachCard from "@/features/coach/CoachCard";
import useGetPublicAPI from "@/hooks/useGetPublicAPI";

const TopCoaches = () => {
  const [coachData, setCoachData] = useState([]);
  const [coachesURI, setCoachesURI] = useState("/visitors/top_coaches?limit=6");
  const SPECIALIZATIONS = {
    ALL: "ALL",
    EXERCISE: "EXERCISE",
    NUTRITION: "NUTRITION",
    BOTH: "BOTH",
  };

  const mapCoachFromBackend = (coach) => {
    const rating = Number(coach.avg_rating ?? 0);
    return {
      name: `${coach.first_name} ${coach.last_name}`,

      specializations: [
        coach.is_exercise_specialization && SPECIALIZATIONS.EXERCISE,
        coach.is_nutrition_specialization && SPECIALIZATIONS.NUTRITION,
      ].filter(Boolean),

      qualifications: coach.qualifications,

      rating: rating,
      isUnrated: rating === 0,
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

  return (
    <section className="flex flex-col items-center gap-8 py-16">
      <div className="flex flex-col items-center gap-4 pb-4">
        <h1 className="text-4xl font-bold">Meet our Top Coaches</h1>
        <p className="text-muted-foreground text-xl">
          Blah Blah Blah filler text
        </p>
      </div>
      {coachesError ? (
        <p>error: {coachesError}</p>
      ) : coachesLoading ? (
        <p>Loading Coaches</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {coachData.map((coach_info) => (
            <CoachCard key={coach_info.name} coach_info={coach_info} />
          ))}
        </div>
      )}
    </section>
  );
};

export default TopCoaches;
