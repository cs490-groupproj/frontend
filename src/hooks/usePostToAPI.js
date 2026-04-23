import { useCallback, useState } from "react";
import { API_BASE_URL } from "../../config.js";
import { getAuthHeader } from "@/lib/authHeader";

function usePostToAPI() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const postFunction = useCallback(async (postURI, postData) => {
    setData(null);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}${postURI}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeader()),
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        let detail = `Request failed (${response.status})`;
        try {
          const errBody = await response.json();
          if (typeof errBody?.error === "string") {
            detail = errBody.error;
          } else if (typeof errBody?.message === "string") {
            detail = errBody.message;
          }
          if (typeof errBody?.internal_error === "string") {
            detail = `${detail}: ${errBody.internal_error}`;
          }
        } catch {
          /* ignore non-JSON error bodies */
        }
        throw new Error(detail);
      }

      if (response.status === 204) {
        setData(true);
        setError(null);
        return true;
      }

      const responseData = await response.json();
      setData(responseData);
      setError(null);
      return responseData;
    } catch (err) {
      setError(err.message);
      setData(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  return { postFunction, data, loading, error };
}
export default usePostToAPI;
