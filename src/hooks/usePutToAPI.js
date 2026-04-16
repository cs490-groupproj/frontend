import { useCallback, useState } from "react";
import { API_BASE_URL } from "../../config.js";
import { getAuthHeader } from "@/lib/authHeader";

function usePutToAPI() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const putFunction = useCallback(async (putURI, putData) => {
    setData(null);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}${putURI}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeader()),
        },
        body: JSON.stringify(putData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: Status ${response.status}`);
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

  return { putFunction, data, loading, error };
}

export default usePutToAPI;
