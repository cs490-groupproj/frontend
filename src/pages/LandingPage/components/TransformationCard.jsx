import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const TransformationCard = ({ transformation }) => {
  return (
    <Card className="hover:border-primary relative w-full max-w-lg border-1">
      <div className="grid h-75 grid-cols-2 items-center">
        <img
          className="h-full w-full object-cover"
          src={transformation.before}
        />
        <img
          className="h-full w-full object-cover"
          src={transformation.after}
        />
      </div>
      <div className="absolute flex w-full justify-between px-6 py-4">
        <p
          className="bg-card text-card-foreground border-border rounded-full
            border-1 px-2 py-1 font-semibold"
        >
          Before
        </p>
        <p
          className="bg-primary text-primary-foreground border-border
            rounded-full border-1 px-2 py-1 font-semibold"
        >
          After
        </p>
      </div>

      <CardContent className="flex flex-col">
        <h1 className="text-lg font-semibold">{transformation.name}</h1>
        {"loss" in transformation && (
          <p className="text-primary text-base">
            Lost {transformation.loss.lossAmount} lbs in{" "}
            {transformation.loss.lossTime} months
          </p>
        )}
        {"gains" in transformation && (
          <p className="text-primary text-base">
            Gained {transformation.gains} lbs of muscle
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TransformationCard;
