"use client";

import { useEffect, useState } from "react";
import { EmsShell } from "@/components/ems-shell";
import { ApiError, apiGet, apiPost } from "@/lib/api";

type PlantNameMapping = {
  id: number;
  plant_uuid: string;
  display_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

type SeedResponse = {
  message: string;
  total: number;
};

export default function PlantNameMappingsPage() {
  const [items, setItems] = useState<PlantNameMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadMappings = async () => {
    try {
      const payload = await apiGet<PlantNameMapping[]>("/admin/plant-name-mappings");
      setItems(payload);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load plant name mappings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMappings();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    setError(null);
    setMessage(null);

    try {
      const response = await apiPost<SeedResponse>("/admin/plant-name-mappings/seed");
      setMessage(`${response.message} Total mappings: ${response.total}.`);
      await loadMappings();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to seed plant names.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <EmsShell title="Plant Name Mappings">
      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-slate-500">All mapped plant names</div>
          <button
            type="button"
            onClick={handleSeed}
            disabled={seeding}
            className="rounded border border-slate-300 px-3 py-2 text-sm disabled:opacity-60 dark:border-slate-700"
          >
            {seeding ? "Seeding..." : "Seed Plant Names"}
          </button>
        </div>

        {message && <p className="mb-3 text-sm text-emerald-600">{message}</p>}
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-sm text-slate-500">Loading mappings...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-2 py-2">Plant UUID</th>
                  <th className="px-2 py-2">Display Name</th>
                  <th className="px-2 py-2">Description</th>
                  <th className="px-2 py-2">Active</th>
                  <th className="px-2 py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-2 py-2 font-mono text-xs">{item.plant_uuid}</td>
                    <td className="px-2 py-2">{item.display_name}</td>
                    <td className="px-2 py-2">{item.description ?? "—"}</td>
                    <td className="px-2 py-2">{item.is_active ? "Yes" : "No"}</td>
                    <td className="px-2 py-2">{item.updated_at ? new Date(item.updated_at).toLocaleString() : "—"}</td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td className="px-2 py-4 text-slate-500" colSpan={5}>
                      No mappings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </EmsShell>
  );
}
