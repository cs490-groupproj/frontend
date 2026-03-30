import React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// const coach_info = {
//     name: "Sam Sulek",
//     rating: 4.9,
//     reviewCount: 100,
//     specializations: "Fitness and Nutrition",
//     certifications: ["Cert1", "Cert2", "Cert3", "Cert4"],
//     showFooter: false,
//     cost: 70,
//   };

const CoachCard = ({ coach_info }) => {
  return (
    <Card className="hover:border-primary relative w-full max-w-lg border-1">
      <CardHeader className="">
        <CardTitle>{coach_info.name}</CardTitle>
        <CardDescription>{coach_info.specializations} Coach</CardDescription>
        <CardAction>
          <Avatar className="size-16">
            <AvatarImage src={coach_info.pfp} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div>
          <h1>Certifications:</h1>
          <ul className="list-inside list-disc">
            {coach_info.certifications.map((cert) => (
              <li key={cert}>{cert}</li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-between pt-3">
          <div className="flex gap-2">
            <p>Star Rating</p>
            <p>{coach_info.rating}/5</p>
            <p className="text-muted-foreground">
              ({coach_info.reviewCount} reviews)
            </p>
          </div>
          <div className="flex">
            <p className="text-lg">${coach_info.cost}/hr</p>
          </div>
        </div>
      </CardContent>
      {coach_info.showFooter && (
        <CardFooter className="flex justify-center">
          <Button className="mx-10">Hire this guy</Button>
        </CardFooter>
      )}
    </Card>
  );
};

//specializations, certs, cost/hour, reviews/ratings).
// TopCoaches component, CoachCard component, Transformations component

export default CoachCard;
