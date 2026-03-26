import React, { useMemo, useState } from "react";
import { Button } from "./ui/button.jsx";

const initialCoaches = [
  {
    id: 1,
    name: "Avery Parks",
    specializations: ["Fitness", "Nutrition"],
    certifications: ["NASM CPT", "Precision Nutrition Level 2"],
    costPerHour: 85,
    rating: 4.9,
    reviews: [
      { id: 1, user: "Chris", rating: 5, text: "Fantastic guidance and nutrition advice!" },
    ],
    bio: "Strength and nutrition coach focused on sustainable fat loss and muscle building.",
    reports: 0,
  },
  {
    id: 2,
    name: "Jordan Lee",
    specializations: ["Fitness"],
    certifications: ["ACE Certified Personal Trainer"],
    costPerHour: 70,
    rating: 4.6,
    reviews: [
      { id: 1, user: "Jamie", rating: 4.5, text: "Great energy and form cues." },
    ],
    bio: "Expert in functional training, mobility and sports performance.",
    reports: 0,
  },
  {
    id: 3,
    name: "Casey Morgan",
    specializations: ["Nutrition"],
    certifications: ["Registered Dietitian (RD)", "Certified Diabetes Educator"],
    costPerHour: 95,
    rating: 4.7,
    reviews: [
      { id: 1, user: "Taylor", rating: 4.8, text: "Made eating healthy easy and delicious." },
    ],
    bio: "Nutrition strategist for clients who want flexible meal plans and blood sugar balance.",
    reports: 0,
  },
  {
    id: 4,
    name: "Riley Chen",
    specializations: ["Fitness", "Nutrition"],
    certifications: ["ISSA CPT", "Precision Nutrition Level 1"],
    costPerHour: 105,
    rating: 4.8,
    reviews: [
      { id: 1, user: "Morgan", rating: 4.9, text: "Holistic approach that finally worked." },
    ],
    bio: "Lifestyle coach specializing in holistic transformation and mindset.",
    reports: 0,
  },
];

const specializationFilters = [
  { key: "all", label: "All" },
  { key: "fitness", label: "Fitness" },
  { key: "nutrition", label: "Nutrition" },
  { key: "both", label: "Both" },
];

function matchesSpecialization(coach, filterKey) {
  if (filterKey === "all") return true;
  if (filterKey === "both") {
    return coach.specializations.includes("Fitness") && coach.specializations.includes("Nutrition");
  }
  return coach.specializations.some((item) => item.toLowerCase() === filterKey);
}

export default function BrowseCoaches() {
  const [coachData, setCoachData] = useState(initialCoaches);
  const [search, setSearch] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");
  const [maxPrice, setMaxPrice] = useState(120);
  const [minRating, setMinRating] = useState(4);
  const [activeCoachId, setActiveCoachId] = useState(null);
  const [pendingCoachId, setPendingCoachId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [reviewingCoach, setReviewingCoach] = useState(null);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const addNotification = (text, type = "info") => {
    const id = crypto.randomUUID?.() ?? Date.now().toString();
    setNotifications((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, 4500);
  };

  const requestCoach = (coach) => {
    if (activeCoachId && activeCoachId !== coach.id) {
      addNotification("You can only have one active coach. Fire your current coach first.", "warning");
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

    setPendingCoachId(coach.id);
    addNotification(`Coach request sent to ${coach.name}. Waiting for response...`, "info");

    window.setTimeout(() => {
      const accepted = Math.random() < 0.75;
      setPendingCoachId(null);

      if (accepted) {
        setActiveCoachId(coach.id);
        addNotification(`${coach.name} accepted your coach request!`, "success");
      } else {
        addNotification(`${coach.name} rejected your coach request.`, "danger");
      }
    }, 1800);
  };

  const fireCoach = (coach) => {
    if (activeCoachId !== coach.id) {
      addNotification("You do not currently have this coach active.", "warning");
      return;
    }

    setActiveCoachId(null);
    addNotification(`You fired ${coach.name}. You can request a new coach now.`, "info");
  };

  const reportCoach = (coach) => {
    setCoachData((prev) =>
      prev.map((row) =>
        row.id === coach.id ? { ...row, reports: (row.reports ?? 0) + 1 } : row
      )
    );
    addNotification(`${coach.name} has been reported. Thank you for the feedback.`, "danger");
  };

  const openReview = (coach) => {
    setReviewingCoach(coach);
    setReviewStars(5);
    setReviewText("");
  };

  const submitReview = () => {
    if (!reviewingCoach) return;

    const coachId = reviewingCoach.id;
    setCoachData((prev) =>
      prev.map((coach) => {
        if (coach.id !== coachId) return coach;

        const newReview = {
          id: Date.now(),
          user: "You",
          rating: reviewStars,
          text: reviewText.trim() || "No comment provided",
        };

        const allReviews = [...coach.reviews, newReview];
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        return {
          ...coach,
          reviews: allReviews,
          rating: Number(avgRating.toFixed(1)),
        };
      })
    );

    addNotification(`Review submitted for ${reviewingCoach.name}.`, "success");
    setReviewingCoach(null);
  };

  const filteredCoaches = useMemo(() => {
    const query = search.trim().toLowerCase();

    return coachData.filter((coach) => {
      if (query && !coach.name.toLowerCase().includes(query)) return false;
      if (!matchesSpecialization(coach, selectedSpecialization)) return false;
      if (coach.costPerHour > maxPrice) return false;
      if (coach.rating < minRating) return false;
      return true;
    });
  }, [coachData, search, selectedSpecialization, maxPrice, minRating]);

  const activeCoach = coachData.find((coach) => coach.id === activeCoachId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Coaches</h1>
        <p className="mt-1 text-muted-foreground">
          Manage coaching requests, fire/replace coaches, report issues and leave reviews.
        </p>
      </div>

      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((note) => (
            <div
              key={note.id}
              className={`rounded-lg border px-4 py-2 text-sm ${
                note.type === "success"
                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                  : note.type === "danger"
                  ? "bg-rose-100 text-rose-900 border-rose-300"
                  : note.type === "warning"
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-slate-100 text-slate-900 border-slate-300"
              }`}
            >
              {note.text}
            </div>
          ))}
        </div>
      )}

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="col-span-1 flex flex-col gap-1">
            <span className="text-sm font-medium">Search by name</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Enter coach name"
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <div className="col-span-1">
            <span className="text-sm font-medium">Specialization</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {specializationFilters.map((spec) => (
                <button
                  key={spec.key}
                  onClick={() => setSelectedSpecialization(spec.key)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    selectedSpecialization === spec.key
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {spec.label}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-1">
            <span className="text-sm font-medium">Max cost per hour: ${maxPrice}</span>
            <input
              type="range"
              min="40"
              max="150"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>$40</span>
              <span>$150</span>
            </div>
          </div>

          <div className="col-span-1">
            <span className="text-sm font-medium">Minimum rating: {minRating} ⭐</span>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>5</span>
            </div>
          </div>
        </div>
      </section>

      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <strong>Active coach:</strong> {activeCoach ? activeCoach.name : "None"}
        {activeCoach && (
          <Button className="ml-3" variant="destructive" size="sm" onClick={() => fireCoach(activeCoach)}>
            Fire Coach
          </Button>
        )}
      </div>

      {reviewingCoach && (
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-xl font-bold">Leave a review for {reviewingCoach.name}</h2>
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Stars ({reviewStars})</span>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={reviewStars}
                onChange={(e) => setReviewStars(Number(e.target.value))}
                className="h-2 w-60 cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
              />
            </div>
            <textarea
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write your review..."
              className="w-full rounded-lg border border-input bg-background p-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex gap-2">
              <Button variant="default" size="sm" onClick={submitReview}>
                Submit Review
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setReviewingCoach(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filteredCoaches.length > 0 ? (
          filteredCoaches.map((coach) => {
            const isActive = activeCoachId === coach.id;
            const isPending = pendingCoachId === coach.id;

            return (
              <article
                key={coach.id}
                className="rounded-xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{coach.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{coach.bio}</p>
                  </div>
                  <div className="text-right">
                    <span className="block rounded-full border border-primary px-3 py-1 text-xs font-semibold text-primary">
                      ${coach.costPerHour}/hr
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                      ⭐ {coach.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  {isActive && <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-800">Active</span>}
                  {isPending && <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">Request Pending</span>}
                  {coach.reports > 0 && <span className="rounded-full bg-rose-100 px-2 py-1 text-rose-800">Reported {coach.reports}</span>}
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary-foreground">
                    Specializations
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {coach.specializations.map((spec) => (
                      <span
                        key={spec}
                        className="rounded-full border border-muted px-2 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary-foreground">
                    Certifications
                  </h3>
                  <ul className="mt-2 list-disc pl-4 text-sm leading-relaxed text-muted-foreground">
                    {coach.certifications.map((cert) => (
                      <li key={cert}>{cert}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary-foreground">
                    Reviews
                  </h3>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                    {coach.reviews.slice(-2).map((rev) => (
                      <li key={rev.id} className="rounded-lg bg-muted/20 p-2">
                        <div className="text-xs text-muted-foreground">{rev.user} · ⭐ {rev.rating}</div>
                        <div>{rev.text}</div>
                      </li>
                    ))}
                    {coach.reviews.length > 2 && <li className="text-xs text-muted-foreground">+ {coach.reviews.length - 2} more</li>}
                  </ul>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
                  <Button
                    variant={isActive ? "ghost" : "secondary"}
                    size="sm"
                    onClick={() => (isActive ? fireCoach(coach) : requestCoach(coach))}
                  >
                    {isActive ? "Fire Coach" : isPending ? "Request Pending" : "Request Coach"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => reportCoach(coach)}>
                    Report Coach
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openReview(coach)}>
                    Leave Review
                  </Button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="col-span-full rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
            No coaches match your filters. Try adjusting your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}
