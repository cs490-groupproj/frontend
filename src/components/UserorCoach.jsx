import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const UserorCoach = () => {

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-semibold text-card-foreground">
          Are You A User Or A Coach?
        </h1>
        
        <div className="Flex Flex-col gap-2">


          <Link to="/usersignup" className="font-medium text-primary underline-offset-4 hover:underline">
            <Button className="mt-2 w-full text-lg cursor-pointer" size="lg">
                I'm A User
            </Button>

          </Link>
          <Link to="/coachsignup" className="font-medium text-primary underline-offset-4 hover:underline">
            <Button className="mt-2 w-full text-lg cursor-pointer" size="lg">
                I'm A Coach
            </Button>

          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserorCoach;
