import React from "react";
import CoachCard from "@/features/coach/CoachCard";

const coach_infos = [
  {
    name: "Sam Sulek",
    rating: 4.9,
    reviewCount: 100,
    specializations: "Fitness and Nutrition",
    certifications: ["Cert1", "Cert2", "Cert3", "Cert4"],
    showFooter: false,
    cost: 70,
    pfp: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQn2qdy1EPnEmlMWJQ1YF4FADireaUT0Bg4eA&s",
  },
  {
    name: "Ronnie Coleman",
    rating: 4.8,
    reviewCount: 84,
    specializations: "Fitness",
    certifications: ["Cert1", "Cert2", "Cert3", "Cert4"],
    showFooter: false,
    cost: 75,
    pfp: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT38kZ9LNLwlrldWWCumGKOS9cOHRxnwGiZTg&s",
  },
];

const TopCoaches = () => {
  return (
    <section className="flex flex-col items-center gap-8 py-16">
      <div className="flex flex-col items-center gap-4 pb-4">
        <h1 className="text-4xl font-bold">Meet our Top Coaches</h1>
        <p className="text-muted-foreground text-xl">
          Blah Blah Blah filler text
        </p>
      </div>

      <div className="flex w-full shrink-0 flex-wrap justify-center gap-4">
        {coach_infos.map((coach_info) => (
          <CoachCard key={coach_info.name} coach_info={coach_info} />
        ))}
      </div>
    </section>
  );
};

export default TopCoaches;
