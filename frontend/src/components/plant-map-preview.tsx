"use client";

import dynamic from "next/dynamic";

const ClientPlantMap = dynamic(() => import("@/components/plant-map").then((module) => module.PlantMap), {
  ssr: false,
  loading: () => <div className="flex h-36 items-center justify-center text-xs text-slate-500 dark:text-slate-400">Loading map…</div>,
});

export function PlantMapPreview({
  latitude,
  longitude,
  label,
}: {
  latitude?: number | null;
  longitude?: number | null;
  label: string;
}) {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return (
      <div className="flex h-36 items-center justify-center border-b border-slate-200 bg-slate-100 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
        No map coordinates
      </div>
    );
  }

  return (
    <div className="h-36 border-b border-slate-200 dark:border-slate-800">
      <ClientPlantMap latitude={latitude} longitude={longitude} label={label} />
    </div>
  );
}
