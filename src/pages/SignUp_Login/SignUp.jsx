import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { signInWithGooglePopup } from "@/lib/googleSignIn.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase.js";
import usePostToAPI from "@/hooks/usePostToAPI";

function mapEmailPasswordError(err) {
  const code = err?.code;
  if (code === "auth/email-already-in-use") {
    return "This email is already registered.";
  }
  if (code === "auth/invalid-email") {
    return "Please enter a valid email address.";
  }
  if (code === "auth/weak-password") {
    return "Password is too weak. Use at least 6 characters.";
  }
  return err?.message || "Unable to create your account right now.";
}

function mapRegisterError(err) {
  const msg = err?.message || "";
  if (msg.includes("409")) {
    return "This Firebase account is already registered.";
  }
  if (msg.includes("400")) {
    return "Invalid signup data. Check all fields and try again.";
  }
  return msg || "Account was created, but saving your profile failed.";
}

const SignUp = () => {
  const navigate = useNavigate();
  const { postFunction } = usePostToAPI();

  const [accountType, setAccountType] = useState("client");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState(null);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSignupError(null);
    setSignupLoading(true);
    try {
      // Create Firebase auth account and sign user in.
      await createUserWithEmailAndPassword(auth, email, password);

      if (!auth.currentUser) {
        throw new Error("Account created, but no auth session was found.");
      }

      const isCoach = accountType === "coach";
      const isClient = accountType === "client";

      await postFunction(
        "/users/register",
        {
          first_name: fname.trim(),
          last_name: lname.trim(),
          email: email.trim(),
          is_coach: isCoach,
          is_client: isClient,
        },
      );

      if (accountType === "client") {
        navigate("/clientSurvey");
      } else if (accountType === "coach") {
        navigate("/coachSurvey");
      }
    } catch (err) {
      const mapped =
        err?.code != null
          ? mapEmailPasswordError(err)
          : mapRegisterError(err);
      setSignupError(mapped);
    } finally {
      setSignupLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleError(null);
    setGoogleLoading(true);
    try {
      await signInWithGooglePopup();
      if (accountType === "client") {
        navigate("/clientSurvey", { replace: true });
      } else {
        navigate("/coachSurvey", { replace: true });
      }
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setGoogleError(err.message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="bg-background flex min-h-screen items-center justify-center
        px-4"
    >
      <div
        className="border-border bg-card w-full max-w-sm rounded-xl border p-8
          shadow-sm"
      >
        <h1
          className="text-card-foreground mb-4 text-center text-xl
            font-semibold"
        >
          Sign up
        </h1>

        <div className="border-border mb-6 grid grid-cols-2 border-b">
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
            <label
              htmlFor="fname"
              className="text-foreground text-sm font-medium"
            >
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
              className="border-input bg-background text-foreground ring-ring/50
                placeholder:text-muted-foreground focus-visible:border-ring h-9
                w-full rounded-lg border px-3 text-sm outline-none
                focus-visible:ring-3"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="lname"
              className="text-foreground text-sm font-medium"
            >
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
              className="border-input bg-background text-foreground ring-ring/50
                placeholder:text-muted-foreground focus-visible:border-ring h-9
                w-full rounded-lg border px-3 text-sm outline-none
                focus-visible:ring-3"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="signup-email"
              className="text-foreground text-sm font-medium"
            >
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
              className="border-input bg-background text-foreground ring-ring/50
                placeholder:text-muted-foreground focus-visible:border-ring h-9
                w-full rounded-lg border px-3 text-sm outline-none
                focus-visible:ring-3"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="signup-password"
              className="text-foreground text-sm font-medium"
            >
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
              className="border-input bg-background text-foreground ring-ring/50
                placeholder:text-muted-foreground focus-visible:border-ring h-9
                w-full rounded-lg border px-3 text-sm outline-none
                focus-visible:ring-3"
              required
            />
          </div>

          {signupError && (
            <p className="text-destructive text-sm" role="alert">
              {signupError}
            </p>
          )}

          <Button type="submit" className="mt-2 w-full" size="lg" disabled={signupLoading}>
            {signupLoading ? "Creating account..." : "Create account"}
          </Button>

          <hr className="border-border my-4 border-t" />
          {googleError && (
            <p className="text-destructive text-sm" role="alert">
              {googleError}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={googleLoading}
            onClick={handleGoogleSignIn}

          >
          {googleLoading ? "Opening Google…" : "Continue with Google"}
          
          </Button>
        </form>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary font-medium underline-offset-4
              hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
