"use client";

import { useEffect, useState } from "react";
import { EmsShell } from "@/components/ems-shell";
import { ApiError, apiGet, apiPost } from "@/lib/api";

type QueuePayload = {
  jobs_pending: number;
  failed_jobs: number;
  logs: Array<{ id: number; job_type: string; status: string; created_at: string }>;
};

export default function QueuePage() {
  const [queue, setQueue] = useState<QueuePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const payload = await apiGet<QueuePayload>("/admin/queue");
      setQueue(payload);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load queue status.");
    }
  };

  useEffect(() => {
    let active = true;
    apiGet<QueuePayload>("/admin/queue")
      .then((payload) => {
        if (!active) {
          return;
        }
        setQueue(payload);
        setError(null);
      })
      .catch((err) => {
        if (!active) {
          return;
        }
        setError(err instanceof ApiError ? err.message : "Failed to load queue status.");
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <EmsShell title="Queue Monitor">
      <div className="mb-4 flex gap-2">
        <button className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700" onClick={() => apiPost("/admin/queue/restart").then(load)}>
          Restart workers
        </button>
        <button className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700" onClick={() => apiPost("/admin/queue/retry-failed").then(load)}>
          Retry failed
        </button>
        <button className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700" onClick={() => apiPost("/admin/scheduler/run-now").then(load)}>
          Run scheduler now
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Pending jobs</div>
          <div className="text-2xl font-semibold">{queue?.jobs_pending ?? "-"}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Failed jobs</div>
          <div className="text-2xl font-semibold">{queue?.failed_jobs ?? "-"}</div>
        </div>
      </section>

      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold">Recent queue logs</h2>
        <div className="space-y-2 text-sm">
          {queue?.logs?.slice(0, 80).map((item) => (
            <div key={item.id} className="rounded border border-slate-200 px-3 py-2 dark:border-slate-800">
              <div className="font-medium">{item.job_type}</div>
              <div className="text-slate-500">{item.status} · {item.created_at}</div>
            </div>
          ))}
          {!queue?.logs?.length && <p className="text-slate-500">No queue logs.</p>}
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>
    </EmsShell>
  );
}
