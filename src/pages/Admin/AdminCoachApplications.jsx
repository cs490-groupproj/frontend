import React, { useState, useMemo } from "react";
import { Button } from "../../components/ui/button.jsx";
import useGetFromAPI from "../../hooks/useGetFromAPI";
import usePostToAPI from "../../hooks/usePostToAPI";

const mapApplicationFromBackend = (data) => {
  return {
    id: data.user_id,
    surveyId: data.survey_id,
    name: `${data.first_name} ${data.last_name}`,
    email: data.email,
    specializations: [data.specialization].filter(Boolean),
    qualifications: data.qualifications || "No qualifications provided",
    dateSubmitted: data.date_submitted,
  };
};

export default function AdminCoachApplications() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  const { data: apiResponse, loading: fetchLoading } = useGetFromAPI(
    "/admin/review_surveys?limit=50&offset=0",
    refreshTrigger
  );

  const { postFunction: handleApplicationAction } = usePostToAPI();

  const applications = useMemo(() => {
    return (apiResponse?.candidates || []).map(mapApplicationFromBackend);
  }, [apiResponse]);

  const addNotification = (text, type = "info") => {
    const id = crypto.randomUUID?.() ?? Date.now().toString();
    setNotifications((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, 4500);
  };

  const handleAction = async (app, action) => {
    const isAccept = action === "accept";
    const endpoint = isAccept
      ? "/admin/make_coach"
      : "/admin/reject_application";
    const payload = isAccept
      ? { user_id: app.id }
      : { survey_id: app.surveyId };

    setProcessingId(app.surveyId);

    try {
      await handleApplicationAction(endpoint, payload);
      addNotification(
        isAccept ? `${app.name} promoted!` : `Application rejected.`,
        isAccept ? "success" : "secondary"
      );
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      addNotification("Action failed.", "danger");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Coach Applications
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review candidate surveys and promote users to the Coach role.
        </p>
      </header>

      {/* Identical grid logic to BrowseCoaches: 3 columns on XL, 2 on SM */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {fetchLoading && applications.length === 0 ? (
          <p className="text-muted-foreground col-span-full italic">
            Loading applications...
          </p>
        ) : applications.length > 0 ? (
          applications.map((app) => (
            <article
              key={app.surveyId}
              className="border-border bg-card flex h-full flex-col
                justify-between rounded-xl border p-5 shadow-sm transition
                hover:-translate-y-0.5 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-xl leading-tight font-semibold">
                      {app.name}
                    </h2>
                    <p
                      className="text-muted-foreground mt-1 truncate text-sm
                        opacity-80"
                    >
                      {app.email}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className="text-muted-foreground block text-[10px]
                        font-bold uppercase opacity-60"
                    >
                      {new Date(app.dateSubmitted).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h3
                    className="text-secondary-foreground text-sm font-semibold
                      tracking-wider uppercase"
                  >
                    Specialization
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {app.specializations.map((spec) => (
                      <span
                        key={spec}
                        className="border-muted text-muted-foreground
                          rounded-full border px-2 py-1 text-xs font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h3
                    className="text-secondary-foreground text-sm font-semibold
                      tracking-wider uppercase"
                  >
                    Qualifications
                  </h3>
                  <div
                    className="bg-muted/30 border-border/50 text-foreground/90
                      mt-2 min-h-[80px] rounded-lg border p-4 text-sm
                      leading-relaxed italic"
                  >
                    "{app.qualifications}"
                  </div>
                </div>
              </div>

              {/* Action Buttons using Neutral Grey and Brand Primary */}
              <div
                className="mt-5 flex flex-wrap items-center justify-end gap-2"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-muted/40 border-border text-foreground
                    hover:bg-muted font-medium transition-colors"
                  disabled={processingId === app.surveyId}
                  onClick={() => handleAction(app, "reject")}
                >
                  Reject
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-primary text-primary-foreground
                    hover:bg-primary/90 font-bold transition-all"
                  disabled={processingId === app.surveyId}
                  onClick={() => handleAction(app, "accept")}
                >
                  {processingId === app.surveyId ? "..." : "Approve Candidate"}
                </Button>
              </div>
            </article>
          ))
        ) : (
          <div
            className="text-muted-foreground col-span-full rounded-xl border-2
              border-dashed py-16 text-center"
          >
            No pending coach applications found.
          </div>
        )}
      </div>
    </div>
  );
}
