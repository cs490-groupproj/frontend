import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CoachSignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weightLbs, setWeightLbs] = useState("");

  const feetOptions = [3, 4, 5, 6, 7, 8, 9];
  const inchOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

  const handleSubmit = (e) => {
    e.preventDefault();
    const heightInInches =
      heightFeet === "" || heightInches === ""
        ? null
        : Number(heightFeet) * 12 + Number(heightInches);

    console.log("coach sign up", {
      fname,
      lname,
      email,
      password,
      heightFeet,
      heightInches,
      heightInInches,
      weightLbs,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-semibold text-card-foreground">
          Coach Sign up
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="fname" className="text-sm font-medium text-foreground">
              First Name
            </label>
            <input
              id="fname"
              name="fname"
              type="fname"
              autoComplete="fname"
              value={fname}
              onChange={(e) => setFname(e.target.value)}
              placeholder="Joe"
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none ring-ring/50 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="lname" className="text-sm font-medium text-foreground">
              Last Name
            </label>
            <input
              id="lname"
              name="lname"
              type="lname"
              autoComplete="lname"
              value={lname}
              onChange={(e) => setLname(e.target.value)}
              placeholder="Michelangelo"
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none ring-ring/50 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="signup-email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none ring-ring/50 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="signup-password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none ring-ring/50 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Height</label>
            <div className="flex gap-3">
              <div className="flex-1">
                <select
                  id="height-feet"
                  name="heightFeet"
                  value={heightFeet}
                  onChange={(e) => setHeightFeet(e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground text-foreground outline-none ring-ring/50 focus-visible:border-ring focus-visible:ring-3"
                  required>
                  <option value="" disabled>
                    ft
                  </option>
                {feetOptions.map((ft) => (
                <option key={ft} value={ft}>
                    {ft} ft
                </option>
                ))}
                </select>
              </div>
              <div className="flex-1">
                <select
                  id="height-inches"
                  name="heightInches"
                  value={heightInches}
                  onChange={(e) => setHeightInches(e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground text-foreground outline-none ring-ring/50 focus-visible:border-ring focus-visible:ring-3"
                  required>
                  <option value="" disabled>
                    in
                  </option>


                {inchOptions.map((inch) => (
                <option key={inch} value={inch}>
                    {inch} in
                </option>
                ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="weight-lbs" className="text-sm font-medium text-foreground">
              Weight (lbs)
            </label>
            <input
              id="weight-lbs"
              name="weightLbs"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={weightLbs}
              onChange={(e) => setWeightLbs(e.target.value)}
              placeholder="150"
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none ring-ring/50 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3"
              required
            />
          </div>
          <Button type="submit" className="mt-2 w-full" size="lg">
            Create account
          </Button>
          <hr className="my-4 border-t border-border" />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => console.log("google sso")}
          >
            Continue with Google
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Want to be a coach?{" "}
          <Link
            to="/usersignup"
            className="font-medium text-primary underline-offset-4 hover:underline">
            User Sign Up
          </Link>
        </p>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CoachSignUp;
