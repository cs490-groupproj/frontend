import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { signInWithGooglePopup } from "@/lib/googleSignIn.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase.js";

function mapEmailPasswordError(err) {
  const code = err?.code;
  if (code === "auth/email-already-in-use")
    return "This email is already registered.";
  if (code === "auth/invalid-email")
    return "Please enter a valid email address.";
  if (code === "auth/weak-password")
    return "Password is too weak. Use at least 6 characters.";
  return err?.message || "Unable to create your account right now.";
}

const SignUp = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [accountType, setAccountType] = useState("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");

  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState(null);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState(null);

  /**
   * REUSABLE SYNC FUNCTION
   * This is the bridge that gets the REAL database UUID
   */
  const syncWithBackend = async (idToken) => {
    const response = await fetch("https://optimal-api.lambusta.me/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        "Account created, but database sync failed. Check if backend is live."
      );
    }

    const dbData = await response.json();

    // --- STORAGE ---
    localStorage.setItem("token", idToken);
    localStorage.setItem("userId", dbData.user_id); // The real UUID (550e...)

    return dbData;
  };

  // --- HANDLERS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSignupError(null);
    setSignupLoading(true);

    try {
      // 1. Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();

      // 2. Register user in your SQL Database
      const payload = { accountType, fname, lname, email, password };
      const signupEndpoint = "https://optimal-api.lambusta.me/api/signup";

      const res = await fetch(signupEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(
          "Firebase account created, but backend registration failed."
        );
      }

      // 3. Handshake: Get the real database ID
      await syncWithBackend(idToken);

      // 4. Redirect
      navigate(accountType === "client" ? "/clientSurvey" : "/coachSurvey");
    } catch (err) {
      setSignupError(mapEmailPasswordError(err));
    } finally {
      setSignupLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleError(null);
    setGoogleLoading(true);
    try {
      // 1. Google Login
      const { idToken } = await signInWithGooglePopup();

      // 2. Handshake & Store
      await syncWithBackend(idToken);

      navigate(accountType === "client" ? "/clientSurvey" : "/coachSurvey", {
        replace: true,
      });
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setGoogleError(err.message || "Google sync failed.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // --- RENDER ---
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

        {/* Account Type Toggle */}
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
              type="text"
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
              type="text"
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
              type="email"
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
              type="password"
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

          <Button
            type="submit"
            className="mt-2 w-full"
            size="lg"
            disabled={signupLoading}
          >
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
