import React from "react";

const CoachCard = ({ coach_info }) => {
  return (
    <article
      className="border-border bg-card rounded-xl border p-5 shadow-sm
        transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{coach_info.name}</h2>
        </div>
        <div className="text-right">
          <span className="text-muted-foreground text-sm">
            {coach_info.isUnrated
              ? "⭐ Unrated"
              : `⭐ ${coach_info.rating.toFixed(1)}`}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <h3
          className="text-secondary-foreground text-sm font-semibold
            tracking-wider uppercase"
        >
          Specializations
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {coach_info.specializations.map((spec) => (
            <span
              key={spec}
              className="border-muted text-muted-foreground rounded-full border
                px-2 py-1 text-xs font-medium"
            >
              {spec}
            </span>
          ))}
        </div>
      </div>

      {coach_info.qualifications && (
        <div className="mt-4">
          <h3
            className="text-secondary-foreground text-sm font-semibold
              tracking-wider uppercase"
          >
            Qualifications
          </h3>
          <p className="text-muted-foreground mt-2 pl-4 text-sm leading-relaxed">
            {coach_info.qualifications}
          </p>
        </div>
      )}
    </article>
  );
};

//specializations, certs, cost/hour, reviews/ratings).
// TopCoaches component, CoachCard component, Transformations component

export default CoachCard;
