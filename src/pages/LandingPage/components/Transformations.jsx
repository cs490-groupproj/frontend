import React from "react";
import TransformationCard from "./TransformationCard";

const Transformations = () => {
  const transformations = [
    {
      name: "Terry Crews",
      gains: 26,
      before: "https://i.redd.it/qqwttcadsf921.png",
      after:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtaUoQcHU1oT16BmdSP76f-Sh7Lkxui-CvkA&s",
    },
    {
      name: "Lean Beef Patty",
      gains: 17,
      before:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxFd4tbX3RoWjKCPuVH7ADMswdMxK7arBoOg&s",
      after:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaaKL_qLxuZBBOZVr_7OcxBwvLYTInwDmmvg&s",
    },
    {
      name: "Connor McGregor ",
      loss: { lossAmount: 22, lossTime: 3 },
      before:
        "https://www.the-sun.com/wp-content/uploads/sites/6/2021/12/NINTCHDBPICT000697801578-5.jpg?quality=80&strip=all&w=823",
      after:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTDlx1X_gQ8gZgXYGwXwQSnh75rGplcU1d7w&s",
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
