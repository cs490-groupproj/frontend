import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
<<<<<<< HEAD
import { auth } from "@/firebase.js";
=======
>>>>>>> origin/master

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

<<<<<<< HEAD
const currentUserId = localStorage.getItem("userId");

export const apiFetch = async (url, options = {}) => {
  const BASE_URL = "https://optimal-api.lambusta.me";
  const cleanBase = BASE_URL.replace(/\/$/, "");
  const cleanUrl = url.replace(/^\//, "");
  const finalUrl = `${cleanBase}/${cleanUrl}`;

  // Get fresh token from Firebase (automatically refreshes if expired)
  let token = null;
  if (auth.currentUser) {
    try {
      token = await auth.currentUser.getIdToken();
    } catch (error) {
      console.error("Failed to get fresh token:", error);
      throw new Error("Authentication failed - please log in again");
    }
  } else {
    // No current user, redirect to login
    window.location.href = "/login";
    throw new Error("Not authenticated - redirecting to login");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const response = await fetch(finalUrl, { ...options, headers });
    return response;
  } catch (error) {
    console.error("apiFetch network error:", error);
    throw error;
  }
};
=======
function toTitleCase(string) {
  return string.replace(/\w\S*/g, (match) => {
    return match.charAt(0).toUpperCase() + match.substring(1).toLowerCase();
  });
}
export default toTitleCase;
>>>>>>> origin/master
