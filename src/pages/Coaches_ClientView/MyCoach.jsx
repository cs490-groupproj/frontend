// import React, { useEffect, useState } from "react";
// import { Button } from "../../components/ui/button.jsx";

// //backend response to frontend
// const mapCoachFromBackend = (coach) => {
//   return {
//     id: coach.coach_user_id,
//     name: `${coach.first_name} ${coach.last_name}`,

//     specializations: [
//       coach.is_exercise_specialization && "Fitness",
//       coach.is_nutrition_specialization && "Nutrition",
//     ].filter(Boolean),

//     costPerHour: coach.coach_cost,
//     rating: coach.avg_rating ?? 0,
//   };
// };

// export default function MyCoach() {
//   const [coach, setCoach] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showReview, setShowReview] = useState(false);
//   const [rating, setRating] = useState(0);

//   const submitReview = async () => {
//     if (!coach) return; // ✅ safety check

//     try {
//       const token = localStorage.getItem("token");

//       const res = await fetch(
//         `https://optimal-api.lambusta.me/coach/${coach.id}/review`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             rating: rating,
//           }),
//         }
//       );

//       if (!res.ok) {
//         throw new Error("Failed to submit review");
//       }

//       setShowReview(false);
//       setRating(0);

//       window.location.reload();

//     } catch (err) {
//       console.error("Error submitting review:", err);
//     }
//   };

//   const fireCoach = async () => {
//   if (!coach) return;

//   const confirmFire = window.confirm(
//     "Are you sure you want to fire your coach?"
//   );

//   if (!confirmFire) return;

//   try {
//     const token = localStorage.getItem("token");

//     const res = await fetch(
//       `https://optimal-api.lambusta.me/coaches/${coach.id}/fire`,
//       {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     if (!res.ok) {
//       throw new Error("Failed to fire coach");
//     }

//     // clear UI instead of reload (cleaner UX)
//     setCoach(null);

//   } catch (err) {
//     console.error("Error firing coach:", err);
//   }
// };

//   useEffect(() => {
//     const fetchMyCoach = async () => {
//       try {
//         const userId = localStorage.getItem("userId");

//         const res = await fetch(
//           `https://optimal-api.lambusta.me/clients/${userId}/coaches`,
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("token")}`,
//             },
//           }
//         );

//         const data = await res.json();

//         if (data.coaches && data.coaches.length > 0) {
//           const mapped = mapCoachFromBackend(data.coaches[0]);
//           setCoach(mapped);
//         } else {
//           setCoach(null);
//         }
//       } catch (err) {
//         console.error("Error fetching my coach:", err);
//         setCoach(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMyCoach();
//   }, []);

//   if (loading) {
//     return <div className="p-6 text-muted-foreground">Loading your coach...</div>;
//   }

//   if (!coach) {
//     return (
//       <div className="border rounded-xl p-6 text-center text-muted-foreground">
//         <h2 className="text-xl font-semibold">No Active Coach</h2>
//         <p className="mt-2">
//           You don’t currently have a coach. Browse and request one.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* HEADER */}
//       <div className="border rounded-xl p-6 bg-card shadow-sm">
//         <div className="flex justify-between items-start">
//           <div>
//             <h1 className="text-3xl font-bold">{coach.name}</h1>

//             <div className="mt-2 flex items-center gap-2">
//               <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs">
//                 Active
//               </span>

//               <span className="text-muted-foreground text-sm">
//                 {coach.specializations.join(" • ")} • ${coach.costPerHour}/hr
//               </span>
//             </div>
//           </div>

//           <div className="text-right">
//             <div className="text-xl font-semibold">
//               ⭐ {coach.rating.toFixed(1)}
//             </div>
//             <div className="text-sm text-muted-foreground">
//               Average rating
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* REVIEW MODAL */}
//       {showReview && (
//         <div className="border rounded-xl p-5 bg-card shadow-sm">
//           <h2 className="text-lg font-semibold mb-4">Rate Your Coach</h2>

//           <StarRating rating={rating} setRating={setRating} />

//           <div className="text-sm mt-2 text-muted-foreground">
//             {rating}/10
//           </div>

//           <div className="flex gap-3 mt-4">
//             <Button onClick={submitReview} disabled={rating === 0}>
//               Submit Rating
//             </Button>

//             <Button variant="ghost" onClick={() => setShowReview(false)}>
//               Cancel
//             </Button>
//           </div>
//         </div>
//       )}

//       {/* ACTIONS */}
//       <div className="border rounded-xl p-5 bg-card shadow-sm">
//         <h2 className="text-lg font-semibold mb-4">Actions</h2>

//         <div className="flex flex-wrap gap-3">
//           <Button variant="outline" onClick={() => setShowReview(true)}>
//             Leave Review
//           </Button>

//           <Button variant="ghost">Report Coach</Button>

//           <Button variant="destructive" onClick={fireCoach}>
//             Fire Coach
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function StarRating({ rating, setRating }) {
//   return (
//     <div className="flex flex-wrap gap-1">
//       {[1,2,3,4,5,6,7,8,9,10].map((star) => (
//         <span
//           key={star}
//           onClick={() => setRating(star)}
//           className={`cursor-pointer text-xl ${
//             star <= rating ? "text-yellow-500" : "text-gray-300"
//           }`}
//         >
//           ★
//         </span>
//       ))}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button.jsx";

import useGetFromAPI from "@/hooks/useGetFromAPI";
import usePutToAPI from "@/hooks/usePutToAPI";
import useDeleteFromAPI from "@/hooks/useDeleteFromAPI";
import usePostToAPI from "@/hooks/usePostToAPI.js";

//backend response to frontend
const mapCoachFromBackend = (coach) => {
  return {
    id: coach.coach_user_id,
    name: `${coach.first_name} ${coach.last_name}`,

    specializations: (() => {
      const isExercise = coach.is_exercise_specialization;
      const isNutrition = coach.is_nutrition_specialization;

      if (isExercise && isNutrition) return ["EXERCISE", "NUTRITION"];
      if (isExercise) return ["EXERCISE"];
      if (isNutrition) return ["NUTRITION"];
      return [];
    })(),

    costPerHour: coach.coach_cost,
    rating: coach.avg_rating ?? 0,
  };
};

export default function MyCoach() {
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [notification, setNotification] = useState(null);

  const userId = localStorage.getItem("userId");

  const { data, loading, error } = useGetFromAPI(
    userId ? `/clients/${userId}/coaches` : null,
    refreshTrigger
  );
  const coach =
    data?.coaches && data.coaches.length > 0
      ? mapCoachFromBackend(data.coaches[0])
      : null;

  useEffect(() => {
    if (!coach) return;
    console.log("Active coach info:", coach);
  }, [coach]);

  useEffect(() => {
    const rawCoach = data?.coaches?.[0];
    if (!rawCoach) return;
    console.log("Active coach raw backend object:", rawCoach);
  }, [data]);

  const { putFunction: submitReviewAPI } = usePutToAPI();
  const { deleteFunction: fireCoachAPI } = useDeleteFromAPI();
  const { postFunction: postReport } = usePostToAPI();

  const showNotification = (text, type = "info") => {
    setNotification({ text, type });
    window.setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const submitReview = async () => {
    if (!coach) return;

    try {
      await submitReviewAPI(`/coaches/${coach.id}/review`, {
        rating,
      });

      setShowReview(false);
      setRating(0);
      setRefreshTrigger((prev) => prev + 1);
      showNotification("Review submitted successfully.", "success");
    } catch (err) {
      console.error("Error submitting review:", err);
      showNotification("Failed to submit review. Please try again.", "danger");
    }
  };

  const fireCoach = async () => {
    if (!coach) return;

    const confirmFire = window.confirm(
      "Are you sure you want to fire your coach?"
    );

    if (!confirmFire) return;

    try {
      await fireCoachAPI(`/coaches/${coach.id}/fire`);

      setRefreshTrigger((prev) => prev + 1);
      showNotification("Coach removed successfully.", "success");
    } catch (err) {
      console.error("Error firing coach:", err);
      showNotification("Failed to remove coach. Please try again.", "danger");
    }
  };

  const reportCoach = async () => {
    if (!coach) return;

    const reason = window.prompt(`Why are you reporting ${coach.name}?`);
    if (!reason?.trim()) return;

    try {
      await postReport(`/coaches/${coach.id}/report`, {
        report_body: reason.trim(),
      });
      setRefreshTrigger((prev) => prev + 1);
      showNotification("Coach reported successfully.", "success");
    } catch (err) {
      console.error("Error reporting coach:", err);
      showNotification("Failed to report coach. Please try again.", "danger");
    }
  };

  if (loading) {
    return (
      <div className="text-muted-foreground p-6">Loading your coach...</div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!coach) {
    return (
      <div className="text-muted-foreground rounded-xl border p-6 text-center">
        <h2 className="text-xl font-semibold">No Active Coach</h2>
        <p className="mt-2">
          You don’t currently have a coach. Browse and request one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm ${
            notification.type === "success"
              ? "border-emerald-300 bg-emerald-100 text-emerald-900"
              : notification.type === "danger"
                ? "border-rose-300 bg-rose-100 text-rose-900"
                : "border-slate-300 bg-slate-100 text-slate-900"
          }`}
        >
          {notification.text}
        </div>
      )}

      {/* HEADER */}
      <div className="bg-card rounded-xl border p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{coach.name}</h1>

            <div className="mt-2 flex items-center gap-2">
              <span
                className="rounded-full bg-emerald-100 px-2 py-1 text-xs
                  text-emerald-800"
              >
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
            <div className="text-muted-foreground text-sm">Average rating</div>
          </div>
        </div>
      </div>

      {/* REVIEW MODAL */}
      {showReview && (
        <div className="bg-card rounded-xl border p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Rate Your Coach</h2>

          <StarRating rating={rating} setRating={setRating} />

          <div className="text-muted-foreground mt-2 text-sm">{rating}/10</div>

          <div className="mt-4 flex gap-3">
            <Button onClick={submitReview} disabled={rating === 0}>
              Submit Rating
            </Button>

            <Button variant="ghost" onClick={() => setShowReview(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ACTIONS */}
      <div className="bg-card rounded-xl border p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Actions</h2>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setShowReview(true)}>
            Leave Review
          </Button>

          <Button variant="ghost" onClick={reportCoach}>
            Report coach
          </Button>

          <Button variant="destructive" onClick={fireCoach}>
            Fire Coach
          </Button>
        </div>
      </div>
    </div>
  );
}

function StarRating({ rating, setRating }) {
  return (
    <div className="flex flex-wrap gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
        <span
          key={star}
          onClick={() => setRating(star)}
          className={`cursor-pointer text-xl ${
            star <= rating ? "text-yellow-500" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
