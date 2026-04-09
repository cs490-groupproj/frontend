import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config.js";
import { getAuthHeader } from "@/lib/authHeader";
function useGetFromAPI(requestURI, refreshTrigger) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!requestURI) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    const controller = new AbortController();

    const getFunction = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}${requestURI}`, {
          method: "GET",
          signal: controller.signal,
          headers: { ...(await getAuthHeader()) },
        });

        if (!response.ok) {
          throw new Error(`HTTP error: Status ${response.status}`);
        }

        if (response.status === 204) {
          setData(true);
          setError(null);
          return true;
        }

        const postsData = await response.json();
        setData(postsData);
        setError(null);
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("Aborted");
          return;
        }
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    getFunction();
    return () => controller.abort();
  }, [requestURI, refreshTrigger]);
  return { data, loading, error };
}
export default useGetFromAPI;
