"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

const labels = ["00", "04", "08", "12", "16", "20", "24"];

const rechartsData = labels.map((label, index) => ({
  label,
  load: [8, 7, 9, 10, 8, 7, 6][index],
  solar: [1, 2, 4, 7, 6, 3, 1][index],
}));

export function RechartsAreaChartPanel() {
  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rechartsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Area type="monotone" dataKey="load" stroke="#f97316" fill="#fed7aa" />
          <Area type="monotone" dataKey="solar" stroke="#22c55e" fill="#bbf7d0" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
