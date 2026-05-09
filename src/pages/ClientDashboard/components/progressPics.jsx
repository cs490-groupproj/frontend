import React, { useMemo, useState, useEffect } from "react";
import useGetFromAPI from "@/hooks/useGetFromAPI";
import useDeleteFromAPI from "@/hooks/useDeleteFromAPI";
import { API_BASE_URL } from "../../../../config";
import { getAuthHeader } from "@/lib/authHeader";
import { Loader2 } from "lucide-react";

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
  const [pendingMessage, setPendingMessage] = useState("");
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

  const {
    data: beforeData,
    loading: beforeLoading,
    error: beforeError,
  } = useGetFromAPI(beforeUri, refreshKey);
  const {
    data: afterData,
    loading: afterLoading,
    error: afterError,
  } = useGetFromAPI(afterUri, refreshKey);

  const beforeImage = useMemo(
    () =>
      Array.isArray(beforeData?.images) ? beforeData.images[0] || null : null,
    [beforeData]
  );

  const afterImage = useMemo(
    () =>
      Array.isArray(afterData?.images) ? afterData.images[0] || null : null,
    [afterData]
  );

  useEffect(() => {
    if (pendingMessage && !beforeLoading && !afterLoading) {
      setMessage(pendingMessage);
      setPendingMessage("");
      const timer = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [beforeLoading, afterLoading, pendingMessage]);

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const MAX_FILE_SIZE = 30 * 1024 * 1024; // Max file size would be 30MB

  const uploadImage = async (type) => {
    const file = type === PHOTO_TYPES.BEFORE ? beforeFile : afterFile;
    if (!file) {
      setLocalError(`Select a ${type.toLowerCase()} image first.`);
      setMessage("");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setLocalError(
        "Invalid file type. Please upload a JPEG, PNG, or WebP image."
      );
      setMessage("");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setLocalError("File is too large. Max size is 10MB.");
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
      setPendingMessage(
        `${type === PHOTO_TYPES.BEFORE ? "Before" : "After"} photo uploaded.`
      );
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setLocalError(error?.message || "Upload failed.");
    } finally {
      setBusyType("");
    }
  };

  const clearLatest = async (type) => {
    const imageToDelete =
      type === PHOTO_TYPES.BEFORE ? beforeImage : afterImage;
    if (!imageToDelete?.id) return;

    setBusyType(`delete-${type}`);
    setLocalError("");
    setMessage("");
    try {
      await deleteFunction(`/progress/delete?id=${imageToDelete.id}`);
      if (type === PHOTO_TYPES.BEFORE) setBeforeFile(null);
      if (type === PHOTO_TYPES.AFTER) setAfterFile(null);
      setEditingType("");
      setMessage(
        `${type === PHOTO_TYPES.BEFORE ? "Before" : "After"} photo removed.`
      );
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setLocalError(error?.message || "Delete failed.");
    } finally {
      setBusyType("");
    }
  };

  const isInitialLoading =
    (beforeLoading && !beforeData) || (afterLoading && !afterData);
  const errorText = localError || beforeError || afterError;
  const hasBefore = Boolean(beforeImage);
  const hasAfter = Boolean(afterImage);
  const isEditingBefore = editingType === PHOTO_TYPES.BEFORE;
  const isEditingAfter = editingType === PHOTO_TYPES.AFTER;

  if (isInitialLoading) {
    return (
      <div
        className="flex h-[60vh] w-full flex-col items-center justify-center
          p-6"
      >
        <Loader2 className="text-primary h-12 w-12 animate-spin" />
        <p
          className="text-muted-foreground mt-4 text-xs font-bold
            tracking-widest uppercase"
        >
          Fetching Progress Photos
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-6 p-4 md:p-6">
      {(message || errorText) && (
        <section className={panelStyles}>
          {message ? (
            <p
              className="rounded-lg border border-emerald-500/30
                bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400"
            >
              {message}
            </p>
          ) : null}
          {errorText ? (
            <p
              className="text-destructive border-destructive/30
                bg-destructive/10 mt-2 rounded-lg border px-3 py-2 text-sm"
            >
              {errorText}
            </p>
          ) : null}
        </section>
      )}
      <section className={panelStyles}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="border-border bg-background/50 rounded-xl border p-4">
            <div className="mb-3 flex items-center justify-between">
              <p
                className="text-foreground text-2xl font-semibold
                  tracking-tight"
              >
                Before
              </p>
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
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    setBeforeFile(event.target.files?.[0] || null)
                  }
                  className="border-border bg-background/80 file:border-border
                    file:bg-secondary file:text-secondary-foreground
                    hover:file:bg-secondary/80 block w-full cursor-pointer
                    rounded-lg border px-3 py-2 text-sm file:mr-3
                    file:cursor-pointer file:rounded-md file:border file:px-3
                    file:py-1.5 file:text-sm file:font-medium"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => uploadImage(PHOTO_TYPES.BEFORE)}
                    disabled={
                      busyType === `upload-${PHOTO_TYPES.BEFORE}` || !beforeFile
                    }
                    className="bg-primary text-primary-foreground
                      hover:bg-primary/90 rounded-lg px-4 py-2 text-sm
                      font-medium shadow-sm transition
                      disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busyType === `upload-${PHOTO_TYPES.BEFORE}`
                      ? "Uploading..."
                      : "Upload"}
                  </button>
                  {hasBefore && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingType("");
                        setBeforeFile(null);
                      }}
                      className="border-border text-foreground hover:bg-muted
                        rounded-lg border px-4 py-2 text-sm font-medium
                        transition"
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
                  className="bg-primary text-primary-foreground
                    hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium
                    shadow-sm transition"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => clearLatest(PHOTO_TYPES.BEFORE)}
                  disabled={
                    busyType === `delete-${PHOTO_TYPES.BEFORE}` || !beforeImage
                  }
                  className="text-destructive border-destructive/40
                    hover:bg-destructive/10 rounded-lg border px-4 py-2 text-sm
                    font-medium transition disabled:cursor-not-allowed
                    disabled:opacity-50"
                >
                  {busyType === `delete-${PHOTO_TYPES.BEFORE}`
                    ? "Removing..."
                    : "Remove"}
                </button>
              </div>
            )}

            <div className={imageFrameStyles}>
              {beforeLoading && !pendingMessage && (
                <div
                  className="bg-background/5 absolute inset-0 z-10 flex
                    items-center justify-center transition-opacity"
                >
                  <Loader2
                    className="text-primary h-8 w-8 animate-spin drop-shadow-md"
                  />
                </div>
              )}

              {beforeImage ? (
                <img
                  src={beforeImage.url}
                  alt="Latest before"
                  className="h-full w-full object-contain transition-all
                    duration-500 group-hover:scale-[1.01]"
                />
              ) : (
                <div
                  className="text-muted-foreground flex flex-col items-center
                    gap-3"
                >
                  <div className="text-center">
                    <span className="block text-sm font-bold">No Photo</span>
                    <span className="text-muted-foreground/60 text-xs">
                      Starting your journey
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-border bg-background/50 rounded-xl border p-4">
            <div className="mb-3 flex items-center justify-between">
              <p
                className="text-foreground text-2xl font-semibold
                  tracking-tight"
              >
                After
              </p>
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
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    setAfterFile(event.target.files?.[0] || null)
                  }
                  className="border-border bg-background/80 file:border-border
                    file:bg-secondary file:text-secondary-foreground
                    hover:file:bg-secondary/80 block w-full cursor-pointer
                    rounded-lg border px-3 py-2 text-sm file:mr-3
                    file:cursor-pointer file:rounded-md file:border file:px-3
                    file:py-1.5 file:text-sm file:font-medium"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => uploadImage(PHOTO_TYPES.AFTER)}
                    disabled={
                      busyType === `upload-${PHOTO_TYPES.AFTER}` || !afterFile
                    }
                    className="bg-primary text-primary-foreground
                      hover:bg-primary/90 rounded-lg px-4 py-2 text-sm
                      font-medium shadow-sm transition
                      disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busyType === `upload-${PHOTO_TYPES.AFTER}`
                      ? "Uploading..."
                      : "Upload"}
                  </button>
                  {hasAfter && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingType("");
                        setAfterFile(null);
                      }}
                      className="border-border text-foreground hover:bg-muted
                        rounded-lg border px-4 py-2 text-sm font-medium
                        transition"
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
                  className="bg-primary text-primary-foreground
                    hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium
                    shadow-sm transition"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => clearLatest(PHOTO_TYPES.AFTER)}
                  disabled={
                    busyType === `delete-${PHOTO_TYPES.AFTER}` || !afterImage
                  }
                  className="text-destructive border-destructive/40
                    hover:bg-destructive/10 rounded-lg border px-4 py-2 text-sm
                    font-medium transition disabled:cursor-not-allowed
                    disabled:opacity-50"
                >
                  {busyType === `delete-${PHOTO_TYPES.AFTER}`
                    ? "Removing..."
                    : "Remove"}
                </button>
              </div>
            )}

            <div className={imageFrameStyles}>
              {afterLoading && !pendingMessage && (
                <div
                  className="bg-background/5 absolute inset-0 z-10 flex
                    items-center justify-center transition-opacity"
                >
                  <Loader2
                    className="text-primary h-8 w-8 animate-spin drop-shadow-md"
                  />
                </div>
              )}
              {afterImage ? (
                <img
                  src={afterImage.url}
                  alt="Latest after"
                  className="h-full w-full object-contain transition-all
                    duration-500 group-hover:scale-[1.01]"
                />
              ) : (
                <div
                  className="text-muted-foreground flex flex-col items-center
                    gap-3"
                >
                  <div className="text-center">
                    <span className="block text-sm font-bold">No Photo</span>
                    <span className="text-muted-foreground/60 text-xs">
                      Reach your goals
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProgressPics;
