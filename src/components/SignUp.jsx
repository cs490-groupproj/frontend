import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SignUp = () => {
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState("client");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      accountType,
      fname,
      lname,
      email,
      password,
    };

    console.log("sign up payload", payload);


    const signupEndpoint = "/api/signup";
    try {
      const res = await fetch(signupEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("signup failed:", res.status, text);
      }
    } catch (err) {
      console.error("signup request error:", err);
    }

    if (accountType === "client") {
      navigate("/clientsurvey");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-4 text-center text-xl font-semibold text-card-foreground">
          Sign up
        </h1>

        <div className="mb-6 grid grid-cols-2 border-b border-border">
          <button
            type="button"
            onClick={() => setAccountType("client")}
            className={`border-b-2 pb-2 text-center text-sm font-medium ${
              accountType === "client"
                ? "border-primary text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            Client
          </button>
          <button
            type="button"
            onClick={() => setAccountType("coach")}
            className={`border-b-2 pb-2 text-center text-sm font-medium ${
              accountType === "coach"
                ? "border-primary text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            Coach
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="fname" className="text-sm font-medium text-foreground">
              First Name
            </label>
            <input
              id="fname"
              name="fname"
              type="text"
              autoComplete="given-name"
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
              type="text"
              autoComplete="family-name"
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

          <Button type="submit" className="mt-2 w-full" size="lg">
            Create account
          </Button>

          <hr className="my-4 border-t border-border" />

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => console.log("google sso", { accountType })}
          >
            Continue with Google
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;

