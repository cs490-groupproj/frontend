import React from "react";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import TopCoaches from "./components/TopCoaches";
import Transformations from "./components/Transformations";
import LandingPageFooter from "./components/LandingPageFooter";

const LandingPage = () => {
  return (
    <main className="bg-background flex flex-col pt-20">
      <section className="bg-background">
        <div
          className="mx-auto my-0 grid h-180 w-full grid-cols-2 items-center
            px-12"
        >
          <div className="text-foreground flex flex-col gap-4">
            <h1 className="text-5xl leading-16 font-bold">
              Optimal for your Health, Optimal for your Wallet
            </h1>
            <p className="text-muted-foreground text-xl">
              Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit
              amet consectetur adipiscing elit quisque faucibus.
            </p>
            <div className="flex flex-col items-center">
              <Button asChild size="xl">
                <NavLink to="/signup" className="text-xl">
                  Sign Up
                </NavLink>
              </Button>
            </div>
          </div>
          <div className="">
            <img src="/landing_page_pic_1.svg" />
          </div>
        </div>
      </section>
      <Transformations />
      <TopCoaches />
      <LandingPageFooter />
    </main>
  );
};

export default LandingPage;
