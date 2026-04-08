import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/firebase.js";
const provider = new GoogleAuthProvider();
function mapAuthError(err) {
  const code = err?.code;
  if (code === "auth/popup-closed-by-user") {
    return "Sign-in was cancelled.";
  }
  if (code === "auth/cancelled-popup-request") {
    return "Only one sign-in popup can run at a time.";
  }
  if (code === "auth/popup-blocked") {
    return "Popup was blocked. Allow popups for this site or try again.";
  }
  return err?.message || "Google sign-in failed.";
}

export async function signInWithGooglePopup() {
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    return { user: result.user, idToken };
  } catch (err) {
    const e = new Error(mapAuthError(err));
    e.code = err?.code;
    throw e;
  }
}
