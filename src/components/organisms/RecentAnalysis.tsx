import React from "react";

const items = [
  "Rupiah menguat di tengah ketidakpastian global.",
  "Pelaku pasar sambut positif aturan derivatif baru.",
  "IHSG tetap kuat, investor fokus pada data inflasi.",
];

export function RecentAnalysis() {
  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-800">
          Recent Analysis
        </h3>
      </div>
      <div className="px-6 pb-6 pt-4">
        <div className="flex flex-col">
          {items.map((item) => (
            <a
              href=""
              key={item}
              className="py-3 border-b border-slate-100 last:border-b-0 text-blue-900 font-semibold flex items-center justify-between hover:text-blue-800 transition"
            >
              <span>• {item}</span> <span>{`>`}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
