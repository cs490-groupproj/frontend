import { useCallback, useState } from "react";
import { API_BASE_URL } from "../../config.js";

function usePatchToAPI() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const patchFunction = useCallback(async (patchURI, patchData) => {
    setData(null);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}${patchURI}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patchData),
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
  return { patchFunction, data, loading, error };
}
export default usePatchToAPI;
