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
  // refreshTrigger replaces the old 'refetch()' function
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
      const responseData = await handleApplicationAction(endpoint, payload);

      console.log(`--- ${action.toUpperCase()} SUCCESS JSON ---`);
      console.log(JSON.stringify(responseData, null, 2));

      addNotification(
        isAccept
          ? `${app.name} is now a coach!`
          : `Application for ${app.name} rejected.`,
        isAccept ? "success" : "info"
      );

      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error(`--- ${action.toUpperCase()} ERROR ---`, err);
      addNotification("Action failed. The backend may have crashed.", "danger");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Coach Applications</h1>
        <p className="text-muted-foreground mt-1">
          Review candidate surveys and promote users to the Coach role.
        </p>
      </div>

      <div className="fixed top-4 right-4 z-50 w-80 space-y-2">
        {notifications.map((note) => (
          <div
            key={note.id}
            className={`rounded-lg border px-4 py-3 text-sm shadow-lg
            transition-all ${
              note.type === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : note.type === "danger"
                  ? "border-rose-300 bg-rose-50 text-rose-900"
                  : "border-slate-300 bg-slate-50 text-slate-900"
            }`}
          >
            {note.text}
          </div>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2">
        {fetchLoading && applications.length === 0 ? (
          <p className="text-muted-foreground italic">
            Loading applications...
          </p>
        ) : applications.length > 0 ? (
          applications.map((app) => (
            <article
              key={app.surveyId}
              className="border-border bg-card rounded-xl border p-6 shadow-sm
                transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">{app.name}</h2>
                  <p className="text-muted-foreground text-sm">{app.email}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {app.specializations.map((spec) => (
                      <span
                        key={spec}
                        className="bg-primary/10 text-primary rounded-full px-3
                          py-1 text-xs font-semibold tracking-wider uppercase"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-muted-foreground text-right text-xs">
                  Submitted: {new Date(app.dateSubmitted).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-6">
                <h3
                  className="text-secondary-foreground text-xs font-bold
                    tracking-widest uppercase"
                >
                  Qualifications & Experience
                </h3>
                <div
                  className="bg-muted/30 text-muted-foreground mt-2 rounded-lg
                    p-4 text-sm leading-relaxed"
                >
                  {app.qualifications}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                <Button
                  variant="outline"
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  disabled={processingId === app.surveyId}
                  onClick={() => handleAction(app, "reject")}
                >
                  Reject
                </Button>
                <Button
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  disabled={processingId === app.surveyId}
                  onClick={() => handleAction(app, "accept")}
                >
                  {processingId === app.surveyId
                    ? "Processing..."
                    : "Approve Candidate"}
                </Button>
              </div>
            </article>
          ))
        ) : (
          <div
            className="col-span-full rounded-xl border-2 border-dashed p-12
              text-center"
          >
            <p className="text-muted-foreground font-medium">
              No pending coach applications found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
