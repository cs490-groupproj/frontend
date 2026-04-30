import React, { useMemo, useState } from "react";
import useGetFromAPI from "@/hooks/useGetFromAPI";
import useDeleteFromAPI from "@/hooks/useDeleteFromAPI";
import { API_BASE_URL } from "../../../../config";
import { getAuthHeader } from "@/lib/authHeader";

const PHOTO_TYPES = {
  BEFORE: "BEFORE",
  AFTER: "AFTER",
};

const panelStyles =
  "border-border bg-card/70 rounded-2xl border p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60";
const imageFrameStyles =
  "border-border bg-muted/20 ring-border/30 flex h-96 w-full items-center justify-center overflow-hidden rounded-xl border ring-1";

function ProgressPics() {
  const userId = localStorage.getItem("userId");
  const [refreshKey, setRefreshKey] = useState(0);
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState("");
  const [busyType, setBusyType] = useState("");
  const [editingType, setEditingType] = useState("");

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
      setEditingType("");
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
      if (type === PHOTO_TYPES.BEFORE) setBeforeFile(null);
      if (type === PHOTO_TYPES.AFTER) setAfterFile(null);
      setEditingType("");
      setMessage(`${type === PHOTO_TYPES.BEFORE ? "Before" : "After"} photo removed.`);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setLocalError(error?.message || "Delete failed.");
    } finally {
      setBusyType("");
    }
  };

  const errorText = localError || beforeError || afterError;
  const hasBefore = Boolean(beforeImage);
  const hasAfter = Boolean(afterImage);
  const isEditingBefore = editingType === PHOTO_TYPES.BEFORE;
  const isEditingAfter = editingType === PHOTO_TYPES.AFTER;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <section className={`${panelStyles} bg-gradient-to-br from-card via-card to-muted/20`}>


        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="border-border bg-background/50 rounded-xl border p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-foreground text-2xl font-semibold tracking-tight">Before</p>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  hasBefore
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {hasBefore ? "Saved" : "Missing"}
              </span>
            </div>

            {(isEditingBefore || !hasBefore) && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setBeforeFile(event.target.files?.[0] || null)}
                  className="border-border bg-background/80 block w-full cursor-pointer rounded-lg border px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-border file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => uploadImage(PHOTO_TYPES.BEFORE)}
                    disabled={busyType === `upload-${PHOTO_TYPES.BEFORE}` || !beforeFile}
                    className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busyType === `upload-${PHOTO_TYPES.BEFORE}` ? "Uploading..." : "Upload"}
                  </button>
                  {hasBefore && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingType("");
                        setBeforeFile(null);
                      }}
                      className="border-border text-foreground rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </>
            )}

            {!isEditingBefore && hasBefore && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLocalError("");
                    setMessage("");
                    setEditingType(PHOTO_TYPES.BEFORE);
                  }}
                  className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-primary/90"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => clearLatest(PHOTO_TYPES.BEFORE)}
                  disabled={busyType === `delete-${PHOTO_TYPES.BEFORE}` || !beforeImage}
                  className="text-destructive border-destructive/40 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyType === `delete-${PHOTO_TYPES.BEFORE}` ? "Removing..." : "Remove"}
                </button>
              </div>
            )}

            <div className="mt-4">
              {beforeImage ? (
                <div className={imageFrameStyles}>
                  <img
                    src={beforeImage.url}
                    alt="Latest before"
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className={`${imageFrameStyles} text-muted-foreground flex-col gap-1 text-sm`}>
                  <span className="text-base">No before photo yet</span>
                  <span className="text-muted-foreground/80 text-xs">
                    Upload one to start tracking progress.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="border-border bg-background/50 rounded-xl border p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-foreground text-2xl font-semibold tracking-tight">After</p>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  hasAfter
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {hasAfter ? "Saved" : "Missing"}
              </span>
            </div>
            {(isEditingAfter || !hasAfter) && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setAfterFile(event.target.files?.[0] || null)}
                  className="border-border bg-background/80 block w-full cursor-pointer rounded-lg border px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-border file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => uploadImage(PHOTO_TYPES.AFTER)}
                    disabled={busyType === `upload-${PHOTO_TYPES.AFTER}` || !afterFile}
                    className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busyType === `upload-${PHOTO_TYPES.AFTER}` ? "Uploading..." : "Upload"}
                  </button>
                  {hasAfter && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingType("");
                        setAfterFile(null);
                      }}
                      className="border-border text-foreground rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </>
            )}

            {!isEditingAfter && hasAfter && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLocalError("");
                    setMessage("");
                    setEditingType(PHOTO_TYPES.AFTER);
                  }}
                  className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-primary/90"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => clearLatest(PHOTO_TYPES.AFTER)}
                  disabled={busyType === `delete-${PHOTO_TYPES.AFTER}` || !afterImage}
                  className="text-destructive border-destructive/40 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyType === `delete-${PHOTO_TYPES.AFTER}` ? "Removing..." : "Remove"}
                </button>
              </div>
            )}

            <div className="mt-4">
              {afterImage ? (
                <div className={imageFrameStyles}>
                  <img
                    src={afterImage.url}
                    alt="Latest after"
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className={`${imageFrameStyles} text-muted-foreground flex-col gap-1 text-sm`}>
                  <span className="text-base">No after photo yet</span>
                  <span className="text-muted-foreground/80 text-xs">
                    Upload one when you are ready to compare.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {(message || errorText) && (
        <section className={panelStyles}>
          {message ? (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
              {message}
            </p>
          ) : null}
          {errorText ? (
            <p className="text-destructive mt-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">
              {errorText}
            </p>
          ) : null}
        </section>
      )}
    </div>
  );
}

export default ProgressPics;