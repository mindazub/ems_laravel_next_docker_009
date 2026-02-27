"use client";

import { useEffect, useState } from "react";
import { EmsShell } from "@/components/ems-shell";
import { ApiError, apiGet } from "@/lib/api";

type Diagram = { id: number; name: string; plant_uid?: string | null; description?: string | null; created_at?: string };

export default function DiagramsPage() {
  const [scada, setScada] = useState<Diagram[]>([]);
  const [jsonDiagrams, setJsonDiagrams] = useState<Diagram[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([apiGet<Diagram[]>("/diagrams/scada"), apiGet<Diagram[]>("/diagrams/json")])
      .then(([scadaPayload, jsonPayload]) => {
        setScada(scadaPayload);
        setJsonDiagrams(jsonPayload);
        setError(null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load diagrams."));
  }, []);

  return (
    <EmsShell title="Diagrams">
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold">SCADA diagrams</h2>
          <div className="space-y-2 text-sm">
            {scada.map((item) => (
              <div key={item.id} className="rounded border border-slate-200 px-3 py-2 dark:border-slate-800">
                <div className="font-medium">{item.name}</div>
                <div className="text-slate-500">{item.plant_uid ?? "No plant"}</div>
              </div>
            ))}
            {!scada.length && <p className="text-slate-500">No SCADA diagrams.</p>}
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold">JSON diagrams</h2>
          <div className="space-y-2 text-sm">
            {jsonDiagrams.map((item) => (
              <div key={item.id} className="rounded border border-slate-200 px-3 py-2 dark:border-slate-800">
                <div className="font-medium">{item.name}</div>
                <div className="text-slate-500">{item.plant_uid ?? "No plant"}</div>
              </div>
            ))}
            {!jsonDiagrams.length && <p className="text-slate-500">No JSON diagrams.</p>}
          </div>
        </section>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </EmsShell>
  );
}
