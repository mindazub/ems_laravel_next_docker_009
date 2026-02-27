"use client";

import dynamic from "next/dynamic";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const RechartsAreaChartPanel = dynamic(
  () => import("@/components/recharts-area-chart").then((module) => module.RechartsAreaChartPanel),
  { ssr: false }
);

const labels = ["00", "04", "08", "12", "16", "20", "24"];

const chartJsData = {
  labels,
  datasets: [
    { label: "Battery P", data: [5, 6, 7, 4, 3, 4, 5], borderColor: "#22c55e", backgroundColor: "#22c55e" },
    { label: "Price", data: [2, 3, 3, 6, 7, 4, 3], borderColor: "#0ea5e9", backgroundColor: "#0ea5e9" },
  ],
};

export function PlantCharts() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold">Battery power + pricing (Chart.js)</h2>
        <Line data={chartJsData} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold">Load/Solar prediction (Recharts)</h2>
        <RechartsAreaChartPanel />
      </section>
    </div>
  );
}
