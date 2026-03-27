import React from "react";
import TransformationCard from "./TransformationCard";

const Transformations = () => {
  const transformations = [
    {
      name: "Terry Crews",
      loss: { lossAmount: 20, lossTime: 6 },
      before:
        "https://t4.ftcdn.net/jpg/02/35/37/23/360_F_235372323_37LLhGUi5p1cg5PfWLI1cgOHT0xO5byz.jpg",
      after:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtaUoQcHU1oT16BmdSP76f-Sh7Lkxui-CvkA&s",
    },
    {
      name: "Kyriakos Kapakoulak",
      gains: 50,
      before:
        "https://images.presentationgo.com/2025/05/fit-woman-gym-confidence.jpg",
      after:
        "https://premium-storefronts.s3.amazonaws.com/storefronts/grizzlywearcom/assets/logo.png",
    },
  ];

  return (
    <section className="bg-card-muted flex flex-col items-center py-16">
      <div className="flex flex-col items-center gap-4 p-4 pb-10">
        <h1 className="text-4xl font-bold">
          Real Transformations, Real Results
        </h1>
        <p className="text-muted-foreground text-xl">
          See what our clients have achieved working with our coaches
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {transformations.map((transformation) => (
          <TransformationCard
            key={transformation.name}
            transformation={transformation}
          />
        ))}
      </div>
    </section>
  );
};

export default Transformations;
