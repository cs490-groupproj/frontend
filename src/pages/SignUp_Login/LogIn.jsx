import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { signInWithGooglePopup } from "@/lib/googleSignIn.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase.js";

function mapEmailPasswordError(err) {
  const code = err?.code;
  if (code === "auth/invalid-credential") return "Incorrect email or password.";
  if (code === "auth/invalid-email")
    return "Please enter a valid email address.";
  if (code === "auth/too-many-requests")
    return "Too many attempts. Please try again later.";
  return err?.message || "Unable to sign in right now.";
}

const LogIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const syncWithBackend = async (idToken) => {
    // First try to get user data
    let response = await fetch("https://optimal-api.lambusta.me/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.hint && errorData.hint.includes('POST /users/register')) {
          // User needs to register
          const registerResponse = await fetch("https://optimal-api.lambusta.me/users/register", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              first_name: "User",
              last_name: "",
              is_coach: false,
            }),
          });
          
          if (!registerResponse.ok) {
            throw new Error("Failed to register user");
          }
          
          const registerData = await registerResponse.json();
          localStorage.setItem("token", idToken);
          localStorage.setItem("userId", registerData.user_id);
          return registerData;
        }
      }
      throw new Error("Credentials valid, but user not found in the database.");
    }

    const dbData = await response.json();
    localStorage.setItem("token", idToken);
    localStorage.setItem("userId", dbData.user_id);
    return dbData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();

      await syncWithBackend(idToken);

      navigate("/clientDashboard", { replace: true });
    } catch (err) {
      setLoginError(mapEmailPasswordError(err));
    } finally {
      setLoginLoading(false);
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

      navigate("/clientDashboard", { replace: true });
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setGoogleError(err.message || "Failed to sync with backend.");
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
          className="text-card-foreground mb-6 text-center text-xl
            font-semibold"
        >
          Log In
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-foreground text-sm font-medium"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-input bg-background text-foreground ring-ring/50
                placeholder:text-muted-foreground focus-visible:border-ring h-9
                w-full rounded-lg border px-3 text-sm outline-none
                focus-visible:ring-3"
              placeholder="Email Address"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-foreground text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-input bg-background text-foreground ring-ring/50
                placeholder:text-muted-foreground focus-visible:border-ring h-9
                w-full rounded-lg border px-3 text-sm outline-none
                focus-visible:ring-3"
              placeholder="••••••••"
              required
            />
          </div>
          {loginError && (
            <p className="text-destructive text-sm" role="alert">
              {loginError}
            </p>
          )}
          <Button
            type="submit"
            className="mt-2 w-full"
            size="lg"
            disabled={loginLoading}
          >
            {loginLoading ? "Signing in..." : "Continue"}
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
          {"Don't have an account? "}
          <Link
            to="/signup"
            className="text-primary font-medium underline-offset-4
              hover:underline"
          >
            Sign Up!
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LogIn;
