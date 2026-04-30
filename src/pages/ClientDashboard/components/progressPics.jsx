import React, { useMemo, useState } from "react";
import useGetFromAPI from "@/hooks/useGetFromAPI";
import useDeleteFromAPI from "@/hooks/useDeleteFromAPI";
import { API_BASE_URL } from "../../../../config";
import { getAuthHeader } from "@/lib/authHeader";

const PHOTO_TYPES = {
  BEFORE: "BEFORE",
  AFTER: "AFTER",
};

function ProgressPics() {
  const userId = localStorage.getItem("userId");
  const [refreshKey, setRefreshKey] = useState(0);
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState("");
  const [busyType, setBusyType] = useState("");

  const { deleteFunction } = useDeleteFromAPI();

  const beforeUri = userId
    ? `/progress/?user_id=${encodeURIComponent(userId)}&type=${PHOTO_TYPES.BEFORE}`
    : null;
  const afterUri = userId
    ? `/progress/?user_id=${encodeURIComponent(userId)}&type=${PHOTO_TYPES.AFTER}`
    : null;

  const { data: beforeData, error: beforeError } = useGetFromAPI(beforeUri, refreshKey);
  const { data: afterData, error: afterError } = useGetFromAPI(afterUri, refreshKey);

  const beforeImage = useMemo(
    () => (Array.isArray(beforeData?.images) ? beforeData.images[0] || null : null),
    [beforeData]
  );

  const afterImage = useMemo(
    () => (Array.isArray(afterData?.images) ? afterData.images[0] || null : null),
    [afterData]
  );

  const uploadImage = async (type) => {
    const file = type === PHOTO_TYPES.BEFORE ? beforeFile : afterFile;
    if (!file) {
      setLocalError(`Select a ${type.toLowerCase()} image first.`);
      setMessage("");
      return;
    }

    setBusyType(`upload-${type}`);
    setLocalError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", type);
      const response = await fetch(`${API_BASE_URL}/progress/upload`, {
        method: "POST",
        headers: {
          ...(await getAuthHeader()),
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Upload failed (${response.status}).`);
      }

      if (type === PHOTO_TYPES.BEFORE) setBeforeFile(null);
      if (type === PHOTO_TYPES.AFTER) setAfterFile(null);
      setMessage(`${type === PHOTO_TYPES.BEFORE ? "Before" : "After"} photo uploaded.`);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setLocalError(error?.message || "Upload failed.");
    } finally {
      setBusyType("");
    }
  };

  const clearLatest = async (type) => {
    const imageToDelete = type === PHOTO_TYPES.BEFORE ? beforeImage : afterImage;
    if (!imageToDelete?.id) return;

    setBusyType(`delete-${type}`);
    setLocalError("");
    setMessage("");
    try {
      await deleteFunction(`/progress/delete?id=${imageToDelete.id}`);
      setMessage(`${type === PHOTO_TYPES.BEFORE ? "Before" : "After"} photo removed.`);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setLocalError(error?.message || "Delete failed.");
    } finally {
      setBusyType("");
    }
  };

  const errorText = localError || beforeError || afterError;

  return (
    <div className="space-y-6 p-4">
      <section className="border-border bg-card rounded-xl border p-4">
        <h2 className="text-foreground mb-2 text-xl font-semibold">Progress Pictures</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Upload one before photo and one after photo to track your current transformation.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="border-border rounded-lg border p-3">
            <p className="text-sm font-medium">Before</p>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setBeforeFile(event.target.files?.[0] || null)}
              className="mt-2 block w-full cursor-pointer text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-border file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => uploadImage(PHOTO_TYPES.BEFORE)}
                disabled={busyType === `upload-${PHOTO_TYPES.BEFORE}` || !beforeFile}
                className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {busyType === `upload-${PHOTO_TYPES.BEFORE}` ? "Uploading..." : "Upload"}
              </button>
              <button
                type="button"
                onClick={() => clearLatest(PHOTO_TYPES.BEFORE)}
                disabled={busyType === `delete-${PHOTO_TYPES.BEFORE}` || !beforeImage}
                className="text-destructive border-destructive/40 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-destructive/10 disabled:opacity-50"
              >
                {busyType === `delete-${PHOTO_TYPES.BEFORE}` ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>

          <div className="border-border rounded-lg border p-3">
            <p className="text-sm font-medium">After</p>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setAfterFile(event.target.files?.[0] || null)}
              className="mt-2 block w-full cursor-pointer text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-border file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => uploadImage(PHOTO_TYPES.AFTER)}
                disabled={busyType === `upload-${PHOTO_TYPES.AFTER}` || !afterFile}
                className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {busyType === `upload-${PHOTO_TYPES.AFTER}` ? "Uploading..." : "Upload"}
              </button>
              <button
                type="button"
                onClick={() => clearLatest(PHOTO_TYPES.AFTER)}
                disabled={busyType === `delete-${PHOTO_TYPES.AFTER}` || !afterImage}
                className="text-destructive border-destructive/40 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-destructive/10 disabled:opacity-50"
              >
                {busyType === `delete-${PHOTO_TYPES.AFTER}` ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {(message || errorText) && (
        <section className="border-border bg-card rounded-xl border p-4">
          {message ? <p className="text-sm text-green-400">{message}</p> : null}
          {errorText ? <p className="text-destructive text-sm">{errorText}</p> : null}
        </section>
      )}

      <section className="border-border bg-card rounded-xl border p-4">
        <h3 className="mb-4 text-lg font-semibold">Before / After</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">Before</p>
            {beforeImage ? (
              <div className="border-border bg-muted/20 flex h-96 w-full items-center justify-center overflow-hidden rounded-lg border">
                <img
                  src={beforeImage.url}
                  alt="Latest before"
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="text-muted-foreground border-border flex h-96 items-center justify-center rounded-lg border text-sm">
                No before photo yet.
              </div>
            )}
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">After</p>
            {afterImage ? (
              <div className="border-border bg-muted/20 flex h-96 w-full items-center justify-center overflow-hidden rounded-lg border">
                <img
                  src={afterImage.url}
                  alt="Latest after"
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="text-muted-foreground border-border flex h-96 items-center justify-center rounded-lg border text-sm">
                No after photo yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProgressPics;