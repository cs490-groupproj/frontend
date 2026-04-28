// import React, { useMemo, useState } from "react";
// import { Button } from "../../components/ui/button.jsx";

// import { useEffect } from "react";

// const mapCoachFromBackend = (coach) => {
//   return {
//     id: coach.coach_user_id,
//     name: `${coach.first_name} ${coach.last_name}`,

//     specializations: [
//       coach.is_exercise_specialization && "Fitness",
//       coach.is_nutrition_specialization && "Nutrition",
//     ].filter(Boolean),

//     certifications: [], // not in backend

//     costPerHour: coach.coach_cost,

//     rating: Number(coach.avg_rating ?? 5),

//     reviews: [], // not returned yet

//     bio: "", // not returned yet

//     reports: 0,
//   };
// };

// const specializationFilters = [
//   { key: "all", label: "All" },
//   { key: "fitness", label: "Fitness" },
//   { key: "nutrition", label: "Nutrition" },
//   { key: "both", label: "Both" },
// ];

// function matchesSpecialization(coach, filterKey) {
//   if (filterKey === "all") return true;
//   if (filterKey === "both") {
//     return (
//       coach.specializations.includes("Fitness") &&
//       coach.specializations.includes("Nutrition")
//     );
//   }
//   return coach.specializations.some((item) => item.toLowerCase() === filterKey);
// }

// export default function BrowseCoaches() {
//   const [coachData, setCoachData] = useState([]);
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     //debugging!
//     console.log("SEARCH CHANGED:", search);

//     const delay = setTimeout(() => {
//       fetchCoaches();
//     }, 300);

//     return () => clearTimeout(delay);
//   }, [search]);

//   const fetchCoaches = async () => {
//     try {
//       // const res = await fetch(`/search?limit=20&offset=0&query=${search}`, {
//       //   headers: {
//       //     Authorization: `Bearer ${localStorage.getItem("token")}`,
//       //   },
//       // });

//       const queryParam = search.trim()
//   ? `&query=${encodeURIComponent(search)}`
//   : "";
//       console.log("TOKEN SENT:", localStorage.getItem("token")) // debugging

//      const res = await fetch(
//   `https://optimal-api.lambusta.me/coaches/search?limit=20&offset=0${queryParam}`,
//   {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem("token")}`,
//     },
//   }
// );

//       const data = await res.json();

//       const mapped = data.coaches.map(mapCoachFromBackend);

//       setCoachData(mapped);

//       //debugging!
//       console.log("RAW BACKEND:", data);
//       console.log("MAPPED:", mapped);

//     } catch (err) {
//       console.error("Error fetching coaches:", err);

//     }
//   };

//   const [selectedSpecialization, setSelectedSpecialization] = useState("all");
//   const [maxPrice, setMaxPrice] = useState(120);
//   const [minRating, setMinRating] = useState(4);
//   const [activeCoachId, setActiveCoachId] = useState(null);
//   const [pendingCoachId, setPendingCoachId] = useState(null);
//   const [notifications, setNotifications] = useState([]);
//   const [reviewingCoach, setReviewingCoach] = useState(null);
//   const [reviewStars, setReviewStars] = useState(5);
//   const [reviewText, setReviewText] = useState("");

//   const addNotification = (text, type = "info") => {
//     const id = crypto.randomUUID?.() ?? Date.now().toString();
//     setNotifications((prev) => [...prev, { id, text, type }]);
//     setTimeout(() => {
//       setNotifications((prev) => prev.filter((item) => item.id !== id));
//     }, 4500);
//   };

//   const requestCoach = async (coach) => {
//   if (activeCoachId && activeCoachId !== coach.id) {
//     addNotification(
//       "You can only have one active coach. Fire your current coach first.",
//       "warning"
//     );
//     return;
//   }

//   if (pendingCoachId) {
//     addNotification("You already have a pending coach request.", "warning");
//     return;
//   }

//   try {
//     setPendingCoachId(coach.id);

//     const res = await fetch(
//       `https://optimal-api.lambusta.me/coaches/${coach.id}/request`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify({
//           card_number: "4242424242424242",
//           card_exp_month: 12,
//           card_exp_year: 2028,
//           card_security_number: "123",
//           card_name: "Test User",
//           card_address: "123 Main St",
//           card_address_2: "",
//           card_city: "Newark",
//           card_postcode: "07102",
//         }),
//       }
//     );

//     const data = await res.json();

//     if (!res.ok) throw new Error(data.message);

//     addNotification(`Request sent to ${coach.name}`, "success");
//   } catch (err) {
//     console.error(err);
//     addNotification("Failed to request coach", "danger");
//     setPendingCoachId(null);
//   }
// };

// const fireCoach = async (coach) => {
//   try {
//     const res = await fetch(
//       `https://optimal-api.lambusta.me/coaches/${coach.id}/fire`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       }
//     );

//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message);

//     setActiveCoachId(null);

//     addNotification(`You fired ${coach.name}`, "success");
//   } catch (err) {
//     console.error(err);
//     addNotification("Failed to fire coach", "danger");
//   }
// };

// const reportCoach = async (coach) => {
//   // 1. Ask the user for their reason
//   const reason = window.prompt(`Why are you reporting ${coach.name}?`);
//   console.log("Report reason:", reason); // debugging

//   // 2. If they hit cancel or leave it empty, stop the function
//   if (!reason) return;

//   try {
//     const res = await fetch(
//       `https://optimal-api.lambusta.me/coaches/${coach.id}/report`,
//       {
//         method: "POST",
//         headers: {
//           "Accept": "application/json",
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${localStorage.getItem("token")}`,
//         },
//         // 3. Use the dynamic 'reason' variable here
//         body: JSON.stringify({
//           report_body: reason
//         }),
//       }
//     );

//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message || "Failed to report coach");

//     addNotification(`${coach.name} reported successfully`, "success");
//   } catch (err) {
//     console.error(err);
//     addNotification(err.message, "danger");
//   }
// };

//   const openReview = (coach) => {
//     setReviewingCoach(coach);
//     setReviewStars(5);
//     setReviewText("");
//   };

// const submitReview = async () => {
//   if (!reviewingCoach) return;

//   try {
//     const res = await fetch(
//       `https://optimal-api.lambusta.me/coaches/${reviewingCoach.id}/review`,
//       {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify({
//           rating: reviewStars * 2, // convert 5-star → 10 scale
//         }),
//       }
//     );

//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message);

//     addNotification(
//       `Review submitted for ${reviewingCoach.name}`,
//       "success"
//     );

//     setReviewingCoach(null);
//   } catch (err) {
//     console.error(err);
//     addNotification("Failed to submit review", "danger");
//   }
// };

//   const filteredCoaches = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     return coachData.filter((coach) => {
//       if (query && !coach.name.toLowerCase().includes(query)) return false;
//       if (!matchesSpecialization(coach, selectedSpecialization)) return false;
//       if (coach.costPerHour > maxPrice) return false;
//       if ((coach.rating ?? 0) < minRating) return false;
//       return true;
//     });
//   }, [coachData, search, selectedSpecialization, maxPrice, minRating]);

//   const activeCoach = coachData.find((coach) => coach.id === activeCoachId);

// import React, { useMemo, useState, useEffect } from "react";
// import { Button } from "../../components/ui/button.jsx";

// import useGetFromAPI from "@/hooks/useGetFromAPI";
// import usePostToAPI from "@/hooks/usePostToAPI";
// import usePutToAPI from "@/hooks/usePutToAPI";

// const mapCoachFromBackend = (coach) => {
//   return {
//     id: coach.coach_user_id,
//     name: `${coach.first_name} ${coach.last_name}`,

//     specializations: [
//       coach.is_exercise_specialization && "Fitness",
//       coach.is_nutrition_specialization && "Nutrition",
//     ].filter(Boolean),

//     certifications: [],
//     costPerHour: coach.coach_cost,
//     rating: Number(coach.avg_rating ?? 5),
//     reviews: [],
//     bio: "",
//     reports: 0,
//   };
// };

// const specializationFilters = [
//   { key: "all", label: "All" },
//   { key: "fitness", label: "Fitness" },
//   { key: "nutrition", label: "Nutrition" },
//   { key: "both", label: "Both" },
// ];

// function matchesSpecialization(coach, filterKey) {
//   if (filterKey === "all") return true;
//   if (filterKey === "both") {
//     return (
//       coach.specializations.includes("Fitness") &&
//       coach.specializations.includes("Nutrition")
//     );
//   }
//   return coach.specializations.some((item) => item.toLowerCase() === filterKey);
// }

// export default function BrowseCoaches() {
//   const [search, setSearch] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");
//   const [refreshTrigger, setRefreshTrigger] = useState(0);

//   useEffect(() => {
//     const delay = setTimeout(() => {
//       setDebouncedSearch(search);
//     }, 300);
//     return () => clearTimeout(delay);
//   }, [search]);

//   const queryParam = debouncedSearch.trim()
//     ? `&query=${encodeURIComponent(debouncedSearch)}`
//     : "";

//   const { data, loading, error } = useGetFromAPI(
//     `/coaches/search?limit=20&offset=0${queryParam}`,
//     refreshTrigger
//   );

//   const coachData = useMemo(() => {
//     if (!data?.coaches) return [];
//     return data.coaches.map(mapCoachFromBackend);
//   }, [data]);

//   const { postFunction: requestCoachAPI } = usePostToAPI();
//   const { postFunction: fireCoachAPI } = usePostToAPI();
//   const { postFunction: reportCoachAPI } = usePostToAPI();
//   const { putFunction: submitReviewAPI } = usePutToAPI();

//   const [selectedSpecialization, setSelectedSpecialization] = useState("all");
//   const [maxPrice, setMaxPrice] = useState(120);
//   const [minRating, setMinRating] = useState(4);
//   const [activeCoachId, setActiveCoachId] = useState(null);
//   const [pendingCoachId, setPendingCoachId] = useState(null);
//   const [notifications, setNotifications] = useState([]);
//   const [reviewingCoach, setReviewingCoach] = useState(null);
//   const [reviewStars, setReviewStars] = useState(5);
//   const [reviewText, setReviewText] = useState("");

//   const addNotification = (text, type = "info") => {
//     const id = crypto.randomUUID?.() ?? Date.now().toString();
//     setNotifications((prev) => [...prev, { id, text, type }]);
//     setTimeout(() => {
//       setNotifications((prev) => prev.filter((item) => item.id !== id));
//     }, 4500);
//   };

//

//   const filteredCoaches = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     return coachData.filter((coach) => {
//       if (query && !coach.name.toLowerCase().includes(query)) return false;
//       if (!matchesSpecialization(coach, selectedSpecialization)) return false;
//       if (coach.costPerHour > maxPrice) return false;
//       if ((coach.rating ?? 0) < minRating) return false;
//       return true;
//     });
//   }, [coachData, search, selectedSpecialization, maxPrice, minRating]);

//   const activeCoach = coachData.find((coach) => coach.id === activeCoachId);

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold">Browse Coaches</h1>
//         <p className="text-muted-foreground mt-1">
//           Manage coaching requests, fire/replace coaches, report issues and
//           leave reviews.
//         </p>
//       </div>

//       {notifications.length > 0 && (
//         <div className="space-y-2">
//           {notifications.map((note) => (
//             <div
//               key={note.id}
//               className={`rounded-lg border px-4 py-2 text-sm ${
//                 note.type === "success"
//                   ? "border-emerald-300 bg-emerald-100 text-emerald-900"
//                   : note.type === "danger"
//                     ? "border-rose-300 bg-rose-100 text-rose-900"
//                     : note.type === "warning"
//                       ? "border-amber-300 bg-amber-100 text-amber-900"
//                       : "border-slate-300 bg-slate-100 text-slate-900"
//               }`}
//             >
//               {note.text}
//             </div>
//           ))}
//         </div>
//       )}

//       <section className="border-border bg-card rounded-xl border p-5 shadow-sm">
//         <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
//           <label className="col-span-1 flex flex-col gap-1">
//             <span className="text-sm font-medium">Search by name</span>
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Enter coach name"
//               className="border-input bg-background focus:border-primary
//                 focus:ring-primary/20 rounded-lg border px-3 py-2 text-sm
//                 outline-none focus:ring-2"
//             />
//           </label>

//           <div className="col-span-1">
//             <span className="text-sm font-medium">Specialization</span>
//             <div className="mt-2 flex flex-wrap gap-2">
//               {specializationFilters.map((spec) => (
//                 <button
//                   key={spec.key}
//                   onClick={() => setSelectedSpecialization(spec.key)}
//                   className={`rounded-full px-3 py-1.5 text-sm font-medium
//                   transition ${
//                     selectedSpecialization === spec.key
//                       ? "bg-primary text-primary-foreground"
//                       : "border-border text-foreground hover:bg-muted border"
//                   }`}
//                 >
//                   {spec.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="col-span-1">
//             <span className="text-sm font-medium">
//               Max cost per hour: ${maxPrice}
//             </span>
//             <input
//               type="range"
//               min="40"
//               max="150"
//               step="5"
//               value={maxPrice}
//               onChange={(e) => setMaxPrice(Number(e.target.value))}
//               className="bg-muted accent-primary mt-2 h-2 w-full cursor-pointer
//                 appearance-none rounded-lg"
//             />
//             <div
//               className="text-muted-foreground mt-1 flex justify-between
//                 text-xs"
//             >
//               <span>$40</span>
//               <span>$150</span>
//             </div>
//           </div>

//           <div className="col-span-1">
//             <span className="text-sm font-medium">
//               Minimum rating: {minRating} ⭐
//             </span>
//             <input
//               type="range"
//               min="0"
//               max="10"
//               step="1"
//               value={minRating}
//               onChange={(e) => setMinRating(Number(e.target.value))}
//               className="bg-muted accent-primary mt-2 h-2 w-full cursor-pointer
//                 appearance-none rounded-lg"
//             />
//             <div
//               className="text-muted-foreground mt-1 flex justify-between
//                 text-xs"
//             >
//               <span>0</span>
//               <span>10</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       <div
//         className="border-border bg-card text-muted-foreground rounded-xl border
//           p-4 text-sm"
//       >
//         <strong>Active coach:</strong> {activeCoach ? activeCoach.name : "None"}
//         {activeCoach && (
//           <Button
//             className="ml-3"
//             variant="destructive"
//             size="sm"
//             onClick={() => fireCoach(activeCoach)}
//           >
//             Fire Coach
//           </Button>
//         )}
//       </div>

//       {reviewingCoach && (
//         <section
//           className="border-border bg-card rounded-xl border p-5 shadow-sm"
//         >
//           <h2 className="text-xl font-bold">
//             Leave a review for {reviewingCoach.name}
//           </h2>
//           <div className="mt-3 space-y-3">
//             <div className="flex items-center gap-3">
//               <span className="text-sm font-medium">Stars ({reviewStars})</span>
//               <input
//                 type="range"
//                 min="1"
//                 max="5"
//                 step="0.5"
//                 value={reviewStars}
//                 onChange={(e) => setReviewStars(Number(e.target.value))}
//                 className="bg-muted accent-primary h-2 w-60 cursor-pointer
//                   appearance-none rounded-lg"
//               />
//             </div>
//             <textarea
//               rows={3}
//               value={reviewText}
//               onChange={(e) => setReviewText(e.target.value)}
//               placeholder="Write your review..."
//               className="border-input bg-background focus:border-primary
//                 focus:ring-primary/20 w-full rounded-lg border p-2 text-sm
//                 outline-none focus:ring-2"
//             />
//             <div className="flex gap-2">
//               <Button variant="default" size="sm" onClick={submitReview}>
//                 Submit Review
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => setReviewingCoach(null)}
//               >
//                 Cancel
//               </Button>
//             </div>
//           </div>
//         </section>
//       )}

//       <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
//         {filteredCoaches.length > 0 ? (
//           filteredCoaches.map((coach) => {
//             const isActive = activeCoachId === coach.id;
//             const isPending = pendingCoachId === coach.id;

//             return (
//               <article
//                 key={coach.id}
//                 className="border-border bg-card rounded-xl border p-5 shadow-sm
//                   transition hover:-translate-y-0.5 hover:shadow-md"
//               >
//                 <div className="flex items-start justify-between gap-4">
//                   <div>
//                     <h2 className="text-xl font-semibold">{coach.name}</h2>
//                     <p className="text-muted-foreground mt-1 text-sm">
//                       {coach.bio}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <span
//                       className="border-primary text-primary block rounded-full
//                         border px-3 py-1 text-xs font-semibold"
//                     >
//                       ${coach.costPerHour}/hr
//                     </span>
//                     <span
//                       className="text-muted-foreground mt-1 inline-flex
//                         items-center gap-1 text-sm"
//                     >
//                       ⭐ {coach.rating.toFixed(1)}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
//                   {isActive && (
//                     <span
//                       className="rounded-full bg-emerald-100 px-2 py-1
//                         text-emerald-800"
//                     >
//                       Active
//                     </span>
//                   )}
//                   {isPending && (
//                     <span
//                       className="rounded-full bg-amber-100 px-2 py-1
//                         text-amber-800"
//                     >
//                       Request Pending
//                     </span>
//                   )}
//                   {coach.reports > 0 && (
//                     <span
//                       className="rounded-full bg-rose-100 px-2 py-1
//                         text-rose-800"
//                     >
//                       Reported {coach.reports}
//                     </span>
//                   )}
//                 </div>

//                 <div className="mt-4">
//                   <h3
//                     className="text-secondary-foreground text-sm font-semibold
//                       tracking-wider uppercase"
//                   >
//                     Specializations
//                   </h3>
//                   <div className="mt-2 flex flex-wrap gap-2">
//                     {coach.specializations.map((spec) => (
//                       <span
//                         key={spec}
//                         className="border-muted text-muted-foreground
//                           rounded-full border px-2 py-1 text-xs font-medium"
//                       >
//                         {spec}
//                       </span>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="mt-4">
//                   <h3
//                     className="text-secondary-foreground text-sm font-semibold
//                       tracking-wider uppercase"
//                   >
//                     Certifications
//                   </h3>
//                   <ul
//                     className="text-muted-foreground mt-2 list-disc pl-4 text-sm
//                       leading-relaxed"
//                   >
//                     {coach.certifications.map((cert) => (
//                       <li key={cert}>{cert}</li>
//                     ))}
//                   </ul>
//                 </div>

//                 <div className="mt-4">
//                   <h3
//                     className="text-secondary-foreground text-sm font-semibold
//                       tracking-wider uppercase"
//                   >
//                     Reviews
//                   </h3>
//                   <ul className="text-muted-foreground mt-2 space-y-2 text-sm">
//                     {coach.reviews.slice(-2).map((rev) => (
//                       <li key={rev.id} className="bg-muted/20 rounded-lg p-2">
//                         <div className="text-muted-foreground text-xs">
//                           {rev.user} · ⭐ {rev.rating}
//                         </div>
//                         <div>{rev.text}</div>
//                       </li>
//                     ))}
//                     {coach.reviews.length > 2 && (
//                       <li className="text-muted-foreground text-xs">
//                         + {coach.reviews.length - 2} more
//                       </li>
//                     )}
//                   </ul>
//                 </div>

//                 <div
//                   className="mt-5 flex flex-wrap items-center justify-end gap-2"
//                 >
//                   <Button
//                     variant={isActive ? "ghost" : "secondary"}
//                     size="sm"
//                     onClick={() =>
//                       isActive ? fireCoach(coach) : requestCoach(coach)
//                     }
//                   >
//                     {isActive
//                       ? "Fire Coach"
//                       : isPending
//                         ? "Request Pending"
//                         : "Request Coach"}
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => reportCoach(coach)}
//                   >
//                     Report Coach
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => openReview(coach)}
//                   >
//                     Leave Review
//                   </Button>
//                 </div>
//               </article>
//             );
//           })
//         ) : (
//           <div
//             className="border-border bg-card text-muted-foreground col-span-full
//               rounded-xl border p-6 text-center"
//           >
//             No coaches match your filters. Try adjusting your search criteria.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useMemo, useState, useEffect } from "react";
import { Button } from "../../components/ui/button.jsx";
import useGetFromAPI from "@/hooks/useGetFromAPI.js";
import usePostToAPI from "@/hooks/usePostToAPI.js";
import usePutToAPI from "@/hooks/usePutToAPI.js";

const ENABLE_MOCK_BILLING_ON_REQUEST = true;
const MOCK_BILLING_DATA = {
  card_number: "4242424242424242",
  card_exp_month: 12,
  card_exp_year: 2030,
  card_security_number: 123,
  card_name: "Mock Client Billing",
  card_address: "123 Test St",
  card_address_2: "",
  card_city: "Newark",
  card_postcode: "07102",
};

export default function BrowseCoaches() {
  const [coachData, setCoachData] = useState([]);
  const [search, setSearch] = useState("");
  const [coachesURI, setCoachesURI] = useState("");

  const SPECIALIZATIONS = {
    ALL: "ALL",
    EXERCISE: "EXERCISE",
    NUTRITION: "NUTRITION",
    BOTH: "BOTH",
  };

  const specializationFilters = [
    { key: SPECIALIZATIONS.ALL, label: "All" },
    { key: SPECIALIZATIONS.EXERCISE, label: "Exercise" },
    { key: SPECIALIZATIONS.NUTRITION, label: "Nutrition" },
    { key: SPECIALIZATIONS.BOTH, label: "Both" },
  ];

  const mapCoachFromBackend = (coach) => {
    const rating = Number(coach.avg_rating ?? 0);
    return {
      id: coach.coach_user_id,
      name: `${coach.first_name} ${coach.last_name}`,

      specializations: [
        coach.is_exercise_specialization && SPECIALIZATIONS.EXERCISE,
        coach.is_nutrition_specialization && SPECIALIZATIONS.NUTRITION,
      ].filter(Boolean),

      qualifications: coach.qualifications,

      costPerHour: coach.coach_cost,

      rating: rating,
      isUnrated: rating === 0,
    };
  };

  //checks if a coach has a specialization or multiple specializations
  function matchesSpecialization(coach, filterKey) {
    if (filterKey === SPECIALIZATIONS.ALL) return true;
    if (filterKey === SPECIALIZATIONS.BOTH) {
      return (
        coach.specializations.includes(SPECIALIZATIONS.EXERCISE) &&
        coach.specializations.includes(SPECIALIZATIONS.NUTRITION)
      );
    }
    return coach.specializations.some((item) => item === filterKey);
  }

  useEffect(() => {
    //debugging!
    console.log("SEARCH CHANGED:", search);

    const delay = setTimeout(() => {
      setCoachesURI(`/coaches/search?limit=20&offset=0&query=${search.trim()}`);
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  const { data: coachesData } = useGetFromAPI(coachesURI, null);

  useEffect(() => {
    if (!coachesData || !coachesData.coaches) {
      return;
    }
    setCoachData(coachesData.coaches.map(mapCoachFromBackend));
  }, [coachesData]);

  const userId = localStorage.getItem("userId");
  const { data: myCoachData } = useGetFromAPI(
    userId ? `/clients/${userId}/coaches` : null,
    null
  );

  const [selectedSpecialization, setSelectedSpecialization] = useState(
    SPECIALIZATIONS.ALL
  );
  const [maxPrice, setMaxPrice] = useState(120);
  const [minRating, setMinRating] = useState(4);
  const [activeCoachId, setActiveCoachId] = useState(null);
  const [pendingCoachId, setPendingCoachId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [mockBillingSynced, setMockBillingSynced] = useState(false);
  const { postFunction: requestCoachAPI } = usePostToAPI();
  const { putFunction: saveBillingAPI } = usePutToAPI();

  useEffect(() => {
    const currentCoachId = myCoachData?.coaches?.[0]?.coach_user_id ?? null;
    setActiveCoachId(currentCoachId);
  }, [myCoachData]);

  useEffect(() => {
    if (!ENABLE_MOCK_BILLING_ON_REQUEST) return;
    if (mockBillingSynced) return;

    const syncMockBilling = async () => {
      try {
        await saveBillingAPI("/payments/", MOCK_BILLING_DATA);
        setMockBillingSynced(true);
      } catch (err) {
        console.error("Error syncing mock billing:", err);
      }
    };

    syncMockBilling();
  }, [mockBillingSynced, saveBillingAPI]);

  const addNotification = (text, type = "info") => {
    const id = crypto.randomUUID?.() ?? Date.now().toString();
    setNotifications((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, 4500);
  };

  const requestCoach = async (coach) => {
    if (activeCoachId && activeCoachId !== coach.id) {
      addNotification(
        "You can only have one active coach. Release your current coach from My Coach first.",
        "warning"
      );
      return;
    }

    if (activeCoachId === coach.id) {
      addNotification("This coach is already your active coach.", "info");
      return;
    }

    if (pendingCoachId) {
      addNotification("You already have a pending coach request.", "warning");
      return;
    }

    try {
      setPendingCoachId(coach.id);

      if (ENABLE_MOCK_BILLING_ON_REQUEST) {
        await saveBillingAPI("/payments/", MOCK_BILLING_DATA);
      }

      await requestCoachAPI(`/coaches/${coach.id}/request`, {});
      addNotification(
        `Coach request sent to ${coach.name}. It will appear in the coach's Client Management page.`,
        "success"
      );
    } catch (err) {
      console.error("Error requesting coach:", err);
      addNotification(
        "Failed to request coach. Make sure you have billing set up and try again.",
        "danger"
      );
    } finally {
      setPendingCoachId(null);
    }
  };

  const filteredCoaches = useMemo(() => {
    const query = search.trim().toLowerCase();

    return coachData.filter((coach) => {
      if (query && !coach?.name.toLowerCase().includes(query)) return false;
      if (!matchesSpecialization(coach, selectedSpecialization)) return false;
      if (coach?.costPerHour > maxPrice) return false;
      if ((coach?.rating ?? 0) < minRating) return false;
      return true;
    });
  }, [coachData, search, selectedSpecialization, maxPrice, minRating]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Coaches</h1>
        <p className="text-muted-foreground mt-1">
          Search coaches and send a request. Reviews, reports, and ending a
          coaching relationship are on My Coach.
        </p>
      </div>

      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((note) => (
            <div
              key={note.id}
              className={`rounded-lg border px-4 py-2 text-sm ${
                note.type === "success"
                  ? "border-emerald-300 bg-emerald-100 text-emerald-900"
                  : note.type === "danger"
                    ? "border-rose-300 bg-rose-100 text-rose-900"
                    : note.type === "warning"
                      ? "border-amber-300 bg-amber-100 text-amber-900"
                      : "border-slate-300 bg-slate-100 text-slate-900"
              }`}
            >
              {note.text}
            </div>
          ))}
        </div>
      )}

      <section className="border-border bg-card rounded-xl border p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="col-span-1 flex flex-col gap-1">
            <span className="text-sm font-medium">Search by name</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Enter coach name"
              className="border-input bg-background focus:border-primary
                focus:ring-primary/20 rounded-lg border px-3 py-2 text-sm
                outline-none focus:ring-2"
            />
          </label>

          <div className="col-span-1">
            <span className="text-sm font-medium">Specialization</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {specializationFilters.map((spec) => (
                <button
                  key={spec.key}
                  onClick={() => setSelectedSpecialization(spec.key)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium
                  transition ${
                    selectedSpecialization === spec.key
                      ? "bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:bg-muted border"
                  }`}
                >
                  {spec.label}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-1">
            <span className="text-sm font-medium">
              Max cost per hour: ${maxPrice}
            </span>
            <input
              type="range"
              min="40"
              max="150"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="bg-muted accent-primary mt-2 h-2 w-full cursor-pointer
                appearance-none rounded-lg"
            />
            <div
              className="text-muted-foreground mt-1 flex justify-between
                text-xs"
            >
              <span>$40</span>
              <span>$150</span>
            </div>
          </div>

          <div className="col-span-1">
            <span className="text-sm font-medium">
              Minimum rating: {minRating} ⭐
            </span>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="bg-muted accent-primary mt-2 h-2 w-full cursor-pointer
                appearance-none rounded-lg"
            />
            <div
              className="text-muted-foreground mt-1 flex justify-between
                text-xs"
            >
              <span>0</span>
              <span>10</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filteredCoaches.length > 0 ? (
          filteredCoaches.map((coach) => {
            const isActive = activeCoachId === coach.id;
            const isPending = pendingCoachId === coach.id;

            return (
              <article
                key={coach.id}
                className="border-border bg-card rounded-xl border p-5 shadow-sm
                  transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{coach.name}</h2>
                  </div>
                  <div className="text-right">
                    <span
                      className="border-primary text-primary block rounded-full
                        border px-3 py-1 text-xs font-semibold"
                    >
                      ${coach.costPerHour}/hr
                    </span>
                    <span
                      className="text-muted-foreground mt-1 inline-flex
                        items-center gap-1 text-sm"
                    >
                      {coach.isUnrated
                        ? "⭐ Unrated"
                        : `⭐ ${coach.rating.toFixed(1)}`}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  {isActive && (
                    <span
                      className="rounded-full bg-emerald-100 px-2 py-1
                        text-emerald-800"
                    >
                      Your coach
                    </span>
                  )}
                  {isPending && (
                    <span
                      className="rounded-full bg-amber-100 px-2 py-1
                        text-amber-800"
                    >
                      Request pending
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <h3
                    className="text-secondary-foreground text-sm font-semibold
                      tracking-wider uppercase"
                  >
                    Specializations
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {coach.specializations.map((spec) => (
                      <span
                        key={spec}
                        className="border-muted text-muted-foreground
                          rounded-full border px-2 py-1 text-xs font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h3
                    className="text-secondary-foreground text-sm font-semibold
                      tracking-wider uppercase"
                  >
                    Qualifications
                  </h3>
                  <p
                    className="text-muted-foreground mt-2 pl-4 text-sm
                      leading-relaxed"
                  >
                    {coach.qualifications}
                  </p>
                </div>

                <div
                  className="mt-5 flex flex-wrap items-center justify-end gap-2"
                >
                  <Button
                    variant={isActive ? "outline" : "secondary"}
                    size="sm"
                    disabled={
                      isActive ||
                      isPending ||
                      Boolean(activeCoachId && activeCoachId !== coach.id)
                    }
                    onClick={() => requestCoach(coach)}
                  >
                    {isActive
                      ? "Your coach"
                      : isPending
                        ? "Request pending"
                        : "Request coach"}
                  </Button>
                </div>
              </article>
            );
          })
        ) : (
          <div
            className="border-border bg-card text-muted-foreground col-span-full
              rounded-xl border p-6 text-center"
          >
            No coaches match your filters. Try adjusting your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}
