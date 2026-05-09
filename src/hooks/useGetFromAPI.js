import { useEffect, useLayoutEffect, useState } from "react";
import { API_BASE_URL } from "../../config.js";
import { getAuthHeader } from "@/lib/authHeader";

function useGetFromAPI(requestURI, refreshTrigger) {
  const [data, setData] = useState(null);
  /** Avoid first-paint flash: any active URI means we're loading until the fetch settles. */
  const [loading, setLoading] = useState(() => Boolean(requestURI));
  const [error, setError] = useState(null);

  useLayoutEffect(() => {
    if (requestURI) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [requestURI, refreshTrigger]);

  useEffect(() => {
    if (!requestURI) {
      setData(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    const getFunction = async () => {
      try {
        const authHeaders = await getAuthHeader();
        if (cancelled) return;

        const response = await fetch(`${API_BASE_URL}${requestURI}`, {
          method: "GET",
          signal: controller.signal,
          headers: { ...authHeaders },
        });

        if (cancelled) return;

        if (!response.ok) {
          throw new Error(`HTTP error: Status ${response.status}`);
        }

        if (response.status === 204) {
          setData(true);
          setError(null);
          return;
        }

        const responseData = await response.json();
        if (cancelled) return;

        setData(responseData);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        if (err.name === "AbortError") {
          return;
        }
        setError(err.message);
        setData(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    getFunction();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [requestURI, refreshTrigger]);

  return { data, loading, error };
}
export default useGetFromAPI;
