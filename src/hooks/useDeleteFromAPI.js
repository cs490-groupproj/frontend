import { useCallback, useState } from "react";
import { API_BASE_URL } from "../../config.js";

function useDeleteFromAPI() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteFunction = useCallback(async (deleteURI, auth_token) => {
    setData(null);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}${deleteURI}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        Authorization: "Bearer " + auth_token,
      });

      if (!response.ok) {
        throw new Error(`HTTP error: Status ${response.status}`);
      }

      setData(true);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      setData(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  return { deleteFunction, data, loading, error };
}
export default useDeleteFromAPI;
