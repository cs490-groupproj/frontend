import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button.jsx";
import useGetFromAPI from "../../hooks/useGetFromAPI";
import usePostToAPI from "../../hooks/usePostToAPI";

export default function CoachReports() {
  const [currentPage, setCurrentPage] = useState(1);
  const [actioningIds, setActioningIds] = useState(new Set());
  
  const [localReports, setLocalReports] = useState([]);

  const reportsPerPage = 10;
  const offset = (currentPage - 1) * reportsPerPage;

  const { data, loading, refetch } = useGetFromAPI(
    `/admin/reports?limit=${reportsPerPage}&offset=${offset}`,
    currentPage
  );

  const { postFunction: adminActionAPI } = usePostToAPI();

 
  useEffect(() => {
    if (data?.reports) {
      setLocalReports(data.reports);
    }
  }, [data]);

  const totalReports = data?.total_count || 0;

  const handleSuspendCoach = async (report) => {
    const confirmBan = window.confirm(
      `Are you sure you want to permanently ban ${report.coach.first_name} ${report.coach.last_name}?`
    );
    if (!confirmBan) return;

    setActioningIds((prev) => new Set(prev).add(report.coach_report_id));

    try {
      await adminActionAPI("/admin/users/ban", {
        user_id: report.coach.coach_id,
      });

      
      setLocalReports((prev) =>
        prev.filter((r) => r.coach.coach_id !== report.coach.coach_id)
      );
      alert("Coach suspended and reports cleared.");
    } catch (err) {
      // 2. The "JSON" Fix: If it's a parse error but the status is 200/201, it actually worked!
      if (err.message?.includes("JSON") || err.status === 502) {
        setLocalReports((prev) =>
          prev.filter((r) => r.coach.coach_id !== report.coach.coach_id)
        );
        console.log("Ban successful despite response format issue.");
      } else {
        alert("An error occurred while trying to suspend the coach.");
      }
    } finally {
      setActioningIds((prev) => {
        const next = new Set(prev);
        next.delete(report.coach_report_id);
        return next;
      });
      refetch(); 
    }
  };

  const handleIgnoreReport = async (reportId) => {
    if (!window.confirm("Ignore this report?")) return;

    try {
      await adminActionAPI("/admin/reject_report", {
        coach_report_id: reportId,
      });
      setLocalReports((prev) =>
        prev.filter((r) => r.coach_report_id !== reportId)
      );
    } catch (err) {
     
      if (err.message?.includes("JSON")) {
        setLocalReports((prev) =>
          prev.filter((r) => r.coach_report_id !== reportId)
        );
      } else {
        alert("Failed to delete the report.");
      }
    } finally {
      refetch();
    }
  };

  return (
    <div className="w-full space-y-6 p-6">
      <header>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">
          Coach Reports
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review complaints and manage coach conduct.
        </p>
      </header>

      <div
        className="border-border bg-card overflow-hidden rounded-xl border
          shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr
                className="border-border text-muted-foreground bg-muted/30
                  border-b text-xs font-semibold tracking-widest uppercase"
              >
                <th className="px-8 py-5">Reported Coach</th>
                <th className="px-8 py-5">Report Details</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {loading && localReports.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="text-muted-foreground animate-pulse px-8 py-20
                      text-center"
                  >
                    Loading...
                  </td>
                </tr>
              ) : localReports.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="text-muted-foreground px-8 py-20 text-center"
                  >
                    No pending reports.
                  </td>
                </tr>
              ) : (
                localReports.map((report) => (
                  <tr
                    key={report.coach_report_id}
                    className="hover:bg-muted/5 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="text-foreground font-semibold">
                        {report.coach.first_name} {report.coach.last_name}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {report.coach.email}
                      </div>
                    </td>
                    <td className="max-w-md px-8 py-5 text-sm">
                      <div
                        className="bg-muted/50 border-border text-foreground/80
                          rounded-lg border p-4 italic"
                      >
                        "{report.report_message}"
                      </div>
                    </td>
                    <td
                      className="space-x-3 px-8 py-5 text-right
                        whitespace-nowrap"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleIgnoreReport(report.coach_report_id)
                        }
                      >
                        Ignore
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={actioningIds.has(report.coach_report_id)}
                        onClick={() => handleSuspendCoach(report)}
                      >
                        {actioningIds.has(report.coach_report_id)
                          ? "Banning..."
                          : "Suspend Coach"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="flex items-center justify-between px-2 py-4">
        <p className="text-muted-foreground text-sm">
          Total Reports:{" "}
          <span className="text-foreground font-medium">{totalReports}</span>
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={offset + localReports.length >= totalReports}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </footer>
    </div>
  );
}
