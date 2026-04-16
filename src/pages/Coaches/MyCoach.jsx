import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button.jsx";

//backend response to frontend
const mapCoachFromBackend = (coach) => {
  return {
    id: coach.coach_user_id,
    name: `${coach.first_name} ${coach.last_name}`,

    specializations: [
      coach.is_exercise_specialization && "Fitness",
      coach.is_nutrition_specialization && "Nutrition",
    ].filter(Boolean),

    costPerHour: coach.coach_cost,
    rating: coach.avg_rating ?? 5,

    reviews: [],

  };
};

export default function MyCoach() {
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCoach = async () => {
      try {
        const userId = localStorage.getItem("userId");

        const res = await fetch(
          `https://optimal-api.lambusta.me/clients/${userId}/coaches`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await res.json();

        if (data.coaches && data.coaches.length > 0) {
          const mapped = mapCoachFromBackend(data.coaches[0]);
          setCoach(mapped);
        } else {
          setCoach(null);
        }
      } catch (err) {
        console.error("Error fetching my coach:", err);
        setCoach(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCoach();
  }, []);

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading your coach...</div>;
  }

  if (!coach) {
    return (
      <div className="border rounded-xl p-6 text-center text-muted-foreground">
        <h2 className="text-xl font-semibold">No Active Coach</h2>
        <p className="mt-2">
          You don’t currently have a coach. Browse and request one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="border rounded-xl p-6 bg-card shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{coach.name}</h1>

            <div className="mt-2 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs">
                Active
              </span>

              <span className="text-muted-foreground text-sm">
                {coach.specializations.join(" • ")} • ${coach.costPerHour}/hr
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-semibold">
              ⭐ {coach.rating.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">
              ({coach.reviews.length} reviews)
            </div>
          </div>
        </div>
      </div>

      {/* SIMPLE STAT (optional) */}

      {/* ACTIONS */}
      <div className="border rounded-xl p-5 bg-card shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Actions</h2>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline">Leave Review</Button>
          <Button variant="ghost">Report Coach</Button>
          <Button variant="destructive">Fire Coach</Button>
        </div>
      </div>


      
    </div>
  );
}

/* --- Small reusable stat component --- */
function StatCard({ label, value }) {
  return (
    <div className="border rounded-lg p-4 bg-card text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}