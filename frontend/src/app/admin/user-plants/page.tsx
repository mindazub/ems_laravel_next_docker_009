"use client";

import { useEffect, useState } from "react";
import { EmsShell } from "@/components/ems-shell";
import { ApiError, apiGet, apiPost } from "@/lib/api";

type UserPlant = {
  id: number;
  uid: string;
  name: string;
  owner_name: string;
  owner_email: string;
  approval_status: "pending" | "approved" | "rejected";
};

export default function UserPlantsPage() {
  const [items, setItems] = useState<UserPlant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const payload = await apiGet<UserPlant[]>("/user-plants");
      setItems(payload);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load user plants.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    apiGet<UserPlant[]>("/user-plants")
      .then((payload) => {
        if (!active) {
          return;
        }
        setItems(payload);
        setError(null);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!active) {
          return;
        }
        setError(err instanceof ApiError ? err.message : "Failed to load user plants.");
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <EmsShell title="User Plant Approvals">
      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold">Approval queue</h2>
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-14 rounded border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800" />
            <div className="h-14 rounded border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800" />
            <div className="h-14 rounded border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800" />
          </div>
        ) : (
        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 dark:border-slate-800">
              <div>
                <div className="font-medium">{item.name} ({item.uid})</div>
                <div className="text-slate-500">{item.owner_name} · {item.owner_email} · {item.approval_status}</div>
              </div>
              {item.approval_status === "pending" && (
                <div className="flex gap-2">
                  <button className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700" onClick={() => apiPost(`/user-plants/${item.id}/approve`).then(load)}>Approve</button>
                  <button className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700" onClick={() => apiPost(`/user-plants/${item.id}/reject`, { rejection_reason: "Rejected by staff" }).then(load)}>Reject</button>
                </div>
              )}
            </div>
          ))}
          {!items.length && <p className="text-slate-500">No user plants submitted.</p>}
        </div>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>
    </EmsShell>
  );
}
