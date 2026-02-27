"use client";

import Link from "next/link";
import { EmsShell } from "@/components/ems-shell";
import { PlantCharts } from "@/components/plant-charts";
import { apiGet } from "@/lib/api";
import { useEffect, useState } from "react";

type Plant = { id: number; uid: string; owner: string; status: string; capacity: number; plant_name?: string | null };

export default function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);

  useEffect(() => {
    let active = true;

    apiGet<{ local: Plant[] }>("/plants/list")
      .then((payload) => {
        if (active) {
          setPlants(payload.local);
        }
      })
      .catch(() => {
        if (active) {
          setPlants([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <EmsShell title="Plants">
      <div className="mb-4 grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="text-xs text-slate-500">Plants</div><div className="text-2xl font-semibold">{plants.length}</div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="text-xs text-slate-500">Active alerts</div><div className="text-2xl font-semibold">16</div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="text-xs text-slate-500">Queued reports</div><div className="text-2xl font-semibold">3</div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="text-xs text-slate-500">Aggregated view</div><div className="text-2xl font-semibold">week</div></div>
      </div>
      <PlantCharts />
      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold">Plant list</h2>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500"><tr><th className="pb-2">UID</th><th className="pb-2">Name</th><th className="pb-2">Owner</th><th className="pb-2">Status</th><th className="pb-2">Capacity</th><th className="pb-2"></th></tr></thead>
            <tbody>
              {plants.map((plant) => (
                <tr key={plant.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-2">{plant.uid}</td>
                  <td className="py-2">{plant.plant_name ?? "Unnamed"}</td>
                  <td className="py-2">{plant.owner}</td>
                  <td className="py-2">{plant.status}</td>
                  <td className="py-2">{plant.capacity}</td>
                  <td className="py-2 text-right"><Link href={`/plants/${plant.uid}`} className="text-blue-600">Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </EmsShell>
  );
}
