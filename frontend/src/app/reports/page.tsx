"use client";

import { EmsShell } from "@/components/ems-shell";
import { apiFetch, apiGet } from "@/lib/api";
import { useEffect, useState } from "react";

type EmailJob = { id: number; email: string; recurrence: string; status: string; format: string };

export default function ReportsPage() {
  const [jobs, setJobs] = useState<EmailJob[]>([]);
  const [exporting, setExporting] = useState<"csv" | "xlsx" | "pdf" | null>(null);

  useEffect(() => {
    let active = true;
    apiGet<EmailJob[]>("/reports/email-jobs")
      .then((data) => {
        if (active) {
          setJobs(data);
        }
      })
      .catch(() => {
        if (active) {
          setJobs([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const exportReport = async (format: "csv" | "xlsx" | "pdf") => {
    setExporting(format);
    try {
      const response = await apiFetch(`/reports/export?format=${format}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = `ems-report.${format}`;
      link.click();
      URL.revokeObjectURL(href);
    } finally {
      setExporting(null);
    }
  };

  return (
    <EmsShell title="Reports & Exports">
      <section className="mb-4 flex gap-2">
        <button className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 disabled:opacity-60" disabled={exporting !== null} onClick={() => exportReport("csv")}>
          {exporting === "csv" ? "Exporting..." : "Export CSV"}
        </button>
        <button className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 disabled:opacity-60" disabled={exporting !== null} onClick={() => exportReport("xlsx")}>
          {exporting === "xlsx" ? "Exporting..." : "Export XLSX"}
        </button>
        <button className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 disabled:opacity-60" disabled={exporting !== null} onClick={() => exportReport("pdf")}>
          {exporting === "pdf" ? "Exporting..." : "Export PDF"}
        </button>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold">Scheduled email jobs</h2>
        <div className="space-y-2 text-sm">
          {jobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 dark:border-slate-800">
              <span>{job.email}</span>
              <span>{job.recurrence}</span>
              <span>{job.format}</span>
              <span className="rounded bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-700">{job.status}</span>
            </div>
          ))}
          {!jobs.length && <p className="text-slate-500">No jobs found.</p>}
        </div>
      </section>
    </EmsShell>
  );
}
