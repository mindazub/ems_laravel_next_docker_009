"use client";

import { useEffect, useState } from "react";
import { EmsShell } from "@/components/ems-shell";
import { ApiError, apiGet } from "@/lib/api";

type ApiRoute = {
  uri: string;
  methods: string[];
  name: string | null;
  action: string;
};

export default function ApiDocsPage() {
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<ApiRoute[]>("/admin/api-docs")
      .then((payload) => {
        setRoutes(payload);
        setError(null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load API docs."));
  }, []);

  return (
    <EmsShell title="API Docs">
      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold">Registered API routes</h2>
        <div className="space-y-2 text-sm">
          {routes.map((route, index) => (
            <div key={index} className="rounded border border-slate-200 px-3 py-2 dark:border-slate-800">
              <div className="font-mono text-xs text-slate-500">{route.methods.join(", ")}</div>
              <div className="font-medium">/{route.uri}</div>
              <div className="text-xs text-slate-500">{route.action}</div>
            </div>
          ))}
          {!routes.length && <p className="text-slate-500">No API routes loaded.</p>}
          {error && <p className="text-red-600">{error}</p>}
        </div>
      </section>
    </EmsShell>
  );
}
