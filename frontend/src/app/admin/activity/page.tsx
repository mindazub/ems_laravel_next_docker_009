"use client";

import { EmsShell } from "@/components/ems-shell";
import { apiGet } from "@/lib/api";
import { useEffect, useState } from "react";

type Activity = { id: number; activity_type: string; description: string; created_at: string };

export default function ActivityPage() {
  const [data, setData] = useState<Activity[]>([]);

  useEffect(() => {
    let active = true;
    apiGet<Activity[]>("/admin/activity")
      .then((payload) => {
        if (active) {
          setData(payload);
        }
      })
      .catch(() => {
        if (active) {
          setData([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <EmsShell title="Admin Activity">
      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold">Activity log</h2>
        <div className="space-y-2 text-sm">
          {data.slice(0, 40).map((item) => (
            <div key={item.id} className="rounded-md border border-slate-200 px-3 py-2 dark:border-slate-800">
              <div className="font-medium">{item.activity_type}</div>
              <div className="text-slate-600 dark:text-slate-300">{item.description}</div>
            </div>
          ))}
          {!data.length && <p className="text-slate-500">No activity records available.</p>}
        </div>
      </section>
    </EmsShell>
  );
}
