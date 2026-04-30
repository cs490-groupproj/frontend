import React, { useMemo, useState, useEffect } from "react";
import { Button } from "../../components/ui/button.jsx";
import useGetFromAPI from "@/hooks/useGetFromAPI.js";
import usePostToAPI from "@/hooks/usePostToAPI.js";

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
  const { postFunction: requestCoachAPI } = usePostToAPI();

  useEffect(() => {
    const currentCoachId = myCoachData?.coaches?.[0]?.coach_user_id ?? null;
    setActiveCoachId(currentCoachId);
  }, [myCoachData]);

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

      await requestCoachAPI(`/coaches/${coach.id}/request`);
      addNotification(
        `Coach request sent to ${coach.name}. It will appear in the coach's Client Management page.`,
        "success"
      );
    } catch (err) {
      console.log("Error requesting coach:", err.message);
      if (err.message.includes("400")) {
        addNotification(
          "Failed to request coach. You have already sent a coach request to this coach.",
          "danger"
        );
      } else if (err.message.includes("402")) {
        addNotification(
          "Failed to request coach. Make sure you have billing set up and try again.",
          "danger"
        );
      } else {
        addNotification("Failed to request coach. Please try again.", "danger");
      }
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
