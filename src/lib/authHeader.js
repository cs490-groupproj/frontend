import { auth } from "@/firebase";

export async function getAuthHeader() {
  const user = auth.currentUser;
  if (!user) {
    const tokenFromStorage = localStorage.getItem("token");
    if (!tokenFromStorage) return {};
    return { Authorization: `Bearer ${tokenFromStorage}` };
  }
  const token = await user.getIdToken(true);
  localStorage.setItem("token", token);
  return { Authorization: `Bearer ${token}` };
}