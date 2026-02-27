"use client";

import { useEffect, useState } from "react";
import { EmsShell } from "@/components/ems-shell";
import { ApiError, apiGet } from "@/lib/api";

type Bucket = { [key: string]: string | number | null };
type AnalyticsPayload = {
  users_by_role: Bucket[];
  activity_by_type: Bucket[];
  activity_by_device: Bucket[];
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGet<AnalyticsPayload>("/admin/analytics")
      .then((payload) => {
        setData(payload);
        setError(null);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load analytics.");
        setIsLoading(false);
      });
  }, []);

  return (
    <EmsShell title="Analytics">
      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 text-sm font-semibold">Users by role</h2>
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ) : (
            <div className="space-y-1 text-sm">
              {data?.users_by_role?.map((item, index) => <div key={index}>{String(item.role)}: {String(item.total)}</div>)}
            </div>
          )}
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 text-sm font-semibold">Activity by type</h2>
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ) : (
            <div className="space-y-1 text-sm">
              {data?.activity_by_type?.slice(0, 12).map((item, index) => <div key={index}>{String(item.activity_type)}: {String(item.total)}</div>)}
            </div>
          )}
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 text-sm font-semibold">Activity by device</h2>
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-3/5 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ) : (
            <div className="space-y-1 text-sm">
              {data?.activity_by_device?.map((item, index) => <div key={index}>{String(item.device)}: {String(item.total)}</div>)}
            </div>
          )}
        </section>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </EmsShell>
  );
}
